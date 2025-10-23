import React from 'react';
import { 
  Alert, 
  AlertTitle, 
  Button, 
  Box, 
  Typography, 
  Card,
  CardContent,
  Stack
} from '@mui/material';
import { 
  Refresh, 
  BugReport, 
  Home,
  ErrorOutline 
} from '@mui/icons-material';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      errorId: null
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { 
      hasError: true,
      errorId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details
    console.error('MovieMetrics Error Boundary Caught:', error, errorInfo);
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // In production, you'd send this to your error reporting service
    // Example: Sentry, LogRocket, etc.
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null,
      errorId: null 
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <Box 
          sx={{ 
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'grey.50',
            p: 3
          }}
        >
          <Card sx={{ maxWidth: 600, width: '100%' }}>
            <CardContent sx={{ textAlign: 'center', p: 4 }}>
              {/* Error Icon */}
              <ErrorOutline 
                sx={{ 
                  fontSize: 80, 
                  color: 'error.main', 
                  mb: 3 
                }} 
              />
              
              {/* Main Error Message */}
              <Typography variant="h4" gutterBottom color="error.main" fontWeight="bold">
                Oops! Something went wrong
              </Typography>
              
              <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
                We encountered an unexpected error in MovieMetrics
              </Typography>

              <Alert severity="error" sx={{ mb: 3, textAlign: 'left' }}>
                <AlertTitle>Error Details</AlertTitle>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Error ID:</strong> {this.state.errorId}
                </Typography>
                <Typography variant="body2" component="div">
                  <strong>What happened:</strong> {this.state.error?.message || 'Unknown error occurred'}
                </Typography>
              </Alert>

              {/* Action Buttons */}
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
                <Button 
                  variant="contained" 
                  startIcon={<Refresh />}
                  onClick={this.handleReload}
                  size="large"
                >
                  Reload Application
                </Button>
                
                <Button 
                  variant="outlined" 
                  startIcon={<Home />}
                  onClick={this.handleReset}
                  size="large"
                >
                  Try Again
                </Button>
              </Stack>

              {/* Help Information */}
              <Box sx={{ mt: 4, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  <BugReport sx={{ fontSize: 16, mr: 1, verticalAlign: 'middle' }} />
                  <strong>Don't worry!</strong> Your data is safe. This is likely a temporary issue.
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  If this problem persists, please contact support with Error ID: {this.state.errorId}
                </Typography>
              </Box>

              {/* Development Error Details (only in development) */}
              {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
                <Box sx={{ mt: 3, textAlign: 'left' }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Development Error Stack:
                  </Typography>
                  <Box 
                    component="pre" 
                    sx={{ 
                      fontSize: '0.75rem',
                      bgcolor: 'grey.900',
                      color: 'grey.100',
                      p: 2,
                      borderRadius: 1,
                      overflow: 'auto',
                      maxHeight: 200
                    }}
                  >
                    {this.state.errorInfo.componentStack}
                  </Box>
                </Box>
              )}
            </CardContent>
          </Card>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;