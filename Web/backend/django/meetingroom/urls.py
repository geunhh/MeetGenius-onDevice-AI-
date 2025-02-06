from django.urls import path
from . import views

app_name = "meetingroom"

urlpatterns = [
    path('book/<int:room_id>/', views.meetingroom_list_create, name='meetingroom_list_create'),
    path('project/<str:project_name>/', views.project_detail, name='project_detail'),
    
]
