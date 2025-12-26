from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone
import uuid


from django.db import models
from django.contrib.auth.models import AbstractUser
from django.contrib.auth.hashers import make_password
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone
import uuid


# ============================================
# USER MANAGEMENT MODELS
# ============================================

class UserRole(models.Model):
    role_id = models.AutoField(primary_key=True)
    role_name = models.CharField(max_length=50, unique=True)
    role_description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'user_roles'
        ordering = ['role_name']

    def __str__(self):
        return self.role_name


class User(AbstractUser):
    user_id = models.AutoField(primary_key=True)
    role = models.ForeignKey(UserRole, on_delete=models.SET_NULL, null=True, blank=True, related_name='users')
    email = models.EmailField(blank=True, null=True)
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    is_active = models.BooleanField(default=True)
    last_login = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_super_user = models.BooleanField(default=False)
    is_staff = models.BooleanField(default=False)
    date_joined = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'users'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.get_full_name()} ({self.username})"

    @property
    def is_superuser(self):
        return self.is_super_user

    @is_superuser.setter
    def is_superuser(self, value):
        self.is_super_user = value


class Permission(models.Model):
    permission_name = models.CharField(max_length=100, unique=True)
    permission_description = models.TextField(blank=True, null=True)
    module_name = models.CharField(max_length=50, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'permissions'
        ordering = ['module_name', 'permission_name']

    def __str__(self):
        return self.permission_name


class RolePermission(models.Model):
    role = models.ForeignKey(UserRole, on_delete=models.CASCADE, related_name='role_permissions')
    permission = models.ForeignKey(Permission, on_delete=models.CASCADE, related_name='role_permissions')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'role_permissions'
        unique_together = ['role', 'permission']
        ordering = ['role', 'permission']

    def __str__(self):
        return f"{self.role.role_name} - {self.permission.permission_name}"


class UserSession(models.Model):
    session_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sessions')
    login_time = models.DateTimeField(auto_now_add=True)
    logout_time = models.DateTimeField(null=True, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True, null=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'user_sessions'
        ordering = ['-login_time']

    def __str__(self):
        return f"{self.user.username} - {self.login_time}"


# ============================================
# VENDOR MANAGEMENT MODELS
# ============================================

class Vendor(models.Model):
    vendor_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    vendor_code = models.CharField(max_length=50, unique=True)
    vendor_name = models.CharField(max_length=255)
    company_name = models.CharField(max_length=255, blank=True, null=True)
    contact_person = models.CharField(max_length=100, blank=True, null=True)
    email = models.EmailField(blank=True, null=True)
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    city = models.CharField(max_length=100, blank=True, null=True)
    region = models.CharField(max_length=100, blank=True, null=True)
    postal_code = models.CharField(max_length=20, blank=True, null=True)
    tax_id = models.CharField(max_length=50, blank=True, null=True)
    compliance_score = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)
    is_active = models.BooleanField(default=True)
    is_blacklisted = models.BooleanField(default=False)
    blacklist_reason = models.TextField(blank=True, null=True)
    blacklist_date = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        managed = False
        db_table = 'vendors'
        ordering = ['vendor_name']

    def __str__(self):
        return f"{self.vendor_code} - {self.vendor_name}"


class VendorContact(models.Model):
    contact_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    vendor = models.ForeignKey(Vendor, on_delete=models.CASCADE, related_name='contacts')
    contact_name = models.CharField(max_length=100)
    contact_position = models.CharField(max_length=100, blank=True, null=True)
    contact_email = models.EmailField(blank=True, null=True)
    contact_phone = models.CharField(max_length=20, blank=True, null=True)
    is_primary = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        managed = False
        db_table = 'vendor_contacts'
        ordering = ['-is_primary', 'contact_name']

    def __str__(self):
        return f"{self.contact_name} - {self.vendor.vendor_name}"


class VendorPerformance(models.Model):
    vendor = models.ForeignKey(Vendor, on_delete=models.CASCADE, related_name='performance_records')
    evaluation_date = models.DateField()
    on_time_rate = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    document_submission_rate = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    quality_score = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    compliance_score = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    overall_rating = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    evaluator = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='vendor_evaluations')
    comments = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        managed = False
        db_table = 'vendor_performance'
        ordering = ['-evaluation_date']

    def __str__(self):
        return f"{self.vendor.vendor_name} - {self.evaluation_date}"


# ============================================
# PROJECT MANAGEMENT MODELS
# ============================================

class Sector(models.Model):
    sector_code = models.CharField(max_length=50, unique=True)
    sector_name = models.CharField(max_length=255)
    sector_manager = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='managed_sectors')
    location = models.CharField(max_length=255, blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        managed = False
        db_table = 'sectors'
        ordering = ['sector_name']

    def __str__(self):
        return f"{self.sector_code} - {self.sector_name}"


class ProjectStatus(models.Model):
    status_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    status_name = models.CharField(max_length=50, unique=True)
    status_description = models.TextField(blank=True, null=True)
    status_order = models.IntegerField(null=True, blank=True)
    status_color = models.CharField(max_length=7, blank=True, null=True)  # Hex color
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        managed = False
        db_table = 'project_status'
        ordering = ['status_order']
        verbose_name_plural = 'Project Statuses'

    def __str__(self):
        return self.status_name


class Project(models.Model):
    PRIORITY_CHOICES = [
        ('Low', 'Low'),
        ('Medium', 'Medium'),
        ('High', 'High'),
        ('Critical', 'Critical'),
    ]
    
    RISK_CHOICES = [
        ('Low', 'Low'),
        ('Medium', 'Medium'),
        ('High', 'High'),
    ]

    project_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    project_code = models.CharField(max_length=100, unique=True)
    project_name = models.CharField(max_length=255)
    vendor = models.ForeignKey(Vendor, on_delete=models.SET_NULL, null=True, blank=True, related_name='projects')
    sector = models.ForeignKey(Sector, on_delete=models.SET_NULL, null=True, blank=True, related_name='projects')
    status = models.ForeignKey(ProjectStatus, on_delete=models.SET_NULL, null=True, blank=True, related_name='projects')
    assigned_engineer = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='engineer_projects')
    assigned_qi = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='qi_projects')
    wo_supervisor = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='supervisor_projects')
    project_type = models.CharField(max_length=100, blank=True, null=True)
    project_description = models.TextField(blank=True, null=True)
    contract_value = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True)
    project_location = models.CharField(max_length=255, blank=True, null=True)
    start_date = models.DateField(null=True, blank=True)
    completion_date = models.DateField(null=True, blank=True)
    expected_billing_date = models.DateField(null=True, blank=True)
    actual_billing_date = models.DateField(null=True, blank=True)
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='Medium')
    risk_score = models.CharField(max_length=20, choices=RISK_CHOICES, default='Low')
    is_delayed = models.BooleanField(default=False)
    delay_days = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        managed = False
        db_table = 'projects'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.project_code} - {self.project_name}"


