# chatbot_data_service.py
# Place in same directory as chatbot_service.py

import re
from django.db.models import Count, Sum, Avg, Q
from django.utils import timezone
from datetime import date, timedelta


# ─────────────────────────────────────────────
# INTENT PATTERNS
# Maps keywords → intent name
# ─────────────────────────────────────────────
INTENT_PATTERNS = [
    # Defects
    (r'\b(defect|defects|defect report|defect reports)\b', 'list_defects'),
    (r'\b(open defect|pending defect|unresolved defect)\b', 'list_open_defects'),
    (r'\b(escalated defect|escalation)\b', 'list_escalated_defects'),

    # Projects
    (r'\b(my project|my projects|assigned project)\b', 'list_my_projects'),
    (r'\b(delayed project|delayed)\b', 'list_delayed_projects'),
    (r'\b(at risk|high risk project)\b', 'list_at_risk_projects'),
    (r'\b(all project|list project|show project)\b', 'list_all_projects'),
    (r'\b(critical project|urgent project)\b', 'list_critical_projects'),

    # Work Orders
    (r'\b(work order|work orders|wo list|list wo)\b', 'list_work_orders'),
    (r'\b(overdue work order|overdue wo)\b', 'list_overdue_work_orders'),

    # SLA
    (r'\b(sla breach|sla breaches|breached sla)\b', 'list_sla_breaches'),
    (r'\b(sla at risk|sla warning|approaching deadline)\b', 'list_sla_at_risk'),
    (r'\b(sla|sla status|sla compliance)\b', 'sla_summary'),

    # Penalties
    (r'\b(penalty|penalties|my penalty|vendor penalty)\b', 'list_penalties'),
    (r'\b(pending penalty|draft penalty|unpaid penalty)\b', 'list_pending_penalties'),

    # Invoices
    (r'\b(invoice|invoices|unpaid invoice|billing)\b', 'list_invoices'),

    # Inspections
    (r'\b(inspection|inspections|my inspection|pending inspection)\b', 'list_inspections'),
    (r'\b(overdue inspection|missed inspection)\b', 'list_overdue_inspections'),

    # Vendors
    (r'\b(vendor|vendors|vendor list|all vendor)\b', 'list_vendors'),
    (r'\b(blacklisted vendor|vendor blacklist)\b', 'list_blacklisted_vendors'),
    (r'\b(top vendor|best vendor|vendor ranking)\b', 'list_top_vendors'),

    # Analytics / Dashboard
    (r'\b(get_analytics|analytics|statistics|stats|dashboard|overview|summary)\b', 'get_analytics'),
    (r'\b(financial|finance|payment summary|billing summary)\b', 'get_financial_summary'),
    (r'\b(performance|kpi|metrics)\b', 'get_performance_metrics'),

    # Documents
    (r'\b(overdue document|missing document|pending document)\b', 'list_overdue_documents'),
    (r'\b(document|documents)\b', 'list_documents'),

    # Escalations
    (r'\b(escalation|escalations|open escalation)\b', 'list_escalations'),

    # Users
    (r'\b(user list|all user|list.*user|user.*list|team member)\b', 'list_users'),

    # Notifications
    (r'\b(notification|alert|my notification)\b', 'list_notifications'),
]


def detect_intent(question: str):
    """Return intent name or None."""
    q = question.lower()
    for pattern, intent in INTENT_PATTERNS:
        if re.search(pattern, q):
            return intent
    return None


# ─────────────────────────────────────────────
# ROLE CONSTANTS
# ─────────────────────────────────────────────
ROLE_ADMIN      = 'System Administrator'
ROLE_LEADER     = 'Team Leader'
ROLE_SECTOR_MGR = 'Sector Manager'
ROLE_SUPERVISOR = 'WO Supervisor'
ROLE_ENGINEER   = 'Engineer'
ROLE_QI         = 'Quality Inspector'
ROLE_VENDOR     = 'Vendor Representative'
ROLE_CLERK      = 'Clerk'
ROLE_AIDE       = 'Engineering Aide'


