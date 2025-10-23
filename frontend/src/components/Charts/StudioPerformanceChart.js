import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Cell
} from 'recharts';

const StudioPerformanceChart = ({ analytics }) => {
  // Extract studio data from analytics
  const studioData = analytics?.studio_insights || [];

  // Color function for ROI performance 
  function getROIColor(roi) {
    if (roi >= 200) return '#4caf50';      // Excellent - Green
    if (roi >= 100) return '#8bc34a';      // Very Good - Light Green
    if (roi >= 50) return '#2196f3';       // Good - Blue
    if (roi >= 0) return '#ff9800';        // Break Even - Orange
    if (roi >= -25) return '#ff5722';      // Poor - Red Orange
    return '#f44336';                      // Loss - Red
  }

  // Format data for the bar chart
  const chartData = studioData.map(studio => ({
    name: studio.studio_name || studio.name,
    revenue: parseFloat(studio.total_revenue || 0) / 1000000, // Convert to millions
    avgROI: parseFloat(studio.avg_roi || 0),
    movieCount: studio.movie_count || 0,
    profitableMovies: studio.profitable_movies || 0,
    color: getROIColor(parseFloat(studio.avg_roi || 0))
  })).sort((a, b) => b.revenue - a.revenue); // Sort by revenue descending

  const CustomTooltip = ({ active, payload, label }) => {
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
          <p style={{ fontWeight: 'bold', margin: '0 0 8px 0' }}>{label}</p>
          <p style={{ margin: '4px 0', color: '#1976d2' }}>
            Revenue: ${data.revenue.toFixed(1)}M
          </p>
          <p style={{ margin: '4px 0', color: '#4caf50' }}>
            Avg ROI: {data.avgROI.toFixed(1)}%
          </p>
          <p style={{ margin: '4px 0', color: '#666' }}>
            Movies: {data.movieCount}
          </p>
          <p style={{ margin: '4px 0', color: '#666' }}>
            Profitable: {data.profitableMovies}/{data.movieCount}
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
        No studio data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="name" 
          tick={false}
          axisLine={true}
          tickLine={false}
        />
        <YAxis 
          tickFormatter={(value) => `$${value}M`}
        />
        <Tooltip content={<CustomTooltip />} />
        <Bar 
          dataKey="revenue" 
          name="Total Revenue ($M)"
          radius={[4, 4, 0, 0]}
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Bar>
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
      </BarChart>
    </ResponsiveContainer>
  );
};

export default StudioPerformanceChart;