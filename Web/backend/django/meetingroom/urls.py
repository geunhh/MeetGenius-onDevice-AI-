from django.urls import path
from . import views

app_name = "meetingroom"

urlpatterns = [
    path('book/<int:room_id>/', views.meetingroom_list_create, name='meetingroom_list_create'),
    path('project_participation/<str:project_name>/', views.project_detail, name='project_detail'),
    path('booked/<int:meeting_id>/', views.meeting_detail, name="meeting_detail"),
    path('mymeeting/', views.mymeeting, name="mymeeting"),

    # 회의록 조회
    path('moms_by_meeting/<meeting_id>/',views.get_or_update_moms_by_meeting),
    path('moms_by_project/<project_id>/',views.get_moms_by_project),
    path('meetings_by_project/<project_id>/',views.get_projects_by_meeting),
    path('summarymoms_by_meeting/<meeting_id>/',views.get_summarymom_by_meeting)
    
]
