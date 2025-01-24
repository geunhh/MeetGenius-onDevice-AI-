from fastapi import APIRouter


router = APIRouter(
    prefix="/api/rag",
)


@router.get("/")
def test():
    return 'rag page'