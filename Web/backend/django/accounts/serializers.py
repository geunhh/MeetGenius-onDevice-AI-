from rest_framework import serializers
from .models import User, Department

class UserSerializer(serializers.ModelSerializer):
    department = serializers.SerializerMethodField()
    position = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id','employee_number', 'name', 'email', 'department', 'position']

    def get_department(self, obj):
        return obj.department.name if obj.department else None

    def get_position(self, obj):
        return obj.position.name if obj.position else None

class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = "__all__"  # 언더스코어 두 개 사용
