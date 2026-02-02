from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import *
from django.conf.urls.static import static

# Import Excel / bulk operation functions from file_handlers.py
from .file_handlers import (
    import_work_orders_excel,
    export_work_orders_excel,
    import_crew_monitoring_excel,
    import_qi_monitoring_excel,
    bulk_update_work_orders,
    bulk_upload_documents
)

# Create router
router = DefaultRouter()

# Authentication
router.register(r'auth', AuthViewSet, basename='auth')

# Emailings
router.register(r'daily-action-emails', DailyActionEmailViewSet, basename='daily-action-email')

# QI Correction photos
router.register(r'qi-inspection-correction-photos', QIInspectionCorrectionPhotoViewSet, basename='qi-inspection-correction-photo')

# User Management
router.register(r'user-roles', UserRoleViewSet, basename='user-role')
router.register(r'permissions', PermissionViewSet, basename='permission')
router.register(r'role-permissions', RolePermissionViewSet, basename='role-permission')
router.register(r'users', UserViewSet, basename='user')
router.register(r'user-sessions', UserSessionViewSet, basename='user-session')

# Vendor Management
router.register(r'vendors', VendorViewSet, basename='vendor')
router.register(r'vendor-contacts', VendorContactViewSet, basename='vendor-contact')
router.register(r'vendor-performance', VendorPerformanceViewSet, basename='vendor-performance')

# Project Management
router.register(r'sectors', SectorViewSet, basename='sector')
router.register(r'project-statuses', ProjectStatusViewSet, basename='project-status')
router.register(r'projects', ProjectViewSet, basename='project')
router.register(r'project-milestones', ProjectMilestoneViewSet, basename='project-milestone')
router.register(r'project-team', ProjectTeamViewSet, basename='project-team')

# Workflow Management
router.register(r'workflow-stages', WorkflowStageViewSet, basename='workflow-stage')
router.register(r'project-workflows', ProjectWorkflowViewSet, basename='project-workflow')

# Document Management
router.register(r'document-types', DocumentTypeViewSet, basename='document-type')
router.register(r'project-documents', ProjectDocumentViewSet, basename='project-document')
router.register(r'document-compliance', DocumentComplianceViewSet, basename='document-compliance')

# SLA Management
router.register(r'sla-rules', SLARuleViewSet, basename='sla-rule')
router.register(r'sla-tracking', SLATrackingViewSet, basename='sla-tracking')

# Quality Inspection
router.register(r'inspection-types', InspectionTypeViewSet, basename='inspection-type')
router.register(r'qi-inspections', QIInspectionViewSet, basename='qi-inspection')
router.register(r'qi-daily-targets', QIDailyTargetViewSet, basename='qi-daily-target')
router.register(r'qi-performance', QIPerformanceViewSet, basename='qi-performance')

# Penalty Management
router.register(r'penalty-rules', PenaltyRuleViewSet, basename='penalty-rule')
router.register(r'penalties', PenaltyViewSet, basename='penalty')

# Billing Management
router.register(r'invoices', InvoiceViewSet, basename='invoice')
router.register(r'payments', PaymentViewSet, basename='payment')

# Notification Management
router.register(r'notification-templates', NotificationTemplateViewSet, basename='notification-template')
router.register(r'notifications', NotificationViewSet, basename='notification')

# Escalation Management
router.register(r'escalation-rules', EscalationRuleViewSet, basename='escalation-rule')
router.register(r'escalations', EscalationViewSet, basename='escalation')

# Analytics
router.register(r'delay-factors', DelayFactorViewSet, basename='delay-factor')
router.register(r'project-delays', ProjectDelayViewSet, basename='project-delay')

# Vendor Portal
router.register(r'vendor-disputes', VendorDisputeViewSet, basename='vendor-dispute')
router.register(r'vendor-feedback', VendorFeedbackViewSet, basename='vendor-feedback')

# Audit & Logs
router.register(r'change-logs', ChangeLogViewSet, basename='change-log')
router.register(r'audit-logs', SystemAuditLogViewSet, basename='audit-log')

# System Configuration
router.register(r'system-settings', SystemSettingViewSet, basename='system-setting')

