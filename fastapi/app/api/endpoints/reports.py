from fastapi import APIRouter


router = APIRouter(
    prefix="/api/reports",
)


@router.get("/")
def test():
    return 'reports page'