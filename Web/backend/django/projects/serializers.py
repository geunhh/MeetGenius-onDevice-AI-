from rest_framework import serializers
from .models import Project, ProjectParticipation, Document, Report
from django.conf import settings
from django.contrib.auth import get_user_model

# 모델과 연결.
class ProjectSerializer(serializers.ModelSerializer):
    creator = serializers.ReadOnlyField(source='creator.name') 
    department = serializers.ReadOnlyField(source = 'department.name')    
    # Read_only 수정 불가능.
    # creator : 사번 뜨도록.
    participants = serializers.SerializerMethodField()
    # 가상 필드.
    # 참여 유저들의 정보를 가져와서 JSON 형태로 변환하기위해 추가.
    # get_participants() 함수에서 처ㅣㄹ

    class Meta:
        model = Project
        fields = [
            'id', 'name', 'description', 'department', 'creator',
            'is_inprogress', 'startdate', 'duedate', 'participants'
        ]
    
    
    def get_participants(self, obj):
        return [
            {
                "id": p.participant.id,
                "name": p.participant.name,
                # "email": p.participant.email,
                "authority": p.authority
            }
            for p in obj.participants.all() # 현재 프로젝트의 모든 참여자.
        ]
    '''
    변환되는 구조. -> 
    "participants": [
        {
            "id": 1,
            "name": "홍길동",
            "email": "hong@example.com",
            "authority": 1
        },
        {
            "id": 2,
            "name": "김철수",
            "email": "kim@example.com",
            "authority": 0
        }
    ]
    '''
# class ProjectParticipationSerializer(serializers.ModelSerializer):
#     participant = serializers.PrimaryKeyRelatedField(queryset=settings.AUTH_USER_MODEL.objects.all())


User = get_user_model()

class ProjectParticipationSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectParticipation
        fields = "__all__"

class ReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = Report
        # 필요한 필드만 선택할 수 있습니다.
        fields = "__all__"