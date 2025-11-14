import { useState, useEffect } from 'react';
import { apiMethods } from '../utils/api';
import './OffsetSuggestions.css';

const OffsetSuggestions = ({ totalEmissions }) => {
  const [offsetProjects, setOffsetProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);

  // Calculate offset recommendations based on total emissions
  const calculateOffsetRecommendation = (emissions) => {
    if (!emissions || emissions <= 0) return 0;
    
    // Round up to nearest 0.5 tonnes for practical offset purchasing
    const tonnes = emissions / 1000; // Convert kg to tonnes
    return Math.ceil(tonnes * 2) / 2; // Round to nearest 0.5
  };

  const recommendedOffset = calculateOffsetRecommendation(totalEmissions);

  // Fetch offset projects from the API
  const fetchOffsetProjects = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await apiMethods.getOffsetProjects();
      setOffsetProjects(response.data.data || []);
    } catch (err) {
      console.error('Error fetching offset projects:', err);
      
      // Handle different error types gracefully
      if (err.code === 'ECONNREFUSED' || err.code === 'ERR_NETWORK') {
        setError('Offset service is temporarily unavailable. Core carbon tracking remains functional.');
      } else if (err.response?.status >= 500) {
        setError('Offset service is experiencing issues. Please try again later.');
      } else {
        setError('Unable to load offset projects at this time.');
      }
      
      setOffsetProjects([]); // Clear projects on error
    } finally {
      setIsLoading(false);
    }
  };

  // Load offset projects when component mounts or when expanded
  useEffect(() => {
    if (isExpanded && offsetProjects.length === 0 && !error) {
      fetchOffsetProjects();
    }
  }, [isExpanded, offsetProjects.length, error]);

  // Calculate estimated cost for recommended offset
  const calculateEstimatedCost = () => {
    if (offsetProjects.length === 0 || recommendedOffset === 0) return null;
    
    // Use average price from available projects
    const avgPrice = offsetProjects.reduce((sum, project) => 
      sum + (project.creditPrice || 0), 0) / offsetProjects.length;
    
    return (recommendedOffset * avgPrice).toFixed(2);
  };

  const estimatedCost = calculateEstimatedCost();

  // Show placeholder if no emissions data yet
  if (!totalEmissions || totalEmissions <= 0) {
    return (
      <div className="offset-suggestions">
        <div className="offset-header">
          <h3>🌱 Carbon Offset Opportunities</h3>
        </div>
        <div className="no-emissions-yet">
          <div className="no-emissions-icon">📊</div>
          <h4>Start tracking your emissions</h4>
          <p>Add some activities to see personalized carbon offset recommendations and projects you can support.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="offset-suggestions">
      <div className="offset-header">
        <div className="offset-summary">
          <h3>🌱 Carbon Offset Opportunities</h3>
          <div className="offset-stats">
            <div className="offset-stat">
              <span className="stat-label">Your Total Emissions:</span>
              <span className="stat-value">{totalEmissions.toFixed(2)} kg CO₂e</span>
            </div>
            <div className="offset-stat">
              <span className="stat-label">Recommended Offset:</span>
              <span className="stat-value">{recommendedOffset} tonnes CO₂e</span>
            </div>
            {estimatedCost && (
              <div className="offset-stat">
                <span className="stat-label">Estimated Cost:</span>
                <span className="stat-value">₹{(estimatedCost * 83).toFixed(0)} - ₹{(estimatedCost * 85).toFixed(0)}</span>
              </div>
            )}
          </div>
        </div>
        
        <button 
          className={`expand-button ${isExpanded ? 'expanded' : ''}`}
          onClick={() => setIsExpanded(!isExpanded)}
          aria-label={isExpanded ? 'Hide offset projects' : 'Show offset projects'}
        >
          {isExpanded ? '▼' : '▶'} View Projects
        </button>
      </div>

      {isExpanded && (
        <div className="offset-content">
          {isLoading ? (
            <div className="offset-loading">
              <div className="loading-spinner"></div>
              <p>Loading carbon offset projects...</p>
            </div>
          ) : error ? (
            <div className="offset-error">
              <div className="error-icon">⚠️</div>
              <p>{error}</p>
              <button 
                onClick={fetchOffsetProjects}
                className="retry-button"
              >
                Try Again
              </button>
            </div>
          ) : offsetProjects.length > 0 ? (
            <div className="offset-projects">
              <div className="projects-intro">
                <p>
                  Consider offsetting your carbon footprint by supporting these verified 
                  carbon reduction projects in India:
                </p>
              </div>
              
              <div className="projects-grid">
                {offsetProjects.map((project) => (
                  <div key={project.id} className="project-card">
                    <div className="project-header">
                      <h4 className="project-title">{project.title}</h4>
                      <span className="project-type">{project.projectType}</span>
                    </div>
                    
                    <div className="project-details">
                      <p className="project-description">{project.description}</p>
                      
                      <div className="project-meta">
                        <div className="project-location">
                          <span className="meta-icon">📍</span>
                          {project.location}
                        </div>
                        
                        {project.creditPrice && (
                          <div className="project-price">
                            <span className="meta-icon">💰</span>
                            ${project.creditPrice}/tonne CO₂e
                          </div>
                        )}
                        
                        {project.availableCredits && (
                          <div className="project-credits">
                            <span className="meta-icon">🏷️</span>
                            {project.availableCredits.toLocaleString()} credits available
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="project-actions">
                      <a 
                        href={project.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="project-link"
                      >
                        Learn More →
                      </a>
                      
                      {project.creditPrice && recommendedOffset > 0 && (
                        <div className="offset-calculation">
                          <small>
                            {recommendedOffset} tonnes ≈ ${(recommendedOffset * project.creditPrice).toFixed(2)}
                          </small>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="offset-disclaimer">
                <p>
                  <strong>Note:</strong> Carbon offsets complement but don't replace emission reduction efforts. 
                  Focus on reducing your carbon footprint first, then offset remaining emissions.
                </p>
              </div>
            </div>
          ) : (
            <div className="no-projects">
              <div className="no-projects-icon">🌍</div>
              <h4>No offset projects available</h4>
              <p>Carbon offset projects are currently unavailable. Please check back later.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default OffsetSuggestions;