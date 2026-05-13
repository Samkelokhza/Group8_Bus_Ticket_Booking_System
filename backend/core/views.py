from rest_framework import viewsets, status, generics
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.views import APIView
from django.db.models import Count, Sum
from django.db import transaction
from .models import *
from .serializers import *

class IsAdminUser(IsAuthenticated):
    def has_permission(self, request, view):
        return super().has_permission(request, view) and \
               request.user.user_roles.filter(role__role_name='Admin').exists()

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        role_name = request.data.get('role', 'Passenger')
        role, _ = Role.objects.get_or_create(role_name=role_name)
        UserRole.objects.create(user=user, role=role)
        return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)

class UserMeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user).data)

class BusViewSet(viewsets.ModelViewSet):
    queryset = Bus.objects.all()
    serializer_class = BusSerializer
    permission_classes = [IsAdminUser]

class RouteViewSet(viewsets.ModelViewSet):
    queryset = Route.objects.all()
    serializer_class = RouteSerializer
    permission_classes = [IsAdminUser]

class ScheduleViewSet(viewsets.ModelViewSet):
    queryset = Schedule.objects.all()
    serializer_class = ScheduleSerializer
    permission_classes = [IsAuthenticated]

class BookingViewSet(viewsets.ModelViewSet):
    serializer_class = BookingSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if self.request.user.user_roles.filter(role__role_name='Admin').exists():
            return Booking.objects.all()
        return Booking.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=['post'])
    def mock_pay(self, request, pk=None):
        booking = self.get_object()
        if booking.booking_status != 'confirmed':
            return Response({'error': 'Booking not confirmed'}, status=400)
        Payment.objects.create(
            booking=booking,
            amount=booking.total_fare,
            payment_method='mock_card',
            payment_status='completed',
            transaction_reference=f'MOCK-{booking.id}'
        )
        return Response({'status': 'payment completed'})

class PaymentViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = PaymentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if self.request.user.user_roles.filter(role__role_name='Admin').exists():
            return Payment.objects.all()
        return Payment.objects.filter(booking__user=self.request.user)

class ComplaintViewSet(viewsets.ModelViewSet):
    serializer_class = ComplaintSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if self.request.user.user_roles.filter(role__role_name='Admin').exists():
            return Complaint.objects.all()
        return Complaint.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=['patch'])
    def resolve(self, request, pk=None):
        complaint = self.get_object()
        complaint.resolution_status = 'resolved'
        complaint.save()
        return Response({'status': 'resolved'})

class NextOfKinViewSet(viewsets.ModelViewSet):
    serializer_class = NextOfKinSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return NextOfKin.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class AnalyticsView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        popular = Route.objects.annotate(
            booking_count=Count('schedules__bookings')
        ).order_by('-booking_count')[:5].values('departure_location', 'destination', 'booking_count')
        revenue = Payment.objects.filter(payment_status='completed').aggregate(total=Sum('amount'))
        busy = Bus.objects.annotate(seats=Count('schedules__bookings__tickets')).order_by('-seats')[:5].values('registration_number', 'bus_type', 'seats', 'capacity')
        return Response({
            'popular_routes': list(popular),
            'total_revenue': revenue['total'] or 0,
            'busy_buses': list(busy),
        })