"""의존성 주입 함수 모듈"""

from fastapi import Request

def get_app(request: Request):
    """FastAPI 애플리케이션 인스턴스를 반환하는 의존성 함수"""
    return request.app

def get_app_state(request: Request):
    """FastAPI app.state 객체를 반환하는 의존성 함수"""
    return request.app.state 
