"""URL configuration for djgo_lab1 project."""
from django.contrib import admin
from django.urls import path, include
from django.contrib.auth import views as auth_views
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.authtoken.views import obtain_auth_token
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi
from rest_framework.routers import DefaultRouter
from rest_framework_nested import routers as nested_routers
from routes_app.views import RouteViewSet, RoutePointViewSet
from . import views

router = DefaultRouter()
router.register(r'trasy', RouteViewSet, basename='trasy')
nested_router = nested_routers.NestedDefaultRouter(router, r'trasy', lookup='route')
nested_router.register(r'punkty', RoutePointViewSet, basename='punkty')

schema_view = get_schema_view(
    openapi.Info(
        title="API Trasy",
        default_version='v1',
        description="Dokumentacja API Interaktywnego Edytora Tras",
    ),
    public=True,
    permission_classes=(permissions.AllowAny,),
)

urlpatterns = [
    path('', views.home, name='home'),
    
    path('admin/', admin.site.urls),
    path('login/', auth_views.LoginView.as_view(template_name='registration/login.html'), name='login'),
    path('logout/', auth_views.LogoutView.as_view(), name='logout'),

    path('register/', views.register, name='register'),

    #path('', include('routes_app.urls', namespace='routes_app')),

    path('api/', include(router.urls)),
    path('api/', include(nested_router.urls)),
    path('api-token-auth/', obtain_auth_token, name='api_token_auth'),
    path('swagger.json', schema_view.without_ui(cache_timeout=0), name='schema-json'),
    path('swagger.yaml', schema_view.without_ui(cache_timeout=0), name='schema-yaml'),
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
    path('', include('routes_app.urls'))
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)