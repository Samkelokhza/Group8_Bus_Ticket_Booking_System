-- ============================================
-- BUS TICKET BOOKING SYSTEM - SCHEMA
-- Aligned with ER Diagram & Project Requirements
-- PostgreSQL 18
-- ============================================

BEGIN;

-- 1. Role Table
CREATE TABLE role (
    id SERIAL PRIMARY KEY,
    role_name VARCHAR(20) NOT NULL UNIQUE,
    description TEXT NOT NULL
);

-- 2. Users Table
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    surname VARCHAR(50) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    password_hash TEXT NOT NULL,
    account_status VARCHAR(10) DEFAULT 'ACTIVE' CHECK (account_status IN ('ACTIVE', 'INACTIVE')),
    id_number VARCHAR(13) NOT NULL UNIQUE,
    email VARCHAR(50) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    address VARCHAR(100) NOT NULL
);

-- 3. User_Role Bridge Table (Many-to-Many)
CREATE TABLE user_role (
    user_id INT NOT NULL,
    role_id INT NOT NULL,
    assigned_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, role_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES role(id) ON DELETE CASCADE
);

-- 4. Bus Table
CREATE TABLE bus (
    id SERIAL PRIMARY KEY,
    bus_type VARCHAR(50) NOT NULL DEFAULT 'Standard',
    capacity INT NOT NULL CHECK (capacity > 0),
    registration_number VARCHAR(50) NOT NULL UNIQUE,
    is_active BOOLEAN DEFAULT TRUE
);

-- 5. Route Table
CREATE TABLE route (
    route_id SERIAL PRIMARY KEY,
    departure_location VARCHAR(100) NOT NULL,
    destination VARCHAR(100) NOT NULL,
    route_distance DECIMAL(6,2) NOT NULL DEFAULT 0,
    estimated_travel_time VARCHAR(50) NOT NULL
);

-- 6. Schedule Table
CREATE TABLE schedule (
    id SERIAL PRIMARY KEY,
    departure_time TIMESTAMP NOT NULL,
    arrival_time TIMESTAMP NOT NULL,
    travel_date DATE NOT NULL DEFAULT CURRENT_DATE,
    status VARCHAR(20) DEFAULT 'scheduled',
    bus_id INT,
    route_id INT,
    CONSTRAINT valid_times CHECK (arrival_time > departure_time),
    FOREIGN KEY (bus_id) REFERENCES bus(id) ON DELETE SET NULL,
    FOREIGN KEY (route_id) REFERENCES route(route_id) ON DELETE SET NULL
);

-- 7. Booking Table
CREATE TABLE booking (
    booking_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    schedule_id INT NOT NULL,
    booking_status VARCHAR(10) DEFAULT 'PENDING' CHECK (booking_status IN ('BOOKED', 'PENDING', 'CANCELLED')),
    booking_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total_passengers INT DEFAULT 1,
    base_price DECIMAL(8,2) DEFAULT 0,
    total_fare DECIMAL(8,2) DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (schedule_id) REFERENCES schedule(id) ON DELETE CASCADE
);

-- 8. Ticket Table
CREATE TABLE ticket (
    ticket_id SERIAL PRIMARY KEY,
    booking_id INT NOT NULL,
    seat_number VARCHAR(20) NOT NULL,
    ticket_status VARCHAR(15) DEFAULT 'ACTIVE' CHECK (ticket_status IN ('ACTIVE', 'USED', 'CANCELLED')),
    qr_code_data TEXT,
    FOREIGN KEY (booking_id) REFERENCES booking(booking_id) ON DELETE CASCADE,
    UNIQUE(booking_id, seat_number)
);

-- 9. Payment Table
CREATE TABLE payment (
    payment_id SERIAL PRIMARY KEY,
    booking_id INT NOT NULL UNIQUE,
    amount DECIMAL(8,2) NOT NULL CHECK (amount > 0),
    payment_method VARCHAR(30) NOT NULL DEFAULT 'card',
    payment_status VARCHAR(10) DEFAULT 'PENDING' CHECK (payment_status IN ('PAID', 'PENDING', 'FAILED')),
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    transaction_reference VARCHAR(100),
    FOREIGN KEY (booking_id) REFERENCES booking(booking_id) ON DELETE CASCADE
);

-- 10. Complaint Table
CREATE TABLE complaint (
    complaint_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    booking_id INT,
    description TEXT NOT NULL,
    date_submitted TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolution_status VARCHAR(15) DEFAULT 'PENDING' CHECK (resolution_status IN ('RESOLVED', 'PENDING', 'UNRESOLVED')),
    date_resolved TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (booking_id) REFERENCES booking(booking_id) ON DELETE SET NULL
);

-- 11. Next of Kin Table (Weak Entity)
CREATE TABLE next_kin (
    next_of_kin_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    kin_name VARCHAR(50) NOT NULL,
    contact VARCHAR(50) NOT NULL,
    relationship VARCHAR(30),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Indexes for Performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_id_number ON users(id_number);
CREATE INDEX idx_booking_user ON booking(user_id);
CREATE INDEX idx_booking_schedule ON booking(schedule_id);
CREATE INDEX idx_booking_date ON booking(booking_date);
CREATE INDEX idx_schedule_departure ON schedule(departure_time);
CREATE INDEX idx_schedule_route ON schedule(route_id);
CREATE INDEX idx_schedule_bus ON schedule(bus_id);
CREATE INDEX idx_ticket_booking ON ticket(booking_id);
CREATE INDEX idx_payment_booking ON payment(booking_id);
CREATE INDEX idx_complaint_user ON complaint(user_id);
CREATE INDEX idx_complaint_status ON complaint(resolution_status);
CREATE INDEX idx_next_kin_user ON next_kin(user_id);

COMMIT;