-- =====================================================================
-- CMPG 311 | Group 8
-- Bus Ticket Booking System
-- Phase 3: Physical Database Design
-- Database: PostgreSQL
-- =====================================================================
-- FIXES APPLIED (QA Review):
--   FIX 1 (Schedule table)  : Removed NOT NULL from bus_id and route_id
--                             because ON DELETE SET NULL cannot set a
--                             NOT NULL column to NULL. Changed to
--                             ON DELETE RESTRICT to keep NOT NULL and
--                             prevent accidental orphan schedules.
--   FIX 2 (Payment data)    : booking_id 13 amount corrected from
--                             310.00 to 500.00 to match schedule 5
--                             ticket_price and booking total_fare.
--   FIX 3 (Ticket data)     : booking_id 6 seat changed from 'B3' to
--                             'B4' to avoid sharing a physical seat
--                             with booking_id 19 on the same schedule.
--   FIX 4 (Users data)      : Added one SUSPENDED user (user 21) so
--                             the SUSPENDED status in the CHECK
--                             constraint is exercised by sample data.
--   FIX 5 (UserRole data)   : Added role assignment for user 21.
-- =====================================================================


-- =====================================================================
-- SECTION 1: RESET
-- Drop everything cleanly before recreating. Tables are dropped in
-- reverse order so foreign keys do not block the operation.
-- =====================================================================

DROP TABLE IF EXISTS BookingStatusLog CASCADE;
DROP TABLE IF EXISTS Complaint        CASCADE;
DROP TABLE IF EXISTS Payment          CASCADE;
DROP TABLE IF EXISTS Ticket           CASCADE;
DROP TABLE IF EXISTS Booking          CASCADE;
DROP TABLE IF EXISTS Schedule         CASCADE;
DROP TABLE IF EXISTS Route            CASCADE;
DROP TABLE IF EXISTS Bus              CASCADE;
DROP TABLE IF EXISTS Next_Of_Kin      CASCADE;
DROP TABLE IF EXISTS UserRole         CASCADE;
DROP TABLE IF EXISTS Role             CASCADE;
DROP TABLE IF EXISTS Users            CASCADE;

DROP FUNCTION IF EXISTS prevent_overbooking()       CASCADE;
DROP FUNCTION IF EXISTS log_booking_status_change() CASCADE;


-- =====================================================================
-- SECTION 2: TABLES
-- Designed in 3NF. Each table covers one subject, and every column
-- depends only on the primary key of that table.
-- =====================================================================

-- Role
-- Kept separate from Users so role descriptions are stored once,
-- and users can hold more than one role without data redundancy.
CREATE TABLE Role (
    role_id     INT          GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    role_name   VARCHAR(20)  NOT NULL UNIQUE
                             CHECK (role_name IN ('PASSENGER', 'STAFF', 'ADMIN')),
    description TEXT         NOT NULL
);


-- Users
-- Stores all system users: passengers, staff, and admins.
-- password_hash stores a bcrypt hash; plain-text passwords are never saved.
-- email is used as the login identifier and must be unique.
CREATE TABLE Users (
    user_id         INT          GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    first_name      VARCHAR(50)  NOT NULL,
    surname         VARCHAR(50)  NOT NULL,
    email           VARCHAR(100) NOT NULL UNIQUE,
    phone_number    VARCHAR(20)  NOT NULL,
    id_number       VARCHAR(20)  NOT NULL UNIQUE,
    address         VARCHAR(200) NOT NULL,
    password_hash   TEXT         NOT NULL DEFAULT 'CHANGEME',
    account_status  VARCHAR(20)  NOT NULL DEFAULT 'ACTIVE'
                                 CHECK (account_status IN ('ACTIVE', 'INACTIVE', 'SUSPENDED')),
    created_at      TIMESTAMP    NOT NULL DEFAULT NOW()
);


-- UserRole (bridge table)
-- Handles the many-to-many relationship between Users and Role.
-- A user can have more than one role, e.g. a passenger who is also staff.
CREATE TABLE UserRole (
    user_id       INT       NOT NULL REFERENCES Users(user_id) ON DELETE CASCADE,
    role_id       INT       NOT NULL REFERENCES Role(role_id)  ON DELETE CASCADE,
    assigned_date TIMESTAMP NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, role_id)
);


-- Next_Of_Kin (weak entity)
-- Each record belongs to a user and cannot exist without one.
-- Used to store emergency contacts for passengers.
CREATE TABLE Next_Of_Kin (
    next_of_kin_id INT          GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id        INT          NOT NULL REFERENCES Users(user_id) ON DELETE CASCADE,
    kin_name       VARCHAR(100) NOT NULL,
    contact        VARCHAR(50)  NOT NULL,
    relation       VARCHAR(50)
);


-- Bus
-- Represents a vehicle in the fleet.
-- capacity is used by the overbooking trigger to enforce seat limits.
CREATE TABLE Bus (
    bus_id              INT         GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    bus_type            VARCHAR(50) NOT NULL,
    capacity            INT         NOT NULL CHECK (capacity > 0),
    registration_number VARCHAR(50) NOT NULL UNIQUE
);


-- Route
-- Stores fixed paths between two locations.
-- departure_location and destination define the route.
-- estimated_travel_time is a derived value (distance / avg speed).
CREATE TABLE Route (
    route_id              INT          GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    departure_location    VARCHAR(100) NOT NULL,
    destination           VARCHAR(100) NOT NULL,
    route_distance        NUMERIC(8,2) NOT NULL CHECK (route_distance > 0),
    estimated_travel_time VARCHAR(50)  NOT NULL
);


