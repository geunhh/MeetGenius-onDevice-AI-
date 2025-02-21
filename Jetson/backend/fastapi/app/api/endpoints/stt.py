from fastapi import APIRouter, BackgroundTasks
import httpx # FastAPI에서 http 요청 처리 
import asyncio # 테스트용.

router = APIRouter(
    prefix="/api/stt",
)

# 장고 url 
django_url = "http://127.0.0.1:8000/tests/stt/" # Django 엔드포인트

# STT 실행 상태 확인인
is_listening = False

# Django 서버로 데이터 전송 함수 (비동기 HTTPX 요청)
async def send_data_to_django(data):
    # httpx.AsyncClient : httpx 비동기 버전..
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(django_url, json={"content":data})
            print(f'sent data:{data}')
        except Exception as e:
            print(f'error sending data : {e}')


# 음성 인식 & Django로 전송하는 함수 ( 백그라운드 실행 )
async def listen_and_recognize():
    global is_listening

    # mic 선언

    while is_listening:
        '''
            mic 읽고, STT 진행 프로세스
        '''
        
        text = '안녕하시렵니까. 기록중이렵니까'
        # STT 완료된 데이터 Django로 전송
        await send_data_to_django(text)
        await asyncio.sleep(0) # CPU 과하게 점유 방지.


# STT 시작 엔드포인트
@router.get("/start/")
async def start_voice_dectection(background_tasks: BackgroundTasks):
    """
        STT 시작.
    """
    global is_listening 
    if is_listening:    # 이미 STT가 진행중이라면면
        return {"message": "STT is already running"}
    
    is_listening = True
    background_tasks.add_task(listen_and_recognize) # STT 백그라운드 실행
    return {"message":"STT started"}

# STT 종료 엔드포인트
@router.get("/stop/")
async def stop_voice_detection():
    global is_listening
    is_listening = False
    return {"message": "STT stopped"}



'''
    테스트 코드입니다.
'''
# 📝 Django 서버로 데이터 전송 테스트
# @router.post("/send_data/")
# async def send_stt():
#     test_data = [
#         "하이하이",
#         "안녕안녕",
#         "나는 근휘",
#         "Today's meeting will focus on the quarterly sales report.",
#         "We need to discuss the progress of the new marketing campaign.",
#     ]
    
#     for data in test_data:
#         await send_data_to_django(data)
#         await asyncio.sleep(2)
    
#     return {"message": "STT data sent to Django"}