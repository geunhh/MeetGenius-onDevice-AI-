from django.shortcuts import render, get_object_or_404
from django.contrib.auth import get_user_model
from rest_framework.decorators import api_view, permission_classes, authentication_classes

from rest_framework.response import Response
from rest_framework import status
from .models import Project, ProjectParticipation, Report, Document
from .serializers import ProjectSerializer, ReportSerializer
from rest_framework.permissions import IsAuthenticatedOrReadOnly,AllowAny,IsAuthenticated
from asgiref.sync import sync_to_async
from docx import Document as DocxDocument  # Word 문서 읽기용
import os # 파일 확장자 처리리
import httpx
from django.views.decorators.csrf import csrf_exempt
from .tasks import process_upload_report
import logging

from dotenv import load_dotenv
load_dotenv()
# Create your views here.
logger = logging.getLogger(__name__)

FASTAPI_BASE_URL = os.getenv('FASTAPI_BASE_URL')  # ✅ http:// 추가 (FastAPI 서버 주소)

User = get_user_model()


@api_view(['GET','POST'])
@permission_classes([IsAuthenticated]) # 인증되지 않은 사용자는 접근 불가
def project_list_create(request):
    """
    프록젝트 목록 조회 및 생성 API
    - 'GET' : 전체 목록 반환
    - 'POST' : 프로젝트 생성 및 참여자 추가
    """
    if request.method == "GET":
        projects = Project.objects.all()
        serializer = ProjectSerializer(projects, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    # 프로젝트 생성 및 참여자 추가
    elif request.method == "POST":
        serializer = ProjectSerializer(data=request.data)
        if serializer.is_valid():
            creator = request.user if request.user.is_authenticated else None # 로그인 구현되면 수정하기.
            department_id = request.data.get("department")
            project = serializer.save(creator = creator,
                                      department_id = department_id
                                      ) # 현재 로그인한 유저가 생성자로 저장
            
            participants = request.data.get("participants", [])
            for participant in participants:
                user_id = participant.get("id")
                authority = participant.get("authority", 1) 

                user= get_object_or_404(User, id=user_id)

                ProjectParticipation.objects.create(
                    project=project, participant = user, authority = authority
                )
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        return Response(
            {"status": "error", "message": serializer.errors},
            status=status.HTTP_400_BAD_REQUEST,
        )
    

@api_view(['GET','PATCH','DELETE'])
@permission_classes([IsAuthenticated]) # 인증되지 않은 사용자는 접근 불가
def project_update(request, project_id):
    
    """
    특정 프로젝트 내용 수정하는 API
    - 'PUT' : 전체 필드 업데이트
    - 'PATCH' : 일부 필드 업데이트 -> 대부분의 경우에 얘가 더 유연한 듯.
    """
    project = get_object_or_404(Project, id=project_id)
    
    if request.method == 'GET': 
        serializer = ProjectSerializer(project)
        return Response(serializer.data, status=status.HTTP_200_OK)

    user = request.user
    # participation = get_object_or_404(ProjectParticipation, project=project, participant=user)
    participation = ProjectParticipation.objects.filter(project=project, participant=user).first()
    
    if participation and participation.authority == 0:  # '0'은 마스터 권한을 의미

        if request.method =='PATCH':
            serializer = ProjectSerializer(project, data=request.data, partial =(request.method =='PATCH'))

            if serializer.is_valid():
                serializer.save() # Django의 ManyToManyField는 이 메소드만으로는 업데이트 되지 않음.

                if "participants" in request.data:
                    participants = request.data.get("participants", []) # 리스트로 받아옴
                    project.participants.all().delete() # 기존 참여자 제거

                    for participant in participants:
                        user_id = participant.get("id")
                        authority = participant.get("authority",1)

                        user = get_object_or_404(User, id=user_id)
                        ProjectParticipation.objects.create(
                            project=project,participant=user,authority=authority
                        )

                return Response(serializer.data, status=status.HTTP_200_OK)
            return Response({'status':'error','message':serializer.errors},status=status.HTTP_400_BAD_REQUEST)

        elif request.method == 'DELETE':
            project.delete()
            return Response(
            {"status": "success", "message": "성공적으로 프로젝트가 취소되었습니다."},
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

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def upload_report(request, project_id):
    '''
    보고서를 저장하는 API
        파일을 저장하지 않고 즉시 내용을 읽어 'Report 모델에 저장'
        0. 파일 내용 뽑기.
        1. Document 생성 (type=2)
        2. Report 생성 + Document와 연결
    '''
    project = get_object_or_404(Project, id=project_id)

    # 파일 추출
    uploaded_files = request.FILES.getlist('files')
    if not uploaded_files:
        return Response({'error': 'no file'}, status=status.HTTP_400_BAD_REQUEST)

    files_data = []
    for uploaded_file in uploaded_files:
        title = os.path.splitext(uploaded_file.name)[0]
        try:
            if uploaded_file.name.endswith('.docx'):
                doc = DocxDocument(uploaded_file)
                file_content = "\n".join([p.text for p in doc.paragraphs])
            else:
                file_content = uploaded_file.read().decode('utf-8')
        except UnicodeEncodeError:
            return Response({"error": "파일 인코딩 오류. UTF-8 형식이어야 합니다."},
                            status=status.HTTP_400_BAD_REQUEST)
        files_data.append({
            "filename": title,
            "content": file_content
        })

    # Celery 작업 호출: 백그라운드에서 파일 처리 및 DB 업데이트 수행
    process_upload_report.delay(project_id, request.user.id, files_data)

    return Response(
        {"message": "파일 업로드 요청이 접수되었습니다. 작업이 진행 중입니다."},
        status=status.HTTP_202_ACCEPTED
    )

    

@api_view(['GET'])
def all_reports(request, project_id):
    project = get_object_or_404(Project, id=project_id)  # 프로젝트 가져오기
    reports = project.reports.all()  # 프로젝트에 속하는 모든 보고서 가져오기
    serializer = ReportSerializer(reports, many=True)
    return Response(serializer.data)

@api_view(['DELETE'])
def report(request, project_id, report_id):
    project = get_object_or_404(Project, id=project_id)
    report = get_object_or_404(Report, id =report_id)
    
    user = request.user
    participation = ProjectParticipation.objects.filter(project=project, participant=user).first()
    
    if participation and participation.authority == 0:  # '0'은 마스터 권한을 의미


        if request.method == 'DELETE':
            report.delete()
            return Response(
            {"status": "success", "message": "문서를 성공적으로 삭제했습니다."},
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