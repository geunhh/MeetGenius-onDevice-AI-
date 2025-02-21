from django.shortcuts import render
from django.http import JsonResponse, StreamingHttpResponse
import asyncio, json, httpx
from rest_framework.decorators import api_view, permission_classes
from django.views.decorators.csrf import csrf_exempt
from django.views import View
import redis.asyncio as redis # 비동기로 동작하려면 redis.asyncio 활용.
from projects.models import Project, ProjectParticipation, Document, Report
from meetingroom.models import Meeting, Agenda, Mom,SummaryMom
from django.shortcuts import get_object_or_404,get_list_or_404
from rest_framework.permissions import IsAuthenticated
from asgiref.sync import sync_to_async  # Django ORM을 async에서 실행할 수 있도록 변환
import os
import logging

from dotenv import load_dotenv
load_dotenv()
# Create your views here.
logger = logging.getLogger(__name__)

FASTAPI_BASE_URL = os.getenv('FASTAPI_BASE_URL')  # ✅ http:// 추가 (FastAPI 서버 주소)


# redis 클라이언트 전역 선언. 
redis_client = redis.from_url(os.getenv('REDIS_BASE_URL'),decode_responses=True)


# REDIS KEY 모음
MEETING_CHANNEL = "meeting:pubsub"          # 회의 채널
CUR_MEETING = "meeting:meeting_id"          # 현재 미팅 id
CUR_PROJECT = "meeting:project_id"      # 현재 회의가 속한 프로젝트 ID
AGENDA_LIST = "meeting:agenda_list"         # 혀재 회의 안건 목록 (JSON LIST)
CUR_AGENDA = "meeting:cur_agenda"           # 현재 진행 중인 안건 "D
STT_LIST_KEY = "meeting:stt:stream"         # 현재 안건의 STT 데이터 (LIST)
RAG_LIST_KEY = "meeting:rag"                # Rag LIST 키
IS_READY_MEETING = "meeting:state"          # 현재 회의 준비상태
IS_RUNNING_STT = "meeting:stt_running"      # stt 동작상태태
''' 
waiting : 기본
waiting_for_ready : 준비하기 버튼 클릭
waiting_for_start : 시작하기 버튼 활성화
meeting_in_progress : 회의중
meeting_finished : 회의 끝.
'''
MEETING_HISTORY = "meeting:meeting_history" # 회의 기록
'''
[
    '첫 회의록의 내용입니다.', '둘째 회의록의 내용입니다.', '셋째 회의록의 내용입니다.'
]
'''
MEETING_RECORD = "meeting:agenda_record"    # 안건별 회의록

# 
async def get_redis():
    redis_client = redis.from_url(os.getenv('REDIS_BASE_URL'),decode_responses=True)
    return redis_client

# 🎤 FastAPI → Django로 데이터 수신 & Redis에 `PUBLISH`
@csrf_exempt # IOT는 csrf 인증이 필요 없다고 생각.
async def receive_data(request):
    """
    FastAPI에서 전송한 STT 데이터를 받아 Redis Pub/Sub을 통해 SSE로 전파
    """
    if request.method == "POST":
        try:
            redis_client = await get_redis()

            data = json.loads(request.body)  # FastAPI에서 받은 데이터 읽기
            print(data)
            data_type = data.get('type')        # 데이터 유형 (plain, query, rag)
            message = data.get('message','')
            docs = data.get('docs',None)

            print(f"📡 FastAPI에서 받은 데이터: {data_type} - {message}")

            # Redis 연결마다 요청 유지
            async with redis_client:
                # STT 데이터 처리
                if data_type == 'plain':
                    await redis_client.rpush(STT_LIST_KEY,message)
                    await redis_client.publish(MEETING_CHANNEL, json.dumps({
                        "type": "plain",
                        "message": message
                    }))
                    print("✅ STT 데이터 저장 및 전송 완료")

                # 쿼리 데이터 전송 (알람)
                elif data_type == 'query':
                    await redis_client.publish(MEETING_CHANNEL, json.dumps({
                        "type": "query",
                        "message": message
                    }))
                    print(message)
                    print('쿼리 알람 전송완료료')

                # Rag 데이터 저장 및 전송
                elif data_type == 'rag':
                    if not docs:
                        print('docs not exist')
                        
                    
                    print(data)
                    # FastAPI 답변 처리
                    await handle_fastapi_response(data)

                    return JsonResponse({
                            'status': 'success',
                            'message': 'Meeting started',
                            # 'fastapi_response': fastapi_response,
                        })
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)

    return JsonResponse({"success": "good request"}, status=200)

