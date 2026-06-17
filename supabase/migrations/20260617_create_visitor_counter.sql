-- Create site_visits table
CREATE TABLE IF NOT EXISTS site_visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_id TEXT NOT NULL,
  visited_at TIMESTAMPTZ DEFAULT NOW(),
  page_path TEXT,
  user_agent TEXT,
  ip_address TEXT
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_site_visits_visitor_id ON site_visits(visitor_id);
CREATE INDEX IF NOT EXISTS idx_site_visits_visited_at ON site_visits(visited_at DESC);

-- Create a stats table to store real-time counts
CREATE TABLE IF NOT EXISTS site_stats (
  id INTEGER PRIMARY KEY DEFAULT 1,
  total_visits BIGINT DEFAULT 0,
  unique_visitors BIGINT DEFAULT 0,
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT single_row_check CHECK (id = 1)
);

-- Insert initial row
INSERT INTO site_stats (id, total_visits, unique_visitors, last_updated)
VALUES (1, 0, 0, NOW())
ON CONFLICT (id) DO NOTHING;

-- Function to track a visit
CREATE OR REPLACE FUNCTION track_visit(
  p_visitor_id TEXT,
  p_page_path TEXT DEFAULT '/',
  p_user_agent TEXT DEFAULT NULL,
  p_ip_address TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_is_new_visitor BOOLEAN;
  v_total_visits BIGINT;
  v_unique_visitors BIGINT;
BEGIN
  -- Check if this is a new visitor
  v_is_new_visitor := NOT EXISTS (
    SELECT 1 FROM site_visits WHERE visitor_id = p_visitor_id
  );
  
  -- Insert the visit record
  INSERT INTO site_visits (visitor_id, page_path, user_agent, ip_address)
  VALUES (p_visitor_id, p_page_path, p_user_agent, p_ip_address);
  
  -- Update stats
  IF v_is_new_visitor THEN
    UPDATE site_stats
    SET 
      total_visits = total_visits + 1,
      unique_visitors = unique_visitors + 1,
      last_updated = NOW()
    WHERE id = 1
    RETURNING total_visits, unique_visitors INTO v_total_visits, v_unique_visitors;
  ELSE
    UPDATE site_stats
    SET 
      total_visits = total_visits + 1,
      last_updated = NOW()
    WHERE id = 1
    RETURNING total_visits, unique_visitors INTO v_total_visits, v_unique_visitors;
  END IF;
  
  -- Return the updated stats
  RETURN json_build_object(
    'total_visits', v_total_visits,
    'unique_visitors', v_unique_visitors,
    'is_new_visitor', v_is_new_visitor
  );
END;
$$;

-- Function to get current stats
CREATE OR REPLACE FUNCTION get_site_stats()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_stats JSON;
BEGIN
  SELECT json_build_object(
    'total_visits', total_visits,
    'unique_visitors', unique_visitors,
    'last_updated', last_updated
  )
  INTO v_stats
  FROM site_stats
  WHERE id = 1;
  
  RETURN v_stats;
END;
$$;

-- Enable Row Level Security
ALTER TABLE site_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_stats ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read stats (public access)
CREATE POLICY "Anyone can read site stats"
  ON site_stats
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Allow service role to insert visits
CREATE POLICY "Service role can insert visits"
  ON site_visits
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Allow service role to read visits
CREATE POLICY "Service role can read visits"
  ON site_visits
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Enable realtime for site_stats table
ALTER PUBLICATION supabase_realtime ADD TABLE site_stats;
