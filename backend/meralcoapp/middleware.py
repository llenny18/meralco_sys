from django.http import JsonResponse
from functools import wraps
from .models import User, RolePermission, Permission

def check_permission(permission_name):
    """Decorator to check if user has specific permission"""
    def decorator(view_func):
        @wraps(view_func)
        def wrapper(request, *args, **kwargs):
            if not request.user.is_authenticated:
                return JsonResponse({'error': 'Authentication required'}, status=401)
            
            # System admins have all permissions
            if request.user.role and request.user.role.role_name == 'System Administrator':
                return view_func(request, *args, **kwargs)
            
            # Check if user's role has the required permission
            has_permission = RolePermission.objects.filter(
                role=request.user.role,
                permission__permission_name=permission_name
            ).exists()
            
            if not has_permission:
                return JsonResponse({
                    'error': 'Insufficient permissions',
                    'required_permission': permission_name
                }, status=403)
            
            return view_func(request, *args, **kwargs)
        return wrapper
    return decorator


class RoleBasedAccessMiddleware:
    """Middleware to enforce role-based access control"""
    
    def __init__(self, get_response):
        self.get_response = get_response
    
    def __call__(self, request):
        response = self.get_response(request)
        return response
    
    def process_view(self, request, view_func, view_args, view_kwargs):
        # Skip permission check for public endpoints
        public_paths = ['/api/v1/auth/login/', '/health/', '/chat/health/']
        if request.path in public_paths:
            return None
        
        # Skip for non-authenticated users (will be handled by view)
        if not request.user.is_authenticated:
            return None
        
        return None