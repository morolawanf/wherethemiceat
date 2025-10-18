-- Enable PostGIS extension for geospatial queries
CREATE EXTENSION IF NOT EXISTS postgis;

-- Reports table
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  validity_expires_at TIMESTAMPTZ NOT NULL,
  upvote_count INT DEFAULT 0,
  downvote_count INT DEFAULT 0,
  -- Geospatial index for proximity queries
  location GEOGRAPHY(POINT, 4326) GENERATED ALWAYS AS (
    ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)
  ) STORED
);

-- Create indexes for performance
CREATE INDEX idx_reports_location ON reports USING GIST(location);
CREATE INDEX idx_reports_expires ON reports(validity_expires_at);
CREATE INDEX idx_reports_created ON reports(created_at DESC);

-- Votes table
CREATE TABLE IF NOT EXISTS votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  report_id UUID REFERENCES reports(id) ON DELETE CASCADE,
  fingerprint_hash TEXT NOT NULL,
  ip_hash TEXT NOT NULL,
  vote_type TEXT CHECK (vote_type IN ('up', 'down')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(report_id, fingerprint_hash, ip_hash)
);

CREATE INDEX idx_votes_report ON votes(report_id);
CREATE INDEX idx_votes_fingerprint ON votes(fingerprint_hash);

-- Comments table
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  report_id UUID REFERENCES reports(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  fingerprint_hash TEXT NOT NULL,
  ip_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  report_count INT DEFAULT 0
);

CREATE INDEX idx_comments_report ON comments(report_id, created_at DESC);
CREATE INDEX idx_comments_fingerprint ON comments(fingerprint_hash);

-- Comment reports table
CREATE TABLE IF NOT EXISTS comment_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  fingerprint_hash TEXT NOT NULL,
  ip_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(comment_id, fingerprint_hash, ip_hash)
);

CREATE INDEX idx_comment_reports_comment ON comment_reports(comment_id);

-- Function to auto-delete expired reports
CREATE OR REPLACE FUNCTION delete_expired_reports()
RETURNS void AS $$
BEGIN
  DELETE FROM reports WHERE validity_expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Function to get nearby reports (within specified radius)
CREATE OR REPLACE FUNCTION get_nearby_reports(
  user_lat DECIMAL,
  user_lng DECIMAL,
  radius_meters INT DEFAULT 50
)
RETURNS TABLE(
  id UUID,
  latitude DECIMAL,
  longitude DECIMAL,
  distance_meters FLOAT,
  upvote_count INT,
  downvote_count INT,
  validity_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    r.id,
    r.latitude,
    r.longitude,
    ST_Distance(
      r.location,
      ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)
    )::FLOAT AS distance_meters,
    r.upvote_count,
    r.downvote_count,
    r.validity_expires_at,
    r.created_at
  FROM reports r
  WHERE ST_DWithin(
    r.location,
    ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326),
    radius_meters
  )
  AND r.validity_expires_at > NOW()
  ORDER BY distance_meters;
END;
$$ LANGUAGE plpgsql;

-- Function to update vote counts
CREATE OR REPLACE FUNCTION update_vote_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.vote_type = 'up' THEN
      UPDATE reports SET upvote_count = upvote_count + 1 WHERE id = NEW.report_id;
    ELSIF NEW.vote_type = 'down' THEN
      UPDATE reports SET downvote_count = downvote_count + 1 WHERE id = NEW.report_id;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.vote_type = 'up' THEN
      UPDATE reports SET upvote_count = upvote_count - 1 WHERE id = OLD.report_id;
    ELSIF OLD.vote_type = 'down' THEN
      UPDATE reports SET downvote_count = downvote_count - 1 WHERE id = OLD.report_id;
    END IF;
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.vote_type = 'up' THEN
      UPDATE reports SET upvote_count = upvote_count - 1 WHERE id = OLD.report_id;
    ELSIF OLD.vote_type = 'down' THEN
      UPDATE reports SET downvote_count = downvote_count - 1 WHERE id = OLD.report_id;
    END IF;
    IF NEW.vote_type = 'up' THEN
      UPDATE reports SET upvote_count = upvote_count + 1 WHERE id = NEW.report_id;
    ELSIF NEW.vote_type = 'down' THEN
      UPDATE reports SET downvote_count = downvote_count + 1 WHERE id = NEW.report_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update vote counts automatically
CREATE TRIGGER update_vote_counts_trigger
AFTER INSERT OR UPDATE OR DELETE ON votes
FOR EACH ROW EXECUTE FUNCTION update_vote_counts();

-- Function to update comment report counts
CREATE OR REPLACE FUNCTION update_comment_report_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE comments SET report_count = report_count + 1 WHERE id = NEW.comment_id;
    -- Auto-delete comment if it reaches threshold (15 reports)
    DELETE FROM comments WHERE id = NEW.comment_id AND report_count >= 15;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE comments SET report_count = report_count - 1 WHERE id = OLD.comment_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update comment report counts automatically
CREATE TRIGGER update_comment_report_counts_trigger
AFTER INSERT OR DELETE ON comment_reports
FOR EACH ROW EXECUTE FUNCTION update_comment_report_counts();

-- Enable Row Level Security (RLS) for anonymous access
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE comment_reports ENABLE ROW LEVEL SECURITY;

-- Policies for anonymous read access
CREATE POLICY "Allow anonymous read on reports" ON reports FOR SELECT USING (true);
CREATE POLICY "Allow anonymous insert on reports" ON reports FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous read on votes" ON votes FOR SELECT USING (true);
CREATE POLICY "Allow anonymous insert on votes" ON votes FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous delete on votes" ON votes FOR DELETE USING (true);
CREATE POLICY "Allow anonymous read on comments" ON comments FOR SELECT USING (true);
CREATE POLICY "Allow anonymous insert on comments" ON comments FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous read on comment_reports" ON comment_reports FOR SELECT USING (true);
CREATE POLICY "Allow anonymous insert on comment_reports" ON comment_reports FOR INSERT WITH CHECK (true);

