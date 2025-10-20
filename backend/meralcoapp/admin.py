from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import *


# ============================================
# USER MANAGEMENT ADMIN
# ============================================

@admin.register(UserRole)
class UserRoleAdmin(admin.ModelAdmin):
    list_display = ['role_name', 'role_description', 'created_at']
    search_fields = ['role_name']
    ordering = ['role_name']


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ['username', 'email', 'first_name', 'last_name', 'role', 'is_active', 'last_login']
    list_filter = ['role', 'is_active', 'is_staff']
    search_fields = ['username', 'email', 'first_name', 'last_name']
    ordering = ['-created_at']
    
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Additional Info', {'fields': ('role', 'phone_number')}),
    )


@admin.register(Permission)
class PermissionAdmin(admin.ModelAdmin):
    list_display = ['permission_name', 'module_name', 'permission_description']
    list_filter = ['module_name']
    search_fields = ['permission_name', 'permission_description']


@admin.register(RolePermission)
class RolePermissionAdmin(admin.ModelAdmin):
    list_display = ['role', 'permission', 'created_at']
    list_filter = ['role']
    search_fields = ['role__role_name', 'permission__permission_name']


# ============================================
# VENDOR MANAGEMENT ADMIN
# ============================================

class VendorContactInline(admin.TabularInline):
    model = VendorContact
    extra = 1


@admin.register(Vendor)
class VendorAdmin(admin.ModelAdmin):
    list_display = ['vendor_code', 'vendor_name', 'email', 'compliance_score', 
                    'is_active', 'is_blacklisted', 'created_at']
    list_filter = ['is_active', 'is_blacklisted', 'city', 'region']
    search_fields = ['vendor_code', 'vendor_name', 'email']
    ordering = ['-compliance_score']
    inlines = [VendorContactInline]
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('vendor_code', 'vendor_name', 'company_name')
        }),
        ('Contact Information', {
            'fields': ('contact_person', 'email', 'phone_number')
        }),
        ('Address', {
            'fields': ('address', 'city', 'region', 'postal_code')
        }),
        ('Business Details', {
            'fields': ('tax_id', 'compliance_score')
        }),
        ('Status', {
            'fields': ('is_active', 'is_blacklisted', 'blacklist_reason', 'blacklist_date')
        }),
    )


@admin.register(VendorPerformance)
class VendorPerformanceAdmin(admin.ModelAdmin):
    list_display = ['vendor', 'evaluation_date', 'overall_rating', 'evaluator']
    list_filter = ['evaluation_date', 'evaluator']
    search_fields = ['vendor__vendor_name']
    ordering = ['-evaluation_date']


# ============================================
# PROJECT MANAGEMENT ADMIN
# ============================================

@admin.register(Sector)
class SectorAdmin(admin.ModelAdmin):
    list_display = ['sector_code', 'sector_name', 'sector_manager', 'location', 'is_active']
    list_filter = ['is_active']
    search_fields = ['sector_code', 'sector_name', 'location']


@admin.register(ProjectStatus)
class ProjectStatusAdmin(admin.ModelAdmin):
    list_display = ['status_name', 'status_order', 'status_color', 'is_active']
    list_filter = ['is_active']
    ordering = ['status_order']


class ProjectMilestoneInline(admin.TabularInline):
    model = ProjectMilestone
    extra = 1


class ProjectTeamInline(admin.TabularInline):
    model = ProjectTeam
    extra = 1


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ['project_code', 'project_name', 'vendor', 'status', 'priority', 
                    'is_delayed', 'start_date', 'completion_date']
    list_filter = ['status', 'priority', 'risk_score', 'is_delayed', 'sector']
    search_fields = ['project_code', 'project_name', 'vendor__vendor_name']
    ordering = ['-created_at']
    inlines = [ProjectMilestoneInline, ProjectTeamInline]
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('project_code', 'project_name', 'project_type', 'project_description')
        }),
        ('Assignment', {
            'fields': ('vendor', 'sector', 'status', 'assigned_engineer', 'assigned_qi', 'wo_supervisor')
        }),
        ('Financial', {
            'fields': ('contract_value',)
        }),
        ('Timeline', {
            'fields': ('start_date', 'completion_date', 'expected_billing_date', 'actual_billing_date')
        }),
        ('Status & Risk', {
            'fields': ('priority', 'risk_score', 'is_delayed', 'delay_days')
        }),
        ('Location', {
            'fields': ('project_location',)
        }),
    )


# ============================================
# WORKFLOW MANAGEMENT ADMIN
# ============================================

@admin.register(WorkflowStage)
class WorkflowStageAdmin(admin.ModelAdmin):
    list_display = ['stage_name', 'stage_order', 'default_duration_days', 'is_active']
    list_filter = ['is_active']
    ordering = ['stage_order']


