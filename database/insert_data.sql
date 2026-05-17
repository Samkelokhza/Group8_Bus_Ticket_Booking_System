-- =====================================================================
-- CMPG 311 | Group 8 | Bus Ticket Booking System
-- INSERT SAMPLE DATA - Matches your exact table structure
-- Run this FIRST before all other queries
-- =====================================================================

-- =====================================================================
-- 1. INSERT ROLES (Admin + Passenger only)
-- =====================================================================
INSERT INTO core_role (role_name, description) VALUES
('Passenger', 'Regular bus traveler who can book tickets and submit complaints'),
('Admin', 'System administrator with full access to manage system');

-- =====================================================================
-- 2. INSERT USERS (10 users: 8 passengers, 2 admins)
-- =====================================================================
INSERT INTO core_user (username, email, password, first_name, last_name, surname, phone_number, id_number, address, account_status, is_active, is_staff, is_superuser, date_joined, registration_date) VALUES
('john_doe', 'john@email.co.za', 'pbkdf2_sha256$hash$pass123', 'John', 'Doe', 'Doe', '0825550101', '9001015009081', '123 Main Street, Sandton, Johannesburg, Gauteng, 2196, South Africa', 'active', TRUE, FALSE, FALSE, NOW(), NOW()),
('sarah_khumalo', 'sarah@email.co.za', 'pbkdf2_sha256$hash$pass123', 'Sarah', 'Khumalo', 'Khumalo', '0835550102', '8502026002089', '456 Oak Avenue, Rondebosch, Cape Town, Western Cape, 7700, South Africa', 'active', TRUE, FALSE, FALSE, NOW(), NOW()),
('thabo_molefe', 'thabo@email.co.za', 'pbkdf2_sha256$hash$pass123', 'Thabo', 'Molefe', 'Molefe', '0845550103', '9504048004101', '321 Ubuntu Street, Berea, Durban, KwaZulu-Natal, 4001, South Africa', 'active', TRUE, FALSE, FALSE, NOW(), NOW()),
('lerato_mahlangu', 'lerato@email.co.za', 'pbkdf2_sha256$hash$pass123', 'Lerato', 'Mahlangu', 'Mahlangu', '0855550104', '9205059005112', '654 Freedom Way, Westdene, Bloemfontein, Free State, 9301, South Africa', 'active', TRUE, FALSE, FALSE, NOW(), NOW()),
('sipho_dlamini', 'sipho@email.co.za', 'pbkdf2_sha256$hash$pass123', 'Sipho', 'Dlamini', 'Dlamini', '0865550105', '8807015009087', '789 River Road, Hatfield, Pretoria, Gauteng, 0028, South Africa', 'active', TRUE, FALSE, FALSE, NOW(), NOW()),
('nomsa_zulu', 'nomsa@email.co.za', 'pbkdf2_sha256$hash$pass123', 'Nomsa', 'Zulu', 'Zulu', '0875550106', '9108026010088', '101 Hill Street, Mowbray, Cape Town, Western Cape, 7700, South Africa', 'active', TRUE, FALSE, FALSE, NOW(), NOW()),
('admin_one', 'admin1@busticket.co.za', 'pbkdf2_sha256$hash$pass123', 'Admin', 'One', 'One', '0115550100', '8001015009001', '1 Admin Road, Sandton, Johannesburg, Gauteng, 2196, South Africa', 'active', TRUE, TRUE, TRUE, NOW(), NOW()),
('admin_two', 'admin2@busticket.co.za', 'pbkdf2_sha256$hash$pass123', 'Admin', 'Two', 'Two', '0115550200', '8002026009002', '2 Admin Road, Sandton, Johannesburg, Gauteng, 2196, South Africa', 'active', TRUE, TRUE, TRUE, NOW(), NOW()),
('peter_williams', 'peter@email.co.za', 'pbkdf2_sha256$hash$pass123', 'Peter', 'Williams', 'Williams', '0885550107', '9503015009073', '14 Elm Street, Sunnyside, Pretoria, Gauteng, 0002, South Africa', 'active', TRUE, FALSE, FALSE, NOW(), NOW()),
('grace_lee', 'grace@email.co.za', 'pbkdf2_sha256$hash$pass123', 'Grace', 'Lee', 'Lee', '0895550108', '9205015009075', '16 Bay Avenue, Umhlanga, Durban, KwaZulu-Natal, 4320, South Africa', 'active', TRUE, FALSE, FALSE, NOW(), NOW());

