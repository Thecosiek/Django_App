from django.contrib.auth.decorators import login_required
from django.shortcuts import redirect, get_object_or_404, render
from django.views.generic import ListView, CreateView
from django.contrib.auth.mixins import LoginRequiredMixin
from .models import BackgroundImage, Route, RoutePoint, GameBoard, Dot
from .forms import RouteForm, RoutePointFormSet, GameBoardForm, DotFormSet
from django.urls import reverse
from django.http import HttpResponseNotAllowed
from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from .serializers import RouteSerializer, RoutePointSerializer, GameBoardSerializer, DotSerializer

from django.utils.timezone import now

class BackgroundListView(LoginRequiredMixin, ListView):
    model = BackgroundImage
    template_name = 'routes_app/background_list.html'
    context_object_name = 'backgrounds'

class RouteListView(LoginRequiredMixin, ListView):
    model = Route
    template_name = 'routes_app/route_list.html'
    context_object_name = 'routes'

    def get_queryset(self):
        return Route.objects.filter(user=self.request.user)

class RouteCreateView(LoginRequiredMixin, CreateView):
    model = Route
    form_class = RouteForm
    template_name = 'routes_app/route_create.html'
    def form_valid(self, form):
        form.instance.user = self.request.user
        return super().form_valid(form)

    def get_success_url(self):
        return reverse('routes:route_edit', args=[self.object.pk])

@login_required
def edit_route(request, pk):
    route = get_object_or_404(Route, pk=pk, user=request.user)

    if request.method == 'POST':
        formset = RoutePointFormSet(request.POST, instance=route, prefix='form')
        if formset.is_valid():
            formset.save()
            return redirect('routes:route_list')
    else:
        formset = RoutePointFormSet(instance=route, prefix='form')

    return render(request, 'routes_app/route_edit.html', {
        'route': route,
        'formset': formset,
    })

@login_required
def delete_route(request, pk):
    if request.method != 'POST':
        return HttpResponseNotAllowed(['POST'])
    route = get_object_or_404(Route, pk=pk, user=request.user)
    route.delete()
    return redirect('routes:route_list')

class RouteViewSet(viewsets.ModelViewSet):
    serializer_class = RouteSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Route.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=['post'])
    def add_point(self, request, pk=None):
        """
        Dodatkowy endpoint POST /api/trasy/{pk}/add_point/
        do dodania punktu (x, y, order) do wskazanej trasy.
        """
        route = self.get_object()
        serializer = RoutePointSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(route=route)
        return Response(serializer.data, status=201)


class RoutePointViewSet(viewsets.ModelViewSet):
    """
    API endpoint do zarządzania punktami tras:
    - GET    /api/trasy/{route_pk}/punkty/         -> lista punktów
    - POST   /api/trasy/{route_pk}/punkty/         -> dodanie nowego punktu
    - DELETE /api/trasy/{route_pk}/punkty/{pk}/    -> usunięcie punktu
    """
    serializer_class = RoutePointSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        route_id = self.kwargs['route_pk']
        return RoutePoint.objects.filter(route__pk=route_id, route__user=self.request.user)

    def perform_create(self, serializer):
        route = get_object_or_404(Route, pk=self.kwargs['route_pk'], user=self.request.user)
        serializer.save(route=route)
        
###

class GameBoardListView(LoginRequiredMixin, ListView):
    model = GameBoard
    template_name = 'routes_app/gameboard_list.html'
    context_object_name = 'gameboards'

    def get_queryset(self):
        #return GameBoard.objects.all(user=self.request.user)
        return GameBoard.objects.all

