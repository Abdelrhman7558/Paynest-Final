-- Create user_masareefy table for storing user profile data
CREATE TABLE IF NOT EXISTS user_masareefy (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  country TEXT,
  currency TEXT DEFAULT 'USD',
  language TEXT DEFAULT 'en',
  plan TEXT DEFAULT 'free',
  email_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_masareefy_user_id ON user_masareefy(user_id);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_masareefy_email ON user_masareefy(email);

-- Enable Row Level Security
ALTER TABLE user_masareefy ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own data
CREATE POLICY "Users can read own data"
  ON user_masareefy FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can update their own data
CREATE POLICY "Users can update own data"
  ON user_masareefy FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy: Allow insert during signup (service role)
CREATE POLICY "Allow insert during signup"
  ON user_masareefy FOR INSERT
  WITH CHECK (true);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_user_masareefy_updated_at
  BEFORE UPDATE ON user_masareefy
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create function to sync email_verified status from auth.users
CREATE OR REPLACE FUNCTION sync_email_verified()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE user_masareefy
  SET email_verified = (NEW.email_confirmed_at IS NOT NULL)
  WHERE user_id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to sync email verification status
CREATE TRIGGER on_auth_user_email_verified
  AFTER UPDATE OF email_confirmed_at ON auth.users
  FOR EACH ROW
  WHEN (OLD.email_confirmed_at IS DISTINCT FROM NEW.email_confirmed_at)
  EXECUTE FUNCTION sync_email_verified();
