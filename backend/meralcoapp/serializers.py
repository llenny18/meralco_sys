from rest_framework import serializers
from django.utils import timezone
from django.contrib.auth import authenticate
from django.contrib.auth.hashers import make_password
from django.db.models import Sum
from datetime import date, datetime
from .models import *


# ============================================
# AUTHENTICATION SERIALIZERS
# ============================================

class LoginSerializer(serializers.Serializer):
    username = serializers.CharField(required=True)
    password = serializers.CharField(required=True, write_only=True)
    user_type = serializers.CharField(required=True)

    def validate(self, attrs):
        username = attrs.get('username')
        password = attrs.get('password')
        user_type = attrs.get('user_type')

        if username and password:
            user = authenticate(username=username, password=password)
            
            if not user:
                raise serializers.ValidationError('Invalid credentials.')
            
            if not user.is_active:
                raise serializers.ValidationError('User account is disabled.')
            
            if user.role and user.role.role_name != user_type:
                raise serializers.ValidationError('User type mismatch.')
            
            attrs['user'] = user
            return attrs
        else:
            raise serializers.ValidationError('Must include "username" and "password".')


class UserLoginResponseSerializer(serializers.ModelSerializer):
    role_name = serializers.CharField(source='role.role_name', read_only=True)
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['user_id', 'username', 'email', 'first_name', 'last_name', 
                  'full_name', 'role', 'role_name', 'phone_number']

    def get_full_name(self, obj):
        return obj.get_full_name()


class LogoutSerializer(serializers.Serializer):
    pass


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True, write_only=True)
    new_password = serializers.CharField(required=True, write_only=True)
    confirm_password = serializers.CharField(required=True, write_only=True)

    def validate(self, attrs):
        if attrs['new_password'] != attrs['confirm_password']:
            raise serializers.ValidationError("New passwords don't match.")
        
        if len(attrs['new_password']) < 6:
            raise serializers.ValidationError("Password must be at least 6 characters long.")
        
        return attrs


class RegisterUserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True)
    confirm_password = serializers.CharField(write_only=True, required=True)
    role_name = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'first_name', 'last_name', 'password', 
                  'confirm_password', 'role_name', 'phone_number']

    def validate(self, attrs):
        if attrs['password'] != attrs['confirm_password']:
            raise serializers.ValidationError("Passwords don't match.")
        
        if len(attrs['password']) < 6:
            raise serializers.ValidationError("Password must be at least 6 characters long.")
        
        role_name = attrs.pop('role_name')
        try:
            role = UserRole.objects.get(role_name=role_name)
            attrs['role'] = role
        except UserRole.DoesNotExist:
            raise serializers.ValidationError("Invalid role specified.")
        
        attrs.pop('confirm_password')
        return attrs

    def create(self, validated_data):
        user = User.objects.create(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            role=validated_data.get('role'),
            phone_number=validated_data.get('phone_number', '')
        )
        user.set_password(validated_data['password'])
        user.save()
        return user


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
                  'role', 'role_name', 'phone_number', 'password', 'is_active', 'last_login',
                  'created_at', 'updated_at']
        extra_kwargs = {
            'password': {'write_only': True},
            'last_login': {'read_only': True},
            'created_at': {'read_only': True},
            'updated_at': {'read_only': True},
        }
    
    def get_full_name(self, obj):
        return obj.get_full_name()
    
    def create(self, validated_data):
        validated_data['password'] = make_password(validated_data['password'])
        return super().create(validated_data)
    
    def update(self, instance, validated_data):
        if 'password' in validated_data:
            validated_data['password'] = make_password(validated_data['password'])
        
        validated_data.pop('last_login', None)
        validated_data.pop('created_at', None)
        validated_data.pop('updated_at', None)
        validated_data.pop('date_joined', None)
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        instance.save(update_fields=list(validated_data.keys()))
        
        return instance


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
        fields = ['vendor_id', 'vendor_code', 'vendor_name', 'email', 'phone_number', 
                  'compliance_score', 'is_active', 'is_blacklisted']


class VendorBasicSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vendor
        fields = ['vendor_id', 'vendor_code', 'vendor_name', 'email', 'phone_number']


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
        fields = ['project_id', 'project_code', 'project_name', 'vendor', 'vendor_name',
                  'status', 'status_name', 'status_color', 'start_date', 'contract_value', 
                  'completion_date', 'is_delayed', 'delay_days', 'priority', 'risk_score']


class ProjectValidationListSerializer(serializers.ModelSerializer):
    """Serializer for projects awaiting document validation"""
    vendor_info = VendorBasicSerializer(source='vendor', read_only=True)
    document_count = serializers.SerializerMethodField()
    pending_documents = serializers.SerializerMethodField()
    approved_documents = serializers.SerializerMethodField()
    rejected_documents = serializers.SerializerMethodField()
    
    class Meta:
        model = Project
        fields = [
            'project_id', 'project_code', 'project_name', 'project_location',
            'completion_date', 'vendor_info', 'document_count',
            'pending_documents', 'approved_documents', 'rejected_documents',
            'status'
        ]
    
    def get_document_count(self, obj):
        return obj.documents.count()
    
    def get_pending_documents(self, obj):
        return obj.documents.filter(approval_status='Pending').count()
    
    def get_approved_documents(self, obj):
        return obj.documents.filter(approval_status='Approved').count()
    
    def get_rejected_documents(self, obj):
        return obj.documents.filter(approval_status='Rejected').count()


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


