from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User


# Makes custom fields appear in admin
class CustomUserAdmin(UserAdmin):

    fieldsets = UserAdmin.fieldsets + (
        ("Extra Info", {
            "fields": (
                "role",
                "account_status",
                "phone_number",
                "id_number",
                "address",
                "next_of_kin_name",
                "next_of_kin_phone",
                "next_of_kin_relationship",
            )
        }),
    )

# Register custom user model
admin.site.register(User, CustomUserAdmin)