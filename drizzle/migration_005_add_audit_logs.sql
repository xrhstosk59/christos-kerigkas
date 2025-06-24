-- Migration 005: Audit Logs Table
-- Δημιουργία πίνακα για audit logging

-- Δημιουργία του πίνακα audit_logs
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(50),
  resource_id VARCHAR(255),
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  session_id VARCHAR(255),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  severity VARCHAR(20) DEFAULT 'INFO',
  source VARCHAR(50) DEFAULT 'WEB'
);

-- Δημιουργία indexes για performance
CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON audit_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_audit_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_audit_severity ON audit_logs(severity);
CREATE INDEX IF NOT EXISTS idx_audit_source ON audit_logs(source);

-- Composite indexes για συχνές αναζητήσεις
CREATE INDEX IF NOT EXISTS idx_audit_user_action ON audit_logs(user_id, action);
CREATE INDEX IF NOT EXISTS idx_audit_resource_action ON audit_logs(resource_type, action);
CREATE INDEX IF NOT EXISTS idx_audit_timestamp_severity ON audit_logs(timestamp, severity);

-- Partial index για σφάλματα και critical events
CREATE INDEX IF NOT EXISTS idx_audit_errors ON audit_logs(timestamp, action) 
  WHERE severity IN ('ERROR', 'CRITICAL');

-- Index για admin actions
CREATE INDEX IF NOT EXISTS idx_audit_admin_actions ON audit_logs(timestamp, user_id, action) 
  WHERE action LIKE 'ADMIN_%';

-- Comments για documentation
COMMENT ON TABLE audit_logs IS 'Comprehensive audit logging for all user and system actions';
COMMENT ON COLUMN audit_logs.user_id IS 'ID of the user who performed the action (null for system actions)';
COMMENT ON COLUMN audit_logs.action IS 'The action that was performed';
COMMENT ON COLUMN audit_logs.resource_type IS 'Type of resource affected (USER, BLOG_POST, etc.)';
COMMENT ON COLUMN audit_logs.resource_id IS 'ID of the specific resource affected';
COMMENT ON COLUMN audit_logs.details IS 'Additional context data in JSON format';
COMMENT ON COLUMN audit_logs.ip_address IS 'IP address of the client (IPv4/IPv6)';
COMMENT ON COLUMN audit_logs.user_agent IS 'User agent string from the client';
COMMENT ON COLUMN audit_logs.session_id IS 'Session ID for tracking user sessions';
COMMENT ON COLUMN audit_logs.severity IS 'Severity level: INFO, WARN, ERROR, CRITICAL';
COMMENT ON COLUMN audit_logs.source IS 'Source of the action: WEB, API, SYSTEM, CLI';

-- Function για automatic cleanup των παλιών audit logs
CREATE OR REPLACE FUNCTION cleanup_old_audit_logs()
RETURNS TRIGGER AS $$
BEGIN
  -- Καθαρισμός audit logs παλαιότερων από 1 έτος (εκτός από CRITICAL)
  DELETE FROM audit_logs 
  WHERE timestamp < NOW() - INTERVAL '1 year'
    AND severity != 'CRITICAL';
  
  -- Καθαρισμός CRITICAL logs παλαιότερων από 3 έτη
  DELETE FROM audit_logs 
  WHERE timestamp < NOW() - INTERVAL '3 years'
    AND severity = 'CRITICAL';
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger που τρέχει cleanup κάθε 1000 νέα records
CREATE OR REPLACE TRIGGER trigger_cleanup_audit_logs
  AFTER INSERT ON audit_logs
  FOR EACH STATEMENT
  WHEN (pg_trigger_depth() = 0)
  EXECUTE FUNCTION cleanup_old_audit_logs();

-- Function για audit log analytics
CREATE OR REPLACE FUNCTION get_audit_stats(days_back INTEGER DEFAULT 30)
RETURNS TABLE (
  total_actions BIGINT,
  unique_users BIGINT,
  error_count BIGINT,
  critical_count BIGINT,
  top_actions TEXT[]
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*) as total_actions,
    COUNT(DISTINCT user_id) as unique_users,
    COUNT(*) FILTER (WHERE severity = 'ERROR') as error_count,
    COUNT(*) FILTER (WHERE severity = 'CRITICAL') as critical_count,
    ARRAY_AGG(DISTINCT action ORDER BY COUNT(*) DESC LIMIT 10) as top_actions
  FROM audit_logs 
  WHERE timestamp >= NOW() - INTERVAL '1 day' * days_back;
END;
$$ LANGUAGE plpgsql;

-- View για εύκολη πρόσβαση σε recent audit events
CREATE OR REPLACE VIEW recent_audit_events AS
SELECT 
  id,
  user_id,
  action,
  resource_type,
  resource_id,
  ip_address,
  timestamp,
  severity,
  source,
  details->>'error' as error_message
FROM audit_logs 
WHERE timestamp >= NOW() - INTERVAL '24 hours'
ORDER BY timestamp DESC;

-- View για security events
CREATE OR REPLACE VIEW security_events AS
SELECT 
  id,
  user_id,
  action,
  ip_address,
  timestamp,
  severity,
  details
FROM audit_logs 
WHERE action IN (
  'LOGIN_FAILED', 'UNAUTHORIZED_ACCESS_ATTEMPT', 'SUSPICIOUS_ACTIVITY',
  'RATE_LIMIT_EXCEEDED', 'ACCOUNT_LOCKED', '2FA_VERIFY_FAILED'
) OR severity IN ('ERROR', 'CRITICAL')
ORDER BY timestamp DESC;