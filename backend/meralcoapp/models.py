from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone
from decimal import Decimal
import uuid


# =====================================================
# CORE SYSTEM MODELS
# =====================================================

class Role(models.Model):
    role_name = models.CharField(max_length=50, unique=True)
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.role_name

    class Meta:
        db_table = 'roles'


class Permission(models.Model):
    permission_name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.permission_name

    class Meta:
        db_table = 'permissions'


class User(AbstractUser):
    """Custom User model extending Django's AbstractUser"""
    role = models.ForeignKey(Role, on_delete=models.PROTECT)
    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Fix reverse accessor conflicts with Django's built-in User model
    groups = models.ManyToManyField(
        'auth.Group',
        verbose_name='groups',
        blank=True,
        help_text='The groups this user belongs to.',
        related_name="custom_user_set",
        related_query_name="custom_user",
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        verbose_name='user permissions',
        blank=True,
        help_text='Specific permissions for this user.',
        related_name="custom_user_set",
        related_query_name="custom_user",
    )

    def __str__(self):
        return f"{self.first_name} {self.last_name}"

    class Meta:
        db_table = 'users'


class RolePermission(models.Model):
    role = models.ForeignKey(Role, on_delete=models.CASCADE)
    permission = models.ForeignKey(Permission, on_delete=models.CASCADE)

    class Meta:
        unique_together = ('role', 'permission')
        db_table = 'role_permissions'


# =====================================================
# ORGANIZATIONAL STRUCTURE
# =====================================================

class Sector(models.Model):
    sector_name = models.CharField(max_length=100)
    sector_code = models.CharField(max_length=20, unique=True)
    location = models.CharField(max_length=200, blank=True, null=True)
    manager = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.sector_name} ({self.sector_code})"

    class Meta:
        db_table = 'sectors'


class Team(models.Model):
    team_name = models.CharField(max_length=100)
    team_code = models.CharField(max_length=20, unique=True)
    sector = models.ForeignKey(Sector, on_delete=models.CASCADE, related_name='teams')
    team_lead = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.team_name} ({self.team_code})"

    class Meta:
        db_table = 'teams'


class Vendor(models.Model):
    vendor_name = models.CharField(max_length=200)
    vendor_code = models.CharField(max_length=50, unique=True)
    contact_person = models.CharField(max_length=100, blank=True, null=True)
    email = models.EmailField(blank=True, null=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    registration_date = models.DateField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.vendor_name} ({self.vendor_code})"

    class Meta:
        db_table = 'vendors'


# =====================================================
# PROJECT AND WORK ORDER MANAGEMENT
# =====================================================

