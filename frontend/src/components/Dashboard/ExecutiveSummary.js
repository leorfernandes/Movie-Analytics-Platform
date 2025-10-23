import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Grid, 
  Card, 
  CardContent, 
  Typography, 
  Button, 
  Menu, 
  MenuItem, 
  Divider,
  Chip,
  Alert,
  AlertTitle,
  IconButton
} from '@mui/material';
import { 
  TrendingUp, 
  Movie, 
  AttachMoney, 
  Assessment,
  FileDownload,
  PictureAsPdf,
  TableChart,
  Refresh,
  ErrorOutline
} from '@mui/icons-material';
import movieAPI from '../../services/api';
import { KPICardSkeleton } from '../Common/LoadingStates';
import { exportDashboardToPDF, exportMovieDataToCSV, exportAnalyticsToCSV } from '../../utils/exportUtils';
import { useErrorHandler } from '../../hooks/useErrorHandler';        // 🔧 ADD
import { useToast } from '../Common/ToastProvider';     

const KPICard = ({ title, value, icon, color, subtitle }) => (
  <Card sx={{ height: '100%', background: `linear-gradient(135deg, ${color}15 0%, ${color}05 100%)` }}>
    <CardContent>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Box>
          <Typography color="textSecondary" gutterBottom variant="h6">
            {title}
          </Typography>
          <Typography variant="h4" component="div" color={color} fontWeight="bold">
            {value}
          </Typography>
          {subtitle && (
            <Typography variant="body2" color="textSecondary">
              {subtitle}
            </Typography>
          )}
        </Box>
        <Box sx={{ color: color, fontSize: 40 }}>
          {icon}
        </Box>
      </Box>
    </CardContent>
  </Card>
);

const ExportToolbar = ({ analytics, loading }) => {
  const [exportMenuAnchor, setExportMenuAnchor] = useState(null);
  const [movies, setMovies] = useState([]);
  const [exportLoading, setExportLoading] = useState(false);
  const { handleError, handleSuccess } = useErrorHandler(); 

  // Fetch movies for export
  useEffect(() => {
    const fetchMoviesForExport = async () => {
      try {
        const response = await movieAPI.getMovies();
        const allMovies = response.data.results || response.data;
        setMovies(allMovies);
      } catch (error) {
        handleError(error, 'Failed to fetch movies for export');
      }
    };

    fetchMoviesForExport();
  }, [handleError]);

  const handleExportClick = (event) => {
    setExportMenuAnchor(event.currentTarget);
  };

  const handleExportClose = () => {
    setExportMenuAnchor(null);
  };

  const handlePDFExport = async () => {
    try {
      setExportLoading(true);
      await exportDashboardToPDF(analytics, movies);
      handleSuccess('Executive report exported successfully!');
      handleExportClose();
    } catch (error) {
      handleError(error, 'Failed to export PDF report');
    } finally {
      setExportLoading(false);
    }
  };

  const handleCSVExport = async () => {
    try {
      setExportLoading(true);
      await exportMovieDataToCSV(movies);
      handleSuccess(`Successfully exported ${movies.length} movies to CSV!`);
      handleExportClose();
    } catch (error) {
      handleError(error, 'Failed to export movie data');
    } finally {
      setExportLoading(false);
    }
  };

  const handleAnalyticsExport = async () => {
    try {
      setExportLoading(true);
      await exportAnalyticsToCSV(analytics);
      handleSuccess('Analytics summary exported successfully!');
      handleExportClose();
    } catch (error) {
      handleError(error, 'Failed to export analytics summary');
    } finally {
      setExportLoading(false);
    }
  };

return (
    <Box>
      <Button
        variant="outlined"
        startIcon={<FileDownload />}
        onClick={handleExportClick}
        disabled={loading || exportLoading}
        sx={{ 
          borderColor: 'primary.main',
          '&:hover': { 
            backgroundColor: 'primary.50' 
          }
        }}
      >
         {exportLoading ? 'Exporting...' : 'Export Reports'}
      </Button>
      
      <Menu
        anchorEl={exportMenuAnchor}
        open={Boolean(exportMenuAnchor)}
        onClose={handleExportClose}
        PaperProps={{
          sx: { minWidth: 220 }
        }}
      >
        <MenuItem onClick={handlePDFExport} disabled={loading || exportLoading}>
          <PictureAsPdf sx={{ mr: 2, color: 'error.main' }} />
          <Box>
            <Typography variant="body2" fontWeight="bold">
              Executive Report
            </Typography>
            <Typography variant="caption" color="textSecondary">
              Professional PDF summary
            </Typography>
          </Box>
        </MenuItem>
        
        <Divider />
        
        <MenuItem onClick={handleCSVExport} disabled={loading || exportLoading || !movies.length}>
          <TableChart sx={{ mr: 2, color: 'success.main' }} />
          <Box>
            <Typography variant="body2" fontWeight="bold">
              Full Dataset ({movies.length} movies) 
            </Typography>
            <Typography variant="caption" color="textSecondary">
              Complete movie database CSV
            </Typography>
          </Box>
        </MenuItem>
        
        <MenuItem onClick={handleAnalyticsExport} disabled={loading || exportLoading}>
          <Assessment sx={{ mr: 2, color: 'info.main' }} />
          <Box>
            <Typography variant="body2" fontWeight="bold">
              Analytics Summary
            </Typography>
            <Typography variant="caption" color="textSecondary">
              Key metrics overview CSV
            </Typography>
          </Box>
        </MenuItem>
      </Menu>
    </Box>
  );
};

  const ErrorDisplay = ({ error, onRetry }) => (
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
      <AlertTitle>Failed to Load Dashboard Data</AlertTitle>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <ErrorOutline fontSize="small" />
        <Typography variant="body2">
          {error || 'Unable to fetch analytics data. Please try again.'}
        </Typography>
      </Box>
    </Alert>
  );

