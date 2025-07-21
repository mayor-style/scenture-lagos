import React from 'react';
import { cn } from '../../lib/utils';

const Input = React.forwardRef(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      'flex h-9 w-full z-50 rounded-md border border-primary/20 bg-background px-3 py-2 text-sm text-secondary placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:cursor-not-allowed disabled:opacity-50 transition-shadow hover:shadow-sm',
      className
    )}
    {...props}
  />
));
Input.displayName = 'Input';

export { Input };