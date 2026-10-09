-- =========================================================================================
--                            RESQ LOCATION & MISSING TABLES UPDATE (FINAL FIX)
-- =========================================================================================
-- This script safely creates necessary tables for Events, Shelters, Emergencies, and Tracking
-- It also adds geolocation columns to existing tables.
-- =========================================================================================

DO $$ 
BEGIN 

    -- 1. Events Table (New)
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'events') THEN
        CREATE TABLE public.events (
            id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
            title text NOT NULL,
            description text,
            date text,
            time text,
            location text,
            category text,
            status text,
            organizer text,
            latitude double precision,
            longitude double precision,
            participant_count int DEFAULT 0,
            image text,
            created_at timestamptz DEFAULT now()
        );
        -- Enable RLS
        ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
        CREATE POLICY "Events are public" ON public.events FOR SELECT USING (true);
    ELSE
        -- If exists, ensure lat/lng
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'latitude') THEN 
            ALTER TABLE public.events ADD COLUMN latitude double precision;
            ALTER TABLE public.events ADD COLUMN longitude double precision;
        END IF;
    END IF;

    -- 2. Shelters Table (New)
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'shelters') THEN
        CREATE TABLE public.shelters (
            id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
            name text NOT NULL,
            description text,
            location text,
            capacity int,
            status text,
            type text,
            latitude double precision,
            longitude double precision,
            created_at timestamptz DEFAULT now()
        );
        ALTER TABLE public.shelters ENABLE ROW LEVEL SECURITY;
        CREATE POLICY "Shelters are public" ON public.shelters FOR SELECT USING (true);
    ELSE
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'shelters' AND column_name = 'latitude') THEN 
            ALTER TABLE public.shelters ADD COLUMN latitude double precision;
            ALTER TABLE public.shelters ADD COLUMN longitude double precision;
        END IF;
    END IF;

    -- 3. Emergencies Table (New - distinct from incidents for high-level tracking if needed, or alias)
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'emergencies') THEN
        CREATE TABLE public.emergencies (
            id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
            title text NOT NULL,
            type text,
            severity text,
            status text,
            location text,
            latitude double precision,
            longitude double precision,
            created_at timestamptz DEFAULT now()
        );
        ALTER TABLE public.emergencies ENABLE ROW LEVEL SECURITY;
        CREATE POLICY "Emergencies are public" ON public.emergencies FOR SELECT USING (true);
    ELSE
         IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'emergencies' AND column_name = 'latitude') THEN 
            ALTER TABLE public.emergencies ADD COLUMN latitude double precision;
            ALTER TABLE public.emergencies ADD COLUMN longitude double precision;
        END IF;
    END IF;
    
    -- 4. Volunteer Requests (Check if missing)
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'volunteer_requests') THEN
        CREATE TABLE public.volunteer_requests (
            id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id uuid REFERENCES public.profiles(id),
            full_name text,
            phone text,
            area text,
            skills text[],
            availability text,
            is_emergency_trained boolean,
            reason text,
            status text DEFAULT 'pending',
            latitude double precision,
            longitude double precision,
            created_at timestamptz DEFAULT now()
        );
        ALTER TABLE public.volunteer_requests ENABLE ROW LEVEL SECURITY;
        CREATE POLICY "Users view own requests" ON public.volunteer_requests FOR SELECT USING (auth.uid() = user_id);
        CREATE POLICY "Users create requests" ON public.volunteer_requests FOR INSERT WITH CHECK (auth.uid() = user_id);
    ELSE
         -- Ensure latitude exists
         IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'volunteer_requests' AND column_name = 'latitude') THEN 
            ALTER TABLE public.volunteer_requests ADD COLUMN latitude double precision;
            ALTER TABLE public.volunteer_requests ADD COLUMN longitude double precision;
        END IF;
        -- Ensure user_id exists
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'volunteer_requests' AND column_name = 'user_id') THEN 
            ALTER TABLE public.volunteer_requests ADD COLUMN user_id uuid REFERENCES public.profiles(id);
        END IF;
    END IF;

    -- 5. Add Location columns to existing tables
    
    -- Complaints
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'complaints' AND column_name = 'latitude') THEN 
        ALTER TABLE public.complaints ADD COLUMN latitude double precision;
        ALTER TABLE public.complaints ADD COLUMN longitude double precision;
    END IF;

    -- Missing Reports
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'missing_reports' AND column_name = 'latitude') THEN 
        ALTER TABLE public.missing_reports ADD COLUMN latitude double precision;
        ALTER TABLE public.missing_reports ADD COLUMN longitude double precision;
    END IF;

    -- Incidents (if distinct from emergencies)
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'incidents') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'incidents' AND column_name = 'latitude') THEN 
            ALTER TABLE public.incidents ADD COLUMN latitude double precision;
            ALTER TABLE public.incidents ADD COLUMN longitude double precision;
        END IF;
    END IF;
    
    -- 6. Emergency Locations Tracking (Table Check)
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'emergency_locations') THEN
         CREATE TABLE public.emergency_locations (
            id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id uuid REFERENCES public.profiles(id),
            latitude double precision NOT NULL,
            longitude double precision NOT NULL,
            accuracy double precision,
            timestamp timestamptz DEFAULT now()
        );
    ELSE
         -- Ensure user_id exists
         IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'emergency_locations' AND column_name = 'user_id') THEN 
            ALTER TABLE public.emergency_locations ADD COLUMN user_id uuid REFERENCES public.profiles(id);
        END IF;
         -- Ensure timestamp exists
         IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'emergency_locations' AND column_name = 'timestamp') THEN 
            ALTER TABLE public.emergency_locations ADD COLUMN timestamp timestamptz DEFAULT now();
        END IF;
    END IF;

END $$;

-- 7. Policies & Realtime (Outside DO block for safety, but table structure guaranteed now)

-- Emergency Locations Policies
ALTER TABLE public.emergency_locations ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Public can view tracking" ON public.emergency_locations;
    DROP POLICY IF EXISTS "Users can insert own tracking" ON public.emergency_locations;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

CREATE POLICY "Public can view tracking" ON public.emergency_locations FOR SELECT USING (true);
CREATE POLICY "Users can insert own tracking" ON public.emergency_locations FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Enable Realtime
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = 'emergency_locations'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.emergency_locations;
  END IF;
END $$;

-- 8. Indexes (Idempotent)
CREATE INDEX IF NOT EXISTS idx_complaints_lat_long ON public.complaints (latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_events_lat_long ON public.events (latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_emergencies_lat_long ON public.emergencies (latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_tracking_user_time ON public.emergency_locations (user_id, timestamp DESC);