class ProjectDocumentListSerializer(serializers.ModelSerializer):
    """Serializer for listing documents with validation info"""
    doc_type_name = serializers.CharField(source='doc_type.doc_type_name', read_only=True)
    uploaded_by_name = serializers.SerializerMethodField()
    
    class Meta:
        model = ProjectDocument
        fields = [
            'document_id', 'document_name', 'doc_type', 'doc_type_name',
            'file_size', 'file_type', 'upload_date', 'approval_status',
            'approval_date', 'rejection_reason', 'uploaded_by_name',
            'document_path', 'notes'
        ]
    
    def get_uploaded_by_name(self, obj):
        if obj.uploaded_by:
            return obj.uploaded_by.get_full_name()
        return None


class ProjectDocumentValidationSerializer(serializers.ModelSerializer):
    """Serializer for validating/updating documents"""
    
    class Meta:
        model = ProjectDocument
        fields = ['approval_status', 'approval_date', 'rejection_reason', 'approved_by']
        read_only_fields = ['approved_by']
    
    def update(self, instance, validated_data):
        if 'approval_status' in validated_data:
            request = self.context.get('request')
            if request and request.user:
                validated_data['approved_by'] = request.user
        
        return super().update(instance, validated_data)


class DocumentComplianceSerializer(serializers.ModelSerializer):
    project_code = serializers.CharField(source='project.project_code', read_only=True)
    doc_type_name = serializers.CharField(source='doc_type.doc_type_name', read_only=True)
    is_required = serializers.BooleanField(source='doc_type.is_required', read_only=True)
    
    class Meta:
        model = DocumentCompliance
        fields = '__all__'


class DocumentValidationStatsSerializer(serializers.Serializer):
    """Serializer for validation statistics"""
    pending_validation = serializers.IntegerField()
    validated_today = serializers.IntegerField()
    issues_found = serializers.IntegerField()
    total_documents = serializers.IntegerField()


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


class QIInspectionPhotoSerializer(serializers.ModelSerializer):
    class Meta:
        model = QIInspectionPhoto
        fields = '__all__'
        read_only_fields = ('photo_id', 'uploaded_at', 'created_at')


class QIInspectionCorrectionPhotoSerializer(serializers.ModelSerializer):
    photo_url = serializers.SerializerMethodField()
    
    class Meta:
        model = QIInspectionCorrectionPhoto
        fields = [
            'photo_id',
            'inspection',
            'photo_file',
            'photo_url',
            'caption',
            'uploaded_by',
            'uploaded_at'
        ]
        read_only_fields = ['photo_id', 'uploaded_at']
    
    def get_photo_url(self, obj):
        if obj.photo_file:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.photo_file.url)
        return None


class QIInspectionCorrectionSerializer(serializers.Serializer):
    """Serializer for submitting corrections"""
    correction_notes = serializers.CharField(required=True)
    corrective_photos = serializers.ListField(
        child=serializers.ImageField(),
        required=False,
        allow_empty=True
    )


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


class QIWeeklyAccomplishmentSerializer(serializers.ModelSerializer):
    qi_name = serializers.CharField(source='qi_user.get_full_name', read_only=True)
    
    class Meta:
        model = QIWeeklyAccomplishment
        fields = '__all__'
        read_only_fields = ['total_inspections', 'target_met', 'created_at', 'updated_at']


class QIMonthlyAccomplishmentSerializer(serializers.ModelSerializer):
    qi_name = serializers.CharField(source='qi_user.get_full_name', read_only=True)
    month_display = serializers.SerializerMethodField()
    
    class Meta:
        model = QIMonthlyAccomplishment
        fields = '__all__'
        read_only_fields = ['total_inspections', 'target_met', 
                           'achievement_percentage', 'created_at', 'updated_at']
    
    def get_month_display(self, obj):
        return obj.month.strftime('%B %Y')


# ============================================
# INSPECTION CHECKLIST & FLAGS SERIALIZERS
# ============================================

