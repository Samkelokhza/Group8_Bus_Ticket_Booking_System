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

class Role(models.Model):
    role_name = models.CharField(max_length=50, unique=True)
    description = models.TextField(blank=True)

    class Meta:
        db_table = 'core_role'

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

class Route(models.Model):
    departure_location = models.CharField(max_length=100)
    destination = models.CharField(max_length=100)
    route_distance = models.DecimalField(max_digits=6, decimal_places=2, default=0)

    class Meta:
        db_table = 'core_route'

class Schedule(models.Model):
    route = models.ForeignKey(Route, on_delete=models.RESTRICT, related_name='schedules')  # Don't delete routes with schedules
    bus = models.ForeignKey(Bus, on_delete=models.SET_NULL, null=True, related_name='schedules')  # Keep schedule if bus deleted
    departure_time = models.DateTimeField()
    arrival_time = models.DateTimeField()
    travel_date = models.DateField()

    class Meta:
        db_table = 'core_schedule'

class Booking(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='bookings')  # Delete bookings if user deleted
    schedule = models.ForeignKey(Schedule, on_delete=models.RESTRICT, related_name='bookings')  # Don't delete schedule with bookings
    booking_status = models.CharField(max_length=20, default='pending')
    booking_date = models.DateTimeField(auto_now_add=True)
    total_passengers = models.PositiveIntegerField(default=1)
    base_price = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    total_fare = models.DecimalField(max_digits=8, decimal_places=2, default=0)

    class Meta:
        db_table = 'core_booking'

class Ticket(models.Model):
    booking = models.ForeignKey(Booking, on_delete=models.CASCADE, related_name='tickets')  # Delete tickets if booking deleted
    seat_number = models.CharField(max_length=10)
    ticket_status = models.CharField(max_length=20, default='ACTIVE')

    class Meta:
        db_table = 'core_ticket'
        constraints = [models.UniqueConstraint(fields=['booking', 'seat_number'], name='unique_seat')]

class Payment(models.Model):
    booking = models.OneToOneField(Booking, on_delete=models.CASCADE, related_name='payment')  # Delete payment if booking deleted
    amount = models.DecimalField(max_digits=8, decimal_places=2)
    payment_method = models.CharField(max_length=30, default='card')
    payment_status = models.CharField(max_length=20, default='pending')
    payment_date = models.DateTimeField(default=timezone.now)
    transaction_reference = models.CharField(max_length=100, blank=True)

    class Meta:
        db_table = 'core_payment'

class Complaint(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='complaints')  # Delete complaints if user deleted
    booking = models.ForeignKey(Booking, on_delete=models.SET_NULL, null=True, blank=True)  # Keep complaint if booking deleted
    description = models.TextField()
    date_submitted = models.DateTimeField(auto_now_add=True)
    resolution_status = models.CharField(max_length=30, default='open')

    class Meta:
        db_table = 'core_complaint'

class NextOfKin(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='next_of_kin')  # Delete if user deleted
    kin_fullname = models.CharField(max_length=100)
    contact_number = models.CharField(max_length=15)

    class Meta:
        db_table = 'core_nextofkin'