def _role(user):
    if user is None:
        return ''  # treat as no role
    return user.role.role_name if user and user.role else ''

def _is_admin(user):
    if user is None:
        return False
    return _role(user) == ROLE_ADMIN


# ─────────────────────────────────────────────
# HELPER: format queryset as list of dicts
# (only safe, serialisable fields)
# ─────────────────────────────────────────────
def _fmt_defects(qs, limit=10):
    rows = []
    for d in qs[:limit]:
        rows.append({
            'id':               d.defect_id,
            'defect_type':      d.defect_type,
            'severity':         d.severity,
            'status':           d.correction_status,
            'project':          d.project.project_code if d.project else '—',
            'escalated':        d.is_escalated,
            'due_date':         str(d.correction_due_date) if d.correction_due_date else '—',
        })
    return rows


def _fmt_projects(qs, limit=10):
    rows = []
    for p in qs[:limit]:
        rows.append({
            'code':       p.project_code,
            'name':       p.project_name,
            'status':     p.status.status_name if p.status else '—',
            'priority':   p.priority,
            'delayed':    p.is_delayed,
            'vendor':     p.vendor.vendor_name if p.vendor else '—',
            'completion': str(p.completion_date) if p.completion_date else '—',
        })
    return rows


def _fmt_work_orders(qs, limit=10):
    rows = []
    for w in qs[:limit]:
        rows.append({
            'wo_no':       w.wo_no,
            'status':      w.status,
            'municipality': w.municipality,
            'assigned':    w.assigned,
            'vip':         w.vip,
            'days_comp':   w.days_comp,
        })
    return rows


def _fmt_sla(qs, limit=10):
    rows = []
    for s in qs[:limit]:
        rows.append({
            'project':    s.project.project_code if s.project else '—',
            'rule':       s.sla_rule.rule_name if s.sla_rule else '—',
            'due_date':   str(s.due_date),
            'status':     s.status,
            'breached':   s.is_breached,
            'breach_days': s.breach_days,
        })
    return rows


def _fmt_penalties(qs, limit=10):
    rows = []
    for p in qs[:limit]:
        rows.append({
            'id':       p.penalty_id,
            'project':  p.project.project_code if p.project else '—',
            'vendor':   p.vendor.vendor_name if p.vendor else '—',
            'amount':   float(p.penalty_amount),
            'status':   p.penalty_status,
            'date':     str(p.violation_date),
        })
    return rows


def _fmt_invoices(qs, limit=10):
    rows = []
    for i in qs[:limit]:
        rows.append({
            'invoice_number': i.invoice_number,
            'vendor':         i.vendor.vendor_name if i.vendor else '—',
            'amount':         float(i.invoice_amount),
            'net_amount':     float(i.net_amount),
            'status':         i.payment_status,
            'due_date':       str(i.due_date) if i.due_date else '—',
        })
    return rows


def _fmt_inspections(qs, limit=10):
    rows = []
    for i in qs[:limit]:
        rows.append({
            'id':              i.inspection_id,
            'project':         i.project.project_code if i.project else '—',
            'type':            i.inspection_type.inspection_name if i.inspection_type else '—',
            'scheduled_date':  str(i.scheduled_date) if i.scheduled_date else '—',
            'result':          i.inspection_result or 'Pending',
            'completed':       i.is_completed,
        })
    return rows


def _fmt_vendors(qs, limit=10):
    rows = []
    for v in qs[:limit]:
        rows.append({
            'code':             v.vendor_code,
            'name':             v.vendor_name,
            'compliance_score': float(v.compliance_score),
            'active':           v.is_active,
            'blacklisted':      v.is_blacklisted,
        })
    return rows


def _fmt_documents(qs, limit=10):
    rows = []
    for d in qs[:limit]:
        rows.append({
            'project':   d.project.project_code if d.project else '—',
            'doc_type':  d.doc_type.doc_type_name if d.doc_type else '—',
            'due_date':  str(d.due_date) if d.due_date else '—',
            'submitted': d.is_submitted,
            'overdue':   d.is_overdue,
            'overdue_days': d.overdue_days,
        })
    return rows