-- Schedule
-- Links a bus to a route at a specific time.
-- travel_date is generated automatically from departure_time so we
-- can filter trips by date without extracting it in every query.
-- ticket_price is stored here because it can differ per trip.
--
-- FIX 1: Changed ON DELETE SET NULL to ON DELETE RESTRICT on both
-- bus_id and route_id. The original code declared both columns NOT NULL
-- but used ON DELETE SET NULL, which is a direct contradiction:
-- PostgreSQL cannot set a NOT NULL column to NULL. RESTRICT keeps the
-- NOT NULL guarantee and prevents buses or routes from being deleted
-- while schedules still reference them.
CREATE TABLE Schedule (
    schedule_id    INT          GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    bus_id         INT          NOT NULL REFERENCES Bus(bus_id)   ON DELETE RESTRICT,
    route_id       INT          NOT NULL REFERENCES Route(route_id) ON DELETE RESTRICT,
    departure_time TIMESTAMP    NOT NULL,
    arrival_time   TIMESTAMP    NOT NULL,
    travel_date    DATE         GENERATED ALWAYS AS (departure_time::DATE) STORED,
    ticket_price   NUMERIC(8,2) NOT NULL CHECK (ticket_price > 0),
    CONSTRAINT chk_arrival_after_departure CHECK (arrival_time > departure_time)
);


-- Booking
-- Created when a passenger reserves a seat on a schedule.
-- total_fare is stored at booking time so price changes later
-- do not affect existing records.
CREATE TABLE Booking (
    booking_id     INT          GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id        INT          NOT NULL REFERENCES Users(user_id),
    schedule_id    INT          NOT NULL REFERENCES Schedule(schedule_id),
    booking_status VARCHAR(20)  NOT NULL DEFAULT 'PENDING'
                                CHECK (booking_status IN ('BOOKED', 'PENDING', 'CANCELLED')),
    booking_date   TIMESTAMP    NOT NULL DEFAULT NOW(),
    total_fare     NUMERIC(8,2) NOT NULL CHECK (total_fare > 0)
);


-- Ticket
-- One seat allocation per booking.
-- The composite UNIQUE on (booking_id, seat_number) prevents the same
-- seat from being issued twice on one booking.
CREATE TABLE Ticket (
    ticket_id     INT         GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    booking_id    INT         NOT NULL REFERENCES Booking(booking_id),
    seat_number   VARCHAR(20) NOT NULL,
    ticket_status VARCHAR(20) NOT NULL DEFAULT 'BOOKED'
                              CHECK (ticket_status IN ('BOOKED', 'NOT_BOOKED', 'CANCELLED')),
    UNIQUE (booking_id, seat_number)
);


-- Payment
-- Linked 1:1 to Booking via UNIQUE on booking_id.
-- Each confirmed booking must have exactly one payment record.
CREATE TABLE Payment (
    payment_id     INT          GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    booking_id     INT          NOT NULL UNIQUE REFERENCES Booking(booking_id),
    amount         NUMERIC(8,2) NOT NULL CHECK (amount > 0),
    payment_method VARCHAR(20)  NOT NULL CHECK (payment_method IN ('CARD', 'EFT', 'CASH')),
    payment_status VARCHAR(20)  NOT NULL DEFAULT 'PENDING'
                                CHECK (payment_status IN ('PAID', 'PENDING', 'REFUNDED')),
    payment_date   TIMESTAMP    NOT NULL DEFAULT NOW()
);


-- Complaint
-- Passengers can report issues. A complaint can optionally link to a booking.
-- date_resolved is NULL while the complaint is still open.
-- The check constraint stops a RESOLVED complaint from having no close date.
CREATE TABLE Complaint (
    complaint_id      INT         GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id           INT         NOT NULL REFERENCES Users(user_id),
    booking_id        INT         REFERENCES Booking(booking_id),
    description       TEXT        NOT NULL,
    resolution_status VARCHAR(20) NOT NULL DEFAULT 'PENDING'
                                  CHECK (resolution_status IN ('RESOLVED', 'PENDING', 'UNRESOLVED')),
    date_submitted    TIMESTAMP   NOT NULL DEFAULT NOW(),
    date_resolved     TIMESTAMP,
    CONSTRAINT chk_resolved_has_date
        CHECK (resolution_status <> 'RESOLVED' OR date_resolved IS NOT NULL)
);


-- BookingStatusLog
-- Automatically records every status change on a booking.
-- The admin panel reads this table to show a full booking history.
CREATE TABLE BookingStatusLog (
    log_id     INT          GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    booking_id INT          NOT NULL REFERENCES Booking(booking_id),
    old_status VARCHAR(20),
    new_status VARCHAR(20)  NOT NULL,
    changed_at TIMESTAMP    NOT NULL DEFAULT NOW(),
    changed_by VARCHAR(100) NOT NULL DEFAULT 'System'
);


-- =====================================================================
-- SECTION 3: INDEXES
-- Speed up lookups on columns used in WHERE, JOIN, and ORDER BY.
-- =====================================================================

CREATE INDEX idx_users_email      ON Users(email);
CREATE INDEX idx_users_status     ON Users(account_status);
CREATE INDEX idx_booking_user     ON Booking(user_id);
CREATE INDEX idx_booking_schedule ON Booking(schedule_id);
CREATE INDEX idx_booking_status   ON Booking(booking_status);
CREATE INDEX idx_schedule_date    ON Schedule(travel_date);
CREATE INDEX idx_schedule_bus     ON Schedule(bus_id);
CREATE INDEX idx_schedule_route   ON Schedule(route_id);
CREATE INDEX idx_ticket_booking   ON Ticket(booking_id);
CREATE INDEX idx_payment_booking  ON Payment(booking_id);
CREATE INDEX idx_payment_status   ON Payment(payment_status);
CREATE INDEX idx_complaint_user   ON Complaint(user_id);
CREATE INDEX idx_route_origin     ON Route(departure_location);
CREATE INDEX idx_statuslog        ON BookingStatusLog(booking_id);


