from django.urls import path
from .views import project_list_create,project_update

urlpatterns = [
    path('list/', project_list_create, name='project_list_create'),
    path('update/<int:project_id>/',project_update, name='project_update'),
]
