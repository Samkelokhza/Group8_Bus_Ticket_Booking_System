-- ============================================
-- BUS TICKET BOOKING SYSTEM - VIEWS
-- Simplified data access for reports & dashboards
-- ============================================

-- View 1: Booking Overview (all booking details in one view)
CREATE OR REPLACE VIEW v_booking_overview AS
SELECT 
    b.booking_id,
    u.first_name || ' ' || u.surname AS passenger_name,
    u.email AS passenger_email,
    r.departure_location || ' → ' || r.destination AS route,
    s.departure_time,
    s.arrival_time,
    s.travel_date,
    bus.registration_number AS bus_reg,
    bus.bus_type,
    t.seat_number,
    t.ticket_status,
    COALESCE(p.amount, 0) AS payment_amount,
    COALESCE(p.payment_status, 'UNPAID') AS payment_status,
    b.booking_status,
    b.booking_date
FROM booking b
JOIN users u ON b.user_id = u.user_id
JOIN schedule s ON b.schedule_id = s.id
JOIN route r ON s.route_id = r.route_id
JOIN bus ON s.bus_id = bus.id
LEFT JOIN ticket t ON b.booking_id = t.booking_id
LEFT JOIN payment p ON b.booking_id = p.booking_id;

-- View 2: Available Seats (seats remaining per schedule)
CREATE OR REPLACE VIEW v_available_seats AS
SELECT 
    s.id AS schedule_id,
    r.departure_location,
    r.destination,
    s.departure_time,
    s.travel_date,
    bus.registration_number,
    bus.bus_type,
    bus.capacity,
    COUNT(t.ticket_id) FILTER (WHERE t.ticket_status = 'ACTIVE') AS seats_booked,
    bus.capacity - COUNT(t.ticket_id) FILTER (WHERE t.ticket_status = 'ACTIVE') AS seats_available
FROM schedule s
JOIN route r ON s.route_id = r.route_id
JOIN bus ON s.bus_id = bus.id
LEFT JOIN booking b ON s.id = b.schedule_id AND b.booking_status = 'BOOKED'
LEFT JOIN ticket t ON b.booking_id = t.booking_id AND t.ticket_status = 'ACTIVE'
GROUP BY s.id, r.departure_location, r.destination, s.departure_time, s.travel_date, 
         bus.registration_number, bus.bus_type, bus.capacity;

-- View 3: Revenue Summary (daily revenue report)
CREATE OR REPLACE VIEW v_revenue_summary AS
SELECT 
    DATE(payment_date) AS transaction_date,
    payment_method,
    COUNT(*) AS transaction_count,
    SUM(amount) AS total_revenue,
    AVG(amount) AS average_transaction,
    MIN(amount) AS min_transaction,
    MAX(amount) AS max_transaction
FROM payment
WHERE payment_status = 'PAID'
GROUP BY DATE(payment_date), payment_method
ORDER BY transaction_date DESC;

-- View 4: User Roles Summary
CREATE OR REPLACE VIEW v_user_roles AS
SELECT 
    u.user_id,
    u.first_name || ' ' || u.surname AS full_name,
    u.email,
    u.phone_number,
    u.account_status,
    STRING_AGG(r.role_name, ', ' ORDER BY r.role_name) AS roles,
    COUNT(b.booking_id) AS total_bookings
FROM users u
LEFT JOIN user_role ur ON u.user_id = ur.user_id
LEFT JOIN role r ON ur.role_id = r.id
LEFT JOIN booking b ON u.user_id = b.user_id
GROUP BY u.user_id, u.first_name, u.surname, u.email, u.phone_number, u.account_status;

-- View 5: Complaint Summary
CREATE OR REPLACE VIEW v_complaint_summary AS
SELECT 
    c.complaint_id,
    u.first_name || ' ' || u.surname AS complainant,
    u.email,
    c.description,
    c.date_submitted,
    c.resolution_status,
    c.date_resolved,
    b.booking_id,
    r.departure_location || ' → ' || r.destination AS related_route,
    CASE 
        WHEN c.date_resolved IS NOT NULL THEN 
            EXTRACT(DAY FROM (c.date_resolved - c.date_submitted)) || ' days'
        ELSE 'Not resolved yet'
    END AS resolution_time
FROM complaint c
JOIN users u ON c.user_id = u.user_id
LEFT JOIN booking b ON c.booking_id = b.booking_id
LEFT JOIN schedule s ON b.schedule_id = s.id
LEFT JOIN route r ON s.route_id = r.route_id;

-- View 6: Bus Occupancy Rate
CREATE OR REPLACE VIEW v_bus_occupancy AS
SELECT 
    bus.id AS bus_id,
    bus.registration_number,
    bus.bus_type,
    bus.capacity,
    COUNT(DISTINCT t.ticket_id) FILTER (WHERE t.ticket_status = 'ACTIVE') AS total_passengers,
    ROUND(
        (COUNT(DISTINCT t.ticket_id) FILTER (WHERE t.ticket_status = 'ACTIVE') * 100.0) / 
        NULLIF(bus.capacity, 0), 2
    ) AS occupancy_percentage
FROM bus
LEFT JOIN schedule s ON bus.id = s.bus_id
LEFT JOIN booking b ON s.id = b.schedule_id AND b.booking_status = 'BOOKED'
LEFT JOIN ticket t ON b.booking_id = t.booking_id AND t.ticket_status = 'ACTIVE'
GROUP BY bus.id, bus.registration_number, bus.bus_type, bus.capacity;