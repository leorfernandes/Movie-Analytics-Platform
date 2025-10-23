import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Card,
  CardContent,
  Typography,
  Chip,
  Box,
  Divider,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { TrendingUp, TrendingDown, Remove, AttachMoney } from '@mui/icons-material';

const MovieDetailModal = ({ movie, open, onClose }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  if (!movie) return null;

  const formatCurrency = (amount) => `$${(amount / 1000000).toFixed(1)}M`;
  
  const safeROI = parseFloat(movie.roi || 0);
  const isValidROI = !isNaN(safeROI);

  const getROIColor = (roi) => {
    const numROI = parseFloat(roi || 0);
    if (numROI > 100) return 'success';
    if (numROI > 0) return 'primary';
    return 'error';
  };

  const getROIIcon = (roi) => {
    const numROI = parseFloat(roi || 0);
    if (numROI > 50) return <TrendingUp color="success" />;
    if (numROI < 0) return <TrendingDown color="error" />;
    return <Remove color="warning" />;
  };


  const profit = movie.revenue - movie.budget;

  return (
    <Dialog 
        open={open} 
        onClose={onClose} 
        maxWidth="md" 
        fullWidth
        fullScreen={isMobile} 
        sx={{
            '& .MuiDialog-paper': {
            margin: isMobile ? 0 : 2, 
            maxHeight: isMobile ? '100vh' : '90vh' 
            }
        }}
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h5" fontWeight="bold">
            {movie.title}
          </Typography>
          <Chip 
            label={movie.performance_rating} 
            color={getROIColor(movie.roi)}
            icon={getROIIcon(movie.roi)}
          />
        </Box>
      </DialogTitle>
      
      <DialogContent sx={{ px: isMobile ? 2 : 3 }}> 
        <Grid container spacing={isMobile ? 2 : 3}>
          {/* Financial Overview */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom color="primary">
              📊 Financial Performance
            </Typography>
          </Grid>
          
          {/* Budget Card */}
          <Grid item xs={12} sm={4}>  
            <Card sx={{ backgroundColor: '#e3f2fd', height: '100%' }}>  
                <CardContent sx={{ textAlign: 'center' }}>
                <AttachMoney fontSize="large" color="primary" />
                <Typography variant={isMobile ? "h5" : "h4"} fontWeight="bold" color="primary"> 
                </Typography>
                <Typography variant="body2" color="textSecondary">
                    Production Budget
                </Typography>
                <Typography variant="caption" color="textSecondary">
                    {movie.budget_category || 'N/A'}
                </Typography>
                </CardContent>
            </Card>
            </Grid>

          {/* Revenue Card */}
          <Grid item xs={12} sm={4}> 
            <Card sx={{ backgroundColor: '#e8f5e8', height: '100%' }}>
                <CardContent sx={{ textAlign: 'center' }}>
                <TrendingUp fontSize="large" color="success" />
                <Typography variant={isMobile ? "h5" : "h4"} fontWeight="bold" color="success.main"> 
                    {formatCurrency(movie.revenue)}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                    Box Office Revenue
                </Typography>
                </CardContent>
            </Card>
            </Grid>

          {/* Profit Card */}
          <Grid item xs={12} sm={4}> 
            <Card sx={{ backgroundColor: profit > 0 ? '#e8f5e8' : '#ffebee', height: '100%' }}>
                <CardContent sx={{ textAlign: 'center' }}>
                {getROIIcon(movie.roi)}
                <Typography 
                    variant={isMobile ? "h5" : "h4"} 
                    fontWeight="bold" 
                    color={profit > 0 ? 'success.main' : 'error.main'}
                >
                    {formatCurrency(profit)}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                    Net Profit/Loss
                </Typography>
                <Typography variant="caption" color="textSecondary">
                    {isValidROI ? `${safeROI.toFixed(1)}% ROI` : 'ROI N/A'}
                </Typography>
                </CardContent>
            </Card>
            </Grid>

          <Grid item xs={12}>
            <Divider />
          </Grid>

          {/* Movie Details */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom color="primary">
              🎬 Movie Information
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="textSecondary">
                Studio
              </Typography>
              <Typography variant="body1" fontWeight="bold">
                {movie.studio_name || 'Unknown'}
              </Typography>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="textSecondary">
                Release Year
              </Typography>
              <Typography variant="body1">
                {movie.release_year || movie.release_date || 'N/A'}
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="textSecondary">
                Investment Risk Level
              </Typography>
              <Chip 
                label={safeROI > 100 ? 'Low Risk' : safeROI > 0 ? 'Medium Risk' : 'High Risk'}
                color={safeROI > 100 ? 'success' : safeROI > 0 ? 'warning' : 'error'}
                size="small"
              />
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="textSecondary">
                Performance Rating
              </Typography>
              <Typography variant="body1">
                {movie.performance_rating}
              </Typography>
            </Box>
          </Grid>

          {/* Investment Analysis */}
          <Grid item xs={12}>
            <Divider />
            <Typography variant="h6" gutterBottom color="primary" sx={{ mt: 2 }}>
              💡 Investment Analysis
            </Typography>
            <Card sx={{ backgroundColor: '#f5f5f5', p: 2 }}>
              <Typography variant="body2" color="textSecondary">
                <strong>Business Insight:</strong> {' '}
                {!isValidROI ? 
                  `This ${movie.budget_category?.toLowerCase() || 'budget'} movie requires further financial analysis to determine ROI performance.` :
                safeROI > 200 ? 
                  `Exceptional performer! This ${movie.budget_category?.toLowerCase() || 'budget'} investment generated ${safeROI.toFixed(1)}% ROI, making it a model for future investments.` :
                safeROI > 100 ?
                  `Strong performer with ${safeROI.toFixed(1)}% ROI. This ${movie.budget_category?.toLowerCase() || 'budget'} movie represents solid investment returns.` :
                safeROI > 0 ?
                  `Modest profit with ${safeROI.toFixed(1)}% ROI. Consider similar projects with caution and improved marketing strategies.` :
                  `Loss-making investment with ${safeROI.toFixed(1)}% ROI. Analyze failure factors before considering similar projects.`
                }
              </Typography>
            </Card>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: isMobile ? 2 : 3 }}>
        <Button onClick={onClose} variant="contained" color="primary" fullWidth={isMobile}>
          Close Analysis
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MovieDetailModal;