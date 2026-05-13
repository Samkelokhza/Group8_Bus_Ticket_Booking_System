from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.db import transaction
import uuid

from .models import User, Booking, Ticket, Payment, Schedule
from .serializers import (
    BookingSerializer, CreateBookingSerializer,
    PaymentSerializer, CreatePaymentSerializer
)

# 1. GET AVAILABLE SEATS FOR A SCHEDULE
@api_view(['GET'])
def available_seats(request, schedule_id):
    try:
        schedule = Schedule.objects.get(schedule_id=schedule_id)
    except Schedule.DoesNotExist:
        return Response({'error': 'Schedule not found'}, status=status.HTTP_404_NOT_FOUND)
    
    available = schedule.get_available_seats()
    
    data = {
        'schedule_id': schedule.schedule_id,
        'available_seats': available,
        'total_available': len(available),
        'bus_capacity': schedule.bus.capacity,
        'departure_time': schedule.departure_time,
        'destination': schedule.route.destination
    }
    return Response(data, status=status.HTTP_200_OK)

# 2. CREATE A NEW BOOKING
@api_view(['POST'])
def create_booking(request):
    serializer = CreateBookingSerializer(data=request.data)
    
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    data = serializer.validated_data
    
    with transaction.atomic():
        schedule = Schedule.objects.select_for_update().get(schedule_id=data['schedule_id'])
        
        available_seats = schedule.get_available_seats()
        for seat in data['seat_numbers']:
            if seat not in available_seats:
                return Response({'error': f'Seat {seat} was just taken'}, status=status.HTTP_409_CONFLICT)
        
        booking = Booking.objects.create(
            user_id=data['user_id'],
            schedule=schedule,
            status='pending',
            total_passengers=len(data['seat_numbers'])
        )
        
        for seat in data['seat_numbers']:
            Ticket.objects.create(
                booking=booking,
                seat_number=seat,
                price=schedule.price,
                status='active'
            )
    
    response_data = BookingSerializer(booking).data
    return Response(response_data, status=status.HTTP_201_CREATED)

# 3. GET BOOKING DETAILS
@api_view(['GET'])
def get_booking(request, booking_id):
    try:
        booking = Booking.objects.get(booking_id=booking_id)
    except Booking.DoesNotExist:
        return Response({'error': 'Booking not found'}, status=status.HTTP_404_NOT_FOUND)
    
    serializer = BookingSerializer(booking)
    return Response(serializer.data, status=status.HTTP_200_OK)

# 4. GET ALL BOOKINGS FOR A USER
@api_view(['GET'])
def user_bookings(request, user_id):
    try:
        user = User.objects.get(user_id=user_id)
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
    
    bookings = Booking.objects.filter(user=user).order_by('-booking_date')
    serializer = BookingSerializer(bookings, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

# 5. CANCEL A BOOKING
@api_view(['DELETE'])
def cancel_booking(request, booking_id):
    try:
        booking = Booking.objects.get(booking_id=booking_id)
    except Booking.DoesNotExist:
        return Response({'error': 'Booking not found'}, status=status.HTTP_404_NOT_FOUND)
    
    if booking.status == 'cancelled':
        return Response({'error': 'Booking already cancelled'}, status=status.HTTP_400_BAD_REQUEST)
    
    if booking.status == 'completed':
        return Response({'error': 'Cannot cancel completed booking'}, status=status.HTTP_400_BAD_REQUEST)
    
    with transaction.atomic():
        booking.status = 'cancelled'
        booking.save()
        booking.tickets.update(status='cancelled')
        
        if hasattr(booking, 'payment'):
            payment = booking.payment
            payment.payment_status = 'refunded'
            payment.save()
    
    return Response({'message': f'Booking {booking_id} cancelled successfully'}, status=status.HTTP_200_OK)

# 6. PROCESS PAYMENT
@api_view(['POST'])
def process_payment(request):
    serializer = CreatePaymentSerializer(data=request.data)
    
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    data = serializer.validated_data
    
    with transaction.atomic():
        booking = Booking.objects.select_for_update().get(booking_id=data['booking_id'])
        
        transaction_ref = f"TX-{uuid.uuid4().hex[:8].upper()}"
        
        payment = Payment.objects.create(
            booking=booking,
            amount=data['amount'],
            payment_method=data['payment_method'],
            payment_status='completed',
            transaction_reference=transaction_ref
        )
        
        booking.status = 'confirmed'
        booking.save()
    
    response_data = PaymentSerializer(payment).data
    return Response(response_data, status=status.HTTP_201_CREATED)

# 7. SEARCH SCHEDULES
@api_view(['GET'])
def search_schedules(request):
    departure = request.query_params.get('departure', '')
    destination = request.query_params.get('destination', '')
    
    schedules = Schedule.objects.filter(is_active=True)
    
    if departure:
        schedules = schedules.filter(route__departure_location__icontains=departure)
    if destination:
        schedules = schedules.filter(route__destination__icontains=destination)
    
    result = []
    for schedule in schedules:
        result.append({
            'schedule_id': schedule.schedule_id,
            'departure_location': schedule.route.departure_location,
            'destination': schedule.route.destination,
            'departure_time': schedule.departure_time,
            'arrival_time': schedule.arrival_time,
            'price': schedule.price,
            'bus_type': schedule.bus.bus_type,
            'available_seats': schedule.get_available_seats_count()
        })
    
    return Response(result, status=status.HTTP_200_OK)
