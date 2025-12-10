from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import *

# Create router
router = DefaultRouter()

# Authentication
router.register(r'auth', AuthViewSet, basename='auth')

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

# URL patterns
urlpatterns = [
    # Include router URLs
    path('api/v1/', include(router.urls)),
    
    # Standalone API views
    path('api/v1/user-roles-list/', get_user_roles, name='user-roles-list'),
    
    # Health check
    path('health/', health_check, name='health-check'),
    
    # ML Predictions
    path('predict/delay/', predict_delay, name='predict-delay'),
    path('predict/penalty/', predict_penalty, name='predict-penalty'),
    
    # Chat endpoints
    path('chat/', chat, name='chat'),
    path('chat/health/', chat_health, name='chat-health'),
    path('chat/debug/', chat_debug, name='chat-debug'),
]