from django.urls import path
from . import views

app_name = "meetingroom"

urlpatterns = [
    path('book/<int:room_id>/', views.meetingroom_list_create, name='meetingroom_list_create'),
    path('project_participation/<str:project_name>/', views.project_detail, name='project_detail'),
    path('booked/<int:meeting_id>/', views.meeting_detail, name="meeting_detail"),
    path('mymeeting/', views.mymeeting, name="mymeeting"),
]
