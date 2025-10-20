from rest_framework import serializers
from django.utils import timezone
from .models import *


# ============================================
# USER MANAGEMENT SERIALIZERS
# ============================================

class UserRoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserRole
        fields = '__all__'


class PermissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Permission
        fields = '__all__'


class RolePermissionSerializer(serializers.ModelSerializer):
    permission_details = PermissionSerializer(source='permission', read_only=True)
    role_name = serializers.CharField(source='role.role_name', read_only=True)
    
    class Meta:
        model = RolePermission
        fields = '__all__'


class UserSerializer(serializers.ModelSerializer):
    role_name = serializers.CharField(source='role.role_name', read_only=True)
    full_name = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['user_id', 'username', 'email', 'first_name', 'last_name', 'full_name',
                  'role', 'role_name', 'phone_number', 'is_active', 'last_login',
                  'created_at', 'updated_at']
        extra_kwargs = {
            'password': {'write_only': True}
        }
    
    def get_full_name(self, obj):
        return obj.get_full_name()


class UserSessionSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = UserSession
        fields = '__all__'


# ============================================
# VENDOR MANAGEMENT SERIALIZERS
# ============================================

class VendorContactSerializer(serializers.ModelSerializer):
    class Meta:
        model = VendorContact
        fields = '__all__'


class VendorPerformanceSerializer(serializers.ModelSerializer):
    evaluator_name = serializers.CharField(source='evaluator.get_full_name', read_only=True)
    
    class Meta:
        model = VendorPerformance
        fields = '__all__'


class VendorSerializer(serializers.ModelSerializer):
    contacts = VendorContactSerializer(many=True, read_only=True)
    project_count = serializers.SerializerMethodField()
    active_projects = serializers.SerializerMethodField()
    
    class Meta:
        model = Vendor
        fields = '__all__'
    
    def get_project_count(self, obj):
        return obj.projects.count()
    
    def get_active_projects(self, obj):
        return obj.projects.exclude(status__status_name__in=['Completed', 'Cancelled', 'Billed']).count()


class VendorListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for list views"""
    class Meta:
        model = Vendor
        fields = ['id', 'vendor_code', 'vendor_name', 'email', 'phone_number', 
                  'compliance_score', 'is_active', 'is_blacklisted']


# ============================================
# PROJECT MANAGEMENT SERIALIZERS
# ============================================

class SectorSerializer(serializers.ModelSerializer):
    sector_manager_name = serializers.CharField(source='sector_manager.get_full_name', read_only=True)
    project_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Sector
        fields = '__all__'
    
    def get_project_count(self, obj):
        return obj.projects.count()


class ProjectStatusSerializer(serializers.ModelSerializer):
    project_count = serializers.SerializerMethodField()
    
    class Meta:
        model = ProjectStatus
        fields = '__all__'
    
    def get_project_count(self, obj):
        return obj.projects.count()


class ProjectMilestoneSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectMilestone
        fields = '__all__'


class ProjectTeamSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    user_email = serializers.EmailField(source='user.email', read_only=True)
    
    class Meta:
        model = ProjectTeam
        fields = '__all__'


class ProjectSerializer(serializers.ModelSerializer):
    vendor_name = serializers.CharField(source='vendor.vendor_name', read_only=True)
    sector_name = serializers.CharField(source='sector.sector_name', read_only=True)
    status_name = serializers.CharField(source='status.status_name', read_only=True)
    status_color = serializers.CharField(source='status.status_color', read_only=True)
    assigned_engineer_name = serializers.CharField(source='assigned_engineer.get_full_name', read_only=True)
    assigned_qi_name = serializers.CharField(source='assigned_qi.get_full_name', read_only=True)
    wo_supervisor_name = serializers.CharField(source='wo_supervisor.get_full_name', read_only=True)
    milestones = ProjectMilestoneSerializer(many=True, read_only=True)
    team_members = ProjectTeamSerializer(many=True, read_only=True)
    
    class Meta:
        model = Project
        fields = '__all__'


class ProjectListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for list views"""
    vendor_name = serializers.CharField(source='vendor.vendor_name', read_only=True)
    status_name = serializers.CharField(source='status.status_name', read_only=True)
    status_color = serializers.CharField(source='status.status_color', read_only=True)
    
    class Meta:
        model = Project
        fields = ['id', 'project_code', 'project_name', 'vendor', 'vendor_name',
                  'status', 'status_name', 'status_color', 'start_date', 
                  'completion_date', 'is_delayed', 'delay_days', 'priority', 'risk_score']


