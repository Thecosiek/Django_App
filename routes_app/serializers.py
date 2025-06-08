from rest_framework import serializers
from .models import Route, RoutePoint, BackgroundImage, GameBoard, Dot

class RoutePointSerializer(serializers.ModelSerializer):
    class Meta:
        model = RoutePoint
        fields = ['id', 'x', 'y', 'order']

class RouteSerializer(serializers.ModelSerializer):
    points = RoutePointSerializer(many=True, read_only=True)
    background = serializers.PrimaryKeyRelatedField(queryset=BackgroundImage.objects.all())

    class Meta:
        model = Route
        fields = ['id', 'name', 'background', 'points']

class BackgroundSerializer(serializers.ModelSerializer):
    class Meta:
        model = BackgroundImage
        fields = ['id', 'title', 'image']
        
### 

class DotSerializer(serializers.ModelSerializer):
    class Meta:
        model = Dot
        fields = ['id', 'row', 'col', 'color']

class GameBoardSerializer(serializers.ModelSerializer):
    dots = DotSerializer(many=True)

    class Meta:
        model = GameBoard
        fields = ['id', 'name', 'rows', 'cols', 'dots']
        read_only_fields = ['id', 'user']  # <---- DODAJ TO!

    def create(self, validated_data):
        dots_data = validated_data.pop('dots')
        
        user = self.context['request'].user  # pobieramy usera z kontekstu
        
        board = GameBoard.objects.create(**validated_data)
        for dot_data in dots_data:
            Dot.objects.create(gameboard=board, **dot_data)
        return board

    def update(self, instance, validated_data):
        dots_data = validated_data.pop('dots', [])

        instance.name = validated_data.get('name', instance.name)
        instance.rows = validated_data.get('rows', instance.rows)
        instance.cols = validated_data.get('cols', instance.cols)
        instance.save()

        # Aktualizacja powiązanych kropek
        # Możesz np. usunąć wszystkie stare kropki i dodać nowe (prostsze podejście):
        instance.dots.all().delete()
        for dot_data in dots_data:
            instance.dots.create(**dot_data)

        return instance
