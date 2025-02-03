from django.db import models
from accounts.models import User

# Create your models here.
class Meeting(models.Model):
    room = models.IntegerField()
    starttime = models.DateTimeField()
    endtime = models.DateTimeField()
    booked_at = models.DateTimeField(auto_now_add=True)
    booker = models.ForeignKey(User)