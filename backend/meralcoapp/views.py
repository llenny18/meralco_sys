from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Count, Sum, Avg, Q, F
from django.db.models.functions import TruncMonth
from django.utils import timezone
from datetime import date, timedelta
from .models import *
from .serializers import *
from rest_framework.permissions import AllowAny

# ============================================
# USER MANAGEMENT VIEWSETS
# ============================================

class UserRoleViewSet(viewsets.ModelViewSet):
    queryset = UserRole.objects.all()
    serializer_class = UserRoleSerializer
    permission_classes = [AllowAny]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['role_name', 'role_description']
    ordering_fields = ['role_name', 'created_at']


class PermissionViewSet(viewsets.ModelViewSet):
    queryset = Permission.objects.all()
    serializer_class = PermissionSerializer
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['module_name']
    search_fields = ['permission_name', 'permission_description']


class RolePermissionViewSet(viewsets.ModelViewSet):
    queryset = RolePermission.objects.select_related('role', 'permission').all()
    serializer_class = RolePermissionSerializer
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['role', 'permission']


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.select_related('role').all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['role', 'is_active']
    search_fields = ['username', 'email', 'first_name', 'last_name']
    ordering_fields = ['username', 'created_at', 'last_login']

    @action(detail=False, methods=['get'])
    def me(self, request):
        """Get current user details"""
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def deactivate(self, request, pk=None):
        """Deactivate a user"""
        user = self.get_object()
        user.is_active = False
        user.save()
        return Response({'status': 'user deactivated'})


class UserSessionViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = UserSession.objects.select_related('user').all()
    serializer_class = UserSessionSerializer
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['user', 'is_active']
    ordering_fields = ['login_time']


# ============================================
# VENDOR MANAGEMENT VIEWSETS
# ============================================

