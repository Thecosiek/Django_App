from django.shortcuts import render
from django.shortcuts import render, redirect
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth import login
from django.shortcuts import render, redirect
from django.contrib import messages
from django.shortcuts import render, redirect
from django.contrib.auth.models import User
from django.contrib import messages
from django.http import HttpResponse



def home(request):
    return render(request, 'home.html')

def register(request):
    if request.method == 'POST':
        username = request.POST['username']
        password = request.POST['password']
        confirm_password = request.POST['confirm_password']

        if password != confirm_password:
            messages.error(request, 'Hasła nie pasują do siebie!')
            return redirect('register') 

        if User.objects.filter(username=username).exists():
            messages.error(request, 'Nazwa użytkownika jest już zajęta!')
            return redirect('register')

        user = User.objects.create_user(username=username, password=password)
        user.save()

        messages.success(request, 'Rejestracja zakończona sukcesem!')
        return redirect('login') 
    
    return render(request, 'register.html')