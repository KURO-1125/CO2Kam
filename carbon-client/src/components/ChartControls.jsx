import './ChartControls.css';

const ChartControls = ({ chartType, onChartTypeChange, className = '' }) => {
  const chartTypes = [
    { value: 'daily', label: 'Daily Trends', icon: '📊' },
    { value: 'category', label: 'By Category', icon: '🥧' },
  ];

  return (
    <div className={`chart-controls ${className}`}>
      <div className="chart-type-selector">
        <span className="selector-label">View:</span>
        {chartTypes.map(type => (
          <button
            key={type.value}
            className={`chart-type-button ${chartType === type.value ? 'active' : ''}`}
            onClick={() => onChartTypeChange(type.value)}
            title={`Switch to ${type.label} view`}
          >
            <span className="chart-icon">{type.icon}</span>
            <span className="chart-label">{type.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ChartControls;