import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

/**
 * ErrorState component for displaying error messages
 * @param {Object} props - Component props
 * @param {string} [props.title='An error occurred'] - Error title
 * @param {string} [props.message='Something went wrong. Please try again.'] - Error message
 * @param {Function} [props.onRetry] - Retry function
 * @param {string} [props.className] - Additional CSS classes
 */
const ErrorState = ({ 
  title = 'An error occurred', 
  message = 'Something went wrong. Please try again.', 
  onRetry,
  className = ''
}) => {
  return (
    <div className={`flex flex-col items-center justify-center p-6 text-center ${className}`}>
      <AlertTriangle className="w-10 h-10 text-red-500 mb-4" />
      <h3 className="text-lg font-medium text-secondary mb-2">{title}</h3>
      <p className="text-sm text-secondary/70 mb-4 max-w-md">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary/90 transition-colors"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Try Again
        </button>
      )}
    </div>
  );
};

/**
 * ApiError component for displaying API error messages
 * @param {Object} props - Component props
 * @param {Error} props.error - Error object
 * @param {Function} [props.onRetry] - Retry function
 * @param {string} [props.className] - Additional CSS classes
 */
export const ApiError = ({ error, onRetry, className = '' }) => {
  // Handle different types of errors
  let title = 'An error occurred';
  let message = 'Something went wrong. Please try again.';

  if (error) {
    // Handle Axios errors
    if (error.response) {
      // Server responded with an error status
      const status = error.response.status;
      
      if (status === 401) {
        title = 'Authentication Required';
        message = 'You need to log in to access this resource.';
      } else if (status === 403) {
        title = 'Access Denied';
        message = 'You do not have permission to access this resource.';
      } else if (status === 404) {
        title = 'Not Found';
        message = 'The requested resource could not be found.';
      } else if (status >= 500) {
        title = 'Server Error';
        message = 'There was a problem with the server. Please try again later.';
      } else {
        // Get error message from response if available
        message = error.response.data?.message || message;
      }
    } else if (error.request) {
      // Request was made but no response received
      title = 'Network Error';
      message = 'Unable to connect to the server. Please check your internet connection.';
    } else {
      // Error in setting up the request
      message = error.message || message;
    }
  }

  return <ErrorState title={title} message={message} onRetry={onRetry} className={className} />;
};

/**
 * FormError component for displaying form validation errors
 * @param {Object} props - Component props
 * @param {string|string[]} props.errors - Error message or array of error messages
 * @param {string} [props.className] - Additional CSS classes
 */
export const FormError = ({ errors, className = '' }) => {
  if (!errors || (Array.isArray(errors) && errors.length === 0)) {
    return null;
  }

  const errorMessages = Array.isArray(errors) ? errors : [errors];

  return (
    <div className={`bg-red-50 border border-red-200 rounded-md p-3 mt-2 ${className}`}>
      {errorMessages.length === 1 ? (
        <p className="text-sm text-red-600">{errorMessages[0]}</p>
      ) : (
        <ul className="list-disc list-inside text-sm text-red-600">
          {errorMessages.map((error, index) => (
            <li key={index}>{error}</li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ErrorState;