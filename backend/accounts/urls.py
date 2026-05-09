from django.urls import path

from .views import (
    RegisterView,
    ProfileView,
    UserListView,
    UserStatusUpdateView,
    UserDeleteView,
)

urlpatterns = [

    # Register new users
    path('register/', RegisterView.as_view(), name='register'),

    # Logged in user profile
    path('profile/', ProfileView.as_view(), name='profile'),

    # Admin can view all users
    path('users/', UserListView.as_view(), name='users'),

    # Admin can update account status
    path(
        'users/<int:pk>/status/',
        UserStatusUpdateView.as_view(),
        name='user-status'
    ),

    # Admin can delete users
    path(
        'users/<int:pk>/delete/',
        UserDeleteView.as_view(),
        name='user-delete'
    ),
]