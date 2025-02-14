from django.urls import path
from .views import project_list_create,project_update,upload_report, all_reports, report

urlpatterns = [
    path('', project_list_create, name='project_list_create'),
    path('<int:project_id>/',project_update, name='project_update'),
    path('<int:project_id>/upload_report/', upload_report, name='upload_report'),
    path('<int:project_id>/all_reports/', all_reports, name="all_reports"),
    path('<int:project_id>/<int:report_id>/', report, name="report")
]