const ExecutiveSummary = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loading_debug, setLoadingDebug] = useState(false);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);   
  const { handleError, handleSuccess } = useErrorHandler(); 

  const fetchAnalytics = async (isRetry = false) => {
    try {
      if (isRetry) {
        setRetryCount(prev => prev + 1);
        handleSuccess('Retrying dashboard data fetch...', { duration: 2000 });
      }
      
      setLoading(true);
      setError(null);
      
      const response = await movieAPI.getAnalytics();
      setAnalytics(response.data);
      
      if (isRetry) {
        handleSuccess('Dashboard data loaded successfully!');
      }
    } catch (err) {
      const errorMessage = 'Failed to fetch analytics data';
      setError(errorMessage);
      handleError(err, 'Dashboard analytics fetch failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const handleRetry = () => {
    fetchAnalytics(true);
  };

  if (loading) {
    return (
      <Box>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: { xs: 'flex-start', md: 'center' },
          flexDirection: { xs: 'column', md: 'row' },
          gap: { xs: 2, md: 0 },
          mb: 4 
        }}>
          <Box>
            <Typography variant="h3" fontWeight="bold" color="primary" gutterBottom>
              🎬 MovieMetrics Dashboard
            </Typography>
            <Typography variant="subtitle1" color="textSecondary">
              Business Intelligence Platform • Loading analytics...
            </Typography>
            {retryCount > 0 && (
              <Chip 
                label={`Retry attempt ${retryCount}`} 
                size="small" 
                color="warning" 
                variant="outlined"
                sx={{ mt: 1 }}
              />
            )}
          </Box>
          
          <Button variant="outlined" disabled startIcon={<FileDownload />}>
            Export Reports
          </Button>
        </Box>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          {[1, 2, 3, 4].map((item) => (
            <Grid item xs={12} sm={6} md={6} lg={3} key={item}>
              <KPICardSkeleton />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Typography variant="h3" fontWeight="bold" color="primary" gutterBottom>
          🎬 MovieMetrics Dashboard
        </Typography>
        <ErrorDisplay error={error} onRetry={handleRetry} />
      </Box>
    );
  }

  const formatCurrency = (amount) => {
    if (amount >= 1e9) return `$${(amount / 1e9).toFixed(1)}B`;
    if (amount >= 1e6) return `$${(amount / 1e6).toFixed(1)}M`;
    if (amount >= 1e3) return `$${(amount / 1e3).toFixed(1)}K`;
    return `$${amount}`;
  };

  const formatPercentage = (value) => `${value?.toFixed(1)}%`;

  return (
    <Box>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: { xs: 'flex-start', md: 'center' },
        flexDirection: { xs: 'column', md: 'row' },
        gap: { xs: 2, md: 0 },
        mb: 4 
      }}>
        <Box>
          <Typography variant="h3" fontWeight="bold" color="primary" gutterBottom>
            🎬 MovieMetrics Dashboard
          </Typography>
          <Typography variant="subtitle1" color="textSecondary">
            Business Intelligence Platform • Real-time Analytics
          </Typography>
          {analytics && (
            <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Chip 
                label={`${analytics?.overview?.total_movies || 0} Movies`} 
                size="small" 
                color="primary" 
                variant="outlined"
              />
              <Chip 
                label={`${(analytics?.overview?.completion_rate || 0).toFixed(1)}% Data Complete`} 
                size="small" 
                color={analytics?.overview?.completion_rate > 80 ? "success" : "warning"}
                variant="outlined"
              />
              <Chip 
                label={`${(analytics?.financial_summary?.overall_roi || 0).toFixed(1)}% Avg ROI`} 
                size="small" 
                color={analytics?.financial_summary?.overall_roi > 0 ? "success" : "error"}
                variant="outlined"
              />
              {retryCount > 0 && (
                <Chip 
                  label="Recently refreshed" 
                  size="small" 
                  color="info" 
                  variant="outlined"
                />
              )}
            </Box>
          )}
        </Box>
        
        {/* Export Toolbar */}
        <ExportToolbar analytics={analytics} loading={loading} />
      </Box>
      
      {/* KPI Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={6} lg={3}>
          <KPICard
            title="Total Revenue"
            value={formatCurrency(analytics?.financial_summary?.total_revenue || 0)}
            icon={<AttachMoney />}
            color="#4caf50"
            subtitle="Box office performance"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={6} lg={3}>
          <KPICard
            title="Overall ROI"
            value={formatPercentage(analytics?.financial_summary?.overall_roi)}
            icon={<TrendingUp />}
            color="#2196f3"
            subtitle="Return on investment"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={6} lg={3}>
          <KPICard
            title="Total Movies"
            value={analytics?.overview?.total_movies || 0}
            icon={<Movie />}
            color="#ff9800"
            subtitle={`${analytics?.overview?.completion_rate?.toFixed(1)}% data complete`}
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={6} lg={3}>
          <KPICard
            title="Success Rate"
            value={formatPercentage(
              analytics?.overview?.total_movies > 0 
                ? (analytics?.profitability?.profitable_movies / analytics?.overview?.total_movies) * 100 
                : 0
            )}
            icon={<Assessment />}
            color="#9c27b0"
            subtitle="Profitable movies"
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default ExecutiveSummary;