@admin.register(ProjectWorkflow)
class ProjectWorkflowAdmin(admin.ModelAdmin):
    list_display = ['project', 'stage', 'status', 'assigned_user', 'start_date', 
                    'due_date', 'is_current_stage']
    list_filter = ['status', 'stage', 'is_current_stage']
    search_fields = ['project__project_code', 'project__project_name']
    ordering = ['project', 'stage__stage_order']


# ============================================
# DOCUMENT MANAGEMENT ADMIN
# ============================================

@admin.register(DocumentType)
class DocumentTypeAdmin(admin.ModelAdmin):
    list_display = ['doc_type_name', 'is_required', 'created_at']
    list_filter = ['is_required']
    search_fields = ['doc_type_name']


@admin.register(ProjectDocument)
class ProjectDocumentAdmin(admin.ModelAdmin):
    list_display = ['document_name', 'project', 'doc_type', 'approval_status', 
                    'uploaded_by', 'upload_date']
    list_filter = ['approval_status', 'doc_type', 'is_current_version']
    search_fields = ['document_name', 'project__project_code']
    ordering = ['-upload_date']


@admin.register(DocumentCompliance)
class DocumentComplianceAdmin(admin.ModelAdmin):
    list_display = ['project', 'doc_type', 'is_submitted', 'is_approved', 
                    'is_overdue', 'due_date']
    list_filter = ['is_submitted', 'is_approved', 'is_overdue']
    search_fields = ['project__project_code']


# ============================================
# SLA MANAGEMENT ADMIN
# ============================================

@admin.register(SLARule)
class SLARuleAdmin(admin.ModelAdmin):
    list_display = ['rule_name', 'stage', 'deadline_days', 'warning_threshold_days', 'is_active']
    list_filter = ['is_active', 'stage']
    search_fields = ['rule_name']


@admin.register(SLATracking)
class SLATrackingAdmin(admin.ModelAdmin):
    list_display = ['project', 'sla_rule', 'status', 'start_date', 'due_date', 
                    'is_breached', 'breach_days']
    list_filter = ['status', 'is_breached', 'sla_rule']
    search_fields = ['project__project_code']
    ordering = ['-created_at']


# ============================================
# QUALITY INSPECTION ADMIN
# ============================================

@admin.register(InspectionType)
class InspectionTypeAdmin(admin.ModelAdmin):
    list_display = ['inspection_name', 'estimated_duration_hours', 'created_at']
    search_fields = ['inspection_name']


@admin.register(QIInspection)
class QIInspectionAdmin(admin.ModelAdmin):
    list_display = ['project', 'inspection_type', 'assigned_qi', 'scheduled_date', 
                    'inspection_result', 'is_completed']
    list_filter = ['inspection_result', 'is_completed', 'inspection_type']
    search_fields = ['project__project_code', 'assigned_qi__username']
    ordering = ['-scheduled_date']


@admin.register(QIDailyTarget)
class QIDailyTargetAdmin(admin.ModelAdmin):
    list_display = ['qi_user', 'target_date', 'target_audits', 'actual_audits', 'target_met']
    list_filter = ['target_met', 'target_date']
    search_fields = ['qi_user__username']
    ordering = ['-target_date']


@admin.register(QIPerformance)
class QIPerformanceAdmin(admin.ModelAdmin):
    list_display = ['qi_user', 'evaluation_period_start', 'evaluation_period_end', 
                    'on_time_percentage', 'quality_rating']
    list_filter = ['evaluation_period_start']
    search_fields = ['qi_user__username']
    ordering = ['-evaluation_period_end']


# ============================================
# PENALTY MANAGEMENT ADMIN
# ============================================

@admin.register(PenaltyRule)
class PenaltyRuleAdmin(admin.ModelAdmin):
    list_display = ['rule_name', 'violation_type', 'minimum_penalty', 'maximum_penalty', 'is_active']
    list_filter = ['violation_type', 'is_active']
    search_fields = ['rule_name']


@admin.register(Penalty)
class PenaltyAdmin(admin.ModelAdmin):
    list_display = ['project', 'vendor', 'penalty_rule', 'penalty_amount', 
                    'penalty_status', 'violation_date']
    list_filter = ['penalty_status', 'penalty_rule']
    search_fields = ['project__project_code', 'vendor__vendor_name']
    ordering = ['-created_at']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('project', 'vendor', 'penalty_rule', 'violation_date', 'delay_days')
        }),
        ('Penalty Details', {
            'fields': ('penalty_amount', 'penalty_status', 'issue_date', 'payment_date')
        }),
        ('Waiver Information', {
            'fields': ('waiver_reason', 'waived_by', 'waiver_date')
        }),
        ('Dispute Information', {
            'fields': ('dispute_reason', 'dispute_date', 'dispute_resolution')
        }),
        ('Approval', {
            'fields': ('created_by', 'approved_by', 'approval_date')
        }),
    )


# ============================================
# BILLING MANAGEMENT ADMIN
# ============================================

class PaymentInline(admin.TabularInline):
    model = Payment
    extra = 1


