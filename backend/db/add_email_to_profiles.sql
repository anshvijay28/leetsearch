-- ============================================
-- Migration: Add Email to Profiles Table
-- Run this in Supabase SQL Editor
-- ============================================

-- Step 1: Add email column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS email TEXT;

-- Step 2: Create index for email lookups (performance)
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- Step 3: Add provider column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS provider TEXT;

-- Step 4: Create index for provider lookups (performance)
CREATE INDEX IF NOT EXISTS idx_profiles_provider ON public.profiles(provider);

-- Step 5: Backfill existing profiles with email and provider from auth.users
-- (Update profiles that don't have email yet)
UPDATE public.profiles p
SET 
  email = COALESCE(p.email, u.email),
  provider = COALESCE(
    p.provider,
    u.app_metadata->>'provider',
    CASE 
      WHEN u.email IS NOT NULL THEN 'email'
      ELSE NULL
    END
  )
FROM auth.users u
WHERE p.id = u.id;

-- Step 6: Update the handle_new_user() trigger function to populate email and provider
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  username_value TEXT;
  final_username TEXT;
  user_provider TEXT;
BEGIN
  username_value := COALESCE(
    NEW.raw_user_meta_data->>'username',
    SPLIT_PART(NEW.email, '@', 1)
  );
  
  final_username := public.generate_unique_username(username_value, NEW.id);
  
  -- Extract provider from app_metadata, default to 'email' if not OAuth
  user_provider := COALESCE(
    NEW.app_metadata->>'provider',
    CASE 
      WHEN NEW.email IS NOT NULL THEN 'email'
      ELSE NULL
    END
  );
  
  -- Insert profile with username, email, and provider
  INSERT INTO public.profiles (id, username, email, provider)
  VALUES (NEW.id, final_username, NEW.email, user_provider)
  ON CONFLICT (id) DO UPDATE 
    SET 
      email = COALESCE(EXCLUDED.email, public.profiles.email),
      provider = COALESCE(EXCLUDED.provider, public.profiles.provider); -- Update if profile already exists
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 7: Create function to sync email and provider updates from auth.users to profiles
CREATE OR REPLACE FUNCTION public.sync_user_email()
RETURNS TRIGGER AS $$
DECLARE
  user_provider TEXT;
BEGIN
  -- Extract provider from app_metadata
  user_provider := COALESCE(
    NEW.app_metadata->>'provider',
    CASE 
      WHEN NEW.email IS NOT NULL THEN 'email'
      ELSE NULL
    END
  );
  
  -- Update if email or provider changed
  IF (OLD.email IS DISTINCT FROM NEW.email) OR 
     (OLD.app_metadata->>'provider' IS DISTINCT FROM NEW.app_metadata->>'provider') THEN
    UPDATE public.profiles
    SET 
      email = COALESCE(NEW.email, public.profiles.email),
      provider = COALESCE(user_provider, public.profiles.provider)
    WHERE id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 8: Create trigger to sync email and provider when they change in auth.users
DROP TRIGGER IF EXISTS sync_email_on_update ON auth.users;

CREATE TRIGGER sync_email_on_update
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  WHEN (
    OLD.email IS DISTINCT FROM NEW.email OR
    OLD.app_metadata IS DISTINCT FROM NEW.app_metadata
  )
  EXECUTE FUNCTION public.sync_user_email();

-- ============================================
-- Verification Queries (optional - run to test)
-- ============================================

-- Check profiles with email and provider
-- SELECT id, username, email, provider FROM public.profiles LIMIT 5;

-- Count profiles with email populated
-- SELECT COUNT(*) FROM public.profiles WHERE email IS NOT NULL;

-- Count profiles by provider
-- SELECT 
--   provider,
--   COUNT(*) as count
-- FROM public.profiles
-- GROUP BY provider
-- ORDER BY count DESC;

-- Check if all profiles have email (should match total profiles count)
-- SELECT 
--   COUNT(*) as total_profiles,
--   COUNT(email) as profiles_with_email,
--   COUNT(*) - COUNT(email) as profiles_without_email,
--   COUNT(provider) as profiles_with_provider
-- FROM public.profiles;

