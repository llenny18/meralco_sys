
from django.core.mail import EmailMultiAlternatives
from django.conf import settings
from django.utils import timezone
from datetime import datetime, date, timedelta
from dateutil.relativedelta import relativedelta
from decimal import Decimal
from .models import (
    EmailNotificationLog, WorkOrder, KPISnapshot, 
    BackjobMonitoring, QIInspection, SLATracking
)
from .kpi_service import KPICalculationService


class KPIEmailService:
    """Service for sending daily KPI email notifications"""
    
    DEFAULT_RECIPIENT = "aimsworkorder@gmail.com"
    
    @staticmethod
    def should_send_email(notification_type, recipient_email, notification_date=None):
        """Check if email should be sent today"""
        if notification_date is None:
            notification_date = date.today()
        
        # Check if already sent today
        already_sent = EmailNotificationLog.objects.filter(
            notification_type=notification_type,
            notification_date=notification_date,
            recipient_email=recipient_email,
            status='SENT'
        ).exists()
        
        return not already_sent
    
    @staticmethod
    def log_email(notification_type, recipient_email, status='SENT', 
                  email_content='', error_message=''):
        """Log email notification"""
        EmailNotificationLog.objects.create(
            notification_type=notification_type,
            notification_date=date.today(),
            recipient_email=recipient_email,
            status=status,
            email_content=email_content[:5000],  # Limit length
            error_message=error_message
        )
    
    @staticmethod
    def get_kpi_status(kpi_value, target):
        """Determine if KPI is good, warning, or bad"""
        if target is None:
            return 'neutral'
        
        kpi_value = float(kpi_value)
        target_val = float(target.get('value', 0))
        green = float(target.get('green', target_val))
        yellow = float(target.get('yellow', target_val * 0.8))
        
        if kpi_value >= green:
            return 'good'
        elif kpi_value >= yellow:
            return 'warning'
        else:
            return 'bad'
    
    @staticmethod
    def calculate_current_kpis():
        """Calculate current period KPIs"""
        today = date.today()
        period_start = today.replace(day=1)
        period_end = (period_start + relativedelta(months=1)) - timedelta(days=1)
        
        return KPICalculationService.calculate_all_kpis(period_start, period_end)
    
    @staticmethod
    def get_critical_issues():
        """Get critical issues for email"""
        today = date.today()
        
        # Overdue work orders
        overdue_wos = WorkOrder.objects.filter(
            is_delayed=True,
            status__in=['NEW', 'FOR AUDIT', 'NO COC']
        ).order_by('-delay_days')[:10]
        
        # Pending backjobs
        pending_backjobs = BackjobMonitoring.objects.filter(
            status__in=['PENDING', 'IN_PROGRESS'],
            is_overdue=True
        ).count()
        
        # Overdue inspections
        overdue_inspections = QIInspection.objects.filter(
            is_completed=False,
            scheduled_date__lt=today
        ).count()
        
        # SLA breaches
        sla_breaches = SLATracking.objects.filter(
            is_breached=True,
            status='Breached'
        ).count()
        
        return {
            'overdue_wos': list(overdue_wos.values(
                'wo_no', 'description', 'delay_days', 'vendor__vendor_name'
            )),
            'pending_backjobs': pending_backjobs,
            'overdue_inspections': overdue_inspections,
            'sla_breaches': sla_breaches
        }
    
    @staticmethod
    def build_email_html(kpis, issues, overall_status):
        """Build HTML email content"""
        
        # Determine email theme based on overall status
        if overall_status == 'good':
            theme_color = '#4CAF50'
            theme_bg = '#e6ffed'
            status_emoji = '✅'
            status_text = 'GOOD - All Systems Running Smoothly'
        elif overall_status == 'warning':
            theme_color = '#FF9800'
            theme_bg = '#fff3e0'
            status_emoji = '⚠️'
            status_text = 'WARNING - Some Issues Detected'
        else:
            theme_color = '#f44336'
            theme_bg = '#ffe6e6'
            status_emoji = '❌'
            status_text = 'CRITICAL - Immediate Attention Required'
        
        # Build KPI rows
        kpi_rows = []
        kpi_details = [
            ('ccti', 'CCTI', '%'),
            ('pca_conversion', 'PCA Conversion', '%'),
            ('ageing_completion', 'Ageing Completion', '%'),
            ('termination_apt', 'Termination APT', 'days'),
            ('prdi', 'PRDI', 'days'),
            ('cost_settlement', 'Cost Settlement', '%'),
            ('quality_index', 'Quality Index', 'score'),
            ('capability_utilization', 'Capability Util.', '%')
        ]
        
        for key, label, unit in kpi_details:
            kpi_data = kpis.get(key, {})
            value = kpi_data.get('value', 0)
            target = kpi_data.get('target', {})
            status = KPIEmailService.get_kpi_status(value, target)
            
            if status == 'good':
                status_icon = '🟢'
                row_bg = '#f1f8f4'
            elif status == 'warning':
                status_icon = '🟡'
                row_bg = '#fff9f0'
            else:
                status_icon = '🔴'
                row_bg = '#fff0f0'
            
            target_val = target.get('value', 'N/A')
            if target_val != 'N/A':
                target_val = f"{float(target_val):.2f}{unit}"
            
            kpi_rows.append(f"""
            <tr style="background-color: {row_bg};">
                <td style="padding: 12px; border-bottom: 1px solid #ddd;">
                    {status_icon} <strong>{label}</strong>
                </td>
                <td style="padding: 12px; text-align: center; border-bottom: 1px solid #ddd;">
                    <strong>{float(value):.2f}{unit}</strong>
                </td>
                <td style="padding: 12px; text-align: center; border-bottom: 1px solid #ddd;">
                    {target_val}
                </td>
            </tr>
            """)
        
        # Build critical issues section
        issues_html = ""
        if issues['sla_breaches'] > 0 or issues['pending_backjobs'] > 0:
            issues_html = f"""
            <div style="margin-top: 30px; padding: 20px; background-color: #fff3cd; border-left: 4px solid #ff9800; border-radius: 4px;">
                <h3 style="color: #856404; margin-top: 0;">⚠️ Critical Issues</h3>
                <ul style="color: #856404; margin: 0;">
                    <li><strong>{issues['sla_breaches']}</strong> SLA Breaches</li>
                    <li><strong>{issues['pending_backjobs']}</strong> Overdue Backjobs</li>
                    <li><strong>{issues['overdue_inspections']}</strong> Overdue Inspections</li>
                    <li><strong>{len(issues['overdue_wos'])}</strong> Delayed Work Orders</li>
                </ul>
            </div>
            """
        
        # Top overdue work orders
        overdue_wos_html = ""
        if issues['overdue_wos']:
            wo_rows = []
            for wo in issues['overdue_wos'][:5]:
                wo_rows.append(f"""
                <tr>
                    <td style="padding: 8px; border-bottom: 1px solid #eee;">{wo['wo_no']}</td>
                    <td style="padding: 8px; border-bottom: 1px solid #eee;">{wo['description'][:50]}...</td>
                    <td style="padding: 8px; text-align: center; border-bottom: 1px solid #eee; color: #d32f2f;">
                        <strong>{wo['delay_days']} days</strong>
                    </td>
                </tr>
                """)
            
            overdue_wos_html = f"""
            <div style="margin-top: 30px;">
                <h3 style="color: #333;">📋 Top 5 Delayed Work Orders</h3>
                <table style="width: 100%; border-collapse: collapse; background: white;">
                    <thead>
                        <tr style="background-color: #f5f5f5;">
                            <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd;">WO No</th>
                            <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd;">Description</th>
                            <th style="padding: 12px; text-align: center; border-bottom: 2px solid #ddd;">Delay</th>
                        </tr>
                    </thead>
                    <tbody>
                        {''.join(wo_rows)}
                    </tbody>
                </table>
            </div>
            """
        
        # Complete HTML
        html = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Arial, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px;">
            <div style="max-width: 800px; margin: 0 auto; background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                
                <!-- Header -->
                <div style="background-color: {theme_color}; color: white; padding: 30px; text-align: center;">
                    <h1 style="margin: 0; font-size: 28px;">{status_emoji} Daily KPI Report</h1>
                    <p style="margin: 10px 0 0 0; font-size: 14px;">{date.today().strftime('%B %d, %Y')}</p>
                </div>
                
                <!-- Status Banner -->
                <div style="background-color: {theme_bg}; border-left: 6px solid {theme_color}; padding: 20px; margin: 20px;">
                    <h2 style="color: {theme_color}; margin: 0; font-size: 20px;">{status_text}</h2>
                </div>
                
                <!-- KPI Summary -->
                <div style="padding: 20px;">
                    <h3 style="color: #333; border-bottom: 2px solid #ddd; padding-bottom: 10px;">📊 KPI Summary</h3>
                    <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
                        <thead>
                            <tr style="background-color: #f5f5f5;">
                                <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd;">KPI</th>
                                <th style="padding: 12px; text-align: center; border-bottom: 2px solid #ddd;">Current</th>
                                <th style="padding: 12px; text-align: center; border-bottom: 2px solid #ddd;">Target</th>
                            </tr>
                        </thead>
                        <tbody>
                            {''.join(kpi_rows)}
                        </tbody>
                    </table>
                </div>
                
                <!-- Critical Issues -->
                <div style="padding: 20px;">
                    {issues_html}
                </div>
                
                <!-- Overdue Work Orders -->
                <div style="padding: 20px;">
                    {overdue_wos_html}
                </div>
                
                <!-- Footer -->
                <div style="background-color: #f5f5f5; padding: 20px; text-align: center; border-top: 1px solid #ddd;">
                    <p style="margin: 0; color: #666; font-size: 12px;">
                        This is an automated daily report from Smart Vendor Monitoring System
                    </p>
                    <p style="margin: 10px 0 0 0; color: #999; font-size: 11px;">
                        Generated at {timezone.now().strftime('%Y-%m-%d %H:%M:%S')}
                    </p>
                </div>
                
            </div>
        </body>
        </html>
        """
        
        return html
    
    @staticmethod
    def determine_overall_status(kpis):
        """Determine overall system status"""
        bad_count = 0
        warning_count = 0
        
        for key in ['ccti', 'pca_conversion', 'ageing_completion', 'quality_index']:
            kpi_data = kpis.get(key, {})
            if kpi_data:
                status = KPIEmailService.get_kpi_status(
                    kpi_data.get('value', 0),
                    kpi_data.get('target', {})
                )
                if status == 'bad':
                    bad_count += 1
                elif status == 'warning':
                    warning_count += 1
        
        if bad_count >= 2:
            return 'bad'
        elif bad_count >= 1 or warning_count >= 2:
            return 'warning'
        else:
            return 'good'
    
    @staticmethod
    def send_daily_kpi_email(recipient_email=None):
        """Send daily KPI email"""
        if recipient_email is None:
            recipient_email = KPIEmailService.DEFAULT_RECIPIENT
        
        # Check if already sent today
        if not KPIEmailService.should_send_email('KPI_DAILY', recipient_email):
            return {
                'success': False,
                'message': 'Email already sent today'
            }
        
        try:
            # Calculate KPIs
            kpis = KPIEmailService.calculate_current_kpis()
            
            # Get critical issues
            issues = KPIEmailService.get_critical_issues()
            
            # Determine overall status
            overall_status = KPIEmailService.determine_overall_status(kpis)
            
            # Build email
            html_content = KPIEmailService.build_email_html(kpis, issues, overall_status)
            
            # Subject based on status
            if overall_status == 'good':
                subject = f"✅ Daily KPI Report - {date.today().strftime('%B %d, %Y')} - All Systems OK"
            elif overall_status == 'warning':
                subject = f"⚠️ Daily KPI Report - {date.today().strftime('%B %d, %Y')} - Attention Needed"
            else:
                subject = f"❌ Daily KPI Report - {date.today().strftime('%B %d, %Y')} - CRITICAL"
            
            # Send email
            email = EmailMultiAlternatives(
                subject=subject,
                body="Please view this email in HTML format.",
                from_email=settings.DEFAULT_FROM_EMAIL,
                to=[recipient_email]
            )
            email.attach_alternative(html_content, "text/html")
            email.send(fail_silently=False)
            
            # Log success
            KPIEmailService.log_email(
                notification_type='KPI_DAILY',
                recipient_email=recipient_email,
                status='SENT',
                email_content=html_content
            )
            
            return {
                'success': True,
                'message': 'Email sent successfully',
                'status': overall_status
            }
            
        except Exception as e:
            # Log error
            KPIEmailService.log_email(
                notification_type='KPI_DAILY',
                recipient_email=recipient_email,
                status='FAILED',
                error_message=str(e)
            )
            
            return {
                'success': False,
                'message': f'Failed to send email: {str(e)}'
            }
