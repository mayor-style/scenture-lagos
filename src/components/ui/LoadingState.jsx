import React from 'react';
import { Loader2 } from 'lucide-react';

/**
 * LoadingState component for displaying loading indicators
 * @param {Object} props - Component props
 * @param {string} [props.size='md'] - Size of the loading indicator (sm, md, lg)
 * @param {string} [props.text='Loading...'] - Text to display
 * @param {boolean} [props.fullPage=false] - Whether to display as a full page overlay
 * @param {string} [props.className] - Additional CSS classes
 */
export const LoadingState = ({ 
  size = 'md', 
  text = 'Loading...', 
  fullPage = false,
  className = ''
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-10 h-10'
  };

  const loaderSize = sizeClasses[size] || sizeClasses.md;

  return (
    <div
      className={`flex flex-col items-center justify-center p-6 ${
        fullPage
          ? 'fixed inset-0 bg-gradient-to-br from-white/90 to-slate-50/80 dark:from-black/90 dark:to-slate-900/80 backdrop-blur-md z-50'
          : `relative ${className}`
      }`}
      role="status"
      aria-live="polite"
    >
      <div className="relative">
        <Loader2
          className={`${loaderSize} text-primary animate-spin`}
          style={{ animationDuration: '0.8s' }} // Smoother animation
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent rounded-full blur-lg animate-pulse"></div>
      </div>
      {text && (
        <p className="mt-3 text-sm font-heading font-light text-secondary tracking-wide">
          {text}
        </p>
      )}
    </div>
  );
};


/**
 * LoadingOverlay component for displaying a loading overlay on a container
 * @param {Object} props - Component props
 * @param {boolean} props.loading - Whether to show the loading overlay
 * @param {React.ReactNode} props.children - Child components
 * @param {string} [props.text='Loading...'] - Text to display
 */
export const LoadingOverlay = ({ loading, children, text = 'Loading...' }) => {
  return (
    <div className="relative">
      {children}
      {loading && (
        <div
          className="absolute inset-0 bg-gradient-to-br from-white/70 to-slate-50/50 dark:from-black/70 dark:to-slate-900/50 backdrop-blur-sm flex items-center justify-center rounded-xl z-10 transition-opacity duration-300"
          aria-hidden={!loading}
        >
          <LoadingState text={text} />
        </div>
      )}
    </div>
  );
};

/**
 * LoadingButton component for displaying a loading state in a button
 * @param {Object} props - Component props
 * @param {boolean} props.loading - Whether to show the loading state
 * @param {string} [props.loadingText='Loading...'] - Text to display when loading
 * @param {React.ReactNode} props.children - Child components
 * @param {Function} props.onClick - Click handler
 * @param {string} [props.className] - Additional CSS classes
 * @param {boolean} [props.disabled] - Whether the button is disabled
 * @param {string} [props.type='button'] - Button type
 */
export const LoadingButton = ({ 
  loading, 
  loadingText = 'Loading...', 
  children, 
  onClick, 
  className = '', 
  disabled = false,
  type = 'button',
  ...rest
}) => {
  return (
    <button
      type={type}
      className={`relative inline-flex items-center justify-center px-6 py-3 rounded-xl font-heading font-medium text-white transition-all duration-300 ${
        loading || disabled
          ? 'bg-gradient-to-r from-primary/50 to-primary/30 cursor-not-allowed shadow-none'
          : 'bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 shadow-lg hover:shadow-xl shadow-primary/20'
      } ${className}`}
      onClick={onClick}
      disabled={disabled || loading}
      aria-disabled={disabled || loading}
      aria-label={loading ? loadingText : undefined}
      {...rest}
    >
      {loading ? (
        <span className="flex items-center justify-center">
          <Loader2 className="w-4 h-4 mr-2 animate-spin" style={{ animationDuration: '0.8s' }} />
          <span className="text-sm tracking-wide">{loadingText}</span>
        </span>
      ) : (
        children
      )}
    </button>
  );
};

/**
 * EmptyState component for displaying when no data is available
 * @param {Object} props - Component props
 * @param {string} props.title - Title text
 * @param {string} [props.description] - Description text
 * @param {React.ReactNode} [props.icon] - Icon to display
 * @param {React.ReactNode} [props.action] - Action button or link
 * @param {string} [props.className] - Additional CSS classes
 */
export const EmptyState = ({ 
  title, 
  description, 
  icon, 
  action,
  className = ''
}) => {
  return (
    <div className={`flex flex-col items-center justify-center p-8 text-center ${className}`}>
      {icon && (
        <div className="relative mb-4">
          <div className="relative z-10 text-secondary/50 transition-transform duration-500 group-hover:scale-110 group-hover:text-secondary">
            {icon}
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent rounded-full blur-lg animate-pulse opacity-50 group-hover:opacity-75 transition-opacity duration-300"></div>
        </div>
      )}
      <h3 className="text-lg font-heading font-medium text-secondary mb-2 tracking-wide">{title}</h3>
      {description && (
        <p className="text-sm font-light text-secondary/70 mb-4 max-w-md leading-relaxed">
          {description}
        </p>
      )}
      {action && (
        <div className="mt-2">
          {React.cloneElement(action, {
            className: `bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 text-white px-6 py-2 rounded-xl font-heading font-medium text-sm tracking-wide shadow-lg hover:shadow-xl transition-all duration-200 ${action.props.className || ''}`
          })}
        </div>
      )}
    </div>
  );
};

