import React from 'react';
import { Menu, Bell, User, LogOut, Settings } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const AdminHeader = ({ sidebarOpen, setSidebarOpen }) => {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = React.useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      // Navigation is handled in the logout function
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200/80 shadow-sm">
      <div className="flex items-center justify-between h-16 px-4 md:px-6">
        <div className="flex items-center">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden p-2 mr-4 text-secondary rounded-md hover:bg-[#D4A017]/10 focus:outline-none"
            aria-label="Toggle sidebar"
          >
            <Menu size={20} />
          </button>
          <h1 className="text-xl font-heading font-medium hidden md:block">Scenture Lagos Admin</h1>
        </div>

        <div className="flex items-center space-x-4">
          <button className="p-2 text-secondary rounded-full hover:bg-[#D4A017]/10 focus:outline-none relative">
            <Bell size={20} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-[#D4A017] rounded-full"></span>
          </button>
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center space-x-2 p-2 rounded-full hover:bg-[#D4A017]/10 focus:outline-none"
            >
              <div className="w-8 h-8 rounded-full bg-[#D4A017] flex items-center justify-center text-secondary">
                <User size={16} />
              </div>
              <span className="hidden md:block text-sm font-medium">Admin</span>
            </button>
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-slate-200">
                <div className="px-4 py-2 border-b border-slate-100">
                  <p className="text-sm font-medium">{currentUser?.firstName} {currentUser?.lastName}</p>
                  <p className="text-xs text-slate-500">{currentUser?.email}</p>
                </div>
                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    navigate('/admin/settings');
                  }}
                  className="flex items-center w-full px-4 py-2 text-sm text-left text-secondary hover:bg-[#D4A017]/10"
                >
                  <Settings size={16} className="mr-2" />
                  Settings
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full px-4 py-2 text-sm text-left text-secondary hover:bg-[#D4A017]/10"
                >
                  <LogOut size={16} className="mr-2" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;