# 🔥 클라이언트(React)에서 실시간 STT 데이터를 받는 SSE 엔드포인트 (Redis `SUBSCRIBE`)
class SSEStreamView(View):
    """
    클라이언트가 Redis의 STT 데이터를 실시간으로 받을 수 있도록 SSE 스트리밍
    """
    async def stream(self):
        """
        Redis Pub/Sub을 구독하고, 새로운 메시지를 클라이언트에 전송
        """
        redis_client = await get_redis()
        # Redis Pub/Sub 구독독
        pubsub = redis_client.pubsub()
        await pubsub.subscribe(MEETING_CHANNEL) # 특정 채널MEETING_CHANNEL 구독
        
        # 기존 메시지 가져오기
        meeting_state = await redis_client.get(IS_READY_MEETING)            # 현재 회의 상태 (waiting, inprogress.... finish)
        cur_agenda = await redis_client.get(CUR_AGENDA)                     # 현재 안건 번호(order)
        agenda_list_json = await redis_client.get(AGENDA_LIST)              # 안건 리스트
        rag_list_json = await redis_client.lrange(RAG_LIST_KEY, 0, -1)      # RAG LIST
        stt_list_json = await redis_client.lrange(STT_LIST_KEY, 0, -1)      # STT LIST (현재 안건만 나옴)
        meeting_history = await redis_client.lrange(MEETING_HISTORY,0,-1)   # 회의록 기록 (이전 안건들 회의록 저장)


        init_data = {
            "cur_agenda": cur_agenda,
            "meeting_state" : meeting_state,
            "agenda_list": json.loads(agenda_list_json) if agenda_list_json else [],
            "rag_list": rag_list_json,
            "stt_list": stt_list_json,
            "meeting_history_list" : meeting_history,
        }
        yield f'data: {json.dumps(init_data)}\n\n'
        
        # 실시간 데이터 수신
        async for message in pubsub.listen():
            if message["type"] == "message":
                yield f"data: {message['data']}\n\n"

    async def get(self, request):
        """
        SSE 연결 처리 (기존 메시지 + 실시간 스트리밍)
        """
        response = StreamingHttpResponse(self.stream(), content_type="text/event-stream")
        response["Cache-Control"] = "no-cache"
        response["X-Accel-Buffering"] = "no"  # Nginx 환경에서 SSE 버퍼링 방지
        return response

# 현재 접속자 수
async def broadcast_client_count():
    """
    현재 접속 중인 클라이언트 수를 정확히 Redis Pub/Sub으로 전파
    """
    # 현재 `client_count_channel` 채널의 구독자 수 확인
    subscriber_counts = await redis_client.pubsub_numsub("client_count_channel")
    count = subscriber_counts.get("client_count_channel", 0)  # 해당 채널의 구독자 수 가져오기

    message = f"현재 접속 중: {count}명"
    print(message)
    await redis_client.publish("client_count_channel", message)


# 렌더링 테스트
def test_page(request):
    return render(request, "test.html")




# 스케쥴러 역할 API 테스트
async def scheduler(request,meeting_id):
    '''
    스케쥴러에 의해 특정 시간이 되면, 해당 'meeting_id' 에 따라
    Redis에 회의 정보 저장 (project_id, meeting_id, agenda_list)
    '''
    
    if request.method == 'GET':
        # Meeting 객체 가져오기
        # await redis_client.flushdb()  # 모든 키 초기화

        meeting = await sync_to_async(lambda: get_object_or_404(Meeting.objects.select_related("project"), id=meeting_id))()
        
        project_id = meeting.project.id if meeting.project else None


        # 해당 Meeting에 연결된 Agenda 목록 가져오기
        agendas = await sync_to_async(lambda: list(Agenda.objects.filter(meeting=meeting).values("id", "order", "title")))()
        # if not agendas:
        #     return JsonResponse({'status': 'error', 'message': 'No agendas found for this meeting'}, status=400)
        print(agendas,meeting,project_id,'입니다 ###')

        # Redis 초기화 
        await redis_client.flushall()

        # 회의정보 Redis에 저장
        await redis_client.set("meeting:state", "waiting")  # 기본 상태: 회의 준비 전전
        await redis_client.set("meeting:project_id", str(project_id))   # 프로젝트 ID 저장
        await redis_client.set("meeting:meeting_id", str(meeting.id))   # meeting ID 저장
        await redis_client.set("meeting:cur_agenda", "1")  # 첫 번째 안건부터 "작
        await redis_client.set("meeting:stt_running", "stop")  # STT running 상태 default stop
        print(json.dumps(list(agendas)))
        await redis_client.set("meeting:agenda_list", json.dumps(list(agendas)))  # 안건 목록 저장
        
        # 상태 변경 알림
        return JsonResponse({'status': 'success', 'message': 'Meeting scheduled and ready to start'}, status=200)

