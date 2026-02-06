"""
KPI Calculation Service - Corrected Field Names
Aligned with WorkOrder model structure
"""

from datetime import datetime, timedelta
from decimal import Decimal
from django.db.models import Count, Sum, Avg, F, Q
from django.utils import timezone
from .models import (
    WorkOrder, KPISnapshot, KPITarget, VendorProductivityMonthly,
    QIInspection, Project
)

class KPICalculationService:
    """Service for calculating all KPI metrics with correct WorkOrder field names"""
    
    @staticmethod
    def get_spt_by_applied_load(applied_load: float) -> float:
        """
        Get Standard Processing Time based on Applied Load cluster
        Applied Load is typically derived from project cost/scope
        """
        if applied_load <= 50:
            return 36.0
        elif applied_load <= 100:
            return 34.0
        elif applied_load <= 200:
            return 32.0
        elif applied_load <= 300:
            return 30.0
        elif applied_load <= 400:
            return 28.0
        elif applied_load <= 500:
            return 26.0
        elif applied_load <= 1000:
            return 23.0
        else:
            return 20.0
    
    @staticmethod
    def get_spt_by_manhour(manhours: float) -> float:
        """
        Get Standard Processing Time based on Manhour cluster
        Uses spt_m field from WorkOrder model
        """
        if manhours <= 50:
            return 20.0
        elif manhours <= 100:
            return 23.0
        elif manhours <= 200:
            return 26.0
        elif manhours <= 300:
            return 28.0
        elif manhours <= 400:
            return 30.0
        elif manhours <= 500:
            return 32.0
        elif manhours <= 1000:
            return 36.0
        elif manhours <= 1500:
            return 40.0
        elif manhours <= 2000:
            return 45.0
        else:
            return 50.0
    
    @classmethod
    def calculate_ccti(cls, period_start, period_end):
        """
        Calculate Customer Connection Timeliness Index
        
        CCTI Formula:
        CCTI = (0.30 * (Actual Duration / SPT_M)) + (0.70 * (Actual Duration / SPT_L))
        
        Where:
        - Actual Duration = days from date_wmtrl to date_fcomp
        - SPT_M = Standard Processing Time based on manhours (from spt_m field)
        - SPT_L = Standard Processing Time based on applied load (from spt_l field)
        """
        work_orders = WorkOrder.objects.filter(
            date_wmtrl__range=[period_start, period_end],
            date_wmtrl__isnull=False,
            date_fcomp__isnull=False,
            for_ccti_exclusion=False  # Exclude WOs marked for CCTI exclusion
        )
        
        if not work_orders.exists():
            return {
                'value': 0,
                'sample_size': 0,
                'details': [],
                'message': 'No eligible work orders found for CCTI calculation'
            }
        
        total_ccti = 0.0
        details = []
        valid_count = 0
        
        for wo in work_orders:
            # Calculate actual duration (WMTRL to FCOMP)
            actual_duration = wo.days_wmtrl_to_fcomp_apt or 0
            if actual_duration <= 0:
                # Calculate manually if not stored
                actual_duration = (wo.date_fcomp - wo.date_wmtrl).days
            
            # Get SPT values from model or calculate
            spt_m = wo.spt_m or 0
            spt_l = wo.spt_l or 0
            
            # Skip if SPT values are invalid
            if spt_m <= 0 or spt_l <= 0:
                continue
            
            # Calculate CCTI component
            ccti_component = (0.30 * (actual_duration / spt_m)) + (0.70 * (actual_duration / spt_l))
            
            # Use computed index if available
            if wo.computed_index_wmtrl_to_fcomp_ccti:
                ccti_component = float(wo.computed_index_wmtrl_to_fcomp_ccti)
            
            total_ccti += ccti_component
            valid_count += 1
            
            details.append({
                'wo_no': wo.wo_no,
                'date_wmtrl': str(wo.date_wmtrl),
                'date_fcomp': str(wo.date_fcomp),
                'actual_duration': actual_duration,
                'spt_m': spt_m,
                'spt_l': spt_l,
                'ccti_component': round(ccti_component, 4)
            })
        
        if valid_count == 0:
            return {
                'value': 0,
                'sample_size': 0,
                'details': [],
                'message': 'No valid work orders with SPT values'
            }
        
        ccti_value = total_ccti / valid_count
        
        return {
            'value': round(ccti_value, 4),
            'sample_size': valid_count,
            'total_wos': work_orders.count(),
            'details': details
        }
    
    @classmethod
    def calculate_pca_conversion_rate(cls, period_start, period_end):
        """
        Calculate PCA Conversion Rate
        
        Formula: (Completed PCAs / Total PCAs) * 100
        
        Where:
        - Total PCAs = Carryover + Received in period - Cancelled
        - Completed = WOs with date_comp in period
        """
        # Get carryover (WOs from before period that are not completed)
        carryover = WorkOrder.objects.filter(
            Q(date_received_jacket_ps__lt=period_start),
            Q(date_comp__isnull=True) | Q(date_comp__gte=period_start)
        ).count()
        
        # Get received in period
        received = WorkOrder.objects.filter(
            date_received_jacket_ps__range=[period_start, period_end]
        ).count()
        
        # Get cancelled (using status field)
        cancelled = WorkOrder.objects.filter(
            date_received_jacket_ps__lte=period_end,
            status__in=['CLOSED-CAN', 'PCAN', 'PCAN3']
        ).count()
        
        # Get completed (WOs with date_comp in period)
        completed = WorkOrder.objects.filter(
            date_comp__range=[period_start, period_end],
            status__in=['COMP', 'TECO', 'CLOSE']
        ).count()
        
        total_wos = carryover + received - cancelled
        
        if total_wos == 0:
            conversion_rate = 0
        else:
            conversion_rate = (completed / total_wos) * 100
        
        return {
            'value': round(conversion_rate, 2),
            'numerator': completed,
            'denominator': total_wos,
            'details': {
                'carryover': carryover,
                'received': received,
                'cancelled': cancelled,
                'completed': completed,
                'total_wos': total_wos
            }
        }
    
    @classmethod
    def calculate_ageing_pca_completion(cls, period_start, period_end, ageing_cutoff_year=2024):
        """
        Calculate Completion of Ageing PCAs
        
        Formula: (Completed Ageing PCAs / Total Ageing PCAs) * 100
        
        Where:
        - Ageing PCAs = WOs from cutoff year and prior
        - Completed = Those with date_comp in the period
        """
        cutoff_date = datetime(ageing_cutoff_year, 12, 31).date()
        
        # Total ageing WOs (from cutoff year and prior, still open at period start)
        total_ageing = WorkOrder.objects.filter(
            Q(date_received_jacket_ps__lte=cutoff_date),
            Q(date_comp__isnull=True) | Q(date_comp__gte=period_start)
        ).count()
        
        # Completed ageing WOs in this period
        completed_ageing = WorkOrder.objects.filter(
            date_received_jacket_ps__lte=cutoff_date,
            date_comp__range=[period_start, period_end]
        ).count()
        
        if total_ageing == 0:
            completion_rate = 0
        else:
            completion_rate = (completed_ageing / total_ageing) * 100
        
        return {
            'value': round(completion_rate, 2),
            'numerator': completed_ageing,
            'denominator': total_ageing,
            'details': {
                'cutoff_year': ageing_cutoff_year,
                'cutoff_date': str(cutoff_date),
                'total_ageing': total_ageing,
                'completed_ageing': completed_ageing
            }
        }
    
    @classmethod
    def calculate_termination_apt(cls, period_start, period_end):
        """
        Calculate PCA Termination/Modification Average Processing Time
        
        APT = Average days from date_received_jacket_ps to date_comp
        Uses days_comp field or calculates manually
        """
        work_orders = WorkOrder.objects.filter(
            date_comp__range=[period_start, period_end],
            date_received_jacket_ps__isnull=False,
            date_comp__isnull=False
        )
        
        if not work_orders.exists():
            return {
                'value': 0,
                'sample_size': 0,
                'details': [],
                'message': 'No completed work orders found'
            }
        
        total_days = 0
        details = []
        
        for wo in work_orders:
            # Use days_comp if available, otherwise calculate
            days = wo.days_comp or (wo.date_comp - wo.date_received_jacket_ps).days
            total_days += days
            
            details.append({
                'wo_no': wo.wo_no,
                'date_received': str(wo.date_received_jacket_ps),
                'date_comp': str(wo.date_comp),
                'processing_days': days
            })
        
        apt = total_days / work_orders.count()
        
        return {
            'value': round(apt, 2),
            'sample_size': work_orders.count(),
            'details': details
        }
    
    @classmethod
    def calculate_prdi(cls, period_start, period_end):
        """
        Calculate Project Resolution Duration Index
        
        PRDI = Actual Duration / SPT
        
        Where:
        - Actual Duration = days from date_sched to date_comp
        - SPT = target_days_comp or standard 60 days
        
        Uses computed fields if available
        """
        work_orders = WorkOrder.objects.filter(
            date_comp__range=[period_start, period_end],
            date_sched__isnull=False,
            date_comp__isnull=False
        )
        
        if not work_orders.exists():
            return {
                'value': 0,
                'sample_size': 0,
                'details': [],
                'message': 'No eligible work orders for PRDI calculation'
            }
        
        total_prdi = 0.0
        details = []
        valid_count = 0
        
        for wo in work_orders:
            # Get actual duration
            actual_duration = wo.days_sched_to_fcomp or (wo.date_comp - wo.date_sched).days
            
            # Get SPT (target days)
            spt_days = wo.target_days_comp or wo.target_days or 60.0
            
            if spt_days <= 0:
                continue
            
            # Calculate PRDI component
            prdi_component = actual_duration / spt_days
            
            # Use computed E2E PRDI if available
            if wo.e2e_prdi:
                prdi_component = float(wo.e2e_prdi)
            
            total_prdi += prdi_component
            valid_count += 1
            
            details.append({
                'wo_no': wo.wo_no,
                'date_sched': str(wo.date_sched),
                'date_comp': str(wo.date_comp),
                'actual_duration': actual_duration,
                'spt_days': spt_days,
                'prdi_component': round(prdi_component, 4)
            })
        
        if valid_count == 0:
            return {
                'value': 0,
                'sample_size': 0,
                'details': [],
                'message': 'No valid work orders with target days'
            }
        
        prdi_value = total_prdi / valid_count
        
        return {
            'value': round(prdi_value, 4),
            'sample_size': valid_count,
            'total_wos': work_orders.count(),
            'details': details
        }
    
    @classmethod
    def calculate_cost_settlement(cls, period_start, period_end):
        """
        Calculate WO Cost Settlement to RAB
        
        Formula: (TECO/CLOSED Cost / Total Cost) * 100
        
        Where:
        - TECO/CLOSED Cost = nov_amount for completed WOs
        - Total Cost = All WO costs (NTC amount)
        """
        # TECO/CLOSED cost (Completed and settled)
        teco_closed_cost = WorkOrder.objects.filter(
            status__in=['TECO', 'CLOSE', 'COMP'],
            date_comp__range=[period_start, period_end]
        ).aggregate(total=Sum('nov_amount'))['total'] or 0
        
        # Pending cost (In progress)
        pending_cost = WorkOrder.objects.filter(
            status__in=['INPRG', 'SCHED', 'FCOMP'],
            date_received_jacket_ps__lte=period_end
        ).aggregate(total=Sum('ntc_amount'))['total'] or 0
        
        # All WO cost in period
        total_cost_period = WorkOrder.objects.filter(
            Q(date_received_jacket_ps__range=[period_start, period_end]) |
            Q(date_comp__range=[period_start, period_end])
        ).aggregate(total=Sum('ntc_amount'))['total'] or 0
        
        total_cost = float(total_cost_period)
        
        if total_cost == 0:
            settlement_rate = 0
        else:
            settlement_rate = (float(teco_closed_cost) / total_cost) * 100
        
        return {
            'value': round(settlement_rate, 2),
            'numerator': float(teco_closed_cost),
            'denominator': total_cost,
            'details': {
                'teco_closed_cost': float(teco_closed_cost),
                'pending_cost': float(pending_cost),
                'total_cost': total_cost
            }
        }
    
    @classmethod
    def calculate_quality_index(cls, period_start, period_end):
        """
        Calculate Quality Management Index
        
        Formula: (Passed WOs / Total Audited WOs) * 100
        
        Uses date_audit and audit_by fields
        """
        # Total audited WOs in period
        audited_wos = WorkOrder.objects.filter(
            date_audit__range=[period_start, period_end],
            date_audit__isnull=False
        ).count()
        
        # Passed WOs (no backjob required)
        passed_wos = WorkOrder.objects.filter(
            date_audit__range=[period_start, period_end],
            with_back_job=False,
            date_audit__isnull=False
        ).count()
        
        if audited_wos == 0:
            quality_index = 0
        else:
            quality_index = (passed_wos / audited_wos) * 100
        
        # Additional quality metrics
        backjob_count = WorkOrder.objects.filter(
            date_audit__range=[period_start, period_end],
            with_back_job=True
        ).count()
        
        return {
            'value': round(quality_index, 2),
            'numerator': passed_wos,
            'denominator': audited_wos,
            'details': {
                'audited_wos': audited_wos,
                'passed_wos': passed_wos,
                'backjob_count': backjob_count,
                'backjob_rate': round((backjob_count / audited_wos * 100), 2) if audited_wos > 0 else 0
            }
        }
    
    @classmethod
    def calculate_capability_utilization(cls, period_start, period_end):
        """
        Calculate Contractor Capability Utilization
        
        Formula: (Actual Accomplishment / Contractor Capability) * 100
        
        Uses VendorProductivityMonthly model
        """
        # Get vendor productivity data for the period
        month_start = period_start.replace(day=1)
        
        productivity_records = VendorProductivityMonthly.objects.filter(
            month=month_start
        )
        
        if not productivity_records.exists():
            return {
                'value': 0,
                'sample_size': 0,
                'details': [],
                'message': 'No vendor productivity data found for this period'
            }
        
        total_actual = productivity_records.aggregate(
            total=Sum('monthly_accomplishment')
        )['total'] or 0
        
        total_capability = productivity_records.aggregate(
            total=Sum('monthly_capability')
        )['total'] or 0
        
        if total_capability == 0:
            utilization = 0
        else:
            utilization = (float(total_actual) / float(total_capability)) * 100
        
        details = []
        for record in productivity_records:
            vendor_util = 0
            if record.monthly_capability > 0:
                vendor_util = (float(record.monthly_accomplishment) / float(record.monthly_capability)) * 100
            
            details.append({
                'vendor_id': record.vendor_id,
                'vendor': record.vendor.vendor_name if hasattr(record, 'vendor') else 'Unknown',
                'accomplishment': float(record.monthly_accomplishment),
                'capability': float(record.monthly_capability),
                'utilization': round(vendor_util, 2)
            })
        
        return {
            'value': round(utilization, 2),
            'numerator': float(total_actual),
            'denominator': float(total_capability),
            'sample_size': productivity_records.count(),
            'details': details
        }
    
    @classmethod
    def calculate_overdue_rate(cls, period_end):
        """
        Calculate Overdue Work Orders Rate
        
        Formula: (Overdue WOs / Total Active WOs) * 100
        
        Where Overdue = days_comp > 60 days
        """
        active_wos = WorkOrder.objects.filter(
            date_comp__isnull=True,
            date_received_jacket_ps__lte=period_end
        ).count()
        
        overdue_wos = WorkOrder.objects.filter(
            Q(date_comp__isnull=True),
            Q(date_received_jacket_ps__lte=period_end),
            Q(days_comp__gt=60) | Q(date_received_jacket_ps__lt=period_end - timedelta(days=90))
        ).count()
        
        if active_wos == 0:
            overdue_rate = 0
        else:
            overdue_rate = (overdue_wos / active_wos) * 100
        
        return {
            'value': round(overdue_rate, 2),
            'numerator': overdue_wos,
            'denominator': active_wos,
            'details': {
                'active_wos': active_wos,
                'overdue_wos': overdue_wos
            }
        }
    
    @classmethod
    def calculate_vip_completion_rate(cls, period_start, period_end):
        """
        Calculate VIP Project Completion Rate
        
        Formula: (Completed VIP WOs / Total VIP WOs) * 100
        """
        total_vip = WorkOrder.objects.filter(
            vip=True,
            date_received_jacket_ps__lte=period_end
        ).count()
        
        completed_vip = WorkOrder.objects.filter(
            vip=True,
            date_comp__range=[period_start, period_end]
        ).count()
        
        if total_vip == 0:
            completion_rate = 0
        else:
            completion_rate = (completed_vip / total_vip) * 100
        
        return {
            'value': round(completion_rate, 2),
            'numerator': completed_vip,
            'denominator': total_vip,
            'details': {
                'total_vip': total_vip,
                'completed_vip': completed_vip
            }
        }
    
    @classmethod
    def calculate_all_kpis(cls, period_start, period_end):
        """
        Calculate all KPIs for a given period
        
        Returns a comprehensive dictionary with all KPI metrics
        """
        # Ensure dates are date objects
        if isinstance(period_start, str):
            period_start = datetime.strptime(period_start, '%Y-%m-%d').date()
        if isinstance(period_end, str):
            period_end = datetime.strptime(period_end, '%Y-%m-%d').date()
        
        return {
            'period_start': str(period_start),
            'period_end': str(period_end),
            'calculated_at': str(timezone.now()),
            
            # Core KPIs
            'ccti': cls.calculate_ccti(period_start, period_end),
            'pca_conversion': cls.calculate_pca_conversion_rate(period_start, period_end),
            'ageing_completion': cls.calculate_ageing_pca_completion(period_start, period_end),
            'termination_apt': cls.calculate_termination_apt(period_start, period_end),
            'prdi': cls.calculate_prdi(period_start, period_end),
            'cost_settlement': cls.calculate_cost_settlement(period_start, period_end),
            'quality_index': cls.calculate_quality_index(period_start, period_end),
            'capability_utilization': cls.calculate_capability_utilization(period_start, period_end),
            
            # Additional KPIs
            'overdue_rate': cls.calculate_overdue_rate(period_end),
            'vip_completion': cls.calculate_vip_completion_rate(period_start, period_end),
        }
    
    @classmethod
    def get_kpi_summary(cls, period_start, period_end):
        """
        Get simplified KPI summary without detailed breakdowns
        Useful for dashboard display
        """
        kpis = cls.calculate_all_kpis(period_start, period_end)
        
        return {
            'period_start': kpis['period_start'],
            'period_end': kpis['period_end'],
            'metrics': {
                'CCTI': {
                    'value': kpis['ccti']['value'],
                    'sample_size': kpis['ccti']['sample_size'],
                    'target': 0.95,
                    'status': 'good' if kpis['ccti']['value'] <= 0.95 else 'needs_improvement'
                },
                'PCA Conversion Rate': {
                    'value': kpis['pca_conversion']['value'],
                    'unit': '%',
                    'target': 80,
                    'status': 'good' if kpis['pca_conversion']['value'] >= 80 else 'needs_improvement'
                },
                'Ageing PCA Completion': {
                    'value': kpis['ageing_completion']['value'],
                    'unit': '%',
                    'target': 100,
                    'status': 'good' if kpis['ageing_completion']['value'] >= 90 else 'needs_improvement'
                },
                'Termination APT': {
                    'value': kpis['termination_apt']['value'],
                    'unit': 'days',
                    'target': 45,
                    'status': 'good' if kpis['termination_apt']['value'] <= 45 else 'needs_improvement'
                },
                'PRDI': {
                    'value': kpis['prdi']['value'],
                    'sample_size': kpis['prdi']['sample_size'],
                    'target': 1.0,
                    'status': 'good' if kpis['prdi']['value'] <= 1.0 else 'needs_improvement'
                },
                'Cost Settlement': {
                    'value': kpis['cost_settlement']['value'],
                    'unit': '%',
                    'target': 95,
                    'status': 'good' if kpis['cost_settlement']['value'] >= 95 else 'needs_improvement'
                },
                'Quality Index': {
                    'value': kpis['quality_index']['value'],
                    'unit': '%',
                    'target': 98,
                    'status': 'good' if kpis['quality_index']['value'] >= 98 else 'needs_improvement'
                },
                'Capability Utilization': {
                    'value': kpis['capability_utilization']['value'],
                    'unit': '%',
                    'target': 85,
                    'status': 'good' if kpis['capability_utilization']['value'] >= 85 else 'needs_improvement'
                },
                'Overdue Rate': {
                    'value': kpis['overdue_rate']['value'],
                    'unit': '%',
                    'target': 10,
                    'status': 'good' if kpis['overdue_rate']['value'] <= 10 else 'needs_improvement'
                },
                'VIP Completion': {
                    'value': kpis['vip_completion']['value'],
                    'unit': '%',
                    'target': 100,
                    'status': 'good' if kpis['vip_completion']['value'] >= 95 else 'needs_improvement'
                }
            }
        }


