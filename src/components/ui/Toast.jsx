import React, { useState, useEffect } from 'react';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';

export const Toast = ({
  message,
  type = 'success', // 'success', 'error', 'warning', 'info'
  duration = 5000,
  onClose,
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      // Wait for fade out animation before calling onClose
      setTimeout(() => {
        onClose();
      }, 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getIcon = () => {
    const iconClass = "h-5 w-5 mr-3 flex-shrink-0"; // Added flex-shrink-0 to prevent icon from shrinking
    switch (type) {
      case 'success':
        return <CheckCircle className={`${iconClass} text-green-500`} />;
      case 'error':
        return <AlertCircle className={`${iconClass} text-red-500`} />;
      case 'warning':
        return <AlertTriangle className={`${iconClass} text-amber-500`} />;
      case 'info':
        return <Info className={`${iconClass} text-blue-500`} />;
      default:
        return <Info className={`${iconClass} text-blue-500`} />;
    }
  };

  const getToastClasses = () => {
    let baseClasses = 'border rounded-lg shadow-md px-4 py-3 relative overflow-hidden'; // Increased padding, added shadow, rounded-lg
    switch (type) {
      case 'success':
        return `${baseClasses} border-green-300 bg-green-50 text-green-800`; // Better text color
      case 'error':
        return `${baseClasses} border-red-300 bg-red-50 text-red-800`;
      case 'warning':
        return `${baseClasses} border-amber-300 bg-amber-50 text-amber-800`;
      case 'info':
        return `${baseClasses} border-blue-300 bg-blue-50 text-blue-800`;
      default:
        return `${baseClasses} border-blue-300 bg-blue-50 text-blue-800`;
    }
  };

  return (
    <div
      className={`
        transform transition-all duration-300 ease-in-out
        ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'}
        w-full
      `}
    >
      <div className={`flex items-start ${getToastClasses()}`}> {/* Used items-start for better multi-line message alignment */}
        <div className="flex items-center flex-grow"> {/* Flex-grow to take available space */}
          {getIcon()}
          <span className="text-sm font-medium leading-relaxed flex-grow">{message}</span> {/* leading-relaxed for better line height */}
        </div>
        <button
          onClick={() => {
            setIsVisible(false);
            setTimeout(() => {
              onClose();
            }, 300);
          }}
          className="ml-4 p-1 rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-300 transition-colors" // Added padding, rounded-full, hover effects for button
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

// ... (Toast component code above) ...

// Toast Container Component
export const ToastContainer = ({ toasts, removeToast, position = 'top-right' }) => {
  const getContainerClasses = () => {
    let classes = 'fixed z-50 flex flex-col space-y-3'; // Increased space-y
    let positioning = '';

    switch (position) {
      case 'top-right':
        positioning = 'top-4 right-4 items-end'; // Align items to end for right justification
        break;
      case 'top-left':
        positioning = 'top-4 left-4 items-start';
        break;
      case 'top-center':
        positioning = 'top-4 left-1/2 -translate-x-1/2 items-center'; // Center horizontally
        break;
      case 'bottom-right':
        positioning = 'bottom-4 right-4 items-end';
        break;
      case 'bottom-left':
        positioning = 'bottom-4 left-4 items-start';
        break;
      case 'bottom-center':
        positioning = 'bottom-4 left-1/2 -translate-x-1/2 items-center';
        break;
      default:
        positioning = 'top-4 right-4 items-end';
    }
    return `${classes} ${positioning} max-w-sm w-full`; // Max-width added for better mobile handling
  };

  return (
    <div className={getContainerClasses()}>
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
};

// Toast Context for global usage
export const ToastContext = React.createContext({
  addToast: () => {},
  removeToast: () => {},
});

export const ToastProvider = ({ children, position = 'top-right' }) => { // Pass position to provider
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'success', duration = 5000) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prevToasts) => [...prevToasts, { id, message, type, duration }]);
    return id;
  };

  const removeToast = (id) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} position={position} /> {/* Pass position here */}
    </ToastContext.Provider>
  );
};

// Custom hook for using toast
export const useToast = () => {
  const context = React.useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};