const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();
const { initializeSupabase, testDatabaseConnection, createFootprintEntry, getAllFootprintEntries, getUserProfile, updateUserProfile, createUserProfile, getUserEmissionStats } = require('./supabase-config');
const { authenticateToken, optionalAuth } = require('./auth-middleware');
const climatiqService = require('./climatiq-service');

const app = express();
const PORT = process.env.PORT || 8000;

let supabase;
try {
  supabase = initializeSupabase();
  console.log('Supabase initialized successfully');
  
  // Test database connection on startup
  testDatabaseConnection(supabase)
    .then(() => {
      console.log('Database connection verified');
    })
    .catch((error) => {
      console.warn('Database connection test failed:', error.message);
      console.warn('Database features may not work properly');
    });
} catch (error) {
  console.log('Supabase initialization skipped - configure environment variables to enable database features');
  console.log('Error:', error.message);
}

app.use(cors());
app.use(express.json());


app.get('/health', (req, res) => {
  res.json({success:true, message:"Server is up and running" });
});


app.post('/api/calculate', optionalAuth, async (req, res) => {
  try {
    const { activity, value } = req.body;
    const result = await climatiqService.calculateEmissions(activity, value);
    
    if (supabase) {
      try {
        const entryData = {
          co2e: result.co2e,
          activity: result.activity,
          value: result.value,
          unit: result.unit,
          timestamp: result.timestamp,
          region: 'IN'
        };
        
        // Pass user ID if authenticated
        const savedEntry = await createFootprintEntry(supabase, entryData, req.userId);
        console.log('Emission entry saved to database:', savedEntry.id);
        
        result.id = savedEntry.id;
        result.saved = true;
        result.userId = req.userId || null;
      } catch (dbError) {
        console.error('Failed to save emission entry to database:', dbError.message);

        result.saved = false;
        result.saveError = 'Database save failed';
      }
    } else {
      result.saved = false;
      result.saveError = 'Database not available';
    }
    
    res.json(result);
  } catch (error) {
    console.error('Error in Calculating', error);
    res.status(error.statusCode || 500).json({
      error: error.message,
      code: error.code || 'INTERNAL_ERROR'
    });
  }
});

app.post('/api/log', authenticateToken, async (req, res) => {
  try {
    if (!supabase) {
      return res.status(503).json({
        error: 'Database not available',
        code: 'DATABASE_UNAVAILABLE'
      });
    }

    const { co2e, activity, value, unit, timestamp, region } = req.body;

    if (!co2e || !activity || !value || !unit) {
      return res.status(400).json({
        error: 'Missing required fields: co2e, activity, value, unit',
        code: 'VALIDATION_ERROR'
      });
    }

    if (typeof co2e !== 'number' || typeof value !== 'number') {
      return res.status(400).json({
        error: 'co2e and value must be numbers',
        code: 'VALIDATION_ERROR'
      });
    }

    const entryData = {
      co2e: parseFloat(co2e),
      activity: activity.toString(),
      value: parseFloat(value),
      unit: unit.toString(),
      timestamp: timestamp || new Date().toISOString(),
      region: region || 'IN'
    };

    // Always associate with authenticated user
    const savedEntry = await createFootprintEntry(supabase, entryData, req.userId);
    
    res.status(201).json({
      success: true,
      data: savedEntry
    });
  } catch (error) {
    console.error('Error logging emission entry:', error);
    res.status(500).json({
      error: 'Failed to save emission entry',
      code: 'DATABASE_ERROR',
      details: error.message
    });
  }
});

