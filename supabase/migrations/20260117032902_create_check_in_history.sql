-- Create check_in_history table to store user check-in history
CREATE TABLE IF NOT EXISTS public.check_in_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  location_id TEXT NOT NULL,
  location_name TEXT NOT NULL,
  address TEXT,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  checked_in_at TIMESTAMPTZ NOT NULL,
  checked_out_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_check_in_history_user_id ON public.check_in_history(user_id);
CREATE INDEX IF NOT EXISTS idx_check_in_history_checked_in_at ON public.check_in_history(checked_in_at DESC);
CREATE INDEX IF NOT EXISTS idx_check_in_history_location_id ON public.check_in_history(location_id);

-- Enable RLS
ALTER TABLE public.check_in_history ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own history
CREATE POLICY "Users can view own check-in history"
  ON public.check_in_history
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: System can insert history (via service role)
CREATE POLICY "Service role can insert check-in history"
  ON public.check_in_history
  FOR INSERT
  WITH CHECK (true);