class Project(models.Model):
    PROJECT_TYPE_CHOICES = [
        ('PCA', 'PCA'),
        ('RELOCATION', 'Relocation'),
        ('GOVERNMENT', 'Government'),
        ('BBB', 'BBB'),
    ]

    PROJECT_SUBTYPE_CHOICES = [
        ('NEW', 'New'),
        ('MODIFICATION', 'Modification'),
        ('TERMINATION', 'Termination'),
        ('RELOC', 'Relocation'),
    ]

    CUSTOMER_TYPE_CHOICES = [
        ('RESIDENTIAL', 'Residential'),
        ('COMMERCIAL', 'Commercial'),
        ('INDUSTRIAL', 'Industrial'),
        ('GOVERNMENT', 'Government'),
    ]

    STATUS_CHOICES = [
        ('WMTRL', 'WMTRL'),
        ('APPR', 'Approved'),
        ('INPRG', 'In Progress'),
        ('SCHED', 'Scheduled'),
        ('COMP', 'Complete'),
        ('FCOMP', 'Final Complete'),
        ('CLOSED', 'Closed'),
    ]

    PRIORITY_CHOICES = [
        ('LOW', 'Low'),
        ('NORMAL', 'Normal'),
        ('HIGH', 'High'),
        ('URGENT', 'Urgent'),
    ]

    AGING_CATEGORY_CHOICES = [
        ('0-90', '0-90 days'),
        ('90+', '90+ days'),
        ('>90', '>90 days'),
    ]

    project_code = models.CharField(max_length=50, unique=True)
    project_name = models.CharField(max_length=200)
    project_type = models.CharField(max_length=50, choices=PROJECT_TYPE_CHOICES)
    project_subtype = models.CharField(max_length=50, choices=PROJECT_SUBTYPE_CHOICES, blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    sector = models.ForeignKey(Sector, on_delete=models.SET_NULL, null=True, blank=True)
    team = models.ForeignKey(Team, on_delete=models.SET_NULL, null=True, blank=True)
    assigned_vendor = models.ForeignKey(Vendor, on_delete=models.SET_NULL, null=True, blank=True)
    customer_name = models.CharField(max_length=200, blank=True, null=True)
    customer_type = models.CharField(max_length=50, choices=CUSTOMER_TYPE_CHOICES, blank=True, null=True)
    applied_load = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    manhours = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    project_value = models.DecimalField(max_digits=15, decimal_places=2, blank=True, null=True)
    currency = models.CharField(max_length=3, default='PHP')
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='WMTRL')
    priority_level = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='NORMAL')
    wmtrl_date = models.DateField(blank=True, null=True)
    appr_date = models.DateField(blank=True, null=True)
    start_date = models.DateField(blank=True, null=True)
    target_completion_date = models.DateField(blank=True, null=True)
    actual_completion_date = models.DateField(blank=True, null=True)
    fcomp_date = models.DateField(blank=True, null=True)
    closed_date = models.DateField(blank=True, null=True)
    spt_days = models.IntegerField(blank=True, null=True, help_text="Standard Processing Time in days")
    is_revenue = models.BooleanField(default=True)
    is_aging = models.BooleanField(default=False)
    aging_category = models.CharField(max_length=20, choices=AGING_CATEGORY_CHOICES, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.project_code} - {self.project_name}"

    @property
    def actual_days(self):
        """Calculate actual days taken for the project"""
        if self.fcomp_date and self.wmtrl_date:
            return (self.fcomp_date - self.wmtrl_date).days
        elif self.wmtrl_date:
            return (timezone.now().date() - self.wmtrl_date).days
        return None

    @property
    def is_delayed(self):
        """Check if project is delayed beyond SPT"""
        if self.spt_days and self.wmtrl_date:
            expected_completion = self.wmtrl_date + timezone.timedelta(days=self.spt_days)
            current_date = self.fcomp_date or timezone.now().date()
            return current_date > expected_completion
        return False

    class Meta:
        db_table = 'projects'
        indexes = [
            models.Index(fields=['status']),
            models.Index(fields=['assigned_vendor']),
            models.Index(fields=['team']),
            models.Index(fields=['wmtrl_date']),
            models.Index(fields=['fcomp_date']),
            models.Index(fields=['project_type', 'project_subtype']),
        ]


class WorkOrder(models.Model):
    WO_TYPE_CHOICES = [
        ('NEW', 'New'),
        ('MODIFICATION', 'Modification'),
        ('TERMINATION', 'Termination'),
        ('RELOCATION', 'Relocation'),
    ]

    wo_number = models.CharField(max_length=50, unique=True)
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='work_orders')
    wo_type = models.CharField(max_length=50, choices=WO_TYPE_CHOICES)
    description = models.TextField(blank=True, null=True)
    assigned_crew = models.CharField(max_length=100, blank=True, null=True)
    assigned_user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    manhours = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    material_cost = models.DecimalField(max_digits=12, decimal_places=2, blank=True, null=True)
    labor_cost = models.DecimalField(max_digits=12, decimal_places=2, blank=True, null=True)
    total_cost = models.DecimalField(max_digits=12, decimal_places=2, blank=True, null=True)
    status = models.CharField(max_length=50, default='PENDING')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.wo_number} - {self.project.project_code}"

    class Meta:
        db_table = 'work_orders'


# =====================================================
# DOCUMENT MANAGEMENT
# =====================================================

class DocumentType(models.Model):
    doc_type_name = models.CharField(max_length=100)
    doc_type_code = models.CharField(max_length=20, unique=True)
    description = models.TextField(blank=True, null=True)
    is_required = models.BooleanField(default=False)
    sla_days = models.IntegerField(blank=True, null=True, help_text="SLA deadline in days")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.doc_type_name} ({self.doc_type_code})"

    class Meta:
        db_table = 'document_types'


