import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { apiMethods, setAuthToken } from '../utils/api';
import ActivityForm from '../components/ActivityForm';
import OffsetSuggestions from '../components/OffsetSuggestions';
import UserDashboard from '../components/UserDashboard';
import FootprintChart from '../components/FootprintChart';
import ChartControls from '../components/ChartControls';
import UserMenu from '../components/auth/UserMenu';
import ErrorBoundary from '../components/ErrorBoundary';
import Logo from '../components/Logo';
import './DashboardPage.css';

const DashboardPage = () => {
  const { user, loading, getAccessToken, signOut } = useAuth();
  const navigate = useNavigate();
  const [emissionEntries, setEmissionEntries] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [chartType, setChartType] = useState('daily');

  // Set up authentication token when user changes
  useEffect(() => {
    const setupAuth = async () => {
      if (user) {
        const token = await getAccessToken();
        setAuthToken(token);
      } else {
        setAuthToken(null);
      }
    };
    setupAuth();
  }, [user, getAccessToken]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  // Function to refresh emission entries data
  const refreshEntries = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiMethods.getEmissionEntries();
      setEmissionEntries(response.data.data || []);
    } catch (err) {
      console.error('Error fetching entries:', err);
      setError('Failed to load emission entries');
    } finally {
      setIsLoading(false);
    }
  };

  // Load initial data on component mount and when user changes
  useEffect(() => {
    if (user && !loading) {
      refreshEntries();
    }
  }, [loading, user]);

  // Handle calculation submission from ActivityForm
  const handleCalculationSubmit = async (formData) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Send calculation request to backend
      const response = await apiMethods.calculateEmissions(formData.activity, formData.value);
      
      // Add new entry to state
      const newEntry = response.data;
      setEmissionEntries(prev => [...prev, newEntry]);
      
      return { success: true, data: newEntry };
    } catch (err) {
      console.error('Calculation error:', err);
      const errorMessage = err.response?.data?.message || 'Failed to calculate emissions';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  // Calculate quick stats
  const totalEmissions = emissionEntries.reduce((total, entry) => total + (entry.co2e || entry.emissions || 0), 0);
  const entriesCount = emissionEntries.length;
  const monthlyEmissions = emissionEntries
    .filter(entry => {
      const entryDate = new Date(entry.timestamp);
      const now = new Date();
      return entryDate.getMonth() === now.getMonth() && entryDate.getFullYear() === now.getFullYear();
    })
    .reduce((total, entry) => total + (entry.co2e || entry.emissions || 0), 0);

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect
  }

  return (
    <ErrorBoundary>
      <div className="dashboard-page">
        {/* Header */}
        <header className="dashboard-header">
          <div className="header-content">
            <div className="header-left">
              <h1 className="dashboard-title">
                <Logo size="medium" />
              </h1>
            </div>
            <div className="header-right">
              <UserMenu onSignOut={handleSignOut} />
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="dashboard-main">
          {error && (
            <div className="error-message">
              {error}
              <button onClick={refreshEntries} className="retry-button">
                Retry
              </button>
            </div>
          )}

          {/* Quick Stats Bar */}
          <div className="quick-stats-bar">
            <div className="quick-stat-card">
              <div className="quick-stat-icon">🌍</div>
              <div className="quick-stat-content">
                <div className="quick-stat-value">{totalEmissions.toFixed(2)}</div>
                <div className="quick-stat-label">Total CO₂e (kg)</div>
              </div>
            </div>
            <div className="quick-stat-card">
              <div className="quick-stat-icon">📅</div>
              <div className="quick-stat-content">
                <div className="quick-stat-value">{monthlyEmissions.toFixed(2)}</div>
                <div className="quick-stat-label">This Month (kg)</div>
              </div>
            </div>
            <div className="quick-stat-card">
              <div className="quick-stat-icon">📊</div>
              <div className="quick-stat-content">
                <div className="quick-stat-value">{entriesCount}</div>
                <div className="quick-stat-label">Total Entries</div>
              </div>
            </div>
          </div>

          {/* Dashboard Layout */}
          <div className="dashboard-layout">
            {/* Left Column */}
            <div className="dashboard-left">
              {/* Activity Input */}
              <div className="dashboard-card activity-card">
                <div className="card-header">
                  <div className="card-header-left">
                    <h3>Add New Activity</h3>
                    <p className="card-subtitle">Track your carbon footprint</p>
                  </div>
                </div>
                <ActivityForm 
                  onCalculationComplete={handleCalculationSubmit}
                  isLoading={isLoading}
                />
              </div>

              {/* Chart Section */}
              <div className="dashboard-card chart-card">
                <div className="card-header">
                  <div className="card-header-left">
                    <h3>Emission Visualization</h3>
                    <p className="card-subtitle">View your emissions over time</p>
                  </div>
                </div>
                <ChartControls 
                  chartType={chartType}
                  onChartTypeChange={setChartType}
                />
                <FootprintChart 
                  entries={emissionEntries}
                  chartType={chartType}
                />
              </div>
            </div>

            {/* Right Column */}
            <div className="dashboard-right">
              {/* User Dashboard */}
              <div className="dashboard-card stats-card">
                <UserDashboard emissionEntries={emissionEntries} />
              </div>
            </div>
          </div>

          {/* Carbon Offset Section - Full Width Below Everything */}
          <div className="offset-section">
            <div className="dashboard-card offset-card">
              <OffsetSuggestions 
                totalEmissions={totalEmissions} 
                entries={emissionEntries}
              />
            </div>
          </div>
        </main>
      </div>
    </ErrorBoundary>
  );
};

export default DashboardPage;
