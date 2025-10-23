import React from 'react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

const PerformanceDistributionChart = ({ movies }) => {
  // Calculate performance distribution
  const performanceStats = movies.reduce((acc, movie) => {
    const rating = movie.performance_rating || 'Unknown';
    if (!acc[rating]) {
      acc[rating] = { count: 0, revenue: 0 };
    }
    acc[rating].count += 1;
    acc[rating].revenue += parseFloat(movie.revenue || 0);
    return acc;
  }, {});

  // Get ROI color for each performance rating
  function getPerformanceColor(rating) {
    switch (rating) {
      case 'Excellent': return '#4caf50';
      case 'Good': return '#2196f3';
      case 'Break Even': return '#ff9800';
      case 'Loss': return '#f44336';
      case 'Poor': return '#9c27b0';
      default: return '#757575';
    }
  }

  // Format data for donut chart
  const chartData = Object.entries(performanceStats).map(([rating, stats]) => ({
    name: rating,
    value: stats.count,
    revenue: stats.revenue / 1000000, // Convert to millions
    percentage: (stats.count / movies.length * 100).toFixed(1),
    color: getPerformanceColor(rating)
  })).sort((a, b) => b.value - a.value);

  // Calculate portfolio health metrics
  const totalMovies = movies.length;
  const profitableMovies = chartData
    .filter(item => ['Excellent', 'Good'].includes(item.name))
    .reduce((sum, item) => sum + item.value, 0);
  const portfolioHealthScore = ((profitableMovies / totalMovies) * 100).toFixed(1);

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
          <p style={{ fontWeight: 'bold', margin: '0 0 8px 0' }}>{data.name} Performance</p>
          <p style={{ margin: '4px 0', color: '#1976d2' }}>
            Movies: {data.value} ({data.percentage}%)
          </p>
          <p style={{ margin: '4px 0', color: '#4caf50' }}>
            Revenue: ${data.revenue.toFixed(1)}M
          </p>
          <p style={{ margin: '4px 0', fontSize: '12px', color: '#666' }}>
            Avg per Movie: ${(data.revenue / data.value).toFixed(1)}M
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomLabel = ({ cx, cy }) => (
    <text 
      x={cx} 
      y={cy} 
      fill="#1976d2" 
      textAnchor="middle" 
      dominantBaseline="central"
      style={{ fontSize: '16px', fontWeight: 'bold' }}
    >
      <tspan x={cx} dy="-0.5em">Portfolio Health</tspan>
      <tspan x={cx} dy="1.5em" style={{ fontSize: '24px', fill: portfolioHealthScore >= 60 ? '#4caf50' : portfolioHealthScore >= 40 ? '#ff9800' : '#f44336' }}>
        {portfolioHealthScore}%
      </tspan>
    </text>
  );

  if (!chartData.length) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: 300,
        color: '#666' 
      }}>
        No performance data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={400}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={120}
          fill="#8884d8"
          dataKey="value"
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        
        {/* Center label showing portfolio health score */}
        <CustomLabel />
        
        {/* Custom legend with performance categories */}
        <Legend 
          content={() => (
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              flexWrap: 'wrap', 
              gap: '16px',
              paddingTop: '20px' 
            }}>
              {chartData.map(item => (
                <div key={item.name} style={{ 
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
                    {item.name} ({item.percentage}%)
                  </span>
                </div>
              ))}
            </div>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default PerformanceDistributionChart;