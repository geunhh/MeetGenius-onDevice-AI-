from django.contrib import admin
from .models import Meeting, Agenda, MeetingParticipation

@admin.register(Meeting)
class MeetingAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'room', 'starttime', 'endtime', 'booker', 'project', 'booked_at')
    list_filter = ('starttime', 'endtime', 'project')
    search_fields = ('title', 'booker__username', 'project__name')
    ordering = ('-starttime',)

@admin.register(Agenda)
class AgandaAdmin(admin.ModelAdmin):
    list_display = ('id', 'meeting', 'title')
    search_fields = ('title', 'meeting__title')
    list_filter = ('meeting',)

@admin.register(MeetingParticipation)
class MeetingParticipationAdmin(admin.ModelAdmin):
    list_display = ('id', 'meeting', 'participant', 'authority')
    list_filter = ('meeting', 'authority')
    search_fields = ('meeting__title', 'participant__username')
