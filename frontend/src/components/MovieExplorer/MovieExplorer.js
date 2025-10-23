// frontend/src/components/MovieExplorer/MovieExplorer.js
import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TableSortLabel,
  Chip,
  IconButton,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Paper,
  FormControlLabel, 
  Switch,
  Skeleton,
  useMediaQuery, 
  useTheme,
  Button,
  Alert,                            
  AlertTitle,                    
  CircularProgress                               
} from '@mui/material';
import {
  Search,
  Visibility,
  TrendingUp,
  TrendingDown,
  Remove,
  FileDownload,
  Refresh,                     
  ErrorOutline,                 
  Warning,                     
  CloudOff                     
} from '@mui/icons-material';
import movieAPI from '../../services/api';
import MovieDetailModal from './MovieDetailModal'; 
import { TableLoadingSkeleton } from '../Common/LoadingStates';
import { exportMovieDataToCSV } from '../../utils/exportUtils';
import { useErrorHandler } from '../../hooks/useErrorHandler';        // 🔧 ADD
import { useToast } from '../Common/ToastProvider';  

// Error display component
const ExplorerErrorDisplay = ({ error, onRetry, hasPartialData, dataCount }) => (
  <Box sx={{ mt: 4 }}>
    <Typography variant="h4" gutterBottom fontWeight="bold" color="primary">
      🎬 Movie Database Explorer
    </Typography>
    
    <Alert 
      severity={hasPartialData ? "warning" : "error"} 
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
      <AlertTitle>
        {hasPartialData ? "Partial Data Available" : "Database Connection Failed"}
      </AlertTitle>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {hasPartialData ? <Warning fontSize="small" /> : <CloudOff fontSize="small" />}
        <Typography variant="body2">
          {hasPartialData 
            ? `Showing ${dataCount} movies. Some data may be incomplete or outdated.`
            : (error || 'Unable to load movie database. Please check your connection and try again.')
          }
        </Typography>
      </Box>
    </Alert>

    {hasPartialData ? null : (
      <Card>
        <CardContent sx={{ textAlign: 'center', py: 6 }}>
          <ErrorOutline sx={{ fontSize: 64, color: 'error.main', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            Movie Database Unavailable
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
            We're having trouble connecting to the movie database. This could be due to:
          </Typography>
          <Box sx={{ textAlign: 'left', maxWidth: 400, mx: 'auto', mb: 3 }}>
            <Typography variant="body2" color="textSecondary" component="li">
              • Network connectivity issues
            </Typography>
            <Typography variant="body2" color="textSecondary" component="li">
              • Server maintenance in progress
            </Typography>
            <Typography variant="body2" color="textSecondary" component="li">
              • Database synchronization delay
            </Typography>
          </Box>
          <Button 
            variant="contained" 
            startIcon={<Refresh />}
            onClick={onRetry}
          >
            Retry Database Connection
          </Button>
        </CardContent>
      </Card>
    )}
  </Box>
);

const MovieExplorer = () => {
  const [movies, setMovies] = useState([]);
  const [totalMovies, setTotalMovies] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);                    // 🔧 ADD
  const [retryCount, setRetryCount] = useState(0);             // 🔧 ADD
  const [exportLoading, setExportLoading] = useState(false);   // 🔧 ADD
  const [searchTerm, setSearchTerm] = useState('');
  const [performanceFilter, setPerformanceFilter] = useState('All');
  const [budgetFilter, setBudgetFilter] = useState('All');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [orderBy, setOrderBy] = useState('revenue');
  const [order, setOrder] = useState('desc');
  const [showIncompleteData, setShowIncompleteData] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const { handleError, handleSuccess, handleWarning } = useErrorHandler(); // 🔧 ADD

  // Fetch movies with comprehensive error handling
  const fetchMovies = async (isRetry = false) => {
    try {
      if (isRetry) {
        setRetryCount(prev => prev + 1);
        handleSuccess('Reconnecting to movie database...', { duration: 2000 });
      }

      setLoading(true);
      setError(null);
      
      const response = await movieAPI.getMovies();
      const allMovies = response.data.results || response.data;
      
      // Data validation
      if (!allMovies || allMovies.length === 0) {
        throw new Error('No movie data available in the database');
      }

      setTotalMovies(allMovies.length);

      if (showIncompleteData) {
        setMovies(allMovies);
        console.log(`MovieExplorer: Loaded ${allMovies.length} movies (including incomplete data)`);
      } else {
        const completeMovies = allMovies.filter(movie => 
          movie.revenue && 
          movie.budget && 
          movie.performance_rating &&
          movie.performance_rating !== 'Unknown'
        );
        
        setMovies(completeMovies);
        console.log(`MovieExplorer: Loaded ${completeMovies.length} complete movies out of ${allMovies.length} total`);
        
        // Data quality warnings
        if (completeMovies.length === 0) {
          handleWarning('No movies with complete financial data found. Try enabling "Show incomplete data" to see partial records.');
        } else if (completeMovies.length < allMovies.length * 0.5) {
          handleWarning(`Only ${completeMovies.length} of ${allMovies.length} movies have complete data. Consider enabling incomplete data for full view.`, { duration: 6000 });
        }
      }
      
      if (isRetry) {
        handleSuccess(`Successfully loaded ${allMovies.length} movies from database!`);
      }

    } catch (error) {
      const errorMessage = error.message || 'Failed to fetch movie database';
      setError(errorMessage);
      handleError(error, 'Movie database fetch failed');
    } finally {
      setLoading(false);
    }
  };

  // Enhanced export with error handling
  const handleExport = async () => {
    try {
      setExportLoading(true);
      
      if (filteredAndSortedMovies.length === 0) {
        handleWarning('No movies match your current filters. Please adjust your search criteria.');
        return;
      }

      await exportMovieDataToCSV(filteredAndSortedMovies);
      handleSuccess(`Successfully exported ${filteredAndSortedMovies.length} movies to CSV!`);
      
    } catch (error) {
      handleError(error, 'Failed to export movie data');
    } finally {
      setExportLoading(false);
    }
  };

  // Retry handler
  const handleRetry = () => {
    fetchMovies(true);
  };

  // Effect with error handling
  useEffect(() => {
    fetchMovies();
  }, [showIncompleteData]);

  // Get performance color
  const getPerformanceColor = (rating) => {
    switch (rating) {
      case 'Excellent': return 'success';
      case 'Good': return 'primary';
      case 'Break Even': return 'warning';
      case 'Loss': return 'error';
      case 'Poor': return 'secondary';
      default: return 'default';
    }
  };

  // Get ROI trend icon
  const getROIIcon = (roi) => {
    if (roi > 50) return <TrendingUp color="success" />;
    if (roi < 0) return <TrendingDown color="error" />;
    return <Remove color="warning" />;
  };

  // Format currency
  const formatCurrency = (amount) => {
    return `$${(amount / 1000000).toFixed(1)}M`;
  };

  // Filtering and sorting logic
  const filteredAndSortedMovies = useMemo(() => {
    let filtered = movies.filter(movie => {
      const matchesSearch = movie.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (movie.studio_name && movie.studio_name.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesPerformance = performanceFilter === 'All' || 
                                movie.performance_rating === performanceFilter;
      
      const matchesBudget = budgetFilter === 'All' || 
                           movie.budget_category === budgetFilter;
      
      return matchesSearch && matchesPerformance && matchesBudget;
    });

    // Sorting with error handling
    filtered.sort((a, b) => {
      let aValue = a[orderBy];
      let bValue = b[orderBy];
      
      // Handle undefined/null values
      if (aValue === undefined || aValue === null) aValue = 0;
      if (bValue === undefined || bValue === null) bValue = 0;
      
      // Handle numeric values
      if (typeof aValue === 'string' && !isNaN(parseFloat(aValue))) {
        aValue = parseFloat(aValue);
        bValue = parseFloat(bValue);
      }
      
      if (order === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  }, [movies, searchTerm, performanceFilter, budgetFilter, orderBy, order]);

  // Pagination
  const paginatedMovies = filteredAndSortedMovies.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // Handle sorting
  const handleSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  // Loading state with retry indicators
  if (loading) {
    return (
      <Box sx={{ mt: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box>
            <Typography variant="h4" gutterBottom fontWeight="bold" color="primary">
              🎬 Movie Database Explorer
            </Typography>
            <Typography variant="subtitle1" color="textSecondary">
              {retryCount > 0 ? `Retrying database connection... (Attempt ${retryCount})` : 'Loading movie database...'}
            </Typography>
          </Box>
          {retryCount > 0 && (
            <Chip 
              label={`Retry ${retryCount}`} 
              size="small" 
              color="warning" 
              variant="outlined"
            />
          )}
        </Box>

        {/* Loading Filters */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Skeleton variant="rectangular" height={56} />
              </Grid>
              <Grid item xs={12} md={4}>
                <Skeleton variant="rectangular" height={56} />
              </Grid>
              <Grid item xs={12} md={4}>
                <Skeleton variant="rectangular" height={56} />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Loading Table */}
        <Card>
          <CardContent>
            <TableLoadingSkeleton rows={8} />
          </CardContent>
        </Card>
      </Box>
    );
  }

  // Error state
  if (error && movies.length === 0) {
    return (
      <ExplorerErrorDisplay 
        error={error} 
        onRetry={handleRetry} 
        hasPartialData={false}
      />
    );
  }

  return (
    <Box sx={{ mt: 4 }}>
      {/* Header with data quality indicators */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, flexDirection: { xs: 'column', sm: 'row' }, gap: { xs: 2, sm: 0 }, mb: 4 }}>
        <Box>
          <Typography variant="h4" gutterBottom fontWeight="bold" color="primary">
            🎬 Movie Database Explorer
          </Typography>
          <Typography variant="subtitle1" color="textSecondary">
            Search, filter, and analyze individual movie performance • {filteredAndSortedMovies.length} movies found
          </Typography>
          {/* Data quality indicators */}
          <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Chip 
              label={`${totalMovies} Total Movies`} 
              size="small" 
              color="primary" 
              variant="outlined"
            />
            <Chip 
              label={`${movies.length} Complete Records`} 
              size="small" 
              color={movies.length / totalMovies > 0.8 ? "success" : "warning"} 
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
        </Box>
      </Box>

      {/* Partial data warning */}
      {error && movies.length > 0 && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <AlertTitle>Partial Data Available</AlertTitle>
          Some database records could not be loaded. Showing {movies.length} available movies.
        </Alert>
      )}

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Search movies or studios..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                size={isMobile ? "small" : "medium"}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth size={isMobile ? "small" : "medium"}>
                <InputLabel>Performance Rating</InputLabel>
                <Select
                  value={performanceFilter}
                  label="Performance Rating"
                  onChange={(e) => setPerformanceFilter(e.target.value)}
                >
                  <MenuItem value="All">All Performances</MenuItem>
                  <MenuItem value="Excellent">Excellent (&gt;200% ROI)</MenuItem>
                  <MenuItem value="Good">Good (50-200% ROI)</MenuItem>
                  <MenuItem value="Break Even">Break Even (-10-50% ROI)</MenuItem>
                  <MenuItem value="Loss">Loss (below -10% ROI)</MenuItem>
                  <MenuItem value="Poor">Poor (-50 to -10% ROI)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth size={isMobile ? "small" : "medium"}>
                <InputLabel>Budget Category</InputLabel>
                <Select
                  value={budgetFilter}
                  label="Budget Category"
                  onChange={(e) => setBudgetFilter(e.target.value)}
                >
                  <MenuItem value="All">All Budgets</MenuItem>
                  <MenuItem value="Blockbuster">Blockbuster (&gt;$200M)</MenuItem>
                  <MenuItem value="High Budget">High Budget ($100-200M)</MenuItem>
                  <MenuItem value="Mid Budget">Mid Budget ($50-100M)</MenuItem>
                  <MenuItem value="Low Budget">Low Budget ($10-50M)</MenuItem>
                  <MenuItem value="Micro Budget">Micro Budget (&lt;$10M)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={showIncompleteData}
                    onChange={(e) => setShowIncompleteData(e.target.checked)}
                    color="primary"
                    size={isMobile ? "small" : "medium"}
                  />
                }
                label={
                  <Typography variant={isMobile ? "body2" : "body1"}>
                    Show incomplete data ({movies.length} of {totalMovies} movies)
                  </Typography>
                }
                sx={{ ml: 1 }}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Export section */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" color="primary">
          📊 Movies ({paginatedMovies.length} of {filteredAndSortedMovies.length})
        </Typography>
        
        <Button
          variant="outlined"
          size="small"
          startIcon={exportLoading ? <CircularProgress size={16} /> : <FileDownload />}
          onClick={handleExport}
          disabled={filteredAndSortedMovies.length === 0 || exportLoading}
        >
          {exportLoading ? 'Exporting...' : `Export ${filteredAndSortedMovies.length} Results`}
        </Button>
      </Box>

      {/* Results Table */}
      <Card>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'title'}
                    direction={orderBy === 'title' ? order : 'asc'}
                    onClick={() => handleSort('title')}
                  >
                    Movie Title
                  </TableSortLabel>
                </TableCell>
                {!isMobile && (
                  <TableCell>
                    <TableSortLabel
                      active={orderBy === 'budget'}
                      direction={orderBy === 'budget' ? order : 'asc'}
                      onClick={() => handleSort('budget')}
                    >
                      Budget
                    </TableSortLabel>
                  </TableCell>
                )}
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'revenue'}
                    direction={orderBy === 'revenue' ? order : 'asc'}
                    onClick={() => handleSort('revenue')}
                  >
                    Revenue
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'roi'}
                    direction={orderBy === 'roi' ? order : 'asc'}
                    onClick={() => handleSort('roi')}
                  >
                    ROI
                  </TableSortLabel>
                </TableCell>
                <TableCell>Performance</TableCell>
                {!isSmallScreen && (
                  <TableCell>Studio</TableCell>
                )}
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedMovies.map((movie) => (
                <TableRow key={movie.id} hover>
                  <TableCell>
                    <Typography variant="subtitle2" fontWeight="bold">
                      {movie.title || 'Unknown Title'}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {movie.release_date || 'N/A'}
                    </Typography>

                    {isMobile && (
                      <>
                        <Typography variant="caption" display="block" color="textSecondary">
                          {movie.studio_name || 'Unknown Studio'}
                        </Typography>
                        <Typography variant="caption" display="block" color="primary">
                          Budget: {movie.budget ? formatCurrency(movie.budget) : 'N/A'}
                        </Typography>
                      </>
                    )}
                  </TableCell>
                  {!isMobile && (
                    <TableCell>
                      {movie.budget ? formatCurrency(movie.budget) : 'N/A'}
                    </TableCell>
                  )}
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold">
                      {movie.revenue ? formatCurrency(movie.revenue) : 'N/A'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      {getROIIcon(parseFloat(movie.roi || 0))}
                      <Typography
                        variant="body2"
                        color={parseFloat(movie.roi || 0) > 50 ? 'success.main' : 
                              parseFloat(movie.roi || 0) < 0 ? 'error.main' : 'warning.main'}
                        fontWeight="bold"
                      >
                        {movie.roi && !isNaN(parseFloat(movie.roi)) ? 
                          `${parseFloat(movie.roi).toFixed(1)}%` : 'N/A'}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={movie.performance_rating || 'Unknown'} 
                      color={getPerformanceColor(movie.performance_rating)}
                      size="small"
                    />
                  </TableCell>
                  {!isSmallScreen && (
                    <TableCell>
                      <Typography variant="body2">
                        {movie.studio_name || 'Unknown'}
                      </Typography>
                    </TableCell>
                  )}
                  <TableCell>
                    <IconButton 
                      size="small" 
                      color="primary"
                      onClick={() => {
                        setSelectedMovie(movie);
                        setModalOpen(true);
                      }}
                    >
                      <Visibility />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={filteredAndSortedMovies.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(event, newPage) => setPage(newPage)}
          onRowsPerPageChange={(event) => {
            setRowsPerPage(parseInt(event.target.value, 10));
            setPage(0);
          }}
        />
      </Card>

      {/* Detail Modal */}
      <MovieDetailModal
        movie={selectedMovie}
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedMovie(null);
        }}
      />
    </Box>
  );
};

export default MovieExplorer;