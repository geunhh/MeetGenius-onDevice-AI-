from django.urls import path
from . import views

app_name = "meetingroom"

urlpatterns = [
    path('book/<int:room_id>/', views.meetingroom_list_create, name='meetingroom_list_create'),
    path('project_participation/<str:project_name>/', views.project_detail, name='project_detail'), #회의 생성시 프로젝트 참여자를 불러오는 api
    path('booked/<int:meeting_id>/', views.meeting_detail, name="meeting_detail"),
]
