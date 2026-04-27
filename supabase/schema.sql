-- Supabase Schema for CrisisSync

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enum for Incident Types
CREATE TYPE incident_type AS ENUM ('Medical', 'Fire', 'Security');

-- Enum for Incident Statuses
CREATE TYPE incident_status AS ENUM ('REPORTED', 'ACKNOWLEDGED', 'IN_PROGRESS', 'RESOLVED');

-- Create Incidents Table
CREATE TABLE public.incidents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type incident_type NOT NULL,
    room VARCHAR(50) NOT NULL,
    description TEXT,
    status incident_status NOT NULL DEFAULT 'REPORTED',
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    assigned_to UUID -- Foreign key to a users table if you add staff auth
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can insert (Guests triggering SOS)
CREATE POLICY "Anyone can report an incident" 
ON public.incidents
FOR INSERT 
TO public
WITH CHECK (true);

-- Policy: Only authenticated users (Admins/Staff) can select/update incidents
-- Assuming Supabase Auth is enabled
CREATE POLICY "Admins can view incidents" 
ON public.incidents
FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Admins can update incidents" 
ON public.incidents
FOR UPDATE 
TO authenticated 
USING (true);

-- Create Realtime publication for the incidents table
ALTER PUBLICATION supabase_realtime ADD TABLE public.incidents;

-- Create Staff Status Table
CREATE TABLE public.staff_status (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    is_online BOOLEAN DEFAULT false,
    last_seen TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.staff_status ENABLE ROW LEVEL SECURITY;

-- Policies for staff_status
CREATE POLICY "Anyone can view staff status" 
ON public.staff_status FOR SELECT TO authenticated USING (true);

CREATE POLICY "Staff can update their own status" 
ON public.staff_status FOR UPDATE TO authenticated USING (true);

-- Add to Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.staff_status;
