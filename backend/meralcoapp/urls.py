# ============================================
# APP urls.py (your_app/urls.py)
# ============================================

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import *

router = DefaultRouter()

# User Management Routes
router.register(r'user-roles', UserRoleViewSet, basename='user-role')
router.register(r'permissions', PermissionViewSet, basename='permission')
router.register(r'role-permissions', RolePermissionViewSet, basename='role-permission')
router.register(r'users', UserViewSet, basename='user')
router.register(r'user-sessions', UserSessionViewSet, basename='user-session')

# Vendor Management Routes
router.register(r'vendors', VendorViewSet, basename='vendor')
router.register(r'vendor-contacts', VendorContactViewSet, basename='vendor-contact')
router.register(r'vendor-performance', VendorPerformanceViewSet, basename='vendor-performance')

# Project Management Routes
router.register(r'sectors', SectorViewSet, basename='sector')
router.register(r'project-statuses', ProjectStatusViewSet, basename='project-status')
router.register(r'projects', ProjectViewSet, basename='project')
router.register(r'project-milestones', ProjectMilestoneViewSet, basename='project-milestone')
router.register(r'project-team', ProjectTeamViewSet, basename='project-team')

# Workflow Management Routes
router.register(r'workflow-stages', WorkflowStageViewSet, basename='workflow-stage')
router.register(r'project-workflows', ProjectWorkflowViewSet, basename='project-workflow')

# Document Management Routes
router.register(r'document-types', DocumentTypeViewSet, basename='document-type')
router.register(r'project-documents', ProjectDocumentViewSet, basename='project-document')
router.register(r'document-compliance', DocumentComplianceViewSet, basename='document-compliance')

# SLA Management Routes
router.register(r'sla-rules', SLARuleViewSet, basename='sla-rule')
router.register(r'sla-tracking', SLATrackingViewSet, basename='sla-tracking')

# Quality Inspection Routes
router.register(r'inspection-types', InspectionTypeViewSet, basename='inspection-type')
router.register(r'qi-inspections', QIInspectionViewSet, basename='qi-inspection')
router.register(r'qi-daily-targets', QIDailyTargetViewSet, basename='qi-daily-target')
router.register(r'qi-performance', QIPerformanceViewSet, basename='qi-performance')

# Penalty Management Routes
router.register(r'penalty-rules', PenaltyRuleViewSet, basename='penalty-rule')
router.register(r'penalties', PenaltyViewSet, basename='penalty')

# Billing Management Routes
router.register(r'invoices', InvoiceViewSet, basename='invoice')
router.register(r'payments', PaymentViewSet, basename='payment')

# Notification Management Routes
router.register(r'notification-templates', NotificationTemplateViewSet, basename='notification-template')
router.register(r'notifications', NotificationViewSet, basename='notification')

# Escalation Management Routes
router.register(r'escalation-rules', EscalationRuleViewSet, basename='escalation-rule')
router.register(r'escalations', EscalationViewSet, basename='escalation')

# Analytics Routes
router.register(r'delay-factors', DelayFactorViewSet, basename='delay-factor')
router.register(r'project-delays', ProjectDelayViewSet, basename='project-delay')

# Vendor Portal Routes
router.register(r'vendor-disputes', VendorDisputeViewSet, basename='vendor-dispute')
router.register(r'vendor-feedback', VendorFeedbackViewSet, basename='vendor-feedback')

# Audit Routes
router.register(r'change-logs', ChangeLogViewSet, basename='change-log')
router.register(r'audit-logs', SystemAuditLogViewSet, basename='audit-log')

# System Configuration Routes
router.register(r'system-settings', SystemSettingViewSet, basename='system-setting')

# Dashboard Routes
router.register(r'dashboard', DashboardViewSet, basename='dashboard')

app_name = 'api'

urlpatterns = [
    path('', include(router.urls)),
]
