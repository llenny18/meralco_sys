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
from rest_framework import status, viewsets
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.authtoken.models import Token
from django.contrib.auth import login, logout
from django.utils import timezone
from .models import User, UserSession
from .serializers import (
    LoginSerializer, 
    UserLoginResponseSerializer,
    LogoutSerializer,
    ChangePasswordSerializer,
    RegisterUserSerializer
)


from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
from django.utils import timezone
from .models import User, UserSession, UserRole
from .serializers import (
    LoginSerializer, 
    UserLoginResponseSerializer,
    LogoutSerializer,
    ChangePasswordSerializer,
    RegisterUserSerializer
)

from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from datetime import datetime
from .ml_service import ml_service
from .chatbot_service import chatbot_service
from .serializers import (
    DelayPredictionSerializer,
    PenaltyPredictionSerializer,
    ChatRequestSerializer
)



from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.db.models import Count, Sum, Avg, Q, F
from django.db.models.functions import TruncMonth
from django.utils import timezone
from datetime import date, timedelta
from .models import *
from .serializers import *


class DashboardViewSet(viewsets.ViewSet):
    """Dashboard analytics and statistics"""
    permission_classes = [AllowAny]



    @action(detail=False, methods=['get'], url_path='upcoming_deadlines')
    def upcoming_deadlines(self, request):
        """
        Get all upcoming deadlines from various sources:
        - Work Orders
        - Projects
        - SLA Tracking
        - Document Compliance
        """
        try:
            today = timezone.now().date()
            # Get deadlines from next 90 days
            end_date = today + timedelta(days=90)
            
            deadlines = []
            
            # 1. Work Order Deadlines
            work_orders = WorkOrder.objects.filter(
                target_completion_date__range=[today, end_date],
                status__in=['NEW', 'FOR AUDIT', 'AUDITED']
            ).select_related('vendor', 'supervisor')
            
            for wo in work_orders:
                days_remaining = (wo.target_completion_date - today).days if wo.target_completion_date else 0
                deadlines.append({
                    'project_code': wo.wo_no,
                    'project_name': wo.description or 'No Description',
                    'deadline_type': 'Work Order Completion',
                    'due_date': wo.target_completion_date,
                    'days_remaining': days_remaining,
                    'priority': wo.priority,
                    'status': wo.status,
                    'assigned_to': wo.supervisor.get_full_name() if wo.supervisor else None
                })
            
            # 2. Project Completion Dates
            projects = Project.objects.filter(
                completion_date__range=[today, end_date],
                status__status_name__in=['In Progress', 'Active']
            ).select_related('vendor', 'assigned_engineer')
            
            for proj in projects:
                days_remaining = (proj.completion_date - today).days if proj.completion_date else 0
                deadlines.append({
                    'project_code': proj.project_code,
                    'project_name': proj.project_name,
                    'deadline_type': 'Project Completion',
                    'due_date': proj.completion_date,
                    'days_remaining': days_remaining,
                    'priority': proj.priority,
                    'status': proj.status.status_name if proj.status else 'Unknown',
                    'assigned_to': proj.assigned_engineer.get_full_name() if proj.assigned_engineer else None
                })
            
            # 3. SLA Tracking Deadlines
            sla_items = SLATracking.objects.filter(
                due_date__range=[today, end_date],
                status='Open'
            ).select_related('project', 'sla_rule')
            
            for sla in sla_items:
                days_remaining = (sla.due_date - today).days if sla.due_date else 0
                deadlines.append({
                    'project_code': sla.project.project_code,
                    'project_name': sla.project.project_name,
                    'deadline_type': 'SLA Deadline',
                    'due_date': sla.due_date,
                    'days_remaining': days_remaining,
                    'priority': 'High' if days_remaining <= 3 else 'Medium',
                    'status': sla.status,
                    'assigned_to': None
                })
            
            # 4. Document Compliance Deadlines
            doc_compliance = DocumentCompliance.objects.filter(
                due_date__range=[today, end_date],
                is_submitted=False
            ).select_related('project', 'doc_type')
            
            for doc in doc_compliance:
                days_remaining = (doc.due_date - today).days if doc.due_date else 0
                deadlines.append({
                    'project_code': doc.project.project_code,
                    'project_name': doc.project.project_name,
                    'deadline_type': f'Document: {doc.doc_type.doc_type_name}',
                    'due_date': doc.due_date,
                    'days_remaining': days_remaining,
                    'priority': 'Critical' if days_remaining <= 2 else 'High',
                    'status': 'Pending Submission',
                    'assigned_to': None
                })
            
            # Sort by days remaining (most urgent first)
            deadlines.sort(key=lambda x: x['days_remaining'])
            
            # Serialize and return
            serializer = UpcomingDeadlineSerializer(deadlines, many=True)
            return Response(serializer.data)
            
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=500
            )
            
    @action(detail=False, methods=['get'], url_path='stats')
    def stats(self, request):
        """Get overall dashboard statistics"""
        try:
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
                'total_penalties': float(Penalty.objects.aggregate(
                    total=Sum('penalty_amount')
                )['total'] or 0),
                'pending_invoices': Invoice.objects.exclude(payment_status='Paid').count(),
            }
            return Response(stats)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['get'], url_path='project_status_summary')
    def project_status_summary(self, request):
        """Get project status distribution"""
        try:
            total_projects = Project.objects.count()
            status_summary = ProjectStatus.objects.annotate(
                project_count=Count('projects')
            ).values('status_name', 'project_count', 'status_color').order_by('status_order')
            
            status_list = list(status_summary)
            for item in status_list:
                if total_projects > 0:
                    item['percentage'] = round(
                        (item['project_count'] / total_projects) * 100, 2
                    )
                else:
                    item['percentage'] = 0
            
            return Response(status_list)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['get'], url_path='vendor_performance')
    def vendor_performance(self, request):
        """Get vendor performance summary"""
        try:
            limit = int(request.query_params.get('limit', 10))
            
            vendors = Vendor.objects.filter(is_active=True).annotate(
                total_projects=Count('projects'),
                delayed_projects=Count('projects', filter=Q(projects__is_delayed=True)),
                total_penalties=Sum('penalties__penalty_amount', 
                                   filter=~Q(penalties__penalty_status='Waived')),
                sla_breaches=Count('projects__sla_tracking', 
                                  filter=Q(projects__sla_tracking__is_breached=True))
            ).values(
                'vendor_id', 'vendor_code', 'vendor_name', 'compliance_score',
                'total_projects', 'delayed_projects', 'total_penalties', 'sla_breaches'
            )[:limit]
            
            vendors_list = list(vendors)
            for vendor in vendors_list:
                if vendor['total_projects'] > 0:
                    on_time = vendor['total_projects'] - vendor['delayed_projects']
                    vendor['on_time_percentage'] = round(
                        (on_time / vendor['total_projects']) * 100, 2
                    )
                else:
                    vendor['on_time_percentage'] = 0
                vendor['total_penalties'] = float(vendor['total_penalties'] or 0)
                vendor['compliance_score'] = float(vendor['compliance_score'] or 0)
            
            return Response(vendors_list)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['get'], url_path='delay_analysis')
    def delay_analysis(self, request):
        """Get delay factor analysis"""
        try:
            analysis = ProjectDelay.objects.values(
                'factor__factor_name',
                'factor__factor_category'
            ).annotate(
                occurrence_count=Count('delay_id'),
                total_delay_days=Sum('delay_days'),
                avg_delay_days=Avg('delay_days')
            ).order_by('-occurrence_count')[:10]
            
            result = []
            for item in analysis:
                result.append({
                    'factor__factor_name': item['factor__factor_name'],
                    'factor__factor_category': item['factor__factor_category'],
                    'occurrence_count': item['occurrence_count'],
                    'total_delay_days': item['total_delay_days'],
                    'avg_delay_days': float(item['avg_delay_days'] or 0)
                })
            
            return Response(result)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['get'], url_path='monthly_trends')
    def monthly_trends(self, request):
        """Get monthly project trends"""
        try:
            twelve_months_ago = timezone.now() - timedelta(days=365)
            
            trends = Project.objects.filter(
                created_at__gte=twelve_months_ago
            ).annotate(
                month=TruncMonth('created_at')
            ).values('month').annotate(
                total=Count('project_id'),
                completed=Count('project_id', filter=Q(status__status_name='Completed')),
                delayed=Count('project_id', filter=Q(is_delayed=True))
            ).order_by('month')
            
            return Response(list(trends))
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['get'], url_path='project_priority_distribution')
    def project_priority_distribution(self, request):
        """Get project distribution by priority"""
        try:
            total_projects = Project.objects.count()
            
            distribution = Project.objects.values('priority').annotate(
                count=Count('project_id')
            ).order_by('-count')
            
            result = []
            for item in distribution:
                percentage = (item['count'] / total_projects * 100) if total_projects > 0 else 0
                result.append({
                    'priority': item['priority'],
                    'count': item['count'],
                    'percentage': round(percentage, 2)
                })
            
            return Response(result)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['get'], url_path='upcoming_deadlines')
    def upcoming_deadlines(self, request):
        """Get upcoming deadlines (next 7 days)"""
        try:
            today = date.today()
            next_week = today + timedelta(days=7)
            
            # SLA deadlines
            sla_deadlines = SLATracking.objects.filter(
                due_date__gte=today,
                due_date__lte=next_week,
                completion_date__isnull=True
            ).select_related('project').values(
                'project__project_code',
                'project__project_name',
                'due_date',
                'project__priority'
            )
            
            result = []
            for sla in sla_deadlines:
                days_remaining = (sla['due_date'] - today).days
                result.append({
                    'project_code': sla['project__project_code'],
                    'project_name': sla['project__project_name'],
                    'deadline_type': 'SLA Deadline',
                    'due_date': sla['due_date'].isoformat(),
                    'days_remaining': days_remaining,
                    'priority': sla['project__priority']
                })
            
            # Document deadlines
            doc_deadlines = DocumentCompliance.objects.filter(
                due_date__gte=today,
                due_date__lte=next_week,
                is_submitted=False
            ).select_related('project').values(
                'project__project_code',
                'project__project_name',
                'due_date',
                'project__priority'
            )
            
            for doc in doc_deadlines:
                days_remaining = (doc['due_date'] - today).days
                result.append({
                    'project_code': doc['project__project_code'],
                    'project_name': doc['project__project_name'],
                    'deadline_type': 'Document Deadline',
                    'due_date': doc['due_date'].isoformat(),
                    'days_remaining': days_remaining,
                    'priority': doc['project__priority']
                })
            
            # Sort by days remaining
            result.sort(key=lambda x: x['days_remaining'])
            
            return Response(result[:10])
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['get'], url_path='financial_overview')
    def financial_overview(self, request):
        """Get financial overview"""
        try:
            overview = {
                'total_contract_value': float(Project.objects.aggregate(
                    total=Sum('contract_value')
                )['total'] or 0),
                'completed_contract_value': float(Project.objects.filter(
                    status__status_name='Completed'
                ).aggregate(total=Sum('contract_value'))['total'] or 0),
                'total_penalties': float(Penalty.objects.exclude(
                    penalty_status='Waived'
                ).aggregate(total=Sum('penalty_amount'))['total'] or 0),
                'total_invoiced': float(Invoice.objects.aggregate(
                    total=Sum('invoice_amount')
                )['total'] or 0),
                'total_paid': float(Invoice.objects.filter(
                    payment_status='Paid'
                ).aggregate(total=Sum('net_amount'))['total'] or 0),
                'outstanding_payments': float(Invoice.objects.exclude(
                    payment_status='Paid'
                ).aggregate(total=Sum('net_amount'))['total'] or 0),
            }
            
            return Response(overview)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['get'], url_path='sector_summary')
    def sector_summary(self, request):
        """Get project summary by sector"""
        try:
            sector_summary = Sector.objects.annotate(
                total_projects=Count('projects'),
                active_projects=Count('projects', 
                    filter=~Q(projects__status__status_name__in=['Completed', 'Cancelled', 'Billed'])),
                delayed_projects=Count('projects', filter=Q(projects__is_delayed=True))
            ).values(
                'sector_code', 'sector_name', 'total_projects', 
                'active_projects', 'delayed_projects'
            ).order_by('-total_projects')
            
            return Response(list(sector_summary))
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
def health_check(request):
    return Response({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat()
    })

@api_view(['POST'])
def predict_delay(request):
    serializer = DelayPredictionSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        prediction = ml_service.predict_delay(serializer.validated_data)
        return Response(prediction)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
def predict_penalty(request):
    serializer = PenaltyPredictionSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        prediction = ml_service.predict_penalty(
            serializer.validated_data['violation_type'],
            serializer.validated_data['delay_days']
        )
        return Response(prediction)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework import status
from .chatbot_service import chatbot_service
from .serializers import ChatRequestSerializer
import logging

logger = logging.getLogger(__name__)

