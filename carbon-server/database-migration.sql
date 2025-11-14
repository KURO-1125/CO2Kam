-- Migration script to add user authentication support
-- Run this script in your Supabase SQL editor

-- 1. Add user_id column to footprint_entries table
ALTER TABLE footprint_entries 
ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- 2. Create user_profiles table for storing user preferences and data
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    full_name TEXT,
    location TEXT,
    carbon_goal DECIMAL(10,2), -- Monthly carbon goal in kg CO2e
    preferences JSONB DEFAULT '{}', -- Store user preferences as JSON
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (user_id, full_name)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', '')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Create trigger to call the function on user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Create trigger for user_profiles updated_at
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 7. Set up Row Level Security (RLS) policies

-- Enable RLS on footprint_entries
ALTER TABLE footprint_entries ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own footprint entries
CREATE POLICY "Users can view own footprint entries" ON footprint_entries
    FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can only insert their own footprint entries
CREATE POLICY "Users can insert own footprint entries" ON footprint_entries
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Users can only update their own footprint entries
CREATE POLICY "Users can update own footprint entries" ON footprint_entries
    FOR UPDATE USING (auth.uid() = user_id);

-- Policy: Users can only delete their own footprint entries
CREATE POLICY "Users can delete own footprint entries" ON footprint_entries
    FOR DELETE USING (auth.uid() = user_id);

-- Enable RLS on user_profiles
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own profile
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can only update their own profile
CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = user_id);

-- 8. Create indexes for better performance
CREATE INDEX idx_footprint_entries_user_id ON footprint_entries(user_id);
CREATE INDEX idx_footprint_entries_user_timestamp ON footprint_entries(user_id, timestamp);
CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);

-- 9. Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.footprint_entries TO anon, authenticated;
GRANT ALL ON public.user_profiles TO anon, authenticated;

-- 10. Create view for user statistics (optional)
CREATE OR REPLACE VIEW user_emission_stats AS
SELECT 
    fp.user_id,
    COUNT(*) as total_entries,
    SUM(fp.co2e) as total_emissions,
    AVG(fp.co2e) as avg_emission_per_entry,
    DATE_TRUNC('month', fp.timestamp) as month,
    SUM(fp.co2e) as monthly_emissions
FROM footprint_entries fp
WHERE fp.user_id = auth.uid()
GROUP BY fp.user_id, DATE_TRUNC('month', fp.timestamp)
ORDER BY month DESC;

-- Grant access to the view
GRANT SELECT ON user_emission_stats TO authenticated;

-- Note: After running this migration, existing footprint_entries will have NULL user_id
-- You may want to either:
-- 1. Delete existing entries: DELETE FROM footprint_entries WHERE user_id IS NULL;
-- 2. Or assign them to a test user if needed for development