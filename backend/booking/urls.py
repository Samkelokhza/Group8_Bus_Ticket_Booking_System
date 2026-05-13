from django.urls import path
from . import views

urlpatterns = [
    path('api/seats/available/<int:schedule_id>/', views.available_seats, name='available_seats'),
    path('api/bookings/create/', views.create_booking, name='create_booking'),
    path('api/bookings/<int:booking_id>/', views.get_booking, name='get_booking'),
    path('api/bookings/user/<int:user_id>/', views.user_bookings, name='user_bookings'),
    path('api/bookings/<int:booking_id>/cancel/', views.cancel_booking, name='cancel_booking'),
    path('api/payments/', views.process_payment, name='process_payment'),
    path('api/schedules/search/', views.search_schedules, name='search_schedules'),
]