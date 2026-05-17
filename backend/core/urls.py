from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import *

router = DefaultRouter()
router.register(r'buses', BusViewSet, basename='bus')
router.register(r'routes', RouteViewSet, basename='route')
router.register(r'schedules', ScheduleViewSet, basename='schedule')
router.register(r'bookings', BookingViewSet, basename='booking')
router.register(r'payments', PaymentViewSet, basename='payment')
router.register(r'complaints', ComplaintViewSet, basename='complaint')

urlpatterns = [
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/me/', UserMeView.as_view(), name='user_me'),
    path('analytics/', AnalyticsView.as_view(), name='analytics'),
    path('reports/bookings/', BookingReportView.as_view(), name='booking-report'),
    path('schedules/<int:schedule_id>/seats/', SeatAvailabilityView.as_view(), name='seat-availability'),
    path('bookings/<int:booking_id>/cancel/', CancelBookingView.as_view(), name='cancel-booking'),
    path('', include(router.urls)),
]
