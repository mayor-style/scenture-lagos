import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Warehouse,
  Settings,
  ChevronRight,
} from 'lucide-react';

const navItems = [
  { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Products', path: '/admin/products', icon: Package },
  { name: 'Orders', path: '/admin/orders', icon: ShoppingCart },
  { name: 'Customers', path: '/admin/customers', icon: Users },
  { name: 'Inventory', path: '/admin/inventory', icon: Warehouse },
  { name: 'Settings', path: '/admin/settings', icon: Settings },
];

const AdminSidebar = ({ open, setOpen }) => {
  return (
    <>
      {/* Desktop Sidebar: Fixed, toggleable width */}
      <motion.aside
        initial={{ width: open ? 256 : 64 }}
        animate={{ width: open ? 256 : 64 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className={cn(
          'hidden md:flex flex-col h-screen bg-white border-r border-slate-200/80 shadow-sm fixed left-0 top-0 z-40'
        )}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-slate-200/80">
          <div className="flex items-center">
            {open ? (
              <h1 className="text-xl font-heading font-medium">Scenture</h1>
            ) : (
              <h1 className="text-xl font-heading font-medium">S</h1>
            )}
          </div>
          <button
            onClick={() => setOpen(!open)}
            className="p-1 text-secondary rounded-md hover:bg-slate-100 focus:outline-none"
          >
            <ChevronRight
              size={20}
              className={cn('transition-transform', open && 'rotate-180')}
            />
          </button>
        </div>
        <nav className="flex-1 py-6 overflow-y-auto">
          <ul className="space-y-1 px-2">
            {navItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center px-3 py-3 text-sm font-medium rounded-md transition-colors',
                      'hover:bg-[#D4A017]/10',
                      isActive ? 'bg-[#D4A017]/20 text-secondary' : 'text-secondary/70',
                      !open && 'justify-center'
                    )
                  }
                >
                  <item.icon size={20} className={cn('flex-shrink-0', open && 'mr-3')} />
                  {open && <span>{item.name}</span>}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <div className="p-4 border-t border-slate-200/80">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-[#D4A017] flex items-center justify-center text-secondary">
              <span className="text-sm font-medium">AL</span>
            </div>
            {open && (
              <div className="ml-3">
                <p className="text-sm font-medium text-secondary">Admin User</p>
                <p className="text-xs text-secondary/70">admin@scenture.com</p>
              </div>
            )}
          </div>
        </div>
      </motion.aside>

      {/* Mobile Sidebar: Slides in/out */}
      <motion.aside
        initial={{ x: open ? 0 : '-100%' }}
        animate={{ x: open ? 0 : '-100%' }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className={cn(
          'md:hidden fixed top-0 left-0 z-50 h-screen w-64 bg-white border-r border-slate-200/80 shadow-sm flex flex-col'
        )}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-slate-200/80">
          <h1 className="text-xl font-heading font-medium">Scenture</h1>
          <button
            onClick={() => setOpen(false)}
            className="p-1 text-secondary rounded-md hover:bg-slate-100 focus:outline-none"
          >
            <ChevronRight size={20} className="rotate-180" />
          </button>
        </div>
        <nav className="flex-1 py-6 overflow-y-auto">
          <ul className="space-y-1 px-2">
            {navItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center px-3 py-3 text-sm font-medium rounded-md transition-colors',
                      'hover:bg-[#D4A017]/10',
                      isActive ? 'bg-[#D4A017]/20 text-secondary' : 'text-secondary/70'
                    )
                  }
                >
                  <item.icon size={20} className="mr-3 flex-shrink-0" />
                  <span>{item.name}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <div className="p-4 border-t border-slate-200/80">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-[#D4A017] flex items-center justify-center text-secondary">
              <span className="text-sm font-medium">AL</span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-secondary">Admin User</p>
              <p className="text-xs text-secondary/70">admin@scenture.com</p>
            </div>
          </div>
        </div>
      </motion.aside>

      {/* Mobile Overlay */}
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="md:hidden fixed inset-0 bg-black z-40"
          onClick={() => setOpen(false)}
        />
      )}
    </>
  );
};

export default AdminSidebar;