class VendorViewSet(viewsets.ModelViewSet):
    queryset = Vendor.objects.prefetch_related('contacts').all()
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['is_active', 'is_blacklisted', 'city', 'region']
    search_fields = ['vendor_code', 'vendor_name', 'company_name', 'email']
    ordering_fields = ['vendor_name', 'compliance_score', 'created_at']

    def get_serializer_class(self):
        if self.action == 'list':
            return VendorListSerializer
        return VendorSerializer

    @action(detail=True, methods=['post'])
    def blacklist(self, request, pk=None):
        """Blacklist a vendor"""
        vendor = self.get_object()
        vendor.is_blacklisted = True
        vendor.blacklist_reason = request.data.get('reason', '')
        vendor.blacklist_date = timezone.now()
        vendor.save()
        return Response({'status': 'vendor blacklisted'})

    @action(detail=True, methods=['post'])
    def remove_blacklist(self, request, pk=None):
        """Remove vendor from blacklist"""
        vendor = self.get_object()
        vendor.is_blacklisted = False
        vendor.blacklist_reason = None
        vendor.blacklist_date = None
        vendor.save()
        return Response({'status': 'vendor removed from blacklist'})

    @action(detail=True, methods=['get'])
    def performance_history(self, request, pk=None):
        """Get vendor performance history"""
        vendor = self.get_object()
        performance = vendor.performance_records.all()
        serializer = VendorPerformanceSerializer(performance, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def top_performers(self, request):
        """Get top performing vendors"""
        limit = int(request.query_params.get('limit', 10))
        vendors = Vendor.objects.filter(is_active=True, is_blacklisted=False).order_by('-compliance_score')[:limit]
        serializer = VendorListSerializer(vendors, many=True)
        return Response(serializer.data)


class VendorContactViewSet(viewsets.ModelViewSet):
    queryset = VendorContact.objects.select_related('vendor').all()
    serializer_class = VendorContactSerializer
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['vendor', 'is_primary']
    search_fields = ['contact_name', 'contact_email', 'contact_phone']


class VendorPerformanceViewSet(viewsets.ModelViewSet):
    queryset = VendorPerformance.objects.select_related('vendor', 'evaluator').all()
    serializer_class = VendorPerformanceSerializer
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['vendor', 'evaluator']
    ordering_fields = ['evaluation_date', 'overall_rating']


# ============================================
# PROJECT MANAGEMENT VIEWSETS
# ============================================

class SectorViewSet(viewsets.ModelViewSet):
    queryset = Sector.objects.select_related('sector_manager').all()
    serializer_class = SectorSerializer
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['is_active', 'sector_manager']
    search_fields = ['sector_code', 'sector_name', 'location']


class ProjectStatusViewSet(viewsets.ModelViewSet):
    queryset = ProjectStatus.objects.all()
    serializer_class = ProjectStatusSerializer
    permission_classes = [AllowAny]
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['status_order', 'status_name']


class ProjectViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.select_related(
        'vendor', 'sector', 'status', 'assigned_engineer', 'assigned_qi', 'wo_supervisor'
    ).prefetch_related('milestones', 'team_members').all()
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['vendor', 'sector', 'status', 'priority', 'risk_score', 
                        'is_delayed', 'assigned_engineer', 'assigned_qi']
    search_fields = ['project_code', 'project_name', 'project_location']
    ordering_fields = ['project_code', 'start_date', 'completion_date', 'created_at']

    def get_serializer_class(self):
        if self.action == 'list':
            return ProjectListSerializer
        return ProjectSerializer

    @action(detail=False, methods=['get'])
    def delayed(self, request):
        """Get all delayed projects"""
        projects = self.queryset.filter(is_delayed=True)
        serializer = ProjectListSerializer(projects, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def critical(self, request):
        """Get critical priority projects"""
        projects = self.queryset.filter(priority='Critical')
        serializer = ProjectListSerializer(projects, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def timeline(self, request, pk=None):
        """Get project workflow timeline"""
        project = self.get_object()
        workflow = project.workflow_stages.select_related('stage', 'assigned_user').all()
        serializer = ProjectWorkflowSerializer(workflow, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def documents_status(self, request, pk=None):
        """Get project document compliance status"""
        project = self.get_object()
        compliance = project.document_compliance.select_related('doc_type').all()
        serializer = DocumentComplianceSerializer(compliance, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def by_status(self, request):
        """Get projects grouped by status"""
        status_summary = Project.objects.values(
            'status__status_name', 'status__status_color'
        ).annotate(
            count=Count('id')
        ).order_by('status__status_order')
        return Response(status_summary)


class ProjectMilestoneViewSet(viewsets.ModelViewSet):
    queryset = ProjectMilestone.objects.select_related('project').all()
    serializer_class = ProjectMilestoneSerializer
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['project', 'is_completed']
    ordering_fields = ['milestone_order', 'target_date']


class ProjectTeamViewSet(viewsets.ModelViewSet):
    queryset = ProjectTeam.objects.select_related('project', 'user').all()
    serializer_class = ProjectTeamSerializer
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['project', 'user', 'is_active']


# ============================================
# WORKFLOW MANAGEMENT VIEWSETS
# ============================================

class WorkflowStageViewSet(viewsets.ModelViewSet):
    queryset = WorkflowStage.objects.all()
    serializer_class = WorkflowStageSerializer
    permission_classes = [AllowAny]
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['stage_order', 'stage_name']


class ProjectWorkflowViewSet(viewsets.ModelViewSet):
    queryset = ProjectWorkflow.objects.select_related(
        'project', 'stage', 'assigned_user'
    ).all()
    serializer_class = ProjectWorkflowSerializer
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['project', 'stage', 'status', 'is_current_stage', 'assigned_user']
    ordering_fields = ['start_date', 'due_date']

    @action(detail=False, methods=['get'])
    def overdue(self, request):
        """Get overdue workflow stages"""
        overdue = self.queryset.filter(
            completion_date__isnull=True,
            due_date__lt=date.today()
        )
        serializer = self.get_serializer(overdue, many=True)
        return Response(serializer.data)


# ============================================
# DOCUMENT MANAGEMENT VIEWSETS
# ============================================

class DocumentTypeViewSet(viewsets.ModelViewSet):
    queryset = DocumentType.objects.all()
    serializer_class = DocumentTypeSerializer
    permission_classes = [AllowAny]
    filter_backends = [filters.SearchFilter]
    search_fields = ['doc_type_name', 'doc_type_description']


class ProjectDocumentViewSet(viewsets.ModelViewSet):
    queryset = ProjectDocument.objects.select_related(
        'project', 'doc_type', 'uploaded_by', 'approved_by'
    ).all()
    serializer_class = ProjectDocumentSerializer
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['project', 'doc_type', 'approval_status', 'is_current_version', 'uploaded_by']
    search_fields = ['document_name']
    ordering_fields = ['upload_date', 'document_name']

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """Approve a document"""
        document = self.get_object()
        document.approval_status = 'Approved'
        document.approved_by = request.user
        document.approval_date = timezone.now()
        document.save()
        return Response({'status': 'document approved'})

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        """Reject a document"""
        document = self.get_object()
        document.approval_status = 'Rejected'
        document.rejection_reason = request.data.get('reason', '')
        document.save()
        return Response({'status': 'document rejected'})

    @action(detail=False, methods=['get'])
    def pending_approval(self, request):
        """Get documents pending approval"""
        pending = self.queryset.filter(approval_status='Pending')
        serializer = self.get_serializer(pending, many=True)
        return Response(serializer.data)


class DocumentComplianceViewSet(viewsets.ModelViewSet):
    queryset = DocumentCompliance.objects.select_related('project', 'doc_type').all()
    serializer_class = DocumentComplianceSerializer
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['project', 'doc_type', 'is_submitted', 'is_approved', 'is_overdue']

    @action(detail=False, methods=['get'])
    def overdue(self, request):
        """Get overdue documents"""
        overdue = self.queryset.filter(is_overdue=True, is_submitted=False)
        serializer = self.get_serializer(overdue, many=True)
        return Response(serializer.data)


# ============================================
# SLA MANAGEMENT VIEWSETS
# ============================================

class SLARuleViewSet(viewsets.ModelViewSet):
    queryset = SLARule.objects.select_related('stage').all()
    serializer_class = SLARuleSerializer
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['stage', 'is_active']
    search_fields = ['rule_name', 'rule_description']


class SLATrackingViewSet(viewsets.ModelViewSet):
    queryset = SLATracking.objects.select_related(
        'project', 'sla_rule', 'waived_by'
    ).all()
    serializer_class = SLATrackingSerializer
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['project', 'sla_rule', 'status', 'is_breached']
    ordering_fields = ['start_date', 'due_date', 'breach_days']

    @action(detail=False, methods=['get'])
    def breached(self, request):
        """Get all SLA breaches"""
        breaches = self.queryset.filter(is_breached=True, status='Breached')
        serializer = self.get_serializer(breaches, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def at_risk(self, request):
        """Get SLAs at risk of breach"""
        warning_date = date.today() + timedelta(days=2)
        at_risk = self.queryset.filter(
            completion_date__isnull=True,
            due_date__lte=warning_date,
            is_breached=False
        )
        serializer = self.get_serializer(at_risk, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def waive(self, request, pk=None):
        """Waive an SLA breach"""
        sla = self.get_object()
        sla.status = 'Waived'
        sla.waiver_reason = request.data.get('reason', '')
        sla.waived_by = request.user
        sla.waiver_date = timezone.now()
        sla.save()
        return Response({'status': 'SLA breach waived'})


# ============================================
# QUALITY INSPECTION VIEWSETS
# ============================================

class InspectionTypeViewSet(viewsets.ModelViewSet):
    queryset = InspectionType.objects.all()
    serializer_class = InspectionTypeSerializer
    permission_classes = [AllowAny]


class QIInspectionViewSet(viewsets.ModelViewSet):
    queryset = QIInspection.objects.select_related(
        'project', 'inspection_type', 'assigned_qi'
    ).all()
    serializer_class = QIInspectionSerializer
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['project', 'inspection_type', 'assigned_qi', 'inspection_result', 'is_completed']
    ordering_fields = ['scheduled_date', 'inspection_date']

    @action(detail=False, methods=['get'])
    def pending(self, request):
        """Get pending inspections"""
        pending = self.queryset.filter(is_completed=False)
        serializer = self.get_serializer(pending, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def overdue(self, request):
        """Get overdue inspections"""
        overdue = self.queryset.filter(
            is_completed=False,
            scheduled_date__lt=date.today()
        )
        serializer = self.get_serializer(overdue, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def my_inspections(self, request):
        """Get inspections assigned to current user"""
        my_inspections = self.queryset.filter(assigned_qi=request.user)
        serializer = self.get_serializer(my_inspections, many=True)
        return Response(serializer.data)


class QIDailyTargetViewSet(viewsets.ModelViewSet):
    queryset = QIDailyTarget.objects.select_related('qi_user').all()
    serializer_class = QIDailyTargetSerializer
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['qi_user', 'target_met', 'target_date']
    ordering_fields = ['target_date']

    @action(detail=False, methods=['get'])
    def my_targets(self, request):
        """Get targets for current user"""
        targets = self.queryset.filter(qi_user=request.user)
        serializer = self.get_serializer(targets, many=True)
        return Response(serializer.data)


class QIPerformanceViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = QIPerformance.objects.select_related('qi_user').all()
    serializer_class = QIPerformanceSerializer
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['qi_user']
    ordering_fields = ['evaluation_period_end', 'quality_rating']


# ============================================
# PENALTY MANAGEMENT VIEWSETS
# ============================================

class PenaltyRuleViewSet(viewsets.ModelViewSet):
    queryset = PenaltyRule.objects.all()
    serializer_class = PenaltyRuleSerializer
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['violation_type', 'is_active']
    search_fields = ['rule_name', 'rule_description']


class PenaltyViewSet(viewsets.ModelViewSet):
    queryset = Penalty.objects.select_related(
        'project', 'vendor', 'penalty_rule', 'created_by', 'approved_by', 'waived_by'
    ).all()
    serializer_class = PenaltySerializer
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['project', 'vendor', 'penalty_rule', 'penalty_status']
    ordering_fields = ['violation_date', 'penalty_amount', 'created_at']

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """Approve a penalty"""
        penalty = self.get_object()
        penalty.penalty_status = 'Issued'
        penalty.approved_by = request.user
        penalty.approval_date = timezone.now()
        penalty.issue_date = date.today()
        penalty.save()
        return Response({'status': 'penalty approved'})

    @action(detail=True, methods=['post'])
    def waive(self, request, pk=None):
        """Waive a penalty"""
        penalty = self.get_object()
        penalty.penalty_status = 'Waived'
        penalty.waiver_reason = request.data.get('reason', '')
        penalty.waived_by = request.user
        penalty.waiver_date = timezone.now()
        penalty.save()
        return Response({'status': 'penalty waived'})

    @action(detail=False, methods=['get'])
    def by_vendor(self, request):
        """Get penalties grouped by vendor"""
        vendor_id = request.query_params.get('vendor_id')
        if vendor_id:
            penalties = self.queryset.filter(vendor_id=vendor_id)
            serializer = self.get_serializer(penalties, many=True)
            return Response(serializer.data)
        return Response({'error': 'vendor_id required'}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'])
    def summary(self, request):
        """Get penalty summary statistics"""
        summary = self.queryset.aggregate(
            total_penalties=Count('id'),
            total_amount=Sum('penalty_amount'),
            issued=Count('id', filter=Q(penalty_status='Issued')),
            paid=Count('id', filter=Q(penalty_status='Paid')),
            waived=Count('id', filter=Q(penalty_status='Waived')),
            disputed=Count('id', filter=Q(penalty_status='Disputed'))
        )
        return Response(summary)


# ============================================
# BILLING MANAGEMENT VIEWSETS
# ============================================

class InvoiceViewSet(viewsets.ModelViewSet):
    queryset = Invoice.objects.select_related(
        'project', 'vendor', 'created_by', 'approved_by'
    ).prefetch_related('payments').all()
    serializer_class = InvoiceSerializer
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['vendor', 'project', 'payment_status']
    search_fields = ['invoice_number']
    ordering_fields = ['invoice_date', 'due_date', 'invoice_amount']

    @action(detail=False, methods=['get'])
    def overdue(self, request):
        """Get overdue invoices"""
        overdue = self.queryset.filter(
            payment_status__in=['Unpaid', 'Partially Paid'],
            due_date__lt=date.today()
        )
        serializer = self.get_serializer(overdue, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def summary(self, request):
        """Get invoice summary statistics"""
        summary = self.queryset.aggregate(
            total_invoices=Count('id'),
            total_amount=Sum('invoice_amount'),
            total_penalties=Sum('penalty_amount'),
            total_net=Sum('net_amount'),
            paid=Sum('net_amount', filter=Q(payment_status='Paid')),
            outstanding=Sum('net_amount', filter=~Q(payment_status='Paid'))
        )
        return Response(summary)

    @action(detail=True, methods=['post'])
    def mark_paid(self, request, pk=None):
        """Mark invoice as paid"""
        invoice = self.get_object()
        invoice.payment_status = 'Paid'
        invoice.payment_date = date.today()
        invoice.save()
        return Response({'status': 'invoice marked as paid'})


class PaymentViewSet(viewsets.ModelViewSet):
    queryset = Payment.objects.select_related('invoice', 'processed_by').all()
    serializer_class = PaymentSerializer
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['invoice', 'payment_method', 'processed_by']
    ordering_fields = ['payment_date', 'payment_amount']


# ============================================
# NOTIFICATION MANAGEMENT VIEWSETS
# ============================================

class NotificationTemplateViewSet(viewsets.ModelViewSet):
    queryset = NotificationTemplate.objects.all()
    serializer_class = NotificationTemplateSerializer
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['notification_type', 'is_active']
    search_fields = ['template_name', 'template_subject']


class NotificationViewSet(viewsets.ModelViewSet):
    queryset = Notification.objects.select_related(
        'recipient_user', 'related_project'
    ).all()
    serializer_class = NotificationSerializer
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['recipient_user', 'notification_type', 'status', 'related_project']
    ordering_fields = ['created_at', 'sent_at']

    @action(detail=False, methods=['get'])
    def my_notifications(self, request):
        """Get notifications for current user"""
        notifications = self.queryset.filter(recipient_user=request.user)
        serializer = self.get_serializer(notifications, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def unread(self, request):
        """Get unread notifications for current user"""
        unread = self.queryset.filter(
            recipient_user=request.user,
            read_at__isnull=True
        )
        serializer = self.get_serializer(unread, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        """Mark notification as read"""
        notification = self.get_object()
        notification.read_at = timezone.now()
        notification.status = 'Read'
        notification.save()
        return Response({'status': 'marked as read'})

    @action(detail=False, methods=['post'])
    def mark_all_read(self, request):
        """Mark all notifications as read for current user"""
        self.queryset.filter(
            recipient_user=request.user,
            read_at__isnull=True
        ).update(read_at=timezone.now(), status='Read')
        return Response({'status': 'all notifications marked as read'})


# ============================================
# ESCALATION MANAGEMENT VIEWSETS
# ============================================

class EscalationRuleViewSet(viewsets.ModelViewSet):
    queryset = EscalationRule.objects.select_related(
        'escalate_to_role', 'notification_template'
    ).all()
    serializer_class = EscalationRuleSerializer
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['is_active', 'escalate_to_role']
    search_fields = ['rule_name', 'rule_description']


class EscalationViewSet(viewsets.ModelViewSet):
    queryset = Escalation.objects.select_related(
        'project', 'escalation_rule', 'escalated_from_user', 
        'escalated_to_user', 'resolved_by'
    ).all()
    serializer_class = EscalationSerializer
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['project', 'status', 'escalated_to_user']
    ordering_fields = ['escalation_date', 'response_delay_hours']

    @action(detail=False, methods=['get'])
    def my_escalations(self, request):
        """Get escalations assigned to current user"""
        escalations = self.queryset.filter(escalated_to_user=request.user)
        serializer = self.get_serializer(escalations, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def open(self, request):
        """Get open escalations"""
        open_escalations = self.queryset.filter(status='Open')
        serializer = self.get_serializer(open_escalations, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def resolve(self, request, pk=None):
        """Resolve an escalation"""
        escalation = self.get_object()
        escalation.status = 'Resolved'
        escalation.resolution = request.data.get('resolution', '')
        escalation.resolved_by = request.user
        escalation.resolution_date = timezone.now()
        escalation.save()
        return Response({'status': 'escalation resolved'})


# ============================================
# ANALYTICS VIEWSETS
# ============================================

class DelayFactorViewSet(viewsets.ModelViewSet):
    queryset = DelayFactor.objects.all()
    serializer_class = DelayFactorSerializer
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['factor_category', 'is_active']
    search_fields = ['factor_name', 'factor_description']


class ProjectDelayViewSet(viewsets.ModelViewSet):
    queryset = ProjectDelay.objects.select_related(
        'project', 'factor', 'reported_by'
    ).all()
    serializer_class = ProjectDelaySerializer
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['project', 'factor', 'responsible_party']
    ordering_fields = ['delay_start_date', 'delay_days']

    @action(detail=False, methods=['get'])
    def analysis(self, request):
        """Get delay analysis"""
        analysis = self.queryset.values(
            'factor__factor_name',
            'factor__factor_category'
        ).annotate(
            occurrence_count=Count('id'),
            total_delay_days=Sum('delay_days'),
            avg_delay_days=Avg('delay_days')
        ).order_by('-occurrence_count')[:10]
        
        serializer = DelayAnalysisSerializer(analysis, many=True)
        return Response(serializer.data)


# ============================================
# VENDOR PORTAL VIEWSETS
# ============================================

class VendorDisputeViewSet(viewsets.ModelViewSet):
    queryset = VendorDispute.objects.select_related(
        'vendor', 'project', 'related_penalty', 'assigned_to', 'resolved_by'
    ).all()
    serializer_class = VendorDisputeSerializer
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['vendor', 'project', 'dispute_status', 'dispute_type']
    ordering_fields = ['submitted_date']

    @action(detail=False, methods=['get'])
    def my_disputes(self, request):
        """Get disputes for current user's vendor"""
        disputes = self.queryset.filter(vendor__email=request.user.email)
        serializer = self.get_serializer(disputes, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def assign(self, request, pk=None):
        """Assign dispute to a user"""
        dispute = self.get_object()
        user_id = request.data.get('user_id')
        try:
            user = User.objects.get(id=user_id)
            dispute.assigned_to = user
            dispute.save()
            return Response({'status': 'dispute assigned'})
        except User.DoesNotExist:
            return Response({'error': 'user not found'}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=['post'])
    def resolve(self, request, pk=None):
        """Resolve a dispute"""
        dispute = self.get_object()
        dispute.dispute_status = 'Resolved'
        dispute.resolution = request.data.get('resolution', '')
        dispute.resolved_by = request.user
        dispute.resolution_date = timezone.now()
        dispute.save()
        return Response({'status': 'dispute resolved'})


class VendorFeedbackViewSet(viewsets.ModelViewSet):
    queryset = VendorFeedback.objects.select_related(
        'vendor', 'reviewed_by'
    ).all()
    serializer_class = VendorFeedbackSerializer
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['vendor', 'feedback_type', 'status', 'rating']
    ordering_fields = ['created_at', 'rating']


# ============================================
# AUDIT & CHANGE LOG VIEWSETS
# ============================================

class ChangeLogViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = ChangeLog.objects.select_related('changed_by').all()
    serializer_class = ChangeLogSerializer
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['table_name', 'change_type', 'changed_by']
    ordering_fields = ['created_at']


class SystemAuditLogViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = SystemAuditLog.objects.select_related('user').all()
    serializer_class = SystemAuditLogSerializer
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['user', 'action_type', 'status', 'entity_type']
    ordering_fields = ['created_at']


# ============================================
# SYSTEM CONFIGURATION VIEWSETS
# ============================================

class SystemSettingViewSet(viewsets.ModelViewSet):
    queryset = SystemSetting.objects.all()
    serializer_class = SystemSettingSerializer
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['setting_type', 'is_editable']
    search_fields = ['setting_key', 'setting_description']


# ============================================
# DASHBOARD & ANALYTICS VIEWSETS
# ============================================

class DashboardViewSet(viewsets.ViewSet):
    """Dashboard analytics and statistics"""
    permission_classes = [AllowAny]

    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get overall dashboard statistics"""
        stats = {
            'total_projects': Project.objects.count(),
            'active_projects': Project.objects.exclude(
                status__status_name__in=['Completed', 'Cancelled', 'Billed']
            ).count(),
            'delayed_projects': Project.objects.filter(is_delayed=True).count(),
            'completed_projects': Project.objects.filter(
                status__status_name='Completed'
            ).count(),
            'total_vendors': Vendor.objects.count(),
            'active_vendors': Vendor.objects.filter(is_active=True).count(),
            'blacklisted_vendors': Vendor.objects.filter(is_blacklisted=True).count(),
            'pending_inspections': QIInspection.objects.filter(is_completed=False).count(),
            'overdue_documents': DocumentCompliance.objects.filter(
                is_overdue=True, is_submitted=False
            ).count(),
            'sla_breaches': SLATracking.objects.filter(is_breached=True).count(),
            'total_penalties': Penalty.objects.aggregate(
                total=Sum('penalty_amount')
            )['total'] or 0,
            'pending_invoices': Invoice.objects.exclude(payment_status='Paid').count(),
        }
        serializer = DashboardStatsSerializer(stats)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def project_status_summary(self, request):
        """Get project status distribution"""
        total_projects = Project.objects.count()
        status_summary = ProjectStatus.objects.annotate(
            project_count=Count('projects')
        ).values('status_name', 'project_count').order_by('status_order')
        
        status_list = list(status_summary)
        for item in status_list:
            if total_projects > 0:
                item['percentage'] = round(
                    (item['project_count'] / total_projects) * 100, 2
                )
            else:
                item['percentage'] = 0
        
        serializer = ProjectStatusSummarySerializer(status_list, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def vendor_performance(self, request):
        """Get vendor performance summary"""
        vendors = Vendor.objects.filter(is_active=True).annotate(
            total_projects=Count('projects'),
            delayed_projects=Count('projects', filter=Q(projects__is_delayed=True)),
            total_penalties=Sum('penalties__penalty_amount', 
                               filter=~Q(penalties__penalty_status='Waived')),
            sla_breaches=Count('projects__sla_tracking', 
                              filter=Q(projects__sla_tracking__is_breached=True))
        ).values(
            'id', 'vendor_code', 'vendor_name', 'compliance_score',
            'total_projects', 'delayed_projects', 'total_penalties', 'sla_breaches'
        )
        
        vendors_list = list(vendors)
        for vendor in vendors_list:
            if vendor['total_projects'] > 0:
                on_time = vendor['total_projects'] - vendor['delayed_projects']
                vendor['on_time_percentage'] = round(
                    (on_time / vendor['total_projects']) * 100, 2
                )
            else:
                vendor['on_time_percentage'] = 0
            vendor['total_penalties'] = vendor['total_penalties'] or 0
        
        vendors_list = sorted(vendors_list, key=lambda x: x['compliance_score'], reverse=True)
        
        serializer = VendorPerformanceSummarySerializer(vendors_list, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def delay_analysis(self, request):
        """Get delay factor analysis"""
        analysis = ProjectDelay.objects.values(
            'factor__factor_name',
            'factor__factor_category'
        ).annotate(
            occurrence_count=Count('id'),
            total_delay_days=Sum('delay_days'),
            avg_delay_days=Avg('delay_days')
        ).order_by('-occurrence_count')[:10]
        
        serializer = DelayAnalysisSerializer(analysis, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def monthly_trends(self, request):
        """Get monthly project trends"""
        trends = Project.objects.annotate(
            month=TruncMonth('created_at')
        ).values('month').annotate(
            total=Count('id'),
            completed=Count('id', filter=Q(status__status_name='Completed')),
            delayed=Count('id', filter=Q(is_delayed=True))
        ).order_by('month')
        
        return Response(list(trends))

    @action(detail=False, methods=['get'])
    def sector_summary(self, request):
        """Get project summary by sector"""
        sector_summary = Sector.objects.annotate(
            total_projects=Count('projects'),
            active_projects=Count('projects', 
                filter=~Q(projects__status__status_name__in=['Completed', 'Cancelled', 'Billed'])),
            delayed_projects=Count('projects', filter=Q(projects__is_delayed=True))
        ).values(
            'sector_code', 'sector_name', 'total_projects', 
            'active_projects', 'delayed_projects'
        )
        
        return Response(list(sector_summary))