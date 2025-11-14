import React from 'react';
import { Link } from 'react-router-dom';
import Logo from '../components/Logo';
import '../pages/LandingPage.css';

const LandingPage = () => {
  return (
    <div className="landing-page">
      {/* Navigation */}
      <nav className="landing-nav">
        <div className="nav-container">
          <div className="nav-logo">
            <Logo size="medium" />
          </div>
          <div className="nav-links">
            <Link to="/login" className="nav-link">Sign In</Link>
            <Link to="/signup" className="nav-link nav-link-primary">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-container">
          <div className="hero-content">
            <h1 className="hero-title">
              Track Your Carbon Footprint
              <span className="hero-title-accent"> in India</span>
            </h1>
            <p className="hero-subtitle">
              Monitor and reduce your environmental impact with India-specific emission factors. 
              Make data-driven decisions to create a sustainable future.
            </p>
            <div className="hero-buttons">
              <Link to="/signup" className="btn btn-primary">
                Start Tracking
              </Link>
              <Link to="/login" className="btn btn-secondary">
                Sign In
              </Link>
            </div>
            <div className="hero-stats">
              <div className="stat-item">
                <div className="stat-value">1000+</div>
                <div className="stat-label">Users Tracking</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">50K+</div>
                <div className="stat-label">Emissions Calculated</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">15%</div>
                <div className="stat-label">Average Reduction</div>
              </div>
            </div>
          </div>
          <div className="hero-visual">
            <div className="hero-card">
              <div className="card-icon">📊</div>
              <div className="card-title">Real-time Tracking</div>
              <div className="card-description">Monitor your carbon emissions in real-time</div>
            </div>
            <div className="hero-card hero-card-secondary">
              <div className="card-icon">🌍</div>
              <div className="card-title">India-Specific</div>
              <div className="card-description">Accurate data for Indian context</div>
            </div>
            <div className="hero-card hero-card-tertiary">
              <div className="card-icon">💡</div>
              <div className="card-title">Smart Insights</div>
              <div className="card-description">Get personalized recommendations</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="features-container">
          <h2 className="section-title">Why Choose Our Platform?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🎯</div>
              <h3 className="feature-title">Accurate Calculations</h3>
              <p className="feature-description">
                Use India-specific emission factors for precise carbon footprint calculations
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📈</div>
              <h3 className="feature-title">Visual Analytics</h3>
              <p className="feature-description">
                Beautiful charts and graphs to visualize your environmental impact over time
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🌳</div>
              <h3 className="feature-title">Offset Suggestions</h3>
              <p className="feature-description">
                Get personalized recommendations to offset your carbon emissions
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🔒</div>
              <h3 className="feature-title">Secure & Private</h3>
              <p className="feature-description">
                Your data is encrypted and stored securely. Privacy is our priority
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📱</div>
              <h3 className="feature-title">Easy to Use</h3>
              <p className="feature-description">
                Intuitive interface designed for everyone, no technical knowledge required
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">⚡</div>
              <h3 className="feature-title">Real-time Updates</h3>
              <p className="feature-description">
                Get instant updates on your carbon footprint as you add activities
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-container">
          <h2 className="cta-title">Ready to Make a Difference?</h2>
          <p className="cta-subtitle">
            Join thousands of users who are taking action to reduce their carbon footprint
          </p>
          <Link to="/signup" className="btn btn-primary btn-large">
            Get Started Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-container">
          <div className="footer-content">
            <div className="footer-logo">
              <Logo size="medium" />
            </div>
            <p className="footer-text">
              Making carbon tracking accessible and actionable for everyone in India.
            </p>
          </div>
          <div className="footer-links">
            <Link to="/login" className="footer-link">Sign In</Link>
            <Link to="/signup" className="footer-link">Sign Up</Link>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2024 CO2Kam. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;

