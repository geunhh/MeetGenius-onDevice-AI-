# myapp/tasks.py
from celery import shared_task
import requests
from django.conf import settings
from .models import Mom, SummaryMom, Document

import os
import logging

from dotenv import load_dotenv
load_dotenv()
# Create your views here.
logger = logging.getLogger(__name__)

FASTAPI_URL = os.getenv('FASTAPI_BASE_URL')  # ✅ http:// 추가 (FastAPI 서버 주소)

@shared_task(bind=True, max_retries=1) # 최초 한 번만 보내기. retry : X
def process_meeting_update(self, meeting_id, update_data):
    """
    전달받은 update_data를 사용하여 특정 meeting_id의 Mom들을 업데이트하고,
    FastAPI에 요약 요청을 보내며, 그 결과를 SummaryMom에 저장하는 작업입니다.
    """
    try:
        updated_moms = []

        # 1. 전달받은 update_data로 각 Mom의 agenda_result 업데이트 (bulk_update 사용)
        moms_data = update_data
        # logger.info(f"{moms_data} celery로 들어왔습니니다.")

        logger.info(update_data)
        moms_ids = [int(mom["id"]) for mom in moms_data]
        logger.info(moms_ids)

        moms_dict = {
            mom.id : mom
            for mom in Mom.objects.filter(id__in=moms_ids)
        }
        logger.info(moms_dict)

        # Mom 업데이트
        for mom_data in moms_data:
            mom_id = int(mom_data["id"])
            agenda_result = mom_data["agenda_result"]
        
            if mom_id in moms_dict:
                mom = moms_dict[mom_id]
                mom.agenda_result = agenda_result
                updated_moms.append(mom)

        if updated_moms:
            Mom.objects.bulk_update(updated_moms, ['agenda_result'])
            logger.info(f"{len(updated_moms)}개의 Mom이 업데이트되었습니다.")
        else:
            logger.warning("업데이트할 Mom 객체를 찾을 수 없습니다.")
        
        # complete 처리까지.. 일단 주석
        Mom.objects.filter(id__in=moms_ids).update(completed=True)

        # FastAPI에 보낼 payload
        all_moms = list(Mom.objects.filter(id__in=moms_ids).select_related('agenda','meeting__project'))
        project_id_value = all_moms[0].meeting.project.id
        payload = {
            "project_id":project_id_value,
            "agendas":[
                {"id":mom.agenda.id,
                 "title":mom.agenda.title,
                 "content":mom.agenda_result,
                "document_id":mom.document.id,
                 } for mom in all_moms
            ]
        }
        logger.info(payload)
        
        # # 4. FastAPI 호출 (동기 방식)
        url = f"{FASTAPI_URL}/api/v1/meetings/{meeting_id}/summary/"
        response = requests.post(url, json=payload, timeout=500)
        if response.status_code != 200:
            raise Exception("FastAPI 요청 처리 중 오류 발생")
        fast_api_response = response.json()


        # Fastapi 응답 기반 SummaryMom 저장
        summaries = fast_api_response.get("summary")
        meeting_id = fast_api_response.get("meeting_id")

        if not summaries:
            logger.warning("FastAPI 응답에 summaries 데이터가 없습니다.")
            return f"FastAPI 응답에 summaries가 없음"
        
        # agenda_titles = [summary["agenda_title"] for summary in summaries]
        agenda_ids = [summary["id"] for summary in summaries]
        logging.info(f"agenda ids: {agenda_ids}")

        mom_dict = {
            mom.agenda.id : mom
            for mom in Mom.objects.filter(meeting_id=meeting_id,
                                          agenda__id__in=agenda_ids)                                         
        }

        logger.info(mom_dict)

        # summaryMom 생성
        for summary in summaries:
            # agenda_title = summary["agenda_title"]
            agenda_id = summary['id']
            agenda_summary = summary["summary"]
            logger.info(agenda_id)

            if agenda_id in mom_dict:
                logger.info("%s, %s", agenda_id, mom_dict) # 로그
                mom = mom_dict[agenda_id]
                logger.info("Selected Mom: %s", mom)

                document = Document.objects.create(
                    type = 1,
                    embedding=True, # 요약을 하고 받으니까 embedding 거기서 하겠지.
                    project = getattr(mom.meeting, "project",None),
                    department = getattr(mom.meeting.project, "department", None)
                )
                # 중복저장 방지를 위해 
                SummaryMom.objects.update_or_create(
                    mom=mom,
                    defaults= {
                        "summary_result" : agenda_summary,
                        "completed" : True, # 수정 여부
                        "document" : document
                    }
                )
        return f'{len(summaries)}개 요약 저장 완료'
    except Exception as e:
        logger.error(f"오류 발생: {e}")
        self.retry(exc=e, countdown=30)