class ProjectDocument(models.Model):
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('APPROVED', 'Approved'),
        ('REJECTED', 'Rejected'),
        ('REVISION_REQUIRED', 'Revision Required'),
    ]

    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='documents')
    doc_type = models.ForeignKey(DocumentType, on_delete=models.CASCADE)
    document_name = models.CharField(max_length=200)
    file_path = models.CharField(max_length=500, blank=True, null=True)
    file_size_kb = models.IntegerField(blank=True, null=True)
    mime_type = models.CharField(max_length=100, blank=True, null=True)
    uploaded_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='uploaded_documents')
    uploaded_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='PENDING')
    approved_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='approved_documents')
    approved_at = models.DateTimeField(blank=True, null=True)
    rejection_reason = models.TextField(blank=True, null=True)
    version_number = models.IntegerField(default=1)
    is_current_version = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.document_name} - {self.project.project_code}"

    class Meta:
        db_table = 'project_documents'


class COCSubmission(models.Model):
    STATUS_CHOICES = [
        ('SUBMITTED', 'Submitted'),
        ('APPROVED', 'Approved'),
        ('REJECTED', 'Rejected'),
    ]

    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='coc_submissions')
    vendor = models.ForeignKey(Vendor, on_delete=models.CASCADE)
    submission_date = models.DateField()
    due_date = models.DateField()
    days_delayed = models.IntegerField(default=0)
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='SUBMITTED')
    approved_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    approved_date = models.DateField(blank=True, null=True)
    rejection_reason = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"COC - {self.project.project_code} - {self.vendor.vendor_name}"

    class Meta:
        db_table = 'coc_submissions'


# =====================================================
# QUALITY INSPECTION MODULE
# =====================================================

class QIInspector(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='qi_inspector')
    inspector_code = models.CharField(max_length=20, unique=True)
    specialization = models.TextField(blank=True, null=True)
    daily_target = models.IntegerField(default=5, help_text="Daily audit target")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.first_name} {self.user.last_name} ({self.inspector_code})"

    class Meta:
        db_table = 'qi_inspectors'


class QIAudit(models.Model):
    AUDIT_TYPE_CHOICES = [
        ('REGULAR', 'Regular'),
        ('RE_AUDIT', 'Re-audit'),
        ('SPOT_CHECK', 'Spot Check'),
    ]

    STATUS_CHOICES = [
        ('SCHEDULED', 'Scheduled'),
        ('IN_PROGRESS', 'In Progress'),
        ('COMPLETED', 'Completed'),
        ('CANCELLED', 'Cancelled'),
    ]

    RESULT_CHOICES = [
        ('PASSED', 'Passed'),
        ('FAILED', 'Failed'),
        ('CONDITIONAL', 'Conditional'),
        ('PENDING', 'Pending'),
    ]

    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='qi_audits')
    inspector = models.ForeignKey(QIInspector, on_delete=models.CASCADE, related_name='audits')
    audit_date = models.DateField()
    scheduled_date = models.DateField(blank=True, null=True)
    audit_type = models.CharField(max_length=50, choices=AUDIT_TYPE_CHOICES, default='REGULAR')
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='SCHEDULED')
    start_time = models.TimeField(blank=True, null=True)
    end_time = models.TimeField(blank=True, null=True)
    duration_hours = models.DecimalField(max_digits=4, decimal_places=2, blank=True, null=True)
    audit_result = models.CharField(max_length=50, choices=RESULT_CHOICES, blank=True, null=True)
    findings = models.TextField(blank=True, null=True)
    recommendations = models.TextField(blank=True, null=True)
    photos_uploaded = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Audit - {self.project.project_code} - {self.audit_date}"

    class Meta:
        db_table = 'qi_audits'
        indexes = [
            models.Index(fields=['audit_date']),
            models.Index(fields=['inspector']),
            models.Index(fields=['project']),
        ]


