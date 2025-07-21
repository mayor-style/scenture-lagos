import React from 'react';
import { cn } from '../../lib/utils';

const Skeleton = ({ className, ...props }) => (
  <div className={cn('animate-pulse rounded-md bg-muted/50', className)} {...props} />
);

export { Skeleton };