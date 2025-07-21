import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { cn } from '../../lib/utils';
import { X } from 'lucide-react';

// Context to manage dropdown state
const DropdownMenuContext = createContext();

const DropdownMenu = ({ children, ...props }) => {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef(null);
  const contentRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        open &&
        triggerRef.current &&
        contentRef.current &&
        !triggerRef.current.contains(event.target) &&
        !contentRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  return (
    <DropdownMenuContext.Provider value={{ open, setOpen, triggerRef, contentRef }}>
      <div {...props}>{children}</div>
    </DropdownMenuContext.Provider>
  );
};
DropdownMenu.displayName = 'DropdownMenu';

const DropdownMenuTrigger = React.forwardRef(({ asChild, className, children, ...props }, ref) => {
  const { setOpen, triggerRef } = useContext(DropdownMenuContext);
  const Component = asChild ? 'span' : 'button';

  return (
    <Component
      ref={(node) => {
        triggerRef.current = node;
        if (ref) ref.current = node;
      }}
      className={cn('focus:outline-none', className)}
      onClick={() => setOpen((prev) => !prev)}
      {...props}
    >
      {children}
    </Component>
  );
});
DropdownMenuTrigger.displayName = 'DropdownMenuTrigger';

const DropdownMenuContent = React.forwardRef(({ className, align = 'end', children, ...props }, ref) => {
  const { open, contentRef } = useContext(DropdownMenuContext);
  if (!open) return null;

  return (
    <div
      ref={(node) => {
        contentRef.current = node;
        if (ref) ref.current = node;
      }}
      className={cn(
        'absolute z-50 mt-2 w-48 rounded-md border border-slate-200 bg-white shadow-lg p-1',
        align === 'end' ? 'right-0' : 'left-0',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});
DropdownMenuContent.displayName = 'DropdownMenuContent';

const DropdownMenuItem = React.forwardRef(({ className, onSelect, children, ...props }, ref) => {
  const { setOpen } = useContext(DropdownMenuContext);

  return (
    <div
      ref={ref}
      className={cn(
        'flex items-center px-3 py-2 text-sm text-slate-900 hover:bg-slate-100 rounded-md cursor-pointer transition-colors',
        className
      )}
      onClick={(e) => {
        onSelect?.(e);
        setOpen(false);
      }}
      {...props}
    >
      {children}
    </div>
  );
});
DropdownMenuItem.displayName = 'DropdownMenuItem';

export { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem };