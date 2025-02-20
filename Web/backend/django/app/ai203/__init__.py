from .celery import app as celery_app

__all__ = ("celery_app",) # 로드할 때 Celery 함께 실행
