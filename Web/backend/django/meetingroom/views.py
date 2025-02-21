from django.shortcuts import render, get_object_or_404
from django.contrib.auth import get_user_model
from django.utils.dateparse import parse_datetime

from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .models import Meeting, Agenda, MeetingParticipation, Mom, SummaryMom
from .serializers import MeetingReadSerializer, MeetingBookSerializer,MomSerializer,MeetingSerilizer,SummaryMomSerializer

from projects.models import Project, Document
from projects.serializers import ProjectSerializer, ProjectParticipationSerializer
from accounts.models import Notification
import json, httpx
from django.db.models import Q
from asgiref.sync import sync_to_async
from rest_framework.request import Request
from django.http import JsonResponse

from meetingroom.tasks import process_meeting_update
import os
import logging

from dotenv import load_dotenv
load_dotenv()
# Create your views here.
logger = logging.getLogger(__name__)

FASTAPI_URL = os.getenv('FASTAPI_BASE_URL')  # ✅ http:// 추가 (FastAPI 서버 주소)

def check_room_availability(room_id, starttime, endtime, exclude_meeting_id=None):
    """
    회의실의 특정 시간대에 다른 회의가 예약되어 있는지 확인하는 함수.
    exclude_meeting: 현재 회의를 제외할 때 사용.
    """

    # 특정 회의실(room_id)과 시간대(starttime, endtime) 비교
    conflicting_meetings = Meeting.objects.filter(
        room=room_id,
        starttime__lt=endtime,  # 예약 시작 시간이 endtime 이전
        endtime__gt=starttime,   # 예약 종료 시간이 starttime 이후
    ).exclude(id=exclude_meeting_id)  # 현재 회의를 제외
    # 충돌하는 회의가 존재하면 False 반환
    if conflicting_meetings.exists():
        return False
    return True


User = get_user_model()

