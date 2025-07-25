import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ShoppingBag, User, Search } from 'lucide-react';

import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { currentUser, isAuthenticated } = useAuth();
  const { cart } = useCart();
  const location = useLocation();

  // --- Hooks ---
  // Close mobile menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  // Handle body scroll lock when menu is open
  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : 'auto';
  }, [isMenuOpen]);

  // Handle header style on scroll
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // --- Data & Config ---
  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/shop', label: 'Shop' },
    { path: '/about', label: 'About Us' },
    { path: '/contact', label: 'Contact' },
  ];
  
  const cartItemCount = cart?.totalItems || 0;
  const isActiveRoute = (path) => location.pathname === path;

  // --- Animation Variants ---
  const mobileMenuVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.2, ease: 'easeIn' } },
  };
  
  const navItemVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.05, duration: 0.2, ease: 'easeOut' },
    }),
  };

  return (
    <header 
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled || isMenuOpen 
        ? 'bg-white/80 backdrop-blur-lg shadow-sm border-b border-neutral-200/80' 
        : 'bg-white/50 border-b border-transparent'
      }`}
    >
      <div className="container px-6">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo */}
          <Link to="/" className="font-heading text-xl font-bold text-neutral-900">
            Scenture Lagos<span className="text-neutral-400">.</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`relative px-3 py-2 text-sm font-medium transition-colors duration-200 rounded-md ${
                  isActiveRoute(item.path) ? 'text-neutral-900' : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100/60'
                }`}
              >
                {item.label}
                {isActiveRoute(item.path) && (
                  <motion.div
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-neutral-900"
                    layoutId="active-underline" // This creates the magic sliding effect
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                  />
                )}
              </Link>
            ))}
          </nav>

          {/* Icons & Mobile Menu Toggle */}
          <div className="flex items-center gap-2">
            <button aria-label="Search" className="hidden lg:block p-2 text-neutral-600 hover:text-neutral-900 rounded-full hover:bg-neutral-100/60 transition-colors">
              <Search size={20} />
            </button>
            <Link to={isAuthenticated ? "/account" : "/login"} aria-label="Account" className="hidden lg:block p-2 text-neutral-600 hover:text-neutral-900 rounded-full hover:bg-neutral-100/60 transition-colors">
              <User size={20} />
            </Link>
            <Link to="/cart" aria-label="View Cart" className="relative p-2 text-neutral-600 hover:text-neutral-900 rounded-full hover:bg-neutral-100/60 transition-colors">
              <ShoppingBag size={20} />
              {cartItemCount > 0 && (
                <span className="absolute top-0 right-0 flex items-center justify-center w-4 h-4 text-xs font-bold text-white bg-neutral-900 rounded-full">
                  {cartItemCount}
                </span>
              )}
            </Link>
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="lg:hidden p-2 text-neutral-600 hover:text-neutral-900" aria-label="Toggle menu">
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu with Framer Motion */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            key="mobile-menu"
            variants={mobileMenuVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="lg:hidden absolute top-full left-0 w-full h-screen bg-white/95 backdrop-blur-lg border-t border-neutral-200/80"
          >
            <nav className="container flex flex-col px-6 pt-8 gap-2">
              {navItems.map((item, i) => (
                <motion.div key={item.path} custom={i} variants={navItemVariants}>
                  <Link
                    to={item.path}
                    className={`block w-full p-4 text-lg font-medium text-left rounded-lg ${
                      isActiveRoute(item.path) ? 'text-neutral-900 bg-neutral-100' : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
                    }`}
                  >
                    {item.label}
                  </Link>
                </motion.div>
              ))}
              <motion.div custom={navItems.length} variants={navItemVariants} className="mt-6 border-t border-neutral-200 pt-6">
                <Link to={isAuthenticated ? "/account" : "/login"} className="flex items-center gap-4 w-full p-4 text-lg font-medium text-left rounded-lg text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100">
                  <User size={22} />
                  <span>{isAuthenticated ? 'My Account' : 'Login / Register'}</span>
                </Link>
                <button className="flex items-center gap-4 w-full p-4 text-lg font-medium text-left rounded-lg text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100">
                  <Search size={22} />
                  <span>Search</span>
                </button>
              </motion.div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}