class GameBoardCreateView(LoginRequiredMixin, CreateView):
    model = GameBoard
    form_class = GameBoardForm
    template_name = 'routes_app/gameboard_create.html'

    def get_context_data(self, **kwargs):
        print("get_context_data:", self.request.method)
        context = super().get_context_data(**kwargs)
        if self.request.method == 'POST':
            context['formset'] = DotFormSet(self.request.POST, prefix='form')
        else:
            context['formset'] = DotFormSet(prefix='form')
        context['gameboard'] = None  # potrzebne dla szablonu
        context['timestamp'] = now().timestamp()
        return context

    def form_valid(self, form):
        context = self.get_context_data()
        formset = context['formset']

        form.instance.user = self.request.user
        self.object = form.save()
        print("Utworzono planszę:", self.object)

        if formset.is_valid():
            formset.instance = self.object
            formset.save()
            return redirect(self.get_success_url())
        else:
            print("Formset błędy:", formset.errors)
            return self.form_invalid(form)

    def form_invalid(self, form):
        print("Formularz główny nie przeszedł walidacji.")
        print(form.errors)
        return self.render_to_response(self.get_context_data(form=form))

    def get_success_url(self):
        return reverse('routes:board_list')


'''class GameBoardCreateView(LoginRequiredMixin, CreateView):
    model = GameBoard
    form_class = GameBoardForm
    template_name = 'routes_app/gameboard_create.html'

    def get_context_data(self, **kwargs): # timestamp
        context = super().get_context_data(**kwargs)
        context['timestamp'] = now().timestamp()
        return context

    def form_valid(self, form):
        form.instance.user = self.request.user
        return super().form_valid(form)

    def get_success_url(self):
        return reverse('routes:gameboard_edit', args=[self.object.pk])'''
        
@login_required
def edit_gameboard(request, pk):
    gameboard = get_object_or_404(GameBoard, pk=pk, user=request.user)

    if request.method == 'POST':
        form = GameBoardForm(request.POST, instance=gameboard)
        formset = DotFormSet(request.POST, instance=gameboard, prefix='form')
        if form.is_valid() and formset.is_valid():
            form.save()
            formset.save()
            return redirect('routes:board_list')
    else:
        form = GameBoardForm(instance=gameboard)
        formset = DotFormSet(instance=gameboard, prefix='form')

    return render(request, 'routes_app/gameboard_create.html', {
        'gameboard': gameboard,
        'form': form,
        'formset': formset,
        'timestamp': now().timestamp(),
    })


    
@login_required
def delete_gameboard(request, pk):
    if request.method != 'POST':
        return HttpResponseNotAllowed(['POST'])
    gameboard = get_object_or_404(GameBoard, pk=pk, user=request.user)
    gameboard.delete()
    return redirect('routes:board_list')

class GameBoardViewSet(viewsets.ModelViewSet):
    serializer_class = GameBoardSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return GameBoard.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    def create(self, request, *args, **kwargs): #debug
        print("DANE OTRZYMANE:", request.data)  # <--- DODAJ TO
        return super().create(request, *args, **kwargs)

    @action(detail=True, methods=['post'])
    def add_dot(self, request, pk=None):
        """
        POST /api/plansze/{pk}/add_dot/
        """
        gameboard = self.get_object()
        serializer = DotSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(gameboard=gameboard)
        return Response(serializer.data, status=201)

class DotViewSet(viewsets.ModelViewSet):
    serializer_class = DotSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        gameboard_id = self.kwargs['gameboard_pk']
        return Dot.objects.filter(gameboard__pk=gameboard_id, gameboard__user=self.request.user)

    def perform_create(self, serializer):
        gameboard = get_object_or_404(GameBoard, pk=self.kwargs['gameboard_pk'], user=self.request.user)
        serializer.save(gameboard=gameboard)

#####

from django.http import JsonResponse
from .models import GameBoard
import json
from django.views.decorators.csrf import csrf_exempt


'''def gameboard_list_api(request):
    gameboards = GameBoard.objects.all().values('id', 'name', 'rows', 'cols', 'user__username')
    # Zamieniamy QuerySet na listę dictów
    gameboards_list = list(gameboards)
    return JsonResponse(gameboards_list, safe=False)'''
    
