// src/components/ui/ProductStatusBadge.jsx
import React from 'react';
import { cn } from '../../lib/utils'; // Assuming a utility for merging class names

const statusStyles = {
  'Active': 'bg-green-100 text-green-800 ring-green-600/20',
  'Low Stock': 'bg-yellow-100 text-yellow-800 ring-yellow-600/20',
  'Out of Stock': 'bg-red-100 text-red-800 ring-red-600/20',
};

export const ProductStatusBadge = ({ status }) => (
  <span
    className={cn(
      'inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset',
      statusStyles[status] || 'bg-gray-100 text-gray-800 ring-gray-600/20'
    )}
  >
    {status}
  </span>
);