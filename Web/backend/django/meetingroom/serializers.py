from rest_framework import serializers
from .models import Meeting, Agenda, MeetingParticipation, Mom, SummaryMom
from django.contrib.auth import get_user_model
from projects.serializers import ProjectSerializer 
from projects.models import Project, ProjectParticipation

# 모델과 연결.
class MeetingReadSerializer(serializers.ModelSerializer):
    class Meta:
        model = Meeting
        fields = [
            'id', 'title','room','starttime', 'endtime',
        ]

User = get_user_model()

class MeetingParticipationSerializer(serializers.ModelSerializer):
    participant = serializers.PrimaryKeyRelatedField(queryset=User.objects.all())
    
    class Meta:
        model = MeetingParticipation
        fields = ['id', 'meeting', 'participant', 'authority']

class AgendaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Agenda
        fields = ['id', 'title', 'order', 'meeting']


class MeetingBookSerializer(serializers.ModelSerializer):
    booker = serializers.ReadOnlyField(source='booker.name')
    meeting_participants = serializers.SerializerMethodField() 
    meeting_agendas = serializers.SerializerMethodField() 
    project = ProjectSerializer(read_only=True)
    starttime = serializers.DateTimeField(format="%Y-%m-%d %H:%M:%S")  # 회의 시작 시간
    endtime = serializers.DateTimeField(format="%Y-%m-%d %H:%M:%S")  # 회의 종료 시간
    

    class Meta:
        model = Meeting
        fields = ['id', 'room','title', 'starttime', 'endtime', 'booked_at', 'booker', 'project', 'meeting_participants', 'meeting_agendas']


    def get_meeting_participants(self, obj):
        return [
            {
                "id": p.participant.id,
                "name": p.participant.name,
                "authority": p.authority
            }
            for p in obj.participants.all() # 현재 회의의 모든 참여자.
        ]

    def get_meeting_agendas(self, obj):
        return [
            {
                "id": a.id,
                "title": a.title,
                "order": a.order
            }
            for a in obj.agenda_set.all()  # 현재 회의의 모든 안건
        ]

class MomSerializer(serializers.ModelSerializer):
    agenda = AgendaSerializer(read_only=True)  # ✅ 아젠다 전체 포함

    class Meta:
        model = Mom
        fields = ['id','meeting','agenda_result','agenda','document','completed']


class MeetingParticipationSerializer(serializers.ModelSerializer):
    participant_name = serializers.CharField(source="participant.name", read_only=True)  # 사용자 이름 포함

    class Meta:
        model = MeetingParticipation
        fields = ['participant', 'participant_name', 'authority']

class MeetingSerilizer(serializers.ModelSerializer):
    participants = MeetingParticipationSerializer(source='participants.all', many=True, read_only=True)  # 참여자 목록 포함
    
    class Meta:
        model = Meeting
        fields = '__all__'


class SummaryMomSerializer(serializers.ModelSerializer):
    agenda_title = serializers.SerializerMethodField()

    class Meta:
        model = SummaryMom
        fields = '__all__'
    
    def get_agenda_title(self, obj):
        return obj.mom.agenda.title if obj.mom and obj.mom.agenda else None