# 회의 준비 함수 (to FastAPI)
async def sent_meeting_information():
    '''
        안건 목록을 fastAPI로 쏴주는 함수.
    '''
    # Redis에서 회의 정보 가져오기
    meeting_id = await redis_client.get(CUR_MEETING)
    if not meeting_id:
        return {'error': 'No active meeting found in Redis'}
    project_id = await redis_client.get(CUR_PROJECT)
    if not project_id:
        return {'error': 'No project ID found in Redis'}
    
    agenda_list_json = await redis_client.get(AGENDA_LIST)
    if not agenda_list_json:
        return {'error': 'No agenda list found in Redis'}

    agendas = json.loads(agenda_list_json)

    # FastAPI API url 설정정
    
    url = f"{FASTAPI_BASE_URL}/api/v1/meetings/{meeting_id}/prepare/"
    payload = {
        "project_id": project_id,
        "agendas": agendas or [],
    }
    print(payload)

    try : 
        # async with httpx.AsyncClient() as client:
        async with httpx.AsyncClient(timeout=httpx.Timeout(500.0)) as client:
            response = await client.post(url=url, json=payload)
            return response.json()  # FastAPI에서 받은 응답 데이터 반환
    except Exception as e :
        return JsonResponse({'error':'unexpecteed error occured'},status=500)

@csrf_exempt
async def prepare_meeting(request):
    '''
    회의 준비 버튼
    '''
    if request.method == 'POST':
        # 현재 상태 가져오기
        current_state = await redis_client.get(IS_READY_MEETING) or 'waiting'
        print('current_state',current_state)
        
        # 이미 준비 상태라면 리턴 (로직 중복 방지)
        if current_state == 'waiting_for_ready':
            return JsonResponse({'status': 'success', 'message': 'already preparing state..'})
        
        # 새 상태 설정
        new_state = 'waiting_for_ready'
        print('new_state',new_state)

        # Redis에 새로운 상태 저장
        await redis_client.set(IS_READY_MEETING, new_state)
        tttt = await redis_client.get(IS_READY_MEETING)
        print('tttt',tttt)
        # 상태 업데이트 메시지 생성
        update_msg = json.dumps({
            "type": "meeting_state",
            "meeting_state": new_state
        })
        
        # Pub/Sub 채널에 업데이트 메시지 발행
        await redis_client.publish(MEETING_CHANNEL, update_msg)
        
        print('redis 업로드까지는 완료')  # 디버깅

        # 안건 목록 FastAPI로 전송
        fastapi_response = await sent_meeting_information()

        # FastAPI 응답 처리
        if isinstance(fastapi_response, JsonResponse):
            # JsonResponse 객체일 경우 그 내용 추출
            fastapi_response_data = json.loads(fastapi_response.content.decode('utf-8'))
        else:
            fastapi_response_data = fastapi_response  # 이미 dict 형태일 경우 그대로 사용

        # 상태 변경: 회의 시작 대기
        await redis_client.set(IS_READY_MEETING, "waiting_for_start")

        # 새로운 상태 업데이트
        new_state = 'waiting_for_start'
        update_msg = json.dumps({
            "type": "meeting_state",
            "meeting_state": new_state
        })
        
        # 상태 변경 메시지 발행
        await redis_client.publish(MEETING_CHANNEL, update_msg)

        # JsonResponse 반환
        return JsonResponse({
            'status': 'success',
            'started': new_state,
            'fastapi_response': fastapi_response_data  # FastAPI 응답 포함
        })
    else:
        return JsonResponse({'error': 'Invalid request'}, status=400)

