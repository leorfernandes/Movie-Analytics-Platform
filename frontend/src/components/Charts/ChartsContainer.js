import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Grid, 
  Card, 
  CardContent, 
  Typography, 
  CircularProgress,
  Alert,
  AlertTitle,
  IconButton,
  Button,
  Chip
} from '@mui/material';
import {
  Refresh,                           
  ErrorOutline,                  
  Assessment,                  
  TrendingUp               
} from '@mui/icons-material';
import BudgetRevenueChart from './BudgetRevenueChart';
import StudioPerformanceChart from './StudioPerformanceChart';
import GenreProfitabilityChart from './GenreProfitabilityChart';
import PerformanceDistributionChart from './PerformanceDistributionChart';
import movieAPI from '../../services/api';
import { ChartLoadingCard } from '../Common/LoadingStates';
import { useErrorHandler } from '../../hooks/useErrorHandler';        // 🔧 ADD
import { useToast } from '../Common/ToastProvider'; 

{/* Chart Error Card Component */}
const ChartErrorCard = ({ title, error, onRetry }) => (
  <Card sx={{ height: { xs: 'auto', lg: '500px' } }}>
    <CardContent sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      justifyContent: 'center', 
      alignItems: 'center',
      height: '100%',
      textAlign: 'center',
      p: 3 
    }}>
      <ErrorOutline sx={{ fontSize: 48, color: 'error.main', mb: 2 }} />
      <Typography variant="h6" gutterBottom fontWeight="bold">
        {title}
      </Typography>
      <Alert severity="error" sx={{ mb: 2, width: '100%' }}>
        <AlertTitle>Chart Load Failed</AlertTitle>
        {error || 'Unable to load chart data'}
      </Alert>
      <Button 
        variant="outlined" 
        startIcon={<Refresh />}
        onClick={onRetry}
        size="small"
      >
        Retry Chart
      </Button>
    </CardContent>
  </Card>
);

{/* Chart Error Display Component */}
const ChartsErrorDisplay = ({ error, onRetry, partialData }) => (
  <Box sx={{ mt: 6 }}>
    <Typography 
      variant="h4" 
      gutterBottom 
      fontWeight="bold" 
      color="primary"
      sx={{ mb: 4 }}
    >
      📊 Business Intelligence Analytics
    </Typography>
    
    <Alert 
      severity="error" 
      sx={{ mb: 4 }}
      action={
        <IconButton
          aria-label="retry"
          color="inherit"
          size="small"
          onClick={onRetry}
        >
          <Refresh />
        </IconButton>
      }
    >
      <AlertTitle>Analytics Data Load Failed</AlertTitle>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <ErrorOutline fontSize="small" />
        <Typography variant="body2">
          {error || 'Unable to fetch analytics data. Please try again.'}
        </Typography>
      </Box>
      {partialData && (
        <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
          Some data may be available. Showing partial results below.
        </Typography>
      )}
    </Alert>

    {/* Show skeleton cards when there's an error */}
    <Grid container spacing={4}>
      <Grid item xs={12} lg={6}>
        <ChartLoadingCard title="💰 Budget vs Revenue Analysis" />
      </Grid>
      <Grid item xs={12} lg={6}>
        <ChartLoadingCard title="🏢 Studio Performance Comparison" />
      </Grid>
      <Grid item xs={12} md={6}>
        <ChartLoadingCard title="🎭 Genre Market Analysis" />
      </Grid>
      <Grid item xs={12} md={6}>
        <ChartLoadingCard title="📈 Portfolio Performance Health" />
      </Grid>
    </Grid>
  </Box>
);

