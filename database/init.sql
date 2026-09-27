-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS postgis;

-- Enum Types
CREATE TYPE user_role AS ENUM ('ADMIN', 'TRAFFIC_OFFICER', 'ANALYST', 'VIEWER');
CREATE TYPE camera_status AS ENUM ('ONLINE', 'OFFLINE', 'DEGRADED');
CREATE TYPE alert_type AS ENUM ('BLACKLIST', 'ANOMALY', 'CONGESTION', 'CAMERA_OFFLINE');

-- Users Table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'VIEWER',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP WITH TIME ZONE
);

-- 1. Cameras Table
CREATE TABLE cameras (
    id VARCHAR(50) PRIMARY KEY, -- e.g., CAM-001
    name VARCHAR(100) NOT NULL,
    lat DOUBLE PRECISION NOT NULL,
    lon DOUBLE PRECISION NOT NULL,
    road_segment_id VARCHAR(100),
    status camera_status DEFAULT 'OFFLINE',
    geom geometry(Point, 4326) -- PostGIS geometry column
);

-- 2. Raw Detections Table
CREATE TABLE raw_detections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    camera_id VARCHAR(50) REFERENCES cameras(id) ON DELETE CASCADE,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    raw_image_ref VARCHAR(255),
    cropped_plate_ref VARCHAR(255),
    quality_flags JSONB -- e.g., {"blur": true, "small": false, "dirty": true, "angled": false}
);

-- 3. Plate Reads Table
CREATE TABLE plate_reads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    detection_id UUID REFERENCES raw_detections(id) ON DELETE CASCADE,
    paddleocr_text VARCHAR(50),
    vlm_text VARCHAR(50),
    final_text VARCHAR(50) NOT NULL,
    confidence DOUBLE PRECISION NOT NULL,
    matched_regex_format BOOLEAN DEFAULT FALSE
);

-- 4. Vehicle Tracks Table
CREATE TABLE vehicle_tracks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    plate_text VARCHAR(50) NOT NULL, -- fuzzy-grouped
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE,
    camera_sequence VARCHAR[], -- array of camera_ids
    reid_embedding_ref VARCHAR(255)
);

-- 5. Trajectory Points
CREATE TABLE trajectory_points (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    track_id UUID REFERENCES vehicle_tracks(id) ON DELETE CASCADE,
    camera_id VARCHAR(50) REFERENCES cameras(id) ON DELETE SET NULL,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    lat DOUBLE PRECISION,
    lon DOUBLE PRECISION,
    is_interpolated BOOLEAN DEFAULT FALSE,
    geom geometry(Point, 4326)
);

-- 6. Traffic Metrics
CREATE TABLE traffic_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    camera_id VARCHAR(50) REFERENCES cameras(id) ON DELETE CASCADE,
    time_bucket TIMESTAMP WITH TIME ZONE NOT NULL,
    vehicle_count INTEGER DEFAULT 0,
    avg_speed DOUBLE PRECISION,
    congestion_score DOUBLE PRECISION
);

-- 7. Alerts Table
CREATE TABLE alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    plate_text VARCHAR(50),
    alert_type alert_type NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    camera_id VARCHAR(50) REFERENCES cameras(id) ON DELETE SET NULL,
    status VARCHAR(50) DEFAULT 'ACTIVE'
);

-- 8. Blacklist Table
CREATE TABLE blacklist (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    plate_text VARCHAR(50) UNIQUE NOT NULL,
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- System Settings
CREATE TABLE system_settings (
    key VARCHAR(100) PRIMARY KEY,
    value TEXT NOT NULL,
    description TEXT
);

INSERT INTO system_settings (key, value, description) VALUES
('retention_days', '30', 'Number of days to keep trajectory and detection data');

-- Indexes
CREATE INDEX idx_raw_detections_camera_id ON raw_detections(camera_id);
CREATE INDEX idx_raw_detections_timestamp ON raw_detections(timestamp);
CREATE INDEX idx_plate_reads_final_text ON plate_reads(final_text);
CREATE INDEX idx_vehicle_tracks_plate_text ON vehicle_tracks(plate_text);
CREATE INDEX idx_trajectory_points_track_id ON trajectory_points(track_id);
CREATE INDEX idx_traffic_metrics_camera_time ON traffic_metrics(camera_id, time_bucket);
CREATE INDEX idx_alerts_timestamp ON alerts(timestamp);
