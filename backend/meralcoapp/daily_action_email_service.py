# daily_action_email_service.py

from django.core.mail import EmailMultiAlternatives
from django.conf import settings
from django.utils import timezone
from datetime import date, timedelta
from decimal import Decimal
from .models import (
    EmailNotificationLog, WorkOrder, User, UserRole,
    BackjobMonitoring, QIInspection, SLATracking,
    VendorDispute, Penalty, Invoice, ProjectDocument,
    Escalation
)

user_roles_and_features = [
    {
        "role": "System Administrator",
        "role_code": "ADMIN",
        "permissions": [
            # User Management
            "view_all_users",
            "create_user",
            "edit_user",
            "delete_user",
            "assign_roles",
            "manage_permissions",
            "view_user_sessions",
            "deactivate_user",
            
            # System Configuration
            "manage_system_settings",
            "configure_sla_rules",
            "configure_penalty_rules",
            "manage_workflow_stages",
            "manage_notification_templates",
            "manage_escalation_rules",
            
            # Data Management
            "view_all_projects",
            "view_all_vendors",
            "view_all_work_orders",
            "export_all_data",
            "import_data",
            "bulk_operations",
            
            # Audit & Logs
            "view_change_logs",
            "view_audit_logs",
            "view_system_logs",
            
            # Dashboard & Reports
            "view_admin_dashboard",
            "generate_all_reports",
            "view_kpi_dashboard",
            "configure_kpi_targets",
            
            # Full System Access
            "access_all_modules",
            "override_permissions"
        ]
    },
    
    {
        "role": "Team Leader",
        "role_code": "LEADER",
        "permissions": [
            # Project Oversight
            "view_all_projects",
            "view_project_timeline",
            "view_project_documents",
            "approve_project_milestones",
            
            # Work Order Management
            "view_all_work_orders",
            "assign_work_orders",
            "reassign_qi",
            "reassign_supervisor",
            "view_wo_statistics",
            
            # Team Management
            "view_team_members",
            "view_qi_performance",
            "view_supervisor_performance",
            "assign_team_to_projects",
            "manage_qi_targets",
            
            # Vendor Management
            "view_vendor_performance",
            "approve_vendor_blacklist",
            "review_vendor_disputes",
            "evaluate_vendor_productivity",
            
            # Quality & Compliance
            "view_inspection_reports",
            "review_quality_metrics",
            "approve_sla_waivers",
            "review_escalations",
            
            # Penalties & Billing
            "approve_penalties",
            "waive_penalties",
            "review_invoices",
            "approve_billing",
            
            # Reports & Analytics
            "view_team_dashboard",
            "generate_team_reports",
            "view_kpi_reports",
            "view_delay_analysis",
            "view_ageing_reports",
            "view_pca_summary",
            
            # Escalations
            "receive_escalations",
            "resolve_escalations",
            "escalate_critical_issues"
        ]
    },
    
    {
        "role": "Sector Manager",
        "role_code": "SECTOR_MGR",
        "permissions": [
            # Sector Management
            "view_sector_projects",
            "manage_sector_info",
            "assign_sector_resources",
            
            # Project Management
            "view_sector_work_orders",
            "monitor_project_progress",
            "view_project_milestones",
            "view_project_documents",
            
            # Team Coordination
            "view_sector_team",
            "coordinate_with_qi",
            "coordinate_with_supervisors",
            
            # Vendor Coordination
            "view_sector_vendors",
            "monitor_vendor_compliance",
            "review_vendor_performance",
            
            # Reports & Monitoring
            "view_sector_dashboard",
            "generate_sector_reports",
            "view_sector_kpis",
            "monitor_sla_compliance",
            
            # Quality Assurance
            "review_inspection_results",
            "monitor_quality_metrics",
            
            # Budget & Costs
            "view_sector_budget",
            "track_project_costs",
            "review_invoices"
        ]
    },
    
    {
        "role": "WO Supervisor",
        "role_code": "SUPERVISOR",
        "permissions": [
            # Work Order Management
            "view_assigned_work_orders",
            "update_wo_status",
            "add_wo_remarks",
            "track_wo_progress",
            "assign_crews",
            
            # Project Coordination
            "coordinate_with_vendors",
            "coordinate_with_qi",
            "schedule_inspections",
            "request_documents",
            
            # Crew Management
            "view_crew_assignments",
            "monitor_crew_productivity",
            "track_daily_crew_monitoring",
            "update_crew_status",
            
            # Document Management
            "upload_project_documents",
            "submit_completion_documents",
            "track_document_compliance",
            
            # Backjob Management
            "create_backjobs",
            "update_backjob_status",
            "resolve_backjobs",
            "escalate_backjobs",
            
            # Progress Reporting
            "submit_daily_reports",
            "update_project_progress",
            "report_delays",
            "add_delay_factors",
            
            # Dashboard & Reports
            "view_supervisor_dashboard",
            "view_assigned_projects_report",
            "view_crew_productivity_report",
            "view_ageing_analysis",
            
            # Notifications
            "receive_wo_notifications",
            "receive_sla_alerts",
            "receive_document_reminders"
        ]
    },
    
    {
        "role": "Quality Inspector",
        "role_code": "QI",
        "permissions": [
            # Inspection Management
            "view_assigned_inspections",
            "conduct_inspections",
            "submit_inspection_reports",
            "upload_inspection_photos",
            "record_inspection_findings",
            "provide_recommendations",
            
            # Work Order QA
            "audit_work_orders",
            "approve_work_completion",
            "reject_work_completion",
            "request_corrections",
            
            # Document Review
            "review_project_documents",
            "verify_coc_documents",
            "approve_technical_documents",
            
            # Daily Tracking
            "log_daily_accomplishments",
            "track_weekly_targets",
            "update_inspection_schedule",
            
            # Quality Metrics
            "view_qi_dashboard",
            "view_personal_performance",
            "view_inspection_history",
            "view_quality_metrics",
            
            # Reporting
            "generate_inspection_reports",
            "submit_weekly_accomplishments",
            "report_quality_issues",
            
            # Notifications
            "receive_inspection_assignments",
            "receive_schedule_reminders",
            "receive_target_alerts"
        ]
    },
    
    {
        "role": "Engineer",
        "role_code": "ENGINEER",
        "permissions": [
            # Project Management
            "view_assigned_projects",
            "update_project_details",
            "manage_project_timeline",
            "track_milestones",
            
            # Technical Documentation
            "upload_technical_documents",
            "review_engineering_drawings",
            "approve_technical_specs",
            "manage_project_documents",
            
            # Vendor Coordination
            "coordinate_with_vendors",
            "review_vendor_submittals",
            "approve_material_specs",
            
            # Work Order Management
            "create_work_orders",
            "update_wo_details",
            "track_wo_progress",
            "review_completion_status",
            
            # Quality Coordination
            "request_qi_inspection",
            "review_inspection_reports",
            "address_quality_findings",
            
            # Cost & Budget
            "track_project_costs",
            "update_contract_values",
            "review_billing_documents",
            
            # Reporting
            "view_engineer_dashboard",
            "generate_project_reports",
            "view_project_analytics",
            
            # Technical Analysis
            "analyze_delay_factors",
            "provide_technical_solutions",
            "recommend_process_improvements"
        ]
    },
    
    {
        "role": "Vendor Representative",
        "role_code": "VENDOR",
        "permissions": [
            # Project Access
            "view_assigned_projects",
            "view_project_details",
            "track_project_status",
            
            # Document Submission
            "upload_coc_documents",
            "submit_completion_documents",
            "upload_permits",
            "upload_invoices",
            "track_document_status",
            
            # Work Order Management
            "view_assigned_work_orders",
            "update_wo_progress",
            "add_vendor_remarks",
            "view_wo_requirements",
            
            # Compliance Tracking
            "view_sla_status",
            "track_document_compliance",
            "monitor_penalties",
            
            # Dispute Management
            "submit_disputes",
            "track_dispute_status",
            "view_dispute_resolution",
            "respond_to_queries",
            
            # Feedback System
            "submit_feedback",
            "view_feedback_responses",
            "rate_system_experience",
            
            # Performance Monitoring
            "view_vendor_dashboard",
            "view_performance_metrics",
            "view_compliance_score",
            "view_productivity_reports",
            
            # Penalties
            "view_penalties",
            "dispute_penalties",
            "view_penalty_history",
            
            # Notifications
            "receive_document_reminders",
            "receive_sla_warnings",
            "receive_inspection_notifications",
            "receive_penalty_notifications"
        ]
    },
    
    {
        "role": "Clerk",
        "role_code": "CLERK",
        "permissions": [
            # Document Processing
            "receive_documents",
            "scan_documents",
            "upload_documents",
            "organize_documents",
            "track_document_receipt",
            
            # Data Entry
            "enter_work_order_data",
            "update_project_information",
            "record_dates",
            "input_vendor_information",
            
            # Record Management
            "maintain_filing_system",
            "archive_completed_projects",
            "retrieve_documents",
            "generate_document_reports",
            
            # Work Order Support
            "log_wo_receipt",
            "update_wo_status",
            "add_clerk_remarks",
            "track_jacket_receipt",
            
            # Coordination
            "coordinate_document_flow",
            "notify_missing_documents",
            "follow_up_submissions",
            
            # Reports
            "view_clerk_dashboard",
            "generate_document_tracking_reports",
            "view_pending_documents",
            
            # Notifications
            "receive_document_alerts",
            "send_document_reminders"
        ]
    },
    
    {
        "role": "Engineering Aide",
        "role_code": "AIDE",
        "permissions": [
            # Field Support
            "assist_field_inspections",
            "collect_field_data",
            "take_site_photos",
            "record_measurements",
            
            # Document Support
            "prepare_technical_documents",
            "assist_document_preparation",
            "organize_project_files",
            
            # Data Collection
            "record_project_data",
            "update_field_reports",
            "log_site_observations",
            
            # Coordination Support
            "coordinate_with_vendors",
            "assist_qi_inspections",
            "support_supervisor_activities",
            
            # Work Order Support
            "view_assigned_work_orders",
            "update_field_status",
            "report_site_issues",
            
            # Dashboard
            "view_aide_dashboard",
            "view_assigned_tasks",
            "track_daily_activities",
            
            # Notifications
            "receive_task_assignments",
            "receive_field_visit_schedules"
        ]
    }
]