# 현재 안건 가져오기
async def get_current_agenda():
    """
    Redis에서 현재 진행 중인 안건('cur_agenda') 가져오기
    """
    cur_agenda = await redis_client.get("meeting:cur_agenda")
    agenda_list_json = await redis_client.get("meeting:agenda_list")
    print(cur_agenda)
    print(agenda_list_json)
    # 안건 데이터가 없으면 None 반환
    if not cur_agenda or not agenda_list_json:
        return None
    
    # agenda_list -> JSON
    agenda_list = json.loads(agenda_list_json)
    print('agenda_list###',agenda_list)
    

    # 현재 진행 중인 안건 찾기
    for agenda in agenda_list:
        print(agenda)
        print('##')
        if str(agenda["order"]) == str(cur_agenda):
            return {
                "agenda_id": agenda["id"],
                "agenda_title": agenda["title"]
            }
    print('네??? 에러요?')
        
    ''' 
        저장된 안건이 하나도 없는 경우
    '''
    # 현재 미팅 정보 가져옴
    cur_meeting = int(await redis_client.get('meeting:meeting_id'))
    meeting = await sync_to_async(Meeting.objects.get)(id = cur_meeting)

    # 안건 정보 DB에에 등록
    agenda = await sync_to_async(Agenda.objects.create)(
        meeting=meeting, 
        order=1, 
        title="No Agenda Title")

    # Redis에도 마찬가지로 추가
    await redis_client.set("meeting:agenda_list", json.dumps([{'id': agenda.id, 'order': 1, 'title': agenda.title}]))
    
    # Publish
    update_msg = json.dumps({
        "type":"agenda_add",
        "agendas": agenda_list,
        "cur_agenda":agenda.id
    })
    print('### udpate_msg : ',update_msg)
    await redis_client.publish(MEETING_CHANNEL,update_msg)

    return {
        "agenda_id": agenda.id,
        "agenda_title": agenda.title
    }  # 현재 진행 중인 안건을 찾지 못한 경우

async def fetch_and_store_documents(document_ids, fastapi_response, redis_client, message):
    """
    FastAPI에서 받은 문서 ID 리스트를 기반으로 DB에서 문서 조회 후 Redis 저장 및 Pub/Sub
    """
    print('이제 fetch_and_store_doc 넘어왔다')
    if not document_ids:
        print("No document")
        return # 문서 ID가 없으면 함수 종료

    # Redis에서 프로젝트 ID 조회
    project_id = await redis_client.get("meeting:project_id")
    if not project_id:
        print('ERROR : no prj id')
        return # 프로젝트 ID가 없으면 함수 종료

    print(f"📌 Fetching documents for project_id: {project_id}, doc_ids: {document_ids}")

    try:
        # Django ORM을 비동기 실행하여 문서 조회
        # documents = await sync_to_async(
        #     lambda: list(Report.objects.filter(document_id__in=document_ids, project_id=project_id
        #                 ).values("id", "title", "content")))()
        

        # Report 모델에서 문서 조회
        reports = await sync_to_async(lambda: list(
            Report.objects.filter(document_id__in=document_ids, project_id=project_id)
            .select_related('document')
            .values("id", "title", "content")
        ))()
        # Mom 모델에서 문서조회회
        moms = await sync_to_async(lambda: list(
            Mom.objects.filter(document_id__in=document_ids, document__project_id=project_id)
            .select_related('document')
            .values("id", "agenda_result")
        ))()
        
        documents = []

        # 출처 구분분
        for report in reports:
            report["source"] = "report"
            documents.append(report)

        # front가 report 기준으로 코드가 작성됨 => 맞춤
        for mom in moms:
            mom_docuent = {
                "id" : mom["id"],
                "title": f"{mom['id']}번째 회의록",
                "content": mom["agenda_result"],
                "source":"mom"
            }
            documents.append(mom_docuent)

        print(documents)

        if not documents:
            print('No document IDs in priveded')
            return # DB에 문서가 없으면 함수 종료
        
        for doc in documents:
            doc_json = json.dumps(doc)
            await redis_client.lrem(RAG_LIST_KEY,0,doc_json) # doc문서 중복방지
            await redis_client.rpush(RAG_LIST_KEY, doc_json)

        message = fastapi_response.get('message')
        # PUBSUB - publish
        update_msg = json.dumps({
            "type": "agenda_docs_update",
            "message" : message,
            "documents": documents
        })

        await redis_client.publish(MEETING_CHANNEL, update_msg)
        print('문서 전달 완료 ###')
    except Exception as e:
        print(f"ERROR: Failed to fetch and store documents - {e}")


