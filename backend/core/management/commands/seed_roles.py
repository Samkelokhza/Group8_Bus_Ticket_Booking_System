from django.core.management.base import BaseCommand
from core.models import Role

class Command(BaseCommand):
    help = 'Create default roles'

    def handle(self, *args, **options):
        roles = [
            ('Passenger', 'Regular bus traveler'),
            ('Admin', 'System administrator'),
        ]
        for name, desc in roles:
            role, created = Role.objects.get_or_create(
                role_name=name, defaults={'description': desc}
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f'Created role: {name}'))
            else:
                self.stdout.write(f'Role already exists: {name}')