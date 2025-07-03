import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ShoppingBag, User, Search } from 'lucide-react';
import { Button } from '../ui/Button';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  // Check if current route is active
  const isActiveRoute = (path) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/shop', label: 'Shop' },
    { path: '/about', label: 'About' },
    { path: '/contact', label: 'Contact' },
  ];

  return (
    <header 
      className={`sticky top-0 z-50 transition-all duration-300 ease-in-out ${
        isScrolled 
          ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100' 
          : 'bg-white border-b border-gray-50'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link 
            to="/" 
            className="font-heading text-xl lg:text-2xl font-semibold text-gray-900 hover:text-gray-700 transition-colors duration-200"
          >
            Scenture Lagos
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`relative px-4 py-2 text-sm font-medium transition-all duration-200 rounded-lg hover:bg-gray-50 ${
                  isActiveRoute(item.path)
                    ? 'text-gray-900'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {item.label}
                {isActiveRoute(item.path) && (
                  <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-gray-900 rounded-full" />
                )}
              </Link>
            ))}
          </nav>

          {/* Desktop Icons */}
          <div className="hidden lg:flex items-center space-x-2">
            <button 
              aria-label="Search" 
              className="p-2.5 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-all duration-200 group"
            >
              <Search size={20} className="group-hover:scale-110 transition-transform duration-200" />
            </button>
            
            <Link
              to="/account"
              aria-label="Account"
              className="p-2.5 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-all duration-200 group"
            >
              <User size={20} className="group-hover:scale-110 transition-transform duration-200" />
            </Link>
            
            <Link
              to="/cart"
              aria-label="Cart"
              className="relative p-2.5 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-all duration-200 group"
            >
              <ShoppingBag size={20} className="group-hover:scale-110 transition-transform duration-200" />
              <span className="absolute -top-1 -right-1 bg-gray-900 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium shadow-lg">
                0
              </span>
            </Link>
          </div>

          {/* Mobile Icons & Menu Button */}
          <div className="flex items-center space-x-2 lg:hidden">
            <Link
              to="/cart"
              aria-label="Cart"
              className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-all duration-200"
            >
              <ShoppingBag size={20} />
              <span className="absolute -top-1 -right-1 bg-gray-900 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium shadow-lg">
                0
              </span>
            </Link>
            
            <Button
              variant="ghost"
              size="icon"
              aria-label={isMenuOpen ? 'Close Menu' : 'Open Menu'}
              onClick={toggleMenu}
              className={`p-2 rounded-xl transition-all duration-200 ${
                isMenuOpen ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              {isMenuOpen ? (
                <X size={24} className="rotate-90 transition-transform duration-200" />
              ) : (
                <Menu size={24} className="transition-transform duration-200" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div 
        className={`lg:hidden transition-all duration-300 ease-in-out overflow-hidden ${
          isMenuOpen 
            ? 'max-h-96 opacity-100 border-b border-gray-100' 
            : 'max-h-0 opacity-0'
        }`}
      >
        <div className="bg-white/95 backdrop-blur-md">
          <nav className="max-w-7xl mx-auto px-4 sm:px-6 py-4 space-y-1">
            {navItems.map((item, index) => (
              <Link
                key={item.path}
                to={item.path}
                className={`block px-4 py-3 text-base font-medium rounded-xl transition-all duration-200 ${
                  isActiveRoute(item.path)
                    ? 'text-gray-900 bg-gray-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
                style={{ 
                  animationDelay: `${index * 50}ms`,
                  animation: isMenuOpen ? 'slideInUp 0.3s ease-out forwards' : 'none'
                }}
                onClick={toggleMenu}
              >
                {item.label}
              </Link>
            ))}
            
            {/* Mobile Action Buttons */}
            <div className="flex items-center justify-start space-x-2 px-4 pt-4 border-t border-gray-100 mt-4">
              <button
                aria-label="Search"
                className="flex-1 flex items-center justify-center gap-3 px-4 py-3 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-all duration-200"
              >
                <Search size={20} />
                <span className="text-sm font-medium">Search</span>
              </button>
              
              <Link
                to="/account"
                aria-label="Account"
                className="flex-1 flex items-center justify-center gap-3 px-4 py-3 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-all duration-200"
                onClick={toggleMenu}
              >
                <User size={20} />
                <span className="text-sm font-medium">Account</span>
              </Link>
            </div>
          </nav>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </header>
  );
};

export default Header;