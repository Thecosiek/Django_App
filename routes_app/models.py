#models.py
from django.db import models
from django.contrib.auth.models import User
from django.urls import reverse

class BackgroundImage(models.Model):
    title = models.CharField(max_length=100)
    image = models.ImageField(upload_to='backgrounds/')

    def __str__(self):
        return self.title

class Route(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    background = models.ForeignKey(BackgroundImage, on_delete=models.CASCADE)
    name = models.CharField(max_length=100)

    def __str__(self):
        return f"{self.name} ({self.user.username})"

    def get_edit_url(self):
        return reverse('routes:route_edit', args=[self.pk])

class RoutePoint(models.Model):
    route = models.ForeignKey(Route, related_name='points', on_delete=models.CASCADE)
    x = models.FloatField()
    y = models.FloatField()
    order = models.PositiveIntegerField()

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"Point {self.order}: ({self.x}, {self.y})"
    
###

class GameBoard(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    rows = models.IntegerField()
    cols = models.IntegerField()

    def __str__(self):
        return self.name

class Dot(models.Model):
    gameboard = models.ForeignKey(GameBoard, on_delete=models.CASCADE, related_name='dots')
    row = models.PositiveIntegerField()
    col = models.PositiveIntegerField()
    color = models.CharField(max_length=7)  # np. "#FF0000"

############

class Path(models.Model):
    board = models.ForeignKey(GameBoard, on_delete=models.CASCADE, related_name='paths')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='paths')
    created_at = models.DateTimeField(auto_now_add=True)

class PathStep(models.Model):
    path = models.ForeignKey(Path, on_delete=models.CASCADE, related_name='steps')
    x = models.IntegerField()
    y = models.IntegerField()
    order = models.IntegerField()

    class Meta:
        unique_together = ('path', 'x', 'y')
        ordering = ['order']
