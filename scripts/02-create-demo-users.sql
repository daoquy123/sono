-- Insert demo users (you'll need to create these users in Supabase Auth first)
-- Then update their profiles

-- This is just a template - you'll need to replace the UUIDs with actual user IDs from auth.users
INSERT INTO profiles (id, email, is_admin) VALUES
  ('00000000-0000-0000-0000-000000000001', 'admin@example.com', true),
  ('00000000-0000-0000-0000-000000000002', 'user@example.com', false)
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  is_admin = EXCLUDED.is_admin;
