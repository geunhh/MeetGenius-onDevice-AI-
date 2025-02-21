# myapp/tasks.py
from celery import shared_task
import requests
from django.conf import settings
from .models import Report, Document, Project
from meetingroom.models import Mom
import os
import logging

from dotenv import load_dotenv
load_dotenv()
# Create your views here.
logger = logging.getLogger(__name__)

FASTAPI_URL = os.getenv('FASTAPI_BASE_URL')  # ✅ http:// 추가 (FastAPI 서버 주소)
@shared_task(bind=True, max_retries=0)
def process_upload_report(self, project_id, user_id, files_data):
    """
    files_data는 각 파일에 대한 정보를 담고 있어야 합니다.
    예시: [
        {
            "filename": "example.docx",
            "content": "파일 내용 전체..."
        },
        ...
    ]
    이 작업은 해당 파일들에 대해 Document와 Report 객체를 생성하고,
    필요하다면 FastAPI에 추가 처리를 요청합니다.
    """
    try:
        # 프로젝트 조회 (동기 코드)
        from .models import Project, Document, Report  # 지연 임포트
        project = Project.objects.select_related('department').get(id=project_id)
        department = project.department
        doc_type = 2

        created_reports = []
        embedding_data_list = []
        for file_data in files_data:
            title = file_data.get("filename")
            file_content = file_data.get("content")

            # Document 객체 생성
            document = Document.objects.create(
                type=2,
                project=project,
                department=department,
                embedding=True
            )

            # Report 객체 생성
            report = Report.objects.create(
                document=document,
                project=project,
                writer_id=user_id,  # 사용자 ID 사용 (이미 인증된 사용자의 ID)
                title=title,
                content=file_content,
            )
            
            created_reports.append({
                "report_id": report.id,
                "title": title,
            })
            meeting = project.meetings.last()

            embedding_data = {
                "document_id": document.id,
                "document_content": file_content,
                "document_metadata": {
                    "project_id": int(project.id),
                    "document_type": doc_type,
                    "meeting_id": meeting.id if meeting else -1  # Meeting이 없으면 None
                }
            }
            embedding_data_list.append(embedding_data)

        # (옵션) FastAPI에 비동기 요청 보내기 (동기 방식)
        # url = f"{FASTAPI_URL}/api/projects/{project_id}/upload_report/"
        url =  f"{FASTAPI_URL}/api/v1/projects/{project.id}/documents/"
        response = requests.post(url, json={'documents': embedding_data_list}, timeout=500)
        if response.status_code != 200:
            raise Exception("FastAPI 요청 처리 중 오류 발생")
        fastapi_response = response.json()

        # 더미 응답 사용 (필요에 따라 실제 API 호출 코드 활성화)
        fastapi_response = {"status": "ok", "message": "FastAPI 처리 완료"}

        # 작업 완료 후 결과 리턴 (필요 시 DB에 상태 저장 등)
        return {
            "message": "파일 내용 저장 완료",
            "reports": created_reports,
            "fastapi_response": fastapi_response,
        }

    except Exception as e:
        logger.error(f"오류 발생: {e}")
        self.retry(exc=e, countdown=30)
