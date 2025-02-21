from fastapi import APIRouter, Request
import httpx


router = APIRouter(
    prefix="/api/test",
)

result = {
        'ids' : ["doc-3"],
        'data' : ["세 번째 문서 내용입니다."],
        'embeddings' : [[0.4, 0.5, 0.6]],  # 임베딩 벡터
        'metadatas' : 
        [{
            "projectId": "pjt-003",
            "문서id": "302",
            "문서type": "1",
            "프로젝트명": "챗봇 고도화 PJT",
            "회의명": "회의1",
            "안건명": "안건이시렵니가"
        },]
    }

@router.get("/from_django_get")
async def get_data_from_django():
    # Django 서버 URL 설정
    django_url = "http://127.0.0.1:8000/tests/"  # Django의 test_view 경로

    # Django로 GET 요청 보내기
    async with httpx.AsyncClient() as client:
        response = await client.get(django_url)
        if response.status_code == 200:
            # Django에서 받은 데이터 반환
            return {
                "message": "Django에서 데이터 가져오기 성공",
                "data": response.json()
            }
        else:
            # 에러 처리
            return {
                "message": "Django에서 데이터 가져오기 실패",
                "status_code": response.status_code,
                "error": response.text
            }

@router.post("/from_django")
async def test_post(request : Request):
    print(request)
    django_url = "http://127.0.0.1:8000/tests/"

    payload = {
        'ids' : ["doc-3"],
        'data' : ["세 번째 문서 내용입니다."],
        'embeddings' : [[0.4, 0.5, 0.6]],  # 임베딩 벡터
        'metadatas' : 
        [{
            "projectId": "pjt-003",
            "문서id": "302",
            "문서type": "1",
            "프로젝트명": "챗봇 고도화 PJT",
            "회의명": "회의1",
            "안건명": "안건이시렵니가"
        },]
    }
    
    async with httpx.AsyncClient() as client:
        response = await client.post(django_url, json=payload)
        if response.status_code==200:
            data=response.json()
            return {"message": "Django 데이터 가져오기 성공", "data": data}
        else:
            return {"message": "Django 데이터 가져오기 실패", "status": response.status_code}
    return result