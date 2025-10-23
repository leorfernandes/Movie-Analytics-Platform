import { useCallback } from 'react';
import { useToast } from '../components/Common/ToastProvider';

export const useErrorHandler = () => {
  const { showError, showWarning, showSuccess } = useToast();

  const handleError = useCallback((error, context = '') => {
    console.error(`MovieMetrics Error ${context}:`, error);

    let message = 'An unexpected error occurred';
    let title = 'Error';

    // Handle different error types
    if (error?.response) {
      // API Error Response
      const status = error.response.status;
      const data = error.response.data;
      
      switch (status) {
        case 400:
          title = 'Invalid Request';
          message = data?.message || 'The request was invalid. Please check your input.';
          break;
        case 401:
          title = 'Authentication Required';
          message = 'Please log in to access this feature.';
          break;
        case 403:
          title = 'Access Denied';
          message = 'You don\'t have permission to access this resource.';
          break;
        case 404:
          title = 'Not Found';
          message = 'The requested data could not be found.';
          break;
        case 429:
          title = 'Rate Limited';
          message = 'Too many requests. Please wait a moment and try again.';
          showWarning(message, { title, duration: 6000 });
          return;
        case 500:
          title = 'Server Error';
          message = 'Our servers are experiencing issues. Please try again later.';
          break;
        case 503:
          title = 'Service Unavailable';
          message = 'The service is temporarily unavailable. Please try again later.';
          break;
        default:
          title = 'Network Error';
          message = data?.message || `Request failed with status ${status}`;
      }
    } else if (error?.request) {
      // Network Error
      title = 'Connection Error';
      message = 'Unable to connect to MovieMetrics servers. Please check your internet connection.';
    } else if (error?.message) {
      // JavaScript Error
      title = 'Application Error';
      message = error.message;
    }

    // Add context if provided
    if (context) {
      message = `${context}: ${message}`;
    }

    showError(message, { 
      title,
      duration: 6000 
    });
  }, [showError, showWarning]);

  const handleSuccess = useCallback((message, options = {}) => {
    showSuccess(message, {
      title: 'Success',
      duration: 3000,
      ...options
    });
  }, [showSuccess]);

  const handleWarning = useCallback((message, options = {}) => {
    showWarning(message, {
      title: 'Warning',
      duration: 4000,
      ...options
    });
  }, [showWarning]);

  return {
    handleError,
    handleSuccess,
    handleWarning
  };
};

export default useErrorHandler;