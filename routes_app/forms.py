from django import forms
from .models import Route, RoutePoint, GameBoard, Dot
from django.forms.models import inlineformset_factory

class RouteForm(forms.ModelForm):
    class Meta:
        model = Route
        fields = ['name', 'background']

RoutePointFormSet = inlineformset_factory(
    Route, RoutePoint,
    fields=('x', 'y', 'order'), extra=0, can_delete=True
)

###

class GameBoardForm(forms.ModelForm):
    class Meta:
        model = GameBoard
        fields = ['name','rows', 'cols']

DotFormSet = inlineformset_factory(
    GameBoard, Dot,
    fields=('row', 'col', 'color'),
    extra=1,  # pokaż chociaż jeden pusty formularz w szablonie
    can_delete=True,
    validate_min=False,
    validate_max=False
)