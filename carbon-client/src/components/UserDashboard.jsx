import React, { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';
import { apiMethods } from '../utils/api';
import './UserDashboard.css';

const UserDashboard = ({ emissionEntries }) => {
  const { user } = useAuth();
  const [userProfile, setUserProfile] = useState(null);
  const [userStats, setUserStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    full_name: '',
    location: '',
    carbon_goal: ''
  });

  // Load user profile and stats
  useEffect(() => {
    const loadUserData = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        setError(null);

        // Wait a bit to ensure token is set
        await new Promise(resolve => setTimeout(resolve, 100));

        console.log('Loading user profile for user:', user.id);
        
        // Load user profile
        const profileResponse = await apiMethods.getUserProfile();
        const profile = profileResponse.data.data;
        setUserProfile(profile);
        setProfileForm({
          full_name: profile.full_name || '',
          location: profile.location || '',
          carbon_goal: profile.carbon_goal || ''
        });

        // Load user stats
        try {
          const statsResponse = await apiMethods.getUserStats();
          setUserStats(statsResponse.data.data || []);
        } catch (statsError) {
          console.warn('Stats not available:', statsError);
          setUserStats([]);
        }
      } catch (err) {
        console.error('Error loading user data:', err);
        if (err.response?.status === 401) {
          setError('Authentication required. Please sign in again.');
        } else if (err.response?.status === 404) {
          setError('User profile not found. Database may need to be set up.');
        } else {
          setError('Failed to load user data. Please check if the database is properly configured.');
        }
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [user]);

  // Calculate dashboard metrics
  const calculateMetrics = () => {
    if (!emissionEntries || emissionEntries.length === 0) {
      return {
        totalEmissions: 0,
        monthlyEmissions: 0,
        averageDaily: 0,
        entriesCount: 0,
        daysActive: 0
      };
    }

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Filter entries for current month
    const monthlyEntries = emissionEntries.filter(entry => {
      const entryDate = new Date(entry.timestamp);
      return entryDate.getMonth() === currentMonth && 
             entryDate.getFullYear() === currentYear;
    });

    // Calculate unique days with entries
    const uniqueDays = new Set(
      emissionEntries.map(entry => 
        new Date(entry.timestamp).toDateString()
      )
    ).size;

    const totalEmissions = emissionEntries.reduce((sum, entry) => sum + entry.co2e, 0);
    const monthlyEmissions = monthlyEntries.reduce((sum, entry) => sum + entry.co2e, 0);
    const averageDaily = uniqueDays > 0 ? totalEmissions / uniqueDays : 0;

    return {
      totalEmissions,
      monthlyEmissions,
      averageDaily,
      entriesCount: emissionEntries.length,
      daysActive: uniqueDays
    };
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await apiMethods.updateUserProfile(profileForm);
      setUserProfile(response.data.data);
      setEditingProfile(false);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Get progress towards carbon goal
  const getGoalProgress = () => {
    if (!userProfile?.carbon_goal) return null;
    
    const metrics = calculateMetrics();
    const progress = (metrics.monthlyEmissions / userProfile.carbon_goal) * 100;
    
    return {
      percentage: Math.min(progress, 100),
      isOverGoal: progress > 100,
      remaining: Math.max(userProfile.carbon_goal - metrics.monthlyEmissions, 0)
    };
  };

  if (!user) {
    return (
      <div className="dashboard-auth-required">
        <h3>Sign in to view your personal dashboard</h3>
        <p>Track your progress, set goals, and get personalized insights.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner">Loading your dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="user-dashboard">
        <div className="dashboard-header">
          <h2>Personal Carbon Dashboard</h2>
          <p>Welcome back, {user.email?.split('@')[0] || 'User'}!</p>
        </div>
        <div className="dashboard-error">
          <h3>Setup Required</h3>
          <p>{error}</p>
          <p>Please ensure the database migration has been run. Check the README-SETUP.md file for instructions.</p>
        </div>
      </div>
    );
  }

  const metrics = calculateMetrics();
  const goalProgress = getGoalProgress();

  return (
    <div className="user-dashboard">
      <div className="dashboard-header">
        <h2>Personal Carbon Dashboard</h2>
        <p>Welcome back, {userProfile?.full_name || user.email?.split('@')[0] || 'User'}!</p>
      </div>

      {error && (
        <div className="dashboard-error">
          {error}
        </div>
      )}

      {/* Key Metrics */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-icon">🌍</div>
          <div className="metric-content">
            <div className="metric-value">{metrics.totalEmissions.toFixed(2)}</div>
            <div className="metric-label">Total CO₂e (kg)</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">📅</div>
          <div className="metric-content">
            <div className="metric-value">{metrics.monthlyEmissions.toFixed(2)}</div>
            <div className="metric-label">This Month (kg)</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">📊</div>
          <div className="metric-content">
            <div className="metric-value">{metrics.averageDaily.toFixed(2)}</div>
            <div className="metric-label">Daily Average (kg)</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">🎯</div>
          <div className="metric-content">
            <div className="metric-value">{metrics.daysActive}</div>
            <div className="metric-label">Active Days</div>
          </div>
        </div>
      </div>

      {/* Carbon Goal Progress */}
      {goalProgress && (
        <div className="goal-section">
          <h3>Monthly Carbon Goal</h3>
          <div className="goal-progress">
            <div className="goal-info">
              <span>Goal: {userProfile.carbon_goal} kg CO₂e</span>
              <span className={goalProgress.isOverGoal ? 'over-goal' : 'under-goal'}>
                {goalProgress.isOverGoal 
                  ? `${(metrics.monthlyEmissions - userProfile.carbon_goal).toFixed(2)} kg over goal`
                  : `${goalProgress.remaining.toFixed(2)} kg remaining`
                }
              </span>
            </div>
            <div className="progress-bar">
              <div 
                className={`progress-fill ${goalProgress.isOverGoal ? 'over-goal' : ''}`}
                style={{ width: `${goalProgress.percentage}%` }}
              ></div>
            </div>
            <div className="progress-percentage">
              {goalProgress.percentage.toFixed(1)}%
            </div>
          </div>
        </div>
      )}

      {/* Profile Management */}
      <div className="profile-section">
        <div className="section-header">
          <h3>Profile Settings</h3>
          <button 
            onClick={() => setEditingProfile(!editingProfile)}
            className="edit-profile-btn"
          >
            {editingProfile ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>

        {editingProfile ? (
          <form onSubmit={handleProfileUpdate} className="profile-form">
            <div className="form-group">
              <label htmlFor="full_name">Full Name</label>
              <input
                type="text"
                id="full_name"
                name="full_name"
                value={profileForm.full_name}
                onChange={handleInputChange}
                placeholder="Enter your full name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="location">Location</label>
              <input
                type="text"
                id="location"
                name="location"
                value={profileForm.location}
                onChange={handleInputChange}
                placeholder="City, State"
              />
            </div>

            <div className="form-group">
              <label htmlFor="carbon_goal">Monthly Carbon Goal (kg CO₂e)</label>
              <input
                type="number"
                id="carbon_goal"
                name="carbon_goal"
                value={profileForm.carbon_goal}
                onChange={handleInputChange}
                placeholder="e.g., 100"
                min="0"
                step="0.1"
              />
              <small>Average Indian carbon footprint is ~150 kg CO₂e per month</small>
            </div>

            <div className="form-actions">
              <button type="submit" disabled={loading} className="save-btn">
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        ) : (
          <div className="profile-display">
            <div className="profile-item">
              <span className="profile-label">Name:</span>
              <span className="profile-value">
                {userProfile?.full_name || 'Not set'}
              </span>
            </div>
            <div className="profile-item">
              <span className="profile-label">Location:</span>
              <span className="profile-value">
                {userProfile?.location || 'Not set'}
              </span>
            </div>
            <div className="profile-item">
              <span className="profile-label">Monthly Goal:</span>
              <span className="profile-value">
                {userProfile?.carbon_goal ? `${userProfile.carbon_goal} kg CO₂e` : 'Not set'}
              </span>
            </div>
            <div className="profile-item">
              <span className="profile-label">Email:</span>
              <span className="profile-value">{user.email}</span>
            </div>
          </div>
        )}
      </div>

      {/* Insights and Tips */}
      <div className="insights-section">
        <h3>Insights & Tips</h3>
        <div className="insights-grid">
          {metrics.monthlyEmissions > 150 && (
            <div className="insight-card warning">
              <div className="insight-icon">⚠️</div>
              <div className="insight-content">
                <h4>Above Average Emissions</h4>
                <p>Your monthly emissions are above the Indian average. Consider reducing transportation or energy usage.</p>
              </div>
            </div>
          )}
          
          {metrics.daysActive >= 7 && (
            <div className="insight-card positive">
              <div className="insight-icon">🎉</div>
              <div className="insight-content">
                <h4>Great Tracking Habit!</h4>
                <p>You've been consistently tracking your emissions. Keep it up!</p>
              </div>
            </div>
          )}
          
          <div className="insight-card tip">
            <div className="insight-icon">💡</div>
            <div className="insight-content">
              <h4>Tip: Reduce Transportation Emissions</h4>
              <p>Use public transport, cycle, or walk for short distances to significantly reduce your carbon footprint.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;