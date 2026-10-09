-- =========================================================================================
--                            RESQ FUNCTIONALITY UPDATE
-- =========================================================================================

DO $$ 
BEGIN 

    -- 1. Event Registrations Table
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'event_registrations') THEN
        CREATE TABLE public.event_registrations (
            id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
            event_id uuid REFERENCES public.events(id) ON DELETE CASCADE,
            user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
            registered_at timestamptz DEFAULT now(),
            status text DEFAULT 'confirmed',
            UNIQUE(event_id, user_id)
        );
        ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;
        CREATE POLICY "Users can view own registrations" ON public.event_registrations FOR SELECT USING (auth.uid() = user_id);
        CREATE POLICY "Users can register" ON public.event_registrations FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;

    -- 2. User Settings Table
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_settings') THEN
        CREATE TABLE public.user_settings (
            user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE PRIMARY KEY,
            notifications_enabled boolean DEFAULT true,
            emergency_alerts boolean DEFAULT true,
            event_updates boolean DEFAULT true,
            dark_mode boolean DEFAULT false,
            updated_at timestamptz DEFAULT now()
        );
        ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
        CREATE POLICY "Users can view own settings" ON public.user_settings FOR SELECT USING (auth.uid() = user_id);
        CREATE POLICY "Users can update own settings" ON public.user_settings FOR UPDATE USING (auth.uid() = user_id);
        CREATE POLICY "Users can insert own settings" ON public.user_settings FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;

    -- 3. Update Profiles with Stats Columns if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'points') THEN 
        ALTER TABLE public.profiles ADD COLUMN points int DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'reports_filed') THEN 
        ALTER TABLE public.profiles ADD COLUMN reports_filed int DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'resolved_count') THEN 
        ALTER TABLE public.profiles ADD COLUMN resolved_count int DEFAULT 0;
    END IF;

END $$;