@csrf_exempt
def gameboard_list_api(request):
    if request.method == 'GET':
        gameboards = GameBoard.objects.all().values('id', 'name', 'rows', 'cols', 'user__username')
        return JsonResponse(list(gameboards), safe=False)

    elif request.method == 'POST':
        if not request.user.is_authenticated:
            return JsonResponse({'error': 'Authentication required'}, status=401)

        try:
            data = json.loads(request.body)
            # Utwórz planszę
            board = GameBoard.objects.create(
                name=data.get('name'),
                rows=data.get('rows'),
                cols=data.get('cols'),
                user=request.user
            )

            # Utwórz punkty, jeśli istnieją
            dots = data.get('dots', [])
            for dot_data in dots:
                Dot.objects.create(
                    gameboard=board,
                    row=dot_data.get('row'),
                    col=dot_data.get('col'),
                    color=dot_data.get('color', '#000000')  # domyślny kolor
                )

            return JsonResponse({'id': board.id, 'name': board.name}, status=201)

        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)



from django.shortcuts import render, get_object_or_404
from django.contrib.auth.decorators import login_required
from .models import GameBoard
'''
@login_required
def view_gameboard(request, pk):
    gameboard = get_object_or_404(GameBoard, pk=pk)  # **bez filtrowania po userze**
    form = GameBoardForm(instance=gameboard)
    formset = DotFormSet(instance=gameboard, prefix='form')

    # Nie obsługujemy POST, bo to tylko podgląd - brak zapisu
    # Możesz ustawić formy jako "readonly" w szablonie lub w frontendzie

    return render(request, 'routes_app/gameboard_view.html', {
        'gameboard': gameboard,
        'form': form,
        'formset': formset,
        'readonly': True,  # flaga do szablonu / JS
    })'''
    
@login_required
def view_gameboard(request, pk):
    gameboard = get_object_or_404(GameBoard, pk=pk)

    # Pobierz ścieżki tylko aktualnego użytkownika
    user_paths = gameboard.paths.filter(user=request.user).prefetch_related('steps')

    # Serializacja ścieżek do formatu wygodnego do JS, np. lista słowników
    paths_data = []
    for path in user_paths:
        steps = list(path.steps.order_by('order').values('x', 'y'))
        paths_data.append({
            'id': path.id,
            'steps': steps,
            'created_at': path.created_at.isoformat(),
        })

    form = GameBoardForm(instance=gameboard)
    formset = DotFormSet(instance=gameboard, prefix='form')

    return render(request, 'routes_app/gameboard_view.html', {
        'gameboard': gameboard,
        'form': form,
        'formset': formset,
        'readonly': True,
        'user_paths_json': json.dumps(paths_data),  # przekazujemy JSON do szablonu
    })

    
    
from .models import Path, PathStep
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_protect
from django.http import JsonResponse, HttpResponseForbidden
   
@login_required
@csrf_protect
    
def save_path(request):
    if request.method == "POST":
        data = json.loads(request.body)
        board_id = data.get("board_id")
        steps = data.get("steps")

        board = GameBoard.objects.get(id=board_id)
        # Tworzymy ścieżkę z przypisaniem użytkownika
        path = Path.objects.create(board=board, user=request.user)

        for idx, step in enumerate(steps):
            PathStep.objects.create(path=path, x=step['x'], y=step['y'], order=idx)

        return JsonResponse({"status": "ok", "path_id": path.id})
    return HttpResponseForbidden()

########################################################################################

from django.http import StreamingHttpResponse
import time
import queue
import redis
from .sse import redis_client

def sse_notifications(request):
    # rejestrujemy nowego klienta
    r = redis_client.pubsub()
    r.subscribe('notifications')

    def event_stream():
        try:
            # co 15s wysyłamy keep-alive komentarz aby nie zamykać połączenia
            last_keepalive = time.time()
            
            while True:
                    msg = r.get_message(timeout=1)

                    if msg and msg['type'] == 'message':
                        raw = msg['data'].decode('utf-8')
                        try:
                            parsed = json.loads(raw)
                            event_type = parsed.get('event', 'message')
                            data = json.dumps(parsed.get('data', {}))
                            yield f"event: {event_type}\ndata: {data}\n\n"
                        except json.JSONDecodeError:
                            # fallback w razie błędu
                            yield f"data: {raw}\n\n"


                    else :
                        if time.time() - last_keepalive > 15:
                            yield ": keep-alive\n\n"
                            last_keepalive = time.time()
        finally:
            r.unsubscribe()

    return StreamingHttpResponse(event_stream(), content_type="text/event-stream")

