import { useState } from 'react';
import './ActivityForm.css';

// Activity configuration matching the server-side config
const ACTIVITY_CONFIG = {
  electricity_residential: {
    label: 'Residential Electricity',
    unit: 'kWh',
    category: 'energy',
    description: 'Household electricity consumption'
  },
  electricity_commercial: {
    label: 'Commercial Electricity',
    unit: 'kWh',
    category: 'energy',
    description: 'Office/commercial electricity usage'
  },
  lpg: {
    label: 'LPG (Cooking Gas)',
    unit: '₹',
    category: 'household',
    description: 'LPG spending in Indian Rupees'
  },
  natural_gas: {
    label: 'Natural Gas',
    unit: '₹',
    category: 'household',
    description: 'Natural gas spending in Indian Rupees'
  },

  
  car_petrol: {
    label: 'Car (Petrol)',
    unit: 'km',
    category: 'transport',
    description: 'Petrol car travel distance'
  },
  car_diesel: {
    label: 'Car (Diesel)',
    unit: 'km',
    category: 'transport',
    description: 'Diesel car travel distance'
  },
  motorcycle_petrol: {
    label: 'Motorcycle (Petrol)',
    unit: 'km',
    category: 'transport',
    description: 'Motorcycle travel distance'
  },


  train_urban_metro: {
    label: 'Metro/Urban Rail',
    unit: 'km',
    category: 'transport',
    description: 'Metro or local train travel'
  },
  train_intercity: {
    label: 'Intercity Train',
    unit: 'km',
    category: 'transport',
    description: 'Long-distance train travel'
  },
  flight_domestic: {
    label: 'Domestic Flight',
    unit: 'km',
    category: 'transport',
    description: 'Domestic air travel'
  },
  flight_international: {
    label: 'International Flight',
    unit: 'km',
    category: 'transport',
    description: 'International air travel'
  },
  
  rice: {
    label: 'Rice',
    unit: '₹',
    category: 'food',
    description: 'Rice spending in Indian Rupees'
  },
  wheat: {
    label: 'Wheat',
    unit: 'kg',
    category: 'food',
    description: 'Wheat/wheat products consumption'
  },
  pulses: {
    label: 'Pulses/Lentils',
    unit: 'kg',
    category: 'food',
    description: 'Dal, lentils, beans consumption'
  },

  eggs: {
    label: 'Eggs',
    unit: '₹',
    category: 'food',
    description: 'Eggs spending in Indian Rupees'
  },
  chicken_meat: {
    label: 'Chicken',
    unit: 'kg',
    category: 'food',
    description: 'Chicken meat consumption'
  },

  

};

// Group activities by category for better UX
const ACTIVITY_CATEGORIES = {
  energy: 'Energy & Utilities',
  household: 'Household',
  transport: 'Transportation',
  food: 'Food & Diet'
};

function ActivityForm({ onCalculationComplete, isLoading }) {
  const [selectedActivity, setSelectedActivity] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Get current activity config
  const currentActivity = ACTIVITY_CONFIG[selectedActivity];

  // Form validation
  const validateForm = () => {
    const newErrors = {};

    if (!selectedActivity) {
      newErrors.activity = 'Please select an activity';
    }

    if (!inputValue) {
      newErrors.value = 'Please enter a value';
    } else {
      const numValue = parseFloat(inputValue);
      if (isNaN(numValue) || numValue <= 0) {
        newErrors.value = 'Please enter a positive number';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSuccessMessage('');
    setErrors({});

    try {
      // Call parent component's calculation handler
      const result = await onCalculationComplete({
        activity: selectedActivity,
        value: parseFloat(inputValue)
      });

      if (result.success) {
        // Reset form after successful submission
        setInputValue('');
        setSuccessMessage(`✓ Calculated ${result.data.co2e.toFixed(2)} kg CO₂e`);
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setErrors({ submit: result.error });
      }
    } catch (err) {
      setErrors({ submit: 'An unexpected error occurred' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle activity selection change
  const handleActivityChange = (e) => {
    setSelectedActivity(e.target.value);
    setErrors(prev => ({ ...prev, activity: '' }));
  };

  // Handle input value change
  const handleValueChange = (e) => {
    setInputValue(e.target.value);
    setErrors(prev => ({ ...prev, value: '' }));
  };

  return (
    <form className="activity-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="activity-select" className="form-label">
          Select Activity
        </label>
        <select
          id="activity-select"
          value={selectedActivity}
          onChange={handleActivityChange}
          className={`form-select ${errors.activity ? 'error' : ''}`}
          disabled={isLoading}
        >
          <option value="">Choose an activity...</option>
          {Object.entries(ACTIVITY_CATEGORIES).map(([categoryKey, categoryLabel]) => (
            <optgroup key={categoryKey} label={categoryLabel}>
              {Object.entries(ACTIVITY_CONFIG)
                .filter(([, config]) => config.category === categoryKey)
                .map(([activityKey, config]) => (
                  <option key={activityKey} value={activityKey}>
                    {config.label}
                  </option>
                ))
              }
            </optgroup>
          ))}
        </select>
        {errors.activity && <span className="error-text">{errors.activity}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="value-input" className="form-label">
          {currentActivity ? `Amount (${currentActivity.unit})` : 'Amount'}
        </label>
        <div className="input-group">
          <input
            id="value-input"
            type="number"
            value={inputValue}
            onChange={handleValueChange}
            placeholder={currentActivity ? `Enter ${currentActivity.unit}` : 'Enter value'}
            className={`form-input ${errors.value ? 'error' : ''}`}
            disabled={isLoading || !selectedActivity}
            min="0"
            step="any"
          />
          {currentActivity && (
            <span className="input-unit">{currentActivity.unit}</span>
          )}
        </div>
        {errors.value && <span className="error-text">{errors.value}</span>}
        {currentActivity && (
          <small className="form-help">{currentActivity.description}</small>
        )}
      </div>

      {/* Success message */}
      {successMessage && (
        <div className="success-message">
          {successMessage}
        </div>
      )}

      {/* Submit error */}
      {errors.submit && (
        <div className="submit-error">
          {errors.submit}
        </div>
      )}

      <button
        type="submit"
        className="submit-button"
        disabled={isLoading || isSubmitting || !selectedActivity || !inputValue}
      >
        {isSubmitting ? 'Calculating...' : 'Calculate Emissions'}
      </button>
    </form>
  );
}

export default ActivityForm;