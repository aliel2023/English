-- ================================================================
-- Alielenglish — Supabase Database Schema
-- Tam Supabase miqrasiyası (Firebase silindi)
-- Bu schema scripts/auth.js-dəki bütün sahələrə uyğundur
-- ================================================================

-- 1. Users Table (auth.js-dəki userData strukturuna tam uyğun)
CREATE TABLE IF NOT EXISTS public.users (
    uid UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    name TEXT NOT NULL DEFAULT '',
    email TEXT UNIQUE NOT NULL,
    level TEXT NOT NULL DEFAULT 'A1' CHECK (level IN ('A1','A2','B1','B2','C1','C2')),
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user','admin')),
    
    -- Premium
    premium_active BOOLEAN DEFAULT FALSE,
    premium_expires_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    
    -- Streak & Activity
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    last_active_date TEXT DEFAULT '',
    active_days INTEGER DEFAULT 1,
    
    -- Learning Stats
    words_learned INTEGER DEFAULT 0,
    tests_completed INTEGER DEFAULT 0,
    
    -- JSON Fields
    badges JSONB DEFAULT '["🌱 Başlanğıc"]'::jsonb,
    favorites JSONB DEFAULT '{"words":[],"grammar":[],"phrases":[]}'::jsonb,
    weekly_activity JSONB DEFAULT '[false,false,false,false,false,false,false]'::jsonb,
    test_history JSONB DEFAULT '[]'::jsonb,
    privacy JSONB DEFAULT '{"showProfile":false,"showStreak":true}'::jsonb,
    
    -- AI Usage
    daily_query_count INTEGER DEFAULT 0,
    last_reset_date TEXT DEFAULT '',
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- ================================================================
-- RLS Policies
-- ================================================================

-- İstifadəçi öz profilini oxuya bilər
CREATE POLICY "Users can view own profile" 
    ON public.users FOR SELECT 
    USING (auth.uid() = uid);

-- İstifadəçi öz profilini yeniləyə bilər (role və email sahələri xaric)
CREATE POLICY "Users can update own profile" 
    ON public.users FOR UPDATE 
    USING (auth.uid() = uid)
    WITH CHECK (
        auth.uid() = uid
        AND role = (SELECT role FROM public.users WHERE uid = auth.uid())
        AND email = (SELECT email FROM public.users WHERE uid = auth.uid())
    );

-- İstifadəçi öz profilini yarada bilər
CREATE POLICY "Users can insert own profile"
    ON public.users FOR INSERT
    WITH CHECK (auth.uid() = uid);

-- Admin bütün profilləri oxuya bilər
CREATE POLICY "Admin can view all profiles"
    ON public.users FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.users u 
            WHERE u.uid = auth.uid() AND u.role = 'admin'
        )
    );

-- Admin bütün profilləri yeniləyə bilər (premium vermək daxil)
CREATE POLICY "Admin can update all profiles"
    ON public.users FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.users u 
            WHERE u.uid = auth.uid() AND u.role = 'admin'
        )
    );

-- Admin istifadəçi silə bilər
CREATE POLICY "Admin can delete users"
    ON public.users FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.users u 
            WHERE u.uid = auth.uid() AND u.role = 'admin'
        )
    );

-- ================================================================
-- 2. Leads Table (Email toplama / qeydiyyat izləmə)
-- ================================================================
CREATE TABLE IF NOT EXISTS public.leads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    level TEXT DEFAULT 'A1',
    source TEXT DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Yalnız autentik istifadəçilər lead əlavə edə bilər
CREATE POLICY "Authenticated users can create leads"
    ON public.leads FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

-- Yalnız admin oxuya bilər
CREATE POLICY "Admin can view leads"
    ON public.leads FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.users u 
            WHERE u.uid = auth.uid() AND u.role = 'admin'
        )
    );

-- ================================================================
-- 3. AI Usage Table (Gündəlik sorğu limiti izləmə)
-- ================================================================
CREATE TABLE IF NOT EXISTS public.ai_usage (
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    query_count INTEGER DEFAULT 0,
    last_reset_date DATE DEFAULT CURRENT_DATE
);

ALTER TABLE public.ai_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own AI usage"
    ON public.ai_usage FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update own AI usage"
    ON public.ai_usage FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own AI usage"
    ON public.ai_usage FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- ================================================================
-- 4. Reports / Feedback Table
-- ================================================================
CREATE TABLE IF NOT EXISTS public.reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    message TEXT NOT NULL CHECK (length(message) BETWEEN 5 AND 2000),
    type TEXT DEFAULT 'feedback',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can create reports"
    ON public.reports FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Admin can view reports"
    ON public.reports FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.users u 
            WHERE u.uid = auth.uid() AND u.role = 'admin'
        )
    );

-- ================================================================
-- 5. Helper Functions
-- ================================================================

-- Gündəlik AI usage sıfırlama (pg_cron ilə işlədilə bilər)
CREATE OR REPLACE FUNCTION reset_daily_ai_usage()
RETURNS void AS $$
BEGIN
    UPDATE public.ai_usage
    SET query_count = 0, last_reset_date = CURRENT_DATE
    WHERE last_reset_date < CURRENT_DATE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Auto-update updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- ================================================================
-- 6. Indexes (Performans üçün)
-- ================================================================
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_leads_email ON public.leads(email);
CREATE INDEX IF NOT EXISTS idx_reports_user_id ON public.reports(user_id);
