import { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import './FootprintChart.css';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const FootprintChart = ({ entries, chartType = 'daily', className = '' }) => {
  // Process entries for daily emissions chart
  const processDailyData = (entries) => {
    // Group entries by date
    const dailyTotals = {};
    
    entries.forEach(entry => {
      const date = new Date(entry.timestamp).toLocaleDateString('en-IN');
      if (!dailyTotals[date]) {
        dailyTotals[date] = 0;
      }
      dailyTotals[date] += entry.co2e;
    });

    // Sort dates and prepare chart data
    const sortedDates = Object.keys(dailyTotals).sort((a, b) => 
      new Date(a.split('/').reverse().join('-')) - new Date(b.split('/').reverse().join('-'))
    );

    return {
      labels: sortedDates,
      datasets: [
        {
          label: 'Daily CO₂e Emissions (kg)',
          data: sortedDates.map(date => dailyTotals[date].toFixed(2)),
          backgroundColor: 'rgba(147, 51, 234, 0.6)',
          borderColor: 'rgba(147, 51, 234, 1)',
          borderWidth: 2,
          fill: false,
        },
      ],
    };
  };

  // Process entries for category breakdown chart
  const processCategoryData = (entries) => {
    // Define category mapping based on activity config
    const categoryMapping = {
      // Transport activities
      car_petrol: 'transport',
      car_diesel: 'transport',
      motorcycle_petrol: 'transport',
      train_urban_metro: 'transport',
      train_intercity: 'transport',
      flight_domestic: 'transport',
      flight_international: 'transport',
      
      // Food activities
      rice: 'food',
      wheat: 'food',
      pulses: 'food',
      eggs: 'food',
      chicken_meat: 'food',
      
      // Household/Energy activities
      electricity_residential: 'energy',
      electricity_commercial: 'energy',
      lpg: 'household',
      natural_gas: 'household',
    };

    // Group entries by category
    const categoryTotals = {};
    
    entries.forEach(entry => {
      const category = categoryMapping[entry.activity] || 'other';
      if (!categoryTotals[category]) {
        categoryTotals[category] = 0;
      }
      categoryTotals[category] += entry.co2e;
    });

    // Prepare chart data with vibrant pop-out colors
    const categories = Object.keys(categoryTotals);
    const colors = [
      'rgba(255, 99, 132, 0.8)',   // Bright Red - Transport
      'rgba(54, 162, 235, 0.8)',   // Bright Blue - Food
      'rgba(255, 205, 86, 0.8)',   // Bright Yellow - Energy
      'rgba(75, 192, 192, 0.8)',   // Bright Teal - Household
      'rgba(153, 102, 255, 0.8)',  // Bright Purple - Other
    ];

    return {
      labels: categories.map(cat => cat.charAt(0).toUpperCase() + cat.slice(1)),
      datasets: [
        {
          label: 'CO₂e by Category (kg)',
          data: categories.map(cat => categoryTotals[cat].toFixed(2)),
          backgroundColor: colors.slice(0, categories.length),
          borderColor: colors.slice(0, categories.length).map(color => 
            color.replace('0.8', '1')
          ),
          borderWidth: 2,
        },
      ],
    };
  };

  // Process data based on chart type
  const chartData = useMemo(() => {
    if (!entries || entries.length === 0) {
      return null;
    }

    if (chartType === 'daily') {
      return processDailyData(entries);
    } else if (chartType === 'category') {
      return processCategoryData(entries);
    }

    return null;
  }, [entries, chartType]);

  // Chart options for daily chart
  const dailyChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#e5e7eb',
          font: {
            size: 12,
            weight: '500',
          },
        },
      },
      title: {
        display: true,
        text: 'Daily Carbon Emissions',
        color: '#a855f7',
        font: {
          size: 16,
          weight: 'bold',
        },
      },
      tooltip: {
        backgroundColor: 'rgba(26, 26, 26, 0.9)',
        titleColor: '#a855f7',
        bodyColor: '#e5e7eb',
        borderColor: 'rgba(147, 51, 234, 0.5)',
        borderWidth: 1,
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: ${context.parsed.y} kg CO₂e`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'CO₂e (kg)',
          color: '#d1d5db',
        },
        ticks: {
          color: '#9ca3af',
        },
        grid: {
          color: 'rgba(147, 51, 234, 0.2)',
        },
      },
      x: {
        title: {
          display: true,
          text: 'Date',
          color: '#d1d5db',
        },
        ticks: {
          color: '#9ca3af',
        },
        grid: {
          color: 'rgba(147, 51, 234, 0.2)',
        },
      },
    },
  };

  // Chart options for category chart
  const categoryChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          color: '#e5e7eb',
          font: {
            size: 12,
            weight: '500',
          },
          padding: 15,
        },
      },
      title: {
        display: true,
        text: 'Emissions by Category',
        color: '#a855f7',
        font: {
          size: 16,
          weight: 'bold',
        },
      },
      tooltip: {
        backgroundColor: 'rgba(26, 26, 26, 0.9)',
        titleColor: '#a855f7',
        bodyColor: '#e5e7eb',
        borderColor: 'rgba(147, 51, 234, 0.5)',
        borderWidth: 1,
        callbacks: {
          label: function(context) {
            const total = context.dataset.data.reduce((sum, val) => sum + parseFloat(val), 0);
            const percentage = ((parseFloat(context.parsed) / total) * 100).toFixed(1);
            return `${context.label}: ${context.parsed} kg CO₂e (${percentage}%)`;
          },
        },
      },
    },
  };

  // Handle empty data state
  if (!chartData) {
    return (
      <div className={`footprint-chart empty-state ${className}`}>
        <div className="empty-chart-placeholder">
          <p>No data available for visualization</p>
          <p>Start tracking your activities to see charts here!</p>
        </div>
      </div>
    );
  }

  // Render appropriate chart based on type
  return (
    <div className={`footprint-chart ${className}`}>
      <div className="chart-container">
        {chartType === 'daily' && (
          <Bar data={chartData} options={dailyChartOptions} />
        )}
        {chartType === 'category' && (
          <Doughnut data={chartData} options={categoryChartOptions} />
        )}
      </div>
    </div>
  );
};

export default FootprintChart;