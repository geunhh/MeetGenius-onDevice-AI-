from django.db import models
from django.conf import settings
from accounts.models import Department
# from meetingroom.models import Meeting, Agenda  # 직접 import 제거

class Project(models.Model):
    name = models.CharField(max_length=50, unique=True)
    description = models.TextField(blank=True)
    department = models.ForeignKey(
        Department, on_delete=models.CASCADE, related_name='projects'
    )
    creator = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='created_projects',
        null=True, blank=True 
    )
    is_inprogress = models.BooleanField(default=True)
    startdate = models.DateTimeField()
    duedate = models.DateTimeField()

    def __str__(self):
        return self.name

class ProjectParticipation(models.Model):
    ROLE_CHOICES = [
        (0, "Master"),
        (1, "Participant"),
    ]
    
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name="participants")
    participant = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="project_participations")
    authority = models.IntegerField(choices=ROLE_CHOICES, default=1)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['project', 'participant'], 
                name='unique_project_participant'
            )
        ]

    def __str__(self):
        return f"{self.participant} - {self.project}"

class Document(models.Model):
    TYPE_CHOICES=[
        (0, "요약 전 회의록"),
        (1, "요약 후 회의록"),
        (2, "보고서"),
    ]
    type = models.IntegerField(choices=TYPE_CHOICES)    # 어떤 문서인지 구분
    embedding = models.BooleanField(default=False)      # Embedding 여부
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='documents')
    department = models.ForeignKey(Department, on_delete=models.CASCADE, related_name='documents')

class Report(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='reports')
    writer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="written_reports")
    document = models.ForeignKey(Document, on_delete=models.SET_NULL, null=True, blank=True, related_name='reports')
    title = models.CharField(max_length=100)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

