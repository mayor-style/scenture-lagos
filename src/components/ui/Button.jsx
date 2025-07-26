import React from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '../../lib/utils'; // Assuming cn is a utility for combining class names

const buttonVariants = cva(
    'inline-flex items-center justify-center whitespace-nowrap rounded-none text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-50',
    {
        variants: {
            variant: {
                default: 'bg-primary text-secondary hover:bg-primary-dark',
                secondary: 'bg-secondary text-cream hover:bg-secondary-light',
                outline: 'border border-primary bg-transparent hover:bg-primary/10 text-secondary',
                ghost: 'hover:bg-primary/10 text-secondary',
                link: 'text-secondary underline-offset-4 hover:underline',
            },
            size: {
                default: 'h-12 px-6 py-3',
                sm: 'h-9 px-3',
                lg: 'h-14 px-8',
                icon: 'h-9 w-9',
            },
        },
        defaultVariants: {
            variant: 'default',
            size: 'default',
        },
    }
);

// Corrected Button component to properly handle the `asChild` prop
const Button = React.forwardRef(
    ({ className, variant, size, asChild = false, ...props }, ref) => {
        // If asChild is true, render the child component directly,
        // otherwise, render a native button element.
        const Comp = asChild ? 'div' : 'button'; // Use 'div' or React.Fragment for asChild to avoid rendering an extra button
                                               // The actual child component (e.g., Link) will then render itself.

        return (
            <Comp
                className={cn(buttonVariants({ variant, size, className }))}
                ref={ref}
                {...props}
            >
                {props.children}
            </Comp>
        );
    }
);

Button.displayName = 'Button';

export { Button, buttonVariants };
