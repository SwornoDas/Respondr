-- Supabase Schema for Respondr
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- Enable Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Custom Types
CREATE TYPE incident_type AS ENUM ('Medical', 'Fire', 'Security');
CREATE TYPE incident_status AS ENUM ('REPORTED', 'ACKNOWLEDGED', 'IN_PROGRESS', 'RESOLVED');

-- 2. Tables

-- Profiles: Linked to auth.users
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    role TEXT DEFAULT 'staff' CHECK (role IN ('staff', 'admin')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Staff Status: Real-time availability
CREATE TABLE public.staff_status (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    is_online BOOLEAN DEFAULT false,
    last_seen TIMESTAMPTZ DEFAULT NOW()
);

-- Incidents: SOS alerts
CREATE TABLE public.incidents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type incident_type NOT NULL,
    room VARCHAR(50) NOT NULL,
    description TEXT,
    status incident_status NOT NULL DEFAULT 'REPORTED',
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    assigned_to UUID REFERENCES public.profiles(id)
);

-- 3. Security (RLS)

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Users can view their own profile" 
ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);

-- Staff Status Policies
CREATE POLICY "Authenticated staff can view status roster" 
ON public.staff_status FOR SELECT TO authenticated USING (true);

CREATE POLICY "Staff can update their own online status" 
ON public.staff_status FOR UPDATE TO authenticated USING (true);

-- Incidents Policies
CREATE POLICY "Public can trigger SOS" 
ON public.incidents FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Staff can manage all incidents" 
ON public.incidents FOR ALL TO authenticated USING (true);

-- 4. Triggers & Automation

-- Trigger to create profile on auth signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, role)
    VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name', 'staff');
    
    -- Also initialize staff_status record
    INSERT INTO public.staff_status (email, name)
    VALUES (NEW.email, NEW.raw_user_meta_data->>'full_name');
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. Real-time Publications
ALTER PUBLICATION supabase_realtime ADD TABLE public.incidents;
ALTER PUBLICATION supabase_realtime ADD TABLE public.staff_status;
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