-- =====================================================================
-- SECTION 4: SAMPLE DATA
-- Enough rows to make all queries return meaningful results.
-- =====================================================================

-- Roles
INSERT INTO Role (role_name, description) VALUES
('PASSENGER', 'Books tickets and manages their own travel'),
('STAFF',     'Manages schedules and resolves complaints'),
('ADMIN',     'Full system access and user management');


-- Users (21 rows)
-- FIX 4: Added user 21 with account_status = 'SUSPENDED' so that
-- all three values in the account_status CHECK constraint are
-- represented in the sample data.
INSERT INTO Users (first_name, surname, email, phone_number, id_number, address, password_hash, account_status)
VALUES
('John',    'Doe',       'john@mail.com',    '0711111111', '9001015009081', '12 Main St, JHB',  '$2b$12$hashaa', 'ACTIVE'),
('Sarah',   'Mokoena',   'sarah@mail.com',   '0711111112', '9203025009082', '4 Oak Ave, PTA',   '$2b$12$hashab', 'ACTIVE'),
('David',   'Smith',     'david@mail.com',   '0711111113', '8805015009083', '8 Pine Rd, CPT',   '$2b$12$hashac', 'ACTIVE'),
('Ayesha',  'Khan',      'ayesha@mail.com',  '0711111114', '9105025009084', '2 Rose St, DBN',   '$2b$12$hashad', 'ACTIVE'),
('Thabo',   'Nkosi',     'thabo@mail.com',   '0711111115', '9004015009085', '5 Hill Rd, BFN',   '$2b$12$hashae', 'ACTIVE'),
('Lerato',  'Mahlangu',  'lerato@mail.com',  '0711111116', '9306025009086', '7 Lake Dr, PTA',   '$2b$12$hashaf', 'ACTIVE'),
('Sipho',   'Dlamini',   'sipho@mail.com',   '0711111117', '8807015009087', '3 River Rd, JHB',  '$2b$12$hashag', 'ACTIVE'),
('Emily',   'Brown',     'emily@mail.com',   '0711111118', '9008025009088', '9 Valley St, CPT', '$2b$12$hashah', 'ACTIVE'),
('Michael', 'Johnson',   'michael@mail.com', '0711111119', '8709015009089', '1 Beach Rd, DBN',  '$2b$12$hashai', 'ACTIVE'),
('Nomsa',   'Zulu',      'nomsa@mail.com',   '0711111120', '9210025009080', '6 Field St, JHB',  '$2b$12$hashaj', 'ACTIVE'),
('Admin',   'One',       'admin1@mail.com',  '0711111121', '8001015009071', '10 Admin Rd, PTA', '$2b$12$hashak', 'ACTIVE'),
('Admin',   'Two',       'admin2@mail.com',  '0711111122', '7902025009072', '11 Admin Rd, PTA', '$2b$12$hashal', 'ACTIVE'),
('Peter',   'Williams',  'peter@mail.com',   '0711111123', '9503015009073', '14 Elm St, JHB',   '$2b$12$hasham', 'ACTIVE'),
('Liam',    'Jones',     'liam@mail.com',    '0711111124', '9104025009074', '15 Fir Rd, CPT',   '$2b$12$hashan', 'ACTIVE'),
('Grace',   'Lee',       'grace@mail.com',   '0711111125', '9205015009075', '16 Bay Ave, DBN',  '$2b$12$hashao', 'ACTIVE'),
('Fatima',  'Ali',       'fatima@mail.com',  '0711111126', '9306025009076', '17 Sea St, CPT',   '$2b$12$hashap', 'ACTIVE'),
('Jacob',   'Miller',    'jacob@mail.com',   '0711111127', '9007015009077', '18 Hill Dr, BFN',  '$2b$12$hashaq', 'ACTIVE'),
('Zoe',     'Taylor',    'zoe@mail.com',     '0711111128', '9108025009078', '19 Sun Rd, JHB',   '$2b$12$hashar', 'ACTIVE'),
('Brian',   'Wilson',    'brian@mail.com',   '0711111129', '8509015009079', '20 Moon St, PTA',  '$2b$12$hashas', 'ACTIVE'),
('Hannah',  'Moore',     'hannah@mail.com',  '0711111130', '9210025009070', '21 Star Ave, DBN', '$2b$12$hashat', 'ACTIVE'),
('Banned',  'User',      'banned@mail.com',  '0711111131', '8811015009069', '99 Block Rd, JHB', '$2b$12$hashau', 'SUSPENDED');


-- UserRole assignments
-- FIX 5: Added role assignment for the new suspended user 21 (PASSENGER role).
INSERT INTO UserRole (user_id, role_id) VALUES
(1,1),(2,1),(3,1),(4,3),(5,1),(6,1),(7,3),(8,1),(9,1),(10,1),
(11,3),(12,3),(13,1),(14,1),(15,1),(16,1),(17,1),(18,1),(19,1),(20,2),
(21,1);


-- Next of kin (not every user has one - it is optional)
INSERT INTO Next_Of_Kin (user_id, kin_name, contact, relation) VALUES
(1,  'Jane Doe',       '0821111101', 'Spouse'),
(2,  'Peter Mokoena',  '0821111102', 'Parent'),
(3,  'Lisa Smith',     '0821111103', 'Sibling'),
(5,  'Thandi Nkosi',   '0821111104', 'Spouse'),
(8,  'Tom Brown',      '0821111105', 'Parent'),
(9,  'Angela Johnson', '0821111106', 'Sibling'),
(13, 'Susan Williams', '0821111107', 'Spouse'),
(15, 'James Lee',      '0821111108', 'Parent');


