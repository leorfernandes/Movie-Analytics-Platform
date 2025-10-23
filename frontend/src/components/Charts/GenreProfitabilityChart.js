import React from 'react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

const GenreProfitabilityChart = ({ analytics }) => {
  // Extract genre data from analytics
  const genreData = analytics?.genre_insights || [];

  // Format data for pie chart
  const chartData = genreData
    .map(genre => ({
      name: genre.genre_name || genre.name,
      value: parseFloat(genre.avg_revenue || 0) / 1000000, // Convert to millions
      avgROI: parseFloat(genre.avg_roi || 0),
      movieCount: genre.movie_count || 0,
      color: getGenreColor(genre.avg_roi || 0)
    }))
    .filter(genre => genre.value > 0) // Only show genres with revenue
    .sort((a, b) => b.value - a.value); // Sort by revenue

  // Color coding based on ROI performance
  function getGenreColor(roi) {
    if (roi >= 200) return '#4caf50';      // Excellent - Green
    if (roi >= 100) return '#8bc34a';      // Very Good - Light Green
    if (roi >= 50) return '#2196f3';       // Good - Blue
    if (roi >= 0) return '#ff9800';        // Break Even - Orange
    if (roi >= -25) return '#ff5722';      // Poor - Red Orange
    return '#f44336';                      // Loss - Red
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
          <p style={{ fontWeight: 'bold', margin: '0 0 8px 0' }}>{data.name}</p>
          <p style={{ margin: '4px 0', color: '#1976d2' }}>
            Revenue: ${data.value.toFixed(1)}M
          </p>
          <p style={{ margin: '4px 0', color: '#4caf50' }}>
            Avg ROI: {data.avgROI.toFixed(1)}%
          </p>
          <p style={{ margin: '4px 0', color: '#666' }}>
            Movies: {data.movieCount}
          </p>
          <p style={{ margin: '4px 0', fontSize: '12px', color: '#666' }}>
            Share: {((data.value / chartData.reduce((sum, g) => sum + g.value, 0)) * 100).toFixed(1)}%
          </p>
        </div>
      );
    }
    return null;
  };

  if (!chartData.length) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: 300,
        color: '#666' 
      }}>
        No genre data available
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
          outerRadius={120}
          fill="#8884d8"
          dataKey="value"
          name=""
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend 
            content={() => (
            <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                flexWrap: 'wrap', 
                gap: '16px',
                paddingTop: '20px' 
            }}>
                {[
                { value: 'Excellent ROI', color: '#4caf50' },
                { value: 'Very Good ROI', color: '#8bc34a' },
                { value: 'Good ROI', color: '#2196f3' },
                { value: 'Break Even', color: '#ff9800' },
                { value: 'Poor/Loss', color: '#f44336' }
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
            )}
        />
        </PieChart>
    </ResponsiveContainer>
    );
};

export default GenreProfitabilityChart;