class InspectionChecklistItemSerializer(serializers.ModelSerializer):
    checked_by_name = serializers.SerializerMethodField()
    
    class Meta:
        model = InspectionChecklistItem
        fields = [
            'id',
            'inspection',
            'item_name',
            'item_category',
            'item_order',
            'status',
            'notes',
            'photos',
            'checked_at',
            'checked_by',
            'checked_by_name',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']
    
    def get_checked_by_name(self, obj):
        if obj.checked_by:
            return f"{obj.checked_by.first_name} {obj.checked_by.last_name}".strip() or obj.checked_by.username
        return None


class InspectionFlagSerializer(serializers.ModelSerializer):
    inspection_code = serializers.CharField(source='inspection.inspection_id', read_only=True)
    project_code = serializers.CharField(source='inspection.project.project_code', read_only=True)
    reviewed_by_name = serializers.SerializerMethodField()
    failed_items = serializers.SerializerMethodField()
    
    class Meta:
        model = InspectionFlag
        fields = [
            'id',
            'inspection',
            'inspection_code',
            'project_code',
            'flag_type',
            'item_count',
            'requires_action',
            'status',
            'ai_suggestions',
            'created_at',
            'reviewed_at',
            'reviewed_by',
            'reviewed_by_name',
            'failed_items'
        ]
        read_only_fields = ['created_at']
    
    def get_reviewed_by_name(self, obj):
        if obj.reviewed_by:
            return f"{obj.reviewed_by.first_name} {obj.reviewed_by.last_name}".strip() or obj.reviewed_by.username
        return None
    
    def get_failed_items(self, obj):
        """Get the actual failed checklist items"""
        items = InspectionChecklistItem.objects.filter(
            inspection=obj.inspection,
            status='FAIL'
        )
        return InspectionChecklistItemSerializer(items, many=True).data


# ============================================
# DEFECT REPORT SERIALIZERS
# ============================================

class DefectCorrectionHistorySerializer(serializers.ModelSerializer):
    action_by_name = serializers.SerializerMethodField()
    
    class Meta:
        model = DefectCorrectionHistory
        fields = [
            'id',
            'defect',
            'action',
            'action_by',
            'action_by_name',
            'action_at',
            'notes',
            'photos'
        ]
    
    def get_action_by_name(self, obj):
        if obj.action_by:
            return f"{obj.action_by.first_name} {obj.action_by.last_name}".strip() or obj.action_by.username
        return None


class DefectReportSerializer(serializers.ModelSerializer):
    created_by_name = serializers.SerializerMethodField()
    reviewed_by_name = serializers.SerializerMethodField()
    correction_submitted_by_name = serializers.SerializerMethodField()
    project_code = serializers.CharField(source='project.project_code', read_only=True)
    vendor_name = serializers.CharField(source='project.vendor.vendor_name', read_only=True)
    inspection_date = serializers.DateField(source='inspection.inspection_date', read_only=True)
    correction_history = DefectCorrectionHistorySerializer(many=True, read_only=True)
    days_overdue = serializers.SerializerMethodField()
    
    class Meta:
        model = DefectReport
        fields = [
            'defect_id',
            'inspection',
            'project',
            'project_code',
            'vendor_name',
            'inspection_date',
            'defect_type',
            'defect_category',
            'severity',
            'description',
            'related_checklist_items',
            'photos',
            'location_gps',
            'qi_notes',
            'qi_signature',
            'created_by',
            'created_by_name',
            'created_at',
            'correction_status',
            'correction_due_date',
            'correction_photos',
            'correction_notes',
            'correction_submitted_at',
            'correction_submitted_by',
            'correction_submitted_by_name',
            'failure_count',
            'reviewed_by',
            'reviewed_by_name',
            'reviewed_at',
            'review_notes',
            'is_escalated',
            'escalated_at',
            'escalation_reason',
            'correction_history',
            'days_overdue'
        ]
        read_only_fields = ['defect_id', 'created_at', 'failure_count']
    
    def get_created_by_name(self, obj):
        if obj.created_by:
            return f"{obj.created_by.first_name} {obj.created_by.last_name}".strip() or obj.created_by.username
        return None
    
    def get_reviewed_by_name(self, obj):
        if obj.reviewed_by:
            return f"{obj.reviewed_by.first_name} {obj.reviewed_by.last_name}".strip() or obj.reviewed_by.username
        return None
    
    def get_correction_submitted_by_name(self, obj):
        if obj.correction_submitted_by:
            return f"{obj.correction_submitted_by.first_name} {obj.correction_submitted_by.last_name}".strip() or obj.correction_submitted_by.username
        return None
    
    def get_days_overdue(self, obj):
        if obj.correction_due_date and obj.correction_status not in ['APPROVED', 'CLOSED']:
            delta = date.today() - obj.correction_due_date
            return delta.days if delta.days > 0 else 0
        return 0


class DefectReportCreateSerializer(serializers.ModelSerializer):
    """Serializer for QI to create defect reports"""
    
    class Meta:
        model = DefectReport
        fields = [
            'inspection',
            'project',
            'defect_type',
            'defect_category',
            'severity',
            'description',
            'related_checklist_items',
            'photos',
            'location_gps',
            'qi_notes',
            'qi_signature',
            'correction_due_date'
        ]
    
    def validate_qi_signature(self, value):
        if not value:
            raise serializers.ValidationError("QI signature is required for legal validity")
        return value
    
    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        validated_data['correction_status'] = 'OPEN'
        return super().create(validated_data)


class AIDefectSuggestionSerializer(serializers.Serializer):
    """Serializer for AI-generated defect grouping suggestions"""
    suggested_defect_type = serializers.CharField()
    suggested_severity = serializers.CharField()
    suggested_description = serializers.CharField()
    related_item_ids = serializers.ListField(child=serializers.IntegerField())
    confidence_score = serializers.FloatField()
    reasoning = serializers.CharField()


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
# BILLING & PAYMENT SERIALIZERS
# ============================================

class PaymentSerializer(serializers.ModelSerializer):
    invoice_number = serializers.CharField(source='invoice.invoice_number', read_only=True)
    processed_by_name = serializers.CharField(source='processed_by.get_full_name', read_only=True)
    
    class Meta:
        model = Payment
        fields = [
            'invoice',
            'invoice_number',
            'payment_amount',
            'payment_date',
            'payment_method',
            'payment_reference',
            'notes',
            'processed_by',
            'processed_by_name',
            'created_at',
        ]
        read_only_fields = ['created_at', 'processed_by']
    
    def validate(self, data):
        if data['payment_amount'] <= 0:
            raise serializers.ValidationError(
                "Payment amount must be greater than zero"
            )
        
        invoice = data['invoice']
        existing_payments = Payment.objects.filter(invoice=invoice).aggregate(
            Sum('payment_amount')
        )['payment_amount__sum'] or 0
        
        total_after_payment = existing_payments + float(data['payment_amount'])
        net_amount = float(invoice.net_amount)
        
        if total_after_payment > net_amount:
            raise serializers.ValidationError(
                f"Total payment (₱{total_after_payment:,.2f}) exceeds net amount (₱{net_amount:,.2f})"
            )
        
        return data


class InvoiceSerializer(serializers.ModelSerializer):
    """Serializer for Invoice model"""
    
    project_name = serializers.CharField(source='project.project_name', read_only=True)
    project_code = serializers.CharField(source='project.project_code', read_only=True)
    vendor_name = serializers.CharField(source='vendor.vendor_name', read_only=True)
    vendor_code = serializers.CharField(source='vendor.vendor_code', read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    approved_by_name = serializers.CharField(source='approved_by.get_full_name', read_only=True)
    days_until_due = serializers.SerializerMethodField()
    is_overdue = serializers.SerializerMethodField()
    
    class Meta:
        model = Invoice
        fields = [
            'invoice_id',
            'project',
            'project_name',
            'project_code',
            'vendor',
            'vendor_name',
            'vendor_code',
            'invoice_number',
            'invoice_date',
            'due_date',
            'invoice_amount',
            'penalty_amount',
            'net_amount',
            'payment_status',
            'payment_date',
            'payment_reference',
            'notes',
            'created_by',
            'created_by_name',
            'approved_by',
            'approved_by_name',
            'approval_date',
            'created_at',
            'updated_at',
            'days_until_due',
            'is_overdue',
        ]
        read_only_fields = ['invoice_id', 'created_at', 'updated_at']
    
    def get_days_until_due(self, obj):
        if obj.payment_status == 'Paid':
            return 0
        
        today = date.today()
        due = obj.due_date
        
        if isinstance(due, datetime):
            due = due.date()
        
        delta = (due - today).days
        return delta
    
    def get_is_overdue(self, obj):
        if obj.payment_status == 'Paid':
            return False
        
        return obj.due_date < date.today()
    
    def validate(self, data):
        if 'invoice_date' in data and 'due_date' in data:
            if data['due_date'] < data['invoice_date']:
                raise serializers.ValidationError(
                    "Due date must be after invoice date"
                )
        
        if 'invoice_amount' in data:
            if float(data['invoice_amount']) < 0:
                raise serializers.ValidationError(
                    "Invoice amount cannot be negative"
                )
        
        if 'penalty_amount' in data:
            if float(data['penalty_amount']) < 0:
                raise serializers.ValidationError(
                    "Penalty amount cannot be negative"
                )
        
        return data


class InvoiceDetailSerializer(InvoiceSerializer):
    """Detailed invoice serializer with related data"""
    
    payments = PaymentSerializer(many=True, read_only=True)
    penalties = serializers.SerializerMethodField()
    total_paid = serializers.SerializerMethodField()
    balance = serializers.SerializerMethodField()
    
    class Meta(InvoiceSerializer.Meta):
        fields = InvoiceSerializer.Meta.fields + [
            'payments',
            'penalties',
            'total_paid',
            'balance',
        ]
    
    def get_penalties(self, obj):
        penalties = Penalty.objects.filter(
            project=obj.project,
            penalty_status='Issued'
        ).select_related('penalty_rule')
        
        return [{
            'penalty_id': p.penalty_id,
            'rule_name': p.penalty_rule.rule_name,
            'amount': str(p.penalty_amount),
            'violation_date': p.violation_date,
        } for p in penalties]
    
    def get_total_paid(self, obj):
        total = obj.payments.aggregate(Sum('payment_amount'))['payment_amount__sum']
        return str(total or 0)
    
    def get_balance(self, obj):
        total_paid = obj.payments.aggregate(
            Sum('payment_amount')
        )['payment_amount__sum'] or 0
        
        balance = float(obj.net_amount) - float(total_paid)
        return str(balance)


class InvoiceCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating invoices with items"""
    
    items = serializers.JSONField(required=False, write_only=True)
    
    class Meta:
        model = Invoice
        fields = [
            'project',
            'vendor',
            'invoice_number',
            'invoice_date',
            'due_date',
            'invoice_amount',
            'penalty_amount',
            'net_amount',
            'payment_status',
            'notes',
            'items',
        ]
    
    def create(self, validated_data):
        items = validated_data.pop('items', [])
        
        if items:
            total = sum(
                item.get('quantity', 1) * item.get('unit_price', 0) 
                for item in items
            )
            validated_data['invoice_amount'] = str(total)
        
        invoice_amt = float(validated_data.get('invoice_amount', 0))
        penalty_amt = float(validated_data.get('penalty_amount', 0))
        validated_data['net_amount'] = str(invoice_amt - penalty_amt)
        
        invoice = super().create(validated_data)
        
        if items:
            items_text = "\n".join([
                f"- {item.get('description', 'N/A')}: "
                f"{item.get('quantity', 1)} x ₱{item.get('unit_price', 0):,.2f} = "
                f"₱{item.get('quantity', 1) * item.get('unit_price', 0):,.2f}"
                for item in items
            ])
            
            if invoice.notes:
                invoice.notes += f"\n\nItems:\n{items_text}"
            else:
                invoice.notes = f"Items:\n{items_text}"
            
            invoice.save()
        
        return invoice


class PaymentReceiptSerializer(serializers.ModelSerializer):
    uploaded_by_name = serializers.CharField(read_only=True)
    reviewed_by_name = serializers.CharField(read_only=True)
    invoice_number = serializers.CharField(source='invoice.invoice_number', read_only=True)
    
    class Meta:
        model = PaymentReceipt
        fields = [
            'receipt_id',
            'invoice',
            'invoice_number',
            'receipt_image',
            'receipt_number',
            'payment_amount',
            'payment_date',
            'payment_method',
            'notes',
            'status',
            'uploaded_by',
            'uploaded_by_name',
            'uploaded_at',
            'reviewed_by',
            'reviewed_by_name',
            'reviewed_at',
            'review_notes',
            'created_at',
            'updated_at'
        ]
        read_only_fields = [
            'receipt_id',
            'uploaded_by',
            'uploaded_at',
            'status',
            'reviewed_by',
            'reviewed_at',
            'review_notes',
            'created_at',
            'updated_at'
        ]
    
    def create(self, validated_data):
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            validated_data['uploaded_by'] = request.user
        
        return super().create(validated_data)
    
    def validate_payment_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("Payment amount must be greater than zero")
        return value
    
    def validate(self, data):
        invoice = data.get('invoice')
        payment_amount = data.get('payment_amount')
        
        if invoice and payment_amount:
            if payment_amount > invoice.net_amount:
                raise serializers.ValidationError({
                    'payment_amount': f'Payment amount cannot exceed invoice net amount of ₱{invoice.net_amount}'
                })
        
        return data


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
# WORK ORDER SERIALIZERS
# ============================================

class WorkOrderListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for list views"""
    
    class Meta:
        model = WorkOrder
        fields = [
            'id', 'project_id', 'wo_no', 'vip', 'description', 'location', 'municipality',
            'area_of_responsibility', 'date_received_jacket_ps', 'date_received_awarding_wo',
            'vendor_remarks', 'c1_remarks', 'assigned', 'status', 'date_wmtrl', 'date_sched',
            'date_received_by_vc', 'actual_date_completed_on_site', 'date_fcomp', 'date_comp',
            'days_wmtrl_to_fcomp_apt', 'days_sched_to_fcomp', 'days_comp',
            'date_needed_wmtrl_to_fcomp_075', 'date_needed_fcomp_095', 
            'date_needed_wmtrl_to_fcomp_50', 'computed_index_wmtrl_to_fcomp_ccti',
            'computed_index_comp', 'spt_m', 'spt_l', 'duration_075_days', 'duration_095_days',
            'target_days', 'spt_m_for_comp', 'duration_comp_days', 'target_days_comp',
            'date_needed_to_comp', 'ageing_days_since_fcomp', 'exclusion_reason',
            'for_ccti_exclusion', 'encoded_in_eam', 'validated_by_dcsam', 'for_apt_exclusion',
            'exclusion_start_date', 'exclusion_duration_days', 'exclusion_end_date',
            'remarks_follow_up_by', 'remarks_2', 'date_needed_submit_coc',
            'ageing_submission_coc', 'date_completed_from_coc', 'actual_received_coc',
            'date_audit', 'audit_by', 'with_back_job', 'backjob_tagged_eam',
            'date_received_by_contractor', 'date_corrected', 'date_material_balancing',
            'material_balancing_by', 'yes_no_flag', 'emailed_to_meter', 'dt_correction_method',
            'tln', 'with_pole_replacement', 'actual_field_status', 'remarks_3',
            'abf_printed_by', 'date_printed_pole_tag_form', 'pole_tln_tags',
            'exclusion_days_apt', 'apt_with_exclusion', 'exclusion_days_ccti',
            'duration_ccti_with_exclusion', 'ccti_with_exclusion', 'e2e_prdi',
            'current_ccti_with_exclusion', 'current_ccti', 'final_ccti_less_than_fcomp',
            'prdi', 'days_ageing', 'rev_non_rev', 'age_bracket', 'ntc_date_created',
            'ntc_amount', 'ntc', 'ntc_date_received_by_contractor', 'ntc_date_completed',
            'ntc_running_days', 'nov_debit_memo_date_created', 'nov_amount',
            'nov_date_received_by_contractor', 'ext', 'updated_supv', 'supv_name',
            'status_as_of_2025_04_04', 'diff_days_wmtrl_to_sched_2025', 'filter_flag',
            'supervisor_full_name', 'created_at', 'updated_at', 'vendor_id',
        ]


class WorkOrderSerializer(serializers.ModelSerializer):
    """Full serializer for detail views"""
    
    class Meta:
        model = WorkOrder
        fields = '__all__'
        read_only_fields = ['vendor_id', 'id', 'created_at', 'updated_at', 
                           'days_wmtrl_to_fcomp_apt', 'days_sched_to_fcomp', 
                           'days_comp', 'computed_index_wmtrl_to_fcomp_ccti', 
                           'computed_index_comp']


class WorkOrderCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer for create and update operations"""
    
    class Meta:
        model = WorkOrder
        exclude = ['created_at', 'updated_at', 'days_wmtrl_to_fcomp_apt', 
                   'days_sched_to_fcomp', 'days_comp', 
                   'computed_index_wmtrl_to_fcomp_ccti', 'computed_index_comp']
    
    def validate_wo_no(self, value):
        if self.instance is None:
            if WorkOrder.objects.filter(wo_no=value).exists():
                raise serializers.ValidationError("Work Order number already exists")
        return value
    
    def validate(self, data):
        if data.get('date_received_jacket_ps') and data.get('date_comp'):
            if data['date_comp'] < data['date_received_jacket_ps']:
                raise serializers.ValidationError(
                    "Completion date cannot be before received date"
                )
        
        if data.get('date_fcomp') and data.get('date_comp'):
            if data['date_comp'] < data['date_fcomp']:
                raise serializers.ValidationError(
                    "Completion date cannot be before FCOMP date"
                )
        
        return data


class WorkOrderDocumentSerializer(serializers.ModelSerializer):
    uploaded_by_username = serializers.SerializerMethodField()
    approved_by_username = serializers.SerializerMethodField()
    file_url = serializers.SerializerMethodField()

    class Meta:
        model = WorkOrderDocument
        fields = [
            'id', 'work_order', 'document_type', 'document_name', 'document_path',
            'file', 'file_url', 'uploaded_by_id', 'uploaded_by_username', 'upload_date',
            'is_approved', 'approved_by_id', 'approved_by_username', 'approval_date',
            'notes', 'created_at',
        ]
        read_only_fields = ['upload_date', 'created_at', 'document_name', 'document_path']

    def get_file_url(self, obj):
        request = self.context.get('request')
        if obj.file and request:
            return request.build_absolute_uri(obj.file.url)
        elif obj.file:
            return obj.file.url
        return None

    def get_uploaded_by_username(self, obj):
        if obj.uploaded_by_id:
            try:
                user = User.objects.get(user_id=obj.uploaded_by_id)
                return user.username
            except User.DoesNotExist:
                return "Unknown User"
        return "System"
    
    def get_approved_by_username(self, obj):
        if obj.approved_by_id:
            try:
                user = User.objects.get(user_id=obj.approved_by_id)
                return user.username
            except User.DoesNotExist:
                return "Unknown User"
        return None


class WorkOrderTimelineSerializer(serializers.ModelSerializer):
    """Specialized serializer for timeline view"""
    milestones = serializers.SerializerMethodField()
    
    class Meta:
        model = WorkOrder
        fields = ['id', 'wo_no', 'description', 'status', 'milestones']
    
    def get_milestones(self, obj):
        milestones = []
        
        milestone_mapping = [
            ('Jacket Received (PS)', obj.date_received_jacket_ps),
            ('Awarding WO Received', obj.date_received_awarding_wo),
            ('WMTRL', obj.date_wmtrl),
            ('Scheduled', obj.date_sched),
            ('Received by VC', obj.date_received_by_vc),
            ('Completed On-Site', obj.actual_date_completed_on_site),
            ('FCOMP', obj.date_fcomp),
            ('Completed', obj.date_comp),
            ('Received by Contractor', obj.date_received_by_contractor),
            ('Corrected', obj.date_corrected),
        ]
        
        for label, date_val in milestone_mapping:
            if date_val:
                milestones.append({
                    'label': label,
                    'date': date_val,
                    'completed': True
                })
        
        return sorted(milestones, key=lambda x: x['date'])


class WorkOrderStatsSerializer(serializers.Serializer):
    """Serializer for dashboard statistics"""
    total_count = serializers.IntegerField()
    status_breakdown = serializers.ListField()
    vip_count = serializers.IntegerField()
    overdue_count = serializers.IntegerField()
    overdue_percentage = serializers.FloatField()
    avg_completion_days = serializers.FloatField()
    completion_rate = serializers.FloatField()
    by_municipality = serializers.ListField()
    by_assigned = serializers.ListField()
    recent_work_orders = WorkOrderListSerializer(many=True)


class COCChecklistSerializer(serializers.ModelSerializer):
    """Serializer for COC Checklist - Work Orders needing COC review"""
    vendor_name = serializers.CharField(source='vendor.vendor_name', read_only=True)
    vendor_code = serializers.CharField(source='vendor.vendor_code', read_only=True)
    supervisor_name = serializers.SerializerMethodField()
    days_since_energized = serializers.SerializerMethodField()
    days_since_coc = serializers.SerializerMethodField()
    needs_attention = serializers.SerializerMethodField()
    
    class Meta:
        model = WorkOrder
        fields = [
            'id', 'wo_no', 'description', 'location', 'municipality',
            'vendor_id', 'vendor_name', 'vendor_code', 'assigned',
            'supervisor_full_name', 'supervisor_name', 'status',
            'date_received_by_vc', 'date_sched', 'date_received_jacket_ps',
            'days_since_energized', 'days_since_coc', 'needs_attention',
            'vendor_remarks', 'c1_remarks', 'ntc_amount',
            'created_at', 'updated_at'
        ]
    
    def get_supervisor_name(self, obj):
        return obj.supervisor_full_name or 'N/A'
    
    def get_days_since_energized(self, obj):
        if obj.date_received_by_vc:
            delta = timezone.now().date() - obj.date_received_by_vc
            return delta.days
        return None
    
    def get_days_since_coc(self, obj):
        if obj.date_sched:
            delta = timezone.now().date() - obj.date_sched
            return delta.days
        return None
    
    def get_needs_attention(self, obj):
        if obj.date_received_by_vc and not obj.date_sched:
            days = (timezone.now().date() - obj.date_received_by_vc).days
            return days > 7
        if obj.date_sched and not obj.date_received_jacket_ps:
            days = (timezone.now().date() - obj.date_sched).days
            return days > 3
        return False


# ============================================
# CREW MONITORING SERIALIZERS
# ============================================

class CrewTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = CrewType
        fields = '__all__'


class DailyCrewMonitoringSerializer(serializers.ModelSerializer):
    crew_code = serializers.CharField(source='crew_type.crew_code', read_only=True)
    crew_name = serializers.CharField(source='crew_type.crew_name', read_only=True)
    
    class Meta:
        model = DailyCrewMonitoring
        fields = '__all__'
        read_only_fields = ['weighted_productivity', 'monthly_peso_value', 
                           'weekly_peso_value', 'daily_peso_value', 
                           'created_at', 'updated_at']


class DailyCrewMonitoringSummarySerializer(serializers.Serializer):
    """Aggregated summary for crew monitoring"""
    crew_code = serializers.CharField()
    crew_name = serializers.CharField()
    month = serializers.DateField()
    total_productivity = serializers.DecimalField(max_digits=15, decimal_places=2)
    total_peso_value = serializers.DecimalField(max_digits=15, decimal_places=2)
    average_daily_productivity = serializers.DecimalField(max_digits=10, decimal_places=2)


# ============================================
# PCA SERIALIZERS
# ============================================

class PCAGoalSerializer(serializers.ModelSerializer):
    month_display = serializers.SerializerMethodField()
    
    class Meta:
        model = PCAGoal
        fields = '__all__'
    
    def get_month_display(self, obj):
        return obj.month.strftime('%B %Y')


class PCASummarySerializer(serializers.ModelSerializer):
    month_display = serializers.SerializerMethodField()
    goal = PCAGoalSerializer(source='month', read_only=True)
    
    class Meta:
        model = PCASummary
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']

    def get_month_display(self, obj):
        return obj.month.strftime('%B %Y')


# ============================================
# VENDOR PRODUCTIVITY SERIALIZERS
# ============================================

class VendorProductivityMonthlySerializer(serializers.ModelSerializer):
    vendor_name = serializers.CharField(source='vendor.vendor_name', read_only=True)
    vendor_code = serializers.CharField(source='vendor.vendor_code', read_only=True)
    month_display = serializers.SerializerMethodField()
    
    class Meta:
        model = VendorProductivityMonthly
        fields = '__all__'
        read_only_fields = ['actual_capability_percentage', 'productivity_percentage', 
                        'created_at', 'updated_at']

    def get_month_display(self, obj):
        return obj.month.strftime('%B %Y')


# ============================================
# AGEING ANALYSIS SERIALIZERS
# ============================================

class AgeingAnalysisSerializer(serializers.ModelSerializer):
    wo_no = serializers.CharField(source='work_order.wo_no', read_only=True)
    wo_description = serializers.CharField(source='work_order.description', read_only=True)
    supervisor_name = serializers.SerializerMethodField()
    age_bracket_display = serializers.CharField(source='get_age_bracket_display', read_only=True)
    
    class Meta:
        model = AgeingAnalysis
        fields = '__all__'

    def get_supervisor_name(self, obj):
        return obj.supervisor.get_full_name() if obj.supervisor else None


class AgeingSummarySerializer(serializers.Serializer):
    """Summary statistics for ageing analysis"""
    age_bracket = serializers.CharField()
    count = serializers.IntegerField()
    exclusion_duration = serializers.DecimalField(max_digits=15, decimal_places=2)


# ============================================
# BACKJOB MONITORING SERIALIZERS
# ============================================

class BackjobMonitoringSerializer(serializers.ModelSerializer):
    wo_no = serializers.CharField(source='work_order.wo_no', read_only=True)
    wo_description = serializers.CharField(source='work_order.description', read_only=True)
    assigned_to_name = serializers.SerializerMethodField()
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = BackjobMonitoring
        fields = '__all__'
        read_only_fields = ['days_pending', 'is_overdue', 'created_at', 'updated_at']

    def get_assigned_to_name(self, obj):
        return obj.assigned_to.get_full_name() if obj.assigned_to else None


# ============================================
# KPI TRACKING SERIALIZERS
# ============================================

class KPISnapshotSerializer(serializers.ModelSerializer):
    kpi_type_display = serializers.CharField(source='get_kpi_type_display', read_only=True)
    status = serializers.SerializerMethodField()
    variance = serializers.SerializerMethodField()
    
    class Meta:
        model = KPISnapshot
        fields = '__all__'
    
    def get_status(self, obj):
        if not obj.target_value:
            return 'NEUTRAL'
        
        if obj.kpi_value >= obj.target_value:
            return 'GREEN'
        elif obj.kpi_value >= obj.target_value * 0.9:
            return 'YELLOW'
        else:
            return 'RED'
    
    def get_variance(self, obj):
        if not obj.target_value or obj.target_value == 0:
            return None
        return float((obj.kpi_value - obj.target_value) / obj.target_value * 100)


class KPITargetSerializer(serializers.ModelSerializer):
    class Meta:
        model = KPITarget
        fields = '__all__'


class KPIDashboardSerializer(serializers.Serializer):
    """Serializer for comprehensive KPI dashboard data"""
    period_start = serializers.DateField()
    period_end = serializers.DateField()
    total_kpis = serializers.IntegerField()
    ccti = serializers.DictField()
    pca_conversion = serializers.DictField()
    ageing_completion = serializers.DictField()
    pai_adherence = serializers.DictField()
    termination_apt = serializers.DictField()
    termination_resolution = serializers.DictField()
    prdi = serializers.DictField()
    cost_settlement = serializers.DictField()
    quality_index = serializers.DictField()
    capability_utilization = serializers.DictField()
    historical_trends = serializers.DictField()
    chart_data = serializers.DictField()


# ============================================
# VENDOR DAILY ACTIVITY SERIALIZERS
# ============================================

class VendorActivityPhotoSerializer(serializers.ModelSerializer):
    class Meta:
        model = VendorActivityPhoto
        fields = '__all__'
        read_only_fields = ['photo_id', 'uploaded_at']


class VendorDailyActivitySerializer(serializers.ModelSerializer):
    photos = VendorActivityPhotoSerializer(many=True, read_only=True)
    vendor_name = serializers.CharField(source='vendor.vendor_name', read_only=True)
    vendor_code = serializers.CharField(source='vendor.vendor_code', read_only=True)
    
    class Meta:
        model = VendorDailyActivity
        fields = '__all__'
        read_only_fields = ['activity_id', 'signed_on_at', 'created_at', 'updated_at']


# ============================================
# DASHBOARD & ANALYTICS SERIALIZERS
# ============================================

class DashboardStatsSerializer(serializers.Serializer):
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
    status_name = serializers.CharField()
    project_count = serializers.IntegerField()
    percentage = serializers.FloatField()


class VendorPerformanceSummarySerializer(serializers.Serializer):
    id = serializers.IntegerField()
    vendor_code = serializers.CharField()
    vendor_name = serializers.CharField()
    compliance_score = serializers.DecimalField(max_digits=5, decimal_places=2)
    total_projects = serializers.IntegerField()
    delayed_projects = serializers.IntegerField()
    total_penalties = serializers.DecimalField(max_digits=15, decimal_places=2)
    sla_breaches = serializers.IntegerField()
    on_time_percentage = serializers.FloatField()


class DelayAnalysisSerializer(serializers.Serializer):
    factor__factor_name = serializers.CharField()
    factor__factor_category = serializers.CharField()
    occurrence_count = serializers.IntegerField()
    total_delay_days = serializers.IntegerField()
    avg_delay_days = serializers.FloatField()


class MonthlyTrendSerializer(serializers.Serializer):
    month = serializers.DateField()
    total = serializers.IntegerField()
    completed = serializers.IntegerField()
    delayed = serializers.IntegerField()


class SectorSummarySerializer(serializers.Serializer):
    sector_code = serializers.CharField()
    sector_name = serializers.CharField()
    total_projects = serializers.IntegerField()
    active_projects = serializers.IntegerField()
    delayed_projects = serializers.IntegerField()


class PenaltySummarySerializer(serializers.Serializer):
    total_penalties = serializers.IntegerField()
    total_amount = serializers.DecimalField(max_digits=15, decimal_places=2)
    issued = serializers.IntegerField()
    paid = serializers.IntegerField()
    waived = serializers.IntegerField()
    disputed = serializers.IntegerField()


class InvoiceSummarySerializer(serializers.Serializer):
    total_invoices = serializers.IntegerField()
    total_amount = serializers.DecimalField(max_digits=15, decimal_places=2)
    total_penalties = serializers.DecimalField(max_digits=15, decimal_places=2)
    total_net = serializers.DecimalField(max_digits=15, decimal_places=2)
    paid = serializers.DecimalField(max_digits=15, decimal_places=2)
    outstanding = serializers.DecimalField(max_digits=15, decimal_places=2)


class RecentActivitySerializer(serializers.Serializer):
    activity_type = serializers.CharField()
    description = serializers.CharField()
    timestamp = serializers.DateTimeField()
    user = serializers.CharField()
    project_code = serializers.CharField(allow_null=True)


class ProjectPriorityDistributionSerializer(serializers.Serializer):
    priority = serializers.CharField()
    count = serializers.IntegerField()
    percentage = serializers.FloatField()


class QIPerformanceSummarySerializer(serializers.Serializer):
    qi_name = serializers.CharField()
    total_inspections = serializers.IntegerField()
    completed_inspections = serializers.IntegerField()
    pending_inspections = serializers.IntegerField()
    completion_rate = serializers.FloatField()


class UpcomingDeadlinesSerializer(serializers.Serializer):
    project_code = serializers.CharField()
    project_name = serializers.CharField()
    deadline_type = serializers.CharField()
    due_date = serializers.DateField()
    days_remaining = serializers.IntegerField()
    priority = serializers.CharField()


# ============================================
# AI & ML SERIALIZERS
# ============================================

class DelayPredictionSerializer(serializers.Serializer):
    status = serializers.CharField()
    priority = serializers.CharField()
    risk_score = serializers.CharField()
    days_since_start = serializers.IntegerField()
    contract_value = serializers.FloatField()
    compliance_score = serializers.FloatField()


class PenaltyPredictionSerializer(serializers.Serializer):
    violation_type = serializers.CharField()
    delay_days = serializers.IntegerField()


class ChatRequestSerializer(serializers.Serializer):
    question = serializers.CharField(max_length=500)


# ============================================
# BULK OPERATIONS SERIALIZERS
# ============================================

class WorkOrderExcelImportSerializer(serializers.Serializer):
    """Serializer for Excel import validation"""
    file = serializers.FileField(required=True)
    
    def validate_file(self, value):
        if not value.name.endswith(('.xlsx', '.xls')):
            raise serializers.ValidationError(
                "File must be an Excel file (.xlsx or .xls)"
            )
        
        if value.size > 50 * 1024 * 1024:
            raise serializers.ValidationError(
                "File size must not exceed 50MB."
            )
        
        return value


class WorkOrderBulkUpdateSerializer(serializers.Serializer):
    """Serializer for bulk update operations"""
    work_order_ids = serializers.ListField(
        child=serializers.IntegerField(),
        required=True,
        allow_empty=False
    )
    status = serializers.CharField(required=False, allow_blank=True)
    assigned = serializers.CharField(required=False, allow_blank=True)
    supervisor_full_name = serializers.CharField(required=False, allow_blank=True)
    
    def validate_work_order_ids(self, value):
        existing_ids = WorkOrder.objects.filter(
            id__in=value
        ).values_list('id', flat=True)
        
        missing_ids = set(value) - set(existing_ids)
        if missing_ids:
            raise serializers.ValidationError(
                f"Work order IDs not found: {sorted(missing_ids)}"
            )
        
        return value
    
    def validate(self, data):
        updateable_fields = ['status', 'assigned', 'supervisor_full_name']
        
        if not any(field in data for field in updateable_fields):
            raise serializers.ValidationError(
                "At least one field to update must be provided."
            )
        
        return data