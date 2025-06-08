from django.contrib import admin
from .models import BackgroundImage, Route, RoutePoint

@admin.register(BackgroundImage)
class BackgroundImageAdmin(admin.ModelAdmin):
    list_display = ['title']

class RoutePointInline(admin.TabularInline):
    model = RoutePoint
    extra = 0

@admin.register(Route)
class RouteAdmin(admin.ModelAdmin):
    list_display = ['name', 'user', 'background']
    inlines = [RoutePointInline]
    
### 

from django.contrib import admin
from .models import GameBoard, Dot

@admin.register(GameBoard)
class GameBoardAdmin(admin.ModelAdmin):
    list_display = ('name', 'user', 'rows', 'cols')

admin.site.register(Dot)