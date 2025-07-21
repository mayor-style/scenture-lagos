// src/components/ui/EmptyState.jsx
import React from 'react';
import { Inbox } from 'lucide-react';

export const EmptyState = ({ title, message }) => (
  <div className="text-center py-16 px-4">
    <Inbox className="mx-auto h-12 w-12 text-gray-400" />
    <h3 className="mt-4 text-lg font-semibold text-gray-900">{title}</h3>
    <p className="mt-1 text-sm text-gray-500">{message}</p>
  </div>
);