class KPISnapshotService:
    """Service for creating and managing KPI snapshots"""
    
    @staticmethod
    def create_snapshot(period_start, period_end, snapshot_type='monthly'):
        """
        Create a KPI snapshot for a given period
        """
        kpis = KPICalculationService.calculate_all_kpis(period_start, period_end)
        
        snapshot = KPISnapshot.objects.create(
            period_start=period_start,
            period_end=period_end,
            snapshot_type=snapshot_type,
            ccti_value=kpis['ccti']['value'],
            ccti_sample_size=kpis['ccti']['sample_size'],
            pca_conversion_rate=kpis['pca_conversion']['value'],
            ageing_completion_rate=kpis['ageing_completion']['value'],
            termination_apt=kpis['termination_apt']['value'],
            prdi_value=kpis['prdi']['value'],
            prdi_sample_size=kpis['prdi']['sample_size'],
            cost_settlement_rate=kpis['cost_settlement']['value'],
            quality_index=kpis['quality_index']['value'],
            capability_utilization=kpis['capability_utilization']['value'],
            raw_data=kpis
        )
        
        return snapshot
    
    @staticmethod
    def get_latest_snapshot(snapshot_type='monthly'):
        """Get the most recent KPI snapshot"""
        return KPISnapshot.objects.filter(
            snapshot_type=snapshot_type
        ).order_by('-period_end').first()
    
    @staticmethod
    def get_trend(metric_name, months=6):
        """
        Get trend data for a specific metric
        """
        snapshots = KPISnapshot.objects.filter(
            snapshot_type='monthly'
        ).order_by('-period_end')[:months]
        
        metric_map = {
            'ccti': 'ccti_value',
            'pca_conversion': 'pca_conversion_rate',
            'ageing_completion': 'ageing_completion_rate',
            'termination_apt': 'termination_apt',
            'prdi': 'prdi_value',
            'cost_settlement': 'cost_settlement_rate',
            'quality_index': 'quality_index',
            'capability_utilization': 'capability_utilization'
        }
        
        field_name = metric_map.get(metric_name)
        if not field_name:
            return []
        
        trend_data = []
        for snapshot in reversed(snapshots):
            trend_data.append({
                'period': f"{snapshot.period_start} to {snapshot.period_end}",
                'value': getattr(snapshot, field_name),
                'period_start': str(snapshot.period_start),
                'period_end': str(snapshot.period_end)
            })
        
        return trend_data