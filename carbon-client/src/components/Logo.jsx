import React from 'react';
import './Logo.css';

const Logo = ({ size = 'medium', showText = true, className = '' }) => {
  return (
    <div className={`logo-container ${size} ${className}`}>
      <div className="logo-icon">
        {/* Replace this with your actual logo */}
        <img 
          src="/logo.png" 
          alt="CO2Kam Logo" 
          className="logo-image"
          onError={(e) => {
            // Fallback to emoji if logo image fails to load
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'inline';
          }}
        />
        <span className="logo-fallback" style={{ display: 'none' }}>🌱</span>
      </div>
      {showText && <span className="logo-text">CO2Kam</span>}
    </div>
  );
};

export default Logo;