class ProjectMilestone(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='milestones')
    milestone_name = models.CharField(max_length=255)
    milestone_description = models.TextField(blank=True, null=True)
    target_date = models.DateField(null=True, blank=True)
    completion_date = models.DateField(null=True, blank=True)
    is_completed = models.BooleanField(default=False)
    milestone_order = models.IntegerField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        managed = False
        db_table = 'project_milestones'
        ordering = ['milestone_order']

    def __str__(self):
        return f"{self.project.project_code} - {self.milestone_name}"


class ProjectTeam(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='team_members')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='project_memberships')
    role_in_project = models.CharField(max_length=100, blank=True, null=True)
    assigned_date = models.DateField(default=timezone.now)
    removed_date = models.DateField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        managed = False
        db_table = 'project_team'
        ordering = ['project', '-is_active']

    def __str__(self):
        return f"{self.project.project_code} - {self.user.get_full_name()}"


# ============================================
# WORKFLOW MANAGEMENT MODELS
# ============================================

class WorkflowStage(models.Model):
    stage_name = models.CharField(max_length=100, unique=True)
    stage_description = models.TextField(blank=True, null=True)
    stage_order = models.IntegerField(null=True, blank=True)
    default_duration_days = models.IntegerField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        managed = False
        db_table = 'workflow_stages'
        ordering = ['stage_order']

    def __str__(self):
        return self.stage_name


class ProjectWorkflow(models.Model):
    STATUS_CHOICES = [
        ('Pending', 'Pending'),
        ('In Progress', 'In Progress'),
        ('Completed', 'Completed'),
        ('Blocked', 'Blocked'),
    ]

    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='workflow_stages')
    stage = models.ForeignKey(WorkflowStage, on_delete=models.CASCADE, related_name='project_workflows')
    assigned_user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='workflow_assignments')
    start_date = models.DateTimeField(null=True, blank=True)
    due_date = models.DateField(null=True, blank=True)
    completion_date = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='Pending')
    notes = models.TextField(blank=True, null=True)
    is_current_stage = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        managed = False
        db_table = 'project_workflow'
        ordering = ['project', 'stage__stage_order']

    def __str__(self):
        return f"{self.project.project_code} - {self.stage.stage_name}"


# ============================================
# DOCUMENT MANAGEMENT MODELS
# ============================================

class DocumentType(models.Model):
    doc_type_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    doc_type_name = models.CharField(max_length=100, unique=True)
    doc_type_description = models.TextField(blank=True, null=True)
    is_required = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        managed = False
        db_table = 'document_types'
        ordering = ['doc_type_name']

    def __str__(self):
        return self.doc_type_name


class ProjectDocument(models.Model):
    APPROVAL_STATUS_CHOICES = [
        ('Pending', 'Pending'),
        ('Approved', 'Approved'),
        ('Rejected', 'Rejected'),
    ]

    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='documents')
    doc_type = models.ForeignKey(DocumentType, on_delete=models.CASCADE, related_name='documents')
    document_name = models.CharField(max_length=255)
    document_path = models.CharField(max_length=500)
    file_size = models.IntegerField(null=True, blank=True)  # in bytes
    file_type = models.CharField(max_length=50, blank=True, null=True)
    uploaded_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='uploaded_documents')
    upload_date = models.DateTimeField(auto_now_add=True)
    version_number = models.IntegerField(default=1)
    is_current_version = models.BooleanField(default=True)
    approval_status = models.CharField(max_length=50, choices=APPROVAL_STATUS_CHOICES, default='Pending')
    approved_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='approved_documents')
    approval_date = models.DateTimeField(null=True, blank=True)
    rejection_reason = models.TextField(blank=True, null=True)
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        managed = False
        db_table = 'project_documents'
        ordering = ['-upload_date']

    def __str__(self):
        return f"{self.project.project_code} - {self.document_name}"


class DocumentCompliance(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='document_compliance')
    doc_type = models.ForeignKey(DocumentType, on_delete=models.CASCADE, related_name='compliance_records')
    is_submitted = models.BooleanField(default=False)
    submission_date = models.DateTimeField(null=True, blank=True)
    is_approved = models.BooleanField(default=False)
    approval_date = models.DateTimeField(null=True, blank=True)
    due_date = models.DateField(null=True, blank=True)
    is_overdue = models.BooleanField(default=False)
    overdue_days = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        managed = False
        db_table = 'document_compliance'
        ordering = ['project', 'doc_type']

    def __str__(self):
        return f"{self.project.project_code} - {self.doc_type.doc_type_name}"


# ============================================
# SLA MANAGEMENT MODELS
# ============================================

class SLARule(models.Model):
    rule_name = models.CharField(max_length=100, unique=True)
    rule_description = models.TextField(blank=True, null=True)
    stage = models.ForeignKey(WorkflowStage, on_delete=models.CASCADE, related_name='sla_rules')
    deadline_days = models.IntegerField()
    warning_threshold_days = models.IntegerField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        managed = False
        db_table = 'sla_rules'
        ordering = ['rule_name']

    def __str__(self):
        return self.rule_name


class SLATracking(models.Model):
    STATUS_CHOICES = [
        ('Open', 'Open'),
        ('Met', 'Met'),
        ('Breached', 'Breached'),
        ('Waived', 'Waived'),
    ]

    sla_tracking_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='sla_tracking')
    sla_rule = models.ForeignKey(SLARule, on_delete=models.CASCADE, related_name='tracking_records')
    start_date = models.DateField()
    due_date = models.DateField()
    completion_date = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='Open')
    days_taken = models.IntegerField(null=True, blank=True)
    is_breached = models.BooleanField(default=False)
    breach_days = models.IntegerField(default=0)
    waiver_reason = models.TextField(blank=True, null=True)
    waived_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='sla_waivers')
    waiver_date = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        managed = False
        db_table = 'sla_tracking'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.project.project_code} - {self.sla_rule.rule_name}"


