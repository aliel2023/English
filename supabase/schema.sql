-- Alielenglish Supabase Database Schema

-- 1. Users Table (Extended profile data)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    level TEXT DEFAULT 'A1',
    is_pro BOOLEAN DEFAULT FALSE,
    pro_expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Users can only read and update their own profile
CREATE POLICY "Users can view own profile" 
    ON public.users FOR SELECT 
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
    ON public.users FOR UPDATE 
    USING (auth.uid() = id);

-- 2. AI Usage Tracking (Limits free tier to 20 queries/day)
CREATE TABLE IF NOT EXISTS public.ai_usage (
    user_id UUID REFERENCES auth.users(id) PRIMARY KEY,
    query_count INTEGER DEFAULT 0,
    last_reset_date DATE DEFAULT CURRENT_DATE
);

ALTER TABLE public.ai_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own usage" 
    ON public.ai_usage FOR SELECT 
    USING (auth.uid() = user_id);

-- Secure Edge Function Trigger to update ai_usage (handled server-side)
-- 3. Daily Reset Function (Can be run via pg_cron or edge function)
CREATE OR REPLACE FUNCTION reset_daily_ai_usage()
RETURNS void AS $$
BEGIN
    UPDATE public.ai_usage
    SET query_count = 0, last_reset_date = CURRENT_DATE
    WHERE last_reset_date < CURRENT_DATE;
END;
$$ LANGUAGE plpgsql;