# Feature categories for better organization
feature_categories = {
    "user_management": [
        "view_all_users", "create_user", "edit_user", "delete_user",
        "assign_roles", "manage_permissions", "deactivate_user"
    ],
    
    "project_management": [
        "view_all_projects", "view_assigned_projects", "create_projects",
        "edit_projects", "delete_projects", "manage_project_timeline",
        "track_milestones", "assign_team_to_projects"
    ],
    
    "work_order_management": [
        "view_all_work_orders", "view_assigned_work_orders", "create_work_orders",
        "update_wo_status", "assign_work_orders", "track_wo_progress"
    ],
    
    "vendor_management": [
        "view_all_vendors", "view_assigned_vendors", "evaluate_vendors",
        "blacklist_vendors", "manage_vendor_contacts", "review_vendor_disputes"
    ],
    
    "quality_inspection": [
        "conduct_inspections", "view_inspection_reports", "approve_inspections",
        "track_qi_performance", "manage_qi_targets"
    ],
    
    "document_management": [
        "upload_documents", "review_documents", "approve_documents",
        "track_document_compliance", "manage_document_types"
    ],
    
    "sla_penalty_management": [
        "track_sla_compliance", "create_penalties", "approve_penalties",
        "waive_penalties", "dispute_penalties"
    ],
    
    "billing_invoicing": [
        "create_invoices", "approve_invoices", "process_payments",
        "track_billing_status", "view_financial_reports"
    ],
    
    "reporting_analytics": [
        "view_dashboard", "generate_reports", "view_kpi_metrics",
        "analyze_delays", "view_ageing_analysis", "export_data"
    ],
    
    "notifications_escalations": [
        "receive_notifications", "send_notifications", "create_escalations",
        "resolve_escalations", "configure_escalation_rules"
    ]
}


