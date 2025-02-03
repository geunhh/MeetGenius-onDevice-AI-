from django.urls import path
from .views import receive_stt_test,see_view,start_stt,stop_stt

urlpatterns = [
    path('stt/', receive_stt_test, name="stt"),
    path('stream/',see_view),
    path('stt/start/',start_stt),
    path('stt/stop/',stop_stt),
]