class QIPerformanceLog(models.Model):
    REASON_CHOICES = [
        ('SICK_LEAVE', 'Sick Leave'),
        ('SITE_ISSUE', 'Site Issue'),
        ('DOCUMENT_DELAY', 'Document Delay'),
        ('SYSTEM_ISSUE', 'System Issue'),
    ]

    inspector = models.ForeignKey(QIInspector, on_delete=models.CASCADE, related_name='performance_logs')
    log_date = models.DateField()
    target_audits = models.IntegerField()
    completed_audits = models.IntegerField(default=0)
    target_met = models.BooleanField(default=False)
    reason_not_met = models.CharField(max_length=100, choices=REASON_CHOICES, blank=True, null=True)
    custom_reason = models.TextField(blank=True, null=True)
    logged_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.inspector.user.first_name} {self.inspector.user.last_name} - {self.log_date}"

    class Meta:
        db_table = 'qi_performance_log'


# =====================================================
# SLA MONITORING AND COMPLIANCE
# =====================================================

class SLADefinition(models.Model):
    PROCESS_STAGE_CHOICES = [
        ('QI', 'Quality Inspection'),
        ('COC', 'Certificate of Completion'),
        ('BILLING', 'Billing'),
        ('COMPLETION', 'Completion'),
    ]

    sla_name = models.CharField(max_length=100)
    project_type = models.CharField(max_length=50, blank=True, null=True)
    process_stage = models.CharField(max_length=50, choices=PROCESS_STAGE_CHOICES, blank=True, null=True)
    sla_days = models.IntegerField()
    description = models.TextField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.sla_name} - {self.sla_days} days"

    class Meta:
        db_table = 'sla_definitions'


class SLATracking(models.Model):
    STATUS_CHOICES = [
        ('ACTIVE', 'Active'),
        ('COMPLETED', 'Completed'),
        ('BREACHED', 'Breached'),
    ]

    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='sla_tracking')
    sla = models.ForeignKey(SLADefinition, on_delete=models.CASCADE)
    start_date = models.DateField()
    due_date = models.DateField()
    completion_date = models.DateField(blank=True, null=True)
    days_used = models.IntegerField(blank=True, null=True)
    days_overdue = models.IntegerField(default=0)
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='ACTIVE')
    breach_reason = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.project.project_code} - {self.sla.sla_name}"

    class Meta:
        db_table = 'sla_tracking'
        indexes = [
            models.Index(fields=['status']),
            models.Index(fields=['due_date']),
        ]


# =====================================================
# PENALTY MANAGEMENT
# =====================================================

class PenaltyRule(models.Model):
    rule_name = models.CharField(max_length=100)
    project_type = models.CharField(max_length=50, blank=True, null=True)
    penalty_per_day = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    max_penalty_percentage = models.DecimalField(max_digits=5, decimal_places=2, blank=True, null=True)
    grace_period_days = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.rule_name

    class Meta:
        db_table = 'penalty_rules'


class Penalty(models.Model):
    STATUS_CHOICES = [
        ('CALCULATED', 'Calculated'),
        ('ISSUED', 'Issued'),
        ('DISPUTED', 'Disputed'),
        ('WAIVED', 'Waived'),
        ('PAID', 'Paid'),
    ]

    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='penalties')
    vendor = models.ForeignKey(Vendor, on_delete=models.CASCADE, related_name='penalties')
    rule = models.ForeignKey(PenaltyRule, on_delete=models.CASCADE)
    delay_days = models.IntegerField()
    penalty_amount = models.DecimalField(max_digits=12, decimal_places=2)
    penalty_percentage = models.DecimalField(max_digits=5, decimal_places=2, blank=True, null=True)
    memo_generated = models.BooleanField(default=False)
    memo_sent_date = models.DateField(blank=True, null=True)
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='CALCULATED')
    dispute_reason = models.TextField(blank=True, null=True)
    waiver_reason = models.TextField(blank=True, null=True)
    waived_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Penalty - {self.project.project_code} - {self.penalty_amount}"

    class Meta:
        db_table = 'penalties'
        indexes = [
            models.Index(fields=['vendor']),
            models.Index(fields=['status']),
        ]


# =====================================================
# BILLING MODULE
# =====================================================

