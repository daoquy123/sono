-- Add performance indexes for better query performance

-- Index for debts table
CREATE INDEX IF NOT EXISTS idx_debts_created_at ON debts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_debts_is_paid ON debts(is_paid);
CREATE INDEX IF NOT EXISTS idx_debts_debtor_name ON debts(debtor_name);
CREATE INDEX IF NOT EXISTS idx_debts_updated_at ON debts(updated_at DESC);

-- Index for profiles table
CREATE INDEX IF NOT EXISTS idx_profiles_is_admin ON profiles(is_admin);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- Composite index for common queries
CREATE INDEX IF NOT EXISTS idx_debts_status_created ON debts(is_paid, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_debts_name_search ON debts USING gin(to_tsvector('vietnamese', debtor_name || ' ' || COALESCE(description, '')));

-- Add comments for documentation
COMMENT ON INDEX idx_debts_created_at IS 'Index for sorting debts by creation date (newest first)';
COMMENT ON INDEX idx_debts_is_paid IS 'Index for filtering by payment status';
COMMENT ON INDEX idx_debts_debtor_name IS 'Index for searching by debtor name';
COMMENT ON INDEX idx_debts_updated_at IS 'Index for sorting by last update';
COMMENT ON INDEX idx_profiles_is_admin IS 'Index for checking admin permissions';
COMMENT ON INDEX idx_profiles_email IS 'Index for email lookups';
COMMENT ON INDEX idx_debts_status_created IS 'Composite index for filtering by status and sorting by date';
COMMENT ON INDEX idx_debts_name_search IS 'Full-text search index for debtor name and description'; 