-- Buses
INSERT INTO Bus (bus_type, capacity, registration_number) VALUES
('Luxury Coach',   50, 'GP123'),
('Standard Coach', 40, 'GP456'),
('Double Decker',  60, 'GP789');


-- Routes
INSERT INTO Route (departure_location, destination, route_distance, estimated_travel_time) VALUES
('Johannesburg',   'Pretoria',      60,   '1 hour'),
('Pretoria',       'Cape Town',     1450, '14 hours 30 minutes'),
('Durban',         'Johannesburg',  570,  '6 hours'),
('Bloemfontein',   'Pretoria',      400,  '4 hours'),
('Port Elizabeth', 'Durban',        680,  '7 hours');


-- Schedules
INSERT INTO Schedule (bus_id, route_id, departure_time, arrival_time, ticket_price) VALUES
(1, 1, NOW() + INTERVAL '1 day',  NOW() + INTERVAL '1 day  2 hours',             250.00),
(2, 2, NOW() + INTERVAL '2 days', NOW() + INTERVAL '2 days 14 hours 30 minutes', 850.00),
(3, 3, NOW() + INTERVAL '3 days', NOW() + INTERVAL '3 days 6 hours',             420.00),
(1, 4, NOW() + INTERVAL '4 days', NOW() + INTERVAL '4 days 4 hours',             310.00),
(2, 5, NOW() + INTERVAL '5 days', NOW() + INTERVAL '5 days 7 hours',             500.00);


-- Bookings (20 rows)
INSERT INTO Booking (user_id, schedule_id, booking_status, total_fare) VALUES
(1,  1, 'BOOKED',    250.00),
(2,  1, 'BOOKED',    250.00),
(3,  1, 'PENDING',   250.00),
(4,  2, 'BOOKED',    850.00),
(5,  2, 'BOOKED',    850.00),
(6,  2, 'CANCELLED', 850.00),
(7,  3, 'BOOKED',    420.00),
(8,  3, 'BOOKED',    420.00),
(9,  3, 'PENDING',   420.00),
(10, 4, 'BOOKED',    310.00),
(13, 4, 'BOOKED',    310.00),
(14, 4, 'BOOKED',    310.00),
(15, 5, 'PENDING',   500.00),
(16, 5, 'BOOKED',    500.00),
(17, 5, 'BOOKED',    500.00),
(18, 1, 'BOOKED',    250.00),
(19, 2, 'BOOKED',    850.00),
(20, 3, 'BOOKED',    420.00),
(11, 4, 'BOOKED',    310.00),
(12, 5, 'BOOKED',    500.00);


-- Tickets
-- FIX 3: booking_id 6 seat changed from 'B3' to 'B4'.
-- Booking 6 (CANCELLED, schedule 2) and booking 19 (BOOKED, schedule 2)
-- were both assigned seat 'B3'. Although the UNIQUE constraint is per
-- booking_id and would not raise an error, two passengers on the same
-- physical bus trip cannot share the same seat. 'B4' is used instead.
INSERT INTO Ticket (booking_id, seat_number, ticket_status) VALUES
(1,  'A1', 'BOOKED'),    (2,  'A2', 'BOOKED'),    (3,  'A3', 'BOOKED'),
(4,  'B1', 'BOOKED'),    (5,  'B2', 'BOOKED'),    (7,  'C1', 'BOOKED'),
(8,  'C2', 'BOOKED'),    (9,  'C3', 'BOOKED'),    (10, 'D1', 'BOOKED'),
(11, 'D2', 'BOOKED'),    (12, 'D3', 'BOOKED'),    (13, 'E1', 'BOOKED'),
(14, 'E2', 'BOOKED'),    (15, 'E3', 'BOOKED'),    (16, 'F1', 'BOOKED'),
(17, 'F2', 'BOOKED'),    (18, 'A4', 'BOOKED'),    (19, 'B3', 'BOOKED'),
(20, 'C4', 'BOOKED'),    (6,  'B4', 'NOT_BOOKED');


-- Payments
-- FIX 2: booking_id 13 amount corrected from 310.00 to 500.00.
-- Booking 13 is on schedule 5 (Port Elizabeth to Durban, ticket_price = 500.00)
-- and has total_fare = 500.00. The original value of 310.00 was copied
-- from a different route and caused the Revenue Report view to under-report
-- income for that route.
INSERT INTO Payment (booking_id, amount, payment_method, payment_status) VALUES
(1,  250.00, 'CARD', 'PAID'),
(2,  250.00, 'EFT',  'PAID'),
(4,  850.00, 'CARD', 'PAID'),
(5,  850.00, 'CASH', 'PAID'),
(7,  420.00, 'CARD', 'PAID'),
(8,  420.00, 'CARD', 'PAID'),
(10, 310.00, 'EFT',  'PAID'),
(11, 310.00, 'CARD', 'PAID'),
(12, 310.00, 'CARD', 'PAID'),
(13, 500.00, 'CASH', 'PAID'),
(3,  250.00, 'EFT',  'PENDING'),
(9,  420.00, 'CARD', 'PENDING');


-- Complaints
INSERT INTO Complaint (user_id, booking_id, description, resolution_status, date_resolved) VALUES
(3,  3,  'Bus was over 2 hours late with no communication.',        'PENDING',    NULL),
(6,  6,  'Trip was cancelled but I have not received my refund.',   'RESOLVED',   NOW() - INTERVAL '2 days'),
(9,  9,  'Another passenger was sitting in my reserved seat.',      'UNRESOLVED', NULL),
(15, 15, 'I booked the wrong date and need a full refund.',         'PENDING',    NULL),
(18, 18, 'Bus arrived 3 hours late and I missed my connection.',    'RESOLVED',   NOW() - INTERVAL '1 day');