# ============================================
# QUALITY INSPECTION MODELS
# ============================================

class InspectionType(models.Model):
    inspection_type_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    inspection_name = models.CharField(max_length=100, unique=True)
    inspection_description = models.TextField(blank=True, null=True)
    estimated_duration_hours = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        managed = False
        db_table = 'inspection_types'
        ordering = ['inspection_name']

    def __str__(self):
        return self.inspection_name


class QIInspection(models.Model):
    RESULT_CHOICES = [
        ('Pass', 'Pass'),
        ('Fail', 'Fail'),
        ('Conditional', 'Conditional'),
    ]

    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='inspections')
    inspection_type = models.ForeignKey(InspectionType, on_delete=models.CASCADE, related_name='inspections')
    assigned_qi = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_inspections')
    inspection_date = models.DateField(null=True, blank=True)
    scheduled_date = models.DateField(null=True, blank=True)
    inspection_result = models.CharField(max_length=50, choices=RESULT_CHOICES, blank=True, null=True)
    findings = models.TextField(blank=True, null=True)
    recommendations = models.TextField(blank=True, null=True)
    photos_uploaded = models.BooleanField(default=False)
    location_coordinates = models.CharField(max_length=100, blank=True, null=True)
    is_completed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        managed = False
        db_table = 'qi_inspections'
        ordering = ['-scheduled_date']

    def __str__(self):
        return f"{self.project.project_code} - {self.inspection_type.inspection_name}"


class QIDailyTarget(models.Model):
    qi_user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='daily_targets')
    target_date = models.DateField()
    target_audits = models.IntegerField()
    actual_audits = models.IntegerField(default=0)
    target_met = models.BooleanField(default=False)
    reason_not_met = models.TextField(blank=True, null=True)
    reason_category = models.CharField(max_length=100, blank=True, null=True)
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        managed = False
        db_table = 'qi_daily_targets'
        unique_together = ['qi_user', 'target_date']
        ordering = ['-target_date']

    def __str__(self):
        return f"{self.qi_user.get_full_name()} - {self.target_date}"


class QIPerformance(models.Model):
    qi_user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='performance_records')
    evaluation_period_start = models.DateField()
    evaluation_period_end = models.DateField()
    total_inspections = models.IntegerField(default=0)
    on_time_inspections = models.IntegerField(default=0)
    on_time_percentage = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    average_inspection_time = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    targets_met = models.IntegerField(default=0)
    targets_missed = models.IntegerField(default=0)
    quality_rating = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        managed = False
        db_table = 'qi_performance'
        ordering = ['-evaluation_period_end']

    def __str__(self):
        return f"{self.qi_user.get_full_name()} - {self.evaluation_period_start} to {self.evaluation_period_end}"


# ============================================
# PENALTY MANAGEMENT MODELS
# ============================================

class PenaltyRule(models.Model):
    rule_name = models.CharField(max_length=100, unique=True)
    rule_description = models.TextField(blank=True, null=True)
    violation_type = models.CharField(max_length=100)
    penalty_formula = models.TextField()
    minimum_penalty = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True)
    maximum_penalty = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True)
    grace_period_days = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        managed = False
        db_table = 'penalty_rules'
        ordering = ['rule_name']

    def __str__(self):
        return self.rule_name


class Penalty(models.Model):
    STATUS_CHOICES = [
        ('Draft', 'Draft'),
        ('Issued', 'Issued'),
        ('Paid', 'Paid'),
        ('Waived', 'Waived'),
        ('Disputed', 'Disputed'),
    ]

    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='penalties')
    vendor = models.ForeignKey(Vendor, on_delete=models.CASCADE, related_name='penalties')
    penalty_rule = models.ForeignKey(PenaltyRule, on_delete=models.CASCADE, related_name='penalties')
    violation_date = models.DateField()
    delay_days = models.IntegerField(null=True, blank=True)
    penalty_amount = models.DecimalField(max_digits=15, decimal_places=2)
    penalty_status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='Draft')
    issue_date = models.DateField(null=True, blank=True)
    payment_date = models.DateField(null=True, blank=True)
    waiver_reason = models.TextField(blank=True, null=True)
    waived_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='penalty_waivers')
    waiver_date = models.DateTimeField(null=True, blank=True)
    dispute_reason = models.TextField(blank=True, null=True)
    dispute_date = models.DateTimeField(null=True, blank=True)
    dispute_resolution = models.TextField(blank=True, null=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='created_penalties')
    approved_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='approved_penalties')
    approval_date = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        managed = False
        db_table = 'penalties'
        ordering = ['-created_at']
        verbose_name_plural = 'Penalties'

    def __str__(self):
        return f"{self.project.project_code} - {self.penalty_rule.rule_name}"


# ============================================
# BILLING MANAGEMENT MODELS
# ============================================

class Invoice(models.Model):
    STATUS_CHOICES = [
        ('Unpaid', 'Unpaid'),
        ('Partially Paid', 'Partially Paid'),
        ('Paid', 'Paid'),
        ('Overdue', 'Overdue'),
    ]

    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='invoices')
    vendor = models.ForeignKey(Vendor, on_delete=models.CASCADE, related_name='invoices')
    invoice_number = models.CharField(max_length=100, unique=True)
    invoice_date = models.DateField()
    due_date = models.DateField(null=True, blank=True)
    invoice_amount = models.DecimalField(max_digits=15, decimal_places=2)
    penalty_amount = models.DecimalField(max_digits=15, decimal_places=2, default=0.00)
    net_amount = models.DecimalField(max_digits=15, decimal_places=2)
    payment_status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='Unpaid')
    payment_date = models.DateField(null=True, blank=True)
    payment_reference = models.CharField(max_length=100, blank=True, null=True)
    notes = models.TextField(blank=True, null=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='created_invoices')
    approved_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='approved_invoices')
    approval_date = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        managed = False
        db_table = 'invoices'
        ordering = ['-invoice_date']

    def __str__(self):
        return f"{self.invoice_number} - {self.vendor.vendor_name}"


