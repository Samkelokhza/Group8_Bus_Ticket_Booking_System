-- ============================================
-- RUBRIC SQL QUERIES
-- All required query types for CMPG 311
-- ============================================

-- 1. LIKE Operator - Search routes by destination
SELECT * FROM route 
WHERE destination LIKE '%town%' 
   OR departure_location LIKE '%burg%';

-- 2. AND/OR Operators - Filter buses by type or capacity
SELECT * FROM bus 
WHERE (bus_type = 'Luxury' OR capacity > 50) 
  AND is_active = TRUE;

-- 3. Sorting Operations - Recent bookings first
SELECT b.booking_id, u.first_name, u.surname, r.departure_location, r.destination, b.booking_date
FROM booking b
JOIN users u ON b.user_id = u.user_id
JOIN schedule s ON b.schedule_id = s.id
JOIN route r ON s.route_id = r.route_id
ORDER BY b.booking_date DESC
LIMIT 10;

-- 4. Aggregate Functions - Payment statistics
SELECT 
    COUNT(*) AS total_transactions,
    SUM(amount) AS total_revenue,
    AVG(amount) AS average_transaction,
    MAX(amount) AS largest_payment,
    MIN(amount) AS smallest_payment
FROM payment 
WHERE payment_status = 'PAID';

-- 5. GROUP BY with HAVING - Popular routes (>1 booking)
SELECT 
    r.departure_location,
    r.destination,
    r.route_distance,
    COUNT(b.booking_id) AS booking_count
FROM route r
LEFT JOIN schedule s ON r.route_id = s.route_id
LEFT JOIN booking b ON s.id = b.schedule_id
GROUP BY r.route_id, r.departure_location, r.destination, r.route_distance
HAVING COUNT(b.booking_id) > 1
ORDER BY booking_count DESC;

-- 6. JOIN Operations - Complete booking details
SELECT 
    b.booking_id,
    u.first_name || ' ' || u.surname AS passenger,
    u.email,
    r.departure_location AS origin,
    r.destination,
    s.departure_time,
    s.arrival_time,
    bus.registration_number AS bus,
    bus.bus_type,
    t.seat_number,
    t.ticket_status,
    p.amount AS fare,
    p.payment_method,
    p.payment_status
FROM booking b
JOIN users u ON b.user_id = u.user_id
JOIN schedule s ON b.schedule_id = s.id
JOIN route r ON s.route_id = r.route_id
JOIN bus ON s.bus_id = bus.id
LEFT JOIN ticket t ON b.booking_id = t.booking_id
LEFT JOIN payment p ON b.booking_id = p.booking_id;

-- 7. Subquery - Users who have never booked
SELECT user_id, first_name, surname, email 
FROM users 
WHERE user_id NOT IN (
    SELECT DISTINCT user_id FROM booking
);

-- 8. Date Functions - Upcoming departures in next 7 days
SELECT 
    r.departure_location,
    r.destination,
    s.departure_time,
    s.travel_date,
    EXTRACT(DAY FROM s.departure_time - CURRENT_TIMESTAMP) AS days_until_departure,
    bus.registration_number,
    bus.bus_type
FROM schedule s
JOIN route r ON s.route_id = r.route_id
JOIN bus ON s.bus_id = bus.id
WHERE s.departure_time BETWEEN CURRENT_TIMESTAMP AND CURRENT_TIMESTAMP + INTERVAL '7 days'
ORDER BY s.departure_time;

-- 9. Variables & Character Functions - Format route info
SELECT 
    route_id,
    UPPER(departure_location) AS origin_upper,
    LOWER(destination) AS destination_lower,
    CONCAT(departure_location, ' to ', destination) AS route_description,
    LENGTH(departure_location) AS origin_length,
    estimated_travel_time
FROM route;

-- 10. Rounding & Truncation - Bus capacity calculations
SELECT 
    registration_number,
    bus_type,
    capacity,
    ROUND(capacity * 0.85) AS safe_capacity_85_percent,
    TRUNC(capacity * 0.5) AS half_capacity,
    CEIL(capacity * 0.75) AS rounded_up_75_percent,
    FLOOR(capacity * 0.25) AS rounded_down_25_percent
FROM bus
WHERE is_active = TRUE;

-- 11. Window Functions - Booking ranking per route
SELECT 
    r.departure_location,
    r.destination,
    u.first_name || ' ' || u.surname AS passenger,
    b.booking_date,
    ROW_NUMBER() OVER (PARTITION BY r.route_id ORDER BY b.booking_date) AS booking_rank
FROM booking b
JOIN users u ON b.user_id = u.user_id
JOIN schedule s ON b.schedule_id = s.id
JOIN route r ON s.route_id = r.route_id;

-- 12. CASE Statement - Booking status labels
SELECT 
    booking_id,
    booking_status,
    CASE 
        WHEN booking_status = 'BOOKED' THEN 'Confirmed'
        WHEN booking_status = 'PENDING' THEN 'Awaiting Payment'
        WHEN booking_status = 'CANCELLED' THEN 'Cancelled'
        ELSE 'Unknown'
    END AS status_label,
    total_fare
FROM booking;

-- 13. UNION Query - All contact information
SELECT first_name || ' ' || surname AS name, email AS contact, 'Email' AS contact_type FROM users
UNION ALL
SELECT kin_name AS name, contact, 'Next of Kin' AS contact_type FROM next_kin
UNION ALL
SELECT first_name || ' ' || surname AS name, phone_number AS contact, 'Phone' AS contact_type FROM users
ORDER BY contact_type, name;

-- 14. EXISTS - Routes that have schedules
SELECT route_id, departure_location, destination
FROM route r
WHERE EXISTS (
    SELECT 1 FROM schedule s WHERE s.route_id = r.route_id
);

-- 15. CTE - Monthly booking summary
WITH monthly_bookings AS (
    SELECT 
        DATE_TRUNC('month', booking_date) AS month,
        COUNT(*) AS total_bookings,
        SUM(total_fare) AS monthly_revenue
    FROM booking
    WHERE booking_status = 'BOOKED'
    GROUP BY DATE_TRUNC('month', booking_date)
)
SELECT 
    month,
    total_bookings,
    monthly_revenue,
    ROUND(monthly_revenue / NULLIF(total_bookings, 0), 2) AS avg_fare_per_booking
FROM monthly_bookings
ORDER BY month DESC;