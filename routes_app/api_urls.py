from rest_framework.routers import DefaultRouter
from .views import GameBoardViewSet, DotViewSet

router = DefaultRouter()
router.register(r'boards', GameBoardViewSet, basename='boards')
router.register(r'boards/(?P<gameboard_pk>\d+)/dots', DotViewSet, basename='dots')

urlpatterns = router.urls