@admin.register(Invoice)
class InvoiceAdmin(admin.ModelAdmin):
    list_display = ['invoice_number', 'project', 'vendor', 'invoice_amount', 
                    'net_amount', 'payment_status', 'invoice_date']
    list_filter = ['payment_status', 'invoice_date']
    search_fields = ['invoice_number', 'project__project_code', 'vendor__vendor_name']
    ordering = ['-invoice_date']
    inlines = [PaymentInline]


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ['invoice', 'payment_amount', 'payment_date', 'payment_method', 'processed_by']
    list_filter = ['payment_method', 'payment_date']
    search_fields = ['invoice__invoice_number', 'payment_reference']
    ordering = ['-payment_date']


# ============================================
# NOTIFICATION MANAGEMENT ADMIN
# ============================================

@admin.register(NotificationTemplate)
class NotificationTemplateAdmin(admin.ModelAdmin):
    list_display = ['template_name', 'notification_type', 'is_active', 'created_at']
    list_filter = ['notification_type', 'is_active']
    search_fields = ['template_name', 'template_subject']


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ['subject', 'recipient_user', 'notification_type', 'status', 
                    'created_at', 'sent_at']
    list_filter = ['notification_type', 'status', 'created_at']
    search_fields = ['subject', 'recipient_user__username', 'recipient_email']
    ordering = ['-created_at']


# ============================================
# ESCALATION MANAGEMENT ADMIN
# ============================================

@admin.register(EscalationRule)
class EscalationRuleAdmin(admin.ModelAdmin):
    list_display = ['rule_name', 'delay_threshold_days', 'escalate_to_role', 'is_active']
    list_filter = ['is_active', 'escalate_to_role']
    search_fields = ['rule_name']


@admin.register(Escalation)
class EscalationAdmin(admin.ModelAdmin):
    list_display = ['project', 'escalation_rule', 'escalated_to_user', 'status', 
                    'escalation_date']
    list_filter = ['status', 'escalation_rule']
    search_fields = ['project__project_code', 'escalated_to_user__username']
    ordering = ['-escalation_date']


# ============================================
# ANALYTICS ADMIN
# ============================================

@admin.register(DelayFactor)
class DelayFactorAdmin(admin.ModelAdmin):
    list_display = ['factor_name', 'factor_category', 'is_active', 'created_at']
    list_filter = ['factor_category', 'is_active']
    search_fields = ['factor_name']


@admin.register(ProjectDelay)
class ProjectDelayAdmin(admin.ModelAdmin):
    list_display = ['project', 'factor', 'delay_days', 'delay_start_date', 'responsible_party']
    list_filter = ['factor', 'responsible_party']
    search_fields = ['project__project_code']
    ordering = ['-delay_start_date']


# ============================================
# VENDOR PORTAL ADMIN
# ============================================

@admin.register(VendorDispute)
class VendorDisputeAdmin(admin.ModelAdmin):
    list_display = ['vendor', 'project', 'dispute_type', 'dispute_status', 
                    'submitted_date']
    list_filter = ['dispute_status', 'dispute_type']
    search_fields = ['vendor__vendor_name', 'project__project_code', 'dispute_subject']
    ordering = ['-submitted_date']


@admin.register(VendorFeedback)
class VendorFeedbackAdmin(admin.ModelAdmin):
    list_display = ['vendor', 'feedback_type', 'rating', 'status', 'created_at']
    list_filter = ['feedback_type', 'status', 'rating']
    search_fields = ['vendor__vendor_name', 'feedback_subject']
    ordering = ['-created_at']


# ============================================
# AUDIT & CHANGE LOG ADMIN
# ============================================

@admin.register(ChangeLog)
class ChangeLogAdmin(admin.ModelAdmin):
    list_display = ['table_name', 'record_id', 'change_type', 'changed_by', 'created_at']
    list_filter = ['table_name', 'change_type', 'created_at']
    search_fields = ['table_name', 'field_name']
    ordering = ['-created_at']
    readonly_fields = ['table_name', 'record_id', 'change_type', 'field_name', 
                      'old_value', 'new_value', 'changed_by', 'created_at']


@admin.register(SystemAuditLog)
class SystemAuditLogAdmin(admin.ModelAdmin):
    list_display = ['user', 'action_type', 'entity_type', 'status', 'created_at']
    list_filter = ['action_type', 'status', 'entity_type', 'created_at']
    search_fields = ['user__username', 'action_description']
    ordering = ['-created_at']
    readonly_fields = ['user', 'action_type', 'action_description', 'entity_type', 
                      'entity_id', 'ip_address', 'user_agent', 'status', 'created_at']


# ============================================
# SYSTEM CONFIGURATION ADMIN
# ============================================

@admin.register(SystemSetting)
class SystemSettingAdmin(admin.ModelAdmin):
    list_display = ['setting_key', 'setting_type', 'is_editable', 'updated_at']
    list_filter = ['setting_type', 'is_editable']
    search_fields = ['setting_key', 'setting_description']
    ordering = ['setting_key']