-- =====================================================================
-- 3. INSERT USER ROLES (Passengers = role 1, Admins = role 2)
-- =====================================================================
INSERT INTO core_userrole (user_id, role_id, assigned_date) VALUES
(1, 1, NOW()), (2, 1, NOW()), (3, 1, NOW()), (4, 1, NOW()), (5, 1, NOW()),
(6, 1, NOW()), (9, 1, NOW()), (10, 1, NOW()),
(7, 2, NOW()), (8, 2, NOW());

-- =====================================================================
-- 4. INSERT BUSES (5 buses)
-- =====================================================================
INSERT INTO core_bus (bus_type, capacity, registration_number) VALUES
('Luxury Coach', 50, 'BUS-001-GP'),
('Standard Coach', 40, 'BUS-002-WC'),
('Double Decker', 60, 'BUS-003-KZN'),
('VIP Express', 36, 'BUS-004-FS'),
('Economy', 65, 'BUS-005-EC');

-- =====================================================================
-- 5. INSERT ROUTES (7 South African routes)
-- =====================================================================
INSERT INTO core_route (departure_location, destination, route_distance, estimated_travel_time) VALUES
('Johannesburg', 'Cape Town', 1400.00, '14 hours'),
('Johannesburg', 'Durban', 570.00, '6 hours'),
('Pretoria', 'Bloemfontein', 420.00, '5 hours'),
('Cape Town', 'Port Elizabeth', 770.00, '8 hours'),
('Durban', 'Johannesburg', 570.00, '6 hours'),
('Johannesburg', 'Polokwane', 320.00, '4 hours'),
('Cape Town', 'Kimberley', 960.00, '10 hours');

-- =====================================================================
-- 6. INSERT SCHEDULES (7 upcoming trips)
-- =====================================================================
INSERT INTO core_schedule (bus_id, route_id, departure_time, arrival_time, travel_date) VALUES
(1, 1, NOW() + INTERVAL '1 day 6 hours', NOW() + INTERVAL '1 day 20 hours', (NOW() + INTERVAL '1 day')::DATE),
(2, 2, NOW() + INTERVAL '1 day 8 hours', NOW() + INTERVAL '1 day 14 hours', (NOW() + INTERVAL '1 day')::DATE),
(3, 3, NOW() + INTERVAL '2 days 7 hours', NOW() + INTERVAL '2 days 12 hours', (NOW() + INTERVAL '2 days')::DATE),
(4, 4, NOW() + INTERVAL '2 days 10 hours', NOW() + INTERVAL '2 days 18 hours', (NOW() + INTERVAL '2 days')::DATE),
(5, 5, NOW() + INTERVAL '3 days 6 hours', NOW() + INTERVAL '3 days 12 hours', (NOW() + INTERVAL '3 days')::DATE),
(1, 6, NOW() + INTERVAL '3 days 9 hours', NOW() + INTERVAL '3 days 13 hours', (NOW() + INTERVAL '3 days')::DATE),
(2, 7, NOW() + INTERVAL '4 days 8 hours', NOW() + INTERVAL '4 days 18 hours', (NOW() + INTERVAL '4 days')::DATE);

-- =====================================================================
-- 7. INSERT BOOKINGS (15 bookings: BOOKED, PENDING, CANCELLED)
-- =====================================================================
INSERT INTO core_booking (user_id, schedule_id, booking_status, booking_date, total_passengers, base_price, total_fare) VALUES
(1, 1, 'BOOKED', NOW(), 2, 350.00, 700.00),
(2, 2, 'BOOKED', NOW(), 1, 200.00, 200.00),
(3, 3, 'BOOKED', NOW(), 3, 280.00, 840.00),
(4, 4, 'PENDING', NOW(), 1, 180.00, 180.00),
(5, 5, 'BOOKED', NOW(), 1, 200.00, 200.00),
(6, 6, 'BOOKED', NOW(), 2, 150.00, 300.00),
(9, 1, 'BOOKED', NOW(), 1, 350.00, 350.00),
(10, 2, 'BOOKED', NOW(), 1, 200.00, 200.00),
(1, 3, 'CANCELLED', NOW(), 1, 280.00, 280.00),
(2, 4, 'BOOKED', NOW(), 2, 180.00, 360.00),
(3, 5, 'BOOKED', NOW(), 1, 200.00, 200.00),
(4, 6, 'PENDING', NOW(), 1, 150.00, 150.00),
(5, 7, 'BOOKED', NOW(), 3, 450.00, 1350.00),
(6, 1, 'BOOKED', NOW(), 1, 350.00, 350.00),
(9, 2, 'CANCELLED', NOW(), 1, 200.00, 200.00);