class VendorBilling(models.Model):
    STATUS_CHOICES = [
        ('DRAFT', 'Draft'),
        ('SENT', 'Sent'),
        ('PAID', 'Paid'),
        ('OVERDUE', 'Overdue'),
    ]

    vendor = models.ForeignKey(Vendor, on_delete=models.CASCADE, related_name='billing_records')
    billing_period_start = models.DateField()
    billing_period_end = models.DateField()
    total_projects = models.IntegerField(default=0)
    total_billed_amount = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal('0.00'))
    total_paid_amount = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal('0.00'))
    outstanding_balance = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal('0.00'))
    penalty_deductions = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='DRAFT')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.vendor.vendor_name} - {self.billing_period_start} to {self.billing_period_end}"

    class Meta:
        db_table = 'vendor_billing'


class ProjectBilling(models.Model):
    billing = models.ForeignKey(VendorBilling, on_delete=models.CASCADE, related_name='billing_items')
    project = models.ForeignKey(Project, on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    penalty_amount = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    net_amount = models.DecimalField(max_digits=12, decimal_places=2)
    payment_date = models.DateField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.project.project_code} - {self.net_amount}"

    class Meta:
        db_table = 'project_billing'


# =====================================================
# NOTIFICATION SYSTEM
# =====================================================

class NotificationTemplate(models.Model):
    NOTIFICATION_TYPE_CHOICES = [
        ('EMAIL', 'Email'),
        ('SMS', 'SMS'),
        ('PUSH', 'Push Notification'),
        ('IN_APP', 'In-App Notification'),
    ]

    template_name = models.CharField(max_length=100)
    template_code = models.CharField(max_length=50, unique=True)
    subject_template = models.TextField()
    body_template = models.TextField()
    notification_type = models.CharField(max_length=50, choices=NOTIFICATION_TYPE_CHOICES)
    trigger_event = models.CharField(max_length=100)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.template_name} ({self.template_code})"

    class Meta:
        db_table = 'notification_templates'


class Notification(models.Model):
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('SENT', 'Sent'),
        ('DELIVERED', 'Delivered'),
        ('FAILED', 'Failed'),
    ]

    template = models.ForeignKey(NotificationTemplate, on_delete=models.CASCADE, blank=True, null=True)
    recipient_user = models.ForeignKey(User, on_delete=models.CASCADE, blank=True, null=True)
    recipient_email = models.EmailField(blank=True, null=True)
    recipient_phone = models.CharField(max_length=20, blank=True, null=True)
    subject = models.TextField()
    message_body = models.TextField()
    notification_type = models.CharField(max_length=50, choices=NotificationTemplate.NOTIFICATION_TYPE_CHOICES)
    project = models.ForeignKey(Project, on_delete=models.CASCADE, blank=True, null=True)
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='PENDING')
    sent_at = models.DateTimeField(blank=True, null=True)
    delivered_at = models.DateTimeField(blank=True, null=True)
    error_message = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.subject} - {self.recipient_email or self.recipient_user}"

    class Meta:
        db_table = 'notifications'
        indexes = [
            models.Index(fields=['status']),
            models.Index(fields=['recipient_user']),
        ]


# =====================================================
# ANALYTICS AND REPORTING
# =====================================================

class KPIDefinition(models.Model):
    CATEGORY_CHOICES = [
        ('ENERGY_SALES', 'Energy Sales'),
        ('CSI', 'Customer Satisfaction Index'),
        ('LTIFR', 'Lost Time Injury Frequency Rate'),
        ('SUSTAINABILITY', 'Sustainability'),
        ('CAPEX', 'Capital Expenditure'),
    ]

    UNIT_CHOICES = [
        ('INDEX', 'Index'),
        ('PERCENTAGE', 'Percentage'),
        ('DAYS', 'Days'),
        ('COUNT', 'Count'),
        ('CURRENCY', 'Currency'),
    ]

    OL_LEVEL_CHOICES = [
        ('OL1', 'OL1'),
        ('OL2', 'OL2'),
        ('OL3', 'OL3'),
    ]

    kpi_code = models.CharField(max_length=50, unique=True)
    kpi_name = models.CharField(max_length=200)
    kpi_category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)
    measurement_unit = models.CharField(max_length=50, choices=UNIT_CHOICES, blank=True, null=True)
    target_value = models.DecimalField(max_digits=15, decimal_places=4, blank=True, null=True)
    stretch_value = models.DecimalField(max_digits=15, decimal_places=4, blank=True, null=True)
    weight_percentage = models.DecimalField(max_digits=5, decimal_places=2, blank=True, null=True)
    ol_level = models.CharField(max_length=10, choices=OL_LEVEL_CHOICES, blank=True, null=True)
    calculation_formula = models.TextField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.kpi_code} - {self.kpi_name}"

    class Meta:
        db_table = 'kpi_definitions'