# 회의시작/다음 안건 response 처리
async def handle_fastapi_response(fastapi_response):
    """
    FastAPI에서 받은 응답 처리
    1. STT 실행 여부(stt_running) → Redis 업데이트 & Pub/Sub
    2. 안건 관련 문서(agenda_docs) → DB에서 가져와 Redis RAG 저장 & Pub/Sub
    """
    # 1. STT 실행 여부 업데이트
    stt_running = fastapi_response.get("stt_running")
    # Redis에 등록된 현재 상태와 다르면 업데이트
    cur_state = await redis_client.get('stt_running')
    message = await redis_client.get('message')

    if cur_state != stt_running:
        await redis_client.set("meeting:stt_running", str(stt_running))

    # Pub/Sub으로 클라이언트에게 상태 변경 알림
    update_msg = json.dumps({
        "type": "stt_status",
        "stt_running": stt_running
    })
    print(update_msg,'#####')
    await redis_client.publish(MEETING_CHANNEL, update_msg)
    print(f"📢 STT 상태 변경: {stt_running}")

    # 2. 문서 ID 리스트 기반 DB 조회 & Redis 저장
    document_ids = fastapi_response.get("agenda_docs", []) # 250220 확인인
    print('######### 체크 : docs_id', document_ids)
    print(fastapi_response)
    print(document_ids)
    try :
        # 문서 처리 함수 호출
        await fetch_and_store_documents(document_ids, fastapi_response, redis_client, message)  # redis_client를  넘겨주기
    except Exception as e:
        print(f"ERROR in fetching and storing documents: {e}")



# 회의 시작
@csrf_exempt
async def start_meeting(request):
    """
    Django -> FastAPI STT 시작 API 호출 및 회의 상태 변경경
    """
    if request.method == "POST":
        current_state = await redis_client.get("meeting:state")

        # 이미 회의가 진행 중인 경우 처리 (중복 요청 방지)
        # if current_state == "meeting_in_progress":
        #     return JsonResponse({"status": "error", "message": "Meeting is already in progress."})
        
        # meeting_id와 현재 진행 중인 미팅 정보 조회
        meeting_id = await redis_client.get(CUR_MEETING) # meeting id Redis 에서 조회

        # Redis에 회의 상태 업데이트 (회의 시작)
        await redis_client.set(IS_READY_MEETING, "meeting_in_progress")

        # 상태 변경을 Pub/Sub으로 전파
        update_msg = json.dumps({
            "type": "meeting_state", 
            "meeting_state": "meeting_in_progress"
        })
        await redis_client.publish(MEETING_CHANNEL, update_msg)
        # print('상태 변경 후 publish 완료')
        print('자 가보자..#########')
        current_agenda = await get_current_agenda() # 현재 안건 정보 가져오기
        print('안건정보도 가져옴',current_agenda)

        # FastAPI API 주소
        fastapi_url = f'{FASTAPI_BASE_URL}/api/v1/meetings/{meeting_id}/next-agenda/'
        payload = {
            "id": int(current_agenda["agenda_id"]),
            "title": current_agenda["agenda_title"]
        }
        print(payload)
        # return # test

        # FastAPI로 던지기
        try : 
            async with httpx.AsyncClient() as client:
                response = await client.post(fastapi_url,json=payload)
                fastapi_response = response.json()
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
        
        # fastapi_response = {
        #     "stt_running": 'run',
        #     "agenda_docs": [1,2,7]
        # } 
        # print(fastapi_response, 'fastapi_response')
        '''
        {
            stt_running: bool,
            agenda_docs: list
        } 
        FastAPI로부터 response 위와 같은 형태로 도착.
        1. stt_running 상태 바꿔서 web에 띄워줘야 함 : STT가 다시 진행됩니다..?
            - redis 상태 업데이트
            - publish
        2. agenda_docs 
            - DB에서 docs 관련 문서 찾아오기
            - redis RAG 문서에 넣어주기
            - publish
        '''
        await handle_fastapi_response(fastapi_response)

        return JsonResponse({
                'status': 'success',
                'message': 'Meeting started',
                # 'fastapi_response': fastapi_response,
            })
            
    else :
        return JsonResponse({'error': 'Invalid request method'}, status=400)


