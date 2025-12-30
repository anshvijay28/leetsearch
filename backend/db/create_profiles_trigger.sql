-- ============================================
-- Profiles Table and Trigger Setup
-- Run this in Supabase SQL Editor
-- ============================================

-- Step 1: Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 2: Create index for fast username lookups
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);

-- Step 3: Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Step 4: RLS Policies

-- Policy: Everyone can read profiles (for username lookups and display)
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Policy: Users can insert their own profile (backup, though trigger handles this)
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Step 5: Function to generate unique username (using UUID digits for efficiency)
CREATE OR REPLACE FUNCTION public.generate_unique_username(
  base_username TEXT,
  user_id UUID
) RETURNS TEXT AS $$
DECLARE
  final_username TEXT;
  uuid_suffix TEXT;
  max_attempts INTEGER := 10;
  attempt INTEGER := 0;
BEGIN
  final_username := base_username;
  
  -- Try base username first
  WHILE EXISTS (SELECT 1 FROM public.profiles WHERE username = final_username AND id != user_id) 
    AND attempt < max_attempts 
  LOOP
    -- Generate 4 random hex digits from UUID
    uuid_suffix := LOWER(SUBSTRING(gen_random_uuid()::TEXT FROM 1 FOR 4));
    
    -- Append suffix, ensuring total length doesn't exceed 50 chars
    final_username := LEFT(base_username, 46) || '_' || uuid_suffix;
    
    attempt := attempt + 1;
  END LOOP;
  
  -- If still not unique after max attempts, use longer UUID suffix (extremely rare)
  IF EXISTS (SELECT 1 FROM public.profiles WHERE username = final_username AND id != user_id) THEN
    uuid_suffix := REPLACE(gen_random_uuid()::TEXT, '-', '');
    final_username := LEFT(base_username, 32) || '_' || LEFT(uuid_suffix, 8);
  END IF;
  
  RETURN final_username;
END;
$$ LANGUAGE plpgsql;

-- Step 6: Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  username_value TEXT;
  final_username TEXT;
BEGIN
  -- Extract username from user_metadata (for email/password signup)
  -- Or use email prefix as fallback (for Google OAuth)
  username_value := COALESCE(
    NEW.raw_user_meta_data->>'username',
    SPLIT_PART(NEW.email, '@', 1)
  );
  
  -- Generate unique username
  final_username := public.generate_unique_username(username_value, NEW.id);
  
  -- Insert profile
  INSERT INTO public.profiles (id, username)
  VALUES (NEW.id, final_username)
  ON CONFLICT (id) DO NOTHING; -- Prevent duplicate if trigger fires twice
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 7: Create trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Step 8: Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 9: Trigger to auto-update updated_at
DROP TRIGGER IF EXISTS set_updated_at ON public.profiles;

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ============================================
-- Verification Queries (optional - run to test)
-- ============================================

-- Check if table was created
-- SELECT * FROM public.profiles LIMIT 5;

-- Check if trigger exists
-- SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';

-- Check RLS policies
-- SELECT * FROM pg_policies WHERE tablename = 'profiles';

