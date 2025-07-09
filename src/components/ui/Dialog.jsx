import React from 'react';
import { X } from 'lucide-react';

export const Dialog = ({ open, onOpenChange, children }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative max-w-lg w-full mx-4">{children}</div>
    </div>
  );
};

export const DialogContent = ({ children }) => {
  return (
    <div className="bg-white rounded-xl shadow-2xl border border-slate-200 p-6">
      {children}
    </div>
  );
};

export const DialogHeader = ({ children }) => {
  return (
    <div className="mb-4">{children}</div>
  );
};

export const DialogTitle = ({ children }) => {
  return (
    <h2 className="text-xl font-heading font-medium text-secondary">{children}</h2>
  );
};

export const DialogFooter = ({ children }) => {
  return (
    <div className="mt-6 flex justify-end gap-3">{children}</div>
  );
};