-- Booking status log (seed data; trigger handles new entries going forward)
INSERT INTO BookingStatusLog (booking_id, old_status, new_status, changed_by) VALUES
(1,  NULL,        'PENDING',   'System'),
(1,  'PENDING',   'BOOKED',    'admin1@mail.com'),
(6,  NULL,        'PENDING',   'System'),
(6,  'PENDING',   'BOOKED',    'admin1@mail.com'),
(6,  'BOOKED',    'CANCELLED', 'admin2@mail.com'),
(3,  NULL,        'PENDING',   'System'),
(9,  NULL,        'PENDING',   'System');


-- =====================================================================
-- SECTION 5: VIEWS
-- Views simplify reporting. The backend and frontend query views
-- instead of writing complex joins every time.
-- =====================================================================

-- Booking Summary
-- Shows full booking details including passenger name and route.
-- Used for the admin bookings table and the passenger "My Bookings" page.
CREATE OR REPLACE VIEW vw_Booking_Summary AS
SELECT
    b.booking_id,
    u.user_id,
    u.first_name || ' ' || u.surname  AS full_name,
    u.email,
    u.phone_number,
    r.departure_location,
    r.destination,
    s.departure_time,
    s.arrival_time,
    s.travel_date,
    b.booking_status,
    b.booking_date,
    b.total_fare
FROM   Booking  b
JOIN   Users    u  ON b.user_id     = u.user_id
JOIN   Schedule s  ON b.schedule_id = s.schedule_id
JOIN   Route    r  ON s.route_id    = r.route_id;


-- Revenue Report
-- Total income per route. Used on the finance section of the admin dashboard.
CREATE OR REPLACE VIEW vw_Revenue_Report AS
SELECT
    r.departure_location,
    r.destination,
    COUNT(p.payment_id)      AS total_transactions,
    SUM(p.amount)            AS total_revenue,
    ROUND(AVG(p.amount), 2)  AS avg_ticket_price,
    MAX(p.amount)            AS max_ticket_price,
    MIN(p.amount)            AS min_ticket_price
FROM   Payment  p
JOIN   Booking  b  ON p.booking_id  = b.booking_id
JOIN   Schedule s  ON b.schedule_id = s.schedule_id
JOIN   Route    r  ON s.route_id    = r.route_id
WHERE  p.payment_status = 'PAID'
GROUP  BY r.departure_location, r.destination;


-- Available Seats
-- Shows how many seats are left per schedule.
-- The booking search page queries this before displaying results.
CREATE OR REPLACE VIEW vw_Available_Seats AS
SELECT
    s.schedule_id,
    r.departure_location,
    r.destination,
    s.departure_time,
    s.travel_date,
    s.ticket_price,
    bu.capacity                      AS total_seats,
    COUNT(t.ticket_id)               AS seats_booked,
    bu.capacity - COUNT(t.ticket_id) AS seats_available
FROM   Schedule s
JOIN   Bus      bu ON s.bus_id      = bu.bus_id
JOIN   Route    r  ON s.route_id    = r.route_id
LEFT JOIN Booking bk ON s.schedule_id = bk.schedule_id
                    AND bk.booking_status <> 'CANCELLED'
LEFT JOIN Ticket  t  ON bk.booking_id  = t.booking_id
                    AND t.ticket_status = 'BOOKED'
GROUP  BY s.schedule_id, r.departure_location, r.destination,
          s.departure_time, s.travel_date, s.ticket_price, bu.capacity;


-- Complaint Overview
-- Lists all complaints with passenger details and how long they have been open.
-- complaint_duration_days is the derived attribute identified in Phase 2.
CREATE OR REPLACE VIEW vw_Complaint_Overview AS
SELECT
    c.complaint_id,
    u.first_name || ' ' || u.surname  AS passenger_name,
    u.email,
    c.description,
    c.date_submitted,
    c.resolution_status,
    c.date_resolved,
    EXTRACT(DAY FROM (COALESCE(c.date_resolved, NOW()) - c.date_submitted))
        AS complaint_duration_days
FROM   Complaint c
JOIN   Users     u  ON c.user_id    = u.user_id;


-- =====================================================================
-- SECTION 6: TRIGGERS
-- Triggers run automatically when data changes. No action is needed
-- from the application - the database handles these rules itself.
-- =====================================================================

-- Trigger 1: Prevent Overbooking
-- Fires before every new ticket insert.
-- Checks how many active tickets already exist for that schedule
-- and blocks the insert if the bus is already full.
CREATE OR REPLACE FUNCTION prevent_overbooking()
RETURNS TRIGGER AS $$
DECLARE
    v_capacity INT;
    v_booked   INT;
    v_sched_id INT;
BEGIN
    SELECT schedule_id INTO v_sched_id
    FROM   Booking WHERE booking_id = NEW.booking_id;

    SELECT bu.capacity INTO v_capacity
    FROM   Bus bu JOIN Schedule s ON bu.bus_id = s.bus_id
    WHERE  s.schedule_id = v_sched_id;

    SELECT COUNT(*) INTO v_booked
    FROM   Ticket t JOIN Booking bk ON t.booking_id = bk.booking_id
    WHERE  bk.schedule_id = v_sched_id AND t.ticket_status = 'BOOKED';

    IF v_booked >= v_capacity THEN
        RAISE EXCEPTION 'Schedule % is fully booked (capacity = %).', v_sched_id, v_capacity;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_prevent_overbooking
BEFORE INSERT ON Ticket
FOR EACH ROW EXECUTE FUNCTION prevent_overbooking();