class KPIPerformance(models.Model):
    STATUS_CHOICES = [
        ('BELOW_TARGET', 'Below Target'),
        ('TARGET_MET', 'Target Met'),
        ('STRETCH_ACHIEVED', 'Stretch Achieved'),
    ]

    kpi = models.ForeignKey(KPIDefinition, on_delete=models.CASCADE, related_name='performance_records')
    team = models.ForeignKey(Team, on_delete=models.CASCADE, blank=True, null=True)
    sector = models.ForeignKey(Sector, on_delete=models.CASCADE, blank=True, null=True)
    measurement_date = models.DateField()
    actual_value = models.DecimalField(max_digits=15, decimal_places=4, blank=True, null=True)
    target_value = models.DecimalField(max_digits=15, decimal_places=4, blank=True, null=True)
    stretch_value = models.DecimalField(max_digits=15, decimal_places=4, blank=True, null=True)
    variance = models.DecimalField(max_digits=15, decimal_places=4, blank=True, null=True, help_text="actual - target")
    performance_percentage = models.DecimalField(max_digits=6, decimal_places=2, blank=True, null=True, help_text="(actual/target) * 100")
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, blank=True, null=True)
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.kpi.kpi_code} - {self.measurement_date}"

    class Meta:
        db_table = 'kpi_performance'
        indexes = [
            models.Index(fields=['measurement_date']),
            models.Index(fields=['team']),
        ]


class VendorPerformance(models.Model):
    vendor = models.ForeignKey(Vendor, on_delete=models.CASCADE, related_name='performance_records')
    measurement_period_start = models.DateField()
    measurement_period_end = models.DateField()
    total_projects = models.IntegerField(default=0)
    completed_on_time = models.IntegerField(default=0)
    completed_late = models.IntegerField(default=0)
    on_time_rate = models.DecimalField(max_digits=5, decimal_places=2, default=Decimal('0.00'), help_text="percentage")
    average_delay_days = models.DecimalField(max_digits=6, decimal_places=2, default=Decimal('0.00'))
    total_penalties = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))
    quality_score = models.DecimalField(max_digits=5, decimal_places=2, default=Decimal('0.00'), help_text="0-100")
    compliance_score = models.DecimalField(max_digits=5, decimal_places=2, default=Decimal('0.00'), help_text="0-100")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.vendor.vendor_name} - {self.measurement_period_start} to {self.measurement_period_end}"

    class Meta:
        db_table = 'vendor_performance'


# =====================================================
# PREDICTIVE ANALYTICS
# =====================================================

class ProjectRiskAssessment(models.Model):
    RISK_SCORE_CHOICES = [
        ('LOW', 'Low'),
        ('MEDIUM', 'Medium'),
        ('HIGH', 'High'),
    ]

    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='risk_assessments')
    risk_score = models.CharField(max_length=20, choices=RISK_SCORE_CHOICES, default='LOW')
    predicted_delay_days = models.IntegerField(default=0)
    confidence_level = models.DecimalField(max_digits=5, decimal_places=2, blank=True, null=True, help_text="0-100")
    risk_factors = models.JSONField(blank=True, null=True, help_text="Store array of contributing factors")
    assessment_date = models.DateField(default=timezone.now)
    model_version = models.CharField(max_length=20, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.project.project_code} - {self.risk_score}"

    class Meta:
        db_table = 'project_risk_assessment'


# =====================================================
# AUDIT TRAIL AND HISTORY
# =====================================================

