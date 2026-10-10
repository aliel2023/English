-- ================================================================
-- Alielenglish — RLS "infinite recursion" düzəlişi
-- Supabase Dashboard → SQL Editor → bu faylı yapışdır → RUN
-- ================================================================
-- Problem: users cədvəlinin RLS policy-ləri öz-özünə (users cədvəlini)
-- sorğulayırdı → "infinite recursion detected in policy for relation users".
-- Həll: role yoxlamasını SECURITY DEFINER funksiyalara çıxarırıq (RLS bypass).

-- 1) Köməkçi funksiyalar (SECURITY DEFINER → recursion yox)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.users
        WHERE uid = auth.uid() AND role = 'admin'
    );
$$;

CREATE OR REPLACE FUNCTION public.own_role()
RETURNS text
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
    SELECT role FROM public.users WHERE uid = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.own_email()
RETURNS text
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
    SELECT email FROM public.users WHERE uid = auth.uid();
$$;

GRANT EXECUTE ON FUNCTION public.is_admin() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.own_role() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.own_email() TO anon, authenticated;

-- 2) users: öz profilini yeniləmə
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile"
    ON public.users FOR UPDATE
    USING (auth.uid() = uid)
    WITH CHECK (
        auth.uid() = uid
        AND role = public.own_role()
        AND email = public.own_email()
    );

-- 3) users: admin policy-ləri
DROP POLICY IF EXISTS "Admin can view all profiles" ON public.users;
CREATE POLICY "Admin can view all profiles"
    ON public.users FOR SELECT
    USING (public.is_admin());

DROP POLICY IF EXISTS "Admin can update all profiles" ON public.users;
CREATE POLICY "Admin can update all profiles"
    ON public.users FOR UPDATE
    USING (public.is_admin());

DROP POLICY IF EXISTS "Admin can delete users" ON public.users;
CREATE POLICY "Admin can delete users"
    ON public.users FOR DELETE
    USING (public.is_admin());

-- 4) leads: admin oxu
DROP POLICY IF EXISTS "Admin can view leads" ON public.leads;
CREATE POLICY "Admin can view leads"
    ON public.leads FOR SELECT
    USING (public.is_admin());

-- 5) reports: admin oxu
DROP POLICY IF EXISTS "Admin can view reports" ON public.reports;
CREATE POLICY "Admin can view reports"
    ON public.reports FOR SELECT
    USING (public.is_admin());

-- ================================================================
-- 6) Əskik cədvəllər (leads, reports) — yoxdurlarsa yaradılır
-- ================================================================

-- leads (email toplama)
CREATE TABLE IF NOT EXISTS public.leads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    level TEXT DEFAULT 'A1',
    source TEXT DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Authenticated users can create leads" ON public.leads;
CREATE POLICY "Authenticated users can create leads"
    ON public.leads FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "Admin can view leads" ON public.leads;
CREATE POLICY "Admin can view leads"
    ON public.leads FOR SELECT
    USING (public.is_admin());
CREATE INDEX IF NOT EXISTS idx_leads_email ON public.leads(email);

-- reports (feedback)
CREATE TABLE IF NOT EXISTS public.reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    message TEXT NOT NULL CHECK (length(message) BETWEEN 5 AND 2000),
    type TEXT DEFAULT 'feedback',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Authenticated users can create reports" ON public.reports;
CREATE POLICY "Authenticated users can create reports"
    ON public.reports FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "Admin can view reports" ON public.reports;
CREATE POLICY "Admin can view reports"
    ON public.reports FOR SELECT
    USING (public.is_admin());
CREATE INDEX IF NOT EXISTS idx_reports_user_id ON public.reports(user_id);
