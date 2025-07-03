import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Package, Heart, Settings, LogOut, Edit, ShoppingBag, Clock, ChevronRight } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { formatPrice } from '../lib/utils';

const AccountPage = () => {
  // Mock user data
  const [user] = useState({
    name: 'Sarah Johnson',
    email: 'sarah.johnson@example.com',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80',
    joined: 'January 2023',
  });

  // Mock order data
  const [orders] = useState([
    {
      id: 'ORD-2023-1234',
      date: 'June 15, 2023',
      status: 'Delivered',
      total: 89.00,
      items: [
        {
          id: '1',
          name: 'Amber & Lavender Candle',
          price: 32.00,
          quantity: 2,
          image: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80',
        },
        {
          id: '4',
          name: 'Citrus Breeze Diffuser',
          price: 25.00,
          quantity: 1,
          image: 'https://images.unsplash.com/photo-1596435163709-b374d6578397?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80',
        },
      ],
    },
    {
      id: 'ORD-2023-0987',
      date: 'April 3, 2023',
      status: 'Delivered',
      total: 45.00,
      items: [
        {
          id: '2',
          name: 'Sandalwood Reed Diffuser',
          price: 45.00,
          quantity: 1,
          image: 'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=688&q=80',
        },
      ],
    },
  ]);

  // Mock wishlist data
  const [wishlist] = useState([
    {
      id: '3',
      name: 'Midnight Jasmine Candle',
      price: 28.00,
      image: 'https://images.unsplash.com/photo-1547887538-e3a2f32cb1cc?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80',
    },
    {
      id: '6',
      name: 'Rose Garden Diffuser',
      price: 35.00,
      image: 'https://images.unsplash.com/photo-1602910344008-22f323cc1817?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80',
    },
  ]);

  // Active tab state
  const [activeTab, setActiveTab] = useState('profile');

  // Enhanced animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        duration: 0.8, 
        ease: [0.22, 1, 0.36, 1] 
      } 
    },
  };

  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1, 
      transition: { 
        duration: 0.8,
        ease: [0.22, 1, 0.36, 1]
      } 
    },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  // Navigation items
  const navItems = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'orders', label: 'Orders', icon: Package },
    { id: 'wishlist', label: 'Wishlist', icon: Heart },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  // Render tab content based on active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            className="space-y-8"
          >
            <div className="flex flex-col md:flex-row items-start md:items-center gap-8">
              <div className="relative">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-neutral-100 border border-neutral-200">
                  <img 
                    src={user.avatar} 
                    alt={user.name} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <button 
                  className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full border border-neutral-200 flex items-center justify-center text-neutral-600 hover:text-neutral-900 hover:border-neutral-300 transition-colors duration-200 shadow-sm"
                  aria-label="Edit profile picture"
                >
                  <Edit size={14} />
                </button>
              </div>
              
              <div className="space-y-2">
                <h2 className="font-heading text-2xl text-neutral-900">{user.name}</h2>
                <p className="text-neutral-600">{user.email}</p>
                <p className="text-sm text-neutral-500">Member since {user.joined}</p>
              </div>
            </div>

            <div className="border-t border-neutral-200 pt-8">
              <h3 className="font-heading text-xl mb-6 text-neutral-900">Personal Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-neutral-700">Full Name</label>
                  <input
                    type="text"
                    value={user.name}
                    className="w-full px-4 py-3 bg-white border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                    readOnly
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-neutral-700">Email Address</label>
                  <input
                    type="email"
                    value={user.email}
                    className="w-full px-4 py-3 bg-white border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                    readOnly
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-neutral-700">Phone Number</label>
                  <input
                    type="tel"
                    placeholder="Add your phone number"
                    className="w-full px-4 py-3 bg-white border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-neutral-700">Date of Birth</label>
                  <input
                    type="date"
                    className="w-full px-4 py-3 bg-white border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                  />
                </div>
              </div>
              
              <div className="mt-8">
                <Button className="bg-neutral-900 hover:bg-neutral-800 text-white px-6 py-3 rounded-full transition-all duration-300">
                  Update Profile
                </Button>
              </div>
            </div>
          </motion.div>
        );
        
      case 'orders':
        return (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="space-y-8"
          >
            <h2 className="font-heading text-2xl text-neutral-900">Your Orders</h2>
            
            {orders.length > 0 ? (
              <div className="space-y-6">
                {orders.map((order) => (
                  <motion.div 
                    key={order.id}
                    variants={fadeInUp}
                    className="bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300"
                  >
                    <div className="p-6 border-b border-neutral-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-neutral-900">{order.id}</h3>
                          <span className={`px-3 py-1 text-xs rounded-full ${order.status === 'Delivered' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                            {order.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-neutral-500">
                          <Clock size={14} />
                          <span>{order.date}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <span className="font-medium text-neutral-900">{formatPrice(order.total)}</span>
                        <Button asChild variant="outline" size="sm" className="rounded-full border-neutral-300 hover:bg-neutral-50">
                          <Link to={`/order/${order.id}`} className="flex items-center gap-1">
                            <span>Details</span>
                            <ChevronRight size={14} />
                          </Link>
                        </Button>
                      </div>
                    </div>
                    
                    <div className="p-6 bg-neutral-50">
                      <div className="flex items-center gap-4 overflow-x-auto pb-2">
                        {order.items.map((item) => (
                          <div key={item.id} className="flex-shrink-0">
                            <div className="w-16 h-16 bg-white rounded-lg overflow-hidden border border-neutral-200">
                              <img 
                                src={item.image} 
                                alt={item.name} 
                                className="w-full h-full object-cover"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <motion.div 
                variants={fadeIn}
                className="text-center py-12 bg-neutral-50 rounded-xl border border-neutral-200"
              >
                <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShoppingBag size={24} className="text-neutral-400" />
                </div>
                <h3 className="font-heading text-xl mb-2 text-neutral-900">No orders yet</h3>
                <p className="text-neutral-600 mb-6">When you place your first order, it will appear here.</p>
                <Button asChild variant="outline" className="rounded-full border-neutral-300 hover:bg-neutral-50">
                  <Link to="/shop">Start Shopping</Link>
                </Button>
              </motion.div>
            )}
          </motion.div>
        );
        
      case 'wishlist':
        return (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="space-y-8"
          >
            <h2 className="font-heading text-2xl text-neutral-900">Your Wishlist</h2>
            
            {wishlist.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {wishlist.map((item) => (
                  <motion.div 
                    key={item.id}
                    variants={fadeInUp}
                    className="bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 group"
                  >
                    <Link to={`/product/${item.id}`} className="block">
                      <div className="aspect-square overflow-hidden bg-neutral-100">
                        <img 
                          src={item.image} 
                          alt={item.name} 
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                        />
                      </div>
                    </Link>
                    
                    <div className="p-6">
                      <Link to={`/product/${item.id}`} className="block group/link">
                        <h3 className="font-heading text-xl text-neutral-900 group-hover/link:text-neutral-700 transition-colors duration-300 mb-2">
                          {item.name}
                        </h3>
                      </Link>
                      
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-neutral-900">{formatPrice(item.price)}</span>
                        
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="rounded-full w-9 h-9 p-0 border-neutral-300 hover:bg-neutral-50"
                            aria-label="Remove from wishlist"
                          >
                            <Heart size={16} className="text-primary-dark fill-primary-dark" />
                          </Button>
                          
                          <Button 
                            size="sm" 
                            className="rounded-full bg-neutral-900 hover:bg-neutral-800 text-white"
                          >
                            Add to Cart
                          </Button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <motion.div 
                variants={fadeIn}
                className="text-center py-12 bg-neutral-50 rounded-xl border border-neutral-200"
              >
                <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart size={24} className="text-neutral-400" />
                </div>
                <h3 className="font-heading text-xl mb-2 text-neutral-900">Your wishlist is empty</h3>
                <p className="text-neutral-600 mb-6">Save items you love to your wishlist and find them here anytime.</p>
                <Button asChild variant="outline" className="rounded-full border-neutral-300 hover:bg-neutral-50">
                  <Link to="/shop">Explore Products</Link>
                </Button>
              </motion.div>
            )}
          </motion.div>
        );
        
      case 'settings':
        return (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            className="space-y-8"
          >
            <h2 className="font-heading text-2xl text-neutral-900">Account Settings</h2>
            
            <div className="space-y-6">
              {/* Password Section */}
              <div className="bg-white border border-neutral-200 rounded-xl p-6">
                <h3 className="font-heading text-xl mb-6 text-neutral-900">Change Password</h3>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-neutral-700">Current Password</label>
                    <input
                      type="password"
                      className="w-full px-4 py-3 bg-white border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-neutral-700">New Password</label>
                    <input
                      type="password"
                      className="w-full px-4 py-3 bg-white border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-neutral-700">Confirm New Password</label>
                    <input
                      type="password"
                      className="w-full px-4 py-3 bg-white border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                    />
                  </div>
                  
                  <Button className="bg-neutral-900 hover:bg-neutral-800 text-white px-6 py-3 rounded-full transition-all duration-300">
                    Update Password
                  </Button>
                </div>
              </div>
              
              {/* Notification Preferences */}
              <div className="bg-white border border-neutral-200 rounded-xl p-6">
                <h3 className="font-heading text-xl mb-6 text-neutral-900">Notification Preferences</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-neutral-900">Order Updates</h4>
                      <p className="text-sm text-neutral-600">Receive notifications about your order status</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-neutral-900">Promotional Emails</h4>
                      <p className="text-sm text-neutral-600">Receive emails about new products and offers</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-neutral-900">SMS Notifications</h4>
                      <p className="text-sm text-neutral-600">Receive text messages for important updates</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                </div>
              </div>
              
              {/* Danger Zone */}
              <div className="bg-white border border-red-100 rounded-xl p-6">
                <h3 className="font-heading text-xl mb-6 text-neutral-900">Danger Zone</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-neutral-900">Delete Account</h4>
                      <p className="text-sm text-neutral-600">Permanently delete your account and all data</p>
                    </div>
                    <Button variant="outline" className="border-red-300 text-red-600 hover:bg-red-50 rounded-full">
                      Delete Account
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="py-16 lg:py-24 bg-neutral-50">
      <div className="container px-6 lg:px-12">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          className="mb-12"
        >
          <h1 className="font-heading text-4xl md:text-5xl text-neutral-900 tracking-tight mb-4">
            My Account
          </h1>
          <p className="text-lg text-neutral-600 max-w-2xl">
            Manage your profile, track orders, and update your preferences.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Sidebar Navigation */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            className="lg:col-span-1"
          >
            <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden sticky top-24">
              <nav className="divide-y divide-neutral-100">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center gap-3 p-4 text-left transition-colors duration-200 ${activeTab === item.id ? 'bg-primary/10 text-neutral-900' : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'}`}
                    >
                      <Icon size={18} className={activeTab === item.id ? 'text-primary-dark' : ''} />
                      <span className="font-medium">{item.label}</span>
                    </button>
                  );
                })}
                
                <button
                  className="w-full flex items-center gap-3 p-4 text-left text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 transition-colors duration-200"
                >
                  <LogOut size={18} />
                  <span className="font-medium">Sign Out</span>
                </button>
              </nav>
            </div>
          </motion.div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl border border-neutral-200 p-6 lg:p-8">
              {renderTabContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountPage;