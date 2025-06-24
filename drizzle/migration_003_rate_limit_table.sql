-- Migration 003: Rate Limit Attempts Table
-- Δημιουργία πίνακα για rate limiting attempts

-- Δημιουργία του πίνακα rate_limit_attempts
CREATE TABLE IF NOT EXISTS rate_limit_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier VARCHAR(255) NOT NULL,
  endpoint VARCHAR(255) DEFAULT 'general',
  attempts INTEGER DEFAULT 1,
  reset_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (NOW() + INTERVAL '1 hour'),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Δημιουργία indexes για performance
CREATE INDEX IF NOT EXISTS idx_rate_limit_identifier_endpoint 
  ON rate_limit_attempts(identifier, endpoint);

CREATE INDEX IF NOT EXISTS idx_rate_limit_reset_time 
  ON rate_limit_attempts(reset_time);

CREATE INDEX IF NOT EXISTS idx_rate_limit_created_at 
  ON rate_limit_attempts(created_at);

-- Δημιουργία composite index για γρήγορες αναζητήσεις
CREATE INDEX IF NOT EXISTS idx_rate_limit_active_attempts 
  ON rate_limit_attempts(identifier, endpoint, created_at) 
  WHERE reset_time > NOW();

-- Comment για documentation
COMMENT ON TABLE rate_limit_attempts IS 'Rate limiting attempts tracking table';
COMMENT ON COLUMN rate_limit_attempts.identifier IS 'IP address or user identifier';
COMMENT ON COLUMN rate_limit_attempts.endpoint IS 'API endpoint or action being rate limited';
COMMENT ON COLUMN rate_limit_attempts.attempts IS 'Number of attempts made';
COMMENT ON COLUMN rate_limit_attempts.reset_time IS 'When the rate limit window resets';

-- Trigger για automatic cleanup των παλιών records
CREATE OR REPLACE FUNCTION cleanup_old_rate_limit_attempts()
RETURNS TRIGGER AS $$
BEGIN
  -- Καθαρισμός records παλαιότερων από 24 ώρες
  DELETE FROM rate_limit_attempts 
  WHERE created_at < NOW() - INTERVAL '24 hours';
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger που τρέχει κάθε φορά που γίνεται insert
CREATE OR REPLACE TRIGGER trigger_cleanup_rate_limit_attempts
  AFTER INSERT ON rate_limit_attempts
  FOR EACH STATEMENT
  EXECUTE FUNCTION cleanup_old_rate_limit_attempts();