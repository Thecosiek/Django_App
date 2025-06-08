## ✅ Jak uruchomić projekt lokalnie

### Sklonuj repozytorium

```bash
git clone https://github.com/Thecosiek/Django_App.git
cd Django_App
```

### Stwórz środowisko virtualenv i je aktywuj

```bash
python -m venv venv
# Windows:
venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate
```
### Pobierz potrzebne rozszerzenia Python: uvicorn, redis

### Zbuduj frontend (npm)

```bash
cd frontend
cd src
npm install
npm run build
cd ..
cd ..
```

---

### Uruchom Redis

```bash
redis-server
```

---

### Zasubskrybuj kanał `notifications`

```bash
redis-cli
SUBSCRIBE notifications
```

### Wykonaj migracje i uruchom serwer Django

```bash
python manage.py migrate
python manage.py runserver
```

---

## 🌐 Dostęp

Projekt dostępny będzie pod adresem:  
[http://127.0.0.1:8000](http://127.0.0.1:8000)

---