class Payment(models.Model):
    invoice = models.ForeignKey(Invoice, on_delete=models.CASCADE, related_name='payments')
    payment_amount = models.DecimalField(max_digits=15, decimal_places=2)
    payment_date = models.DateField()
    payment_method = models.CharField(max_length=50, blank=True, null=True)
    payment_reference = models.CharField(max_length=100, blank=True, null=True)
    notes = models.TextField(blank=True, null=True)
    processed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='processed_payments')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        managed = False
        db_table = 'payments'
        ordering = ['-payment_date']

    def __str__(self):
        return f"{self.invoice.invoice_number} - {self.payment_amount}"


# ============================================
# NOTIFICATION MANAGEMENT MODELS
# ============================================

class NotificationTemplate(models.Model):
    TYPE_CHOICES = [
        ('Email', 'Email'),
        ('SMS', 'SMS'),
        ('Push', 'Push'),
    ]

    template_name = models.CharField(max_length=100, unique=True)
    template_subject = models.CharField(max_length=255, blank=True, null=True)
    template_body = models.TextField()
    notification_type = models.CharField(max_length=50, choices=TYPE_CHOICES)
    variables = models.JSONField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        managed = False
        db_table = 'notification_templates'
        ordering = ['template_name']

    def __str__(self):
        return self.template_name


class Notification(models.Model):
    TYPE_CHOICES = [
        ('Email', 'Email'),
        ('SMS', 'SMS'),
        ('Push', 'Push'),
        ('In-App', 'In-App'),
    ]
    
    STATUS_CHOICES = [
        ('Pending', 'Pending'),
        ('Sent', 'Sent'),
        ('Delivered', 'Delivered'),
        ('Failed', 'Failed'),
        ('Read', 'Read'),
    ]

    recipient_user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True, related_name='notifications')
    recipient_email = models.EmailField(blank=True, null=True)
    recipient_phone = models.CharField(max_length=20, blank=True, null=True)
    notification_type = models.CharField(max_length=50, choices=TYPE_CHOICES)
    subject = models.CharField(max_length=255, blank=True, null=True)
    message = models.TextField()
    related_project = models.ForeignKey(Project, on_delete=models.SET_NULL, null=True, blank=True, related_name='notifications')
    related_entity_type = models.CharField(max_length=50, blank=True, null=True)
    related_entity_id = models.IntegerField(null=True, blank=True)
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='Pending')
    sent_at = models.DateTimeField(null=True, blank=True)
    delivered_at = models.DateTimeField(null=True, blank=True)
    read_at = models.DateTimeField(null=True, blank=True)
    error_message = models.TextField(blank=True, null=True)
    retry_count = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        managed = False
        db_table = 'notifications'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.notification_type} - {self.subject}"


# ============================================
# ESCALATION MANAGEMENT MODELS
# ============================================

class EscalationRule(models.Model):
    rule_name = models.CharField(max_length=100, unique=True)
    rule_description = models.TextField(blank=True, null=True)
    trigger_condition = models.CharField(max_length=255)
    delay_threshold_days = models.IntegerField()
    escalate_to_role = models.ForeignKey(UserRole, on_delete=models.CASCADE, related_name='escalation_rules')
    notification_template = models.ForeignKey(NotificationTemplate, on_delete=models.SET_NULL, null=True, blank=True, related_name='escalation_rules')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        managed = False
        db_table = 'escalation_rules'
        ordering = ['rule_name']

    def __str__(self):
        return self.rule_name


class Escalation(models.Model):
    STATUS_CHOICES = [
        ('Open', 'Open'),
        ('In Progress', 'In Progress'),
        ('Resolved', 'Resolved'),
        ('Closed', 'Closed'),
    ]

    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='escalations')
    escalation_rule = models.ForeignKey(EscalationRule, on_delete=models.CASCADE, related_name='escalations')
    escalated_from_user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='escalations_from')
    escalated_to_user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='escalations_to')
    escalation_reason = models.TextField()
    escalation_date = models.DateTimeField(auto_now_add=True)
    response_date = models.DateTimeField(null=True, blank=True)
    response_delay_hours = models.IntegerField(null=True, blank=True)
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='Open')
    resolution = models.TextField(blank=True, null=True)
    resolved_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='resolved_escalations')
    resolution_date = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        managed = False
        db_table = 'escalations'
        ordering = ['-escalation_date']

    def __str__(self):
        return f"{self.project.project_code} - {self.escalation_rule.rule_name}"


# ============================================
# ANALYTICS MODELS
# ============================================

class DelayFactor(models.Model):
    factor_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    factor_name = models.CharField(max_length=100, unique=True)
    factor_category = models.CharField(max_length=50, blank=True, null=True)
    factor_description = models.TextField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        managed = False
        db_table = 'delay_factors'
        ordering = ['factor_category', 'factor_name']

    def __str__(self):
        return self.factor_name


class ProjectDelay(models.Model):
    RESPONSIBLE_CHOICES = [
        ('Vendor', 'Vendor'),
        ('Internal', 'Internal'),
        ('External', 'External'),
    ]

    delay_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='delays')
    factor = models.ForeignKey(DelayFactor, on_delete=models.CASCADE, related_name='project_delays')
    delay_days = models.IntegerField()
    delay_start_date = models.DateField()
    delay_end_date = models.DateField(null=True, blank=True)
    responsible_party = models.CharField(max_length=100, choices=RESPONSIBLE_CHOICES, blank=True, null=True)
    notes = models.TextField(blank=True, null=True)
    reported_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='reported_delays')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        managed = False
        db_table = 'project_delays'
        ordering = ['-delay_start_date']

    def __str__(self):
        return f"{self.project.project_code} - {self.factor.factor_name}"


# ============================================
# VENDOR PORTAL MODELS
# ============================================