# ============================================
# WORKFLOW MANAGEMENT SERIALIZERS
# ============================================

class WorkflowStageSerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkflowStage
        fields = '__all__'


class ProjectWorkflowSerializer(serializers.ModelSerializer):
    project_code = serializers.CharField(source='project.project_code', read_only=True)
    project_name = serializers.CharField(source='project.project_name', read_only=True)
    stage_name = serializers.CharField(source='stage.stage_name', read_only=True)
    stage_order = serializers.IntegerField(source='stage.stage_order', read_only=True)
    assigned_user_name = serializers.CharField(source='assigned_user.get_full_name', read_only=True)
    days_in_stage = serializers.SerializerMethodField()
    
    class Meta:
        model = ProjectWorkflow
        fields = '__all__'
    
    def get_days_in_stage(self, obj):
        if obj.completion_date and obj.start_date:
            return (obj.completion_date - obj.start_date).days
        elif obj.start_date:
            return (timezone.now() - obj.start_date).days
        return None


# ============================================
# DOCUMENT MANAGEMENT SERIALIZERS
# ============================================

class DocumentTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = DocumentType
        fields = '__all__'


class ProjectDocumentSerializer(serializers.ModelSerializer):
    project_code = serializers.CharField(source='project.project_code', read_only=True)
    doc_type_name = serializers.CharField(source='doc_type.doc_type_name', read_only=True)
    uploaded_by_name = serializers.CharField(source='uploaded_by.get_full_name', read_only=True)
    approved_by_name = serializers.CharField(source='approved_by.get_full_name', read_only=True)
    file_size_mb = serializers.SerializerMethodField()
    
    class Meta:
        model = ProjectDocument
        fields = '__all__'
    
    def get_file_size_mb(self, obj):
        if obj.file_size:
            return round(obj.file_size / (1024 * 1024), 2)
        return None


class DocumentComplianceSerializer(serializers.ModelSerializer):
    project_code = serializers.CharField(source='project.project_code', read_only=True)
    doc_type_name = serializers.CharField(source='doc_type.doc_type_name', read_only=True)
    is_required = serializers.BooleanField(source='doc_type.is_required', read_only=True)
    
    class Meta:
        model = DocumentCompliance
        fields = '__all__'


# ============================================
# SLA MANAGEMENT SERIALIZERS
# ============================================

class SLARuleSerializer(serializers.ModelSerializer):
    stage_name = serializers.CharField(source='stage.stage_name', read_only=True)
    
    class Meta:
        model = SLARule
        fields = '__all__'


class SLATrackingSerializer(serializers.ModelSerializer):
    project_code = serializers.CharField(source='project.project_code', read_only=True)
    project_name = serializers.CharField(source='project.project_name', read_only=True)
    vendor_name = serializers.CharField(source='project.vendor.vendor_name', read_only=True)
    rule_name = serializers.CharField(source='sla_rule.rule_name', read_only=True)
    waived_by_name = serializers.CharField(source='waived_by.get_full_name', read_only=True)
    days_remaining = serializers.SerializerMethodField()
    
    class Meta:
        model = SLATracking
        fields = '__all__'
    
    def get_days_remaining(self, obj):
        if obj.completion_date is None and obj.due_date:
            from datetime import date
            remaining = (obj.due_date - date.today()).days
            return remaining
        return None


# ============================================
# QUALITY INSPECTION SERIALIZERS
# ============================================

class InspectionTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = InspectionType
        fields = '__all__'


class QIInspectionSerializer(serializers.ModelSerializer):
    project_code = serializers.CharField(source='project.project_code', read_only=True)
    project_name = serializers.CharField(source='project.project_name', read_only=True)
    vendor_name = serializers.CharField(source='project.vendor.vendor_name', read_only=True)
    inspection_type_name = serializers.CharField(source='inspection_type.inspection_name', read_only=True)
    assigned_qi_name = serializers.CharField(source='assigned_qi.get_full_name', read_only=True)
    is_overdue = serializers.SerializerMethodField()
    
    class Meta:
        model = QIInspection
        fields = '__all__'
    
    def get_is_overdue(self, obj):
        if not obj.is_completed and obj.scheduled_date:
            from datetime import date
            return obj.scheduled_date < date.today()
        return False


class QIDailyTargetSerializer(serializers.ModelSerializer):
    qi_name = serializers.CharField(source='qi_user.get_full_name', read_only=True)
    achievement_percentage = serializers.SerializerMethodField()
    
    class Meta:
        model = QIDailyTarget
        fields = '__all__'
    
    def get_achievement_percentage(self, obj):
        if obj.target_audits > 0:
            return round((obj.actual_audits / obj.target_audits) * 100, 2)
        return 0


