from django.apps import AppConfig

class RoutesAppConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'routes_app'

    def ready(self):
        import routes_app.signals 