-- =====================================================================
-- 8. INSERT TICKETS (18 tickets)
-- =====================================================================
INSERT INTO core_ticket (booking_id, seat_number, ticket_status) VALUES
(1, 'A1', 'ACTIVE'), (1, 'A2', 'ACTIVE'),
(2, 'B3', 'ACTIVE'),
(3, 'C1', 'ACTIVE'), (3, 'C2', 'ACTIVE'), (3, 'C3', 'ACTIVE'),
(5, 'D5', 'ACTIVE'),
(6, 'E1', 'ACTIVE'), (6, 'E2', 'ACTIVE'),
(7, 'A3', 'ACTIVE'),
(8, 'B4', 'ACTIVE'),
(10, 'D1', 'ACTIVE'), (10, 'D2', 'ACTIVE'),
(11, 'E3', 'ACTIVE'),
(13, 'F1', 'ACTIVE'), (13, 'F2', 'ACTIVE'), (13, 'F3', 'ACTIVE'),
(14, 'A4', 'ACTIVE');

-- =====================================================================
-- 9. INSERT PAYMENTS (11 payments)
-- =====================================================================
INSERT INTO core_payment (booking_id, amount, payment_method, payment_status, payment_date, transaction_reference) VALUES
(1, 700.00, 'CARD', 'PAID', NOW(), 'TXN-001'),
(2, 200.00, 'EFT', 'PAID', NOW(), 'TXN-002'),
(3, 840.00, 'CARD', 'PAID', NOW(), 'TXN-003'),
(5, 200.00, 'CASH', 'PAID', NOW(), 'TXN-005'),
(6, 300.00, 'CARD', 'PAID', NOW(), 'TXN-006'),
(7, 350.00, 'CARD', 'PAID', NOW(), 'TXN-007'),
(8, 200.00, 'EFT', 'PAID', NOW(), 'TXN-008'),
(10, 360.00, 'CARD', 'PAID', NOW(), 'TXN-010'),
(11, 200.00, 'EFT', 'PAID', NOW(), 'TXN-011'),
(13, 1350.00, 'CARD', 'PAID', NOW(), 'TXN-013'),
(14, 350.00, 'CARD', 'PAID', NOW(), 'TXN-014');

-- =====================================================================
-- 10. INSERT COMPLAINTS (6 complaints)
-- =====================================================================
INSERT INTO core_complaint (user_id, booking_id, description, date_submitted, resolution_status) VALUES
(1, 1, 'Bus was 30 minutes late departing from Johannesburg. No communication from staff.', NOW() - INTERVAL '2 days', 'open'),
(2, 2, 'Air conditioning was not working during the entire trip to Durban.', NOW() - INTERVAL '5 days', 'resolved'),
(3, 3, 'Seat was uncomfortable and the bus was overcrowded.', NOW() - INTERVAL '1 day', 'open'),
(5, 5, 'Trip was cancelled without prior notice. Requesting full refund.', NOW() - INTERVAL '3 days', 'open'),
(6, 6, 'Bus arrived 3 hours late and I missed my connecting transport.', NOW() - INTERVAL '7 days', 'resolved'),
(9, 7, 'The driver was very professional but the WiFi did not work during the trip.', NOW(), 'open');

-- =====================================================================
-- 11. INSERT NEXT OF KIN (6 records)
-- =====================================================================
INSERT INTO core_nextofkin (user_id, kin_fullname, contact_number, kin_name) VALUES
(1, 'Jane Doe', '0825550201', 'Jane Doe'),
(2, 'Peter Khumalo', '0835550202', 'Peter Khumalo'),
(3, 'Grace Molefe', '0845550203', 'Grace Molefe'),
(4, 'David Mahlangu', '0855550204', 'David Mahlangu'),
(5, 'Thandi Dlamini', '0865550205', 'Thandi Dlamini'),
(6, 'Bongani Zulu', '0875550206', 'Bongani Zulu');