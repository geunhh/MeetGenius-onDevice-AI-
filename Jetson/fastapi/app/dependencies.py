"""의존성 주입 함수 모듈"""

from fastapi import Request

def get_app_state(request: Request):
    """FastAPI의 app.state 객체를 반환하는 의존성 함수"""
    return request.app.state 