const ChartsContainer = () => {
  const [movies, setMovies] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loading_debug, setLoadingDebug] = useState(false);
  const [error, setError] = useState(null); 
  const [retryCount, setRetryCount] = useState(0);
  const [chartErrors, setChartErrors] = useState({});
  const { handleError, handleSuccess } = useErrorHandler(); 

  const fetchChartData = async (isRetry = false) => {
    try {
      if (isRetry) {
        setRetryCount(prev => prev + 1);
        handleSuccess('Retrying charts data fetch...', { duration: 2000 });
      }

      setLoading(true);
      setError(null);
      setChartErrors({});

      const [moviesRes, analyticsRes] = await Promise.all([
        movieAPI.getMovies().catch(err => {
          console.error('Movies API failed:', err);
          throw new Error('Failed to fetch movies data');
        }),
        movieAPI.getAnalytics().catch(err => {
          console.error('Analytics API failed:', err);
          throw new Error('Failed to fetch analytics data');
        })
      ]);

      // Process movies data
      const allMovies = moviesRes.data.results || moviesRes.data;
      const completeMovies = allMovies.filter(movie => 
        movie.revenue && 
        movie.budget && 
        movie.performance_rating &&
        movie.performance_rating !== 'Unknown'
      );
    
      console.log(`Charts: ${completeMovies.length} complete movies out of ${allMovies.length} total`);

      // Data quality validation
      if (completeMovies.length === 0) {
        throw new Error('No complete movie data available for charts');
      }

      if (completeMovies.length < 5) {
        handleSuccess(`Limited data: Only ${completeMovies.length} movies available for analysis`, { 
          severity: 'warning',
          duration: 5000 
        });
      }

      setMovies(completeMovies);
      setAnalytics(analyticsRes.data);
      
      if (isRetry) {
        handleSuccess(`Charts loaded successfully! Showing ${completeMovies.length} movies.`);
      }

    } catch (err) {
      const errorMessage = err.message || 'Failed to fetch chart data';
      setError(errorMessage);
      handleError(err, 'Charts data fetch failed');
    } finally {
      setLoading(false);
    }
  };

  // Individual chart retry handler
  const retryChart = (chartName) => {
    setChartErrors(prev => ({ ...prev, [chartName]: null }));
    // In a real app, you might refetch specific chart data here
    handleSuccess(`Retrying ${chartName}...`, { duration: 2000 });
  };

  useEffect(() => {
    fetchChartData();
  }, []);

  // Retry handler
  const handleRetry = () => {
    fetchChartData(true);
  };


  if (loading || loading_debug) {
    return (
      <Box sx={{ mt: 6 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography 
            variant="h4" 
            gutterBottom 
            fontWeight="bold" 
            color="primary"
          >
            📊 Business Intelligence Analytics
          </Typography>
          {retryCount > 0 && (
            <Chip 
              label={`Retry attempt ${retryCount}`} 
              size="small" 
              color="warning" 
              variant="outlined"
            />
          )}
        </Box>

        <Grid container spacing={4}>
          <Grid item xs={12} lg={6}>
            <ChartLoadingCard title="💰 Budget vs Revenue Analysis" />
          </Grid>
          <Grid item xs={12} lg={6}>
            <ChartLoadingCard title="🏢 Studio Performance Comparison" />
          </Grid>
          <Grid item xs={12} md={6}>
            <ChartLoadingCard title="🎭 Genre Market Analysis" />
          </Grid>
          <Grid item xs={12} md={6}>
            <ChartLoadingCard title="📈 Portfolio Performance Health" />
          </Grid>
        </Grid>
      </Box>
    );
  }

  if (error && !movies.length) {
    return <ChartsErrorDisplay error={error} onRetry={handleRetry} />;
  }

  return (
    <Box sx={{ mt: 6 }}>
      {/* Header with data quality indicators */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography 
          variant="h4" 
          gutterBottom 
          fontWeight="bold" 
          color="primary"
        >
          📊 Business Intelligence Analytics
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {movies.length > 0 && (
            <Chip 
              icon={<Assessment />}
              label={`${movies.length} Movies`} 
              size="small" 
              color="primary" 
              variant="outlined"
            />
          )}
          {analytics && (
            <Chip 
              icon={<TrendingUp />}
              label={`${(analytics?.financial_summary?.overall_roi || 0).toFixed(1)}% ROI`} 
              size="small" 
              color={analytics?.financial_summary?.overall_roi > 0 ? "success" : "error"} 
              variant="outlined"
            />
          )}
          {retryCount > 0 && (
            <Chip 
              label="Recently refreshed" 
              size="small" 
              color="info" 
              variant="outlined"
            />
          )}
        </Box>
      </Box>

      {/* Error alert for partial failures */}
      {error && movies.length > 0 && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <AlertTitle>Partial Data Available</AlertTitle>
          Some data could not be loaded, but charts are showing available information.
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Budget vs Revenue Scatter Plot */}
        <Grid item xs={12} lg={6}>
          {chartErrors.budgetRevenue ? (
            <ChartErrorCard 
              title="💰 Budget vs Revenue Analysis" 
              error={chartErrors.budgetRevenue}
              onRetry={() => retryChart('budgetRevenue')}
            />
          ) : (
            <Card sx={{ height: { xs: 'auto', lg: '500px' } }}>
              <CardContent>
                <Typography variant="h6" gutterBottom color="primary" fontWeight="bold">
                  💰 Budget vs Revenue Analysis
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                  ROI performance by investment level • Interactive scatter plot
                </Typography>
                <Box sx={{ height: { xs: 300, sm: 350, lg: 400 } }}>
                  <BudgetRevenueChart movies={movies} />
                </Box>
              </CardContent>
            </Card>
          )}
        </Grid>

        {/* Studio Performance Chart */}
        <Grid item xs={12} lg={6}>
          {chartErrors.studioPerformance ? (
            <ChartErrorCard 
              title="🏢 Studio Performance Comparison" 
              error={chartErrors.studioPerformance}
              onRetry={() => retryChart('studioPerformance')}
            />
          ) : (
            <Card sx={{ height: { xs: 'auto', lg: '500px' } }}>
              <CardContent>
                <Typography variant="h6" gutterBottom color="primary" fontWeight="bold">
                  🏢 Studio Performance Comparison
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                  Revenue in millions by studio • Interactive bar chart
                </Typography>
                <Box sx={{ height: { xs: 300, sm: 350, lg: 400 } }}>
                  <StudioPerformanceChart analytics={analytics} />
                </Box>
              </CardContent>
            </Card>
          )}
        </Grid>

        {/* Genre Market Analysis */}
        <Grid item xs={12} md={6}>
          {chartErrors.genreProfitability ? (
            <ChartErrorCard 
              title="🎭 Genre Market Analysis" 
              error={chartErrors.genreProfitability}
              onRetry={() => retryChart('genreProfitability')}
            />
          ) : (
            <Card sx={{ height: { xs: 'auto', md: '500px' } }}>
              <CardContent>
                <Typography variant="h6" gutterBottom color="primary" fontWeight="bold">
                  🎭 Genre Market Analysis
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                  Revenue share and ROI performance by genre
                </Typography>
                <Box sx={{ height: { xs: 300, sm: 350, md: 400 } }}>
                  <GenreProfitabilityChart analytics={analytics} />
                </Box>
              </CardContent>
            </Card>
          )}
        </Grid>

        {/* Portfolio Performance Health */}
        <Grid item xs={12} md={6}>
          {chartErrors.performanceDistribution ? (
            <ChartErrorCard 
              title="📈 Portfolio Performance Health" 
              error={chartErrors.performanceDistribution}
              onRetry={() => retryChart('performanceDistribution')}
            />
          ) : (
            <Card sx={{ height: { xs: 'auto', md: '500px' } }}>
              <CardContent>
                <Typography variant="h6" gutterBottom color="primary" fontWeight="bold">
                  📈 Portfolio Performance Health
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                  Investment portfolio breakdown • Risk assessment
                </Typography>
                <Box sx={{ height: { xs: 300, sm: 350, md: 400 } }}>
                  <PerformanceDistributionChart movies={movies} />
                </Box>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default ChartsContainer;