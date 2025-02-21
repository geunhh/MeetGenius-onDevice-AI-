from fastapi import APIRouter, Request
import httpx, os, json
from dotenv import load_dotenv
from core.embedding_utils import get_embedding

router = APIRouter(
    prefix="/api/embedding",
)


@router.get("/")
async def generate_embedding(text: str):
    return {"message": "Embedding hihi"}

@router.post("/process_reports/")
async def process_reports(request:Request):
    """
    Django 에서 여러 개의 보고서 데이터를 받아 처리 (유효성 검사 없음)
    
    테스트..
    """
    try:
        data = await request.json()  # JSON 데이터 직접 읽기
        print(f'데이터는!!? : {data}')
        print(json.dumps(data, indent=4, ensure_ascii=False))  # JSON 보기 좋게 출력

        reports = data.get("reports", [])  # 리스트 형태의 데이터 추출
        for report in reports:
            print(f"📄 보고서 처리: {report.get('project_name')} - {report.get('report_title')}")


        return {
            "status": "success",
            "message": f"{len(reports)}개의 보고서 처리 완료"
        }
    except Exception as e:
        return {"error": f"보고서 처리 중 오류 발생: {str(e)}"}