# 다음 안건
@csrf_exempt
async def next_agenda(request):
    """ 
    1. 현재 안건의 STT 데이터를 회의록으로 저장
    2. STT 데이터를 Redis에서 삭제
    3. 다음 안건으로 이동
    """
    if request.method == "POST":
        print('다음 안건으로 버튼이 클릭되었습니다.')

        # 1. 현재 진행중인 안건 가져오기
        meeting_id = await redis_client.get("meeting:meeting_id") # meeting id Redis 에서 조회
        if not meeting_id:
            return JsonResponse({"error": "No meeting_id in Redis"}, status=400)
        logger.info('###meeting id ',meeting_id)
        
        cur_agenda = await redis_client.get(CUR_AGENDA)
        print('#### cur agenda###',cur_agenda)
        if not cur_agenda:
            return JsonResponse({"error": "No current agenda in Redis"}, status=400)
        logger.info('cur_agenda',cur_agenda)

        cur_agenda = int(cur_agenda) # int 변환
        
        # 2. 현재 STT 데이터 DB에 저장 (삭제는 안 함)
        stt_messages = await redis_client.lrange(STT_LIST_KEY,0,-1)
        if not stt_messages:
            stt_messages = ['no data']
        logger.info('stt_messages',stt_messages)
        print('stt_mess',stt_messages)

        # 3. 안건 목록 조회 : 안건 길이 비교 위함.
        agenda_list_json = await redis_client.get(AGENDA_LIST)
        if not agenda_list_json:
            agenda_list_json = {}

        agenda_list = json.loads(agenda_list_json)
        print('##')
        print(cur_agenda, len(agenda_list))
        print('##')

        
        # 4. 더이상 안건이 없을 경우 -> 데이터 저장 연기 후 리턴
        if cur_agenda >= len(agenda_list):
            print("🔴 마지막 안건입니다. STT 데이터를 삭제하지 않고 유지.")
            return JsonResponse({
                "status": "end", 
                "message": "No more agendas available."
            })
        
        # 5. 다음 안건이 있으면, 현재 STT 데이터 DB에 저장.
        logger.info(stt_messages)
        if stt_messages :
            current_agenda = await get_current_agenda()
            if not current_agenda:
                return JsonResponse({"error": "No current agenda found in Redis"}, status=400)

            agenda_result = '\n'.join(stt_messages) # 취합
            print(f"STT 데이터 -> DB 저장: {agenda_result}")

            # Redis -> DB 저장
            # 관련된 meeting 객체와 안건 객체 가져오기
            try : 
                print('저장하러는 가니?')

                # selected_related로 쿼리문 한 번에 다 불러오기.
                meeting_obj = await sync_to_async(get_object_or_404)(
                    Meeting.objects.select_related("project", "project__department"), 
                    id=meeting_id
                )                
                agenda_obj = await sync_to_async(get_object_or_404)(Agenda, id=current_agenda["agenda_id"])
                
                # DB에 저장
                ## Document 객체 생성
                project_obj = meeting_obj.project
                department_obj = meeting_obj.project.department
                document_obj = await sync_to_async(Document.objects.create)(
                    type = 0, # 요약전 : 0
                    embedding = False,
                    project = project_obj,
                    department = department_obj
                )
                print(f"Document 생성 완료 (ID={document_obj.id}).")

                ## MOM 객체 생성
                new_mom = await sync_to_async(Mom.objects.create)(
                    meeting=meeting_obj,
                    document = document_obj,
                    agenda=agenda_obj,
                    agenda_result=agenda_result,
                    completed=False
                )
                print(f"Mom 레코드 생성 (ID={new_mom.id}).")

                # 현 안건의 STT 데이터를 새로운 키에 저장
                await redis_client.rpush(MEETING_HISTORY,agenda_result)
                print(f'{cur_agenda}번째 안건의 회의록이 저장되었습니다.')
                
                # Redis에서 STT 데이터만 삭제
                await redis_client.delete(STT_LIST_KEY)
                print(f'STT 데이터 삭제 완료')
            except Exception as e:
                return JsonResponse({'error': str(e)}, status=500)           

        # 다음 안건으로 이동 
        cur_agenda += 1
        await redis_client.set(CUR_AGENDA, cur_agenda)
        
        update_msg = json.dumps({
            "type": "agenda_update",
            "cur_agenda": cur_agenda
        })
        await redis_client.publish(MEETING_CHANNEL,update_msg)

        # 다음 안건 정보를 FastAPI로 전송.
        current_agenda = await get_current_agenda() # 다음 안건 정보 가져오기
        # FastAPI API 주소
        fastapi_url = f'{FASTAPI_BASE_URL}/api/v1/meetings/{meeting_id}/next-agenda/'
        payload = {
            "id": str(current_agenda["agenda_id"]),
            "title": current_agenda["agenda_title"]
        }
        print(payload)

        # FastAPI로 던지기
        try : 
            async with httpx.AsyncClient() as client:
                response = await client.post(fastapi_url,json=payload)
                fastapi_response = response.json()
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
        
        '''
        {
            stt_running: bool,
            agenda_docs: list
        } 
        FastAPI로부터 response 위와 같은 형태로 도착.
        1. stt_running 상태 바꿔서 web에 띄워줘야 함 : STT가 다시 진행됩니다..?
            - redis 상태 업데이트
            - publish
        2. agenda_docs 
            - DB에서 docs 관련 문서 찾아오기
            - redis RAG 문서에 넣어주기
            - publish
        '''
        # 임시로 FastAPI 응답 지정.
        # fastapi_response = {
        #     'stt_running': 'run',
        #     'agenda_docs': [1,2]
        # }
        # FastAPI 응답 처리 함수
        await handle_fastapi_response(fastapi_response)

        return JsonResponse({
                'status': 'success',
                'message': 'Meeting started',
                # 'fastapi_response': fastapi_response,
            })

    else :
        return JsonResponse({"error": "Invalid request method"}, status=400)

        
