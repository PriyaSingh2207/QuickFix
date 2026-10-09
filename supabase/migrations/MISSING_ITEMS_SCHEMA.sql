-- Add 'type' column to missing_reports if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'missing_reports' AND column_name = 'type') THEN 
        ALTER TABLE public.missing_reports ADD COLUMN type text DEFAULT 'person'; 
    END IF;
    
    -- Make 'age' nullable since items don't have age 
    ALTER TABLE public.missing_reports ALTER COLUMN age DROP NOT NULL;
END $$;

-- Dummy Data for Missing Persons and Items
INSERT INTO public.missing_reports (user_id, person_name, age, last_seen_location, description, status, contact_phone, type, image_url)
SELECT 
    id as user_id,
    'Rahul Sharma' as person_name, 
    12 as age, 
    'Central Park, Indore' as last_seen_location, 
    'Wearing a blue t-shirt and jeans. Has a small scar on left cheek.' as description, 
    'missing' as status, 
    '9876543210' as contact_phone,
    'person' as type,
    'https://images.unsplash.com/photo-1488161628813-994252600322' as image_url
FROM public.profiles LIMIT 1;

INSERT INTO public.missing_reports (user_id, person_name, age, last_seen_location, description, status, contact_phone, type, image_url)
SELECT 
    id as user_id,
    'Golden Retriever (Max)' as person_name, 
    4 as age, 
    'Vijay Nagar Square' as last_seen_location, 
    'Friendly golden retriever, wearing a red collar with name tag.' as description, 
    'missing' as status, 
    '9988776655' as contact_phone,
    'person' as type, -- Treating pets as 'person' type for now or maybe 'item'? Let's check user request. User said "missing item also". Pets are usually specific but let's stick to person/item separation. Let's make pet an ITEM or PERSON? Usually 'Missing Pet' is a category. Let's add a Pet example as 'item' or just stick to 'person' logic for living things? 
    -- The user asked for "Missing Item". Let's do a Wallet or Phone.
    'https://images.unsplash.com/photo-1552053831-71594a27632d' as image_url
FROM public.profiles LIMIT 1;

-- Dummy Item
INSERT INTO public.missing_reports (user_id, person_name, last_seen_location, description, status, contact_phone, type, image_url)
SELECT 
    id as user_id,
    'Black Leather Wallet' as person_name, -- reusing person_name for item name
    'Phoenix Citadel Mall' as last_seen_location, 
    'Contains Driving License, 2 Credit Cards, and some cash. Brand: Woodland.' as description, 
    'missing' as status, 
    '9123456789' as contact_phone,
    'item' as type,
    'https://images.unsplash.com/photo-1627123424574-724758594e93' as image_url
FROM public.profiles LIMIT 1;

INSERT INTO public.missing_reports (user_id, person_name, last_seen_location, description, status, contact_phone, type, image_url)
SELECT 
    id as user_id,
    'Iphone 14 Pro' as person_name,
    'Chappan Dukan' as last_seen_location, 
    'Purple color, with a transparent cover. Cracked screen guard.' as description, 
    'missing' as status, 
    '9988771122' as contact_phone,
    'item' as type,
    'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5' as image_url
FROM public.profiles LIMIT 1;
