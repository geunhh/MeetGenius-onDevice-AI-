from django.urls import path
from . import views

urlpatterns = [
    path('', views.test_view, name='test'),
    path('stt/', views.receive_stt_test, name="stt"),
]
