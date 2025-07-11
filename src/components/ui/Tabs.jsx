import React from 'react';
import { cn } from '../../lib/utils';

// Create a context to share the active tab value
const TabsContext = React.createContext(null);

const Tabs = React.forwardRef(({ className, value, defaultValue, onValueChange, children, ...props }, ref) => {
  // Manage the active tab value internally if not controlled
  const [tabValue, setTabValue] = React.useState(defaultValue);
  
  // Determine if the component is controlled or uncontrolled
  const isControlled = value !== undefined;
  const currentValue = isControlled ? value : tabValue;
  
  // Handle value change
  const handleValueChange = React.useCallback((newValue) => {
    if (!isControlled) {
      setTabValue(newValue);
    }
    onValueChange?.(newValue);
  }, [isControlled, onValueChange]);
  
  // Create context value
  const contextValue = React.useMemo(() => ({
    value: currentValue,
    onValueChange: handleValueChange
  }), [currentValue, handleValueChange]);
  
  return (
    <TabsContext.Provider value={contextValue}>
      <div
        ref={ref}
        className={cn('w-full', className)}
        {...props}
      >
        {children}
      </div>
    </TabsContext.Provider>
  );
});
Tabs.displayName = 'Tabs';

const TabsList = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'flex flex-wrap items-center justify-start border-b border-slate-200 mb-4',
      className
    )}
    role="tablist"
    {...props}
  />
));
TabsList.displayName = 'TabsList';

const TabsTrigger = React.forwardRef(({ className, value, onValueChange, children, ...props }, ref) => {
  // Get the active value from the closest Tabs component context
  const tabsContext = React.useContext(TabsContext);
  const isActive = tabsContext?.value === value;
  
  return (
    <button
      ref={ref}
      role="tab"
      aria-selected={isActive}
      className={cn(
        'px-4 py-2 text-sm font-medium transition-all',
        'focus:outline-none',
        isActive
          ? 'text-primary border-b-2 border-primary -mb-px'
          : 'text-slate-600 hover:text-slate-900',
        className
      )}
      onClick={() => {
        if (onValueChange) {
          onValueChange(value);
        } else if (tabsContext?.onValueChange) {
          tabsContext.onValueChange(value);
        }
      }}
      {...props}
    >
      {children}
    </button>
  );
});
TabsTrigger.displayName = 'TabsTrigger';

const TabsContent = React.forwardRef(({ className, value, ...props }, ref) => {
  // Get the active value from the closest Tabs component context
  const tabsContext = React.useContext(TabsContext);
  const isActive = tabsContext?.value === value;
  
  if (!isActive) return null;
  
  return (
    <div
      ref={ref}
      role="tabpanel"
      className={cn(
        'mt-2 focus:outline-none',
        className
      )}
      {...props}
    />
  );
});
TabsContent.displayName = 'TabsContent';

export { Tabs, TabsList, TabsTrigger, TabsContent };