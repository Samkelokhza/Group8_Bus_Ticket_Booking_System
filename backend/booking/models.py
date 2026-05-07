from django.db import models
from django.core.exceptions import ValidationError

# USER (from Phase 2)
class User(models.Model):
    user_id = models.AutoField(primary_key=True)
    username = models.CharField(max_length=100, unique=True)
    password = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    phone_number = models.CharField(max_length=15)
    id_number = models.CharField(max_length=20, unique=True)
    account_status = models.CharField(max_length=20, default='active')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.first_name} {self.last_name}"

# BUS
class Bus(models.Model):
    BUS_TYPES = [
        ('standard', 'Standard'),
        ('semi_luxury', 'Semi-Luxury'),
        ('luxury', 'Luxury'),
    ]
    bus_id = models.AutoField(primary_key=True)
    bus_number = models.CharField(max_length=20, unique=True)
    bus_type = models.CharField(max_length=20, choices=BUS_TYPES)
    capacity = models.IntegerField()
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"Bus {self.bus_number}"

# ROUTE
class Route(models.Model):
    route_id = models.AutoField(primary_key=True)
    departure_location = models.CharField(max_length=200)
    destination = models.CharField(max_length=200)
    route_distance = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"{self.departure_location} → {self.destination}"

# SCHEDULE
class Schedule(models.Model):
    schedule_id = models.AutoField(primary_key=True)
    bus = models.ForeignKey(Bus, on_delete=models.CASCADE, related_name='schedules')
    route = models.ForeignKey(Route, on_delete=models.CASCADE, related_name='schedules')
    departure_time = models.DateTimeField()
    arrival_time = models.DateTimeField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.route.departure_location} to {self.route.destination} at {self.departure_time}"

    def get_available_seats(self):
        all_seats = [f"A{str(i).zfill(2)}" for i in range(1, self.bus.capacity + 1)]
        booked_seats = Ticket.objects.filter(
            booking__schedule=self,
            booking__status__in=['pending', 'confirmed']
        ).values_list('seat_number', flat=True)
        return [seat for seat in all_seats if seat not in booked_seats]
    
    def get_available_seats_count(self):
        return len(self.get_available_seats())

# BOOKING
class Booking(models.Model):
    BOOKING_STATUS = [
        ('pending', 'Pending Payment'),
        ('confirmed', 'Confirmed'),
        ('cancelled', 'Cancelled'),
        ('completed', 'Completed'),
    ]
    booking_id = models.AutoField(primary_key=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='bookings')
    schedule = models.ForeignKey(Schedule, on_delete=models.CASCADE, related_name='bookings')
    status = models.CharField(max_length=20, choices=BOOKING_STATUS, default='pending')
    booking_date = models.DateTimeField(auto_now_add=True)
    total_passengers = models.IntegerField(default=1)

    def __str__(self):
        return f"Booking #{self.booking_id} - {self.user.username}"

# TICKET (Weak Entity)
class Ticket(models.Model):
    TICKET_STATUS = [
        ('active', 'Active'),
        ('cancelled', 'Cancelled'),
        ('used', 'Used'),
    ]
    ticket_id = models.AutoField(primary_key=True)
    booking = models.ForeignKey(Booking, on_delete=models.CASCADE, related_name='tickets')
    seat_number = models.CharField(max_length=10)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=TICKET_STATUS, default='active')

    class Meta:
        unique_together = ['booking', 'seat_number']

    def __str__(self):
        return f"Ticket {self.ticket_id} - Seat {self.seat_number}"

# PAYMENT (One-to-One with Booking)
class Payment(models.Model):
    PAYMENT_METHOD = [
        ('card', 'Credit/Debit Card'),
        ('eft', 'EFT'),
        ('cash', 'Cash'),
    ]
    PAYMENT_STATUS = [
        ('pending', 'Pending'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
        ('refunded', 'Refunded'),
    ]
    payment_id = models.AutoField(primary_key=True)
    booking = models.OneToOneField(Booking, on_delete=models.CASCADE, related_name='payment')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHOD)
    payment_status = models.CharField(max_length=20, choices=PAYMENT_STATUS, default='pending')
    payment_date = models.DateTimeField(auto_now_add=True)
    transaction_reference = models.CharField(max_length=100, unique=True, null=True, blank=True)

    def __str__(self):
        return f"Payment #{self.payment_id} - Booking #{self.booking.booking_id}"