class VendorDispute(models.Model):
    STATUS_CHOICES = [
        ('Open', 'Open'),
        ('Under Review', 'Under Review'),
        ('Resolved', 'Resolved'),
        ('Rejected', 'Rejected'),
    ]

    vendor = models.ForeignKey(Vendor, on_delete=models.CASCADE, related_name='disputes')
    project = models.ForeignKey(Project, on_delete=models.CASCADE, null=True, blank=True, related_name='disputes')
    dispute_type = models.CharField(max_length=100, blank=True, null=True)
    dispute_subject = models.CharField(max_length=255)
    dispute_description = models.TextField()
    related_penalty = models.ForeignKey(Penalty, on_delete=models.SET_NULL, null=True, blank=True, related_name='disputes')
    dispute_status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='Open')
    submitted_date = models.DateTimeField(auto_now_add=True)
    assigned_to = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_disputes')
    resolution = models.TextField(blank=True, null=True)
    resolved_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='resolved_disputes')
    resolution_date = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        managed = False
        db_table = 'vendor_disputes'
        ordering = ['-submitted_date']

    def __str__(self):
        return f"{self.vendor.vendor_name} - {self.dispute_subject}"


class VendorFeedback(models.Model):
    TYPE_CHOICES = [
        ('Suggestion', 'Suggestion'),
        ('Complaint', 'Complaint'),
        ('Compliment', 'Compliment'),
    ]
    
    STATUS_CHOICES = [
        ('Pending', 'Pending'),
        ('Reviewed', 'Reviewed'),
        ('Actioned', 'Actioned'),
    ]

    vendor = models.ForeignKey(Vendor, on_delete=models.CASCADE, related_name='feedback')
    feedback_type = models.CharField(max_length=50, choices=TYPE_CHOICES)
    feedback_subject = models.CharField(max_length=255)
    feedback_text = models.TextField()
    rating = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)], null=True, blank=True)
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='Pending')
    reviewed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='reviewed_feedback')
    review_date = models.DateTimeField(null=True, blank=True)
    response = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        managed = False
        db_table = 'vendor_feedback'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.vendor.vendor_name} - {self.feedback_type}"


# ============================================
# AUDIT & CHANGE LOG MODELS
# ============================================

class ChangeLog(models.Model):
    CHANGE_CHOICES = [
        ('INSERT', 'INSERT'),
        ('UPDATE', 'UPDATE'),
        ('DELETE', 'DELETE'),
    ]

    table_name = models.CharField(max_length=100)
    record_id = models.IntegerField()
    change_type = models.CharField(max_length=20, choices=CHANGE_CHOICES)
    field_name = models.CharField(max_length=100, blank=True, null=True)
    old_value = models.TextField(blank=True, null=True)
    new_value = models.TextField(blank=True, null=True)
    changed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='changes')
    change_reason = models.TextField(blank=True, null=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        managed = False
        db_table = 'change_logs'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.table_name} - {self.change_type} - {self.created_at}"


class SystemAuditLog(models.Model):
    STATUS_CHOICES = [
        ('Success', 'Success'),
        ('Failed', 'Failed'),
    ]

    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='audit_logs')
    action_type = models.CharField(max_length=100)
    action_description = models.TextField(blank=True, null=True)
    entity_type = models.CharField(max_length=50, blank=True, null=True)
    entity_id = models.IntegerField(null=True, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES)
    error_message = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        managed = False
        db_table = 'system_audit_logs'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.action_type} by {self.user} - {self.created_at}"


# ============================================
# SYSTEM CONFIGURATION MODELS
# ============================================

class SystemSetting(models.Model):
    TYPE_CHOICES = [
        ('String', 'String'),
        ('Integer', 'Integer'),
        ('Boolean', 'Boolean'),
        ('JSON', 'JSON'),
    ]
    setting_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    setting_key = models.CharField(max_length=100, unique=True)
    setting_value = models.TextField(blank=True, null=True)
    setting_type = models.CharField(max_length=50, choices=TYPE_CHOICES)
    setting_description = models.TextField(blank=True, null=True)
    is_editable = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        managed = False
        db_table = 'system_settings'
        ordering = ['setting_key']

    def __str__(self):
        return self.setting_key
    
# make this new tables be created, abovemodels are already exisiting

# ============================================
# WORK ORDER MODELS (Main Database - C1 Sheet)
# ============================================

class WorkOrder(models.Model):
    """Main work order tracking - represents C1 sheet"""
    
    PRIORITY_CHOICES = [
        ('VIP', 'VIP'),
        ('High', 'High'),
        ('Medium', 'Medium'),
        ('Low', 'Low'),
    ]
    
    STATUS_CHOICES = [
        ('NEW', 'New'),
        ('FOR AUDIT', 'For Audit'),
        ('AUDITED', 'Audited'),
        ('NO COC', 'No COC'),
        ('PAID', 'Paid'),
        ('CANCELLED', 'Cancelled'),
    ]
    
    wo_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    wo_no = models.CharField(max_length=100, unique=True)  # Work Order Number
    
    # Dates
    date_received_jacket = models.DateField(null=True, blank=True)
    date_received_awarding = models.DateField(null=True, blank=True)
    date_energized = models.DateField(null=True, blank=True)  # Completion date
    date_coc_received = models.DateField(null=True, blank=True)
    date_for_audit = models.DateField(null=True, blank=True)
    date_audited = models.DateField(null=True, blank=True)
    
    # Project Details
    wo_initiator = models.CharField(max_length=50, blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    location = models.CharField(max_length=255, blank=True, null=True)
    municipality = models.CharField(max_length=100, blank=True, null=True)
    area_of_responsibility = models.CharField(max_length=100, blank=True, null=True)
    
    # Assignments
    vendor = models.ForeignKey(Vendor, on_delete=models.SET_NULL, null=True, blank=True, related_name='work_orders')
    assigned_crew = models.CharField(max_length=50, blank=True, null=True)  # AVECO, CHALLENGER, etc.
    supervisor = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='supervised_work_orders')
    assigned_qi = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='qi_work_orders')
    
    # Financial
    total_manhours = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    total_estimated_cost = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True)
    billed_cost = models.DecimalField(max_digits=15, decimal_places=2, default=0.00)
    
    # Status & Priority
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='NEW')
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='Medium')
    is_vip = models.BooleanField(default=False)
    eam_status = models.CharField(max_length=50, blank=True, null=True)
    
    # Remarks
    vendor_remarks = models.TextField(blank=True, null=True)
    c1_remarks = models.TextField(blank=True, null=True)
    clerk_remarks = models.TextField(blank=True, null=True)
    de_remarks = models.TextField(blank=True, null=True)
    
    # Calculated Fields
    days_from_energized_to_coc = models.IntegerField(null=True, blank=True)
    days_from_coc_to_audit = models.IntegerField(null=True, blank=True)
    days_from_audit_to_billing = models.IntegerField(null=True, blank=True)
    total_resolution_days = models.IntegerField(null=True, blank=True)
    
    # SLA Tracking
    target_completion_date = models.DateField(null=True, blank=True)
    is_delayed = models.BooleanField(default=False)
    delay_days = models.IntegerField(default=0)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'work_orders'
        ordering = ['-date_received_jacket']
        indexes = [
            models.Index(fields=['wo_no']),
            models.Index(fields=['status']),
            models.Index(fields=['vendor']),
            models.Index(fields=['assigned_crew']),
        ]
    
    def __str__(self):
        return f"{self.wo_no} - {self.description[:50]}"
    
    def save(self, *args, **kwargs):
        # Auto-calculate days
        if self.date_energized and self.date_coc_received:
            self.days_from_energized_to_coc = (self.date_coc_received - self.date_energized).days
        
        if self.date_coc_received and self.date_for_audit:
            self.days_from_coc_to_audit = (self.date_for_audit - self.date_coc_received).days
        
        if self.date_for_audit and self.date_audited:
            self.days_from_audit_to_billing = (self.date_audited - self.date_for_audit).days
        
        # Calculate total resolution days
        if self.date_energized and self.date_audited:
            self.total_resolution_days = (self.date_audited - self.date_energized).days
        
        # Check if delayed (target is 60 days)
        if self.total_resolution_days and self.total_resolution_days > 60:
            self.is_delayed = True
            self.delay_days = self.total_resolution_days - 60
        
        super().save(*args, **kwargs)