@api_view(['POST'])
@permission_classes([AllowAny])
def chat(request):
    """
    Chat endpoint for AI assistant
    
    Expected payload:
    {
        "question": "What is the Smart Vendor Monitoring System?"
    }
    
    Returns:
    {
        "question": "What is the Smart Vendor Monitoring System?",
        "answer": "The Smart Vendor Monitoring System is...",
        "confidence": 0.85,
        "matched_question": "What is the Smart Vendor Monitoring System?"
    }
    """
    serializer = ChatRequestSerializer(data=request.data)
    
    if not serializer.is_valid():
        return Response(
            {
                'error': 'Invalid request',
                'details': serializer.errors
            }, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        question = serializer.validated_data['question']
        
        # Log the incoming question
        logger.info(f"Chat question received: {question}")
        print(f"\n{'='*80}")
        print(f"📥 INCOMING QUESTION: {question}")
        print(f"{'='*80}")
        
        # Get answer from chatbot service
        answer = chatbot_service.answer(question)
        
        # Log the response
        logger.info(f"Chat answer generated: {answer[:100]}...")
        print(f"📤 RESPONSE: {answer[:200]}...")
        print(f"{'='*80}\n")
        
        return Response({
            'question': question,
            'answer': answer,
            'timestamp': request.META.get('HTTP_DATE', None)
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Chat error: {str(e)}", exc_info=True)
        print(f"❌ ERROR in chat endpoint: {e}")
        
        return Response(
            {
                'error': 'Internal server error',
                'message': 'Sorry, I encountered an error processing your question.',
                'details': str(e) if request.user.is_staff else None
            }, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([AllowAny])
def chat_health(request):
    """Check if chatbot is loaded and working"""
    try:
        # Test the chatbot
        test_answer = chatbot_service.answer("test")
        
        return Response({
            'status': 'healthy',
            'chatbot_loaded': True,
            'knowledge_base_size': len(chatbot_service.kb_questions),
            'model': 'all-MiniLM-L6-v2',
            'test_response': test_answer[:100] + "..."
        })
    except Exception as e:
        return Response({
            'status': 'error',
            'chatbot_loaded': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([AllowAny])
def chat_debug(request):
    """
    Debug endpoint to see similarity scores for a question
    Only use in development!
    """
    question = request.data.get('question', '')
    
    if not question:
        return Response({'error': 'question required'}, status=400)
    
    try:
        # Get similar questions
        similar = chatbot_service.get_similar_questions(question, top_k=10)
        
        return Response({
            'question': question,
            'similar_questions': similar,
            'threshold': 0.35
        })
    except Exception as e:
        return Response({'error': str(e)}, status=500)

def get_client_ip(request):
    """Get client IP address from request"""
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip


class AuthViewSet(viewsets.ViewSet):
    """
    Authentication ViewSet for login, logout, and password management
    """
    
    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def login(self, request):
        """
        User login endpoint
        
        Expected payload:
        {
            "username": "admin",
            "password": "admin123",
            "user_type": "admin"
        }
        """
        serializer = LoginSerializer(data=request.data)
        
        if serializer.is_valid():
            user = serializer.validated_data['user']
            
            # Update last login - FIX: Use update() to avoid datetime conversion issues
            User.objects.filter(pk=user.pk).update(last_login=timezone.now())
            
            # Refresh user instance to get updated last_login
            user.refresh_from_db()
            
            # Create or get token
            token, created = Token.objects.get_or_create(user=user)
            
            # Create user session
            user_agent = request.META.get('HTTP_USER_AGENT', '')
            ip_address = get_client_ip(request)
            
            try:
                UserSession.objects.create(
                    user=user,
                    ip_address=ip_address,
                    user_agent=user_agent,
                    is_active=True
                )
            except Exception as e:
                # Log error but don't fail login if session creation fails
                print(f"Session creation warning: {e}")
            
            # Get user data
            user_serializer = UserLoginResponseSerializer(user)
            
            # Determine redirect path based on role
            redirect_paths = {
                'System Administrator': '/admin/dashboard',
                'Team Leader': '/leader/dashboard',
                'Sector Manager': '/sector-manager/dashboard',
                'Engineer': '/engineer/dashboard',
                'Vendor Representative': '/vendor/dashboard',
                'Quality Inspector': '/qi/dashboard',
                'Clerk': '/clerk/dashboard',
                'Engineering Aide': '/aide/dashboard',
                'WO Supervisor': '/supervisor/dashboard'
            }
            
            role_name = user.role.role_name if user.role else 'user'
            redirect_path = redirect_paths.get(role_name, '/dashboard')
            
            return Response({
                'success': True,
                'message': 'Login successful',
                'token': token.key,
                'user': user_serializer.data,
                'redirect_path': redirect_path
            }, status=status.HTTP_200_OK)
        
        return Response({
            'success': False,
            'message': 'Invalid credentials or user type mismatch',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
    
    
    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
    def logout(self, request):
        """
        User logout endpoint
        Requires authentication token
        """
        try:
            # Deactivate current session
            ip_address = get_client_ip(request)
            active_sessions = UserSession.objects.filter(
                user=request.user,
                is_active=True,
                ip_address=ip_address
            )
            
            for session in active_sessions:
                session.is_active = False
                session.logout_time = timezone.now()
                session.save()
            
            # Delete token
            request.user.auth_token.delete()
            
            return Response({
                'success': True,
                'message': 'Logout successful'
            }, status=status.HTTP_200_OK)
        
        except Exception as e:
            return Response({
                'success': False,
                'message': 'Logout failed',
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)
    
    
    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
    def change_password(self, request):
        """
        Change user password endpoint
        Requires authentication token
        
        Expected payload:
        {
            "old_password": "current_password",
            "new_password": "new_password",
            "confirm_password": "new_password"
        }
        """
        serializer = ChangePasswordSerializer(data=request.data)
        
        if serializer.is_valid():
            user = request.user
            
            # Check old password
            if not user.check_password(serializer.validated_data['old_password']):
                return Response({
                    'success': False,
                    'message': 'Old password is incorrect'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Set new password
            user.set_password(serializer.validated_data['new_password'])
            user.save()
            
            # Update token
            Token.objects.filter(user=user).delete()
            token = Token.objects.create(user=user)
            
            return Response({
                'success': True,
                'message': 'Password changed successfully',
                'token': token.key
            }, status=status.HTTP_200_OK)
        
        return Response({
            'success': False,
            'message': 'Password change failed',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
    
    
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def me(self, request):
        """
        Get current authenticated user details
        """
        serializer = UserLoginResponseSerializer(request.user)
        return Response({
            'success': True,
            'user': serializer.data
        }, status=status.HTTP_200_OK)
    
    
    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def register(self, request):
        """
        User registration endpoint (optional - can be restricted)
        
        Expected payload:
        {
            "username": "newuser",
            "email": "user@example.com",
            "first_name": "John",
            "last_name": "Doe",
            "password": "password123",
            "confirm_password": "password123",
            "role_name": "engineer",
            "phone_number": "+1234567890"
        }
        """
        serializer = RegisterUserSerializer(data=request.data)
        
        if serializer.is_valid():
            user = serializer.save()
            token = Token.objects.create(user=user)
            user_data = UserLoginResponseSerializer(user).data
            
            return Response({
                'success': True,
                'message': 'User registered successfully',
                'token': token.key,
                'user': user_data
            }, status=status.HTTP_201_CREATED)
        
        return Response({
            'success': False,
            'message': 'Registration failed',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


# Standalone view for getting user roles
from rest_framework.decorators import api_view, permission_classes

@api_view(['GET'])
@permission_classes([AllowAny])
def get_user_roles(request):
    """
    Get list of available user roles for the login dropdown
    """
    roles = UserRole.objects.values('role_id', 'role_name', 'role_description')
    
    # Map to frontend format
    user_types = [
        {
            'value': role['role_name'],
            'label': role['role_name'].replace('-', ' ').title()
        }
        for role in roles
    ]
    
    return Response({
        'success': True,
        'user_types': user_types
    }, status=status.HTTP_200_OK)


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




from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Count, Sum, Avg, Q, F
from django.utils import timezone
from datetime import datetime, timedelta
from django_filters.rest_framework import DjangoFilterBackend

# ============================================
# WORK ORDER VIEWSETS
# ============================================

class WorkOrderViewSet(viewsets.ModelViewSet):
    queryset = WorkOrder.objects.all()
    serializer_class = WorkOrderSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'priority', 'vendor', 'assigned_crew', 'supervisor', 'is_vip', 'is_delayed']
    search_fields = ['wo_no', 'description', 'location', 'municipality']
    ordering_fields = ['date_received_jacket', 'date_energized', 'total_resolution_days', 'created_at']
    ordering = ['-date_received_jacket']
    
    def get_serializer_class(self):
        if self.action == 'list':
            return WorkOrderListSerializer
        return WorkOrderSerializer
    
    @action(detail=False, methods=['get'])
    def dashboard_stats(self, request):
        """Get dashboard statistics for work orders"""
        total_count = WorkOrder.objects.count()
        
        status_breakdown = WorkOrder.objects.values('status').annotate(
            count=Count('wo_id')
        )
        
        delayed_count = WorkOrder.objects.filter(is_delayed=True).count()
        
        # Average resolution time
        avg_resolution = WorkOrder.objects.filter(
            total_resolution_days__isnull=False
        ).aggregate(
            avg_days=Avg('total_resolution_days')
        )
        
        # Recent work orders
        recent_wo = WorkOrder.objects.all()[:10]
        
        # VIP projects
        vip_count = WorkOrder.objects.filter(is_vip=True).count()
        
        return Response({
            'total_count': total_count,
            'status_breakdown': status_breakdown,
            'delayed_count': delayed_count,
            'delayed_percentage': (delayed_count / total_count * 100) if total_count > 0 else 0,
            'average_resolution_days': avg_resolution['avg_days'],
            'vip_count': vip_count,
            'recent_work_orders': WorkOrderListSerializer(recent_wo, many=True).data
        })
    
    @action(detail=False, methods=['get'])
    def by_vendor(self, request):
        """Get work orders grouped by vendor"""
        vendor_stats = WorkOrder.objects.values(
            'vendor__vendor_code', 
            'vendor__vendor_name'
        ).annotate(
            total_wo=Count('wo_id'),
            completed=Count('wo_id', filter=Q(status='AUDITED')),
            delayed=Count('wo_id', filter=Q(is_delayed=True)),
            avg_resolution_days=Avg('total_resolution_days')
        ).order_by('-total_wo')
        
        return Response(vendor_stats)
    
    @action(detail=False, methods=['get'])
    def by_crew(self, request):
        """Get work orders grouped by crew"""
        crew_stats = WorkOrder.objects.values('assigned_crew').annotate(
            total_wo=Count('wo_id'),
            completed=Count('wo_id', filter=Q(status='AUDITED')),
            pending=Count('wo_id', filter=Q(status__in=['NEW', 'FOR AUDIT'])),
            avg_resolution_days=Avg('total_resolution_days')
        ).order_by('-total_wo')
        
        return Response(crew_stats)
    
    @action(detail=False, methods=['get'])
    def delayed_projects(self, request):
        """Get all delayed projects"""
        delayed = WorkOrder.objects.filter(is_delayed=True).order_by('-delay_days')
        serializer = self.get_serializer(delayed, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def export_excel(self, request):
        """Export work orders to Excel format (matching your C1 sheet)"""
        # This will be implemented with pandas/openpyxl
        # For now, return the data structure
        work_orders = self.get_queryset()
        serializer = self.get_serializer(work_orders, many=True)
        
        return Response({
            'message': 'Excel export endpoint',
            'data': serializer.data,
            'format': 'C1_sheet_format'
        })
    
    @action(detail=True, methods=['post'])
    def upload_document(self, request, pk=None):
        """Upload a document for this work order"""
        work_order = self.get_object()
        
        serializer = WorkOrderDocumentSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(
                work_order=work_order,
                uploaded_by=request.user
            )
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['get'])
    def documents(self, request, pk=None):
        """Get all documents for this work order"""
        work_order = self.get_object()
        documents = work_order.wo_documents.all()
        serializer = WorkOrderDocumentSerializer(documents, many=True)
        return Response(serializer.data)


class WorkOrderDocumentViewSet(viewsets.ModelViewSet):
    queryset = WorkOrderDocument.objects.all()
    serializer_class = WorkOrderDocumentSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['work_order', 'document_type', 'is_approved']
    ordering = ['-upload_date']
    
    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """Approve a document"""
        document = self.get_object()
        document.is_approved = True
        document.approved_by = request.user
        document.approval_date = timezone.now()
        document.save()
        
        serializer = self.get_serializer(document)
        return Response(serializer.data)


# ============================================
# CREW MONITORING VIEWSETS
# ============================================

class CrewTypeViewSet(viewsets.ModelViewSet):
    queryset = CrewType.objects.all()
    serializer_class = CrewTypeSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['crew_code', 'crew_name']
    ordering = ['crew_code']


class DailyCrewMonitoringViewSet(viewsets.ModelViewSet):
    queryset = DailyCrewMonitoring.objects.all()
    serializer_class = DailyCrewMonitoringSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['crew_type', 'monitoring_date']
    ordering = ['-monitoring_date']
    
    @action(detail=False, methods=['get'])
    def monthly_summary(self, request):
        """Get monthly summary for all crews"""
        month_param = request.query_params.get('month')
        
        if month_param:
            try:
                month_date = datetime.strptime(month_param, '%Y-%m-%d').date()
            except ValueError:
                return Response({'error': 'Invalid date format. Use YYYY-MM-DD'}, 
                              status=status.HTTP_400_BAD_REQUEST)
        else:
            month_date = timezone.now().date().replace(day=1)
        
        # Get next month for filtering
        if month_date.month == 12:
            next_month = month_date.replace(year=month_date.year + 1, month=1)
        else:
            next_month = month_date.replace(month=month_date.month + 1)
        
        summary = DailyCrewMonitoring.objects.filter(
            monitoring_date__gte=month_date,
            monitoring_date__lt=next_month
        ).values(
            'crew_type__crew_code',
            'crew_type__crew_name'
        ).annotate(
            total_productivity=Sum('weighted_productivity'),
            total_peso_value=Sum('monthly_peso_value'),
            average_daily_productivity=Avg('weighted_productivity'),
            days_recorded=Count('monitoring_date')
        )
        
        return Response(summary)
    
    @action(detail=False, methods=['get'])
    def crew_comparison(self, request):
        """Compare productivity across all crews"""
        month_param = request.query_params.get('month')
        
        if month_param:
            month_date = datetime.strptime(month_param, '%Y-%m-%d').date()
        else:
            month_date = timezone.now().date().replace(day=1)
        
        if month_date.month == 12:
            next_month = month_date.replace(year=month_date.year + 1, month=1)
        else:
            next_month = month_date.replace(month=month_date.month + 1)
        
        comparison = DailyCrewMonitoring.objects.filter(
            monitoring_date__gte=month_date,
            monitoring_date__lt=next_month
        ).values('crew_type__crew_code').annotate(
            total_productivity=Sum('weighted_productivity'),
            avg_productivity=Avg('weighted_productivity'),
            total_value=Sum('daily_peso_value')
        ).order_by('-total_productivity')
        
        return Response(comparison)


# ============================================
# QI MONITORING VIEWSETS
# ============================================

class QIWeeklyAccomplishmentViewSet(viewsets.ModelViewSet):
    queryset = QIWeeklyAccomplishment.objects.all()
    serializer_class = QIWeeklyAccomplishmentSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['qi_user', 'week_start_date', 'target_met']
    ordering = ['-week_start_date']
    
    @action(detail=False, methods=['get'])
    def current_week(self, request):
        """Get current week's accomplishments for all QIs"""
        today = timezone.now().date()
        week_start = today - timedelta(days=today.weekday())
        
        current_week = QIWeeklyAccomplishment.objects.filter(
            week_start_date=week_start
        )
        
        serializer = self.get_serializer(current_week, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def qi_performance(self, request):
        """Get performance statistics for all QIs"""
        qi_id = request.query_params.get('qi_user')
        
        queryset = self.get_queryset()
        if qi_id:
            queryset = queryset.filter(qi_user_id=qi_id)
        
        stats = queryset.aggregate(
            total_weeks=Count('id'),
            total_inspections=Sum('total_inspections'),
            avg_weekly_inspections=Avg('total_inspections'),
            weeks_target_met=Count('id', filter=Q(target_met=True))
        )
        
        if stats['total_weeks']:
            stats['target_achievement_rate'] = (
                stats['weeks_target_met'] / stats['total_weeks'] * 100
            )
        else:
            stats['target_achievement_rate'] = 0
        
        return Response(stats)


class QIMonthlyAccomplishmentViewSet(viewsets.ModelViewSet):
    queryset = QIMonthlyAccomplishment.objects.all()
    serializer_class = QIMonthlyAccomplishmentSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['qi_user', 'month', 'target_met']
    ordering = ['-month']
    
    @action(detail=False, methods=['get'])
    def current_month(self, request):
        """Get current month's accomplishments"""
        current_month = timezone.now().date().replace(day=1)
        
        accomplishments = QIMonthlyAccomplishment.objects.filter(
            month=current_month
        )
        
        serializer = self.get_serializer(accomplishments, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def yearly_summary(self, request):
        """Get yearly summary for a QI"""
        qi_id = request.query_params.get('qi_user')
        year = request.query_params.get('year', timezone.now().year)
        
        if not qi_id:
            return Response({'error': 'qi_user parameter required'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        start_date = datetime(int(year), 1, 1).date()
        end_date = datetime(int(year), 12, 31).date()
        
        yearly_data = QIMonthlyAccomplishment.objects.filter(
            qi_user_id=qi_id,
            month__gte=start_date,
            month__lte=end_date
        ).order_by('month')
        
        serializer = self.get_serializer(yearly_data, many=True)
        
        # Calculate totals
        totals = yearly_data.aggregate(
            total_inspections=Sum('total_inspections'),
            total_target=Sum('target_inspections'),
            months_target_met=Count('id', filter=Q(target_met=True))
        )
        
        return Response({
            'monthly_data': serializer.data,
            'yearly_totals': totals
        })


# ============================================
# PCA VIEWSETS
# ============================================

class PCAGoalViewSet(viewsets.ModelViewSet):
    queryset = PCAGoal.objects.all()
    serializer_class = PCAGoalSerializer
    ordering = ['-month']


class PCASummaryViewSet(viewsets.ModelViewSet):
    queryset = PCASummary.objects.all()
    serializer_class = PCASummarySerializer
    ordering = ['-month']
    
    @action(detail=False, methods=['get'])
    def current_month(self, request):
        """Get current month's PCA summary"""
        current_month = timezone.now().date().replace(day=1)
        
        try:
            summary = PCASummary.objects.get(month=current_month)
            serializer = self.get_serializer(summary)
            return Response(serializer.data)
        except PCASummary.DoesNotExist:
            return Response({'message': 'No summary for current month'}, 
                          status=status.HTTP_404_NOT_FOUND)
    
    @action(detail=False, methods=['post'])
    def generate_summary(self, request):
        """Generate PCA summary for a specific month"""
        month_param = request.data.get('month')
        
        if not month_param:
            return Response({'error': 'month parameter required'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        try:
            month_date = datetime.strptime(month_param, '%Y-%m-%d').date()
        except ValueError:
            return Response({'error': 'Invalid date format. Use YYYY-MM-DD'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        # Calculate statistics from WorkOrder model
        if month_date.month == 12:
            next_month = month_date.replace(year=month_date.year + 1, month=1)
        else:
            next_month = month_date.replace(month=month_date.month + 1)
        
        # Get work orders for the month
        monthly_wos = WorkOrder.objects.filter(
            date_energized__gte=month_date,
            date_energized__lt=next_month
        )
        
        ytd_energized = WorkOrder.objects.filter(
            date_energized__year=month_date.year,
            date_energized__lte=month_date
        ).count()
        
        completed_count = monthly_wos.filter(status='AUDITED').count()
        cancelled_count = monthly_wos.filter(status='CANCELLED').count()
        
        # Get or create summary
        summary, created = PCASummary.objects.update_or_create(
            month=month_date,
            defaults={
                'ytd_energized': ytd_energized,
                'completed_count': completed_count,
                'cancelled_count': cancelled_count,
                'new_work_orders_count': monthly_wos.count()
            }
        )
        
        serializer = self.get_serializer(summary)
        return Response(serializer.data)


# ============================================
# VENDOR PRODUCTIVITY VIEWSETS
# ============================================

class VendorProductivityMonthlyViewSet(viewsets.ModelViewSet):
    queryset = VendorProductivityMonthly.objects.all()
    serializer_class = VendorProductivityMonthlySerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['vendor', 'month']
    ordering = ['-month']
    
    @action(detail=False, methods=['get'])
    def comparison(self, request):
        """Compare all vendors for a specific month"""
        month_param = request.query_params.get('month')
        
        if not month_param:
            month_date = timezone.now().date().replace(day=1)
        else:
            month_date = datetime.strptime(month_param, '%Y-%m-%d').date()
        
        comparison = VendorProductivityMonthly.objects.filter(
            month=month_date
        ).select_related('vendor').order_by('-productivity_percentage')
        
        serializer = self.get_serializer(comparison, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def vendor_trend(self, request):
        """Get productivity trend for a specific vendor"""
        vendor_id = request.query_params.get('vendor')
        months = int(request.query_params.get('months', 6))
        
        if not vendor_id:
            return Response({'error': 'vendor parameter required'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        end_date = timezone.now().date().replace(day=1)
        start_date = end_date - timedelta(days=30 * months)
        
        trend_data = VendorProductivityMonthly.objects.filter(
            vendor_id=vendor_id,
            month__gte=start_date,
            month__lte=end_date
        ).order_by('month')
        
        serializer = self.get_serializer(trend_data, many=True)
        return Response(serializer.data)


# ============================================
# AGEING ANALYSIS VIEWSETS
# ============================================

class AgeingAnalysisViewSet(viewsets.ModelViewSet):
    queryset = AgeingAnalysis.objects.all()
    serializer_class = AgeingAnalysisSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['analysis_date', 'age_bracket', 'supervisor', 'crew']
    ordering = ['-analysis_date', '-age_in_days']
    
    @action(detail=False, methods=['get'])
    def current_analysis(self, request):
        """Get current ageing analysis"""
        latest_date = AgeingAnalysis.objects.latest('analysis_date').analysis_date
        current = AgeingAnalysis.objects.filter(analysis_date=latest_date)
        
        serializer = self.get_serializer(current, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def summary_by_bracket(self, request):
        """Get summary statistics by age bracket"""
        analysis_date = request.query_params.get('date')
        
        if analysis_date:
            date_filter = datetime.strptime(analysis_date, '%Y-%m-%d').date()
        else:
            date_filter = AgeingAnalysis.objects.latest('analysis_date').analysis_date
        
        summary = AgeingAnalysis.objects.filter(
            analysis_date=date_filter
        ).values('age_bracket').annotate(
            count=Count('id'),
            total_manhours=Sum('work_order__total_manhours')
        ).order_by('age_bracket')
        
        return Response(summary)
    
    @action(detail=False, methods=['post'])
    def generate_analysis(self, request):
        """Generate ageing analysis for current work orders"""
        analysis_date = timezone.now().date()
        
        # Get all open work orders
        open_wos = WorkOrder.objects.filter(
            status__in=['NEW', 'FOR AUDIT', 'NO COC']
        )
        
        created_count = 0
        
        for wo in open_wos:
            if wo.date_energized:
                age_days = (analysis_date - wo.date_energized).days
                age_months = age_days // 30
                
                # Determine age bracket
                if age_months <= 3:
                    age_bracket = '0-3'
                elif age_months <= 6:
                    age_bracket = '4-6'
                elif age_months <= 9:
                    age_bracket = '7-9'
                else:
                    age_bracket = '10+'
                
                AgeingAnalysis.objects.create(
                    analysis_date=analysis_date,
                    work_order=wo,
                    age_bracket=age_bracket,
                    age_in_days=age_days,
                    age_in_months=age_months,
                    supervisor=wo.supervisor,
                    crew=wo.assigned_crew,
                    status_at_analysis=wo.status
                )
                created_count += 1
        
        return Response({
            'message': f'Generated ageing analysis for {created_count} work orders',
            'analysis_date': analysis_date
        })


# ============================================
# BACKJOB MONITORING VIEWSETS
# ============================================

class BackjobMonitoringViewSet(viewsets.ModelViewSet):
    queryset = BackjobMonitoring.objects.all()
    serializer_class = BackjobMonitoringSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'work_order', 'assigned_to', 'is_overdue']
    search_fields = ['issue_description', 'work_order__wo_no']
    ordering = ['-reported_date']
    
    @action(detail=False, methods=['get'])
    def pending_backjobs(self, request):
        """Get all pending backjobs"""
        pending = BackjobMonitoring.objects.filter(
            status__in=['PENDING', 'IN_PROGRESS']
        ).order_by('-days_pending')
        
        serializer = self.get_serializer(pending, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def overdue_backjobs(self, request):
        """Get all overdue backjobs"""
        overdue = BackjobMonitoring.objects.filter(
            is_overdue=True,
            status__in=['PENDING', 'IN_PROGRESS']
        ).order_by('-days_pending')
        
        serializer = self.get_serializer(overdue, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def resolve(self, request, pk=None):
        """Mark a backjob as resolved"""
        backjob = self.get_object()
        
        backjob.status = 'RESOLVED'
        backjob.actual_resolution_date = timezone.now().date()
        backjob.resolution_notes = request.data.get('resolution_notes', '')
        backjob.save()
        
        serializer = self.get_serializer(backjob)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """Get backjob statistics"""
        stats = {
            'total': BackjobMonitoring.objects.count(),
            'pending': BackjobMonitoring.objects.filter(status='PENDING').count(),
            'in_progress': BackjobMonitoring.objects.filter(status='IN_PROGRESS').count(),
            'resolved': BackjobMonitoring.objects.filter(status='RESOLVED').count(),
            'overdue': BackjobMonitoring.objects.filter(is_overdue=True).count(),
            'avg_resolution_days': BackjobMonitoring.objects.filter(
                status='RESOLVED'
            ).aggregate(avg=Avg('days_pending'))['avg']
        }
        
        return Response(stats)
    
    
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from datetime import datetime, timedelta
from dateutil.relativedelta import relativedelta
from .models import KPISnapshot, KPITarget
from .serializers import KPISnapshotSerializer, KPITargetSerializer, KPIDashboardSerializer
from .kpi_service import KPICalculationService

class KPISnapshotViewSet(viewsets.ModelViewSet):
    queryset = KPISnapshot.objects.all()
    serializer_class = KPISnapshotSerializer
    
    @action(detail=False, methods=['post'])
    def calculate_and_save(self, request):
        """Calculate KPIs for a period and save snapshots"""
        period_start = request.data.get('period_start')
        period_end = request.data.get('period_end')
        
        if not period_start or not period_end:
            return Response(
                {'error': 'period_start and period_end are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            period_start = datetime.strptime(period_start, '%Y-%m-%d').date()
            period_end = datetime.strptime(period_end, '%Y-%m-%d').date()
        except ValueError:
            return Response(
                {'error': 'Invalid date format. Use YYYY-MM-DD'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Calculate all KPIs
        kpis = KPICalculationService.calculate_all_kpis(period_start, period_end)
        
        # Save snapshots
        snapshots_created = []
        
        kpi_mapping = {
            'ccti': 'CCTI',
            'pca_conversion': 'PCA_CONVERSION',
            'ageing_completion': 'AGEING_COMPLETION',
            'termination_apt': 'TERM_APT',
            'prdi': 'PRDI',
            'cost_settlement': 'COST_SETTLEMENT',
            'quality_index': 'QUALITY_INDEX',
            'capability_utilization': 'CAPABILITY_UTIL'
        }
        
        for key, kpi_type in kpi_mapping.items():
            kpi_data = kpis.get(key, {})
            
            # Get or create target
            target = KPITarget.objects.filter(
                kpi_type=kpi_type,
                period_start__lte=period_start,
                period_end__gte=period_end,
                is_active=True
            ).first()
            
            snapshot = KPISnapshot.objects.create(
                kpi_type=kpi_type,
                period_start=period_start,
                period_end=period_end,
                kpi_value=kpi_data.get('value', 0),
                target_value=target.target_value if target else None,
                numerator=kpi_data.get('numerator'),
                denominator=kpi_data.get('denominator'),
                sample_size=kpi_data.get('sample_size'),
                calculation_details=kpi_data.get('details', {}),
                calculated_by=request.user
            )
            
            snapshots_created.append(snapshot)
        
        serializer = self.get_serializer(snapshots_created, many=True)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class KPITargetViewSet(viewsets.ModelViewSet):
    queryset = KPITarget.objects.all()
    serializer_class = KPITargetSerializer


class KPIDashboardViewSet(viewsets.ViewSet):
    """
    ViewSet for KPI Dashboard data
    """
    
    @action(detail=False, methods=['get'])
    def current_period(self, request):
        """Get KPI dashboard for current period"""
        # Default to current month
        today = datetime.now().date()
        period_start = today.replace(day=1)
        period_end = (period_start + relativedelta(months=1)) - timedelta(days=1)
        
        # Allow custom period
        if request.query_params.get('period_start'):
            period_start = datetime.strptime(
                request.query_params['period_start'], '%Y-%m-%d'
            ).date()
        
        if request.query_params.get('period_end'):
            period_end = datetime.strptime(
                request.query_params['period_end'], '%Y-%m-%d'
            ).date()
        
        # Calculate all KPIs
        kpis = KPICalculationService.calculate_all_kpis(period_start, period_end)
        
        # Get targets
        targets = {}
        for kpi_type_key in ['CCTI', 'PCA_CONVERSION', 'AGEING_COMPLETION', 'TERM_APT', 
                            'PRDI', 'COST_SETTLEMENT', 'QUALITY_INDEX', 'CAPABILITY_UTIL']:
            target = KPITarget.objects.filter(
                kpi_type=kpi_type_key,
                period_start__lte=period_start,
                period_end__gte=period_end,
                is_active=True
            ).first()
            
            targets[kpi_type_key] = {
                'value': float(target.target_value) if target else None,
                'green': float(target.threshold_green) if target and target.threshold_green else None,
                'yellow': float(target.threshold_yellow) if target and target.threshold_yellow else None,
                'red': float(target.threshold_red) if target and target.threshold_red else None
            }
        
        # Add targets to KPI data
        for key, kpi_type in [('ccti', 'CCTI'), ('pca_conversion', 'PCA_CONVERSION'),
                              ('ageing_completion', 'AGEING_COMPLETION'), ('termination_apt', 'TERM_APT'),
                              ('prdi', 'PRDI'), ('cost_settlement', 'COST_SETTLEMENT'),
                              ('quality_index', 'QUALITY_INDEX'), ('capability_utilization', 'CAPABILITY_UTIL')]:
            if key in kpis:
                kpis[key]['target'] = targets.get(kpi_type, {})
        
        # Get historical trends (last 6 months)
        historical_trends = self._get_historical_trends(period_start)
        
        # Prepare chart data
        chart_data = self._prepare_chart_data(kpis, historical_trends)
        
        dashboard_data = {
            'period_start': period_start,
            'period_end': period_end,
            'total_kpis': 8,
            'ccti': kpis.get('ccti', {}),
            'pca_conversion': kpis.get('pca_conversion', {}),
            'ageing_completion': kpis.get('ageing_completion', {}),
            'pai_adherence': {},  # Placeholder - needs SAIDI data
            'termination_apt': kpis.get('termination_apt', {}),
            'termination_resolution': {},  # Placeholder
            'prdi': kpis.get('prdi', {}),
            'cost_settlement': kpis.get('cost_settlement', {}),
            'quality_index': kpis.get('quality_index', {}),
            'capability_utilization': kpis.get('capability_utilization', {}),
            'historical_trends': historical_trends,
            'chart_data': chart_data
        }
        
        serializer = KPIDashboardSerializer(dashboard_data)
        return Response(serializer.data)
    
    def _get_historical_trends(self, current_period_start, months=6):
        """Get historical KPI trends"""
        trends = {}
        
        for i in range(months):
            month_start = current_period_start - relativedelta(months=i)
            month_end = (month_start + relativedelta(months=1)) - timedelta(days=1)
            
            snapshots = KPISnapshot.objects.filter(
                period_start__gte=month_start,
                period_end__lte=month_end
            )
            
            month_key = month_start.strftime('%Y-%m')
            trends[month_key] = {}
            
            for snapshot in snapshots:
                trends[month_key][snapshot.kpi_type] = {
                    'value': float(snapshot.kpi_value),
                    'target': float(snapshot.target_value) if snapshot.target_value else None
                }
        
        return trends
    
    def _prepare_chart_data(self, current_kpis, historical_trends):
        """Prepare data formatted for charts"""
        return {
            'kpi_summary': {
                'labels': ['CCTI', 'PCA Conv.', 'Quality', 'Cost Settlement'],
                'current': [
                    current_kpis.get('ccti', {}).get('value', 0),
                    current_kpis.get('pca_conversion', {}).get('value', 0),
                    current_kpis.get('quality_index', {}).get('value', 0),
                    current_kpis.get('cost_settlement', {}).get('value', 0)
                ],
                'target': [
                    current_kpis.get('ccti', {}).get('target', {}).get('value', 0),
                    current_kpis.get('pca_conversion', {}).get('target', {}).get('value', 0),
                    current_kpis.get('quality_index', {}).get('target', {}).get('value', 0),
                    current_kpis.get('cost_settlement', {}).get('target', {}).get('value', 0)
                ]
            },
            'trend_data': historical_trends
        }
    

    @action(detail=False, methods=['get'])
    def kpi_detail(self, request):
        """Get detailed breakdown for a specific KPI"""
        kpi_type = request.query_params.get('type')
        period_start = request.query_params.get('period_start')
        period_end = request.query_params.get('period_end')

        if not all([kpi_type, period_start, period_end]):
            return Response(
                {'error': 'type, period_start, and period_end are required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            period_start = datetime.strptime(period_start, '%Y-%m-%d').date()
            period_end = datetime.strptime(period_end, '%Y-%m-%d').date()
        except ValueError:
            return Response(
                {'error': 'Invalid date format. Use YYYY-MM-DD'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Calculate specific KPI
        kpi_methods = {
            'CCTI': KPICalculationService.calculate_ccti,
            'PCA_CONVERSION': KPICalculationService.calculate_pca_conversion_rate,
            'AGEING_COMPLETION': KPICalculationService.calculate_ageing_pca_completion,
            'TERM_APT': KPICalculationService.calculate_termination_apt,
            'PRDI': KPICalculationService.calculate_prdi,
            'COST_SETTLEMENT': KPICalculationService.calculate_cost_settlement,
            'QUALITY_INDEX': KPICalculationService.calculate_quality_index,
            'CAPABILITY_UTIL': KPICalculationService.calculate_capability_utilization
        }

        if kpi_type not in kpi_methods:
            return Response(
                {'error': f'Invalid KPI type. Choose from: {", ".join(kpi_methods.keys())}'},
                status=status.HTTP_400_BAD_REQUEST
            )

        kpi_data = kpi_methods[kpi_type](period_start, period_end)

        return Response({
            'kpi_type': kpi_type,
            'period_start': period_start,
            'period_end': period_end,
            'data': kpi_data
        })



from django.core.mail import EmailMultiAlternatives
from django.conf import settings
from django.http import HttpResponse

def test_email_view(request):
    recipient_list = ["recipient@example.com"]

    # Example for "Good" notification
    if send_custom_email(
        subject="✅ Report Status: GOOD",
        message="All systems are running smoothly.",
        recipient_list=recipient_list,
        status="good"
    ):
        return HttpResponse("Good email sent successfully!")

    # Example for "Bad" notification
    if send_custom_email(
        subject="⚠️ Report Status: BAD",
        message="There are issues detected in the system.",
        recipient_list=recipient_list,
        status="bad"
    ):
        return HttpResponse("Bad email sent successfully!")

    return HttpResponse("Failed to send email.")

def send_custom_email(subject, message, recipient_list, status="good", from_email=None, fail_silently=False):
    """
    Sends a styled HTML email with a notification-like report.
    Status can be "good" or "bad".
    """
    if from_email is None:
        from_email = settings.DEFAULT_FROM_EMAIL

    # Define color schemes for good and bad notifications
    colors = {
        "good": {
            "bg": "#e6ffed",
            "border": "#4CAF50",
            "text": "#2e7d32",
            "emoji": "✅"
        },
        "bad": {
            "bg": "#ffe6e6",
            "border": "#f44336",
            "text": "#b71c1c",
            "emoji": "⚠️"
        }
    }

    color = colors.get(status, colors["good"])

    html_content = f"""
    <html>
    <body style="font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 20px;">
        <div style="
            max-width: 600px;
            margin: auto;
            background-color: {color['bg']};
            border-left: 6px solid {color['border']};
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        ">
            <h2 style="color: {color['text']}; margin-top: 0;">{color['emoji']} Notification Report</h2>
            <p style="color: #333; font-size: 16px;">{message}</p>
            <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
            <p style="font-size: 12px; color: #666;">This is an automated message from your system.</p>
        </div>
    </body>
    </html>
    """

    try:
        email = EmailMultiAlternatives(subject, message, from_email, recipient_list)
        email.attach_alternative(html_content, "text/html")
        email.send(fail_silently=fail_silently)
        return True
    except Exception as e:
        print(f"Error sending email: {e}")
        return False

    



from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .kpi_email_service import KPIEmailService


@api_view(['POST'])
def send_daily_kpi_email(request):
    """
    Manually trigger daily KPI email
    Can be called from a cron job or scheduled task
    """
    recipient_email = request.data.get('recipient_email', KPIEmailService.DEFAULT_RECIPIENT)
    
    result = KPIEmailService.send_daily_kpi_email(recipient_email)
    
    if result['success']:
        return Response(result, status=status.HTTP_200_OK)
    else:
        return Response(result, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([AllowAny])
def check_daily_email_status(request):
    """Check if daily email has been sent today"""
    from datetime import date
    
    log = EmailNotificationLog.objects.filter(
        notification_type='KPI_DAILY',
        notification_date=date.today()
    ).first()
    
    if log:
        return Response({
            'sent_today': True,
            'sent_at': log.sent_at,
            'status': log.status,
            'recipient': log.recipient_email
        })
    else:
        return Response({
            'sent_today': False,
            'message': 'No email sent today yet'
        })


@api_view(['POST'])
@permission_classes([AllowAny])
def auto_send_daily_email(request):
    """
    Auto-send endpoint - can be called by external cron job
    This endpoint will check if email was sent and send if not
    
    Usage: Call this endpoint once per day via cron job or task scheduler
    Example: curl -X POST http://your-domain.com/api/auto-send-daily-email/
    """
    result = KPIEmailService.send_daily_kpi_email()
    return Response(result)

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status, viewsets
from rest_framework.decorators import action
from .daily_action_email_service import DailyActionEmailService
from .models import User, EmailNotificationLog
from datetime import date


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def send_my_daily_email(request):
    """Send daily action email to the authenticated user"""
    
    user = request.user
    
    result = DailyActionEmailService.send_daily_action_email(user)
    
    if result['success']:
        return Response(result, status=status.HTTP_200_OK)
    else:
        return Response(result, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])  # Protect this in production
def send_daily_emails_to_all(request):
    """
    Send daily action emails to all active users
    Should be called by cron job or scheduler
    """
    
    results = DailyActionEmailService.send_daily_emails_to_all_users()
    
    return Response(results, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def send_daily_email_to_user(request, user_id):
    """Send daily action email to a specific user (admin only)"""
    
    if not request.user.is_staff:
        return Response(
            {'error': 'Admin permission required'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        user = User.objects.get(user_id=user_id)
        result = DailyActionEmailService.send_daily_action_email(user)
        
        if result['success']:
            return Response(result, status=status.HTTP_200_OK)
        else:
            return Response(result, status=status.HTTP_400_BAD_REQUEST)
            
    except User.DoesNotExist:
        return Response(
            {'error': 'User not found'},
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def check_my_actions(request):
    """Get today's pending actions for the authenticated user (without sending email)"""
    
    user = request.user
    role_code = user.role.role_name if user.role else 'USER'
    
    pending_actions = DailyActionEmailService.get_pending_actions_for_role(role_code)
    capabilities = DailyActionEmailService.get_role_capabilities(role_code)
    
    return Response({
        'user': {
            'username': user.username,
            'email': user.email,
            'role': role_code
        },
        'pending_actions': pending_actions,
        'capabilities': capabilities
    })


@api_view(['GET'])
@permission_classes([AllowAny])
def check_daily_email_logs(request):
    """Check email logs for today"""
    
    logs = EmailNotificationLog.objects.filter(
        notification_type='DAILY_ACTION',
        notification_date=date.today()
    ).values(
        'recipient_email', 'status', 'sent_at', 'error_message'
    )
    
    return Response({
        'date': date.today(),
        'total': logs.count(),
        'logs': list(logs)
    })


class DailyActionEmailViewSet(viewsets.ViewSet):
    """ViewSet for daily action email management"""
    
    @action(detail=False, methods=['post'])
    def send_to_me(self, request):
        """Send daily action email to authenticated user"""
        result = DailyActionEmailService.send_daily_action_email(request.user)
        return Response(result)
    
    @action(detail=False, methods=['post'])
    def send_to_all(self, request):
        """Send daily action emails to all users (admin only)"""
        if not request.user.is_staff:
            return Response(
                {'error': 'Admin permission required'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        results = DailyActionEmailService.send_daily_emails_to_all_users()
        return Response(results)
    
    @action(detail=False, methods=['get'])
    def my_actions(self, request):
        """Get pending actions for authenticated user"""
        user = request.user
        role_code = user.role.role_name if user.role else 'USER'
        
        pending_actions = DailyActionEmailService.get_pending_actions_for_role(role_code)
        capabilities = DailyActionEmailService.get_role_capabilities(role_code)
        
        return Response({
            'user': {
                'username': user.username,
                'role': role_code
            },
            'pending_actions': pending_actions,
            'capabilities': capabilities
        })
    
    @action(detail=False, methods=['get'])
    def email_logs(self, request):
        """Get email logs"""
        date_param = request.query_params.get('date', date.today())
        
        logs = EmailNotificationLog.objects.filter(
            notification_type='DAILY_ACTION',
            notification_date=date_param
        ).values(
            'recipient_email', 'status', 'sent_at', 'error_message'
        )
        
        return Response({
            'date': date_param,
            'total': logs.count(),
            'sent': logs.filter(status='SENT').count(),
            'failed': logs.filter(status='FAILED').count(),
            'logs': list(logs)
        })
    
    @action(detail=False, methods=['post'])
    def test_email(self, request):
        """Send test email to authenticated user"""
        user = request.user
        
        # Override email if provided
        test_email = request.data.get('email', user.email)
        
        # Create a temporary user object for testing
        from copy import copy
        test_user = copy(user)
        test_user.email = test_email
        
        result = DailyActionEmailService.send_daily_action_email(test_user)
        return Response(result)
    


from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Count, Sum, Q
from datetime import date, timedelta


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_dashboard(request):
    """
    Get role-specific dashboard data
    """
    user = request.user
    role_name = user.role.role_name if user.role else None
    
    dashboard_data = {
        'user_info': {
            'name': user.get_full_name(),
            'role': role_name,
            'email': user.email
        }
    }
    
    # VENDOR REPRESENTATIVE Dashboard
    if role_name == 'Vendor Representative':
        vendor = Vendor.objects.filter(email=user.email).first()
        if vendor:
            dashboard_data['vendor_data'] = {
                'vendor_name': vendor.vendor_name,
                'active_projects': Project.objects.filter(
                    vendor=vendor,
                    status__status_name__in=['In Progress', 'Planning']
                ).count(),
                'completed_projects': Project.objects.filter(
                    vendor=vendor,
                    status__status_name='Completed'
                ).count(),
                'pending_documents': DocumentCompliance.objects.filter(
                    project__vendor=vendor,
                    is_submitted=False
                ).count(),
                'total_penalties': float(Penalty.objects.filter(
                    vendor=vendor
                ).exclude(penalty_status='Waived').aggregate(
                    total=Sum('penalty_amount')
                )['total'] or 0),
                'pending_invoices': Invoice.objects.filter(
                    vendor=vendor
                ).exclude(payment_status='Paid').count()
            }
    
    # CLERK Dashboard
    elif role_name == 'Clerk':
        dashboard_data['clerk_data'] = {
            'pending_uploads': DocumentCompliance.objects.filter(
                is_submitted=False
            ).count(),
            'documents_uploaded_today': ProjectDocument.objects.filter(
                uploaded_by=user,
                upload_date__date=date.today()
            ).count(),
            'pending_approvals': ProjectDocument.objects.filter(
                approval_status='Pending'
            ).count(),
            'overdue_documents': DocumentCompliance.objects.filter(
                is_overdue=True,
                is_submitted=False
            ).count()
        }
    
    # ENGINEERING AIDE Dashboard
    elif role_name == 'Engineering Aide':
        dashboard_data['aide_data'] = {
            'active_workflows': ProjectWorkflow.objects.filter(
                status='In Progress'
            ).count(),
            'pending_stages': ProjectWorkflow.objects.filter(
                completion_date__isnull=True
            ).count(),
            'document_compliance_rate': _calculate_compliance_rate(),
            'upcoming_deadlines': ProjectWorkflow.objects.filter(
                due_date__gte=date.today(),
                due_date__lte=date.today() + timedelta(days=7),
                completion_date__isnull=True
            ).count()
        }
    
    # QUALITY INSPECTOR Dashboard
    elif role_name == 'Quality Inspector':
        dashboard_data['qi_data'] = {
            'pending_inspections': QIInspection.objects.filter(
                assigned_qi=user,
                is_completed=False
            ).count(),
            'completed_today': QIInspection.objects.filter(
                assigned_qi=user,
                inspection_date=date.today(),
                is_completed=True
            ).count(),
            'daily_target': _get_qi_daily_target(user),
            'monthly_progress': _get_qi_monthly_progress(user),
            'overdue_inspections': QIInspection.objects.filter(
                assigned_qi=user,
                scheduled_date__lt=date.today(),
                is_completed=False
            ).count()
        }
    
    # ENGINEER Dashboard
    elif role_name == 'Engineer':
        dashboard_data['engineer_data'] = {
            'assigned_projects': Project.objects.filter(
                assigned_engineer=user
            ).exclude(status__status_name__in=['Completed', 'Cancelled']).count(),
            'pending_approvals': ProjectDocument.objects.filter(
                approval_status='Pending'
            ).count(),
            'sla_breaches': SLATracking.objects.filter(
                project__assigned_engineer=user,
                is_breached=True
            ).count(),
            'vendor_performance': _get_vendor_performance_summary()
        }
    
    # WO SUPERVISOR Dashboard
    elif role_name == 'WO Supervisor':
        dashboard_data['supervisor_data'] = {
            'total_projects': Project.objects.count(),
            'active_projects': Project.objects.exclude(
                status__status_name__in=['Completed', 'Cancelled']
            ).count(),
            'delayed_projects': Project.objects.filter(is_delayed=True).count(),
            'pending_penalties': Penalty.objects.filter(
                penalty_status='Draft'
            ).count(),
            'sla_breaches': SLATracking.objects.filter(
                is_breached=True,
                status='Breached'
            ).count(),
            'qi_workload': _get_qi_workload_summary(),
            'escalations': Escalation.objects.filter(status='Open').count()
        }
    
    # TEAM LEADER Dashboard
    elif role_name == 'Team Leader':
        dashboard_data['leader_data'] = {
            'organization_overview': {
                'total_projects': Project.objects.count(),
                'on_time_percentage': _calculate_on_time_percentage(),
                'avg_completion_days': _calculate_avg_completion_days(),
                'total_contract_value': float(Project.objects.aggregate(
                    total=Sum('contract_value')
                )['total'] or 0)
            },
            'pending_approvals': {
                'penalties': Penalty.objects.filter(penalty_status='Draft').count(),
                'documents': ProjectDocument.objects.filter(approval_status='Pending').count(),
                'projects': Project.objects.filter(status__status_name='Pending Approval').count()
            },
            'trends': _get_performance_trends(),
            'ai_suggestions': []  # Placeholder for AI suggestions
        }
    
    # SECTOR MANAGER Dashboard
    elif role_name == 'Sector Manager':
        dashboard_data['sector_manager_data'] = {
            'kpi_summary': _get_kpi_summary(),
            'sector_comparison': _get_sector_comparison(),
            'financial_overview': {
                'total_contract_value': float(Project.objects.aggregate(
                    total=Sum('contract_value')
                )['total'] or 0),
                'total_billed': float(Invoice.objects.filter(
                    payment_status='Paid'
                ).aggregate(total=Sum('net_amount'))['total'] or 0),
                'total_penalties': float(Penalty.objects.exclude(
                    penalty_status='Waived'
                ).aggregate(total=Sum('penalty_amount'))['total'] or 0)
            },
            'vendor_rankings': _get_vendor_rankings()
        }
    
    # SYSTEM ADMINISTRATOR Dashboard
    elif role_name == 'System Administrator':
        dashboard_data['admin_data'] = {
            'system_health': {
                'total_users': User.objects.count(),
                'active_users': User.objects.filter(is_active=True).count(),
                'active_sessions': UserSession.objects.filter(is_active=True).count()
            },
            'recent_activities': _get_recent_audit_logs(),
            'system_settings': SystemSetting.objects.count(),
            'backup_status': 'OK'  # Placeholder
        }
    
    return Response(dashboard_data)


# Helper functions
def _calculate_compliance_rate():
    total = DocumentCompliance.objects.count()
    if total == 0:
        return 0
    submitted = DocumentCompliance.objects.filter(is_submitted=True).count()
    return round((submitted / total) * 100, 2)


def _get_qi_daily_target(user):
    target = QIDailyTarget.objects.filter(
        qi_user=user,
        target_date=date.today()
    ).first()
    if target:
        return {
            'target': target.target_audits,
            'actual': target.actual_audits,
            'met': target.target_met
        }
    return {'target': 0, 'actual': 0, 'met': False}


def _get_qi_monthly_progress(user):
    month_start = date.today().replace(day=1)
    targets = QIDailyTarget.objects.filter(
        qi_user=user,
        target_date__gte=month_start
    )
    total_target = targets.aggregate(total=Sum('target_audits'))['total'] or 0
    total_actual = targets.aggregate(total=Sum('actual_audits'))['total'] or 0
    return {
        'total_target': total_target,
        'total_actual': total_actual,
        'percentage': round((total_actual / total_target * 100) if total_target > 0 else 0, 2)
    }


def _get_vendor_performance_summary():
    return Vendor.objects.filter(is_active=True).annotate(
        total_projects=Count('projects'),
        delayed=Count('projects', filter=Q(projects__is_delayed=True))
    ).values('vendor_name', 'compliance_score', 'total_projects', 'delayed')[:5]


def _get_qi_workload_summary():
    return QIInspection.objects.filter(
        is_completed=False
    ).values('assigned_qi__first_name', 'assigned_qi__last_name').annotate(
        pending_count=Count('id')
    )


def _calculate_on_time_percentage():
    total = Project.objects.filter(
        status__status_name='Completed'
    ).count()
    if total == 0:
        return 0
    on_time = Project.objects.filter(
        status__status_name='Completed',
        is_delayed=False
    ).count()
    return round((on_time / total) * 100, 2)


def _calculate_avg_completion_days():
    avg = Project.objects.filter(
        status__status_name='Completed',
        delay_days__isnull=False
    ).aggregate(avg=Avg('delay_days'))['avg']
    return round(float(avg or 0), 2)


def _get_performance_trends():
    # Last 6 months trend
    six_months_ago = date.today() - timedelta(days=180)
    monthly_data = Project.objects.filter(
        created_at__gte=six_months_ago
    ).annotate(
        month=TruncMonth('created_at')
    ).values('month').annotate(
        total=Count('project_id'),
        completed=Count('project_id', filter=Q(status__status_name='Completed'))
    ).order_by('month')
    return list(monthly_data)


def _get_kpi_summary():
    # Return recent KPI snapshots
    return KPISnapshot.objects.all().order_by('-period_end')[:8].values(
        'kpi_type', 'kpi_value', 'target_value', 'period_end'
    )


def _get_sector_comparison():
    return Sector.objects.annotate(
        total_projects=Count('projects'),
        completed=Count('projects', filter=Q(projects__status__status_name='Completed')),
        delayed=Count('projects', filter=Q(projects__is_delayed=True))
    ).values('sector_name', 'total_projects', 'completed', 'delayed')


def _get_vendor_rankings():
    return Vendor.objects.filter(is_active=True).order_by('-compliance_score')[:10].values(
        'vendor_name', 'compliance_score'
    )


def _get_recent_audit_logs():
    return SystemAuditLog.objects.all().order_by('-created_at')[:20].values(
        'user__username', 'action_type', 'status', 'created_at'
    )
    

class VendorPortalViewSet(viewsets.ViewSet):
    """
    Vendor Representative Portal - specific endpoints for vendors
    """
    permission_classes = [IsAuthenticated]
    
    @action(detail=False, methods=['get'])
    def my_projects(self, request):
        """Get projects for current vendor"""
        vendor = Vendor.objects.filter(email=request.user.email).first()
        if not vendor:
            return Response({'error': 'Vendor not found'}, status=404)
        
        projects = Project.objects.filter(vendor=vendor).select_related(
            'status', 'sector', 'assigned_engineer'
        )
        serializer = ProjectListSerializer(projects, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def pending_documents(self, request):
        """Get pending document submissions"""
        vendor = Vendor.objects.filter(email=request.user.email).first()
        if not vendor:
            return Response({'error': 'Vendor not found'}, status=404)
        
        pending = DocumentCompliance.objects.filter(
            project__vendor=vendor,
            is_submitted=False
        ).select_related('project', 'doc_type')
        
        serializer = DocumentComplianceSerializer(pending, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    def upload_document(self, request):
        """Upload compliance document"""
        vendor = Vendor.objects.filter(email=request.user.email).first()
        if not vendor:
            return Response({'error': 'Vendor not found'}, status=404)
        
        project_id = request.data.get('project_id')
        project = Project.objects.filter(project_id=project_id, vendor=vendor).first()
        
        if not project:
            return Response({'error': 'Project not found'}, status=404)
        
        serializer = ProjectDocumentSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(
                project=project,
                uploaded_by=request.user
            )
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)
    
    @action(detail=False, methods=['get'])
    def payment_summary(self, request):
        """Get payment and billing summary"""
        vendor = Vendor.objects.filter(email=request.user.email).first()
        if not vendor:
            return Response({'error': 'Vendor not found'}, status=404)
        
        summary = {
            'total_invoiced': float(Invoice.objects.filter(
                vendor=vendor
            ).aggregate(total=Sum('invoice_amount'))['total'] or 0),
            'total_paid': float(Invoice.objects.filter(
                vendor=vendor,
                payment_status='Paid'
            ).aggregate(total=Sum('net_amount'))['total'] or 0),
            'outstanding': float(Invoice.objects.filter(
                vendor=vendor
            ).exclude(payment_status='Paid').aggregate(
                total=Sum('net_amount')
            )['total'] or 0),
            'penalties': float(Penalty.objects.filter(
                vendor=vendor
            ).exclude(penalty_status='Waived').aggregate(
                total=Sum('penalty_amount')
            )['total'] or 0)
        }
        return Response(summary)
    
    @action(detail=False, methods=['post'])
    def submit_dispute(self, request):
        """Submit a dispute"""
        vendor = Vendor.objects.filter(email=request.user.email).first()
        if not vendor:
            return Response({'error': 'Vendor not found'}, status=404)
        
        serializer = VendorDisputeSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(vendor=vendor)
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)



class QIMobileViewSet(viewsets.ViewSet):
    """
    Quality Inspector Mobile-Friendly Endpoints
    """
    permission_classes = [IsAuthenticated]
    
    @action(detail=False, methods=['get'])
    def today_schedule(self, request):
        """Get today's inspection schedule"""
        inspections = QIInspection.objects.filter(
            assigned_qi=request.user,
            scheduled_date=date.today()
        ).select_related('project', 'inspection_type')
        
        serializer = QIInspectionSerializer(inspections, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    def complete_inspection(self, request, pk=None):
        """Complete an inspection with mobile data"""
        inspection_id = request.data.get('inspection_id')
        
        try:
            inspection = QIInspection.objects.get(
                id=inspection_id,
                assigned_qi=request.user
            )
            
            inspection.is_completed = True
            inspection.inspection_date = date.today()
            inspection.inspection_result = request.data.get('result')
            inspection.findings = request.data.get('findings')
            inspection.location_coordinates = request.data.get('coordinates')
            inspection.save()
            
            # Update daily target
            target, _ = QIDailyTarget.objects.get_or_create(
                qi_user=request.user,
                target_date=date.today()
            )
            target.actual_audits += 1
            target.save()
            
            return Response({'status': 'completed'})
        except QIInspection.DoesNotExist:
            return Response({'error': 'Inspection not found'}, status=404)
    
    @action(detail=False, methods=['get'])
    def daily_progress(self, request):
        """Get today's progress"""
        target = QIDailyTarget.objects.filter(
            qi_user=request.user,
            target_date=date.today()
        ).first()
        
        if target:
            return Response({
                'target': target.target_audits,
                'actual': target.actual_audits,
                'remaining': target.target_audits - target.actual_audits,
                'percentage': round((target.actual_audits / target.target_audits * 100) if target.target_audits > 0 else 0, 2),
                'target_met': target.target_met
            })
        return Response({
            'target': 0,
            'actual': 0,
            'remaining': 0,
            'percentage': 0,
            'target_met': False
        })
    
    @action(detail=False, methods=['post'])
    def log_missed_target(self, request):
        """Log reason for missing target"""
        target = QIDailyTarget.objects.filter(
            qi_user=request.user,
            target_date=date.today()
        ).first()
        
        if target:
            target.reason_not_met = request.data.get('reason')
            target.reason_category = request.data.get('category')
            target.save()
            return Response({'status': 'saved'})
        else:
            return Response({'error': 'No target found for today'}, status=404)


class ClerkViewSet(viewsets.ViewSet):
    """
    Clerk Portal - Document management and basic communications
    """
    permission_classes = [IsAuthenticated]
    
    @action(detail=False, methods=['get'])
    def pending_documents(self, request):
        """Get documents pending upload or approval"""
        pending_upload = DocumentCompliance.objects.filter(
            is_submitted=False
        ).select_related('project', 'doc_type').order_by('due_date')
        
        pending_approval = ProjectDocument.objects.filter(
            approval_status='Pending'
        ).select_related('project', 'doc_type').order_by('-upload_date')
        
        return Response({
            'pending_upload': DocumentComplianceSerializer(pending_upload, many=True).data,
            'pending_approval': ProjectDocumentSerializer(pending_approval, many=True).data,
            'stats': {
                'total_pending_upload': pending_upload.count(),
                'total_pending_approval': pending_approval.count(),
                'overdue': DocumentCompliance.objects.filter(
                    is_overdue=True,
                    is_submitted=False
                ).count()
            }
        })
    
    @action(detail=False, methods=['post'])
    def bulk_upload_documents(self, request):
        """Bulk upload documents for multiple projects"""
        documents_data = request.data.get('documents', [])
        uploaded = []
        errors = []
        
        for doc_data in documents_data:
            try:
                project_id = doc_data.get('project_id')
                project = Project.objects.get(project_id=project_id)
                
                document = ProjectDocument.objects.create(
                    project=project,
                    doc_type_id=doc_data.get('doc_type_id'),
                    document_name=doc_data.get('document_name'),
                    document_path=doc_data.get('document_path'),
                    uploaded_by=request.user
                )
                uploaded.append(document.id)
                
                # Update compliance status
                DocumentCompliance.objects.filter(
                    project=project,
                    doc_type_id=doc_data.get('doc_type_id')
                ).update(
                    is_submitted=True,
                    submission_date=timezone.now()
                )
                
            except Exception as e:
                errors.append({
                    'project_id': doc_data.get('project_id'),
                    'error': str(e)
                })
        
        return Response({
            'uploaded_count': len(uploaded),
            'uploaded_ids': uploaded,
            'errors': errors
        })
    
    @action(detail=False, methods=['post'])
    def send_reminder(self, request):
        """Send document submission reminder to vendor"""
        project_id = request.data.get('project_id')
        doc_type_id = request.data.get('doc_type_id')
        message = request.data.get('message', '')
        
        try:
            project = Project.objects.get(project_id=project_id)
            doc_type = DocumentType.objects.get(doc_type_id=doc_type_id)
            
            # Create notification
            notification = Notification.objects.create(
                recipient_user=None,
                recipient_email=project.vendor.email if project.vendor else None,
                notification_type='Email',
                subject=f'Document Reminder: {doc_type.doc_type_name}',
                message=message or f'Please submit {doc_type.doc_type_name} for project {project.project_code}',
                related_project=project,
                status='Pending'
            )
            
            # Log the action
            ChangeLog.objects.create(
                table_name='notifications',
                record_id=notification.id,
                change_type='INSERT',
                changed_by=request.user,
                change_reason=f'Reminder sent by clerk for {doc_type.doc_type_name}'
            )
            
            return Response({
                'status': 'sent',
                'notification_id': notification.id
            })
            
        except Project.DoesNotExist:
            return Response({'error': 'Project not found'}, status=404)
        except DocumentType.DoesNotExist:
            return Response({'error': 'Document type not found'}, status=404)
    
    @action(detail=False, methods=['get'])
    def my_upload_history(self, request):
        """Get clerk's document upload history"""
        days = int(request.query_params.get('days', 30))
        start_date = date.today() - timedelta(days=days)
        
        uploads = ProjectDocument.objects.filter(
            uploaded_by=request.user,
            upload_date__gte=start_date
        ).select_related('project', 'doc_type').order_by('-upload_date')
        
        # Statistics
        stats = {
            'total_uploaded': uploads.count(),
            'approved': uploads.filter(approval_status='Approved').count(),
            'pending': uploads.filter(approval_status='Pending').count(),
            'rejected': uploads.filter(approval_status='Rejected').count(),
            'by_type': uploads.values('doc_type__doc_type_name').annotate(
                count=Count('id')
            ).order_by('-count')
        }
        
        return Response({
            'uploads': ProjectDocumentSerializer(uploads[:50], many=True).data,
            'stats': stats
        })
    
    @action(detail=False, methods=['post'])
    def schedule_reminders(self, request):
        """Schedule automatic reminders for upcoming deadlines"""
        days_ahead = int(request.data.get('days_ahead', 7))
        target_date = date.today() + timedelta(days=days_ahead)
        
        upcoming = DocumentCompliance.objects.filter(
            due_date__lte=target_date,
            due_date__gte=date.today(),
            is_submitted=False
        ).select_related('project', 'doc_type')
        
        scheduled = []
        for doc_compliance in upcoming:
            if doc_compliance.project.vendor:
                notification = Notification.objects.create(
                    recipient_email=doc_compliance.project.vendor.email,
                    notification_type='Email',
                    subject=f'Upcoming Deadline: {doc_compliance.doc_type.doc_type_name}',
                    message=f'Document {doc_compliance.doc_type.doc_type_name} is due on {doc_compliance.due_date}',
                    related_project=doc_compliance.project,
                    status='Pending'
                )
                scheduled.append(notification.id)
        
        return Response({
            'scheduled_count': len(scheduled),
            'notification_ids': scheduled
        })
    
    @action(detail=False, methods=['get'])
    def missing_documents_report(self, request):
        """Generate report of missing documents"""
        vendor_id = request.query_params.get('vendor_id')
        sector_id = request.query_params.get('sector_id')
        
        missing = DocumentCompliance.objects.filter(
            is_submitted=False
        ).select_related('project', 'doc_type')
        
        if vendor_id:
            missing = missing.filter(project__vendor_id=vendor_id)
        if sector_id:
            missing = missing.filter(project__sector_id=sector_id)
        
        # Group by vendor
        by_vendor = {}
        for doc in missing:
            vendor_name = doc.project.vendor.vendor_name if doc.project.vendor else 'Unknown'
            if vendor_name not in by_vendor:
                by_vendor[vendor_name] = []
            by_vendor[vendor_name].append({
                'project_code': doc.project.project_code,
                'document_type': doc.doc_type.doc_type_name,
                'due_date': doc.due_date,
                'is_overdue': doc.is_overdue,
                'overdue_days': doc.overdue_days
            })
        
        return Response({
            'total_missing': missing.count(),
            'overdue_count': missing.filter(is_overdue=True).count(),
            'by_vendor': by_vendor
        })
    


class EngineeringAideViewSet(viewsets.ViewSet):
    """
    Engineering Aide Portal - Workflow coordination and monitoring
    """
    permission_classes = [IsAuthenticated]
    
    @action(detail=False, methods=['get'])
    def workflow_overview(self, request):
        """Get overview of all active workflows"""
        active_workflows = ProjectWorkflow.objects.filter(
            is_current_stage=True
        ).select_related('project', 'stage', 'assigned_user')
        
        # Group by stage
        by_stage = {}
        for workflow in active_workflows:
            stage_name = workflow.stage.stage_name
            if stage_name not in by_stage:
                by_stage[stage_name] = {
                    'count': 0,
                    'projects': []
                }
            by_stage[stage_name]['count'] += 1
            by_stage[stage_name]['projects'].append({
                'project_code': workflow.project.project_code,
                'project_name': workflow.project.project_name,
                'assigned_to': workflow.assigned_user.get_full_name() if workflow.assigned_user else None,
                'due_date': workflow.due_date,
                'status': workflow.status
            })
        
        return Response({
            'total_active': active_workflows.count(),
            'by_stage': by_stage,
            'blocked': active_workflows.filter(status='Blocked').count(),
            'overdue': active_workflows.filter(
                due_date__lt=date.today(),
                completion_date__isnull=True
            ).count()
        })
    
    @action(detail=False, methods=['get'])
    def workflow_visualization(self, request):
        """Get data for workflow visualization"""
        project_id = request.query_params.get('project_id')
        
        if not project_id:
            return Response({'error': 'project_id required'}, status=400)
        
        workflows = ProjectWorkflow.objects.filter(
            project_id=project_id
        ).select_related('stage', 'assigned_user').order_by('stage__stage_order')
        
        timeline = []
        for wf in workflows:
            timeline.append({
                'stage_name': wf.stage.stage_name,
                'stage_order': wf.stage.stage_order,
                'status': wf.status,
                'start_date': wf.start_date,
                'due_date': wf.due_date,
                'completion_date': wf.completion_date,
                'assigned_to': wf.assigned_user.get_full_name() if wf.assigned_user else None,
                'is_current': wf.is_current_stage,
                'notes': wf.notes
            })
        
        return Response({
            'project_id': project_id,
            'timeline': timeline,
            'total_stages': len(timeline),
            'completed_stages': len([w for w in timeline if w['status'] == 'Completed']),
            'current_stage': next((w for w in timeline if w['is_current']), None)
        })
    
    @action(detail=False, methods=['get'])
    def document_compliance_summary(self, request):
        """Get document compliance summary across all projects"""
        total_required = DocumentCompliance.objects.count()
        submitted = DocumentCompliance.objects.filter(is_submitted=True).count()
        approved = DocumentCompliance.objects.filter(is_approved=True).count()
        overdue = DocumentCompliance.objects.filter(is_overdue=True, is_submitted=False).count()
        
        # By document type
        by_type = DocumentCompliance.objects.values(
            'doc_type__doc_type_name'
        ).annotate(
            total=Count('id'),
            submitted=Count('id', filter=Q(is_submitted=True)),
            approved=Count('id', filter=Q(is_approved=True)),
            overdue=Count('id', filter=Q(is_overdue=True, is_submitted=False))
        )
        
        return Response({
            'overall': {
                'total_required': total_required,
                'submitted': submitted,
                'approved': approved,
                'overdue': overdue,
                'compliance_rate': round((submitted / total_required * 100) if total_required > 0 else 0, 2)
            },
            'by_type': list(by_type)
        })
    
    @action(detail=False, methods=['post'])
    def send_workflow_notification(self, request):
        """Send notification to workflow stage assignee"""
        workflow_id = request.data.get('workflow_id')
        message = request.data.get('message')
        
        try:
            workflow = ProjectWorkflow.objects.get(id=workflow_id)
            
            if not workflow.assigned_user:
                return Response({'error': 'No user assigned to this workflow stage'}, status=400)
            
            notification = Notification.objects.create(
                recipient_user=workflow.assigned_user,
                notification_type='In-App',
                subject=f'Workflow Update: {workflow.stage.stage_name}',
                message=message,
                related_project=workflow.project,
                status='Pending'
            )
            
            return Response({
                'status': 'sent',
                'notification_id': notification.id,
                'recipient': workflow.assigned_user.get_full_name()
            })
            
        except ProjectWorkflow.DoesNotExist:
            return Response({'error': 'Workflow not found'}, status=404)
    
    @action(detail=False, methods=['get'])
    def upcoming_deadlines(self, request):
        """Get upcoming workflow deadlines"""
        days_ahead = int(request.query_params.get('days', 7))
        end_date = date.today() + timedelta(days=days_ahead)
        
        upcoming = ProjectWorkflow.objects.filter(
            due_date__gte=date.today(),
            due_date__lte=end_date,
            completion_date__isnull=True
        ).select_related('project', 'stage', 'assigned_user').order_by('due_date')
        
        calendar_data = []
        for workflow in upcoming:
            days_until = (workflow.due_date - date.today()).days
            calendar_data.append({
                'project_code': workflow.project.project_code,
                'project_name': workflow.project.project_name,
                'stage_name': workflow.stage.stage_name,
                'due_date': workflow.due_date,
                'days_until': days_until,
                'assigned_to': workflow.assigned_user.get_full_name() if workflow.assigned_user else None,
                'priority': workflow.project.priority,
                'urgency': 'critical' if days_until <= 2 else 'high' if days_until <= 5 else 'normal'
            })
        
        return Response({
            'total_upcoming': len(calendar_data),
            'deadlines': calendar_data
        })
    
    @action(detail=False, methods=['get'])
    def summary_report(self, request):
        """Generate summary report for aide"""
        report_type = request.query_params.get('type', 'daily')
        
        if report_type == 'daily':
            start_date = date.today()
        elif report_type == 'weekly':
            start_date = date.today() - timedelta(days=7)
        else:  # monthly
            start_date = date.today() - timedelta(days=30)
        
        # Workflows completed
        completed_workflows = ProjectWorkflow.objects.filter(
            completion_date__gte=start_date,
            status='Completed'
        ).count()
        
        # Documents uploaded
        documents_uploaded = ProjectDocument.objects.filter(
            upload_date__gte=start_date
        ).count()
        
        # Notifications sent
        notifications_sent = Notification.objects.filter(
            created_at__gte=start_date
        ).count()
        
        # Active issues
        blocked_workflows = ProjectWorkflow.objects.filter(
            status='Blocked'
        ).count()
        
        overdue_deadlines = ProjectWorkflow.objects.filter(
            due_date__lt=date.today(),
            completion_date__isnull=True
        ).count()
        
        return Response({
            'period': report_type,
            'start_date': start_date,
            'end_date': date.today(),
            'metrics': {
                'completed_workflows': completed_workflows,
                'documents_uploaded': documents_uploaded,
                'notifications_sent': notifications_sent,
                'blocked_workflows': blocked_workflows,
                'overdue_deadlines': overdue_deadlines
            }
        })


class EngineerViewSet(viewsets.ViewSet):
    """
    Engineer/Design Engineer Portal - Technical review and approvals
    """
    permission_classes = [IsAuthenticated]
    
    @action(detail=False, methods=['get'])
    def my_projects(self, request):
        """Get projects assigned to engineer"""
        projects = Project.objects.all()
        
        # Categorize by status
        categorized = {
            'active': [],
            'pending_review': [],
            'delayed': [],
            'sla_risk': []
        }
        
        for project in projects:
            project_data = ProjectListSerializer(project).data
            
            if project.is_delayed:
                categorized['delayed'].append(project_data)
            
            # Check SLA risk
            sla_at_risk = SLATracking.objects.filter(
                project=project,
                is_breached=False,
                due_date__lte=date.today() + timedelta(days=3)
            ).exists()
            if sla_at_risk:
                categorized['sla_risk'].append(project_data)
            
            # Check pending approvals
            pending_docs = ProjectDocument.objects.filter(
                project=project,
                approval_status='Pending'
            ).exists()
            if pending_docs:
                categorized['pending_review'].append(project_data)
            else:
                categorized['active'].append(project_data)
        
        return Response({
            'total': projects.count(),
            'categorized': categorized
        })
    
    @action(detail=False, methods=['get'])
    def pending_approvals(self, request):
        """Get items pending engineer approval"""
        # Documents pending approval
        documents = ProjectDocument.objects.filter(
            approval_status='Pending',
            project__assigned_engineer=request.user
        ).select_related('project', 'doc_type', 'uploaded_by')
        
        # Inspections pending approval
        inspections = QIInspection.objects.filter(
            is_completed=True,
            project__assigned_engineer=request.user
        ).select_related('project', 'inspection_type', 'assigned_qi')
        
        # Projects pending final approval
        projects = Project.objects.filter(
            assigned_engineer=request.user,
            status__status_name='Pending Approval'
        ).select_related('vendor', 'sector')
        
        return Response({
            'documents': {
                'count': documents.count(),
                'items': ProjectDocumentSerializer(documents, many=True).data
            },
            'inspections': {
                'count': inspections.count(),
                'items': QIInspectionSerializer(inspections, many=True).data
            },
            'projects': {
                'count': projects.count(),
                'items': ProjectListSerializer(projects, many=True).data
            }
        })
    
    @action(detail=False, methods=['post'])
    def approve_document(self, request):
        """Approve a document"""
        document_id = request.data.get('document_id')
        comments = request.data.get('comments', '')
        
        try:
            document = ProjectDocument.objects.get(id=document_id)
            
            # Check if engineer is assigned to project
            if document.project.assigned_engineer != request.user:
                return Response({'error': 'Not authorized'}, status=403)
            
            document.approval_status = 'Approved'
            document.approved_by = request.user
            document.approval_date = timezone.now()
            document.notes = comments
            document.save()
            
            # Update compliance
            DocumentCompliance.objects.filter(
                project=document.project,
                doc_type=document.doc_type
            ).update(
                is_approved=True,
                approval_date=timezone.now()
            )
            
            return Response({
                'status': 'approved',
                'document_id': document_id
            })
            
        except ProjectDocument.DoesNotExist:
            return Response({'error': 'Document not found'}, status=404)
    
    @action(detail=False, methods=['post'])
    def reject_document(self, request):
        """Reject a document"""
        document_id = request.data.get('document_id')
        reason = request.data.get('reason', '')
        
        try:
            document = ProjectDocument.objects.get(id=document_id)
            
            if document.project.assigned_engineer != request.user:
                return Response({'error': 'Not authorized'}, status=403)
            
            document.approval_status = 'Rejected'
            document.rejection_reason = reason
            document.save()
            
            # Send notification to uploader
            Notification.objects.create(
                recipient_user=document.uploaded_by,
                notification_type='In-App',
                subject='Document Rejected',
                message=f'Document {document.document_name} was rejected. Reason: {reason}',
                related_project=document.project,
                status='Pending'
            )
            
            return Response({
                'status': 'rejected',
                'document_id': document_id
            })
            
        except ProjectDocument.DoesNotExist:
            return Response({'error': 'Document not found'}, status=404)
    
    @action(detail=False, methods=['get'])
    def sla_compliance(self, request):
        """Get SLA compliance for engineer's projects"""
        projects = Project.objects.filter(assigned_engineer=request.user)
        
        sla_data = SLATracking.objects.filter(
            project__in=projects
        ).values('status').annotate(count=Count('sla_tracking_id'))
        
        # At-risk SLAs
        at_risk = SLATracking.objects.filter(
            project__in=projects,
            is_breached=False,
            due_date__lte=date.today() + timedelta(days=3),
            completion_date__isnull=True
        ).select_related('project', 'sla_rule')
        
        return Response({
            'summary': list(sla_data),
            'at_risk': SLATrackingSerializer(at_risk, many=True).data,
            'breach_rate': self._calculate_breach_rate(projects)
        })
    
    def _calculate_breach_rate(self, projects):
        total = SLATracking.objects.filter(project__in=projects).count()
        if total == 0:
            return 0
        breached = SLATracking.objects.filter(
            project__in=projects,
            is_breached=True
        ).count()
        return round((breached / total * 100), 2)
    
    @action(detail=False, methods=['get'])
    def vendor_performance(self, request):
        """Get vendor performance analytics for engineer's projects"""
        projects = Project.objects.filter(assigned_engineer=request.user)
        vendors = Vendor.objects.filter(projects__in=projects).distinct()
        
        performance_data = []
        for vendor in vendors:
            vendor_projects = projects.filter(vendor=vendor)
            
            total = vendor_projects.count()
            delayed = vendor_projects.filter(is_delayed=True).count()
            completed = vendor_projects.filter(status__status_name='Completed').count()
            
            penalties = Penalty.objects.filter(
                vendor=vendor,
                project__in=vendor_projects
            ).exclude(penalty_status='Waived').aggregate(
                total=Sum('penalty_amount')
            )['total'] or 0
            
            performance_data.append({
                'vendor_code': vendor.vendor_code,
                'vendor_name': vendor.vendor_name,
                'total_projects': total,
                'completed': completed,
                'delayed': delayed,
                'on_time_rate': round(((total - delayed) / total * 100) if total > 0 else 0, 2),
                'total_penalties': float(penalties),
                'compliance_score': float(vendor.compliance_score)
            })
        
        return Response({
            'vendors': performance_data,
            'summary': {
                'total_vendors': len(performance_data),
                'avg_on_time_rate': round(
                    sum(v['on_time_rate'] for v in performance_data) / len(performance_data)
                    if performance_data else 0, 2
                )
            }
        })
    
    @action(detail=False, methods=['post'])
    def use_chatbot(self, request):
        """Use AI chatbot for historical queries"""
        question = request.data.get('question')
        
        if not question:
            return Response({'error': 'question required'}, status=400)
        
        # Use the existing chatbot service
        from .chatbot_service import chatbot_service
        answer = chatbot_service.answer(question)
        
        # Log the query
        SystemAuditLog.objects.create(
            user=request.user,
            action_type='AI_CHATBOT_QUERY',
            action_description=f'Question: {question[:100]}',
            status='Success'
        )
        
        return Response({
            'question': question,
            'answer': answer
        })

class WOSupervisorViewSet(viewsets.ViewSet):
    """
    Work Order Supervisor Portal - Full operational oversight
    """
    permission_classes = [IsAuthenticated]
    
    @action(detail=False, methods=['get'])
    def full_dashboard(self, request):
        """Comprehensive supervisor dashboard"""
        # Project tracking
        total_projects = Project.objects.count()
        active = Project.objects.exclude(
            status__status_name__in=['Completed', 'Cancelled', 'Billed']
        ).count()
        delayed = Project.objects.filter(is_delayed=True).count()
        
        # Penalties
        pending_penalties = Penalty.objects.filter(penalty_status='Draft').count()
        total_penalty_amount = float(Penalty.objects.exclude(
            penalty_status='Waived'
        ).aggregate(total=Sum('penalty_amount'))['total'] or 0)
        
        # SLA tracking
        sla_breaches = SLATracking.objects.filter(
            is_breached=True,
            status='Breached'
        ).count()
        sla_at_risk = SLATracking.objects.filter(
            is_breached=False,
            due_date__lte=date.today() + timedelta(days=3),
            completion_date__isnull=True
        ).count()
        
        # QI workload
        qi_workload = self._get_qi_workload_distribution()
        
        # Escalations
        open_escalations = Escalation.objects.filter(status='Open').count()
        
        # Financial
        billing_stats = self._get_billing_stats()
        
        return Response({
            'projects': {
                'total': total_projects,
                'active': active,
                'delayed': delayed,
                'completion_rate': round(
                    ((total_projects - active) / total_projects * 100) if total_projects > 0 else 0, 2
                )
            },
            'penalties': {
                'pending': pending_penalties,
                'total_amount': total_penalty_amount
            },
            'sla': {
                'breaches': sla_breaches,
                'at_risk': sla_at_risk
            },
            'qi_workload': qi_workload,
            'escalations': open_escalations,
            'billing': billing_stats
        })
    
    def _get_qi_workload_distribution(self):
        """Get QI workload distribution"""
        qi_users = User.objects.filter(role__role_name='Quality Inspector')
        workload = []
        
        for qi in qi_users:
            pending = QIInspection.objects.filter(
                assigned_qi=qi,
                is_completed=False
            ).count()
            
            completed_today = QIInspection.objects.filter(
                assigned_qi=qi,
                inspection_date=date.today(),
                is_completed=True
            ).count()
            
            # Get target
            target = QIDailyTarget.objects.filter(
                qi_user=qi,
                target_date=date.today()
            ).first()
            
            workload.append({
                'qi_name': qi.get_full_name(),
                'pending_inspections': pending,
                'completed_today': completed_today,
                'daily_target': target.target_audits if target else 0,
                'target_met': target.target_met if target else False
            })
        
        return workload
    
    def _get_billing_stats(self):
        """Get billing statistics"""
        return {
            'total_invoiced': float(Invoice.objects.aggregate(
                total=Sum('invoice_amount')
            )['total'] or 0),
            'total_paid': float(Invoice.objects.filter(
                payment_status='Paid'
            ).aggregate(total=Sum('net_amount'))['total'] or 0),
            'outstanding': float(Invoice.objects.exclude(
                payment_status='Paid'
            ).aggregate(total=Sum('net_amount'))['total'] or 0),
            'overdue': Invoice.objects.filter(
                payment_status__in=['Unpaid', 'Partially Paid'],
                due_date__lt=date.today()
            ).count()
        }
    
    @action(detail=False, methods=['get'])
    def manage_penalties(self, request):
        """Manage penalties and violations"""
        status_filter = request.query_params.get('status', 'all')
        
        penalties = Penalty.objects.all().select_related(
            'project', 'vendor', 'penalty_rule'
        )
        
        if status_filter != 'all':
            penalties = penalties.filter(penalty_status=status_filter)
        
        # Group by vendor
        by_vendor = penalties.values(
            'vendor__vendor_name'
        ).annotate(
            total_penalties=Count('id'),
            total_amount=Sum('penalty_amount')
        ).order_by('-total_amount')
        
        return Response({
            'penalties': PenaltySerializer(penalties, many=True).data,
            'by_vendor': list(by_vendor),
            'summary': {
                'total': penalties.count(),
                'draft': penalties.filter(penalty_status='Draft').count(),
                'issued': penalties.filter(penalty_status='Issued').count(),
                'paid': penalties.filter(penalty_status='Paid').count(),
                'waived': penalties.filter(penalty_status='Waived').count()
            }})
    @action(detail=False, methods=['post'])
    def manage_escalation(self, request):
        """Create or manage escalation"""
        action = request.data.get('action')  # 'create', 'assign', 'resolve'
        
        if action == 'create':
            return self._create_escalation(request)
        elif action == 'assign':
            return self._assign_escalation(request)
        elif action == 'resolve':
            return self._resolve_escalation(request)
        else:
            return Response({'error': 'Invalid action'}, status=400)

    def _create_escalation(self, request):
        """Create new escalation"""
        project_id = request.data.get('project_id')
        rule_id = request.data.get('escalation_rule_id')
        reason = request.data.get('reason')
        escalate_to_user_id = request.data.get('escalate_to_user_id')
        
        try:
            project = Project.objects.get(project_id=project_id)
            rule = EscalationRule.objects.get(id=rule_id)
            escalate_to = User.objects.get(id=escalate_to_user_id)
            
            escalation = Escalation.objects.create(
                project=project,
                escalation_rule=rule,
                escalated_from_user=request.user,
                escalated_to_user=escalate_to,
                escalation_reason=reason,
                status='Open'
            )
            
            # Send notification
            Notification.objects.create(
                recipient_user=escalate_to,
                notification_type='In-App',
                subject=f'Escalation: {project.project_code}',
                message=reason,
                related_project=project,
                status='Pending'
            )
            
            return Response({
                'status': 'created',
                'escalation_id': escalation.id
            })
            
        except (Project.DoesNotExist, EscalationRule.DoesNotExist, User.DoesNotExist) as e:
            return Response({'error': str(e)}, status=404)

    def _assign_escalation(self, request):
        """Assign escalation to user"""
        escalation_id = request.data.get('escalation_id')
        user_id = request.data.get('user_id')
        
        try:
            escalation = Escalation.objects.get(id=escalation_id)
            user = User.objects.get(id=user_id)
            
            escalation.escalated_to_user = user
            escalation.status = 'In Progress'
            escalation.save()
            
            return Response({'status': 'assigned'})
            
        except (Escalation.DoesNotExist, User.DoesNotExist) as e:
            return Response({'error': str(e)}, status=404)

    def _resolve_escalation(self, request):
        """Resolve escalation"""
        escalation_id = request.data.get('escalation_id')
        resolution = request.data.get('resolution')
        
        try:
            escalation = Escalation.objects.get(id=escalation_id)
            
            escalation.status = 'Resolved'
            escalation.resolution = resolution
            escalation.resolved_by = request.user
            escalation.resolution_date = timezone.now()
            escalation.save()
            
            return Response({'status': 'resolved'})
            
        except Escalation.DoesNotExist:
            return Response({'error': 'Escalation not found'}, status=404)

    @action(detail=False, methods=['get'])
    def predictive_analytics(self, request):
        """Get predictive analytics for supervisor"""
        # Use ML service for predictions
        from .ml_service import ml_service
        
        # Get projects at risk
        active_projects = Project.objects.exclude(
            status__status_name__in=['Completed', 'Cancelled']
        )
        
        at_risk_projects = []
        for project in active_projects:
            # Simple risk calculation based on delays and SLA
            risk_score = 0
            
            if project.is_delayed:
                risk_score += 30
            
            sla_breaches = SLATracking.objects.filter(
                project=project,
                is_breached=True
            ).count()
            risk_score += (sla_breaches * 20)
            
            pending_docs = DocumentCompliance.objects.filter(
                project=project,
                is_overdue=True,
                is_submitted=False
            ).count()
            risk_score += (pending_docs * 10)
            
            if risk_score >= 50:
                at_risk_projects.append({
                    'project_code': project.project_code,
                    'project_name': project.project_name,
                    'risk_score': min(risk_score, 100),
                    'risk_level': 'Critical' if risk_score >= 70 else 'High',
                    'factors': {
                        'is_delayed': project.is_delayed,
                        'sla_breaches': sla_breaches,
                        'overdue_documents': pending_docs
                    }
                })
        
        return Response({
            'at_risk_projects': at_risk_projects,
            'total_at_risk': len(at_risk_projects)
        })



class TeamLeaderViewSet(viewsets.ViewSet):
    """
    Team Leader Portal - Strategic management and approvals
    """
    permission_classes = [IsAuthenticated]
    
    @action(detail=False, methods=['get'])
    def organization_overview(self, request):
        """Get organization-wide monitoring dashboard (TV Mode)"""
        # Real-time metrics
        total_projects = Project.objects.count()
        active_projects = Project.objects.exclude(
            status__status_name__in=['Completed', 'Cancelled', 'Billed']
        ).count()
        delayed_projects = Project.objects.filter(is_delayed=True).count()
        
        # Team performance
        team_performance = self._get_team_performance()
        
        # Vendor performance
        vendor_rankings = self._get_vendor_rankings()
        
        # Financial overview
        financial = {
            'total_contract_value': float(Project.objects.aggregate(
                total=Sum('contract_value')
            )['total'] or 0),
            'total_penalties': float(Penalty.objects.exclude(
                penalty_status='Waived'
            ).aggregate(total=Sum('penalty_amount'))['total'] or 0),
            'outstanding_payments': float(Invoice.objects.exclude(
                payment_status='Paid'
            ).aggregate(total=Sum('net_amount'))['total'] or 0)
        }
        
        # Recent alerts
        alerts = self._get_critical_alerts()
        
        return Response({
            'overview': {
                'total_projects': total_projects,
                'active_projects': active_projects,
                'delayed_projects': delayed_projects,
                'on_time_percentage': round(
                    ((total_projects - delayed_projects) / total_projects * 100) 
                    if total_projects > 0 else 0, 2
                )
            },
            'team_performance': team_performance,
            'vendor_rankings': vendor_rankings,
            'financial': financial,
            'alerts': alerts
        })
    
    def _get_team_performance(self):
        """Get team member performance metrics"""
        engineers = User.objects.filter(role__role_name='Engineer')
        qi_users = User.objects.filter(role__role_name='Quality Inspector')
        
        performance = {
            'engineers': [],
            'quality_inspectors': []
        }
        
        # Engineer metrics
        for engineer in engineers:
            assigned = Project.objects.filter(assigned_engineer=engineer)
            completed = assigned.filter(status__status_name='Completed')
            delayed = assigned.filter(is_delayed=True)
            
            performance['engineers'].append({
                'name': engineer.get_full_name(),
                'assigned_projects': assigned.count(),
                'completed': completed.count(),
                'delayed': delayed.count(),
                'on_time_rate': round(
                    ((assigned.count() - delayed.count()) / assigned.count() * 100)
                    if assigned.count() > 0 else 0, 2
                )
            })
        
        # QI metrics
        for qi in qi_users:
            inspections = QIInspection.objects.filter(assigned_qi=qi)
            completed = inspections.filter(is_completed=True)
            
            # Monthly target achievement
            current_month = date.today().replace(day=1)
            monthly = QIMonthlyAccomplishment.objects.filter(
                qi_user=qi,
                month=current_month
            ).first()
            
            performance['quality_inspectors'].append({
                'name': qi.get_full_name(),
                'total_inspections': inspections.count(),
                'completed': completed.count(),
                'monthly_target': monthly.target_inspections if monthly else 0,
                'monthly_actual': monthly.total_inspections if monthly else 0,
                'target_met': monthly.target_met if monthly else False
            })
        
        return performance
    
    def _get_vendor_rankings(self):
        """Get vendor performance rankings"""
        vendors = Vendor.objects.filter(is_active=True).annotate(
            total_projects=Count('projects'),
            delayed_projects=Count('projects', filter=Q(projects__is_delayed=True)),
            total_penalties=Sum('penalties__penalty_amount', 
                               filter=~Q(penalties__penalty_status='Waived'))
        ).order_by('-compliance_score')[:10]
        
        rankings = []
        for vendor in vendors:
            on_time = vendor.total_projects - vendor.delayed_projects
            rankings.append({
                'vendor_name': vendor.vendor_name,
                'compliance_score': float(vendor.compliance_score),
                'total_projects': vendor.total_projects,
                'on_time_rate': round(
                    (on_time / vendor.total_projects * 100) 
                    if vendor.total_projects > 0 else 0, 2
                ),
                'total_penalties': float(vendor.total_penalties or 0)
            })
        
        return rankings
    
    def _get_critical_alerts(self):
        """Get critical alerts requiring attention"""
        alerts = []
        
        # SLA breaches
        sla_breaches = SLATracking.objects.filter(
            is_breached=True,
            status='Breached'
        ).count()
        if sla_breaches > 0:
            alerts.append({
                'type': 'SLA_BREACH',
                'severity': 'critical',
                'count': sla_breaches,
                'message': f'{sla_breaches} SLA breaches require attention'
            })
        
        # Pending penalty approvals
        pending_penalties = Penalty.objects.filter(penalty_status='Draft').count()
        if pending_penalties > 0:
            alerts.append({
                'type': 'PENDING_PENALTY',
                'severity': 'high',
                'count': pending_penalties,
                'message': f'{pending_penalties} penalties pending approval'
            })
        
        # Overdue documents
        overdue_docs = DocumentCompliance.objects.filter(
            is_overdue=True,
            is_submitted=False
        ).count()
        if overdue_docs > 5:
            alerts.append({
                'type': 'OVERDUE_DOCUMENTS',
                'severity': 'medium',
                'count': overdue_docs,
                'message': f'{overdue_docs} documents overdue'
            })
        
        # Open escalations
        open_escalations = Escalation.objects.filter(status='Open').count()
        if open_escalations > 0:
            alerts.append({
                'type': 'ESCALATION',
                'severity': 'high',
                'count': open_escalations,
                'message': f'{open_escalations} open escalations'
            })
        
        return alerts
    
    @action(detail=False, methods=['get'])
    def pending_approvals(self, request):
        """Get all items pending team leader approval"""
        # Penalties
        penalties = Penalty.objects.filter(
            penalty_status='Draft'
        ).select_related('project', 'vendor', 'penalty_rule')
        
        # High-value invoices
        invoices = Invoice.objects.filter(
            approval_status='Pending',
            invoice_amount__gte=100000  # High-value threshold
        ).select_related('project', 'vendor')
        
        # Projects
        projects = Project.objects.filter(
            status__status_name='Pending Approval'
        ).select_related('vendor', 'sector', 'assigned_engineer')
        
        return Response({
            'penalties': {
                'count': penalties.count(),
                'items': PenaltySerializer(penalties, many=True).data,
                'total_amount': float(penalties.aggregate(
                    total=Sum('penalty_amount')
                )['total'] or 0)
            },
            'invoices': {
                'count': invoices.count(),
                'items': InvoiceSerializer(invoices, many=True).data
            },
            'projects': {
                'count': projects.count(),
                'items': ProjectListSerializer(projects, many=True).data
            }
        })
    
    @action(detail=False, methods=['post'])
    def approve_penalty(self, request):
        """Approve or reject penalty"""
        penalty_id = request.data.get('penalty_id')
        action = request.data.get('action')  # 'approve' or 'reject'
        reason = request.data.get('reason', '')
        
        try:
            penalty = Penalty.objects.get(id=penalty_id)
            
            if action == 'approve':
                penalty.penalty_status = 'Issued'
                penalty.approved_by = request.user
                penalty.approval_date = timezone.now()
                penalty.issue_date = date.today()
                penalty.save()
                
                # Send notification to vendor
                if penalty.vendor:
                    Notification.objects.create(
                        recipient_email=penalty.vendor.email,
                        notification_type='Email',
                        subject=f'Penalty Issued: {penalty.project.project_code}',
                        message=f'A penalty of {penalty.penalty_amount} has been issued.',
                        related_project=penalty.project,
                        status='Pending'
                    )
                
                return Response({'status': 'approved', 'penalty_id': penalty_id})
                
            elif action == 'reject':
                penalty.penalty_status = 'Waived'
                penalty.waiver_reason = reason
                penalty.waived_by = request.user
                penalty.waiver_date = timezone.now()
                penalty.save()
                
                return Response({'status': 'rejected', 'penalty_id': penalty_id})
            
            else:
                return Response({'error': 'Invalid action'}, status=400)
                
        except Penalty.DoesNotExist:
            return Response({'error': 'Penalty not found'}, status=404)
    
    @action(detail=False, methods=['get'])
    def performance_trends(self, request):
        """Get historical performance trends"""
        months = int(request.query_params.get('months', 12))
        start_date = date.today() - timedelta(days=30 * months)
        
        # Monthly project completion trend
        monthly_data = Project.objects.filter(
            created_at__gte=start_date
        ).annotate(
            month=TruncMonth('created_at')
        ).values('month').annotate(
            total=Count('project_id'),
            completed=Count('project_id', filter=Q(status__status_name='Completed')),
            delayed=Count('project_id', filter=Q(is_delayed=True))
        ).order_by('month')
        
        # Calculate trends
        trend_data = list(monthly_data)
        for item in trend_data:
            if item['total'] > 0:
                item['on_time_percentage'] = round(
                    ((item['total'] - item['delayed']) / item['total'] * 100), 2
                )
                item['completion_rate'] = round(
                    (item['completed'] / item['total'] * 100), 2
                )
        
        return Response({
            'period_months': months,
            'monthly_trends': trend_data
        })
    
    @action(detail=False, methods=['get'])
    def comparison_report(self, request):
        """Compare current vs previous period performance"""
        # Current month
        current_month_start = date.today().replace(day=1)
        if current_month_start.month == 1:
            previous_month_start = current_month_start.replace(
                year=current_month_start.year - 1, month=12
            )
        else:
            previous_month_start = current_month_start.replace(
                month=current_month_start.month - 1
            )
        
        current_stats = self._get_period_stats(current_month_start, date.today())
        previous_stats = self._get_period_stats(previous_month_start, current_month_start)
        
        # Calculate changes
        comparison = {
            'projects_completed': {
                'current': current_stats['completed'],
                'previous': previous_stats['completed'],
                'change': current_stats['completed'] - previous_stats['completed'],
                'change_percentage': round(
                    ((current_stats['completed'] - previous_stats['completed']) / 
                     previous_stats['completed'] * 100) 
                    if previous_stats['completed'] > 0 else 0, 2
                )
            },
            'on_time_rate': {
                'current': current_stats['on_time_rate'],
                'previous': previous_stats['on_time_rate'],
                'change': current_stats['on_time_rate'] - previous_stats['on_time_rate']
            },
            'total_penalties': {
                'current': current_stats['penalties'],
                'previous': previous_stats['penalties'],
                'change': current_stats['penalties'] - previous_stats['penalties']
            }
        }
        
        return Response(comparison)
    
    def _get_period_stats(self, start_date, end_date):
        """Get statistics for a specific period"""
        projects = Project.objects.filter(
            created_at__gte=start_date,
            created_at__lt=end_date
        )
        
        completed = projects.filter(status__status_name='Completed').count()
        delayed = projects.filter(is_delayed=True).count()
        total = projects.count()
        
        penalties = float(Penalty.objects.filter(
            created_at__gte=start_date,
            created_at__lt=end_date
        ).exclude(penalty_status='Waived').aggregate(
            total=Sum('penalty_amount')
        )['total'] or 0)
        
        return {
            'completed': completed,
            'delayed': delayed,
            'total': total,
            'on_time_rate': round(
                ((total - delayed) / total * 100) if total > 0 else 0, 2
            ),
            'penalties': penalties
        }
    
    @action(detail=False, methods=['get'])
    def ai_suggestions(self, request):
        """Get AI-powered improvement suggestions"""
        suggestions = []
        
        # Analyze delay patterns
        delay_factors = ProjectDelay.objects.values(
            'factor__factor_name'
        ).annotate(
            occurrence=Count('delay_id')
        ).order_by('-occurrence')[:5]
        
        for factor in delay_factors:
            suggestions.append({
                'category': 'DELAY_REDUCTION',
                'priority': 'high',
                'title': f'Address {factor["factor__factor_name"]}',
                'description': f'This factor caused {factor["occurrence"]} delays. Consider implementing preventive measures.',
                'potential_impact': 'Could reduce delays by 15-20%'
            })
        
        # Analyze vendor performance
        underperforming = Vendor.objects.filter(
            is_active=True,
            compliance_score__lt=70
        ).count()
        
        if underperforming > 0:
            suggestions.append({
                'category': 'VENDOR_MANAGEMENT',
                'priority': 'medium',
                'title': 'Review Underperforming Vendors',
                'description': f'{underperforming} vendors have compliance scores below 70%.',
                'potential_impact': 'Could improve overall project completion rate'
            })
        
        # Check QI workload imbalance
        qi_workload = QIInspection.objects.filter(
            is_completed=False
        ).values('assigned_qi').annotate(
            pending=Count('id')
        ).order_by('-pending')
        
        if qi_workload and qi_workload[0]['pending'] > 20:
            suggestions.append({
                'category': 'RESOURCE_ALLOCATION',
                'priority': 'medium',
                'title': 'Rebalance QI Workload',
                'description': 'Some QIs have high pending inspection counts.',
                'potential_impact': 'Could improve inspection completion time'
            })
        
        return Response({
            'suggestions': suggestions,
            'generated_at': timezone.now()
        })
    
    @action(detail=False, methods=['post'])
    def manage_user_access(self, request):
        """Manage user access and permissions"""
        action = request.data.get('action')  # 'activate', 'deactivate', 'change_role'
        user_id = request.data.get('user_id')
        
        try:
            user = User.objects.get(user_id=user_id)
            
            if action == 'activate':
                user.is_active = True
                user.save()
                return Response({'status': 'activated', 'user_id': user_id})
                
            elif action == 'deactivate':
                user.is_active = False
                user.save()
                
                # Deactivate sessions
                UserSession.objects.filter(
                    user=user,
                    is_active=True
                ).update(
                    is_active=False,
                    logout_time=timezone.now()
                )
                
                return Response({'status': 'deactivated', 'user_id': user_id})
                
            elif action == 'change_role':
                new_role_id = request.data.get('role_id')
                new_role = UserRole.objects.get(role_id=new_role_id)
                user.role = new_role
                user.save()
                
                return Response({
                    'status': 'role_changed',
                    'user_id': user_id,
                    'new_role': new_role.role_name
                })
            
            else:
                return Response({'error': 'Invalid action'}, status=400)
                
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=404)
        except UserRole.DoesNotExist:
            return Response({'error': 'Role not found'}, status=404)


class SectorManagerViewSet(viewsets.ViewSet):
    """
    Sector Manager Portal - Executive KPI dashboard and strategic oversight
    """
    permission_classes = [IsAuthenticated]
    
    @action(detail=False, methods=['get'])
    def executive_dashboard(self, request):
        """Get executive KPI dashboard"""
        # Get manager's sectors
        managed_sectors = Sector.objects.filter(sector_manager=request.user)
        
        # KPI Summary
        kpi_summary = self._get_kpi_summary()
        
        # Sector comparison
        sector_comparison = self._get_sector_comparison(managed_sectors)
        
        # Financial performance
        financial = self._get_financial_performance(managed_sectors)
        
        # Strategic metrics
        strategic = self._get_strategic_metrics(managed_sectors)
        
        return Response({
            'kpi_summary': kpi_summary,
            'sector_comparison': sector_comparison,
            'financial_performance': financial,
            'strategic_metrics': strategic
        })
    
    def _get_kpi_summary(self):
        """Get latest KPI snapshot summary"""
        latest_period = KPISnapshot.objects.latest('period_end').period_end
        
        kpis = KPISnapshot.objects.filter(
            period_end=latest_period
        ).values('kpi_type', 'kpi_value', 'target_value')
        
        kpi_data = {}
        for kpi in kpis:
            achievement = 0
            if kpi['target_value']:
                achievement = round(
                    (kpi['kpi_value'] / kpi['target_value'] * 100), 2
                )
            
            kpi_data[kpi['kpi_type']] = {
                'value': float(kpi['kpi_value']),
                'target': float(kpi['target_value']) if kpi['target_value'] else None,
                'achievement': achievement,
                'status': 'green' if achievement >= 100 else 'yellow' if achievement >= 80 else 'red'
            }
        
        return kpi_data
    
    def _get_sector_comparison(self, sectors):
        """Compare performance across sectors"""
        comparison = []
        
        for sector in sectors:
            projects = Project.objects.filter(sector=sector)
            total = projects.count()
            completed = projects.filter(status__status_name='Completed').count()
            delayed = projects.filter(is_delayed=True).count()
            
            contract_value = float(projects.aggregate(
                total=Sum('contract_value')
            )['total'] or 0)
            
            comparison.append({
                'sector_name': sector.sector_name,
                'total_projects': total,
                'completed': completed,
                'delayed': delayed,
                'on_time_rate': round(
                    ((total - delayed) / total * 100) if total > 0 else 0, 2
                ),
                'completion_rate': round(
                    (completed / total * 100) if total > 0 else 0, 2
                ),
                'contract_value': contract_value
            })
        
        return comparison
    
    def _get_financial_performance(self, sectors):
        """Get financial performance metrics"""
        projects = Project.objects.filter(sector__in=sectors)
        
        return {
            'total_contract_value': float(projects.aggregate(
                total=Sum('contract_value')
            )['total'] or 0),
            'completed_value': float(projects.filter(
                status__status_name='Completed'
            ).aggregate(total=Sum('contract_value'))['total'] or 0),
            'billed_amount': float(Invoice.objects.filter(
                project__sector__in=sectors
            ).aggregate(total=Sum('invoice_amount'))['total'] or 0),
            'collected_amount': float(Invoice.objects.filter(
                project__sector__in=sectors,
                payment_status='Paid'
            ).aggregate(total=Sum('net_amount'))['total'] or 0),
            'total_penalties': float(Penalty.objects.filter(
                project__sector__in=sectors
            ).exclude(penalty_status='Waived').aggregate(
                total=Sum('penalty_amount')
            )['total'] or 0),
            'outstanding_receivables': float(Invoice.objects.filter(
                project__sector__in=sectors
            ).exclude(payment_status='Paid').aggregate(
                total=Sum('net_amount')
            )['total'] or 0)
        }
    
    def _get_strategic_metrics(self, sectors):
        """Get strategic performance indicators"""
        projects = Project.objects.filter(sector__in=sectors)
        
        # Vendor diversity
        active_vendors = Vendor.objects.filter(
            projects__sector__in=sectors,
            is_active=True
        ).distinct().count()
        
        # Average project duration
        completed = projects.filter(
            status__status_name='Completed',
            start_date__isnull=False,
            completion_date__isnull=False
        )
        
        avg_duration = 0
        if completed.exists():
            durations = [
                (p.completion_date - p.start_date).days 
                for p in completed if p.completion_date and p.start_date
            ]
            if durations:
                avg_duration = round(sum(durations) / len(durations), 2)
        
        # Quality metrics
        total_inspections = QIInspection.objects.filter(
            project__sector__in=sectors
        ).count()
        passed_inspections = QIInspection.objects.filter(
            project__sector__in=sectors,
            inspection_result='Pass'
        ).count()
        
        return {
            'active_vendors': active_vendors,
            'avg_project_duration_days': avg_duration,
            'quality_pass_rate': round(
                (passed_inspections / total_inspections * 100) 
                if total_inspections > 0 else 0, 2
            ),
            'sla_compliance_rate': self._calculate_sla_compliance(projects)
        }
    
    def _calculate_sla_compliance(self, projects):
        """Calculate SLA compliance rate"""
        total_sla = SLATracking.objects.filter(project__in=projects).count()
        if total_sla == 0:
            return 0
        
        met = SLATracking.objects.filter(
            project__in=projects,
            status='Met'
        ).count()
        
        return round((met / total_sla * 100), 2)
    
    @action(detail=False, methods=['get'])
    def sector_trends(self, request):
        """Get sector performance trends over time"""
        sector_id = request.query_params.get('sector_id')
        months = int(request.query_params.get('months', 12))
        
        if not sector_id:
            return Response({'error': 'sector_id required'}, status=400)
        
        start_date = date.today() - timedelta(days=30 * months)
        
        monthly_data = Project.objects.filter(
            sector_id=sector_id,
            created_at__gte=start_date
        ).annotate(
            month=TruncMonth('created_at')
        ).values('month').annotate(
            total=Count('project_id'),
            completed=Count('project_id', filter=Q(status__status_name='Completed')),
            delayed=Count('project_id', filter=Q(is_delayed=True)),
            contract_value=Sum('contract_value')
        ).order_by('month')
        
        return Response({
            'sector_id': sector_id,
            'period_months': months,
            'monthly_trends': list(monthly_data)
        })
    
    @action(detail=False, methods=['get'])
    def vendor_rankings(self, request):
        """Get vendor performance rankings"""
        sector_id = request.query_params.get('sector_id')
        
        vendors = Vendor.objects.filter(is_active=True)
        
        if sector_id:
            vendors = vendors.filter(projects__sector_id=sector_id).distinct()
        
        rankings = []
        for vendor in vendors:
            projects = Project.objects.filter(vendor=vendor)
            if sector_id:
                projects = projects.filter(sector_id=sector_id)
            
            total = projects.count()
            if total == 0:
                continue
            
            completed = projects.filter(status__status_name='Completed').count()
            delayed = projects.filter(is_delayed=True).count()
            
            penalties = float(Penalty.objects.filter(
                vendor=vendor,
                project__in=projects
            ).exclude(penalty_status='Waived').aggregate(
                total=Sum('penalty_amount')
            )['total'] or 0)
            
            rankings.append({
                'vendor_name': vendor.vendor_name,
                'vendor_code': vendor.vendor_code,
                'compliance_score': float(vendor.compliance_score),
                'total_projects': total,
                'completion_rate': round((completed / total * 100), 2),
                'on_time_rate': round(((total - delayed) / total * 100), 2),
                'total_penalties': penalties,
                'avg_penalty_per_project': round(penalties / total, 2) if total > 0 else 0
            })
        
        # Sort by compliance score
        rankings.sort(key=lambda x: x['compliance_score'], reverse=True)
        
        return Response({
            'rankings': rankings,
            'total_vendors': len(rankings)
        })
    
    @action(detail=False, methods=['get'])
    def strategic_recommendations(self, request):
        """Get AI-powered strategic recommendations"""
        managed_sectors = Sector.objects.filter(sector_manager=request.user)
        projects = Project.objects.filter(sector__in=managed_sectors)
        
        recommendations = []
        
        # Analyze resource allocation
        sector_workload = projects.values('sector__sector_name').annotate(
            count=Count('project_id')
        )
        
        max_workload = max([s['count'] for s in sector_workload]) if sector_workload else 0
        min_workload = min([s['count'] for s in sector_workload]) if sector_workload else 0
        
        if max_workload - min_workload > 10:
            recommendations.append({
                'category': 'RESOURCE_ALLOCATION',
                'priority': 'high',
                'title': 'Rebalance Sector Workload',
                'description': 'Significant workload imbalance detected across sectors.',
                'potential_impact': 'Could improve overall efficiency by 10-15%',
                'action_items': [
                    'Review project distribution',
                    'Consider reallocating resources',
                    'Evaluate sector capacity'
                ]
            })
        
        # Vendor concentration risk
        vendor_concentration = projects.values('vendor').annotate(
            count=Count('project_id')
        ).order_by('-count')[:3]
        
        if vendor_concentration:
            top_vendor_share = (vendor_concentration[0]['count'] / projects.count() * 100)
            if top_vendor_share > 40:
                recommendations.append({
                    'category': 'VENDOR_DIVERSIFICATION',
                    'priority': 'medium',
                    'title': 'Reduce Vendor Concentration',
                    'description': f'Top vendor handles {top_vendor_share:.1f}% of projects.',
                    'potential_impact': 'Reduced dependency risk',
                    'action_items': [
                        'Evaluate alternative vendors',
                        'Develop contingency plans',
                        'Consider vendor development programs'
                    ]
                })
        
        # Financial performance
        financial = self._get_financial_performance(managed_sectors)
        collection_rate = (
            financial['collected_amount'] / financial['billed_amount'] * 100
            if financial['billed_amount'] > 0 else 0
        )
        
        if collection_rate < 80:
            recommendations.append({
                'category': 'FINANCIAL_MANAGEMENT',
                'priority': 'high',
                'title': 'Improve Collection Rate',
                'description': f'Collection rate at {collection_rate:.1f}% is below target.',
                'potential_impact': 'Could improve cash flow significantly',
                'action_items': [
                    'Review billing processes',
                    'Implement stricter payment terms',
                    'Consider early payment incentives'
                ]
            })
        
        return Response({
            'recommendations': recommendations,
            'generated_at': timezone.now()
        })

class SystemAdministratorViewSet(viewsets.ViewSet):
    """
    System Administrator Portal - Full system management
    """
    permission_classes = [IsAuthenticated]
    
    @action(detail=False, methods=['get'])
    def system_health(self, request):
        """Get comprehensive system health metrics"""
        # User statistics
        total_users = User.objects.count()
        active_users = User.objects.filter(is_active=True).count()
        active_sessions = UserSession.objects.filter(is_active=True).count()
        
        # Database statistics
        db_stats = {
            'projects': Project.objects.count(),
            'vendors': Vendor.objects.count(),
            'documents': ProjectDocument.objects.count(),
            'inspections': QIInspection.objects.count(),
            'work_orders': WorkOrder.objects.count()
        }
        
        # Recent activity
        recent_logins = UserSession.objects.filter(
            login_time__gte=timezone.now() - timedelta(hours=24)
        ).count()
        
        # System errors
        recent_errors = SystemAuditLog.objects.filter(
            status='Failed',
            created_at__gte=timezone.now() - timedelta(hours=24)).count()
        return Response({
        'users': {
            'total': total_users,
            'active': active_users,
            'active_sessions': active_sessions,
            'recent_logins_24h': recent_logins
        },
        'database': db_stats,
        'system_status': 'healthy' if recent_errors == 0 else 'warning',
        'recent_errors_24h': recent_errors,
        'uptime': 'Available',  # Placeholder
        'last_backup': 'N/A'  # Placeholder
        })

    @action(detail=False, methods=['get'])
    def user_management(self, request):
        """Get user management overview"""
        users = User.objects.all().select_related('role')
        
        # Group by role
        by_role = users.values('role__role_name').annotate(
            count=Count('user_id'),
            active=Count('user_id', filter=Q(is_active=True))
        )
        
        # Recent user activity
        recent_activity = UserSession.objects.filter(
            login_time__gte=timezone.now() - timedelta(days=7)
        ).values('user__username', 'user__role__role_name').annotate(
            login_count=Count('session_id')
        ).order_by('-login_count')[:10]
        
        return Response({
            'total_users': users.count(),
            'by_role': list(by_role),
            'recent_activity': list(recent_activity),
            'inactive_users': users.filter(is_active=False).count()
        })

    @action(detail=False, methods=['post'])
    def create_user(self, request):
        """Create new user account"""
        serializer = RegisterUserSerializer(data=request.data)
        
        if serializer.is_valid():
            user = serializer.save()
            
            # Log action
            SystemAuditLog.objects.create(
                user=request.user,
                action_type='USER_CREATED',
                action_description=f'Created user: {user.username}',
                entity_type='User',
                entity_id=user.user_id,
                status='Success'
            )
            
            return Response({
                'status': 'created',
                'user_id': user.user_id,
                'username': user.username
            }, status=201)
        
        return Response(serializer.errors, status=400)

    @action(detail=False, methods=['post'])
    def manage_user(self, request):
        """Manage user account (activate, deactivate, reset password)"""
        action = request.data.get('action')
        user_id = request.data.get('user_id')
        
        try:
            user = User.objects.get(user_id=user_id)
            
            if action == 'activate':
                user.is_active = True
                user.save()
                action_desc = f'Activated user: {user.username}'
                
            elif action == 'deactivate':
                user.is_active = False
                user.save()
                
                # End all sessions
                UserSession.objects.filter(
                    user=user,
                    is_active=True
                ).update(
                    is_active=False,
                    logout_time=timezone.now()
                )
                action_desc = f'Deactivated user: {user.username}'
                
            elif action == 'reset_password':
                new_password = request.data.get('new_password', 'TempPassword123')
                user.set_password(new_password)
                user.save()
                action_desc = f'Reset password for: {user.username}'
                
            elif action == 'delete':
                username = user.username
                user.delete()
                action_desc = f'Deleted user: {username}'
                
            else:
                return Response({'error': 'Invalid action'}, status=400)
            
            # Log action
            SystemAuditLog.objects.create(
                user=request.user,
                action_type='USER_MANAGEMENT',
                action_description=action_desc,
                entity_type='User',
                entity_id=user_id,
                status='Success'
            )
            
            return Response({'status': action})
            
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=404)

    @action(detail=False, methods=['get'])
    def audit_logs(self, request):
        """Get system audit logs"""
        days = int(request.query_params.get('days', 7))
        action_type = request.query_params.get('action_type')
        user_id = request.query_params.get('user_id')
        
        start_date = timezone.now() - timedelta(days=days)
        
        logs = SystemAuditLog.objects.filter(
            created_at__gte=start_date
        ).select_related('user')
        
        if action_type:
            logs = logs.filter(action_type=action_type)
        
        if user_id:
            logs = logs.filter(user_id=user_id)
        
        logs = logs.order_by('-created_at')[:500]  # Limit to 500 records
        
        serializer = SystemAuditLogSerializer(logs, many=True)
        return Response({
            'logs': serializer.data,
            'total': logs.count()
        })

    @action(detail=False, methods=['get'])
    def system_settings(self, request):
        """Get system settings"""
        settings = SystemSetting.objects.all()
        serializer = SystemSettingSerializer(settings, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def update_setting(self, request):
        """Update system setting"""
        setting_key = request.data.get('setting_key')
        setting_value = request.data.get('setting_value')
        
        try:
            setting = SystemSetting.objects.get(setting_key=setting_key)
            
            if not setting.is_editable:
                return Response({'error': 'Setting is not editable'}, status=403)
            
            old_value = setting.setting_value
            setting.setting_value = setting_value
            setting.save()
            
            # Log change
            ChangeLog.objects.create(
                table_name='system_settings',
                record_id=setting.setting_id,
                change_type='UPDATE',
                field_name='setting_value',
                old_value=old_value,
                new_value=setting_value,
                changed_by=request.user
            )
            
            return Response({'status': 'updated', 'setting_key': setting_key})
            
        except SystemSetting.DoesNotExist:
            return Response({'error': 'Setting not found'}, status=404)

    @action(detail=False, methods=['post'])
    def database_backup(self, request):
        """Trigger database backup (placeholder)"""
        # This would typically trigger an actual backup process
        # For now, just log the action
        
        SystemAuditLog.objects.create(
            user=request.user,
            action_type='DATABASE_BACKUP',
            action_description='Database backup initiated',
            status='Success'
        )
        
        return Response({
            'status': 'backup_initiated',
            'timestamp': timezone.now(),
            'message': 'Database backup process started'
        })

    @action(detail=False, methods=['get'])
    def security_report(self, request):
        """Get security report"""
        days = int(request.query_params.get('days', 7))
        start_date = timezone.now() - timedelta(days=days)
        
        # Failed login attempts
        failed_logins = SystemAuditLog.objects.filter(
            action_type='LOGIN_ATTEMPT',
            status='Failed',
            created_at__gte=start_date
        ).count()
        
        # Unauthorized access attempts
        unauthorized = SystemAuditLog.objects.filter(
            action_type__icontains='UNAUTHORIZED',
            created_at__gte=start_date
        ).count()
        
        # Suspicious activities
        suspicious = SystemAuditLog.objects.filter(
            status='Failed',
            created_at__gte=start_date
        ).values('user__username', 'action_type').annotate(
            count=Count('id')
        ).filter(count__gte=5)  # 5 or more failures
        
        # Active sessions by user
        session_stats = UserSession.objects.filter(
            is_active=True
        ).values('user__username', 'user__role__role_name').annotate(
            session_count=Count('session_id')
        )
        
        return Response({
            'period_days': days,
            'failed_logins': failed_logins,
            'unauthorized_attempts': unauthorized,
            'suspicious_activities': list(suspicious),
            'active_sessions_by_user': list(session_stats),
            'security_status': 'green' if failed_logins < 10 else 'yellow' if failed_logins < 50 else 'red'
        })

    @action(detail=False, methods=['get'])
    def performance_metrics(self, request):
        """Get system performance metrics"""
        # API response times (placeholder - would need actual monitoring)
        # Database query performance (placeholder)
        # Active connections (placeholder)
        
        return Response({
            'api_response_time_ms': 120,  # Placeholder
            'database_query_time_ms': 45,  # Placeholder
            'active_connections': UserSession.objects.filter(is_active=True).count(),
            'total_requests_24h': SystemAuditLog.objects.filter(
                created_at__gte=timezone.now() - timedelta(hours=24)
            ).count(),
            'error_rate': 0.5,  # Placeholder
            'system_load': 'normal'  # Placeholder
        })





class CalendarDashboardViewSet(viewsets.ViewSet):
    """Calendar and deadline dashboard"""
    permission_classes = [AllowAny]

    @action(detail=False, methods=['get'], url_path='upcoming-deadlines')
    def upcoming_deadlines(self, request):
        """
        Get all upcoming deadlines from various sources with enhanced filtering
        """
        try:
            today = timezone.now().date()
            
            # Get date range from query params (default 90 days)
            days_ahead = int(request.query_params.get('days', 90))
            end_date = today + timedelta(days=days_ahead)
            
            # Get filter parameters
            filter_type = request.query_params.get('type', 'all')  # all, project, deadline, sla, inspection
            priority = request.query_params.get('priority', None)
            
            deadlines = []
            
            # 1. Work Order Deadlines
            if filter_type in ['all', 'deadline']:
                work_orders = WorkOrder.objects.filter(
                    target_completion_date__range=[today, end_date],
                    status__in=['NEW', 'FOR AUDIT', 'AUDITED']
                ).select_related('vendor', 'supervisor')
                
                if priority:
                    work_orders = work_orders.filter(priority=priority)
                
                for wo in work_orders:
                    days_remaining = (wo.target_completion_date - today).days if wo.target_completion_date else 0
                    deadlines.append({
                        'id': f'wo-{wo.wo_id}',
                        'date': wo.target_completion_date.isoformat() if wo.target_completion_date else None,
                        'type': 'deadline',
                        'title': 'Work Order Completion',
                        'description': f"{wo.wo_no} - {wo.description or 'No Description'}",
                        'priority': wo.priority,
                        'status': wo.status,
                        'project_code': wo.wo_no,
                        'days_remaining': days_remaining,
                        'is_overdue': days_remaining < 0,
                        'assigned_to': wo.supervisor.get_full_name() if wo.supervisor else None
                    })
            
            # 2. Project Completion Dates
            if filter_type in ['all', 'project']:
                projects = Project.objects.filter(
                    completion_date__range=[today, end_date],
                    status__status_name__in=['In Progress', 'Active']
                ).select_related('vendor', 'assigned_engineer', 'status')
                
                if priority:
                    projects = projects.filter(priority=priority)
                
                for proj in projects:
                    days_remaining = (proj.completion_date - today).days if proj.completion_date else 0
                    deadlines.append({
                        'id': f'proj-{proj.project_id}',
                        'date': proj.completion_date.isoformat() if proj.completion_date else None,
                        'type': 'project',
                        'title': 'Project Completion',
                        'description': f"{proj.project_code} - {proj.project_name}",
                        'priority': proj.priority,
                        'status': proj.status.status_name if proj.status else 'Unknown',
                        'project_code': proj.project_code,
                        'days_remaining': days_remaining,
                        'is_overdue': days_remaining < 0,
                        'assigned_to': proj.assigned_engineer.get_full_name() if proj.assigned_engineer else None
                    })
            
            # 3. SLA Tracking Deadlines
            if filter_type in ['all', 'sla']:
                sla_items = SLATracking.objects.filter(
                    due_date__range=[today, end_date],
                    status='Open'
                ).select_related('project', 'sla_rule')
                
                for sla in sla_items:
                    days_remaining = (sla.due_date - today).days if sla.due_date else 0
                    priority_level = 'Critical' if days_remaining <= 2 else 'High' if days_remaining <= 5 else 'Medium'
                    
                    deadlines.append({
                        'id': f'sla-{sla.sla_tracking_id}',
                        'date': sla.due_date.isoformat() if sla.due_date else None,
                        'type': 'sla',
                        'title': 'SLA Deadline',
                        'description': f"{sla.project.project_code} - {sla.project.project_name}",
                        'priority': priority_level,
                        'status': sla.status,
                        'project_code': sla.project.project_code,
                        'days_remaining': days_remaining,
                        'is_overdue': days_remaining < 0,
                        'assigned_to': None
                    })
            
            # 4. Document Compliance Deadlines
            if filter_type in ['all', 'deadline']:
                doc_compliance = DocumentCompliance.objects.filter(
                    due_date__range=[today, end_date],
                    is_submitted=False
                ).select_related('project', 'doc_type')
                
                for doc in doc_compliance:
                    days_remaining = (doc.due_date - today).days if doc.due_date else 0
                    priority_level = 'Critical' if days_remaining <= 2 else 'High'
                    
                    deadlines.append({
                        'id': f'doc-{doc.id}',
                        'date': doc.due_date.isoformat() if doc.due_date else None,
                        'type': 'deadline',
                        'title': f'Document: {doc.doc_type.doc_type_name}',
                        'description': f"{doc.project.project_code} - {doc.project.project_name}",
                        'priority': priority_level,
                        'status': 'Pending Submission',
                        'project_code': doc.project.project_code,
                        'days_remaining': days_remaining,
                        'is_overdue': days_remaining < 0,
                        'assigned_to': None
                    })
            
            # 5. QI Inspections
            if filter_type in ['all', 'inspection']:
                inspections = QIInspection.objects.filter(
                    scheduled_date__range=[today, end_date],
                    is_completed=False
                ).select_related('project', 'assigned_qi', 'inspection_type')
                
                for inspection in inspections:
                    days_remaining = (inspection.scheduled_date - today).days if inspection.scheduled_date else 0
                    
                    deadlines.append({
                        'id': f'qi-{inspection.inspection_id}',
                        'date': inspection.scheduled_date.isoformat() if inspection.scheduled_date else None,
                        'type': 'inspection',
                        'title': f'QI Inspection: {inspection.inspection_type.inspection_name}',
                        'description': f"{inspection.project.project_code} - {inspection.project.project_name}",
                        'priority': 'High',
                        'status': 'Scheduled',
                        'project_code': inspection.project.project_code,
                        'days_remaining': days_remaining,
                        'is_overdue': days_remaining < 0,
                        'assigned_to': inspection.assigned_qi.get_full_name() if inspection.assigned_qi else None
                    })
            
            # Sort by days remaining (most urgent first)
            deadlines.sort(key=lambda x: (x['is_overdue'], x['days_remaining']))
            
            return Response(deadlines)
            
        except Exception as e:
            return Response(
                {'error': str(e), 'detail': 'Failed to fetch upcoming deadlines'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['get'], url_path='calendar-stats')
    def calendar_stats(self, request):
        """Get statistics for calendar dashboard"""
        try:
            today = timezone.now().date()
            week_from_now = today + timedelta(days=7)
            
            # Count different types of events
            stats = {
                'total_events': 0,
                'overdue': 0,
                'this_week': 0,
                'by_type': {
                    'project': 0,
                    'deadline': 0,
                    'sla': 0,
                    'inspection': 0
                },
                'by_priority': {
                    'Critical': 0,
                    'High': 0,
                    'Medium': 0,
                    'Low': 0
                }
            }
            
            # Work Orders
            work_orders = WorkOrder.objects.filter(
                target_completion_date__isnull=False,
                status__in=['NEW', 'FOR AUDIT', 'AUDITED']
            )
            
            for wo in work_orders:
                stats['total_events'] += 1
                stats['by_type']['deadline'] += 1
                
                if wo.target_completion_date < today:
                    stats['overdue'] += 1
                elif wo.target_completion_date <= week_from_now:
                    stats['this_week'] += 1
                
                priority = wo.priority or 'Medium'
                stats['by_priority'][priority] = stats['by_priority'].get(priority, 0) + 1
            
            # Projects
            projects = Project.objects.filter(
                completion_date__isnull=False,
                status__status_name__in=['In Progress', 'Active']
            )
            
            for proj in projects:
                stats['total_events'] += 1
                stats['by_type']['project'] += 1
                
                if proj.completion_date < today:
                    stats['overdue'] += 1
                elif proj.completion_date <= week_from_now:
                    stats['this_week'] += 1
                
                priority = proj.priority or 'Medium'
                stats['by_priority'][priority] = stats['by_priority'].get(priority, 0) + 1
            
            # SLA Deadlines
            sla_count = SLATracking.objects.filter(
                status='Open',
                due_date__isnull=False
            ).count()
            stats['by_type']['sla'] = sla_count
            stats['total_events'] += sla_count
            
            # QI Inspections
            inspection_count = QIInspection.objects.filter(
                is_completed=False,
                scheduled_date__isnull=False
            ).count()
            stats['by_type']['inspection'] = inspection_count
            stats['total_events'] += inspection_count
            
            return Response(stats)
            
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


@api_view(['GET'])
@permission_classes([AllowAny])
def get_calendar_events(request):
    """Standalone endpoint for calendar events"""
    viewset = CalendarDashboardViewSet()
    viewset.request = request
    return viewset.upcoming_deadlines(request)


@api_view(['GET'])
@permission_classes([AllowAny])
def get_calendar_stats(request):
    """Standalone endpoint for calendar statistics"""
    viewset = CalendarDashboardViewSet()
    viewset.request = request
    return viewset.calendar_stats(request)