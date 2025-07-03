import React, { useState, useEffect } from 'react';
import AdminHeader from './AdminHeader';
import AdminSidebar from './AdminSidebar';
import { cn } from '../../lib/utils';
import { Toaster } from 'react-hot-toast';
import { Outlet } from 'react-router-dom';

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 768);

  useEffect(() => {
    const handleResize = () => {
      setSidebarOpen(window.innerWidth >= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="flex h-screen bg-[#F5F5F4] overflow-hidden">
      <Toaster
        position="bottom-right"
        toastOptions={{
          className: 'bg-[#F5F5F4] border-[#D4A017] text-foreground p-4 rounded-md shadow-lg',
        }}
      />
      <AdminSidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      <div
        className={cn(
          'flex flex-col flex-1 overflow-hidden',
          'md:ml-[64px]', // Reserve space for collapsed sidebar (w-20)
          sidebarOpen && 'md:ml-[256px]' // Reserve space for open sidebar (w-64)
        )}
      >
        <AdminHeader sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="container mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;