"""
Email Notification Service
Handles all email notifications for different user roles
"""

from django.core.mail import EmailMultiAlternatives
from django.conf import settings
from django.template.loader import render_to_string
from datetime import datetime, timedelta
from .models import User, Project, WorkOrder, ProjectDocument, Vendor

class EmailNotificationService:
    """Service to handle role-based email notifications"""
    
    @staticmethod
    def get_users_by_role(role_name):
        """Get all active users for a specific role"""
        return User.objects.filter(
            role__role_name=role_name,
            is_active=True,
            email__isnull=False
        ).exclude(email='')
    
    @staticmethod
    def send_styled_email(subject, html_content, recipient_list, priority='normal'):
        """Send styled HTML email"""
        
        # Color schemes based on priority
        colors = {
            'critical': {
                'bg': '#ffe6e6',
                'border': '#f44336',
                'text': '#b71c1c',
                'emoji': '🚨'
            },
            'high': {
                'bg': '#fff3e0',
                'border': '#ff9800',
                'text': '#e65100',
                'emoji': '⚠️'
            },
            'normal': {
                'bg': '#e3f2fd',
                'border': '#2196F3',
                'text': '#0d47a1',
                'emoji': '📋'
            },
            'success': {
                'bg': '#e8f5e9',
                'border': '#4CAF50',
                'text': '#2e7d32',
                'emoji': '✅'
            }
        }
        
        color = colors.get(priority, colors['normal'])
        
        # Wrap content in styled template
        full_html = f"""
        <html>
        <body style="font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 20px;">
            <div style="
                max-width: 600px;
                margin: auto;
                background-color: {color['bg']};
                border-left: 6px solid {color['border']};
                padding: 20px;
                border-radius: 8px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            ">
                <h2 style="color: {color['text']}; margin-top: 0;">
                    {color['emoji']} {subject}
                </h2>
                {html_content}
                <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
                <p style="font-size: 12px; color: #666;">
                    This is an automated message from Smart Vendor Monitoring System.
                    <br>Sent on {datetime.now().strftime('%B %d, %Y at %I:%M %p')}
                </p>
            </div>
        </body>
        </html>
        """
        
        try:
            email = EmailMultiAlternatives(
                subject=subject,
                body=html_content,  # Plain text fallback
                from_email=settings.DEFAULT_FROM_EMAIL,
                to=recipient_list
            )
            email.attach_alternative(full_html, "text/html")
            email.send(fail_silently=False)
            return True
        except Exception as e:
            print(f"Email sending failed: {e}")
            return False
    
    # ================== WORK ORDER NOTIFICATIONS ==================
    
    @classmethod
    def notify_new_work_order(cls, work_order):
        """Notify relevant users about new work order"""
        
        # Notify: WO Supervisors, Team Leaders, Sector Managers
        roles_to_notify = ['WO Supervisor', 'Team Leader', 'Sector Manager']
        
        for role in roles_to_notify:
            users = cls.get_users_by_role(role)
            if users.exists():
                content = f"""
                <p><strong>New Work Order Created</strong></p>
                <ul>
                    <li><strong>WO Number:</strong> {work_order.wo_no}</li>
                    <li><strong>Description:</strong> {work_order.description or 'N/A'}</li>
                    <li><strong>Location:</strong> {work_order.location or 'N/A'}</li>
                    <li><strong>Municipality:</strong> {work_order.municipality or 'N/A'}</li>
                    <li><strong>Status:</strong> {work_order.status}</li>
                    <li><strong>VIP:</strong> {'Yes' if work_order.vip else 'No'}</li>
                </ul>
                <p>Please review and assign resources as needed.</p>
                """
                
                cls.send_styled_email(
                    subject=f"New Work Order: {work_order.wo_no}",
                    html_content=content,
                    recipient_list=[user.email for user in users],
                    priority='high' if work_order.vip else 'normal'
                )
    
    @classmethod
    def notify_work_order_status_change(cls, work_order, old_status, new_status):
        """Notify when work order status changes"""
        
        # Notify: Assigned supervisor, Team Leader, Vendor
        recipients = []
        
        # Add supervisor
        if work_order.supervisor_full_name:
            supervisor = User.objects.filter(
                first_name__icontains=work_order.supervisor_full_name.split()[0]
            ).first()
            if supervisor:
                recipients.append(supervisor.email)
        
        # Add Team Leader
        team_leaders = cls.get_users_by_role('Team Leader')
        recipients.extend([u.email for u in team_leaders])
        
        # Add Vendor
        if work_order.vendor_id:
            vendor = Vendor.objects.filter(vendor_id=work_order.vendor_id).first()
            if vendor and vendor.email:
                recipients.append(vendor.email)
        
        if recipients:
            content = f"""
            <p><strong>Work Order Status Updated</strong></p>
            <ul>
                <li><strong>WO Number:</strong> {work_order.wo_no}</li>
                <li><strong>Previous Status:</strong> {old_status}</li>
                <li><strong>New Status:</strong> {new_status}</li>
                <li><strong>Location:</strong> {work_order.location or 'N/A'}</li>
            </ul>
            """
            
            cls.send_styled_email(
                subject=f"Status Change: {work_order.wo_no} - {new_status}",
                html_content=content,
                recipient_list=list(set(recipients)),
                priority='normal'
            )
    
    # ================== PROJECT NOTIFICATIONS ==================
    
    @classmethod
    def notify_new_project(cls, project):
        """Notify about new project creation"""
        
        # Notify: All management roles, assigned engineer, vendor
        roles = ['Team Leader', 'Sector Manager', 'WO Supervisor']
        recipients = []
        
        for role in roles:
            users = cls.get_users_by_role(role)
            recipients.extend([u.email for u in users])
        
        # Add assigned engineer
        if project.assigned_engineer:
            recipients.append(project.assigned_engineer.email)
        
        # Add vendor
        if project.vendor and project.vendor.email:
            recipients.append(project.vendor.email)
        
        if recipients:
            content = f"""
            <p><strong>New Project Created</strong></p>
            <ul>
                <li><strong>Project Code:</strong> {project.project_code}</li>
                <li><strong>Project Name:</strong> {project.project_name}</li>
                <li><strong>Vendor:</strong> {project.vendor.vendor_name if project.vendor else 'N/A'}</li>
                <li><strong>Assigned Engineer:</strong> {project.assigned_engineer.get_full_name() if project.assigned_engineer else 'Not Assigned'}</li>
                <li><strong>Start Date:</strong> {project.start_date}</li>
                <li><strong>Expected Completion:</strong> {project.completion_date}</li>
                <li><strong>Priority:</strong> {project.priority}</li>
            </ul>
            """
            
            cls.send_styled_email(
                subject=f"New Project: {project.project_code}",
                html_content=content,
                recipient_list=list(set(recipients)),
                priority='high' if project.priority == 'Critical' else 'normal'
            )
    
    @classmethod
    def notify_project_delay(cls, project):
        """Notify about delayed project"""
        
        # Notify: ALL management levels + assigned personnel
        roles = ['Team Leader', 'Sector Manager', 'WO Supervisor', 'Engineer']
        recipients = []
        
        for role in roles:
            users = cls.get_users_by_role(role)
            recipients.extend([u.email for u in users])
        
        if project.assigned_engineer:
            recipients.append(project.assigned_engineer.email)
        
        if recipients:
            content = f"""
            <p><strong>⚠️ Project Delay Alert</strong></p>
            <ul>
                <li><strong>Project Code:</strong> {project.project_code}</li>
                <li><strong>Project Name:</strong> {project.project_name}</li>
                <li><strong>Vendor:</strong> {project.vendor.vendor_name if project.vendor else 'N/A'}</li>
                <li><strong>Expected Completion:</strong> {project.completion_date}</li>
                <li><strong>Delay Days:</strong> {project.delay_days}</li>
                <li><strong>Status:</strong> {project.status.status_name if project.status else 'Unknown'}</li>
            </ul>
            <p style="color: #d32f2f;"><strong>Action Required:</strong> Please review and take necessary corrective measures.</p>
            """
            
            cls.send_styled_email(
                subject=f"🚨 PROJECT DELAY: {project.project_code}",
                html_content=content,
                recipient_list=list(set(recipients)),
                priority='critical'
            )
    
    @classmethod
    def notify_project_completion(cls, project):
        """Notify when vendor marks project as completed"""
        
        # Notify: QI, Engineers, Team Leaders, Clerks
        roles = ['Quality Inspector', 'Engineer', 'Team Leader', 'Clerk']
        recipients = []
        
        for role in roles:
            users = cls.get_users_by_role(role)
            recipients.extend([u.email for u in users])
        
        if project.assigned_engineer:
            recipients.append(project.assigned_engineer.email)
        
        if project.assigned_qi:
            recipients.append(project.assigned_qi.email)
        
        if recipients:
            content = f"""
            <p><strong>✅ Project Marked as Completed</strong></p>
            <ul>
                <li><strong>Project Code:</strong> {project.project_code}</li>
                <li><strong>Project Name:</strong> {project.project_name}</li>
                <li><strong>Vendor:</strong> {project.vendor.vendor_name if project.vendor else 'N/A'}</li>
                <li><strong>Completion Date:</strong> {project.completion_date or 'Today'}</li>
                <li><strong>Assigned QI:</strong> {project.assigned_qi.get_full_name() if project.assigned_qi else 'Not Assigned'}</li>
            </ul>
            <p><strong>Next Steps:</strong></p>
            <ul>
                <li>Quality Inspector: Schedule final inspection</li>
                <li>Clerk: Verify document submission</li>
                <li>Engineer: Review and approve completion</li>
            </ul>
            """
            
            cls.send_styled_email(
                subject=f"Project Completed: {project.project_code}",
                html_content=content,
                recipient_list=list(set(recipients)),
                priority='success'
            )
    
    # ================== DOCUMENT NOTIFICATIONS ==================
    
    @classmethod
    def notify_document_uploaded(cls, document):
        """Notify when new document is uploaded"""
        
        # Notify: Engineers (for approval), Clerks, assigned QI, Team Leader
        roles = ['Engineer', 'Clerk', 'Team Leader']
        recipients = []
        
        for role in roles:
            users = cls.get_users_by_role(role)
            recipients.extend([u.email for u in users])
        
        # Add project's assigned engineer
        if document.project.assigned_engineer:
            recipients.append(document.project.assigned_engineer.email)
        
        # Add project's assigned QI
        if document.project.assigned_qi:
            recipients.append(document.project.assigned_qi.email)
        
        if recipients:
            content = f"""
            <p><strong>📄 New Document Uploaded</strong></p>
            <ul>
                <li><strong>Project:</strong> {document.project.project_code}</li>
                <li><strong>Document Type:</strong> {document.doc_type.doc_type_name if document.doc_type else 'N/A'}</li>
                <li><strong>Document Name:</strong> {document.document_name}</li>
                <li><strong>Uploaded By:</strong> {document.uploaded_by.get_full_name() if document.uploaded_by else 'N/A'}</li>
                <li><strong>Upload Date:</strong> {document.upload_date.strftime('%Y-%m-%d %H:%M')}</li>
                <li><strong>Status:</strong> {document.approval_status}</li>
            </ul>
            <p><strong>Action Required:</strong> Engineers - Please review and approve/reject this document.</p>
            """
            
            cls.send_styled_email(
                subject=f"Document Uploaded: {document.project.project_code}",
                html_content=content,
                recipient_list=list(set(recipients)),
                priority='normal'
            )
    
    @classmethod
    def notify_document_approved(cls, document):
        """Notify when document is approved"""
        
        # Notify: Uploader, Vendor, Clerk, Team Leader
        recipients = []
        
        # Uploader
        if document.uploaded_by:
            recipients.append(document.uploaded_by.email)
        
        # Vendor
        if document.project.vendor and document.project.vendor.email:
            recipients.append(document.project.vendor.email)
        
        # Clerks
        clerks = cls.get_users_by_role('Clerk')
        recipients.extend([u.email for u in clerks])
        
        # Team Leaders
        leaders = cls.get_users_by_role('Team Leader')
        recipients.extend([u.email for u in leaders])
        
        if recipients:
            content = f"""
            <p><strong>✅ Document Approved</strong></p>
            <ul>
                <li><strong>Project:</strong> {document.project.project_code}</li>
                <li><strong>Document Type:</strong> {document.doc_type.doc_type_name if document.doc_type else 'N/A'}</li>
                <li><strong>Document Name:</strong> {document.document_name}</li>
                <li><strong>Approved By:</strong> {document.approved_by.get_full_name() if document.approved_by else 'N/A'}</li>
                <li><strong>Approval Date:</strong> {document.approval_date.strftime('%Y-%m-%d %H:%M') if document.approval_date else 'N/A'}</li>
            </ul>
            """
            
            cls.send_styled_email(
                subject=f"Document Approved: {document.project.project_code}",
                html_content=content,
                recipient_list=list(set(recipients)),
                priority='success'
            )
    
    @classmethod
    def notify_document_rejected(cls, document):
        """Notify when document is rejected"""
        
        # Notify: Uploader, Vendor, Clerk
        recipients = []
        
        if document.uploaded_by:
            recipients.append(document.uploaded_by.email)
        
        if document.project.vendor and document.project.vendor.email:
            recipients.append(document.project.vendor.email)
        
        clerks = cls.get_users_by_role('Clerk')
        recipients.extend([u.email for u in clerks])
        
        if recipients:
            content = f"""
            <p><strong>❌ Document Rejected</strong></p>
            <ul>
                <li><strong>Project:</strong> {document.project.project_code}</li>
                <li><strong>Document Type:</strong> {document.doc_type.doc_type_name if document.doc_type else 'N/A'}</li>
                <li><strong>Document Name:</strong> {document.document_name}</li>
                <li><strong>Rejection Reason:</strong> {document.rejection_reason or 'Not specified'}</li>
            </ul>
            <p style="color: #d32f2f;"><strong>Action Required:</strong> Please correct the issues and resubmit.</p>
            """
            
            cls.send_styled_email(
                subject=f"Document Rejected: {document.project.project_code}",
                html_content=content,
                recipient_list=list(set(recipients)),
                priority='high'
            )
    
    # ================== INSPECTION NOTIFICATIONS ==================
    
    @classmethod
    def notify_inspection_scheduled(cls, inspection):
        """Notify when inspection is scheduled"""
        
        # Notify: Assigned QI, Vendor, Engineer, Team Leader
        recipients = []
        
        if inspection.assigned_qi:
            recipients.append(inspection.assigned_qi.email)
        
        if inspection.project.vendor and inspection.project.vendor.email:
            recipients.append(inspection.project.vendor.email)
        
        if inspection.project.assigned_engineer:
            recipients.append(inspection.project.assigned_engineer.email)
        
        leaders = cls.get_users_by_role('Team Leader')
        recipients.extend([u.email for u in leaders])
        
        if recipients:
            content = f"""
            <p><strong>🔍 Quality Inspection Scheduled</strong></p>
            <ul>
                <li><strong>Project:</strong> {inspection.project.project_code}</li>
                <li><strong>Inspection Type:</strong> {inspection.inspection_type.inspection_name if inspection.inspection_type else 'N/A'}</li>
                <li><strong>Assigned QI:</strong> {inspection.assigned_qi.get_full_name() if inspection.assigned_qi else 'N/A'}</li>
                <li><strong>Scheduled Date:</strong> {inspection.scheduled_date}</li>
                <li><strong>Location:</strong> {inspection.project.project_location or 'N/A'}</li>
            </ul>
            <p><strong>Note:</strong> Please ensure site readiness for inspection.</p>
            """
            
            cls.send_styled_email(
                subject=f"Inspection Scheduled: {inspection.project.project_code}",
                html_content=content,
                recipient_list=list(set(recipients)),
                priority='normal'
            )
    
    @classmethod
    def notify_inspection_completed(cls, inspection):
        """Notify when inspection is completed"""
        
        # Notify: Engineer, Vendor, Team Leader, Clerk
        roles = ['Engineer', 'Team Leader', 'Clerk']
        recipients = []
        
        for role in roles:
            users = cls.get_users_by_role(role)
            recipients.extend([u.email for u in users])
        
        if inspection.project.assigned_engineer:
            recipients.append(inspection.project.assigned_engineer.email)
        
        if inspection.project.vendor and inspection.project.vendor.email:
            recipients.append(inspection.project.vendor.email)
        
        if recipients:
            priority = 'critical' if inspection.inspection_result == 'Fail' else 'success'
            
            content = f"""
            <p><strong>{'✅' if inspection.inspection_result == 'Pass' else '❌'} Inspection Completed</strong></p>
            <ul>
                <li><strong>Project:</strong> {inspection.project.project_code}</li>
                <li><strong>Inspection Type:</strong> {inspection.inspection_type.inspection_name if inspection.inspection_type else 'N/A'}</li>
                <li><strong>Result:</strong> {inspection.inspection_result}</li>
                <li><strong>Inspection Date:</strong> {inspection.inspection_date}</li>
                <li><strong>Inspector:</strong> {inspection.assigned_qi.get_full_name() if inspection.assigned_qi else 'N/A'}</li>
            </ul>
            <p><strong>Findings:</strong></p>
            <p>{inspection.findings or 'No findings recorded'}</p>
            {f'<p style="color: #d32f2f;"><strong>Action Required:</strong> Corrective measures needed.</p>' if inspection.inspection_result == 'Fail' else ''}
            """
            
            cls.send_styled_email(
                subject=f"Inspection Result: {inspection.project.project_code} - {inspection.inspection_result}",
                html_content=content,
                recipient_list=list(set(recipients)),
                priority=priority
            )
    
    # ================== PENALTY NOTIFICATIONS ==================
    
    @classmethod
    def notify_penalty_issued(cls, penalty):
        """Notify when penalty is issued to vendor"""
        
        # Notify: Vendor, Team Leader, Sector Manager, Finance
        recipients = []
        
        if penalty.vendor and penalty.vendor.email:
            recipients.append(penalty.vendor.email)
        
        for role in ['Team Leader', 'Sector Manager']:
            users = cls.get_users_by_role(role)
            recipients.extend([u.email for u in users])
        
        if recipients:
            content = f"""
            <p><strong>💰 Penalty Issued</strong></p>
            <ul>
                <li><strong>Project:</strong> {penalty.project.project_code}</li>
                <li><strong>Vendor:</strong> {penalty.vendor.vendor_name if penalty.vendor else 'N/A'}</li>
                <li><strong>Penalty Amount:</strong> ₱{penalty.penalty_amount:,.2f}</li>
                <li><strong>Violation:</strong> {penalty.penalty_rule.rule_name if penalty.penalty_rule else 'N/A'}</li>
                <li><strong>Violation Date:</strong> {penalty.violation_date}</li>
                <li><strong>Delay Days:</strong> {penalty.delay_days}</li>
            </ul>
            <p style="color: #d32f2f;"><strong>Action Required:</strong> Please review and process payment.</p>
            """
            
            cls.send_styled_email(
                subject=f"Penalty Issued: {penalty.project.project_code}",
                html_content=content,
                recipient_list=list(set(recipients)),
                priority='critical'
            )
    
    # ================== SLA BREACH NOTIFICATIONS ==================
    
    @classmethod
    def notify_sla_breach(cls, sla_tracking):
        """Notify about SLA breach"""
        
        # Notify: ALL management + assigned personnel
        roles = ['Team Leader', 'Sector Manager', 'WO Supervisor']
        recipients = []
        
        for role in roles:
            users = cls.get_users_by_role(role)
            recipients.extend([u.email for u in users])
        
        if sla_tracking.project.assigned_engineer:
            recipients.append(sla_tracking.project.assigned_engineer.email)
        
        if recipients:
            content = f"""
            <p><strong>🚨 SLA BREACH ALERT</strong></p>
            <ul>
                <li><strong>Project:</strong> {sla_tracking.project.project_code}</li>
                <li><strong>SLA Rule:</strong> {sla_tracking.sla_rule.rule_name if sla_tracking.sla_rule else 'N/A'}</li>
                <li><strong>Due Date:</strong> {sla_tracking.due_date}</li>
                <li><strong>Days Breached:</strong> {sla_tracking.breach_days}</li>
            </ul>
            <p style="color: #d32f2f;"><strong>URGENT:</strong> Immediate action required to address this SLA breach.</p>
            """
            
            cls.send_styled_email(
                subject=f"🚨 SLA BREACH: {sla_tracking.project.project_code}",
                html_content=content,
                recipient_list=list(set(recipients)),
                priority='critical'
            )
    
    # ================== VENDOR-SPECIFIC NOTIFICATIONS ==================
    
    @classmethod
    def notify_vendor_document_overdue(cls, vendor, overdue_count):
        """Notify vendor about overdue documents"""
        
        if vendor.email:
            content = f"""
            <p><strong>⚠️ Overdue Documents Reminder</strong></p>
            <p>Dear {vendor.vendor_name},</p>
            <p>You have <strong>{overdue_count}</strong> overdue document(s) that require immediate attention.</p>
            <p style="color: #d32f2f;">Please submit all required documents as soon as possible to avoid penalties and project delays.</p>
            <p>If you need assistance, please contact your assigned project engineer.</p>
            """
            
            cls.send_styled_email(
                subject=f"Overdue Documents: {overdue_count} Pending",
                html_content=content,
                recipient_list=[vendor.email],
                priority='high'
            )


# Singleton instance
email_service = EmailNotificationService()