-- Trigger 2: Booking Status Audit Log
-- Fires after every update on Booking.
-- Writes a log entry whenever the booking_status column changes.
-- This gives admins a full timeline for every booking.
CREATE OR REPLACE FUNCTION log_booking_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.booking_status <> NEW.booking_status THEN
        INSERT INTO BookingStatusLog (booking_id, old_status, new_status)
        VALUES (NEW.booking_id, OLD.booking_status, NEW.booking_status);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_booking_status_log
AFTER UPDATE ON Booking
FOR EACH ROW EXECUTE FUNCTION log_booking_status_change();


-- =====================================================================
-- SECTION 7: QUERIES
-- =====================================================================


-- -------------------------------------------------------------------
-- 7A: ROW AND COLUMN LIMITATIONS
-- LIMIT controls how many rows are returned.
-- Naming columns instead of SELECT * limits what is returned.
-- -------------------------------------------------------------------

-- Show the first 10 users (admin user list, paginated)
SELECT user_id, first_name, surname, email, phone_number, account_status
FROM   Users
LIMIT  10;

-- Show only the 5 most recent bookings
SELECT booking_id, user_id, booking_status, booking_date, total_fare
FROM   Booking
ORDER  BY booking_date DESC
LIMIT  5;

-- Show upcoming trips with seats available, limited to 10 results
SELECT schedule_id, departure_location, destination, departure_time, seats_available, ticket_price
FROM   vw_Available_Seats
WHERE  departure_time > NOW()
ORDER  BY departure_time ASC
LIMIT  10;


-- -------------------------------------------------------------------
-- 7B: SORTING
-- ORDER BY controls the sequence of results returned.
-- -------------------------------------------------------------------

-- Schedules sorted by soonest departure (booking search page)
SELECT schedule_id, departure_time, arrival_time, ticket_price
FROM   Schedule
ORDER  BY departure_time ASC;

-- Payments sorted from highest to lowest amount (finance report)
SELECT payment_id, booking_id, amount, payment_method, payment_status
FROM   Payment
ORDER  BY amount DESC;

-- Users sorted alphabetically by surname
SELECT user_id, first_name, surname, email, account_status
FROM   Users
ORDER  BY surname ASC, first_name ASC;


-- -------------------------------------------------------------------
-- 7C: LIKE, AND, OR
-- -------------------------------------------------------------------

-- Find users whose first name starts with S
SELECT user_id, first_name, surname, email
FROM   Users
WHERE  first_name LIKE 'S%';

-- Confirmed bookings on schedule 1 only
SELECT booking_id, user_id, booking_status, booking_date
FROM   Booking
WHERE  booking_status = 'BOOKED'
AND    schedule_id    = 1;

-- Bookings that are either pending or cancelled
SELECT booking_id, user_id, booking_status, booking_date
FROM   Booking
WHERE  booking_status = 'PENDING'
OR     booking_status = 'CANCELLED';

-- Active users whose surname contains 'mo' (case-insensitive)
SELECT user_id, first_name, surname, account_status
FROM   Users
WHERE  LOWER(surname) LIKE '%mo%'
AND    account_status = 'ACTIVE';


-- -------------------------------------------------------------------
-- 7D: VARIABLES AND CHARACTER FUNCTIONS
-- -------------------------------------------------------------------

-- Format names and extract email domain using character functions
SELECT
    user_id,
    UPPER(first_name)                                  AS first_name_upper,
    LOWER(surname)                                     AS surname_lower,
    INITCAP(first_name || ' ' || surname)              AS display_name,
    LENGTH(email)                                      AS email_length,
    SUBSTRING(email FROM POSITION('@' IN email) + 1)   AS email_domain
FROM   Users;

-- Declare a variable and use it to count bookings with that status
DO $$
DECLARE
    v_status VARCHAR(20) := 'BOOKED';
    v_count  INT;
BEGIN
    SELECT COUNT(*) INTO v_count
    FROM   Booking WHERE booking_status = v_status;
    RAISE NOTICE 'Total % bookings: %', v_status, v_count;
END;
$$;


-- -------------------------------------------------------------------
-- 7E: ROUNDING AND TRUNCATION
-- -------------------------------------------------------------------

-- Show raw, rounded, and truncated amounts side by side
SELECT
    payment_id,
    amount,
    ROUND(amount, 2)        AS amount_rounded,
    TRUNC(amount)           AS amount_truncated,
    ROUND(amount / 1.15, 2) AS amount_excl_vat
FROM   Payment;

-- Revenue summary with rounded totals
SELECT
    ROUND(SUM(amount), 2)  AS total_revenue,
    ROUND(AVG(amount), 2)  AS avg_ticket_price,
    ROUND(MAX(amount), 2)  AS highest_ticket,
    ROUND(MIN(amount), 2)  AS lowest_ticket
FROM   Payment
WHERE  payment_status = 'PAID';


-- -------------------------------------------------------------------
-- 7F: DATE FUNCTIONS
-- -------------------------------------------------------------------

-- Current date information
SELECT
    NOW()                         AS current_timestamp,
    CURRENT_DATE                  AS today,
    NOW() + INTERVAL '1 month'    AS one_month_ahead,
    EXTRACT(YEAR  FROM NOW())     AS current_year,
    EXTRACT(MONTH FROM NOW())     AS current_month;

-- Days until each scheduled departure
SELECT
    schedule_id,
    TO_CHAR(departure_time, 'DD Month YYYY HH24:MI')  AS formatted_departure,
    EXTRACT(DAY FROM (departure_time - NOW()))         AS days_until_departure
FROM   Schedule
ORDER  BY departure_time;