class DailyActionEmailService:
    """Service for sending daily action emails to users based on their role"""
    
    @staticmethod
    def get_pending_actions_for_role(role_code):
        """Get pending actions based on user role"""
        today = date.today()
        
        actions = {
            'ADMIN': {
                'new_users': User.objects.filter(
                    created_at__date=today,
                    is_active=True
                ).count(),
                'new_users_list': list(User.objects.filter(
                    created_at__date=today,
                    is_active=True
                ).values('username', 'email', 'role__role_name')[:5]),
                'pending_escalations': Escalation.objects.filter(
                    status='Open'
                ).count(),
                'system_issues': []
            },
            'LEADER': {
                'pending_approvals': Penalty.objects.filter(
                    penalty_status='Pending'
                ).count(),
                'open_escalations': Escalation.objects.filter(
                    status='Open'
                ).count(),
                'overdue_wos': WorkOrder.objects.filter(
                    with_backjob=True,
                    status__in=['NEW', 'FOR AUDIT']
                ).count(),
                'overdue_wo_list': list(WorkOrder.objects.filter(
                    with_backjob=True,
                    status__in=['NEW', 'FOR AUDIT']
                ).order_by('-exclusion_duration').values(
                    'wo_no', 'description', 'exclusion_duration'
                )[:5]),
                'pending_sla_waivers': SLATracking.objects.filter(
                    is_breached=True,
                    status='Breached'
                ).count()
            },
            'SECTOR_MGR': {
                'sector_delayed_wos': WorkOrder.objects.filter(
                    with_backjob=True
                ).count(),
                'pending_inspections': QIInspection.objects.filter(
                    is_completed=False,
                    scheduled_date__lte=today
                ).count()
            },
            'SUPERVISOR': {
                'assigned_open_wos': 0,  # Will be filled per user
                'pending_updates': 0,
                'overdue_backjobs': BackjobMonitoring.objects.filter(
                    is_overdue=True,
                    status__in=['PENDING', 'IN_PROGRESS']
                ).count()
            },
            'QI': {
                'scheduled_inspections': 0,  # Will be filled per user
                'overdue_inspections': 0,
                'pending_reports': 0
            },
            'ENGINEER': {
                'pending_document_reviews': ProjectDocument.objects.filter(
                    approval_status='Pending'
                ).count(),
                'project_updates_needed': 0
            },
            'VENDOR': {
                'overdue_documents': 0,  # Will be filled per user
                'sla_warnings': 0,
                'pending_disputes': VendorDispute.objects.filter(
                    dispute_status='Pending'
                ).count()
            },
            'CLERK': {
                'documents_to_process': ProjectDocument.objects.filter(
                    approval_status='Pending'
                ).count(),
                'pending_entries': 0
            },
            'AIDE': {
                'field_tasks_today': 0,
                'pending_reports': 0
            }
        }
        
        return actions.get(role_code, {})
    
    @staticmethod
    def get_role_capabilities(role_code):
        """Get available capabilities/features for a role"""
        
        role_data = next(
            (role for role in user_roles_and_features if role['role_code'] == role_code),
            None
        )
        
        if role_data:
            return {
                'role_name': role_data['role'],
                'permissions': role_data['permissions']
            }
        return None
    
    @staticmethod
    def build_action_email_html(user, pending_actions, capabilities):
        """Build HTML email with today's actions and capabilities"""
        
        role_code = user.role.role_name if user.role else 'USER'
        
        # Build pending actions section
        actions_html = DailyActionEmailService._build_actions_section(
            role_code, pending_actions
        )
        
        # Build capabilities section
        capabilities_html = DailyActionEmailService._build_capabilities_section(
            capabilities
        )
        
        # Determine priority level
        total_actions = sum([
            v for k, v in pending_actions.items() 
            if isinstance(v, int)
        ])
        
        if total_actions > 10:
            priority_color = '#f44336'
            priority_emoji = '🔴'
            priority_text = 'HIGH PRIORITY'
        elif total_actions > 5:
            priority_color = '#FF9800'
            priority_emoji = '🟡'
            priority_text = 'MODERATE PRIORITY'
        else:
            priority_color = '#4CAF50'
            priority_emoji = '🟢'
            priority_text = 'NORMAL WORKLOAD'
        
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
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center;">
                    <h1 style="margin: 0; font-size: 28px;">📋 Daily Action Report</h1>
                    <p style="margin: 10px 0 0 0; font-size: 14px;">{date.today().strftime('%A, %B %d, %Y')}</p>
                    <p style="margin: 5px 0 0 0; font-size: 16px; font-weight: bold;">
                        Hello, {user.first_name} {user.last_name}
                    </p>
                </div>
                
                <!-- Priority Banner -->
                <div style="background-color: {priority_color}; color: white; padding: 15px 30px; text-align: center;">
                    <h2 style="margin: 0; font-size: 18px;">
                        {priority_emoji} {priority_text} - {total_actions} Action Items
                    </h2>
                </div>
                
                <!-- Today's Actions -->
                <div style="padding: 30px;">
                    <h2 style="color: #333; border-bottom: 2px solid #667eea; padding-bottom: 10px; margin-top: 0;">
                        🎯 What You Need to Do Today
                    </h2>
                    {actions_html}
                </div>
                
                <!-- Capabilities Section -->
                <div style="padding: 0 30px 30px 30px;">
                    <h2 style="color: #333; border-bottom: 2px solid #667eea; padding-bottom: 10px;">
                        💼 What You Can Do in the System
                    </h2>
                    {capabilities_html}
                </div>
                
                <!-- Quick Links -->
                <div style="background-color: #f8f9fa; padding: 20px 30px; border-top: 1px solid #ddd;">
                    <h3 style="color: #333; margin-top: 0;">🔗 Quick Links</h3>
                    <ul style="list-style: none; padding: 0; margin: 0;">
                        <li style="margin: 8px 0;">
                            <a href="https://your-system.com/dashboard" style="color: #667eea; text-decoration: none;">
                                → Go to Dashboard
                            </a>
                        </li>
                        <li style="margin: 8px 0;">
                            <a href="https://your-system.com/work-orders" style="color: #667eea; text-decoration: none;">
                                → View Work Orders
                            </a>
                        </li>
                        <li style="margin: 8px 0;">
                            <a href="https://your-system.com/profile" style="color: #667eea; text-decoration: none;">
                                → Update Profile
                            </a>
                        </li>
                    </ul>
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
    def _build_actions_section(role_code, pending_actions):
        """Build the actions section based on role"""
        
        if not pending_actions or sum([v for k, v in pending_actions.items() if isinstance(v, int)]) == 0:
            return """
            <div style="padding: 20px; background-color: #e8f5e9; border-left: 4px solid #4CAF50; border-radius: 4px;">
                <p style="margin: 0; color: #2e7d32; font-size: 16px;">
                    ✅ <strong>Great news!</strong> No urgent actions required today.
                </p>
            </div>
            """
        
        actions_list = []
        
        # Admin actions
        if role_code == 'ADMIN':
            if pending_actions.get('new_users', 0) > 0:
                actions_list.append(f"""
                <div style="padding: 15px; background-color: #fff3cd; border-left: 4px solid #ffc107; margin-bottom: 15px; border-radius: 4px;">
                    <h4 style="margin: 0 0 10px 0; color: #856404;">
                        👤 {pending_actions['new_users']} New User(s) to Review
                    </h4>
                    <p style="margin: 0; color: #856404;">Please review and activate new user accounts.</p>
                </div>
                """)
            
            if pending_actions.get('pending_escalations', 0) > 0:
                actions_list.append(f"""
                <div style="padding: 15px; background-color: #f8d7da; border-left: 4px solid #dc3545; margin-bottom: 15px; border-radius: 4px;">
                    <h4 style="margin: 0 0 10px 0; color: #721c24;">
                        ⚠️ {pending_actions['pending_escalations']} Open Escalation(s)
                    </h4>
                    <p style="margin: 0; color: #721c24;">Critical issues require your attention.</p>
                </div>
                """)
        
        # Leader actions
        elif role_code == 'LEADER':
            if pending_actions.get('pending_approvals', 0) > 0:
                actions_list.append(f"""
                <div style="padding: 15px; background-color: #fff3cd; border-left: 4px solid #ffc107; margin-bottom: 15px; border-radius: 4px;">
                    <h4 style="margin: 0 0 10px 0; color: #856404;">
                        ✍️ {pending_actions['pending_approvals']} Penalty Approval(s) Needed
                    </h4>
                    <p style="margin: 0; color: #856404;">Review and approve or reject pending penalties.</p>
                </div>
                """)
            
            if pending_actions.get('overdue_wos', 0) > 0:
                wo_list = pending_actions.get('overdue_wo_list', [])
                wo_rows = []
                for wo in wo_list[:3]:
                    wo_rows.append(f"""
                    <tr style="border-bottom: 1px solid #eee;">
                        <td style="padding: 8px;">{wo['wo_no']}</td>
                        <td style="padding: 8px;">{wo['description'][:40]}...</td>
                        <td style="padding: 8px; text-align: center; color: #d32f2f; font-weight: bold;">
                            {wo['exclusion_duration']} days
                        </td>
                    </tr>
                    """)
                
                actions_list.append(f"""
                <div style="padding: 15px; background-color: #f8d7da; border-left: 4px solid #dc3545; margin-bottom: 15px; border-radius: 4px;">
                    <h4 style="margin: 0 0 10px 0; color: #721c24;">
                        🚨 {pending_actions['overdue_wos']} Delayed Work Order(s)
                    </h4>
                    <table style="width: 100%; border-collapse: collapse; margin-top: 10px; background: white;">
                        <thead>
                            <tr style="background-color: #f5f5f5;">
                                <th style="padding: 8px; text-align: left; border-bottom: 2px solid #ddd;">WO No</th>
                                <th style="padding: 8px; text-align: left; border-bottom: 2px solid #ddd;">Description</th>
                                <th style="padding: 8px; text-align: center; border-bottom: 2px solid #ddd;">Delay</th>
                            </tr>
                        </thead>
                        <tbody>
                            {''.join(wo_rows)}
                        </tbody>
                    </table>
                </div>
                """)
        
        # Supervisor actions
        elif role_code == 'SUPERVISOR':
            if pending_actions.get('overdue_backjobs', 0) > 0:
                actions_list.append(f"""
                <div style="padding: 15px; background-color: #f8d7da; border-left: 4px solid #dc3545; margin-bottom: 15px; border-radius: 4px;">
                    <h4 style="margin: 0 0 10px 0; color: #721c24;">
                        🔧 {pending_actions['overdue_backjobs']} Overdue Backjob(s)
                    </h4>
                    <p style="margin: 0; color: #721c24;">These backjobs need immediate attention.</p>
                </div>
                """)
        
        # QI actions
        elif role_code == 'QI':
            if pending_actions.get('scheduled_inspections', 0) > 0:
                actions_list.append(f"""
                <div style="padding: 15px; background-color: #cfe2ff; border-left: 4px solid #0d6efd; margin-bottom: 15px; border-radius: 4px;">
                    <h4 style="margin: 0 0 10px 0; color: #084298;">
                        📋 {pending_actions['scheduled_inspections']} Inspection(s) Scheduled Today
                    </h4>
                    <p style="margin: 0; color: #084298;">Complete your scheduled inspections.</p>
                </div>
                """)
        
        if not actions_list:
            return """
            <div style="padding: 20px; background-color: #e8f5e9; border-left: 4px solid #4CAF50; border-radius: 4px;">
                <p style="margin: 0; color: #2e7d32; font-size: 16px;">
                    ✅ All caught up! No urgent actions for today.
                </p>
            </div>
            """
        
        return ''.join(actions_list)
    
    @staticmethod
    def _build_capabilities_section(capabilities):
        """Build capabilities section"""
        
        if not capabilities:
            return "<p>No capabilities data available.</p>"
        
        permissions = capabilities.get('permissions', [])
        
        # Group permissions by category
        categories = {
            'Project & Work Orders': [],
            'Quality & Inspection': [],
            'Documents & Compliance': [],
            'Reports & Analytics': [],
            'Team & Coordination': [],
            'Other': []
        }
        
        for perm in permissions:
            if any(x in perm for x in ['project', 'work', 'wo_']):
                categories['Project & Work Orders'].append(perm)
            elif any(x in perm for x in ['inspection', 'quality', 'qi_']):
                categories['Quality & Inspection'].append(perm)
            elif any(x in perm for x in ['document', 'upload', 'review']):
                categories['Documents & Compliance'].append(perm)
            elif any(x in perm for x in ['report', 'dashboard', 'view', 'analytics']):
                categories['Reports & Analytics'].append(perm)
            elif any(x in perm for x in ['team', 'assign', 'coordinate']):
                categories['Team & Coordination'].append(perm)
            else:
                categories['Other'].append(perm)
        
        # Build HTML for categories
        category_html = []
        
        for category, perms in categories.items():
            if perms:
                perm_items = []
                for perm in perms[:10]:  # Limit to 10 per category
                    formatted_perm = perm.replace('_', ' ').title()
                    perm_items.append(f"<li style='margin: 5px 0;'>✓ {formatted_perm}</li>")
                
                category_html.append(f"""
                <div style="margin-bottom: 20px;">
                    <h4 style="color: #667eea; margin: 0 0 10px 0;">{category}</h4>
                    <ul style="margin: 0; padding-left: 20px; color: #555;">
                        {''.join(perm_items)}
                    </ul>
                </div>
                """)
        
        return ''.join(category_html)
    
    @staticmethod
    def send_daily_action_email(user):
        """Send daily action email to a user"""
        
        try:
            # Get role code
            role_code = user.role.role_name if user.role else 'USER'
            
            # Get pending actions
            pending_actions = DailyActionEmailService.get_pending_actions_for_role(role_code)
            
            # Get capabilities
            capabilities = DailyActionEmailService.get_role_capabilities(role_code)
            
            # Build email
            html_content = DailyActionEmailService.build_action_email_html(
                user, pending_actions, capabilities
            )
            
            # Send email
            subject = f"📋 Daily Action Report - {date.today().strftime('%B %d, %Y')}"
            
            email = EmailMultiAlternatives(
                subject=subject,
                body="Please view this email in HTML format.",
                from_email=settings.DEFAULT_FROM_EMAIL,
                to=[user.email]
            )
            email.attach_alternative(html_content, "text/html")
            email.send(fail_silently=False)
            
            # Log success
            EmailNotificationLog.objects.create(
                notification_type='DAILY_ACTION',
                notification_date=date.today(),
                recipient_email=user.email,
                status='SENT',
                email_content=html_content[:5000]
            )
            
            return {
                'success': True,
                'message': f'Email sent to {user.email}'
            }
            
        except Exception as e:
            # Log error
            EmailNotificationLog.objects.create(
                notification_type='DAILY_ACTION',
                notification_date=date.today(),
                recipient_email=user.email,
                status='FAILED',
                error_message=str(e)
            )
            
            return {
                'success': False,
                'message': f'Failed to send email: {str(e)}'
            }
    
    @staticmethod
    def send_daily_emails_to_all_users():
        """Send daily action emails to all active users"""
        
        active_users = User.objects.filter(
            is_active=True,
            email__isnull=False
        ).exclude(email='')
        
        results = {
            'total': active_users.count(),
            'sent': 0,
            'failed': 0,
            'details': []
        }
        
        for user in active_users:
            result = DailyActionEmailService.send_daily_action_email(user)
            
            if result['success']:
                results['sent'] += 1
            else:
                results['failed'] += 1
            
            results['details'].append({
                'user': user.username,
                'email': user.email,
                'status': 'sent' if result['success'] else 'failed'
            })
        
        return results