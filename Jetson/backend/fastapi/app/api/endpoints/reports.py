from fastapi import APIRouter
from pydantic import BaseModel # 데이터 검증을 위한 모델


router = APIRouter(
    prefix="/api/reports",
)




@router.get("/")
def test():
    return 'reports page'