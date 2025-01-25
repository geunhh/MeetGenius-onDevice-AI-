from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import Department, Position, User

# @admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = ('id', 'name')  # 보여줄 필드 추가

# @admin.register(Position)
class PositionAdmin(admin.ModelAdmin):
    list_display = ('id', 'name')  # 보여줄 필드 추가


admin.site.register(Department)
admin.site.register(Position)
admin.site.register(User, UserAdmin)