class WorkOrderDocument(models.Model):
    """Track documents for work orders - COC, permits, etc."""
    
    DOC_TYPE_CHOICES = [
        ('COC', 'Certificate of Completion'),
        ('PERMIT', 'Permit'),
        ('INSPECTION', 'Inspection Report'),
        ('INVOICE', 'Invoice'),
        ('OTHER', 'Other'),
    ]
    
    work_order = models.ForeignKey(WorkOrder, on_delete=models.CASCADE, related_name='wo_documents')
    document_type = models.CharField(max_length=50, choices=DOC_TYPE_CHOICES)
    document_name = models.CharField(max_length=255)
    document_file = models.FileField(upload_to='work_orders/%Y/%m/', null=True, blank=True)
    document_path = models.CharField(max_length=500, blank=True, null=True)
    
    uploaded_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    upload_date = models.DateTimeField(auto_now_add=True)
    
    is_approved = models.BooleanField(default=False)
    approved_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='approved_wo_documents')
    approval_date = models.DateTimeField(null=True, blank=True)
    
    notes = models.TextField(blank=True, null=True)
    
    class Meta:
        db_table = 'work_order_documents'
        ordering = ['-upload_date']
    
    def __str__(self):
        return f"{self.work_order.wo_no} - {self.document_type}"


# ============================================
# CREW MONITORING MODELS (Daily Crew Sheet)
# ============================================

class CrewType(models.Model):
    """Define crew types with their rates and productivity weights"""
    
    crew_code = models.CharField(max_length=50, unique=True)
    crew_name = models.CharField(max_length=100)
    
    # Productivity Weights (A, B, C, D from your formula)
    weight_a = models.IntegerField(default=4)
    weight_b = models.IntegerField(default=6)
    weight_c = models.IntegerField(default=4)
    weight_d = models.IntegerField(default=3)
    
    # Conversion factors
    conversion_factor = models.DecimalField(max_digits=10, decimal_places=4, default=1.8245)
    working_hours_per_day = models.IntegerField(default=8)
    working_days_per_month = models.IntegerField(default=26)
    
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'crew_types'
        ordering = ['crew_name']
    
    def __str__(self):
        return f"{self.crew_code} - {self.crew_name}"


class DailyCrewMonitoring(models.Model):
    """Daily crew monitoring - represents monthly crew tracking sheets"""
    
    crew_type = models.ForeignKey(CrewType, on_delete=models.CASCADE, related_name='daily_records')
    monitoring_date = models.DateField()
    
    # Values for productivity calculation: (A * 4) + (B * 6) + (C * 4) + (D * 3)
    value_a = models.IntegerField(default=0)
    value_b = models.IntegerField(default=0)
    value_c = models.IntegerField(default=0)
    value_d = models.IntegerField(default=0)
    
    # Rate (F column)
    daily_rate = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    
    # Calculated fields
    weighted_productivity = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    monthly_peso_value = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True)
    weekly_peso_value = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True)
    daily_peso_value = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True)
    
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'daily_crew_monitoring'
        unique_together = ['crew_type', 'monitoring_date']
        ordering = ['-monitoring_date']
        indexes = [
            models.Index(fields=['monitoring_date']),
            models.Index(fields=['crew_type']),
        ]
    
    def __str__(self):
        return f"{self.crew_type.crew_code} - {self.monitoring_date}"
    
    def save(self, *args, **kwargs):
        # Calculate weighted productivity: (A * 4) + (B * 6) + (C * 4) + (D * 3)
        self.weighted_productivity = (
            (self.value_a * self.crew_type.weight_a) +
            (self.value_b * self.crew_type.weight_b) +
            (self.value_c * self.crew_type.weight_c) +
            (self.value_d * self.crew_type.weight_d)
        )
        
        # Calculate peso values if daily_rate is provided
        if self.daily_rate:
            # Monthly: (Rate * 8 * 26) / 1.8245
            self.monthly_peso_value = (
                self.daily_rate * 
                self.crew_type.working_hours_per_day * 
                self.crew_type.working_days_per_month
            ) / self.crew_type.conversion_factor
            
            # Weekly: Monthly / 4
            self.weekly_peso_value = self.monthly_peso_value / 4
            
            # Daily: (Rate * 8) / 1.8245
            self.daily_peso_value = (
                self.daily_rate * 
                self.crew_type.working_hours_per_day
            ) / self.crew_type.conversion_factor
        
        super().save(*args, **kwargs)


# ============================================
# QI MONITORING MODELS (Enhanced)
# ============================================

