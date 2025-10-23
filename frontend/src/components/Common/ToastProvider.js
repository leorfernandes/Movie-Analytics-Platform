import React, { createContext, useContext, useState, useCallback } from 'react';
import { 
  Snackbar, 
  Alert, 
  AlertTitle,
  IconButton,
  Box,
  Typography 
} from '@mui/material';
import { 
  Close,
  CheckCircle,
  Error,
  Warning,
  Info
} from '@mui/icons-material';

const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, options = {}) => {
    const toast = {
      id: Date.now() + Math.random(),
      message,
      severity: options.severity || 'info',
      duration: options.duration || 4000,
      action: options.action,
      title: options.title,
      ...options
    };

    setToasts(prev => [...prev, toast]);

    // Auto remove toast after duration
    if (toast.duration !== null) {
      setTimeout(() => {
        removeToast(toast.id);
      }, toast.duration);
    }

    return toast.id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const showSuccess = useCallback((message, options = {}) => {
    return addToast(message, { ...options, severity: 'success' });
  }, [addToast]);

  const showError = useCallback((message, options = {}) => {
    return addToast(message, { 
      ...options, 
      severity: 'error',
      duration: options.duration || 6000 // Errors stay longer
    });
  }, [addToast]);

  const showWarning = useCallback((message, options = {}) => {
    return addToast(message, { ...options, severity: 'warning' });
  }, [addToast]);

  const showInfo = useCallback((message, options = {}) => {
    return addToast(message, { ...options, severity: 'info' });
  }, [addToast]);

  const contextValue = {
    showSuccess,
    showError,
    showWarning,
    showInfo,
    addToast,
    removeToast
  };

  const getIcon = (severity) => {
    switch (severity) {
      case 'success': return <CheckCircle fontSize="inherit" />;
      case 'error': return <Error fontSize="inherit" />;
      case 'warning': return <Warning fontSize="inherit" />;
      case 'info': return <Info fontSize="inherit" />;
      default: return null;
    }
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      
      {/* Toast Container */}
      <Box sx={{ position: 'fixed', top: 24, right: 24, zIndex: 9999 }}>
        {toasts.map((toast) => (
          <Snackbar
            key={toast.id}
            open={true}
            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            sx={{ 
              position: 'relative',
              mb: 1,
              '& .MuiSnackbar-root': {
                position: 'static',
                transform: 'none'
              }
            }}
          >
            <Alert
              severity={toast.severity}
              icon={getIcon(toast.severity)}
              action={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {toast.action && toast.action}
                  <IconButton
                    size="small"
                    aria-label="close"
                    color="inherit"
                    onClick={() => removeToast(toast.id)}
                  >
                    <Close fontSize="small" />
                  </IconButton>
                </Box>
              }
              sx={{ 
                width: '100%',
                minWidth: 300,
                maxWidth: 500
              }}
            >
              {toast.title && <AlertTitle>{toast.title}</AlertTitle>}
              <Typography variant="body2">
                {toast.message}
              </Typography>
            </Alert>
          </Snackbar>
        ))}
      </Box>
    </ToastContext.Provider>
  );
};

export default ToastProvider;