class QIPerformanceSerializer(serializers.ModelSerializer):
    qi_name = serializers.CharField(source='qi_user.get_full_name', read_only=True)
    target_achievement_rate = serializers.SerializerMethodField()
    
    class Meta:
        model = QIPerformance
        fields = '__all__'
    
    def get_target_achievement_rate(self, obj):
        total_targets = obj.targets_met + obj.targets_missed
        if total_targets > 0:
            return round((obj.targets_met / total_targets) * 100, 2)
        return 0


# ============================================
# PENALTY MANAGEMENT SERIALIZERS
# ============================================

class PenaltyRuleSerializer(serializers.ModelSerializer):
    class Meta:
        model = PenaltyRule
        fields = '__all__'


class PenaltySerializer(serializers.ModelSerializer):
    project_code = serializers.CharField(source='project.project_code', read_only=True)
    project_name = serializers.CharField(source='project.project_name', read_only=True)
    vendor_name = serializers.CharField(source='vendor.vendor_name', read_only=True)
    rule_name = serializers.CharField(source='penalty_rule.rule_name', read_only=True)
    violation_type = serializers.CharField(source='penalty_rule.violation_type', read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    approved_by_name = serializers.CharField(source='approved_by.get_full_name', read_only=True)
    waived_by_name = serializers.CharField(source='waived_by.get_full_name', read_only=True)
    
    class Meta:
        model = Penalty
        fields = '__all__'


# ============================================
# BILLING MANAGEMENT SERIALIZERS
# ============================================

class PaymentSerializer(serializers.ModelSerializer):
    invoice_number = serializers.CharField(source='invoice.invoice_number', read_only=True)
    processed_by_name = serializers.CharField(source='processed_by.get_full_name', read_only=True)
    
    class Meta:
        model = Payment
        fields = '__all__'


class InvoiceSerializer(serializers.ModelSerializer):
    project_code = serializers.CharField(source='project.project_code', read_only=True)
    project_name = serializers.CharField(source='project.project_name', read_only=True)
    vendor_name = serializers.CharField(source='vendor.vendor_name', read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    approved_by_name = serializers.CharField(source='approved_by.get_full_name', read_only=True)
    payments = PaymentSerializer(many=True, read_only=True)
    total_paid = serializers.SerializerMethodField()
    outstanding_amount = serializers.SerializerMethodField()
    is_overdue = serializers.SerializerMethodField()
    
    class Meta:
        model = Invoice
        fields = '__all__'
    
    def get_total_paid(self, obj):
        return sum(payment.payment_amount for payment in obj.payments.all())
    
    def get_outstanding_amount(self, obj):
        total_paid = self.get_total_paid(obj)
        return obj.net_amount - total_paid
    
    def get_is_overdue(self, obj):
        if obj.payment_status != 'Paid' and obj.due_date:
            from datetime import date
            return obj.due_date < date.today()
        return False


# ============================================
# NOTIFICATION MANAGEMENT SERIALIZERS
# ============================================

class NotificationTemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = NotificationTemplate
        fields = '__all__'


class NotificationSerializer(serializers.ModelSerializer):
    recipient_name = serializers.CharField(source='recipient_user.get_full_name', read_only=True)
    project_code = serializers.CharField(source='related_project.project_code', read_only=True)
    
    class Meta:
        model = Notification
        fields = '__all__'


# ============================================
# ESCALATION MANAGEMENT SERIALIZERS
# ============================================

class EscalationRuleSerializer(serializers.ModelSerializer):
    escalate_to_role_name = serializers.CharField(source='escalate_to_role.role_name', read_only=True)
    template_name = serializers.CharField(source='notification_template.template_name', read_only=True)
    
    class Meta:
        model = EscalationRule
        fields = '__all__'


class EscalationSerializer(serializers.ModelSerializer):
    project_code = serializers.CharField(source='project.project_code', read_only=True)
    project_name = serializers.CharField(source='project.project_name', read_only=True)
    rule_name = serializers.CharField(source='escalation_rule.rule_name', read_only=True)
    escalated_from_name = serializers.CharField(source='escalated_from_user.get_full_name', read_only=True)
    escalated_to_name = serializers.CharField(source='escalated_to_user.get_full_name', read_only=True)
    resolved_by_name = serializers.CharField(source='resolved_by.get_full_name', read_only=True)
    
    class Meta:
        model = Escalation
        fields = '__all__'


# ============================================
# ANALYTICS SERIALIZERS
# ============================================

class DelayFactorSerializer(serializers.ModelSerializer):
    occurrence_count = serializers.SerializerMethodField()
    
    class Meta:
        model = DelayFactor
        fields = '__all__'
    
    def get_occurrence_count(self, obj):
        return obj.project_delays.count()


class ProjectDelaySerializer(serializers.ModelSerializer):
    project_code = serializers.CharField(source='project.project_code', read_only=True)
    project_name = serializers.CharField(source='project.project_name', read_only=True)
    factor_name = serializers.CharField(source='factor.factor_name', read_only=True)
    factor_category = serializers.CharField(source='factor.factor_category', read_only=True)
    reported_by_name = serializers.CharField(source='reported_by.get_full_name', read_only=True)
    
    class Meta:
        model = ProjectDelay
        fields = '__all__'


# ============================================
# VENDOR PORTAL SERIALIZERS
# ============================================

class VendorDisputeSerializer(serializers.ModelSerializer):
    vendor_name = serializers.CharField(source='vendor.vendor_name', read_only=True)
    project_code = serializers.CharField(source='project.project_code', read_only=True)
    penalty_amount = serializers.DecimalField(source='related_penalty.penalty_amount', 
                                               max_digits=15, decimal_places=2, read_only=True)
    assigned_to_name = serializers.CharField(source='assigned_to.get_full_name', read_only=True)
    resolved_by_name = serializers.CharField(source='resolved_by.get_full_name', read_only=True)
    
    class Meta:
        model = VendorDispute
        fields = '__all__'


class VendorFeedbackSerializer(serializers.ModelSerializer):
    vendor_name = serializers.CharField(source='vendor.vendor_name', read_only=True)
    reviewed_by_name = serializers.CharField(source='reviewed_by.get_full_name', read_only=True)
    
    class Meta:
        model = VendorFeedback
        fields = '__all__'


# ============================================
# AUDIT & CHANGE LOG SERIALIZERS
# ============================================

class ChangeLogSerializer(serializers.ModelSerializer):
    changed_by_name = serializers.CharField(source='changed_by.get_full_name', read_only=True)
    
    class Meta:
        model = ChangeLog
        fields = '__all__'


class SystemAuditLogSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    
    class Meta:
        model = SystemAuditLog
        fields = '__all__'


# ============================================
# SYSTEM CONFIGURATION SERIALIZERS
# ============================================

class SystemSettingSerializer(serializers.ModelSerializer):
    class Meta:
        model = SystemSetting
        fields = '__all__'


# ============================================
# DASHBOARD & ANALYTICS SERIALIZERS
# ============================================

class DashboardStatsSerializer(serializers.Serializer):
    """Serializer for dashboard statistics"""
    total_projects = serializers.IntegerField()
    active_projects = serializers.IntegerField()
    delayed_projects = serializers.IntegerField()
    completed_projects = serializers.IntegerField()
    total_vendors = serializers.IntegerField()
    active_vendors = serializers.IntegerField()
    blacklisted_vendors = serializers.IntegerField()
    pending_inspections = serializers.IntegerField()
    overdue_documents = serializers.IntegerField()
    sla_breaches = serializers.IntegerField()
    total_penalties = serializers.DecimalField(max_digits=15, decimal_places=2)
    pending_invoices = serializers.IntegerField()


class ProjectStatusSummarySerializer(serializers.Serializer):
    """Serializer for project status summary"""
    status_name = serializers.CharField()
    project_count = serializers.IntegerField()
    percentage = serializers.DecimalField(max_digits=5, decimal_places=2)


class VendorPerformanceSummarySerializer(serializers.Serializer):
    """Serializer for vendor performance summary"""
    id = serializers.IntegerField()
    vendor_code = serializers.CharField()
    vendor_name = serializers.CharField()
    compliance_score = serializers.DecimalField(max_digits=5, decimal_places=2)
    total_projects = serializers.IntegerField()
    delayed_projects = serializers.IntegerField()
    on_time_percentage = serializers.DecimalField(max_digits=5, decimal_places=2)
    total_penalties = serializers.DecimalField(max_digits=15, decimal_places=2)
    sla_breaches = serializers.IntegerField()


class DelayAnalysisSerializer(serializers.Serializer):
    """Serializer for delay analysis"""
    factor__factor_name = serializers.CharField()
    factor__factor_category = serializers.CharField()
    occurrence_count = serializers.IntegerField()
    total_delay_days = serializers.IntegerField()
    avg_delay_days = serializers.DecimalField(max_digits=10, decimal_places=2)