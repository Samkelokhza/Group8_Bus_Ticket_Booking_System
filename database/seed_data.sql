-- ============================================
-- BUS TICKET BOOKING SYSTEM - SAMPLE DATA
-- South African Routes & Test Users
-- ============================================

BEGIN;

-- Insert Roles
INSERT INTO role (role_name, description) VALUES
('Passenger', 'Regular bus traveler who can book tickets and submit complaints'),
('Admin', 'System administrator with full access to manage buses, routes, and schedules');

-- Insert Users (password_hash is 'pass123' for all test users)
INSERT INTO users (first_name, surname, phone_number, password_hash, account_status, id_number, email, address) VALUES
('John', 'Doe', '0825550101', 'pbkdf2_sha256$720000$test123', 'ACTIVE', '9001015001087', 'john@test.com', '123 Main Street, Johannesburg'),
('Sarah', 'Smith', '0835550102', 'pbkdf2_sha256$720000$test123', 'ACTIVE', '8502026002089', 'sarah@test.com', '456 Oak Avenue, Cape Town'),
('Admin', 'User', '0115550100', 'pbkdf2_sha256$720000$test123', 'ACTIVE', '8003037003090', 'admin@bus.com', '789 Admin Road, Pretoria'),
('Thabo', 'Molefe', '0845550103', 'pbkdf2_sha256$720000$test123', 'ACTIVE', '9504048004101', 'thabo@test.com', '321 Ubuntu Street, Durban'),
('Lerato', 'Khumalo', '0855550104', 'pbkdf2_sha256$720000$test123', 'ACTIVE', '9205059005112', 'lerato@test.com', '654 Freedom Way, Bloemfontein');

-- Assign Roles
INSERT INTO user_role (user_id, role_id) VALUES
(1, 1),  -- John = Passenger
(2, 1),  -- Sarah = Passenger
(3, 2),  -- Admin = Admin
(4, 1),  -- Thabo = Passenger
(5, 1);  -- Lerato = Passenger

-- Insert Buses
INSERT INTO bus (bus_type, capacity, registration_number, is_active) VALUES
('Luxury', 50, 'BUS-001-GP', TRUE),
('Standard', 65, 'BUS-002-WC', TRUE),
('VIP', 36, 'BUS-003-KZN', TRUE),
('Standard', 65, 'BUS-004-FS', TRUE),
('Luxury', 50, 'BUS-005-EC', TRUE);

-- Insert Routes (South African routes)
INSERT INTO route (departure_location, destination, route_distance, estimated_travel_time) VALUES
('Johannesburg', 'Cape Town', 1400, '14 hours'),
('Johannesburg', 'Durban', 570, '6 hours'),
('Cape Town', 'Port Elizabeth', 770, '8 hours'),
('Pretoria', 'Bloemfontein', 420, '5 hours'),
('Durban', 'Johannesburg', 570, '6 hours'),
('Johannesburg', 'Polokwane', 320, '4 hours'),
('Cape Town', 'Kimberley', 960, '10 hours');

-- Insert Schedules
INSERT INTO schedule (departure_time, arrival_time, travel_date, status, bus_id, route_id) VALUES
('2026-05-14 08:00:00', '2026-05-14 22:00:00', '2026-05-14', 'scheduled', 1, 1),
('2026-05-14 06:00:00', '2026-05-14 12:00:00', '2026-05-14', 'scheduled', 2, 2),
('2026-05-15 10:00:00', '2026-05-15 18:00:00', '2026-05-15', 'scheduled', 3, 3),
('2026-05-15 07:00:00', '2026-05-15 12:00:00', '2026-05-15', 'scheduled', 4, 4),
('2026-05-16 09:00:00', '2026-05-16 15:00:00', '2026-05-16', 'scheduled', 1, 5),
('2026-05-16 11:00:00', '2026-05-16 15:00:00', '2026-05-16', 'scheduled', 2, 6);

-- Insert Bookings
INSERT INTO booking (user_id, schedule_id, booking_status, total_passengers, base_price, total_fare) VALUES
(1, 1, 'BOOKED', 2, 350.00, 700.00),
(2, 2, 'BOOKED', 1, 200.00, 200.00),
(4, 3, 'BOOKED', 3, 280.00, 840.00),
(1, 4, 'PENDING', 1, 180.00, 180.00),
(5, 5, 'BOOKED', 1, 200.00, 200.00),
(2, 6, 'BOOKED', 2, 150.00, 300.00);

-- Insert Tickets
INSERT INTO ticket (booking_id, seat_number, ticket_status, qr_code_data) VALUES
(1, 'A1', 'ACTIVE', 'TICKET-B1-A1-JHB-CPT'),
(1, 'A2', 'ACTIVE', 'TICKET-B1-A2-JHB-CPT'),
(2, 'B3', 'ACTIVE', 'TICKET-B2-B3-JHB-DBN'),
(3, 'C1', 'ACTIVE', 'TICKET-B3-C1-CPT-PE'),
(3, 'C2', 'ACTIVE', 'TICKET-B3-C2-CPT-PE'),
(3, 'C3', 'ACTIVE', 'TICKET-B3-C3-CPT-PE'),
(5, 'D5', 'ACTIVE', 'TICKET-B5-D5-DBN-JHB'),
(6, 'E1', 'ACTIVE', 'TICKET-B6-E1-JHB-PLK'),
(6, 'E2', 'ACTIVE', 'TICKET-B6-E2-JHB-PLK');

-- Insert Payments
INSERT INTO payment (booking_id, amount, payment_method, payment_status, transaction_reference) VALUES
(1, 700.00, 'card', 'PAID', 'TXN-20260514-001'),
(2, 200.00, 'eft', 'PAID', 'TXN-20260514-002'),
(3, 840.00, 'card', 'PAID', 'TXN-20260515-003'),
(5, 200.00, 'mock_card', 'PAID', 'MOCK-5'),
(6, 300.00, 'eft', 'PENDING', 'TXN-20260516-004');

-- Insert Complaints
INSERT INTO complaint (user_id, booking_id, description, resolution_status) VALUES
(1, 1, 'Bus was 30 minutes late departing from Johannesburg', 'PENDING'),
(2, 2, 'Air conditioning was not working during the trip', 'RESOLVED'),
(4, 3, 'Seat was uncomfortable for the long journey', 'UNRESOLVED');

-- Insert Next of Kin
INSERT INTO next_kin (user_id, kin_name, contact, relationship) VALUES
(1, 'Jane Doe', '0825550201', 'Spouse'),
(2, 'Mike Smith', '0835550202', 'Brother'),
(4, 'Grace Molefe', '0845550203', 'Mother'),
(5, 'David Khumalo', '0855550204', 'Father');

COMMIT;