def _fmt_escalations(qs, limit=10):
    rows = []
    for e in qs[:limit]:
        rows.append({
            'project':  e.project.project_code if e.project else '—',
            'rule':     e.escalation_rule.rule_name if e.escalation_rule else '—',
            'status':   e.status,
            'date':     str(e.escalation_date),
            'reason':   e.escalation_reason[:100],
        })
    return rows


def _fmt_users(qs, limit=20):
    rows = []
    for u in qs[:limit]:
        rows.append({
            'username': u.username,
            'name':     u.get_full_name(),
            'role':     u.role.role_name if u.role else '—',
            'active':   u.is_active,
        })
    return rows


# ─────────────────────────────────────────────
# MAIN DISPATCH  —  called from chatbot_service
# ─────────────────────────────────────────────
def fetch_data_for_intent(intent: str, user=None):
    """
    Return (title, rows, total) or None if intent is not a data intent.
    All imports are inside the function to avoid circular imports.
    """
    from .models import (
        DefectReport, Project, WorkOrder, SLATracking, Penalty,
        Invoice, QIInspection, Vendor, DocumentCompliance,
        Escalation, User, Notification,
    )

    role = _role(user)
    today = date.today()
    is_admin = _is_admin(user)

    # ── DEFECTS ─────────────────────────────────────────
    if intent == 'list_defects':
        if role == ROLE_VENDOR:
            vendor = Vendor.objects.filter(user=user).first()
            qs = DefectReport.objects.filter(project__vendor=vendor) if vendor else DefectReport.objects.none()
        elif role == ROLE_QI:
            qs = DefectReport.objects.filter(created_by=user)
        elif is_admin or role in (ROLE_LEADER, ROLE_SECTOR_MGR, ROLE_SUPERVISOR):
            qs = DefectReport.objects.all()
        else:
            qs = DefectReport.objects.none()
        qs = qs.select_related('project', 'created_by').order_by('-created_at')
        return ('Defect Reports', _fmt_defects(qs), qs.count())

    if intent == 'list_open_defects':
        if role == ROLE_VENDOR:
            vendor = Vendor.objects.filter(user=user).first()
            qs = DefectReport.objects.filter(project__vendor=vendor, correction_status__in=['OPEN', 'PENDING']) if vendor else DefectReport.objects.none()
        elif role == ROLE_QI:
            qs = DefectReport.objects.filter(created_by=user, correction_status__in=['OPEN', 'PENDING'])
        else:
            qs = DefectReport.objects.filter(correction_status__in=['OPEN', 'PENDING'])
        qs = qs.select_related('project').order_by('-created_at')
        return ('Open Defects', _fmt_defects(qs), qs.count())

    if intent == 'list_escalated_defects':
        qs = DefectReport.objects.filter(is_escalated=True).select_related('project').order_by('-escalated_at')
        if role == ROLE_VENDOR:
            vendor = Vendor.objects.filter(user=user).first()
            qs = qs.filter(project__vendor=vendor) if vendor else DefectReport.objects.none()
        return ('Escalated Defects', _fmt_defects(qs), qs.count())

    # ── PROJECTS ────────────────────────────────────────
    if intent == 'list_my_projects':
        if role == ROLE_VENDOR:
            vendor = Vendor.objects.filter(user=user).first()
            qs = Project.objects.filter(vendor=vendor) if vendor else Project.objects.none()
        elif role == ROLE_QI:
            qs = Project.objects.filter(assigned_qi=user)
        elif role == ROLE_ENGINEER:
            qs = Project.objects.filter(assigned_engineer=user)
        elif role == ROLE_SUPERVISOR:
            qs = Project.objects.filter(wo_supervisor=user)
        else:
            qs = Project.objects.all()
        qs = qs.select_related('status', 'vendor').order_by('-created_at')
        return ('My Projects', _fmt_projects(qs), qs.count())

    if intent == 'list_all_projects':
        if not (is_admin or role in (ROLE_LEADER, ROLE_SECTOR_MGR, ROLE_SUPERVISOR)):
            return ('Projects', [], 0)
        qs = Project.objects.select_related('status', 'vendor').order_by('-created_at')
        return ('All Projects', _fmt_projects(qs), qs.count())

    if intent == 'list_delayed_projects':
        qs = Project.objects.filter(is_delayed=True).select_related('status', 'vendor').order_by('-created_at')
        if role == ROLE_VENDOR:
            vendor = Vendor.objects.filter(user=user).first()
            qs = qs.filter(vendor=vendor) if vendor else Project.objects.none()
        return ('Delayed Projects', _fmt_projects(qs), qs.count())

    if intent == 'list_critical_projects':
        qs = Project.objects.filter(priority='Critical').select_related('status', 'vendor').order_by('-created_at')
        return ('Critical Projects', _fmt_projects(qs), qs.count())

    if intent == 'list_at_risk_projects':
        qs = Project.objects.filter(
            Q(risk_score='High') | Q(is_delayed=True)
        ).select_related('status', 'vendor').order_by('-created_at')
        return ('At-Risk Projects', _fmt_projects(qs), qs.count())

    # ── WORK ORDERS ─────────────────────────────────────
    if intent == 'list_work_orders':
        if role == ROLE_VENDOR:
            vendor = Vendor.objects.filter(user=user).first()
            qs = WorkOrder.objects.filter(vendor_id=vendor.vendor_id) if vendor else WorkOrder.objects.none()
        else:
            qs = WorkOrder.objects.all()
        qs = qs.order_by('-created_at')
        return ('Work Orders', _fmt_work_orders(qs), qs.count())

    if intent == 'list_overdue_work_orders':
        qs = WorkOrder.objects.filter(
            Q(days_comp__gt=60) |
            Q(date_received_jacket_ps__lt=today - timedelta(days=90), date_comp__isnull=True)
        ).order_by('-days_comp')
        return ('Overdue Work Orders', _fmt_work_orders(qs), qs.count())

    # ── SLA ─────────────────────────────────────────────
    if intent == 'list_sla_breaches':
        qs = SLATracking.objects.filter(is_breached=True).select_related('project', 'sla_rule').order_by('-created_at')
        if role == ROLE_VENDOR:
            vendor = Vendor.objects.filter(user=user).first()
            qs = qs.filter(project__vendor=vendor) if vendor else SLATracking.objects.none()
        return ('SLA Breaches', _fmt_sla(qs), qs.count())

    if intent == 'list_sla_at_risk':
        warning_date = today + timedelta(days=3)
        qs = SLATracking.objects.filter(
            completion_date__isnull=True,
            due_date__lte=warning_date,
            is_breached=False
        ).select_related('project', 'sla_rule').order_by('due_date')
        return ('SLA At-Risk', _fmt_sla(qs), qs.count())

    if intent == 'sla_summary':
        total   = SLATracking.objects.count()
        met     = SLATracking.objects.filter(status='Met').count()
        breached = SLATracking.objects.filter(is_breached=True).count()
        open_   = SLATracking.objects.filter(status='Open').count()
        compliance = round((met / total * 100), 2) if total else 0
        return ('SLA Summary', [{
            'total': total, 'met': met,
            'breached': breached, 'open': open_,
            'compliance_rate_pct': compliance,
        }], 1)

    # ── PENALTIES ───────────────────────────────────────
    if intent == 'list_penalties':
        if role == ROLE_VENDOR:
            vendor = Vendor.objects.filter(user=user).first()
            qs = Penalty.objects.filter(vendor=vendor) if vendor else Penalty.objects.none()
        else:
            qs = Penalty.objects.all()
        qs = qs.select_related('project', 'vendor').order_by('-created_at')
        return ('Penalties', _fmt_penalties(qs), qs.count())

    if intent == 'list_pending_penalties':
        qs = Penalty.objects.filter(penalty_status='Draft').select_related('project', 'vendor').order_by('-created_at')
        return ('Pending Penalties', _fmt_penalties(qs), qs.count())

    # ── INVOICES ────────────────────────────────────────
    if intent == 'list_invoices':
        if role == ROLE_VENDOR:
            vendor = Vendor.objects.filter(user=user).first()
            qs = Invoice.objects.filter(vendor=vendor) if vendor else Invoice.objects.none()
        else:
            qs = Invoice.objects.all()
        qs = qs.select_related('project', 'vendor').order_by('-invoice_date')
        return ('Invoices', _fmt_invoices(qs), qs.count())

    # ── INSPECTIONS ─────────────────────────────────────
    if intent == 'list_inspections':
        if role == ROLE_QI:
            qs = QIInspection.objects.filter(assigned_qi=user)
        elif role == ROLE_VENDOR:
            vendor = Vendor.objects.filter(user=user).first()
            qs = QIInspection.objects.filter(project__vendor=vendor) if vendor else QIInspection.objects.none()
        else:
            qs = QIInspection.objects.all()
        qs = qs.select_related('project', 'inspection_type', 'assigned_qi').order_by('-scheduled_date')
        return ('Inspections', _fmt_inspections(qs), qs.count())

    if intent == 'list_overdue_inspections':
        qs = QIInspection.objects.filter(
            is_completed=False,
            scheduled_date__lt=today
        ).select_related('project', 'inspection_type').order_by('scheduled_date')
        if role == ROLE_QI:
            qs = qs.filter(assigned_qi=user)
        return ('Overdue Inspections', _fmt_inspections(qs), qs.count())

    # ── VENDORS ─────────────────────────────────────────
    if intent == 'list_vendors':
        if not (is_admin or role in (ROLE_LEADER, ROLE_SECTOR_MGR, ROLE_SUPERVISOR, ROLE_ENGINEER)):
            return ('Vendors', [], 0)
        qs = Vendor.objects.filter(is_active=True).order_by('vendor_name')
        return ('Active Vendors', _fmt_vendors(qs), qs.count())

    if intent == 'list_blacklisted_vendors':
        if not (is_admin or role in (ROLE_LEADER, ROLE_SECTOR_MGR)):
            return ('Blacklisted Vendors', [], 0)
        qs = Vendor.objects.filter(is_blacklisted=True).order_by('vendor_name')
        return ('Blacklisted Vendors', _fmt_vendors(qs), qs.count())

    if intent == 'list_top_vendors':
        qs = Vendor.objects.filter(is_active=True, is_blacklisted=False).order_by('-compliance_score')
        return ('Top Vendors', _fmt_vendors(qs, limit=5), qs.count())

    # ── DOCUMENTS ───────────────────────────────────────
    if intent == 'list_overdue_documents':
        qs = DocumentCompliance.objects.filter(
            is_overdue=True, is_submitted=False
        ).select_related('project', 'doc_type').order_by('-overdue_days')
        if role == ROLE_VENDOR:
            vendor = Vendor.objects.filter(user=user).first()
            qs = qs.filter(project__vendor=vendor) if vendor else DocumentCompliance.objects.none()
        return ('Overdue Documents', _fmt_documents(qs), qs.count())

    if intent == 'list_documents':
        qs = DocumentCompliance.objects.filter(
            is_submitted=False
        ).select_related('project', 'doc_type').order_by('due_date')
        if role == ROLE_VENDOR:
            vendor = Vendor.objects.filter(user=user).first()
            qs = qs.filter(project__vendor=vendor) if vendor else DocumentCompliance.objects.none()
        return ('Pending Document Submissions', _fmt_documents(qs), qs.count())

    # ── ESCALATIONS ─────────────────────────────────────
    if intent == 'list_escalations':
        qs = Escalation.objects.filter(status='Open').select_related('project', 'escalation_rule').order_by('-escalation_date')
        if role == ROLE_VENDOR:
            return ('Escalations', [], 0)
        return ('Open Escalations', _fmt_escalations(qs), qs.count())

    # ── USERS ───────────────────────────────────────────
    if intent == 'list_users':
        if not is_admin:
            return ('Users', [], 0)
        qs = User.objects.select_related('role').filter(is_active=True).order_by('role__role_name', 'username')
        return ('Active Users', _fmt_users(qs), qs.count())

    # ── ANALYTICS ───────────────────────────────────────
    if intent == 'get_analytics':
        from .models import ProjectStatus
        data = {
            'total_projects':       Project.objects.count(),
            'active_projects':      Project.objects.exclude(status__status_name__in=['Completed','Cancelled','Billed']).count(),
            'delayed_projects':     Project.objects.filter(is_delayed=True).count(),
            'completed_projects':   Project.objects.filter(status__status_name='Completed').count(),
            'total_vendors':        Vendor.objects.count(),
            'active_vendors':       Vendor.objects.filter(is_active=True).count(),
            'blacklisted_vendors':  Vendor.objects.filter(is_blacklisted=True).count(),
            'pending_inspections':  QIInspection.objects.filter(is_completed=False).count(),
            'sla_breaches':         SLATracking.objects.filter(is_breached=True).count(),
            'open_defects':         DefectReport.objects.filter(correction_status__in=['OPEN','PENDING']).count(),
            'total_penalties_php':  float(Penalty.objects.aggregate(t=Sum('penalty_amount'))['t'] or 0),
            'pending_invoices':     Invoice.objects.exclude(payment_status='Paid').count(),
            'overdue_documents':    DocumentCompliance.objects.filter(is_overdue=True, is_submitted=False).count(),
            'open_escalations':     Escalation.objects.filter(status='Open').count(),
        }
        return ('System Analytics Overview', [data], 1)

    if intent == 'get_financial_summary':
        data = {
            'total_contract_value_php': float(Project.objects.aggregate(t=Sum('contract_value'))['t'] or 0),
            'total_invoiced_php':       float(Invoice.objects.aggregate(t=Sum('invoice_amount'))['t'] or 0),
            'total_paid_php':           float(Invoice.objects.filter(payment_status='Paid').aggregate(t=Sum('net_amount'))['t'] or 0),
            'outstanding_php':          float(Invoice.objects.exclude(payment_status='Paid').aggregate(t=Sum('net_amount'))['t'] or 0),
            'total_penalties_php':      float(Penalty.objects.exclude(penalty_status='Waived').aggregate(t=Sum('penalty_amount'))['t'] or 0),
            'waived_penalties_php':     float(Penalty.objects.filter(penalty_status='Waived').aggregate(t=Sum('penalty_amount'))['t'] or 0),
        }
        return ('Financial Summary', [data], 1)

    if intent == 'get_performance_metrics':
        total_p = Project.objects.count()
        delayed = Project.objects.filter(is_delayed=True).count()
        on_time_pct = round(((total_p - delayed) / total_p * 100), 2) if total_p else 0
        total_sla = SLATracking.objects.count()
        met_sla = SLATracking.objects.filter(status='Met').count()
        sla_pct = round((met_sla / total_sla * 100), 2) if total_sla else 0
        total_i = QIInspection.objects.filter(is_completed=True).count()
        pass_i = QIInspection.objects.filter(inspection_result='Pass').count()
        pass_pct = round((pass_i / total_i * 100), 2) if total_i else 0
        data = {
            'project_on_time_rate_pct': on_time_pct,
            'sla_compliance_rate_pct': sla_pct,
            'inspection_pass_rate_pct': pass_pct,
            'avg_vendor_compliance_score': float(Vendor.objects.filter(is_active=True).aggregate(a=Avg('compliance_score'))['a'] or 0),
            'total_work_orders': WorkOrder.objects.count(),
            'total_inspections_completed': total_i,
        }
        return ('Performance Metrics', [data], 1)

    return None   # intent not handled here