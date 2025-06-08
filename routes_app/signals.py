from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import GameBoard, Path
from .sse import publish_event

@receiver(post_save, sender=GameBoard)
def board_created(sender, instance, created, **kwargs):
    if created:
        publish_event('newBoard', {
            'board_id': instance.id,
            'board_name': instance.name,
            'creator_username': instance.user.username,
        })

@receiver(post_save, sender=Path)
def path_created(sender, instance, created, **kwargs):
    if created:
        publish_event('newPath', {
            'path_id': instance.id,
            'board_id': instance.board.id,
            'board_name': instance.board.name,
            'user_username': instance.user.username,
        })