class QIWeeklyAccomplishment(models.Model):
    """Track weekly QI accomplishments"""
    
    qi_user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='weekly_accomplishments')
    week_start_date = models.DateField()
    week_end_date = models.DateField()
    
    # Monday through Sunday counts
    monday_count = models.IntegerField(default=0)
    tuesday_count = models.IntegerField(default=0)
    wednesday_count = models.IntegerField(default=0)
    thursday_count = models.IntegerField(default=0)
    friday_count = models.IntegerField(default=0)
    saturday_count = models.IntegerField(default=0)
    sunday_count = models.IntegerField(default=0)
    
    # Totals
    total_inspections = models.IntegerField(default=0)
    target_inspections = models.IntegerField(default=0)
    target_met = models.BooleanField(default=False)
    
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'qi_weekly_accomplishments'
        unique_together = ['qi_user', 'week_start_date']
        ordering = ['-week_start_date']
    
    def __str__(self):
        return f"{self.qi_user.get_full_name()} - Week of {self.week_start_date}"
    
    def save(self, *args, **kwargs):
        # Calculate total
        self.total_inspections = (
            self.monday_count + self.tuesday_count + self.wednesday_count +
            self.thursday_count + self.friday_count + self.saturday_count +
            self.sunday_count
        )
        
        # Check if target met
        if self.target_inspections > 0:
            self.target_met = self.total_inspections >= self.target_inspections
        
        super().save(*args, **kwargs)


class QIMonthlyAccomplishment(models.Model):
    """Track monthly QI accomplishments"""
    
    qi_user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='monthly_accomplishments')
    month = models.DateField()  # First day of month
    
    # Week 1-4/5 counts
    week1_count = models.IntegerField(default=0)
    week2_count = models.IntegerField(default=0)
    week3_count = models.IntegerField(default=0)
    week4_count = models.IntegerField(default=0)
    week5_count = models.IntegerField(default=0)
    
    # Totals
    total_inspections = models.IntegerField(default=0)
    target_inspections = models.IntegerField(default=0)
    target_met = models.BooleanField(default=False)
    achievement_percentage = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'qi_monthly_accomplishments'
        unique_together = ['qi_user', 'month']
        ordering = ['-month']
    
    def __str__(self):
        return f"{self.qi_user.get_full_name()} - {self.month.strftime('%B %Y')}"
    
    def save(self, *args, **kwargs):
        # Calculate total
        self.total_inspections = (
            self.week1_count + self.week2_count + self.week3_count +
            self.week4_count + self.week5_count
        )
        
        # Calculate achievement percentage
        if self.target_inspections > 0:
            self.achievement_percentage = (self.total_inspections / self.target_inspections) * 100
            self.target_met = self.total_inspections >= self.target_inspections
        
        super().save(*args, **kwargs)


# ============================================
# PCA (Project Completion Analytics) MODELS
# ============================================

class PCAGoal(models.Model):
    """PCA monthly goals and targets"""
    
    month = models.DateField(unique=True)  # First day of month
    target_completion_count = models.IntegerField(default=0)
    target_conversion_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)  # Percentage
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'pca_goals'
        ordering = ['-month']
    
    def __str__(self):
        return f"PCA Goal - {self.month.strftime('%B %Y')}"


class PCASummary(models.Model):
    """PCA Summary - Project Completion Analytics"""
    
    month = models.DateField(unique=True)
    
    # Counts
    ytd_energized = models.IntegerField(default=0)
    carry_over_from_previous_year = models.IntegerField(default=0)
    cancelled_count = models.IntegerField(default=0)
    new_work_orders_count = models.IntegerField(default=0)
    
    # Completion metrics
    completed_count = models.IntegerField(default=0)
    completion_vs_goal = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)  # Percentage
    conversion_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)  # Percentage
    performance_completion_index = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)
    
    # By supervisor/crew
    crew_breakdown = models.JSONField(default=dict, blank=True)  # Store per-crew statistics
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'pca_summary'
        ordering = ['-month']
        verbose_name_plural = 'PCA Summaries'
    
    def __str__(self):
        return f"PCA Summary - {self.month.strftime('%B %Y')}"


# ============================================
# VENDOR PRODUCTIVITY MODELS
# ============================================

class VendorProductivityMonthly(models.Model):
    """Track vendor productivity per month"""
    
    vendor = models.ForeignKey(Vendor, on_delete=models.CASCADE, related_name='monthly_productivity')
    month = models.DateField()  # First day of month
    
    # Accomplishment
    ytd_accomplishment = models.DecimalField(max_digits=15, decimal_places=2, default=0.00)  # manhours
    monthly_accomplishment = models.DecimalField(max_digits=15, decimal_places=2, default=0.00)  # manhours
    
    # Capability
    ytd_capability = models.DecimalField(max_digits=15, decimal_places=2, default=0.00)  # manhours
    monthly_capability = models.DecimalField(max_digits=15, decimal_places=2, default=0.00)  # manhours
    declared_manpower = models.IntegerField(default=0)  # Number of crew
    
    # Performance
    actual_capability_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)
    productivity_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'vendor_productivity_monthly'
        unique_together = ['vendor', 'month']
        ordering = ['-month', 'vendor']
    
    def __str__(self):
        return f"{self.vendor.vendor_code} - {self.month.strftime('%B %Y')}"
    
    def save(self, *args, **kwargs):
        # Calculate percentages
        if self.monthly_capability > 0:
            self.actual_capability_percentage = (
                self.monthly_accomplishment / self.monthly_capability
            ) * 100
        
        if self.monthly_accomplishment > 0 and self.monthly_capability > 0:
            self.productivity_percentage = (
                self.monthly_accomplishment / self.monthly_capability
            ) * 100
        
        super().save(*args, **kwargs)


# ============================================
# AGEING ANALYSIS MODELS
# ============================================

