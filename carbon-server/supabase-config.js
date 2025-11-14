const { createClient } = require('@supabase/supabase-js');

const initializeSupabase = () => {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase environment variables. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
  
  console.log('Supabase client initialized successfully with service role');
  
  return supabase;
};

const createFootprintEntry = async (supabase, entryData, userId = null) => {
  try {
    // Add user_id to entry data if provided
    const dataWithUser = userId ? { ...entryData, user_id: userId } : entryData;
    
    const { data, error } = await supabase
      .from('footprint_entries')
      .insert([dataWithUser])
      .select()
      .single();

    if (error) {
      throw new Error(`Database insert error: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error('Error creating footprint entry:', error);
    throw error;
  }
};

const getAllFootprintEntries = async (supabase, userId = null) => {
  try {
    let query = supabase
      .from('footprint_entries')
      .select('*')
      .order('timestamp', { ascending: false });

    // If userId is provided, filter by user
    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Database query error: ${error.message}`);
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching footprint entries:', error);
    throw error;
  }
};

const testDatabaseConnection = async (supabase) => {
  try {
    const { data, error } = await supabase
      .from('footprint_entries')
      .select('count', { count: 'exact', head: true });

    if (error) {
      throw new Error(`Database connection test failed: ${error.message}`);
    }

    console.log('Database connection test successful');
    return true;
  } catch (error) {
    console.error('Database connection test failed:', error);
    throw error;
  }
};

// User profile functions
const getUserProfile = async (supabase, userId) => {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      throw new Error(`Database query error: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};

const updateUserProfile = async (supabase, userId, profileData) => {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .update(profileData)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      throw new Error(`Database update error: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

const createUserProfile = async (supabase, userId, profileData) => {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .insert([{ user_id: userId, ...profileData }])
      .select()
      .single();

    if (error) {
      throw new Error(`Database insert error: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error('Error creating user profile:', error);
    throw error;
  }
};

// Get user emission statistics
const getUserEmissionStats = async (supabase, userId) => {
  try {
    const { data, error } = await supabase
      .from('user_emission_stats')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      throw new Error(`Database query error: ${error.message}`);
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching user emission stats:', error);
    throw error;
  }
};

module.exports = { 
  initializeSupabase, 
  createFootprintEntry, 
  getAllFootprintEntries, 
  testDatabaseConnection,
  getUserProfile,
  updateUserProfile,
  createUserProfile,
  getUserEmissionStats
};