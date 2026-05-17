from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone

class User(AbstractUser):
    surname = models.CharField(max_length=100, blank=True)
    phone_number = models.CharField(max_length=15, blank=True)
    id_number = models.CharField(max_length=13, blank=True)
    address = models.TextField(blank=True)
    account_status = models.CharField(max_length=20, default='active')
    registration_date = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'core_user'

    def __str__(self):
        return self.username

class Role(models.Model):
    role_name = models.CharField(max_length=50, unique=True)
    description = models.TextField(blank=True)

    class Meta:
        db_table = 'core_role'

    def __str__(self):
        return self.role_name

class UserRole(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='user_roles')
    role = models.ForeignKey(Role, on_delete=models.CASCADE)
    assigned_date = models.DateTimeField(auto_now_add=True)
    assigned_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='role_assignments')

    class Meta:
        db_table = 'core_userrole'
        unique_together = ('user', 'role')

class Bus(models.Model):
    bus_type = models.CharField(max_length=50)
    capacity = models.PositiveIntegerField()
    registration_number = models.CharField(max_length=20, unique=True)

    class Meta:
        db_table = 'core_bus'
        verbose_name_plural = 'buses'

    def __str__(self):
        return f"{self.registration_number} ({self.bus_type})"

class Route(models.Model):
    departure_location = models.CharField(max_length=100)
    destination = models.CharField(max_length=100)
    route_distance = models.DecimalField(max_digits=6, decimal_places=2, default=0)

    class Meta:
        db_table = 'core_route'

    def __str__(self):
        return f"{self.departure_location} → {self.destination}"

class Schedule(models.Model):
    route = models.ForeignKey(Route, on_delete=models.CASCADE, related_name='schedules')
    bus = models.ForeignKey(Bus, on_delete=models.CASCADE, related_name='schedules')
    departure_time = models.DateTimeField()
    arrival_time = models.DateTimeField()
    travel_date = models.DateField()

    class Meta:
        db_table = 'core_schedule'

    def __str__(self):
        return f"{self.route} - {self.departure_time}"

class Booking(models.Model):
    BOOKING_STATUS = [
        ('pending', 'Pending'),
        ('BOOKED', 'Booked'),
        ('CANCELLED', 'Cancelled'),
    ]
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='bookings')
    schedule = models.ForeignKey(Schedule, on_delete=models.CASCADE, related_name='bookings')
    booking_status = models.CharField(max_length=20, choices=BOOKING_STATUS, default='pending')
    booking_date = models.DateTimeField(auto_now_add=True)
    total_passengers = models.PositiveIntegerField(default=1)
    base_price = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    total_fare = models.DecimalField(max_digits=8, decimal_places=2, default=0)

    class Meta:
        db_table = 'core_booking'

class Ticket(models.Model):
    TICKET_STATUS = [
        ('ACTIVE', 'Active'),
        ('CANCELLED', 'Cancelled'),
        ('USED', 'Used'),
    ]
    booking = models.ForeignKey(Booking, on_delete=models.CASCADE, related_name='tickets')
    seat_number = models.CharField(max_length=10)
    ticket_status = models.CharField(max_length=20, choices=TICKET_STATUS, default='ACTIVE')

    class Meta:
        db_table = 'core_ticket'
        constraints = [
            models.UniqueConstraint(fields=['booking', 'seat_number'], name='unique_seat_per_booking')
        ]

class Payment(models.Model):
    PAYMENT_STATUS = [
        ('pending', 'Pending'),
        ('PAID', 'Paid'),
        ('failed', 'Failed'),
    ]
    booking = models.OneToOneField(Booking, on_delete=models.CASCADE, related_name='payment')
    amount = models.DecimalField(max_digits=8, decimal_places=2)
    payment_method = models.CharField(max_length=30, default='card')
    payment_status = models.CharField(max_length=20, choices=PAYMENT_STATUS, default='pending')
    payment_date = models.DateTimeField(default=timezone.now)
    transaction_reference = models.CharField(max_length=100, blank=True)

    class Meta:
        db_table = 'core_payment'

class Complaint(models.Model):
    RESOLUTION_STATUS = [
        ('open', 'Open'),
        ('in_progress', 'In Progress'),
        ('resolved', 'Resolved'),
    ]
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='complaints')
    booking = models.ForeignKey(Booking, on_delete=models.SET_NULL, null=True, blank=True)
    description = models.TextField()
    date_submitted = models.DateTimeField(auto_now_add=True)
    resolution_status = models.CharField(max_length=30, choices=RESOLUTION_STATUS, default='open')

    class Meta:
        db_table = 'core_complaint'

class NextOfKin(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='next_of_kin')
    kin_fullname = models.CharField(max_length=100)
    contact_number = models.CharField(max_length=15)

    class Meta:
        db_table = 'core_nextofkin'
        verbose_name_plural = 'next of kin'
        