async def add_agenda(request):
    """
    새로운 안건을 추가하는 API
    """
    if request.method !='POST':
        return JsonResponse({"error": "Invalid request method"}, status=400)
    try:
        # 요청 데이터 받기
        data = json.loads(request.body)
        new_agenda_title = data.get('new_agenda_title')

        if not new_agenda_title:
            return JsonResponse({"error": "Agenda title is required"}, status=400)

        redis_client = await get_redis()

        # Redis에서 진행 중인 회의 ID 가져오기
        meeting_id = await redis_client.get(CUR_MEETING)
        if not meeting_id:
            return JsonResponse({"error": "No active meeting found"}, status=400)

        # 이전 회의 result 가져오기
        stt_messages = await redis_client.lrange(STT_LIST_KEY,0,-1)
        if not stt_messages:
            stt_messages = ['no data']

        # Meeting 객체 가져오기
        meeting_obj = await sync_to_async(get_object_or_404)(
                    Meeting.objects.select_related("project", "project__department"), 
                    id=meeting_id
                )     
        print(meeting_obj)
        # 새로운 안건 번호를 위한 연산.
        agenda_count = await sync_to_async(Agenda.objects.filter(meeting=meeting_obj).count)()

        agenda_result = '\n'.join(stt_messages) # 취합
        print(f"STT 데이터 -> DB 저장: {agenda_result}")
        '''
        DB 저장장
        '''
        # 새로운 안건 DB에 추가
        new_agenda_obj = await sync_to_async(Agenda.objects.create)(
            meeting = meeting_obj,
            title = new_agenda_title,
            order = agenda_count + 1
        )
        new_agenda_id = new_agenda_obj.id
        new_agenda_order = new_agenda_obj.order
        
        ## Document 객체 생성
        document_obj = await sync_to_async(Document.objects.create)(
            type = 0, # 요약전 : 0
            embedding = False,
            project = meeting_obj.project,
            department = meeting_obj.project.department
        )
        print(f"Document 생성 완료 (ID={document_obj.id}).")
        '''
        mom 객체 생성.
        '''
        new_mom = await sync_to_async(Mom.objects.create)(
            meeting=meeting_obj,
            agenda=new_agenda_obj,
            document = document_obj,
            agenda_result=agenda_result,
            completed=False
        )
        print(f"Mom 레코드 생성 (ID={new_mom.id}).")

        # history에 안건 추가하기.
        await redis_client.rpush(MEETING_HISTORY, agenda_result)

        '''
        STT 초기화
        '''


        # Redis에서 STT 데이터만 삭제
        await redis_client.delete(STT_LIST_KEY)
        print(f'STT 데이터 삭제 완료')

        # 기존 안건 목록 가져오기
        agenda_list_json = await redis_client.get(AGENDA_LIST)
        agenda_list = json.loads(agenda_list_json)if agenda_list_json else []

        # 새로운 안건 추가
        new_agenda = {
            "id": new_agenda_id,
            "order" : new_agenda_order,
            "title":new_agenda_title
        }
        agenda_list.append(new_agenda)

        # Redis 업데이트
        await redis_client.set(AGENDA_LIST, json.dumps(agenda_list))
        await redis_client.set(CUR_AGENDA, str(new_agenda_order))

        # PubSub
        update_msg = json.dumps({
            "type":"agenda_add",
            "agendas": agenda_list,
            "cur_agenda":new_agenda_order
        })
        await redis_client.publish(MEETING_CHANNEL,update_msg)

        '''
        FastAPI로 새로운 안건 전송
        '''
        fastapi_url = f'{FASTAPI_BASE_URL}/api/v1/meetings/{meeting_id}/next-agenda/'
        payload = {
            "agenda_id": new_agenda_id,
            "agenda_title": new_agenda_title
        }
        print(payload)

        # FastAPI로 던지기
        try : 
            async with httpx.AsyncClient() as client:
                response = await client.post(fastapi_url,json=payload)
                fastapi_response = response.json()
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
        
        # 임시로 FastAPI 응답 지정.
        # fastapi_response = {
        #     'stt_running': 'run',
        #     'agenda_docs': [1,2] # 임시 데이터
        # }
        # FastAPI 응답 처리 함수
        await handle_fastapi_response(fastapi_response)

        return JsonResponse({
            "status": "success",
            "message": "Agenda added successfully",
            "cur_agenda": new_agenda_id,
            "agendas": agenda_list
        })
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)



