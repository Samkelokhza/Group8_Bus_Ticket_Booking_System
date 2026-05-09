from rest_framework.permissions import BasePermission


# Admin permission
class IsAdmin(BasePermission):

    def has_permission(self, request, view):

        return (
            request.user.is_authenticated and
            (
                request.user.is_superuser or
                request.user.role == 'ADMIN'
            )
        )

# Staff permission
class IsStaff(BasePermission):

    def has_permission(self, request, view):

        return (
            request.user.is_authenticated and
            request.user.role == 'STAFF'
        )

# Passenger permission
class IsPassenger(BasePermission):

    def has_permission(self, request, view):

        return (
            request.user.is_authenticated and
            request.user.role == 'PASSENGER'
        )