class AgeingAnalysis(models.Model):
    """Track ageing of work orders by supervisor and crew"""
    
    AGE_BRACKET_CHOICES = [
        ('0-3', '0-3 Months'),
        ('4-6', '4-6 Months'),
        ('7-9', '7-9 Months'),
        ('10+', '10 Months and Above'),
    ]
    
    analysis_date = models.DateField()
    work_order = models.ForeignKey(WorkOrder, on_delete=models.CASCADE, related_name='ageing_records')
    
    # Classification
    age_bracket = models.CharField(max_length=10, choices=AGE_BRACKET_CHOICES)
    age_in_days = models.IntegerField()
    age_in_months = models.IntegerField()
    
    # Assignment
    supervisor = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='ageing_supervised')
    crew = models.CharField(max_length=50, blank=True, null=True)
    
    # Status at time of analysis
    status_at_analysis = models.CharField(max_length=50)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'ageing_analysis'
        ordering = ['-analysis_date', '-age_in_days']
        indexes = [
            models.Index(fields=['analysis_date']),
            models.Index(fields=['age_bracket']),
        ]
    
    def __str__(self):
        return f"{self.work_order.wo_no} - {self.age_bracket}"


# ============================================
# BACKJOB MONITORING MODEL
# ============================================

class BackjobMonitoring(models.Model):
    """Track backjobs/issues that need resolution"""
    
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('IN_PROGRESS', 'In Progress'),
        ('RESOLVED', 'Resolved'),
        ('ESCALATED', 'Escalated'),
    ]
    
    work_order = models.ForeignKey(WorkOrder, on_delete=models.CASCADE, related_name='backjobs')
    
    issue_description = models.TextField()
    issue_category = models.CharField(max_length=100, blank=True, null=True)
    reported_date = models.DateField()
    target_resolution_date = models.DateField(null=True, blank=True)
    actual_resolution_date = models.DateField(null=True, blank=True)
    
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='PENDING')
    assigned_to = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_backjobs')
    
    days_pending = models.IntegerField(default=0)
    is_overdue = models.BooleanField(default=False)
    
    resolution_notes = models.TextField(blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'backjob_monitoring'
        ordering = ['-reported_date']
    
    def __str__(self):
        return f"{self.work_order.wo_no} - Backjob"
    
    def save(self, *args, **kwargs):
        # Calculate days pending
        if self.actual_resolution_date:
            self.days_pending = (self.actual_resolution_date - self.reported_date).days
        else:
            from django.utils import timezone
            self.days_pending = (timezone.now().date() - self.reported_date).days
        
        # Check if overdue
        if self.target_resolution_date and not self.actual_resolution_date:
            from django.utils import timezone
            if timezone.now().date() > self.target_resolution_date:
                self.is_overdue = True
        
        super().save(*args, **kwargs)
        
        

# ============================================
# KPI TRACKING MODELS
# ============================================

class KPISnapshot(models.Model):
    """Store calculated KPI values for historical tracking"""
    
    KPI_TYPE_CHOICES = [
        ('CCTI', 'Customer Connection Timeliness Index'),
        ('PCA_CONVERSION', 'PCA Conversion Rate'),
        ('AGEING_COMPLETION', 'Completion of Ageing PCAs'),
        ('PAI_ADHERENCE', 'Adherence to Approved PAI SAIDI'),
        ('TERM_APT', 'PCA Termination/Modification APT'),
        ('TERM_RESOLUTION', 'PCA Termination Resolution'),
        ('PRDI', 'Project Resolution Duration Index'),
        ('COST_SETTLEMENT', 'WO Cost Settlement to RAB'),
        ('QUALITY_INDEX', 'Quality Management Index'),
        ('CAPABILITY_UTIL', 'Contractor Capability Utilization'),
    ]
    
    snapshot_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    kpi_type = models.CharField(max_length=50, choices=KPI_TYPE_CHOICES)
    period_start = models.DateField()
    period_end = models.DateField()
    
    # KPI Value
    kpi_value = models.DecimalField(max_digits=15, decimal_places=4)
    target_value = models.DecimalField(max_digits=15, decimal_places=4, null=True, blank=True)
    
    # Supporting Data
    numerator = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True)
    denominator = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True)
    sample_size = models.IntegerField(null=True, blank=True)
    
    # Metadata
    calculation_details = models.JSONField(default=dict, blank=True)
    notes = models.TextField(blank=True, null=True)
    calculated_at = models.DateTimeField(auto_now_add=True)
    calculated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    
    class Meta:
        db_table = 'kpi_snapshots'
        ordering = ['-period_end', 'kpi_type']
        indexes = [
            models.Index(fields=['kpi_type', 'period_end']),
            models.Index(fields=['period_start', 'period_end']),
        ]
    
    def __str__(self):
        return f"{self.get_kpi_type_display()} - {self.period_end}"


class KPITarget(models.Model):
    """Store KPI targets for different periods"""
    
    kpi_type = models.CharField(max_length=50)
    period_start = models.DateField()
    period_end = models.DateField()
    
    target_value = models.DecimalField(max_digits=15, decimal_places=4)
    threshold_green = models.DecimalField(max_digits=15, decimal_places=4, null=True, blank=True)
    threshold_yellow = models.DecimalField(max_digits=15, decimal_places=4, null=True, blank=True)
    threshold_red = models.DecimalField(max_digits=15, decimal_places=4, null=True, blank=True)
    
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'kpi_targets'
        ordering = ['-period_start']
        unique_together = ['kpi_type', 'period_start', 'period_end']
    
    def __str__(self):
        return f"{self.kpi_type} Target - {self.period_start} to {self.period_end}"
    
    

class EmailNotificationLog(models.Model):
    """Track daily email notifications to prevent duplicates"""
    
    NOTIFICATION_TYPE_CHOICES = [
        ('KPI_DAILY', 'Daily KPI Report'),
        ('BACKJOB', 'Backjob Alert'),
        ('OVERDUE_WO', 'Overdue Work Orders'),
        ('SLA_BREACH', 'SLA Breach Alert'),
    ]
    
    notification_type = models.CharField(max_length=50, choices=NOTIFICATION_TYPE_CHOICES)
    notification_date = models.DateField()
    sent_at = models.DateTimeField(auto_now_add=True)
    recipient_email = models.EmailField()
    status = models.CharField(max_length=20, default='SENT')
    email_content = models.TextField(blank=True, null=True)
    error_message = models.TextField(blank=True, null=True)
    
    class Meta:
        db_table = 'email_notification_log'
        unique_together = ['notification_type', 'notification_date', 'recipient_email']
        ordering = ['-notification_date']
    
    def __str__(self):
        return f"{self.notification_type} - {self.notification_date}"
