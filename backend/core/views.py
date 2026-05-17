from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.decorators import action
from django.db import connection
from django.contrib.auth.hashers import make_password
from django.contrib.auth import get_user_model

User = get_user_model()

# ============================================================
# HELPERS
# ============================================================
def fetch_all(sql, params=None):
    with connection.cursor() as cursor:
        cursor.execute(sql, params or [])
        cols = [c[0] for c in cursor.description]
        return [dict(zip(cols, r)) for r in cursor.fetchall()]

def fetch_one(sql, params=None):
    rows = fetch_all(sql, params)
    return rows[0] if rows else None

def execute(sql, params=None):
    with connection.cursor() as cursor:
        cursor.execute(sql, params or [])
        return cursor.rowcount

# ============================================================
# PERMISSIONS
# ============================================================
class IsAdminUser(IsAuthenticated):
    def has_permission(self, request, view):
        return super().has_permission(request, view) and request.user.user_roles.filter(role__role_name='Admin').exists()

# ============================================================
# AUTH - SIMPLE REGISTRATION
# ============================================================
class RegisterView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        d = request.data
        username = d.get('username', '').strip()
        password = d.get('password', '').strip()
        email = d.get('email', '').strip()
        
        if not username or not password or not email:
            return Response({'error': 'Username, password, and email are required'}, status=400)
        
        try:
            user = User.objects.create_user(
                username=username, email=email, password=password,
                first_name=d.get('first_name', ''),
                last_name=d.get('last_name', '')
            )
            user.phone_number = d.get('phone_number', '')
            user.id_number = d.get('id_number', '')
            user.address = d.get('address', d.get('street_address', ''))
            user.account_status = 'active'
            user.save()
            
            from core.models import Role, UserRole
            role_name = d.get('role', 'Passenger')
            role, _ = Role.objects.get_or_create(role_name=role_name)
            UserRole.objects.get_or_create(user=user, role=role)
            
            return Response({'id': user.id, 'username': user.username, 'message': 'Success'}, status=201)
        except Exception as e:
            return Response({'error': str(e)}, status=400)

class UserMeView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        u = request.user
        roles = list(u.user_roles.values_list('role__role_name', flat=True))
        return Response({'id':u.id,'username':u.username,'email':u.email,'first_name':u.first_name,'last_name':u.last_name,'roles':roles})

class BusViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]
    def list(self, request): return Response(fetch_all("SELECT * FROM core_bus ORDER BY id"))
    def create(self, request):
        d=request.data; execute("INSERT INTO core_bus (bus_type,capacity,registration_number) VALUES (%s,%s,%s)",[d['bus_type'],d['capacity'],d['registration_number']])
        return Response({'status':'created'}, status=201)

class RouteViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]
    def list(self, request): return Response(fetch_all("SELECT * FROM core_route ORDER BY id"))
    def create(self, request):
        d=request.data; execute("INSERT INTO core_route (departure_location,destination,route_distance) VALUES (%s,%s,%s)",[d['departure_location'],d['destination'],d.get('route_distance',0)])
        return Response({'status':'created'}, status=201)

class ScheduleViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]
    def list(self, request):
        dep=request.GET.get('departure',''); dest=request.GET.get('destination',''); date=request.GET.get('date','')
        sql="SELECT s.*, r.departure_location, r.destination, b.registration_number, b.bus_type FROM core_schedule s JOIN core_route r ON s.route_id=r.id JOIN core_bus b ON s.bus_id=b.id WHERE 1=1"
        params=[]
        if dep: sql+=" AND r.departure_location ILIKE %s"; params.append(f'%{dep}%')
        if dest: sql+=" AND r.destination ILIKE %s"; params.append(f'%{dest}%')
        if date: sql+=" AND s.travel_date=%s"; params.append(date)
        sql+=" ORDER BY s.departure_time"
        return Response(fetch_all(sql,params))
    def create(self, request):
        d=request.data; execute("INSERT INTO core_schedule (bus_id,route_id,departure_time,arrival_time,travel_date) VALUES (%s,%s,%s,%s,%s)",[d['bus_id'],d['route_id'],d['departure_time'],d['arrival_time'],d.get('travel_date')])
        return Response({'status':'created'}, status=201)

class SeatAvailabilityView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self,request,schedule_id):
        seats=fetch_all("SELECT t.seat_number FROM core_ticket t JOIN core_booking b ON t.booking_id=b.id WHERE b.schedule_id=%s AND t.ticket_status='ACTIVE'",[schedule_id])
        taken=[s['seat_number'] for s in seats]
        return Response([{'number':s,'available':s not in taken} for s in ['A1','A2','A3','A4','A5','B1','B2','B3','B4','B5','C1','C2','C3','C4','C5','D1','D2','D3','D4','D5']])

class BookingViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]
    def list(self, request):
        u=request.user
        if u.user_roles.filter(role__role_name='Admin').exists():
            return Response(fetch_all("SELECT b.*, u.username, r.departure_location, r.destination, s.departure_time FROM core_booking b JOIN core_user u ON b.user_id=u.id JOIN core_schedule s ON b.schedule_id=s.id JOIN core_route r ON s.route_id=r.id ORDER BY b.booking_date DESC"))
        return Response(fetch_all("SELECT b.*, r.departure_location, r.destination, s.departure_time FROM core_booking b JOIN core_schedule s ON b.schedule_id=s.id JOIN core_route r ON s.route_id=r.id WHERE b.user_id=%s ORDER BY b.booking_date DESC",[u.id]))
    def create(self, request):
        d=request.data; schedule_id=d['schedule']
        avail=fetch_one("SELECT b.capacity - COUNT(t.id) as seats_left FROM core_schedule s JOIN core_bus b ON s.bus_id=b.id LEFT JOIN core_booking bk ON s.id=bk.schedule_id AND bk.booking_status!='CANCELLED' LEFT JOIN core_ticket t ON bk.id=t.booking_id AND t.ticket_status='ACTIVE' WHERE s.id=%s GROUP BY b.capacity",[schedule_id])
        if not avail or avail['seats_left']<=0: return Response({'error':'Bus fully booked'}, status=400)
        execute("INSERT INTO core_booking (user_id,schedule_id,booking_status,total_passengers,base_price,total_fare,booking_date) VALUES (%s,%s,'BOOKED',%s,%s,%s,NOW())",[request.user.id,schedule_id,d.get('total_passengers',1),d.get('base_price',200),d.get('total_fare',200)])
        bid=fetch_one("SELECT MAX(id) as id FROM core_booking")['id']
        execute("INSERT INTO core_ticket (booking_id,seat_number,ticket_status) VALUES (%s,%s,'ACTIVE')",[bid,d.get('seat_number','A1')])
        return Response({'booking_id':bid,'status':'confirmed'}, status=201)

class CancelBookingView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self,request,booking_id):
        b=fetch_one("SELECT * FROM core_booking WHERE id=%s AND user_id=%s",[booking_id,request.user.id])
        if not b: return Response({'error':'Not found'},404)
        execute("UPDATE core_booking SET booking_status='CANCELLED' WHERE id=%s",[booking_id])
        execute("UPDATE core_ticket SET ticket_status='CANCELLED' WHERE booking_id=%s",[booking_id])
        return Response({'status':'cancelled'})

class PaymentViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]
    def list(self, request):
        if request.user.user_roles.filter(role__role_name='Admin').exists(): return Response(fetch_all("SELECT * FROM core_payment ORDER BY payment_date DESC"))
        return Response(fetch_all("SELECT p.* FROM core_payment p JOIN core_booking b ON p.booking_id=b.id WHERE b.user_id=%s",[request.user.id]))
    def create(self, request):
        d=request.data; booking_id=d['booking_id']
        if not fetch_one("SELECT * FROM core_booking WHERE id=%s",[booking_id]): return Response({'error':'Booking not found'},404)
        if fetch_one("SELECT * FROM core_payment WHERE booking_id=%s",[booking_id]): return Response({'error':'Already paid'},400)
        execute("INSERT INTO core_payment (booking_id,amount,payment_method,payment_status,transaction_reference,payment_date) VALUES (%s,%s,%s,'PAID',%s,NOW())",[booking_id,d['amount'],d.get('payment_method','card'),'TXN-'+str(booking_id)])
        return Response({'status':'paid'}, status=201)

class ComplaintViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]
    def list(self, request):
        if request.user.user_roles.filter(role__role_name='Admin').exists(): return Response(fetch_all("SELECT c.*, u.username FROM core_complaint c JOIN core_user u ON c.user_id=u.id"))
        return Response(fetch_all("SELECT * FROM core_complaint WHERE user_id=%s",[request.user.id]))
    def create(self, request):
        execute("INSERT INTO core_complaint (user_id,description,resolution_status,date_submitted) VALUES (%s,%s,'open',NOW())",[request.user.id,request.data['description']])
        return Response({'status':'submitted'}, status=201)
    @action(detail=True, methods=['patch'])
    def resolve(self, request, pk=None):
        execute("UPDATE core_complaint SET resolution_status='resolved' WHERE id=%s",[pk])
        return Response({'status':'resolved'})

class AnalyticsView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        if not request.user.user_roles.filter(role__role_name='Admin').exists(): return Response({'error':'Forbidden'},403)
        popular=fetch_all("SELECT r.departure_location, r.destination, COUNT(b.id) as booking_count FROM core_route r LEFT JOIN core_schedule s ON r.id=s.route_id LEFT JOIN core_booking b ON s.id=b.schedule_id AND b.booking_status='BOOKED' GROUP BY r.id,r.departure_location,r.destination HAVING COUNT(b.id)>0 ORDER BY booking_count DESC LIMIT 5")
        revenue=fetch_one("SELECT COALESCE(SUM(amount),0) as total FROM core_payment WHERE payment_status='PAID'")
        return Response({'popular_routes':popular,'total_revenue':revenue['total'] if revenue else 0})

class BookingReportView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        if not request.user.user_roles.filter(role__role_name='Admin').exists(): return Response({'error':'Forbidden'},403)
        return Response(fetch_all("SELECT b.id, u.username, r.departure_location, r.destination, s.departure_time, b.booking_status, b.total_fare, b.booking_date FROM core_booking b JOIN core_user u ON b.user_id=u.id JOIN core_schedule s ON b.schedule_id=s.id JOIN core_route r ON s.route_id=r.id ORDER BY b.booking_date DESC"))