# 회의 종료
@csrf_exempt
async def stop_meeting(reqeust):
    """
    동작 순서:
      1. FastAPI의 STT 종료 API를 호출하여 STT 처리를 중지
      2. Redis에서 저장된 STT 메시지들을 조회
      3. 해당 STT 데이터를 DB에 저장
        - 구현해야함.
      4. Redis에서 STT 데이터를 삭제하여 메모리 정리
      5. 회의 상태를 "meeting_finished"로 업데이트하고, Pub/Sub으로 클라이언트에 전파
    """
    if reqeust.method !="POST":
        return JsonResponse({"error": "Invalid request method"}, status=400)
    
    try : 
        # 1 FastAPI에 STT 종료 요청 
        meeting_id = await redis_client.get(CUR_MEETING)
        if not meeting_id:
            return JsonResponse({"error": "Meeting ID not found in Redis"}, status=400)
        # 1-2. fastAPI로 api 요청. 
        async with httpx.AsyncClient() as client:
            fastapi_stop_url = f'{FASTAPI_BASE_URL}/api/v1/meetings/{meeting_id}/end/'
            response = await client.post(fastapi_stop_url)
            fastapi_stop_response = response.json()
        print(fastapi_stop_response)

        # 2. Redis에서 저장된 STT 메시지 조회
        stt_messages = await redis_client.lrange(STT_LIST_KEY,0,-1)
        print(stt_messages)
        if not stt_messages:
            print("No STT messages in Redis")
            stt_messages='No data'

        # 3. DB에 STT 데이터 저장
        print('#### 자 가보자###')
        current_agenda = await get_current_agenda() 
        print(current_agenda)
        if not current_agenda:
            return JsonResponse({"error": "No current agenda found in Redis"}, status=400)
        agenda_result = "\n".join(stt_messages)
        print(agenda_result)

        # DB에 저장.
        try : 
            meeting_obj = await sync_to_async(get_object_or_404)(
                    Meeting.objects.select_related("project", "project__department"), 
                    id=meeting_id
                )     
            print(meeting_obj)

            agenda_obj = await sync_to_async(get_object_or_404)(Agenda, id=current_agenda["agenda_id"])
            
            agenda_id = agenda_obj.id

            ## Document 객체 생성
            document_obj = await sync_to_async(Document.objects.create)(
                type = 0, # 요약전 : 0
                embedding = False,
                project = meeting_obj.project,
                department = meeting_obj.project.department
            )
            print(f"Document 생성 완료 (ID={document_obj.id}).")

            # Mom 데이터 생성
            new_mom = await sync_to_async(Mom.objects.create)(
                meeting=meeting_obj,
                document = document_obj,
                agenda=agenda_obj,
                agenda_result=agenda_result,
                completed=False
            )
            print(f"✅ 회의 종료 시 Mom 저장 완료 (ID={new_mom.id})")

        except Exception as e :
            return JsonResponse({'error': str(e)}, status=500)
        
        print('########')
        print('여기부터 회의상태 업데이트')
        print('########')

        # 4. 회의 상태 업데이트: "meeting_finished"
        update_msg = json.dumps({
            "type":"meeting_state",
            "meeting_state":"meeting_finished"
        })
        await redis_client.publish(MEETING_CHANNEL,update_msg)


        # 5. Redis에서 STT 데이터 삭제 (메모리 정리)
        await redis_client.flushdb()  # 모든 키 초기화

        return JsonResponse({"status":"STT datas are saved and deleted",
                             "messages":stt_messages}, status=200)
        
    except Exception as e:
        return JsonResponse({'error':str(e)}, status=500)
    