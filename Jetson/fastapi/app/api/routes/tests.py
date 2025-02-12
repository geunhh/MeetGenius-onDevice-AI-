from fastapi import APIRouter, Depends, FastAPI, status
from app.services import rag
from app.dependencies import get_app

router = APIRouter(
    prefix="/api/v1/tests",
    tags=["tests"]
)

@router.get("/")
def test():
    return {"message": "Test Endpoints"}

@router.post("/rag", status_code=status.HTTP_200_OK)
async def rag_test(query: str, app: FastAPI = Depends(get_app)):
    answer = await rag.rag_process(app=app, query=query)
    return answer