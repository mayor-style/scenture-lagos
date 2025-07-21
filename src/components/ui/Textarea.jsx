import React from 'react';
import { cn } from '../../lib/utils';

const Textarea = React.forwardRef(({ className, ...props }, ref) => (
  <textarea
    className={cn(
      'flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-secondary',
      'focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50',
      'disabled:cursor-not-allowed disabled:opacity-50',
      'placeholder:text-muted-foreground',
      className
    )}
    ref={ref}
    {...props}
  />
));
Textarea.displayName = 'Textarea';

export { Textarea };