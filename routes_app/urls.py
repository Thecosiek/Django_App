#urls.py
from django.shortcuts import redirect
from django.urls import path
from .views import BackgroundListView, RouteListView, RouteCreateView, edit_route, delete_route
from .views import GameBoardListView, GameBoardCreateView, edit_gameboard, delete_gameboard
from django.urls import path, include
from . import views
from django.urls import path
from .views import sse_notifications


app_name = 'routes'

urlpatterns = [
    path('', lambda request: redirect('routes:route_list')),
    
    # Route
    path('backgrounds/', BackgroundListView.as_view(), name='background_list'),
    path('routes/', RouteListView.as_view(), name='route_list'),
    path('routes/new/', RouteCreateView.as_view(), name='route_create'),
    path('routes/<int:pk>/edit/', edit_route, name='route_edit'),
    path('routes/<int:pk>/delete/', delete_route, name='route_delete'),
    
    # Plansze
    path('boards/', GameBoardListView.as_view(), name='board_list'),
    path('boards/new/', GameBoardCreateView.as_view(), name='board_create'),
    path('boards/<int:pk>/edit/', edit_gameboard, name='board_edit'),
    path('boards/<int:pk>/delete/', delete_gameboard, name='board_delete'),
    
    #Lab10
    path('api/boards/', views.gameboard_list_api, name='gameboard-list-api'),
    path('boards/<int:pk>/view/', views.view_gameboard, name='board_view'),

    #Lab10 - ścieżka
    path('api/save_path/', views.save_path, name='save_path'),

    #Lab11 - SSE
    path('sse/notifications/', sse_notifications, name='sse_notifications'),
    
    # Dodajemy endpoint API pod /api/
    path('api/', include('routes_app.api_urls')),
]