-- How long each complaint has been open or took to resolve
SELECT
    complaint_id,
    date_submitted,
    date_resolved,
    EXTRACT(DAY FROM (COALESCE(date_resolved, NOW()) - date_submitted))
        AS complaint_duration_days
FROM   Complaint;

-- Most recent payment per payment method (uses payment_date column)
SELECT
    payment_method,
    MAX(payment_date) AS last_payment_date,
    COUNT(*)          AS total_payments
FROM   Payment
GROUP  BY payment_method
ORDER  BY last_payment_date DESC;


-- -------------------------------------------------------------------
-- 7G: AGGREGATE FUNCTIONS
-- -------------------------------------------------------------------

-- Booking counts broken down by status
SELECT
    COUNT(*)                                                  AS total_bookings,
    COUNT(CASE WHEN booking_status = 'BOOKED'    THEN 1 END) AS booked,
    COUNT(CASE WHEN booking_status = 'PENDING'   THEN 1 END) AS pending,
    COUNT(CASE WHEN booking_status = 'CANCELLED' THEN 1 END) AS cancelled
FROM   Booking;

-- Revenue summary for the finance dashboard
SELECT
    COUNT(*)      AS total_paid_transactions,
    SUM(amount)   AS total_revenue,
    AVG(amount)   AS avg_ticket_price,
    MAX(amount)   AS highest_payment,
    MIN(amount)   AS lowest_payment
FROM   Payment
WHERE  payment_status = 'PAID';


-- -------------------------------------------------------------------
-- 7H: GROUP BY AND HAVING
-- GROUP BY groups rows. HAVING filters those groups.
-- -------------------------------------------------------------------

-- Passengers who have made more than one booking
SELECT
    u.first_name || ' ' || u.surname  AS passenger_name,
    COUNT(b.booking_id)               AS booking_count,
    SUM(b.total_fare)                 AS total_spent
FROM   Booking b
JOIN   Users   u ON b.user_id = u.user_id
GROUP  BY u.user_id, u.first_name, u.surname
HAVING COUNT(b.booking_id) > 1
ORDER  BY booking_count DESC;

-- Routes that have earned more than R500 in payments
SELECT
    r.departure_location,
    r.destination,
    COUNT(b.booking_id)  AS total_bookings,
    SUM(p.amount)        AS total_revenue
FROM   Route    r
JOIN   Schedule s  ON r.route_id    = s.route_id
JOIN   Booking  b  ON s.schedule_id = b.schedule_id
JOIN   Payment  p  ON b.booking_id  = p.booking_id
WHERE  p.payment_status = 'PAID'
GROUP  BY r.route_id, r.departure_location, r.destination
HAVING SUM(p.amount) > 500
ORDER  BY total_revenue DESC;

-- Payment method breakdown, only methods used more than once
SELECT
    payment_method,
    COUNT(*)      AS times_used,
    SUM(amount)   AS total_collected
FROM   Payment
GROUP  BY payment_method
HAVING COUNT(*) > 1
ORDER  BY total_collected DESC;


-- -------------------------------------------------------------------
-- 7I: JOINS
-- -------------------------------------------------------------------

-- Full booking detail including payment info (booking detail page)
SELECT
    b.booking_id,
    u.first_name || ' ' || u.surname  AS passenger,
    u.email,
    r.departure_location,
    r.destination,
    s.departure_time,
    b.booking_status,
    p.amount,
    p.payment_status,
    p.payment_method
FROM   Booking   b
JOIN   Users     u  ON b.user_id      = u.user_id
JOIN   Schedule  s  ON b.schedule_id  = s.schedule_id
JOIN   Route     r  ON s.route_id     = r.route_id
LEFT JOIN Payment p ON b.booking_id   = p.booking_id
ORDER  BY s.departure_time;

-- Users with their assigned roles
SELECT
    u.user_id,
    u.first_name || ' ' || u.surname  AS full_name,
    u.email,
    ro.role_name,
    ur.assigned_date
FROM   Users    u
JOIN   UserRole ur ON u.user_id  = ur.user_id
JOIN   Role     ro ON ur.role_id = ro.role_id
ORDER  BY u.user_id;

-- All schedules, including those with zero bookings
SELECT
    s.schedule_id,
    r.departure_location,
    r.destination,
    s.departure_time,
    bu.registration_number,
    COUNT(b.booking_id)  AS total_bookings
FROM   Schedule  s
JOIN   Route     r  ON s.route_id    = r.route_id
JOIN   Bus       bu ON s.bus_id      = bu.bus_id
LEFT JOIN Booking b ON s.schedule_id = b.schedule_id
GROUP  BY s.schedule_id, r.departure_location, r.destination,
          s.departure_time, bu.registration_number
ORDER  BY s.departure_time;


-- -------------------------------------------------------------------
-- 7J: SUBQUERIES
-- -------------------------------------------------------------------

-- Passengers who have at least one confirmed booking
SELECT first_name, surname, email
FROM   Users
WHERE  user_id IN (
    SELECT DISTINCT user_id FROM Booking WHERE booking_status = 'BOOKED'
);

-- Schedules that still have available seats
SELECT schedule_id, departure_location, destination, departure_time, seats_available
FROM   vw_Available_Seats
WHERE  seats_available > 0
ORDER  BY departure_time;

-- Passengers who have never filed a complaint
SELECT first_name, surname, email
FROM   Users u
WHERE  NOT EXISTS (
    SELECT 1 FROM Complaint c WHERE c.user_id = u.user_id
);

-- Average number of bookings per route
SELECT
    departure_location,
    destination,
    ROUND(AVG(booking_count), 1) AS avg_bookings
