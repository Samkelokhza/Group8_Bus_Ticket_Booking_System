from rest_framework import serializers
from .models import Booking, Ticket, Payment, Schedule, User

# TICKET SERIALIZER
class TicketSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ticket
        fields = ['ticket_id', 'seat_number', 'price', 'status']

# BOOKING SERIALIZER (for viewing)
class BookingSerializer(serializers.ModelSerializer):
    tickets = TicketSerializer(many=True, read_only=True)
    user_name = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = Booking
        fields = ['booking_id', 'user', 'user_name', 'schedule', 'status', 'booking_date', 'total_passengers', 'tickets']

# CREATE BOOKING SERIALIZER (for validating new bookings)
class CreateBookingSerializer(serializers.Serializer):
    user_id = serializers.IntegerField()
    schedule_id = serializers.IntegerField()
    seat_numbers = serializers.ListField(child=serializers.CharField(max_length=10))
    
    def validate(self, data):
        from .models import User, Schedule
        
        if not User.objects.filter(user_id=data['user_id']).exists():
            raise serializers.ValidationError(f"User id {data['user_id']} does not exist")
        
        try:
            schedule = Schedule.objects.get(schedule_id=data['schedule_id'])
        except Schedule.DoesNotExist:
            raise serializers.ValidationError(f"Schedule id {data['schedule_id']} does not exist")
        
        available_seats = schedule.get_available_seats()
        for seat in data['seat_numbers']:
            if seat not in available_seats:
                raise serializers.ValidationError(f"Seat {seat} is not available")
        
        return data

# PAYMENT SERIALIZER
class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = ['payment_id', 'booking', 'amount', 'payment_method', 'payment_status', 'payment_date']

# CREATE PAYMENT SERIALIZER
class CreatePaymentSerializer(serializers.Serializer):
    booking_id = serializers.IntegerField()
    amount = serializers.DecimalField(max_digits=10, decimal_places=2)
    payment_method = serializers.ChoiceField(choices=['card', 'eft', 'cash'])
    
    def validate(self, data):
        from .models import Booking
        
        try:
            booking = Booking.objects.get(booking_id=data['booking_id'])
        except Booking.DoesNotExist:
            raise serializers.ValidationError(f"Booking id {data['booking_id']} does not exist")
        
        if hasattr(booking, 'payment'):
            raise serializers.ValidationError("This booking already has a payment")
        
        if booking.status != 'pending':
            raise serializers.ValidationError(f"Cannot pay for booking with status '{booking.status}'")
        
        if data['amount'] != booking.total_cost:
            raise serializers.ValidationError(f"Amount does not match booking total")
        
        return data