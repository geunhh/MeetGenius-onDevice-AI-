from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from .models import User, Department, Position


class UserAdmin(BaseUserAdmin):
    model = User
    list_display = ('employee_number', 'name', 'email', 'department', 'position', 'is_staff')
    search_fields = ('employee_number', 'name', 'email', 'department')
    readonly_fields = ('id',)
    fieldsets = (
        (None, {'fields': ('employee_number', 'password')}),
        ('Personal info', {'fields': ('name', 'email', 'department', 'position')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser')}),
        ('Important dates', {'fields': ('last_login',)}),
    )


    add_fieldsets = (
    (None, {
        'classes': ('wide',), 
        'fields': ('employee_number', 'password1', 'password2', 'name', 'email', 'department', 'position'),
    }),
)


    ordering = ('employee_number',) 
    filter_horizontal = () 
    list_filter = ()

admin.site.register(User, UserAdmin)
admin.site.register(Department)
admin.site.register(Position)