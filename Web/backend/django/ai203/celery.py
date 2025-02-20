# ai203/celery.py
import os
from celery import Celery

# Django 설정 파일 로드
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "ai203.settings")

app = Celery("ai203")

# Celery 설정 로드 (Django settings.py에서 CELERY 관련 설정 가져오기)
app.config_from_object("django.conf:settings", namespace="CELERY")

# 자동으로 모든 앱에서 tasks.py 찾기
app.autodiscover_tasks()
