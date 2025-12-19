from datetime import datetime, timedelta
from decimal import Decimal
from django.db.models import Count, Sum, Avg, F, Q
from django.utils import timezone
from .models import (
    WorkOrder, KPISnapshot, KPITarget, VendorProductivityMonthly,
    QIInspection, Project
)

class KPICalculationService:
    """Service for calculating all KPI metrics"""
    
    @staticmethod
    def get_spt_by_applied_load(applied_load: float) -> float:
        """Get Standard Processing Time based on Applied Load cluster"""
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
        """Get Standard Processing Time based on Manhour cluster"""
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
        """Calculate Customer Connection Timeliness Index"""
        work_orders = WorkOrder.objects.filter(
            date_energized__range=[period_start, period_end],
            date_received_awarding__isnull=False,
            date_energized__isnull=False,
            total_manhours__isnull=False,
            total_estimated_cost__isnull=False
        )
        
        if not work_orders.exists():
            return {
                'value': 0,
                'sample_size': 0,
                'details': []
            }
        
        total_ccti = 0.0
        details = []
        
        for wo in work_orders:
            # Use estimated cost as proxy for applied load
            applied_load = float(wo.total_estimated_cost or 0) / 1000  # Convert to kW equivalent
            manhours = float(wo.total_manhours or 0)
            
            # Calculate duration
            duration = (wo.date_energized - wo.date_received_awarding).days
            
            # Get SPT values
            spt_m = cls.get_spt_by_manhour(manhours)
            spt_r = cls.get_spt_by_applied_load(applied_load)
            
            # Calculate CCTI component
            ccti_component = (0.30 * (duration / spt_m)) + (0.70 * (duration / spt_r))
            total_ccti += ccti_component
            
            details.append({
                'wo_no': wo.wo_no,
                'duration': duration,
                'spt_m': spt_m,
                'spt_r': spt_r,
                'ccti_component': round(ccti_component, 4)
            })
        
        ccti_value = total_ccti / work_orders.count()
        
        return {
            'value': round(ccti_value, 4),
            'sample_size': work_orders.count(),
            'details': details
        }
    
    @classmethod
    def calculate_pca_conversion_rate(cls, period_start, period_end):
        """Calculate PCA Conversion Rate"""
        # Get carryover (WOs from before period that are not completed)
        carryover = WorkOrder.objects.filter(
            date_received_jacket__lt=period_start,
            status__in=['NEW', 'FOR AUDIT']
        ).count()
        
        # Get received in period
        received = WorkOrder.objects.filter(
            date_received_jacket__range=[period_start, period_end]
        ).count()
        
        # Get cancelled
        cancelled = WorkOrder.objects.filter(
            date_received_jacket__range=[period_start, period_end],
            status='CANCELLED'
        ).count()
        
        # Get completed
        completed = WorkOrder.objects.filter(
            date_audited__range=[period_start, period_end],
            status__in=['AUDITED', 'PAID']
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
                'completed': completed
            }
        }
    
    @classmethod
    def calculate_ageing_pca_completion(cls, period_start, period_end, ageing_cutoff_year=2024):
        """Calculate Completion of Ageing PCAs"""
        # Total ageing WOs (from 2024 and prior)
        total_ageing = WorkOrder.objects.filter(
            date_received_jacket__year__lte=ageing_cutoff_year
        ).count()
        
        # Completed ageing WOs in this period
        completed_ageing = WorkOrder.objects.filter(
            date_received_jacket__year__lte=ageing_cutoff_year,
            date_audited__range=[period_start, period_end],
            status__in=['AUDITED', 'PAID']
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
                'total_ageing': total_ageing,
                'completed_ageing': completed_ageing
            }
        }
    
    @classmethod
    def calculate_termination_apt(cls, period_start, period_end):
        """Calculate PCA Termination/Modification Average Processing Time"""
        work_orders = WorkOrder.objects.filter(
            date_audited__range=[period_start, period_end],
            date_received_awarding__isnull=False,
            date_audited__isnull=False
        )
        
        if not work_orders.exists():
            return {
                'value': 0,
                'sample_size': 0,
                'details': []
            }
        
        total_days = 0
        details = []
        
        for wo in work_orders:
            days = (wo.date_audited - wo.date_received_awarding).days
            total_days += days
            details.append({
                'wo_no': wo.wo_no,
                'processing_days': days
            })
        
        apt = total_days / work_orders.count()
        
        return {
            'value': round(apt, 2),
            'sample_size': work_orders.count(),
            'details': details
        }
    
    @classmethod
    def calculate_prdi(cls, period_start, period_end, spt_days=60.0):
        """Calculate Project Resolution Duration Index"""
        work_orders = WorkOrder.objects.filter(
            date_audited__range=[period_start, period_end],
            date_energized__isnull=False,
            date_audited__isnull=False
        )
        
        if not work_orders.exists():
            return {
                'value': 0,
                'sample_size': 0,
                'details': []
            }
        
        total_prdi = 0.0
        details = []
        
        for wo in work_orders:
            duration = (wo.date_audited - wo.date_energized).days
            prdi_component = duration / spt_days
            total_prdi += prdi_component
            
            details.append({
                'wo_no': wo.wo_no,
                'duration': duration,
                'prdi_component': round(prdi_component, 4)
            })
        
        prdi_value = total_prdi / work_orders.count()
        
        return {
            'value': round(prdi_value, 4),
            'sample_size': work_orders.count(),
            'details': details
        }
    
    @classmethod
    def calculate_cost_settlement(cls, period_start, period_end):
        """Calculate WO Cost Settlement to RAB"""
        # TECO/CLOSED cost (Paid)
        teco_closed_cost = WorkOrder.objects.filter(
            status='PAID'
        ).aggregate(total=Sum('billed_cost'))['total'] or 0
        
        # Pending cost
        pending_cost = WorkOrder.objects.filter(
            status='NEW'
        ).aggregate(total=Sum('total_estimated_cost'))['total'] or 0
        
        # COMP cost (Audited but not paid)
        comp_cost = WorkOrder.objects.filter(
            status='AUDITED'
        ).aggregate(total=Sum('billed_cost'))['total'] or 0
        
        total_cost = float(pending_cost) + float(comp_cost) + float(teco_closed_cost)
        
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
                'comp_cost': float(comp_cost),
                'total_cost': total_cost
            }
        }
    
    @classmethod
    def calculate_quality_index(cls, period_start, period_end):
        """Calculate Quality Management Index"""
        # Total audited WOs
        audited_wos = WorkOrder.objects.filter(
            date_audited__range=[period_start, period_end]
        ).count()
        
        # Passed WOs (assuming status AUDITED or PAID means passed)
        passed_wos = WorkOrder.objects.filter(
            date_audited__range=[period_start, period_end],
            status__in=['AUDITED', 'PAID']
        ).count()
        
        if audited_wos == 0:
            quality_index = 0
        else:
            quality_index = (passed_wos / audited_wos) * 100
        
        return {
            'value': round(quality_index, 2),
            'numerator': passed_wos,
            'denominator': audited_wos,
            'details': {
                'audited_wos': audited_wos,
                'passed_wos': passed_wos
            }
        }
    
    @classmethod
    def calculate_capability_utilization(cls, period_start, period_end):
        """Calculate Contractor Capability Utilization"""
        # Get vendor productivity data
        month_start = period_start.replace(day=1)
        
        productivity_records = VendorProductivityMonthly.objects.filter(
            month=month_start
        )
        
        if not productivity_records.exists():
            return {
                'value': 0,
                'sample_size': 0,
                'details': []
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
                'vendor': record.vendor.vendor_name,
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
    def calculate_all_kpis(cls, period_start, period_end):
        """Calculate all KPIs for a given period"""
        return {
            'period_start': period_start,
            'period_end': period_end,
            'ccti': cls.calculate_ccti(period_start, period_end),
            'pca_conversion': cls.calculate_pca_conversion_rate(period_start, period_end),
            'ageing_completion': cls.calculate_ageing_pca_completion(period_start, period_end),
            'termination_apt': cls.calculate_termination_apt(period_start, period_end),
            'prdi': cls.calculate_prdi(period_start, period_end),
            'cost_settlement': cls.calculate_cost_settlement(period_start, period_end),
            'quality_index': cls.calculate_quality_index(period_start, period_end),
            'capability_utilization': cls.calculate_capability_utilization(period_start, period_end)
        }