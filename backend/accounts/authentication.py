from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework import serializers


# Custom JWT login serializer
class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):

    def validate(self, attrs):

        # Default JWT validation
        data = super().validate(attrs)

        # Prevent suspended users from logging in
        if self.user.account_status == 'SUSPENDED':

            raise serializers.ValidationError(
                "This account has been suspended."
            )

        # Return extra user information
        data['user'] = {
            'id': self.user.id,
            'username': self.user.username,
            'role': self.user.role,
            'account_status': self.user.account_status,
        }

        return data