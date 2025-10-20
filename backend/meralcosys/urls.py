

# ============================================
# PROJECT urls.py (project_name/urls.py)
# ============================================

from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [
    # Admin
    path('admin/', admin.site.urls),
    
    # Authentication (JWT)
    path('api/auth/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # API Routes
    path('api/v1/', include('meralcoapp.urls')),
    
    # Additional API documentation (optional)
    path('api/schema/', include('rest_framework.urls')),
]


# ============================================
# ALTERNATIVE: Using SimpleRouter (if preferred)
# ============================================

# If you prefer SimpleRouter instead of DefaultRouter:
# from rest_framework.routers import SimpleRouter
# 
# router = SimpleRouter()
# # ... register all viewsets as above ...
# 
# urlpatterns = [
#     path('', include(router.urls)),
# ]


# ============================================
# OPTIONAL: Custom URL Patterns with DRF
# ============================================

# For more complex scenarios, you can add custom paths:
# 
# from rest_framework.decorators import api_view, permission_classes
# from rest_framework.response import Response
# 
# @api_view(['GET'])
# @permission_classes([IsAuthenticated])
# def api_root(request):
#     return Response({
#         'users': request.build_absolute_uri('/api/v1/users/'),
#         'projects': request.build_absolute_uri('/api/v1/projects/'),
#         'vendors': request.build_absolute_uri('/api/v1/vendors/'),
#     })
# 
# urlpatterns = [
#     path('', api_root, name='api-root'),
#     path('', include(router.urls)),
# ]


# ============================================
# SETTINGS.PY CONFIGURATION (for reference)
# ============================================

# Add these to your settings.py:
# 
# INSTALLED_APPS = [
#     # ... other apps ...
#     'rest_framework',
#     'django_filters',
#     'rest_framework_simplejwt',
#     'corsheaders',
#     'your_app_name',
# ]
# 
# REST_FRAMEWORK = {
#     'DEFAULT_FILTER_BACKENDS': [
#         'django_filters.rest_framework.DjangoFilterBackend',
#         'rest_framework.filters.SearchFilter',
#         'rest_framework.filters.OrderingFilter',
#     ],
#     'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
#     'PAGE_SIZE': 20,
#     'DEFAULT_AUTHENTICATION_CLASSES': (
#         'rest_framework_simplejwt.authentication.JWTAuthentication',
#     ),
#     'DEFAULT_PERMISSION_CLASSES': (
#         'rest_framework.permissions.IsAuthenticated',
#     ),
# }
# 
# SIMPLE_JWT = {
#     'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
#     'REFRESH_TOKEN_LIFETIME': timedelta(days=1),
#     'ALGORITHM': 'HS256',
# }