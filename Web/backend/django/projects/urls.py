from django.urls import path
from .views import project_list_create,project_update,upload_report

urlpatterns = [
    path('', project_list_create, name='project_list_create'),
    path('<int:project_id>/',project_update, name='project_update'),
    path('<int:project_id>/upload_report/', upload_report, name='upload_report'),

]
