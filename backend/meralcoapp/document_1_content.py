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