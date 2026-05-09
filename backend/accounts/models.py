from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):

    # Different roles in the system
    ROLE_CHOICES = (
        ('PASSENGER', 'Passenger'),
        ('STAFF', 'Staff'),
        ('ADMIN', 'Admin'),
    )

    # Account status choices
    STATUS_CHOICES = (
        ('ACTIVE', 'Active'),
        ('SUSPENDED', 'Suspended'),
    )

    # User role
    role = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES,
        default='PASSENGER'
    )

    # Account status
    account_status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='ACTIVE'
    )

    # Extra user information
    phone_number = models.CharField(
        max_length=15,
        blank=True,
        null=True
    )

    id_number = models.CharField(
        max_length=20,
        unique=True,
        blank=True,
        null=True
    )

    address = models.TextField(
        blank=True,
        null=True
    )

    # Next of kin information
    next_of_kin_name = models.CharField(
        max_length=100,
        blank=True,
        null=True
    )

    next_of_kin_phone = models.CharField(
        max_length=15,
        blank=True,
        null=True
    )

    next_of_kin_relationship = models.CharField(
        max_length=50,
        blank=True,
        null=True
    )

    # Display username in admin panel
    def __str__(self):
        return self.username
    
    # If a user is a Django superuser, automatically set role to ADMIN
    def save(self, *args, **kwargs):

        if self.is_superuser:
            self.role = 'ADMIN'

        super().save(*args, **kwargs)