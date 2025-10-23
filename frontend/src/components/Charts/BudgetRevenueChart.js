import React from 'react';
import { 
  ScatterChart, 
  Scatter, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  ReferenceLine,
  Cell
} from 'recharts';

const BudgetRevenueChart = ({ movies }) => {
  // Prepare data for scatter plot
  const chartData = movies
    .filter(movie => movie.budget && movie.revenue && movie.budget > 0 && movie.revenue > 0)
    .map(movie => ({
      x: parseFloat(movie.budget) / 1000000, // Convert to millions
      y: parseFloat(movie.revenue) / 1000000, // Convert to millions
      title: movie.title,
      roi: movie.roi,
      budget_category: movie.budget_category,
      performance_rating: movie.performance_rating,
      // Color based on performance
      fill: getPerformanceColor(movie.performance_rating)
    }));

  function getPerformanceColor(rating) {
    switch(rating) {
      case 'Excellent': return '#4caf50'; // Green
      case 'Good': return '#2196f3';      // Blue  
      case 'Break Even': return '#ff9800'; // Orange
      case 'Loss': return '#f44336';      // Red
      case 'Poor': return '#9c27b0';      // Purple
      default: return '#757575';          // Gray
    }
  }

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div style={{
          backgroundColor: 'white',
          padding: '12px',
          border: '1px solid #ccc',
          borderRadius: '8px',
          boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
        }}>
          <p style={{ fontWeight: 'bold', margin: 0 }}>{data.title}</p>
          <p style={{ margin: '4px 0', color: '#666' }}>
            Budget: ${data.x.toFixed(1)}M
          </p>
          <p style={{ margin: '4px 0', color: '#666' }}>
            Revenue: ${data.y.toFixed(1)}M
          </p>
          <p style={{ margin: '4px 0', color: data.fill }}>
            ROI: {data.roi}%
          </p>
          <p style={{ margin: '4px 0', color: data.fill }}>
            Performance: {data.performance_rating}
          </p>
          <p style={{ margin: '4px 0', fontSize: '12px' }}>
            Category: {data.budget_category}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={400}>
      <ScatterChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          type="number" 
          dataKey="x" 
          name="Budget"
          unit="M"
          tickFormatter={(value) => `$${value}M`}
        />
        <YAxis 
          type="number" 
          dataKey="y" 
          name="Revenue"
          unit="M"
          tickFormatter={(value) => `$${value}M`}
        />
        <Tooltip content={<CustomTooltip />} />
        
        <Scatter data={chartData} r={8}>
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.fill} />
          ))}
        </Scatter>
        
        
        {/* Custom Legend */}
        <Legend 
                content={(props) => {
                  const { payload } = props;
                  return (
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'center', 
                      flexWrap: 'wrap', 
                      gap: '16px',
                      paddingTop: '20px' 
                    }}>
                      {[
                        { value: 'Excellent', color: '#4caf50' },
                        { value: 'Good', color: '#2196f3' },
                        { value: 'Break Even', color: '#ff9800' },
                        { value: 'Loss', color: '#f44336' },
                        { value: 'Poor', color: '#9c27b0' }
                      ].map(item => (
                        <div key={item.value} style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '4px' 
                        }}>
                          <div style={{
                            width: '12px',
                            height: '12px',
                            borderRadius: '50%',
                            backgroundColor: item.color
                          }} />
                          <span style={{ 
                            fontSize: '12px', 
                            color: '#666' 
                          }}>
                            {item.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  );
                }}
              />
            </ScatterChart>
          </ResponsiveContainer>
        );
};

export default BudgetRevenueChart;