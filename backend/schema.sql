-- AeroSync AI – Supabase PostgreSQL Schema DDL
-- Execute in Supabase SQL Editor

-- 1. FLIGHTS TABLE
CREATE TABLE IF NOT EXISTS flights (
  id VARCHAR(64) PRIMARY KEY,
  flight_number VARCHAR(32) NOT NULL,
  airline VARCHAR(64) NOT NULL,
  origin VARCHAR(16) NOT NULL,
  destination VARCHAR(16) NOT NULL,
  scheduled_departure TIMESTAMPTZ NOT NULL,
  estimated_departure TIMESTAMPTZ NOT NULL,
  scheduled_arrival TIMESTAMPTZ NOT NULL,
  estimated_arrival TIMESTAMPTZ NOT NULL,
  status VARCHAR(32) NOT NULL,
  delay_minutes INT DEFAULT 0,
  aircraft_id VARCHAR(64),
  crew_id VARCHAR(64),
  gate_id VARCHAR(64),
  passenger_count INT DEFAULT 0,
  risk_level VARCHAR(32) DEFAULT 'LOW',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. AIRCRAFT TABLE
CREATE TABLE IF NOT EXISTS aircraft (
  id VARCHAR(64) PRIMARY KEY,
  tail_number VARCHAR(32) NOT NULL,
  aircraft_type VARCHAR(64) NOT NULL,
  current_location VARCHAR(16) NOT NULL,
  status VARCHAR(32) NOT NULL,
  next_flight_id VARCHAR(64),
  availability VARCHAR(64) DEFAULT 'AVAILABLE',
  maintenance_status VARCHAR(32) DEFAULT 'NOMINAL',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. CREW TABLE
CREATE TABLE IF NOT EXISTS crew (
  id VARCHAR(64) PRIMARY KEY,
  crew_code VARCHAR(32) NOT NULL,
  name VARCHAR(128) NOT NULL,
  role VARCHAR(64) NOT NULL,
  current_flight_id VARCHAR(64),
  duty_minutes INT DEFAULT 0,
  remaining_duty_minutes INT DEFAULT 480,
  status VARCHAR(32) NOT NULL,
  next_assignment VARCHAR(64),
  risk_level VARCHAR(32) DEFAULT 'LOW',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. GATES TABLE
CREATE TABLE IF NOT EXISTS gates (
  id VARCHAR(64) PRIMARY KEY,
  gate_code VARCHAR(32) NOT NULL,
  terminal VARCHAR(64) NOT NULL,
  current_flight_id VARCHAR(64),
  next_flight_id VARCHAR(64),
  status VARCHAR(32) NOT NULL,
  conflict_status VARCHAR(32) DEFAULT 'NOMINAL',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. PASSENGERS TABLE
CREATE TABLE IF NOT EXISTS passengers (
  id VARCHAR(64) PRIMARY KEY,
  pnr VARCHAR(32) NOT NULL,
  passenger_name VARCHAR(128) NOT NULL,
  flight_id VARCHAR(64) NOT NULL,
  connection_flight_id VARCHAR(64),
  connection_status VARCHAR(32) DEFAULT 'OK',
  priority VARCHAR(32) DEFAULT 'STANDARD',
  rebooking_required BOOLEAN DEFAULT FALSE,
  hotel_required BOOLEAN DEFAULT FALSE,
  special_assistance BOOLEAN DEFAULT FALSE,
  risk_level VARCHAR(32) DEFAULT 'LOW',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. DISRUPTIONS TABLE
CREATE TABLE IF NOT EXISTS disruptions (
  id VARCHAR(64) PRIMARY KEY,
  flight_id VARCHAR(64) NOT NULL,
  disruption_type VARCHAR(64) NOT NULL,
  description TEXT,
  severity VARCHAR(32) NOT NULL,
  delay_minutes INT DEFAULT 0,
  detected_at TIMESTAMPTZ DEFAULT NOW(),
  status VARCHAR(32) DEFAULT 'ACTIVE',
  affected_flights JSONB DEFAULT '[]'::jsonb,
  affected_passengers INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. RECOVERY_PLANS TABLE
CREATE TABLE IF NOT EXISTS recovery_plans (
  id VARCHAR(64) PRIMARY KEY,
  plan_version VARCHAR(16) NOT NULL,
  disruption_id VARCHAR(64) NOT NULL,
  status VARCHAR(32) DEFAULT 'GENERATED',
  affected_flights JSONB DEFAULT '[]'::jsonb,
  aircraft_changes TEXT,
  crew_changes TEXT,
  gate_changes TEXT,
  passenger_impact TEXT,
  estimated_delay INT DEFAULT 0,
  operational_cost NUMERIC(12,2) DEFAULT 0,
  fuel_impact INT DEFAULT 0,
  network_impact VARCHAR(32) DEFAULT 'LOW',
  recovery_confidence VARCHAR(16) DEFAULT '95%',
  explanation TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. RECOVERY_EVENTS TABLE
CREATE TABLE IF NOT EXISTS recovery_events (
  id VARCHAR(64) PRIMARY KEY,
  recovery_plan_id VARCHAR(64) NOT NULL,
  event_type VARCHAR(64) NOT NULL,
  description TEXT NOT NULL,
  event_time VARCHAR(32) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS notifications (
  id VARCHAR(64) PRIMARY KEY,
  category VARCHAR(64) NOT NULL,
  title VARCHAR(128) NOT NULL,
  message TEXT NOT NULL,
  severity VARCHAR(32) DEFAULT 'INFO',
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- SUPABASE REALTIME ENABLEMENT
ALTER PUBLICATION supabase_realtime ADD TABLE flights;
ALTER PUBLICATION supabase_realtime ADD TABLE disruptions;
ALTER PUBLICATION supabase_realtime ADD TABLE recovery_plans;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
