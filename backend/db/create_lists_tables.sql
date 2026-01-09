-- ============================================
-- Lists Tables and Policies Setup
-- Run this in Supabase SQL Editor
-- ============================================

-- Step 1: Create lists table
CREATE TABLE IF NOT EXISTS public.lists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT TRUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Step 2: Create list_problems junction table
CREATE TABLE IF NOT EXISTS public.list_problems (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  list_id UUID REFERENCES public.lists(id) ON DELETE CASCADE NOT NULL,
  problem_qid INTEGER NOT NULL,
  position INTEGER NOT NULL,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE(list_id, problem_qid)
);

-- Step 3: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_lists_user_id ON public.lists(user_id);
CREATE INDEX IF NOT EXISTS idx_lists_public ON public.lists(is_public) WHERE is_public = TRUE;
CREATE INDEX IF NOT EXISTS idx_list_problems_list_id ON public.list_problems(list_id);
CREATE INDEX IF NOT EXISTS idx_list_problems_position ON public.list_problems(list_id, position);

-- Step 4: Enable Row Level Security on both tables
ALTER TABLE public.lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.list_problems ENABLE ROW LEVEL SECURITY;

-- Step 5: RLS Policies for lists table

-- Policy: Users can view public lists OR their own lists
CREATE POLICY "Users can view public lists or own lists"
  ON public.lists FOR SELECT
  USING (is_public = TRUE OR auth.uid() = user_id);

-- Policy: Users can only create lists for themselves
CREATE POLICY "Users can create own lists"
  ON public.lists FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can only update their own lists
CREATE POLICY "Users can update own lists"
  ON public.lists FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can only delete their own lists
CREATE POLICY "Users can delete own lists"
  ON public.lists FOR DELETE
  USING (auth.uid() = user_id);

-- Step 6: RLS Policies for list_problems table

-- Policy: Users can view problems for public lists OR lists they own
CREATE POLICY "Users can view problems for accessible lists"
  ON public.list_problems FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.lists
      WHERE lists.id = list_problems.list_id
      AND (lists.is_public = TRUE OR lists.user_id = auth.uid())
    )
  );

-- Policy: Users can only add problems to their own lists
CREATE POLICY "Users can add problems to own lists"
  ON public.list_problems FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.lists
      WHERE lists.id = list_problems.list_id
      AND lists.user_id = auth.uid()
    )
  );

-- Policy: Users can only update problems in their own lists
CREATE POLICY "Users can update problems in own lists"
  ON public.list_problems FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.lists
      WHERE lists.id = list_problems.list_id
      AND lists.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.lists
      WHERE lists.id = list_problems.list_id
      AND lists.user_id = auth.uid()
    )
  );

-- Policy: Users can only delete problems from their own lists
CREATE POLICY "Users can delete problems from own lists"
  ON public.list_problems FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.lists
      WHERE lists.id = list_problems.list_id
      AND lists.user_id = auth.uid()
    )
  );

-- Step 7: Function to update updated_at timestamp (reuse existing if available)
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 8: Trigger to auto-update updated_at on lists table
DROP TRIGGER IF EXISTS set_lists_updated_at ON public.lists;

CREATE TRIGGER set_lists_updated_at
  BEFORE UPDATE ON public.lists
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ============================================
-- Verification Queries (optional - run to test)
-- ============================================

-- Check if tables were created
-- SELECT * FROM public.lists LIMIT 5;
-- SELECT * FROM public.list_problems LIMIT 5;

-- Check if indexes exist
-- SELECT indexname, tablename FROM pg_indexes WHERE tablename IN ('lists', 'list_problems');

-- Check RLS policies
-- SELECT * FROM pg_policies WHERE tablename IN ('lists', 'list_problems');