# Dashboard - IMPORTANT: Register this ViewSet
router.register(r'dashboard', DashboardViewSet, basename='dashboard')

# Work Order Management
router.register(r'work-orders', WorkOrderViewSet, basename='work-order')
router.register(r'work-order-documents', WorkOrderDocumentViewSet, basename='work-order-document')

# Defect Reporting and Inspection
router.register(r'inspection-checklist-items', InspectionChecklistItemViewSet, basename='inspection-checklist-item')
router.register(r'inspection-flags', InspectionFlagViewSet, basename='inspection-flag')
router.register(r'defect-reports', DefectReportViewSet, basename='defect-report')



# Crew Monitoring
router.register(r'crew-types', CrewTypeViewSet, basename='crew-type')
router.register(r'daily-crew-monitoring', DailyCrewMonitoringViewSet, basename='daily-crew-monitoring')

# QI Monitoring
router.register(r'qi-weekly-accomplishments', QIWeeklyAccomplishmentViewSet, basename='qi-weekly-accomplishment')
router.register(r'qi-monthly-accomplishments', QIMonthlyAccomplishmentViewSet, basename='qi-monthly-accomplishment')

# PCA
router.register(r'pca-goals', PCAGoalViewSet, basename='pca-goal')
router.register(r'pca-summary', PCASummaryViewSet, basename='pca-summary')

# Vendor Productivity
router.register(r'vendor-productivity-monthly', VendorProductivityMonthlyViewSet, basename='vendor-productivity-monthly')

# Ageing Analysis
router.register(r'ageing-analysis', AgeingAnalysisViewSet, basename='ageing-analysis')

# Backjob Monitoring
router.register(r'backjob-monitoring', BackjobMonitoringViewSet, basename='backjob-monitoring')

# KPIs
router.register(r'kpi-snapshots', KPISnapshotViewSet, basename='kpi-snapshot')
router.register(r'kpi-targets', KPITargetViewSet, basename='kpi-target')
router.register(r'kpi-dashboard', KPIDashboardViewSet, basename='kpi-dashboard')



# Vendor Portal
router.register(r'vendor-portal', VendorPortalViewSet, basename='vendor-portal')

# Clerk Portal
router.register(r'clerk', ClerkViewSet, basename='clerk')

# Engineering Aide Portal
router.register(r'engineering-aide', EngineeringAideViewSet, basename='engineering-aide')

# Engineer Portal
router.register(r'engineer', EngineerViewSet, basename='engineer')

# QI Mobile Portal
router.register(r'qi-mobile', QIMobileViewSet, basename='qi-mobile')

# WO Supervisor Portal
router.register(r'wo-supervisor', WOSupervisorViewSet, basename='wo-supervisor')

# Team Leader Portal
router.register(r'team-leader', TeamLeaderViewSet, basename='team-leader')

# Sector Manager Portal
router.register(r'sector-manager', SectorManagerViewSet, basename='sector-manager')

router.register(r'calendar', CalendarDashboardViewSet, basename='calendar')
# System Administrator Portal
router.register(r'system-admin', SystemAdministratorViewSet, basename='system-admin')

# Clerk document validation
router.register(r'clerk-validation', ClerkDocumentValidationViewSet, basename='clerk-validation')


# Vendor Daily Activities
router.register(r'vendor-daily-activities', VendorDailyActivityViewSet, basename='vendor-daily-activity')
router.register(r'vendor-activity-photos', VendorActivityPhotoViewSet, basename='vendor-activity-photo')

# QI Inspection Photos
router.register(r'qi-inspection-photos', QIInspectionPhotoViewSet, basename='qi-inspection-photo')

router.register(r'payment-receipts', PaymentReceiptViewSet, basename='payment-receipt')

# Add these custom URL patterns if needed:
payment_receipt_urls = [
    # Approve receipt
    path('payment-receipts/<int:pk>/approve/', 
         PaymentReceiptViewSet.as_view({'post': 'approve'}), 
         name='payment-receipt-approve'),
    
    # Reject receipt
    path('payment-receipts/<int:pk>/reject/', 
         PaymentReceiptViewSet.as_view({'post': 'reject'}), 
         name='payment-receipt-reject'),
    
    # Pending count
    path('payment-receipts/pending_count/', 
         PaymentReceiptViewSet.as_view({'get': 'pending_count'}), 
         name='payment-receipt-pending-count'),
    
    # Statistics
    path('payment-receipts/statistics/', 
         PaymentReceiptViewSet.as_view({'get': 'statistics'}), 
         name='payment-receipt-statistics'),
]

