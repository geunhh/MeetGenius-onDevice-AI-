from fastapi import APIRouter


router = APIRouter(
    prefix="/api/embedding",
)


@router.get("/")
def test():
    return 'embdding page'