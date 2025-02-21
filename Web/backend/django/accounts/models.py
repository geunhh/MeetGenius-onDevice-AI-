from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models

# Create your models here.
class Department(models.Model):
    name = models.CharField(max_length=50, unique=True, verbose_name='부서명')

    def __str__(self):
        return self.name

class Position(models.Model):
    name = models.CharField(max_length=50, unique=True, verbose_name='직급명')

    def __str__(self):
        return self.name

class UserManager(BaseUserManager):
    def create_user(self, employee_number, password=None, **extra_fields):
        if not employee_number:
            raise ValueError('사번은 필수 항목입니다.')
        user = self.model(employee_number=employee_number, **extra_fields)
        user.set_password(password)  # 비밀번호 암호화
        user.save(using=self._db)
        return user

    def create_superuser(self, employee_number, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(employee_number, password, **extra_fields)

class User(AbstractBaseUser, PermissionsMixin):
    employee_number = models.CharField(max_length=7, unique=True)
    name = models.CharField(max_length=50)
    email = models.EmailField(unique=False)
    department = models.ForeignKey(Department, on_delete=models.SET_NULL, null=True, blank=True)
    position = models.ForeignKey(Position, on_delete=models.SET_NULL, null=True, blank=True)

    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    is_superuser = models.BooleanField(default=False)
    objects = UserManager()

    USERNAME_FIELD = 'employee_number'
    REQUIRED_FIELDS = []

    def __str__(self):
        return self.name

class Notification(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)  # 알림을 받을 사용자
    message = models.TextField()  # 알림 내용
    is_read = models.BooleanField(default=False)  # 알림 읽음 여부
    created_at = models.DateTimeField(auto_now_add=True)  # 알림 생성 시각

    def __str__(self):
        return f"Notification for {self.user.username}"