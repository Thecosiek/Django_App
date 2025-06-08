from django.test import TestCase, Client
from django.urls import reverse
from django.contrib.auth.models import User
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework.test import APITestCase, APIClient
from rest_framework.authtoken.models import Token
from routes_app.models import BackgroundImage, Route, RoutePoint
import tempfile
import shutil
from django.conf import settings

class ModelTests(TestCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls._media_root = tempfile.mkdtemp()
        settings.MEDIA_ROOT = cls._media_root

    @classmethod
    def tearDownClass(cls):
        super().tearDownClass()
        shutil.rmtree(cls._media_root)

    @classmethod
    def setUpTestData(cls):
        cls.user = User.objects.create_user('bob', 'b@example.com', 'pass1234')
        cls.bg = BackgroundImage.objects.create(
            title='TestBG',
            image=SimpleUploadedFile(
                'Mapa_polski.jpg',
                b"jpgdata",
                content_type='image/jpeg'
            )
        )
        cls.route = Route.objects.create(
            user=cls.user,
            name='Route1',
            background=cls.bg
        )
        cls.point = RoutePoint.objects.create(
            route=cls.route,
            x=10.0, y=20.0,
            order=1
        )

    def test_background_image_creation(self):
        self.assertEqual(BackgroundImage.objects.count(), 1)
        self.assertEqual(self.bg.title, 'TestBG')

    def test_route_creation(self):
        self.assertEqual(Route.objects.count(), 1)
        self.assertEqual(self.route.name, 'Route1')

    def test_route_point_creation(self):
        self.assertEqual(RoutePoint.objects.count(), 1)
        self.assertEqual(self.point.x, 10.0)
        self.assertEqual(self.point.y, 20.0)
        self.assertEqual(self.point.order, 1)

    def test_models_relations(self):
        self.assertEqual(self.route.user.username, 'bob')
        self.assertEqual(self.route.background, self.bg)
        self.assertIn(self.point, self.route.points.all())

    def test_point_ordering_and_str(self):
        s = str(self.point)
        self.assertIn('(10.0, 20.0)', s)
        p2 = RoutePoint.objects.create(route=self.route, x=5, y=5, order=0)
        pts = list(self.route.points.all())
        self.assertEqual(pts[0].order, 0)
        self.assertEqual(pts[1].order, 1)


class WebViewTests(TestCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls._media_root = tempfile.mkdtemp()
        settings.MEDIA_ROOT = cls._media_root

    @classmethod
    def tearDownClass(cls):
        super().tearDownClass()
        shutil.rmtree(cls._media_root)

    def setUp(self):
        self.client = Client()
        self.user1 = User.objects.create_user('u1', 'u1@example.com', 'pwd')
        self.user2 = User.objects.create_user('u2', 'u2@example.com', 'pwd')
        self.bg = BackgroundImage.objects.create(
            title='BG', image=SimpleUploadedFile('Mapa_polski.jpg', b"jpgdata", content_type='image/jpeg')
        )
        self.route1 = Route.objects.create(user=self.user1, name='R1', background=self.bg)

    def test_login_required_redirect(self):
        url = reverse('routes_app:route_list')
        resp = self.client.get(url)
        self.assertEqual(resp.status_code, 302)
        self.assertIn(reverse('login'), resp.url)

    def test_logout(self):
        self.client.login(username='u1', password='pwd')
        resp = self.client.get(reverse('routes_app:route_list'))
        self.assertEqual(resp.status_code, 200) 

        logout_url = reverse('logout')
        resp = self.client.post(logout_url)
        self.assertEqual(resp.status_code, 302) 

        resp = self.client.get(reverse('routes_app:route_list'))
        self.assertEqual(resp.status_code, 302)
        self.assertIn(reverse('login'), resp.url)

    def test_user_access_own_routes(self):
        self.client.login(username='u1', password='pwd')
        resp = self.client.get(reverse('routes_app:route_list'))
        self.assertContains(resp, 'R1')

    def test_user_cannot_access_others_route(self):
        self.client.login(username='u2', password='pwd')
        edit_url = reverse('routes_app:route_edit', args=[self.route1.id])
        resp = self.client.get(edit_url)
        self.assertEqual(resp.status_code, 404)

    def test_create_new_route_via_form(self):
        self.client.login(username='u1', password='pwd')
        url = reverse('routes_app:route_create')
        data = {
            'name': 'NowaTrasa',
            'background': self.bg.id,
        }
        resp = self.client.post(url, data)
        self.assertEqual(resp.status_code, 302) 
        self.assertTrue(Route.objects.filter(name='NowaTrasa', user=self.user1).exists())

    def test_add_point_via_edit_form(self):
        self.client.login(username='u1', password='pwd')
        url = reverse('routes_app:route_edit', args=[self.route1.id])
        data = {
            'form-TOTAL_FORMS': '1',
            'form-INITIAL_FORMS': '0',
            'form-MIN_NUM_FORMS': '0',
            'form-MAX_NUM_FORMS': '1000',
            'form-0-x': '50.0',
            'form-0-y': '100.0',
            'form-0-order': '1',
        }
        resp = self.client.post(url, data)
        self.assertEqual(resp.status_code, 302)
        self.assertTrue(RoutePoint.objects.filter(route=self.route1, x=50.0, y=100.0, order=1).exists())

    def test_remove_point_via_edit_form(self):
        point = RoutePoint.objects.create(route=self.route1, x=1.0, y=2.0, order=1)
        self.client.login(username='u1', password='pwd')
        url = reverse('routes_app:route_edit', args=[self.route1.id])
        data = {
            'form-TOTAL_FORMS': '1',
            'form-INITIAL_FORMS': '1',
            'form-MIN_NUM_FORMS': '0',
            'form-MAX_NUM_FORMS': '1000',
            'form-0-id': str(point.id),
            'form-0-x': str(point.x),
            'form-0-y': str(point.y),
            'form-0-order': str(point.order),
            'form-0-DELETE': 'on',
        }
        resp = self.client.post(url, data)
        self.assertEqual(resp.status_code, 302)
        self.assertFalse(RoutePoint.objects.filter(id=point.id).exists())

    def test_added_and_removed_points_are_reflected_in_view(self):
        self.client.login(username='u1', password='pwd')
        RoutePoint.objects.create(route=self.route1, x=123.4, y=567.8, order=1)
        resp = self.client.get(reverse('routes_app:route_edit', args=[self.route1.id]))
        self.assertContains(resp, '123.4')
        self.assertContains(resp, '567.8')


class APITests(APITestCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls._media_root = tempfile.mkdtemp()
        settings.MEDIA_ROOT = cls._media_root

    @classmethod
    def tearDownClass(cls):
        super().tearDownClass()
        shutil.rmtree(cls._media_root)

    def setUp(self):
        self.user = User.objects.create_user('apiuser', 'a@a.com', 'pw')
        self.token = Token.objects.create(user=self.user)
        self.client = APIClient()
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.token.key)
        self.bg = BackgroundImage.objects.create(
            title='API_BG', image=SimpleUploadedFile('Mapa_polski.jpg', b"jpgdata", content_type='image/jpeg')
        )

    def test_api_route_crud_and_permissions(self):
        resp = self.client.post(reverse('trasy-list'), {'name': 'T', 'background': self.bg.id}, format='json')
        self.assertEqual(resp.status_code, 201)
        rid = resp.data['id']
        resp = self.client.get(reverse('trasy-list'))
        self.assertEqual(resp.status_code, 200)
        self.assertTrue(any(r['id'] == rid for r in resp.data))
        resp = self.client.get(reverse('trasy-detail', args=[rid]))
        self.assertEqual(resp.status_code, 200)
        resp = self.client.delete(reverse('trasy-detail', args=[rid]))
        self.assertEqual(resp.status_code, 204)

    def test_api_points_crud_and_permissions(self):
        route = Route.objects.create(user=self.user, name='P', background=self.bg)
        resp = self.client.post(reverse('punkty-list', args=[route.id]), {'x': 1, 'y': 2, 'order': 1}, format='json')
        self.assertEqual(resp.status_code, 201)
        pid = resp.data['id']
        resp = self.client.get(reverse('punkty-list', args=[route.id]))
        self.assertEqual(resp.status_code, 200)
        self.assertTrue(any(p['id'] == pid for p in resp.data))
        resp = self.client.delete(reverse('punkty-detail', args=[route.id, pid]))
        self.assertEqual(resp.status_code, 204)

    def test_api_auth_required(self):
        client2 = APIClient()
        resp = client2.get(reverse('trasy-list'))
        self.assertEqual(resp.status_code, 401)

    def test_api_user_can_only_access_own_routes(self):
        other_user = User.objects.create_user('other', 'o@o.com', 'pw')
        other_route = Route.objects.create(user=other_user, name='Inna', background=self.bg)
        resp = self.client.get(reverse('trasy-detail', args=[other_route.id]))
        self.assertEqual(resp.status_code, 404)