invoice_urls = [
    # Generate documents
    path('invoices/<int:pk>/generate_document/', 
         InvoiceViewSet.as_view({'post': 'generate_document'}), 
         name='invoice-generate-document'),
    
    path('invoices/<int:pk>/generate_receipt/', 
         InvoiceViewSet.as_view({'post': 'generate_receipt'}), 
         name='invoice-generate-receipt'),
    
    # Email
    path('invoices/<int:pk>/send_email/', 
         InvoiceViewSet.as_view({'post': 'send_email'}), 
         name='invoice-send-email'),
    
    # Approve
    path('invoices/<int:pk>/approve/', 
         InvoiceViewSet.as_view({'post': 'approve'}), 
         name='invoice-approve'),
    
    # Statistics
    path('invoices/statistics/', 
         InvoiceViewSet.as_view({'get': 'statistics'}), 
         name='invoice-statistics'),
]

# URL patterns
urlpatterns = [
    path('api/v1/', include(invoice_urls)),
    path('api/v1/', include(payment_receipt_urls)),
    # Include router URLs
    path('api/v1/', include(router.urls)),
    path('test-email/', test_email_view, name='test-email'),
    
    # Standalone API views
    path('api/v1/user-roles-list/', get_user_roles, name='user-roles-list'),
    
    # Role-specific dashboards
    path('api/v1/dashboard/user/', user_dashboard, name='user-dashboard'),
    # Health check
    path('health/', health_check, name='health-check'),
    
    # ML Predictions
    path('predict/delay/', predict_delay, name='predict-delay'),
    path('predict/penalty/', predict_penalty, name='predict-penalty'),
    
    # Emailings
    path('send-daily-kpi-email/', send_daily_kpi_email, name='send_daily_kpi_email'),
    path('check-daily-email-status/', check_daily_email_status, name='check_daily_email_status'),
    path('auto-send-daily-email/', auto_send_daily_email, name='auto_send_daily_email'),
    
    # Excel Import/Export endpoints
    path('api/v1/work-orders/import-excel/', import_work_orders_excel, name='import-work-orders'),
    path('api/v1/work-orders/export-excel/', export_work_orders_excel, name='export-work-orders'),
    path('api/v1/crew-monitoring/import-excel/', import_crew_monitoring_excel, name='import-crew-monitoring'),
    path('api/v1/qi-monitoring/import-excel/', import_qi_monitoring_excel, name='import-qi-monitoring'),
    
    # Bulk operations
    path('api/v1/work-orders/bulk-update/', bulk_update_work_orders, name='bulk-update-work-orders'),
    path('api/v1/work-orders/bulk-upload-documents/', bulk_upload_documents, name='bulk-upload-documents'),
    
    # Chat endpoints
    path('chat/', chat, name='chat'),
    path('chat/health/', chat_health, name='chat-health'),
    path('chat/debug/', chat_debug, name='chat-debug'),
     
    # Daily Action Email endpoints
    path('send-my-daily-email/', send_my_daily_email, name='send-my-daily-email'),
    path('send-daily-emails-to-all/', send_daily_emails_to_all, name='send-daily-emails-all'),
    path('send-daily-email/<int:user_id>/', send_daily_email_to_user, name='send-daily-email-user'),
    path('check-my-actions/', check_my_actions, name='check-my-actions'),
    path('check-daily-email-logs/', check_daily_email_logs, name='check-daily-email-logs'),
    
    # Calendar endpoints
    path('send_notifsss/', send_notifsss, name='send_notifsss'),
    path('a-calendar/events/', get_calendar_events, name='calendar-events'),
    path('a-calendar/stats/', get_calendar_stats, name='calendar-stats'),
    path('api/check-overdue-documents/', check_overdue_documents, name='check-overdue-documents'),
    path(
        'notify/work-order/<int:wo_id>/',
        notify_new_work_order_view,
        name='notify-new-work-order'
    ),

    
]


# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)