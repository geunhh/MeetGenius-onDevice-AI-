from django.urls import path
from . import views

app_name = "accounts"

urlpatterns = [
    path('login/', views.login, name='login'),
    path('logout/', views.logout, name='logout'),
    path('notifications/unread/', views.get_unread_notifications, name='get_unread_notifications'),
    path('notifications/mark_as_read/<int:notification_id>/', views.mark_as_read, name='mark_as_read'),
]