app.get('/api/entries', optionalAuth, async (req, res) => {
  try {
    if (!supabase) {
      return res.status(503).json({
        error: 'Database not available',
        code: 'DATABASE_UNAVAILABLE'
      });
    }

    // Get entries filtered by user if authenticated
    const entries = await getAllFootprintEntries(supabase, req.userId);
    
    res.json({
      success: true,
      data: entries,
      count: entries.length,
      userId: req.userId || null
    });
  } catch (error) {
    console.error('Error fetching emission entries:', error);
    res.status(500).json({
      error: 'Failed to retrieve emission entries',
      code: 'DATABASE_ERROR',
      details: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`CO2Kam server running on port ${PORT}`);
});
// User profile endpoints
app.get('/api/user/profile', authenticateToken, async (req, res) => {
  try {
    if (!supabase) {
      return res.status(503).json({
        error: 'Database not available',
        code: 'DATABASE_UNAVAILABLE'
      });
    }

    try {
      const profile = await getUserProfile(supabase, req.userId);
      res.json({
        success: true,
        data: profile
      });
    } catch (error) {
      // If profile doesn't exist, create one
      if (error.message.includes('No rows returned')) {
        const newProfile = await createUserProfile(supabase, req.userId, {
          full_name: req.user.user_metadata?.full_name || ''
        });
        res.json({
          success: true,
          data: newProfile
        });
      } else {
        throw error;
      }
    }
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({
      error: 'Failed to retrieve user profile',
      code: 'DATABASE_ERROR',
      details: error.message
    });
  }
});

app.put('/api/user/profile', authenticateToken, async (req, res) => {
  try {
    if (!supabase) {
      return res.status(503).json({
        error: 'Database not available',
        code: 'DATABASE_UNAVAILABLE'
      });
    }

    const { full_name, location, carbon_goal, preferences } = req.body;

    const profileData = {};
    if (full_name !== undefined) profileData.full_name = full_name;
    if (location !== undefined) profileData.location = location;
    if (carbon_goal !== undefined) profileData.carbon_goal = parseFloat(carbon_goal);
    if (preferences !== undefined) profileData.preferences = preferences;

    const updatedProfile = await updateUserProfile(supabase, req.userId, profileData);
    
    res.json({
      success: true,
      data: updatedProfile
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({
      error: 'Failed to update user profile',
      code: 'DATABASE_ERROR',
      details: error.message
    });
  }
});

app.get('/api/user/stats', authenticateToken, async (req, res) => {
  try {
    if (!supabase) {
      return res.status(503).json({
        error: 'Database not available',
        code: 'DATABASE_UNAVAILABLE'
      });
    }

    const stats = await getUserEmissionStats(supabase, req.userId);
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({
      error: 'Failed to retrieve user statistics',
      code: 'DATABASE_ERROR',
      details: error.message
    });
  }
});

// Debug endpoint to test Climatiq API
app.get('/api/debug/climatiq-test', async (req, res) => {
  try {
    if (!process.env.CLIMATIQ_API_KEY) {
      return res.status(500).json({
        error: 'Climatiq API key not configured'
      });
    }

    // Test a simple, known activity
    const testRequest = {
      emission_factor: {
        activity_id: 'electricity-supply_grid-source_supplier_mix',
        region: 'IN'
      },
      parameters: {
        energy: 1,
        energy_unit: 'kWh'
      }
    };

    const response = await axios.post('https://api.climatiq.io/data/v1/estimate', testRequest, {
      headers: {
        'Authorization': `Bearer ${process.env.CLIMATIQ_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    res.json({
      success: true,
      message: 'Climatiq API is working',
      testResult: response.data
    });
  } catch (error) {
    console.error('Climatiq test error:', error.response?.data || error.message);
    res.status(500).json({
      error: 'Climatiq API test failed',
      details: error.response?.data || error.message
    });
  }
});

// Gold Standard API integration for carbon offset projects
app.get('/api/offsets', async (req, res) => {
  try {
    // Try to fetch from Gold Standard API first
    // Note: Gold Standard may require API key or have different endpoint structure
    let projects = [];
    let dataSource = 'Mock Data';
    
    try {
      // Attempt to fetch from Gold Standard registry
      // Using their public project search endpoint
      const goldStandardUrl = 'https://registry.goldstandard.org/projects/search';
      
      const response = await axios.get(goldStandardUrl, {
        params: {
          country: 'IN',
          status: 'active',
          limit: 10
        },
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'CO2Kam-India/1.0'
        },
        timeout: 5000 // 5 second timeout
      });

      if (response.data && response.data.length > 0) {
        projects = response.data.map(project => ({
          id: project.id || project.project_id,
          title: project.title || project.name || 'Untitled Project',
          description: project.description || project.summary || 'No description available',
          location: project.location || project.country || 'India',
          projectType: project.project_type || project.type || 'Carbon Offset',
          status: project.status || 'active',
          url: project.url || project.link || `https://registry.goldstandard.org/projects/details/${project.id}`,
          creditPrice: project.credit_price || null,
          availableCredits: project.available_credits || null
        }));
        dataSource = 'Gold Standard Registry';
      }
    } catch (apiError) {
      console.log('Gold Standard API not accessible, using fallback data:', apiError.message);
      // Fall back to curated India offset projects
    }

    // If API call failed or returned no data, use curated India offset projects
    if (projects.length === 0) {
      projects = [
        {
          id: 'gs-001-in',
          title: 'Solar Power Project - Rajasthan',
          description: 'Large-scale solar photovoltaic power generation project in Rajasthan, India. This project generates clean renewable energy and displaces grid electricity from fossil fuel sources.',
          location: 'Rajasthan, India',
          projectType: 'Renewable Energy',
          status: 'active',
          url: 'https://registry.goldstandard.org/projects/details/2156',
          creditPrice: 12.50,
          availableCredits: 50000
        },
        {
          id: 'gs-002-in',
          title: 'Wind Power Project - Tamil Nadu',
          description: 'Wind energy generation project in Tamil Nadu contributing to India\'s renewable energy targets and reducing carbon emissions from the electricity grid.',
          location: 'Tamil Nadu, India',
          projectType: 'Renewable Energy',
          status: 'active',
          url: 'https://registry.goldstandard.org/projects/details/1847',
          creditPrice: 11.75,
          availableCredits: 75000
        },
        {
          id: 'gs-003-in',
          title: 'Improved Cookstoves - Rural India',
          description: 'Distribution of efficient cookstoves to rural households across India, reducing fuel consumption and indoor air pollution while generating carbon credits.',
          location: 'Multiple States, India',
          projectType: 'Energy Efficiency',
          status: 'active',
          url: 'https://registry.goldstandard.org/projects/details/1923',
          creditPrice: 15.00,
          availableCredits: 25000
        },
        {
          id: 'gs-004-in',
          title: 'Biogas Plant - Maharashtra',
          description: 'Community biogas project converting agricultural waste into clean energy for rural communities in Maharashtra, reducing methane emissions.',
          location: 'Maharashtra, India',
          projectType: 'Waste Management',
          status: 'active',
          url: 'https://registry.goldstandard.org/projects/details/2089',
          creditPrice: 13.25,
          availableCredits: 30000
        },
        {
          id: 'gs-005-in',
          title: 'Afforestation Project - Himachal Pradesh',
          description: 'Large-scale tree plantation and forest restoration project in Himachal Pradesh, sequestering carbon while providing livelihood opportunities.',
          location: 'Himachal Pradesh, India',
          projectType: 'Forestry',
          status: 'active',
          url: 'https://registry.goldstandard.org/projects/details/1756',
          creditPrice: 18.00,
          availableCredits: 40000
        }
      ];
      dataSource = 'Curated India Projects';
    }

    res.json({
      success: true,
      data: projects,
      count: projects.length,
      source: dataSource,
      message: dataSource === 'Mock Data' ? 'Using curated offset projects for India. Live API integration available.' : undefined
    });

  } catch (error) {
    console.error('Offset service error:', error.message);
    
    // Return graceful error that doesn't break the application
    res.status(503).json({
      error: 'Offset service temporarily unavailable',
      code: 'SERVICE_ERROR',
      message: 'Carbon offset projects are temporarily unavailable. Core carbon tracking functionality remains available.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

//Endpoint to search for available emission factors
app.get('/api/debug/search-factors/:query', async (req, res) => {
  try {
    if (!process.env.CLIMATIQ_API_KEY) {
      return res.status(500).json({
        error: 'Climatiq API key not configured'
      });
    }

    const query = req.params.query;
    const response = await axios.get(`https://api.climatiq.io/data/v1/emission_factors?query=${query}&limit=10`, {
      headers: {
        'Authorization': `Bearer ${process.env.CLIMATIQ_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    res.json({
      success: true,
      query: query,
      factors: response.data.results.map(factor => ({
        activity_id: factor.activity_id,
        name: factor.name,
        category: factor.category,
        unit_type: factor.unit_type,
        region: factor.region
      }))
    });
  } catch (error) {
    console.error('Factor search error:', error.response?.data || error.message);
    res.status(500).json({
      error: 'Factor search failed',
      details: error.response?.data || error.message
    });
  }
});

