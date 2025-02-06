from django.urls import path
from . import views

app_name = "meetingroom"

urlpatterns = [
    path('', views.meetingroom_list_create, name='meetingroom_list_create'),
]
