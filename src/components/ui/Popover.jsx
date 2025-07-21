import React from 'react';
import * as PopoverPrimitive from '@radix-ui/react-popover';
import { cn } from '../../lib/utils';

const Popover = React.forwardRef(({ className, ...props }, ref) => (
  <PopoverPrimitive.Root
    ref={ref}
    className={cn('relative', className)}
    {...props}
  />
));
Popover.displayName = PopoverPrimitive.Root.displayName;

const PopoverTrigger = React.forwardRef(({ className, asChild = false, ...props }, ref) => (
  <PopoverPrimitive.Trigger
    ref={ref}
    asChild={asChild}
    className={cn('inline-flex items-center justify-center', className)}
    {...props}
  />
));
PopoverTrigger.displayName = PopoverPrimitive.Trigger.displayName;

const PopoverContent = React.forwardRef(({ className, align = 'center', sideOffset = 4, ...props }, ref) => (
  <PopoverPrimitive.Portal>
    <PopoverPrimitive.Content
      ref={ref}
      align={align}
      sideOffset={sideOffset}
      className={cn(
        'z-50 w-auto rounded-md border border-slate-200 bg-white p-4 shadow-md outline-none',
        'data-[state=open]:animate-in data-[state=closed]:animate-out',
        'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
        'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-100',
        'data-[side=bottom]:slide-in-from-top-2',
        'data-[side=left]:slide-in-from-right-2',
        'data-[side=right]:slide-in-from-left-2',
        'data-[side=top]:slide-in-from-bottom-2',
        className
      )}
      {...props}
    />
  </PopoverPrimitive.Portal>
));
PopoverContent.displayName = PopoverPrimitive.Content.displayName;

export { Popover, PopoverTrigger, PopoverContent };