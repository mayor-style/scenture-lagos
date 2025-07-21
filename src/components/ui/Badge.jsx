import React from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50',
  {
    variants: {
      variant: {
        default: 'border-primary/20 bg-background text-secondary hover:bg-primary/10',
        success: 'border-green-200 bg-green-50 text-green-700 hover:bg-green-100',
        info: 'border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100',
        warning: 'border-yellow-200 bg-yellow-50 text-yellow-700 hover:bg-yellow-100',
        destructive: 'border-red-200 bg-red-50 text-red-700 hover:bg-red-100',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

const Badge = React.forwardRef(({ className, variant, ...props }, ref) => (
  <span ref={ref} className={cn(badgeVariants({ variant }), className)} {...props} />
));
Badge.displayName = 'Badge';

export { Badge, badgeVariants };