# Create your views here.
@api_view(['GET','POST'])
def meetingroom_list_create(request, room_id):
    """
    회의 목록 조회 및 생성 API
    - 'GET' : 특정 회의실(room_id) + 특정 기간의 회의 목록 반환
    - 'POST' : 회의 생성 및 참여자 추가
    """
    if request.method == "GET":
        # 필터링할 날짜 (startdate, enddate) 가져오기
        startdate = request.GET.get("startdate")
        enddate = request.GET.get("enddate")

        # 특정 회의실의 회의 목록 가져오기
        meetings = Meeting.objects.filter(room=room_id)

        if startdate and enddate:
            startdate = parse_datetime(startdate+ " 00:00:00")
            enddate = parse_datetime(enddate + " 23:59:59")
            meetings = meetings.filter(starttime__range=(startdate, enddate))

        # 조회된 데이터가 없을 경우 예외 처리
        if not meetings.exists():
            return Response([], status=status.HTTP_200_OK)

        serializer = MeetingReadSerializer(meetings, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    
    # 회의 생성
    elif request.method == "POST":
        # 요청 데이터 가져오기
        request_data = request.data.copy()
        # meetingday와 시간 결합하여 starttime, endtime 수정
        meetingday =request_data.get("meetingday")
        starttime = request_data.get("starttime")
        endtime = request_data.get("endtime")
        # 잘못된 데이터 처리
        if not meetingday or not starttime or not endtime:
            return Response(
                {"status": "error", "message": "meetingday, starttime, endtime 값이 필요합니다."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        request_data['starttime'] = meetingday + "T" + starttime
        request_data['endtime'] = meetingday + "T" + endtime

        # 예약 가능한 시간인지 확인
        if not check_room_availability(room_id, request_data['starttime'], request_data['endtime']):
            return Response(
                {"status": "error", "message": "이 시간대에는 이미 회의가 예약되어 있습니다."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        
        # serializer에 수정된 데이터 전달
        serializer = MeetingBookSerializer(data=request_data)

        if serializer.is_valid():
            booker=request.user
            project_name = request_data.get("project_name")
            # 프로젝트 조회 (공백 제거 및 예외 처리)
            try:
                project =  get_object_or_404(Project, name=project_name)  
            except Project.DoesNotExist:
                return Response(
                    {"status": "error"},
                    status=status.HTTP_404_NOT_FOUND,
                )
            # 회의 객체 생성
            meeting = serializer.save(
                room=room_id, 
                booker=booker, 
                project=project
                )


            meeting_participants = request_data.get("participants", [])

            # participants가 문자열이면 JSON 변환
            if isinstance(meeting_participants, str):
                try:
                    meeting_participants = json.loads(meeting_participants)
                except json.JSONDecodeError:
                    return Response(
                        {"status": "error", "message": "Invalid meeting_participants format"},
                        status=status.HTTP_400_BAD_REQUEST,
                    )

            for participant in meeting_participants:
                user_id = participant.get("id")
                authority = participant.get("authority", 1) 

                user= get_object_or_404(User, id=user_id)
                
                MeetingParticipation.objects.create(
                    meeting=meeting,
                    participant=user,
                    authority=authority
                )
                # 알림 생성
                # 회의 예약 메시지 생성
                message = f"새로운 회의가 예약되었습니다. 회의실: {meeting.room}번 회의실, 회의 제목: {meeting.title}, 회의 시간: {meeting.starttime.strftime('%Y-%m-%d %H:%M')} ~ {meeting.endtime.strftime('%H:%M')}"
                Notification.objects.create(user=user, message=message)

            # agenda 처리
            agenda_items = request_data.get("agenda_items", [])

            if isinstance(agenda_items, str):
                try:
                    agenda_items = json.loads(agenda_items)
                except json.JSONDecodeError:
                    return Response(
                        {"status": "error", "message": "Invalid agenda format"},
                        status=status.HTTP_400_BAD_REQUEST,
                    )
            
            order = 1
            for agenda_item in agenda_items:
                title = agenda_item.get("title")
                if not title:
                    continue
                Agenda.objects.create(
                    meeting=meeting,
                    title=title,
                    order=order
                )
                order += 1

            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(
            {"status": "error", "message": serializer.errors},
            status=status.HTTP_400_BAD_REQUEST,
        )
    

@api_view(['GET'])
def project_detail(request, project_name):
    """
    특정 회의실(room_id)와 프로젝트(project_id)의 상세 정보를 조회하는 API
    """
    # 요청한 프로젝트를 조회
    project = get_object_or_404(Project, name=project_name)

    if request.method == 'GET':  # 상세 보기 요청
        participants = project.participants.all()
        serializer = ProjectParticipationSerializer(participants, many=True)
        return Response({"project_participation":serializer.data}, status=status.HTTP_200_OK)
    



@api_view(['GET','PATCH','DELETE'])
def meeting_detail(request, meeting_id):
    meeting = get_object_or_404(Meeting, id=meeting_id)
    if request.method == "GET":
        serializer = MeetingBookSerializer(meeting)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    
    user = request.user
    participation = MeetingParticipation.objects.filter(meeting=meeting, participant=user).first()

    if participation and participation.authority == 0:  # '0'은 마스터 권한을 의미

        if request.method == "PATCH":
            request_data = request.data.copy()
            meetingday = request_data.get("meetingday")
            starttime = request_data.get("starttime")
            endtime = request_data.get("endtime")

            if meetingday and starttime and endtime:
                request_data['starttime'] = meetingday + "T" + starttime
                request_data['endtime'] = meetingday + "T" + endtime
                # 예약 가능한 시간인지 확인, 현재 회의는 제외하고 확인
                # 예약 가능한 시간인지 확인
                if not check_room_availability(meeting.room, request_data['starttime'], request_data['endtime'], meeting_id):
                    return Response(
                        {"status": "error", "message": "이 시간대에는 이미 회의가 예약되어 있습니다."},
                        status=status.HTTP_400_BAD_REQUEST,
                    )

            # ✅ 기존 참석자 목록 조회
            current_participants = {participant.participant.id: participant for participant in MeetingParticipation.objects.filter(meeting=meeting)}

            # ✅ 요청 데이터에 참석자 정보가 없으면 기존 참석자 유지
            meeting_participants = request_data.get("participants")
            if meeting_participants is None:
                meeting_participants = [{"id": user_id, "authority": participant.authority} for user_id, participant in current_participants.items()]
            elif isinstance(meeting_participants, str):
                try:
                    meeting_participants = json.loads(meeting_participants)
                except json.JSONDecodeError:
                    return Response(
                        {"status": "error", "message": "Invalid meeting_participants format"},
                        status=status.HTTP_400_BAD_REQUEST,
                    )

            # ✅ 기존 안건 목록 조회
            existing_agenda_items = {agenda.order: agenda for agenda in Agenda.objects.filter(meeting=meeting)}

            # ✅ 요청 데이터에 안건 정보가 없으면 기존 안건 유지
            agenda_items = request_data.get("agenda_items")
            if agenda_items is None:
                agenda_items = [{"order": order, "title": agenda.title} for order, agenda in existing_agenda_items.items()]
            elif isinstance(agenda_items, str):
                try:
                    agenda_items = json.loads(agenda_items)
                except json.JSONDecodeError:
                    return Response(
                        {"status": "error", "message": "Invalid agenda format"},
                        status=status.HTTP_400_BAD_REQUEST,
                    )

            # ✅ 모든 데이터 검증 후 MeetingBook 업데이트
            serializer = MeetingBookSerializer(meeting, data=request_data, partial=True)
            if serializer.is_valid():
                updated_meeting = serializer.save()


                # ✅ 기존 참석자와 새로운 참석자 비교 및 업데이트
                for participant in meeting_participants:
                    user_id = participant.get("id")
                    authority = participant.get("authority", 1)

                    user = get_object_or_404(get_user_model(), id=user_id)

                    if user_id not in current_participants:
                        # 새로운 참석자 추가
                        MeetingParticipation.objects.create(meeting=meeting, participant=user, authority=authority)
                    elif current_participants[user_id].authority != authority:
                        # 권한 변경
                        current_participants[user_id].authority = authority
                        current_participants[user_id].save()
                        
                # ✅ 기존 참석자 목록에서 삭제된 참석자 제거
                for user_id, participant in current_participants.items():
                    if user_id not in [p.get("id") for p in meeting_participants]:
                        participant.delete()

                # ✅ 기존 안건과 새로운 안건 비교 및 업데이트
                for agenda_item in agenda_items:
                    order = agenda_item.get("order")
                    title = agenda_item.get("title")
                    if not title:
                        return Response(
                            {"status": "error", "message": "Agenda title is required"},
                            status=status.HTTP_400_BAD_REQUEST,
                        )

                    if order in existing_agenda_items:
                        existing_agenda_items[order].title = title
                        existing_agenda_items[order].save()
                    else:
                        Agenda.objects.create(meeting=meeting, title=title, order=order)

                # ✅ 기존 안건 목록에서 삭제된 안건 제거
                for order, agenda in existing_agenda_items.items():
                    if order not in [a.get("order") for a in agenda_items]:
                        agenda.delete()


                message = f"회의 정보가 변경되었습니다. 회의 제목: {updated_meeting.title}, 새로운 회의 시간: {updated_meeting.starttime.strftime('%Y-%m-%d %H:%M')} ~ {updated_meeting.endtime.strftime('%H:%M')}"
                for participant in MeetingParticipation.objects.filter(meeting=updated_meeting):
                    Notification.objects.create(user=participant.participant, message=message)


                return Response(
                    {"status": "success", "message": "회의 정보가 성공적으로 수정되었습니다."},
                    status=status.HTTP_200_OK
                )
            else:
                return Response(
                    {"status": "error", "message": serializer.errors},
                    status=status.HTTP_400_BAD_REQUEST
                )

            
        elif request.method == "DELETE":
            # 마스터 권한이 있다면 회의 삭제
            meeting.delete()
            return Response(
                {"status": "success", "message": "성공적으로 회의가 취소되었습니다."},
                status=status.HTTP_204_NO_CONTENT
            )
    else:
        # 참여 정보가 없거나, 권한이 없는 경우
        if participation is None:
            return Response(
                {"status": "error", "message": "참여 정보가 없습니다."},
                status=status.HTTP_404_NOT_FOUND
            )
        else:
            return Response(
                {"status": "error", "message": "삭제 권한이 없습니다.",},
                status=status.HTTP_403_FORBIDDEN
            )
    
@api_view(['GET'])
def mymeeting(request):
    if request.method == "GET":
        startdate = request.GET.get("startdate")
        enddate = request.GET.get("enddate")

        user = request.user
        mymeetings = user.meeting_participations.all()

        # 조회된 데이터가 없을 경우 예외 처리
        if not mymeetings.exists():
            return Response([], status=status.HTTP_200_OK)
        
        # Meeting 객체를 필터링하기 위해 QuerySet으로 유지
        meetings = Meeting.objects.filter(id__in=[m.meeting.id for m in mymeetings])

        if startdate and enddate:
            startdate = parse_datetime(startdate+ " 00:00:00")
            enddate = parse_datetime(enddate + " 23:59:59")
            meetings = meetings.filter(starttime__range=(startdate, enddate))


        # mymeetings에서 'meeting'만 추출하여 직렬화
        serializer = MeetingReadSerializer(meetings, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)



@api_view(['GET'])
def get_moms_by_project(request, project_id):
    """
    특정 프로젝트의 원본 회의록 조회
    """
    # 프로젝트 조회
    project = get_object_or_404(Project, id=project_id)

    # 프로젝트에 속한 회의 조회
    ## 조회한 project 객체에서 'id' 필드값만 가져옴.
    ## flat=True : list형태로 반환 (안쓰면 튜플형태)
    meeting_ids = Meeting.objects.filter(project=project).values_list('id', flat=True)
    # meeting ids에 속한 moms들 한 번에 가져옴
    moms = Mom.objects.filter(meeting_id__in=meeting_ids)
    
    serializer = MomSerializer(moms, many=True)
    return Response(serializer.data, status = status.HTTP_200_OK)

@api_view(['GET','PATCH'])
def get_or_update_moms_by_meeting(request, meeting_id):
    """
    특정 회의의 원본 회의록 조회
    "GET" : 특정 회의에 속한 모든 회의록 조회
    "PATCH" : 
        1. 전달받은 데이터로 각 Mom의 agenda_result 업데이트 (bulk_update 사용)
        2. meeting_id에 속한 모든 Mom의 completed 필드를 True로 변경
        3. 해당 meeting의 모든 Mom 데이터를 FastAPI에 전송하여 요약 요청  
        4. FastAPI 응답에 따라 SummaryMom 모델에 요약 결과를 저장
    """
    moms = Mom.objects.filter(meeting_id=meeting_id)
    if not moms:
        return Response([],status = status.HTTP_200_OK)
    
    # # GET 요청 처리 (조회)
    if request.method =="GET":
        serializer = MomSerializer(moms, many=True)
        return Response(serializer.data, status = 200)
        
    # # PATCH 요청 처리 (수정)
    elif request.method == "PATCH":
        update_data = request.data.get("moms", [])

        task = process_meeting_update.delay(meeting_id, update_data)
        print(update_data)
        return Response({
            "message": "업데이트 작업이 백그라운드에서 처리되고 있습니다.",
            # "task_id": task.id
        }, status=status.HTTP_202_ACCEPTED)
    
@api_view(['GET'])
def get_projects_by_meeting(request, project_id):
    try :
        meetings = Meeting.objects.filter(project_id=project_id)
        serializer = MeetingSerilizer(meetings, many=True)
        return Response(serializer.data, status=200)
    except Exception as e:
        return Response({'error': str(e)}, status=400)
    
@api_view(['GET'])
def get_summarymom_by_meeting(request, meeting_id):
    if request.method == "GET":

        summary_moms = SummaryMom.objects.filter(mom__meeting_id=meeting_id)
    
        if not summary_moms:
            return Response([],status = status.HTTP_200_OK)

        serializer = SummaryMomSerializer(summary_moms, many=True)
        return Response(serializer.data, status = 200)