from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from rest_framework_simplejwt.views import TokenObtainPairView

from .models import User
from .serializers import UserSerializer
from .permissions import IsAdmin
from .authentication import CustomTokenObtainPairSerializer


# Register new users
class RegisterView(generics.CreateAPIView):

    queryset = User.objects.all()

    serializer_class = UserSerializer

# View and update logged in user profile
class ProfileView(generics.RetrieveUpdateAPIView):

    serializer_class = UserSerializer

    permission_classes = [IsAuthenticated]

    def get_object(self):

        return self.request.user


# Admin can see all users
class UserListView(generics.ListAPIView):

    queryset = User.objects.all()

    serializer_class = UserSerializer

    permission_classes = [IsAuthenticated, IsAdmin]

# Admin can update user account status
class UserStatusUpdateView(generics.UpdateAPIView):

    queryset = User.objects.all()

    serializer_class = UserSerializer

    permission_classes = [IsAuthenticated, IsAdmin]

    def patch(self, request, *args, **kwargs):

        user = self.get_object()

        # Get status from request
        account_status = request.data.get('account_status')

        # Valid account statuses
        valid_statuses = ['ACTIVE', 'SUSPENDED']

        # Check if status is valid
        if account_status not in valid_statuses:

            return Response(
                {
                    "error": "Invalid account status"
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # Update status
        user.account_status = account_status

        user.save()

        return Response(
            {
                "message": "User status updated successfully"
            },
            status=status.HTTP_200_OK
        )

# Admin can delete users
class UserDeleteView(generics.DestroyAPIView):

    queryset = User.objects.all()

    serializer_class = UserSerializer

    permission_classes = [IsAuthenticated, IsAdmin]

    def delete(self, request, *args, **kwargs):

        user = self.get_object()

        user.delete()

        return Response(
            {
                "message": "User deleted successfully"
            },
            status=status.HTTP_200_OK
        )

# Custom login view using JWT authentication
class CustomTokenObtainPairView(TokenObtainPairView):

    # Use custom serializer
    serializer_class = CustomTokenObtainPairSerializer