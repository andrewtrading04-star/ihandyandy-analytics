-- iHandyAndy Analytics Database Schema for Supabase

-- Main events table (stores all tracking events)
CREATE TABLE IF NOT EXISTS events (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  event_type VARCHAR(50) NOT NULL, -- page_view, button_click, form_interaction, scroll_depth, time_on_page
  session_id VARCHAR(100) NOT NULL,
  page_id VARCHAR(100) NOT NULL,
  page_url TEXT,
  page_title VARCHAR(500),
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  user_agent TEXT,
  referrer TEXT,
  metadata JSONB, -- Stores event-specific data
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for fast queries
CREATE INDEX idx_events_event_type ON events(event_type);
CREATE INDEX idx_events_session_id ON events(session_id);
CREATE INDEX idx_events_timestamp ON events(timestamp DESC);
CREATE INDEX idx_events_page_url ON events(page_url);
CREATE INDEX idx_events_created_at ON events(created_at DESC);

-- Users table (optional, for tracking unique visitors)
CREATE TABLE IF NOT EXISTS users (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  session_id VARCHAR(100) UNIQUE NOT NULL,
  first_visit TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  last_visit TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  visit_count INT DEFAULT 1,
  referrer TEXT,
  user_agent TEXT
);

CREATE INDEX idx_users_session_id ON users(session_id);
CREATE INDEX idx_users_first_visit ON users(first_visit DESC);

-- Page metrics table (aggregated page view data)
CREATE TABLE IF NOT EXISTS page_metrics (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  page_url TEXT NOT NULL,
  page_title VARCHAR(500),
  total_views INT DEFAULT 0,
  unique_sessions INT DEFAULT 0,
  avg_time_on_page INT DEFAULT 0, -- in seconds
  avg_scroll_depth INT DEFAULT 0, -- percentage
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_page_metrics_page_url ON page_metrics(page_url);
CREATE INDEX idx_page_metrics_updated_at ON page_metrics(updated_at DESC);

-- Button metrics table (aggregated click data)
CREATE TABLE IF NOT EXISTS button_metrics (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  button_id VARCHAR(100) NOT NULL,
  button_text VARCHAR(500),
  page_url TEXT,
  click_count INT DEFAULT 0,
  unique_sessions INT DEFAULT 0,
  ctr DECIMAL(5, 2), -- click-through rate
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_button_metrics_button_id ON button_metrics(button_id);
CREATE INDEX idx_button_metrics_page_url ON button_metrics(page_url);
CREATE INDEX idx_button_metrics_click_count ON button_metrics(click_count DESC);

-- Form metrics table (aggregated form interaction data)
CREATE TABLE IF NOT EXISTS form_metrics (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  field_name VARCHAR(100) NOT NULL,
  field_type VARCHAR(50), -- text, select, textarea, etc
  page_url TEXT,
  interaction_count INT DEFAULT 0,
  unique_sessions INT DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_form_metrics_field_name ON form_metrics(field_name);
CREATE INDEX idx_form_metrics_page_url ON form_metrics(page_url);
CREATE INDEX idx_form_metrics_interaction_count ON form_metrics(interaction_count DESC);

-- Enable row level security (optional)
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE button_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_metrics ENABLE ROW LEVEL SECURITY;

-- RLS Policies (allow inserts from backend, select for authenticated users)
CREATE POLICY "Allow inserts from backend" ON events FOR INSERT USING (TRUE);
CREATE POLICY "Allow select for authenticated" ON events FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow inserts for users" ON users FOR INSERT USING (TRUE);
CREATE POLICY "Allow select for authenticated" ON users FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow select page_metrics" ON page_metrics FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow select button_metrics" ON button_metrics FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow select form_metrics" ON form_metrics FOR SELECT USING (auth.role() = 'authenticated');
