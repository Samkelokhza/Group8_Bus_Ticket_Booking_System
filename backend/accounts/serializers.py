from rest_framework import serializers
from .models import User


class UserSerializer(serializers.ModelSerializer):

    # Password should not be visible
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User

        fields = [
            'id',
            'username',
            'email',
            'password',
            'first_name',
            'last_name',
            'role',
            'phone_number',
            'id_number',
            'address',
            'next_of_kin_name',
            'next_of_kin_phone',
            'next_of_kin_relationship',
            'account_status',
        ]

        # Prevent users from changing account status
        read_only_fields = ['account_status']

    # Create new user
    def create(self, validated_data):

        # Default role for all new users
        validated_data['role'] = 'PASSENGER'

        password = validated_data.pop('password')

        user = User(**validated_data)

        # Encrypt password
        user.set_password(password)

        user.save()

        return user