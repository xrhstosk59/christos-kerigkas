-- Migration 004: Add Two-Factor Authentication Fields
-- Προσθήκη των πεδίων για two-factor authentication στον πίνακα users

-- Προσθήκη νέων στηλών για 2FA
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS two_factor_enabled BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS two_factor_secret TEXT,
ADD COLUMN IF NOT EXISTS two_factor_backup_codes TEXT;

-- Δημιουργία index για γρήγορη αναζήτηση χρηστών με 2FA
CREATE INDEX IF NOT EXISTS two_factor_idx ON users(two_factor_enabled);

-- Comments για documentation
COMMENT ON COLUMN users.two_factor_enabled IS 'Whether the user has enabled two-factor authentication';
COMMENT ON COLUMN users.two_factor_secret IS 'Base32 encoded TOTP secret for 2FA';
COMMENT ON COLUMN users.two_factor_backup_codes IS 'JSON array of backup codes for 2FA recovery';

-- Set default value για υπάρχοντες χρήστες
UPDATE users SET two_factor_enabled = FALSE WHERE two_factor_enabled IS NULL;