FROM (
    SELECT
        r.departure_location,
        r.destination,
        COUNT(b.booking_id) AS booking_count
    FROM   Route    r
    JOIN   Schedule s ON r.route_id    = s.route_id
    JOIN   Booking  b ON s.schedule_id = b.schedule_id
    GROUP  BY r.route_id, r.departure_location, r.destination
) AS route_totals
GROUP  BY departure_location, destination;

-- Suspended users (demonstrates SUSPENDED status in sample data)
SELECT user_id, first_name, surname, email, account_status
FROM   Users
WHERE  account_status = 'SUSPENDED';


-- -------------------------------------------------------------------
-- 7K: BUSINESS INFORMATION QUERIES
-- These answer real operational questions from the company's
-- information requirements defined in Phase 1.
-- -------------------------------------------------------------------

-- 1. Most in-demand routes
SELECT
    r.departure_location,
    r.destination,
    COUNT(b.booking_id) AS confirmed_bookings
FROM   Route    r
JOIN   Schedule s ON r.route_id    = s.route_id
JOIN   Booking  b ON s.schedule_id = b.schedule_id
WHERE  b.booking_status = 'BOOKED'
GROUP  BY r.route_id, r.departure_location, r.destination
ORDER  BY confirmed_bookings DESC;

-- 2. Revenue per route
SELECT * FROM vw_Revenue_Report ORDER BY total_revenue DESC;

-- 3. Live seat availability for upcoming trips
SELECT * FROM vw_Available_Seats
WHERE  departure_time > NOW() ORDER BY departure_time;

-- 4. Complaints still waiting to be resolved
SELECT * FROM vw_Complaint_Overview
WHERE  resolution_status = 'PENDING' ORDER BY date_submitted ASC;

-- 5. All bookings on the Johannesburg to Pretoria route
SELECT * FROM vw_Booking_Summary
WHERE  departure_location = 'Johannesburg' AND destination = 'Pretoria';

-- 6. Bus utilisation rate
SELECT
    bu.registration_number,
    bu.bus_type,
    bu.capacity,
    COUNT(b.booking_id)                                         AS confirmed_bookings,
    ROUND(COUNT(b.booking_id)::NUMERIC / bu.capacity * 100, 2) AS utilisation_pct
FROM   Bus      bu
JOIN   Schedule s  ON bu.bus_id     = s.bus_id
JOIN   Booking  b  ON s.schedule_id = b.schedule_id
WHERE  b.booking_status = 'BOOKED'
GROUP  BY bu.bus_id, bu.registration_number, bu.bus_type, bu.capacity
ORDER  BY utilisation_pct DESC;

-- 7. Emergency contacts for passengers on confirmed trips
SELECT
    u.first_name || ' ' || u.surname  AS passenger,
    u.phone_number,
    nk.kin_name,
    nk.contact                         AS kin_contact,
    nk.relation
FROM   Next_Of_Kin nk
JOIN   Users       u  ON nk.user_id = u.user_id
WHERE  u.user_id IN (
    SELECT DISTINCT user_id FROM Booking WHERE booking_status = 'BOOKED'
)
ORDER  BY u.surname;

-- 8. Payment method usage and revenue share
SELECT
    payment_method,
    COUNT(*)                                                     AS times_used,
    ROUND(SUM(amount), 2)                                        AS total_collected,
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM Payment), 2) AS usage_percentage
FROM   Payment
GROUP  BY payment_method
ORDER  BY times_used DESC;

-- 9. Revenue generated per bus
SELECT
    bu.registration_number,
    bu.bus_type,
    COUNT(DISTINCT s.schedule_id)  AS trips_run,
    SUM(p.amount)                  AS total_revenue
FROM   Payment  p
JOIN   Booking  b  ON p.booking_id  = b.booking_id
JOIN   Schedule s  ON b.schedule_id = s.schedule_id
JOIN   Bus      bu ON s.bus_id      = bu.bus_id
WHERE  p.payment_status = 'PAID'
GROUP  BY bu.bus_id, bu.registration_number, bu.bus_type
ORDER  BY total_revenue DESC;

-- 10. Full trip occupancy report
SELECT
    s.schedule_id,
    r.departure_location || ' to ' || r.destination            AS route,
    TO_CHAR(s.departure_time, 'DD Mon YYYY HH24:MI')          AS departure,
    bu.capacity                                                AS total_seats,
    COUNT(t.ticket_id)                                         AS occupied,
    bu.capacity - COUNT(t.ticket_id)                           AS remaining,
    ROUND(COUNT(t.ticket_id) * 100.0 / bu.capacity, 1)        AS occupancy_pct
FROM   Schedule  s
JOIN   Bus       bu ON s.bus_id       = bu.bus_id
JOIN   Route     r  ON s.route_id     = r.route_id
LEFT JOIN Booking bk ON s.schedule_id = bk.schedule_id
                    AND bk.booking_status <> 'CANCELLED'
LEFT JOIN Ticket  t  ON bk.booking_id  = t.booking_id
                    AND t.ticket_status = 'BOOKED'
GROUP  BY s.schedule_id, r.departure_location, r.destination,
          s.departure_time, bu.capacity
ORDER  BY s.departure_time;


-- =====================================================================
-- SECTION 8: VIEW DEMONSTRATION
-- Run each view to confirm data and joins are correct.
-- =====================================================================

SELECT * FROM vw_Booking_Summary;
SELECT * FROM vw_Revenue_Report;
SELECT * FROM vw_Available_Seats;
SELECT * FROM vw_Complaint_Overview;


-- =====================================================================
-- SECTION 9: TRIGGER DEMONSTRATION
-- =====================================================================

-- Show Trigger 2 working: update a booking and check the log
UPDATE Booking SET booking_status = 'BOOKED' WHERE booking_id = 3;
SELECT * FROM BookingStatusLog WHERE booking_id = 3 ORDER BY changed_at;
