-- Create footprint_entries table for storing carbon emission calculations
CREATE TABLE IF NOT EXISTS footprint_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  co2e DECIMAL(10,4) NOT NULL,
  activity VARCHAR(50) NOT NULL,
  value DECIMAL(10,4) NOT NULL,
  unit VARCHAR(20) NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  region VARCHAR(10) DEFAULT 'IN'
);

-- Create index on timestamp for efficient querying by date
CREATE INDEX IF NOT EXISTS idx_footprint_entries_timestamp ON footprint_entries(timestamp);

-- Create index on activity for efficient filtering by activity type
CREATE INDEX IF NOT EXISTS idx_footprint_entries_activity ON footprint_entries(activity);

-- Enable Row Level Security (RLS)
ALTER TABLE footprint_entries ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (for now - can be restricted later)
CREATE POLICY "Allow all operations on footprint_entries" ON footprint_entries
  FOR ALL USING (true);