class ChangeHistory(models.Model):
    table_name = models.CharField(max_length=100)
    record_id = models.IntegerField()
    field_name = models.CharField(max_length=100)
    old_value = models.TextField(blank=True, null=True)
    new_value = models.TextField(blank=True, null=True)
    changed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    change_reason = models.CharField(max_length=200, blank=True, null=True)
    changed_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.table_name}[{self.record_id}].{self.field_name}"

    class Meta:
        db_table = 'change_history'


class Escalation(models.Model):
    STATUS_CHOICES = [
        ('OPEN', 'Open'),
        ('RESPONDED', 'Responded'),
        ('RESOLVED', 'Resolved'),
        ('CLOSED', 'Closed'),
    ]

    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='escalations')
    escalation_level = models.IntegerField(default=1, validators=[MinValueValidator(1), MaxValueValidator(3)])
    escalated_to = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_escalations')
    escalated_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_escalations')
    escalation_reason = models.TextField()
    response_required_by = models.DateField(blank=True, null=True)
    response_received_at = models.DateTimeField(blank=True, null=True)
    response_details = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='OPEN')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Escalation L{self.escalation_level} - {self.project.project_code}"

    class Meta:
        db_table = 'escalations'


# =====================================================
# CONFIGURATION AND LOOKUP TABLES
# =====================================================

class SPTConfiguration(models.Model):
    applied_load_min = models.IntegerField(blank=True, null=True)
    applied_load_max = models.IntegerField(blank=True, null=True)
    manhour_min = models.IntegerField(blank=True, null=True)
    manhour_max = models.IntegerField(blank=True, null=True)
    spt_days = models.IntegerField()
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        if self.applied_load_min is not None:
            return f"Applied Load {self.applied_load_min}-{self.applied_load_max}: {self.spt_days} days"
        elif self.manhour_min is not None:
            return f"Manhours {self.manhour_min}-{self.manhour_max}: {self.spt_days} days"
        return f"SPT: {self.spt_days} days"

    class Meta:
        db_table = 'spt_configuration'


class SystemConfig(models.Model):
    config_key = models.CharField(max_length=100, unique=True)
    config_value = models.TextField()
    description = models.TextField(blank=True, null=True)
    is_system = models.BooleanField(default=False)
    updated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.config_key}: {self.config_value}"

    class Meta:
        db_table = 'system_config'


# =====================================================
# CUSTOM MANAGERS AND QUERYSETS
# =====================================================

class ProjectQuerySet(models.QuerySet):
    def active(self):
        return self.exclude(status__in=['CLOSED'])
    
    def delayed(self):
        return self.filter(is_aging=True)
    
    def by_vendor(self, vendor):
        return self.filter(assigned_vendor=vendor)
    
    def by_status(self, status):
        return self.filter(status=status)
    
    def completed_projects(self):
        return self.filter(status__in=['FCOMP', 'CLOSED'])


class ProjectManager(models.Manager):
    def get_queryset(self):
        return ProjectQuerySet(self.model, using=self._db)
    
    def active(self):
        return self.get_queryset().active()
    
    def delayed(self):
        return self.get_queryset().delayed()
    
    def by_vendor(self, vendor):
        return self.get_queryset().by_vendor(vendor)


# Add custom manager to Project model
Project.add_to_class('objects', ProjectManager())


class VendorQuerySet(models.QuerySet):
    def active(self):
        return self.filter(is_active=True)
    
    def with_performance(self):
        return self.prefetch_related('performance_records')


class VendorManager(models.Manager):
    def get_queryset(self):
        return VendorQuerySet(self.model, using=self._db)
    
    def active(self):
        return self.get_queryset().active()


# Add custom manager to Vendor model
Vendor.add_to_class('objects', VendorManager())


# =====================================================
# SIGNALS AND CUSTOM METHODS
# =====================================================

from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver


@receiver(post_save, sender=Project)
def update_project_spt(sender, instance, created, **kwargs):
    """Automatically calculate and set SPT when project is created or updated"""
    if created or not instance.spt_days:
        spt_config = None
        
        # Try to find SPT based on applied load first
        if instance.applied_load:
            spt_config = SPTConfiguration.objects.filter(
                applied_load_min__lte=instance.applied_load,
                applied_load_max__gte=instance.applied_load,
                is_active=True
            ).first()
        
        # If no SPT found by applied load, try manhours
        if not spt_config and instance.manhours:
            spt_config = SPTConfiguration.objects.filter(
                manhour_min__lte=instance.manhours,
                manhour_max__gte=instance.manhours,
                is_active=True
            ).first()
        
        if spt_config:
            instance.spt_days = spt_config.spt_days
            instance.save(update_fields=['spt_days'])


@receiver(post_save, sender=COCSubmission)
def calculate_coc_delay(sender, instance, created, **kwargs):
    """Calculate delay days for COC submission"""
    if created:
        if instance.submission_date > instance.due_date:
            instance.days_delayed = (instance.submission_date - instance.due_date).days
            instance.save(update_fields=['days_delayed'])


@receiver(post_save, sender=QIAudit)
def update_qi_performance(sender, instance, **kwargs):
    """Update QI inspector performance when audit is completed"""
    if instance.status == 'COMPLETED':
        performance_log, created = QIPerformanceLog.objects.get_or_create(
            inspector=instance.inspector,
            log_date=instance.audit_date,
            defaults={
                'target_audits': instance.inspector.daily_target,
                'completed_audits': 0,
                'logged_by': None
            }
        )
        
        # Count completed audits for the day
        completed_count = QIAudit.objects.filter(
            inspector=instance.inspector,
            audit_date=instance.audit_date,
            status='COMPLETED'
        ).count()
        
        performance_log.completed_audits = completed_count
        performance_log.target_met = completed_count >= performance_log.target_audits
        performance_log.save()


# =====================================================
# UTILITY FUNCTIONS
# =====================================================

def get_project_dashboard_data():
    """Get dashboard data for projects"""
    from django.db.models import Count, Sum, Q, Avg
    
    return {
        'total_projects': Project.objects.count(),
        'active_projects': Project.objects.active().count(),
        'delayed_projects': Project.objects.delayed().count(),
        'projects_by_status': Project.objects.values('status').annotate(count=Count('id')),
        'projects_by_vendor': Project.objects.values('assigned_vendor__vendor_name').annotate(count=Count('id')),
        'average_completion_days': Project.objects.filter(
            fcomp_date__isnull=False,
            wmtrl_date__isnull=False
        ).aggregate(
            avg_days=Avg('fcomp_date') - Avg('wmtrl_date')
        )
    }


def get_vendor_performance_summary():
    """Get vendor performance summary"""
    from django.db.models import Count, Sum, Q, Avg, Case, When, IntegerField
    
    return Vendor.objects.active().annotate(
        total_projects=Count('projects'),
        completed_projects=Count('projects', filter=Q(projects__status='FCOMP')),
        on_time_projects=Count(
            'projects',
            filter=Q(
                projects__status='FCOMP',
                projects__fcomp_date__lte=models.F('projects__wmtrl_date') + 
                timezone.timedelta(days=1) * models.F('projects__spt_days')
            )
        ),
        total_penalties=Sum('penalties__penalty_amount', filter=Q(penalties__status='ISSUED'))
    ).filter(total_projects__gt=0)


def calculate_ccti_index(project_ids=None):
    """Calculate Customer Connection Timeliness Index (CCTI)"""
    from django.db.models import Sum, F, Case, When, DecimalField
    
    projects = Project.objects.filter(status='FCOMP')
    if project_ids:
        projects = projects.filter(id__in=project_ids)
    
    # CCTI = Sum(Project Duration * 0.3 + Revised Duration * 0.7) / Sum(SPT)
    ccti_data = projects.aggregate(
        numerator=Sum(
            Case(
                When(
                    fcomp_date__isnull=False,
                    wmtrl_date__isnull=False,
                    then=F('fcomp_date') - F('wmtrl_date')
                ),
                default=0,
                output_field=DecimalField(max_digits=10, decimal_places=2)
            )
        ),
        denominator=Sum('spt_days')
    )
    
    if ccti_data['denominator'] and ccti_data['denominator'] > 0:
        return ccti_data['numerator'] / ccti_data['denominator']
    return 0