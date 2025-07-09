import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Package, Heart, Settings, LogOut, Edit, ShoppingBag, Clock, ChevronRight, Bell, CreditCard, MapPin, Shield } from 'lucide-react';

const AccountPage = () => {
  // Mock user data
  const [user] = useState({
    name: 'Sarah Johnson',
    email: 'sarah.johnson@example.com',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80',
    joined: 'January 2023',
    location: 'New York, NY',
    memberTier: 'Gold'
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

  // Format price
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  // Enhanced animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        duration: 0.6, 
        ease: [0.22, 1, 0.36, 1] 
      } 
    },
  };

  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1, 
      transition: { 
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1]
      } 
    },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
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
            variants={staggerContainer}
            className="space-y-8"
          >
            {/* Profile Header */}
            <motion.div variants={fadeInUp} className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-2xl"></div>
              <div className="relative p-8 md:p-12 text-white">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                  <div className="relative">
                    <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden bg-white/10 backdrop-blur-sm border border-white/20 ring-4 ring-white/10">
                      <img 
                        src={user.avatar} 
                        alt={user.name} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <button className="absolute -bottom-2 -right-2 w-10 h-10 bg-white rounded-full border-4 border-slate-900 flex items-center justify-center text-slate-900 hover:bg-slate-50 transition-colors duration-200 shadow-lg">
                      <Edit size={16} />
                    </button>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <h2 className="text-2xl md:text-3xl font-light">{user.name}</h2>
                      <span className="px-3 py-1 bg-gradient-to-r from-amber-400 to-amber-500 text-slate-900 text-xs font-medium rounded-full">
                        {user.memberTier}
                      </span>
                    </div>
                    <p className="text-white/80 text-lg">{user.email}</p>
                    <div className="flex items-center gap-4 text-sm text-white/60">
                      <span>Member since {user.joined}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <MapPin size={14} />
                        {user.location}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Quick Stats */}
            <motion.div variants={fadeInUp} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl p-6 border border-slate-200 hover:shadow-lg transition-shadow duration-300">
                <div className="flex items-center justify-between mb-2">
                  <Package size={20} className="text-slate-600" />
                  <span className="text-xs text-slate-500">Total</span>
                </div>
                <div className="text-2xl font-light text-slate-900">{orders.length}</div>
                <div className="text-xs text-slate-500">Orders</div>
              </div>
              
              <div className="bg-white rounded-xl p-6 border border-slate-200 hover:shadow-lg transition-shadow duration-300">
                <div className="flex items-center justify-between mb-2">
                  <Heart size={20} className="text-slate-600" />
                  <span className="text-xs text-slate-500">Saved</span>
                </div>
                <div className="text-2xl font-light text-slate-900">{wishlist.length}</div>
                <div className="text-xs text-slate-500">Wishlist</div>
              </div>
              
              <div className="bg-white rounded-xl p-6 border border-slate-200 hover:shadow-lg transition-shadow duration-300">
                <div className="flex items-center justify-between mb-2">
                  <CreditCard size={20} className="text-slate-600" />
                  <span className="text-xs text-slate-500">Spent</span>
                </div>
                <div className="text-2xl font-light text-slate-900">{formatPrice(orders.reduce((sum, order) => sum + order.total, 0))}</div>
                <div className="text-xs text-slate-500">Total</div>
              </div>
              
              <div className="bg-white rounded-xl p-6 border border-slate-200 hover:shadow-lg transition-shadow duration-300">
                <div className="flex items-center justify-between mb-2">
                  <Shield size={20} className="text-slate-600" />
                  <span className="text-xs text-slate-500">Since</span>
                </div>
                <div className="text-2xl font-light text-slate-900">2023</div>
                <div className="text-xs text-slate-500">Member</div>
              </div>
            </motion.div>

            {/* Personal Information */}
            <motion.div variants={fadeInUp} className="bg-white rounded-2xl p-8 border border-slate-200">
              <h3 className="text-xl font-light mb-8 text-slate-900">Personal Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">Full Name</label>
                  <input
                    type="text"
                    defaultValue={user.name}
                    className="w-full px-4 py-4 bg-slate-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all duration-200 text-slate-900"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">Email Address</label>
                  <input
                    type="email"
                    defaultValue={user.email}
                    className="w-full px-4 py-4 bg-slate-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all duration-200 text-slate-900"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">Phone Number</label>
                  <input
                    type="tel"
                    placeholder="Add your phone number"
                    className="w-full px-4 py-4 bg-slate-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all duration-200 text-slate-900 placeholder-slate-400"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">Location</label>
                  <input
                    type="text"
                    defaultValue={user.location}
                    className="w-full px-4 py-4 bg-slate-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all duration-200 text-slate-900"
                  />
                </div>
              </div>
              
              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <button className="flex-1 bg-slate-900 hover:bg-slate-800 text-white px-8 py-4 rounded-xl font-medium transition-all duration-300 transform hover:scale-[1.02]">
                  Update Profile
                </button>
                <button className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-900 px-8 py-4 rounded-xl font-medium transition-all duration-300">
                  Cancel Changes
                </button>
              </div>
            </motion.div>
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
            <motion.div variants={fadeInUp} className="flex items-center justify-between">
              <h2 className="text-2xl font-light text-slate-900">Order History</h2>
              <div className="text-sm text-slate-500">{orders.length} orders</div>
            </motion.div>
            
            {orders.length > 0 ? (
              <div className="space-y-6">
                {orders.map((order) => (
                  <motion.div 
                    key={order.id}
                    variants={fadeInUp}
                    className="group bg-white rounded-2xl overflow-hidden border border-slate-200 hover:shadow-xl transition-all duration-500"
                  >
                    <div className="p-6 md:p-8">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <h3 className="font-medium text-slate-900">{order.id}</h3>
                            <span className={`px-3 py-1 text-xs rounded-full ${order.status === 'Delivered' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'}`}>
                              {order.status}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-slate-500">
                            <Clock size={14} />
                            <span>{order.date}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <span className="text-xl font-light text-slate-900">{formatPrice(order.total)}</span>
                          <button className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors duration-200 text-slate-900">
                            <span className="text-sm font-medium">View Details</span>
                            <ChevronRight size={16} />
                          </button>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 overflow-x-auto pb-2">
                        {order.items.map((item, index) => (
                          <div key={item.id} className="flex-shrink-0 relative">
                            <div className="w-16 h-16 md:w-20 md:h-20 bg-slate-100 rounded-xl overflow-hidden">
                              <img 
                                src={item.image} 
                                alt={item.name} 
                                className="w-full h-full object-cover"
                              />
                            </div>
                            {index < order.items.length - 1 && (
                              <div className="absolute -right-2 top-1/2 transform -translate-y-1/2 w-1 h-1 bg-slate-300 rounded-full"></div>
                            )}
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
                className="text-center py-16 bg-slate-50 rounded-2xl"
              >
                <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShoppingBag size={24} className="text-slate-400" />
                </div>
                <h3 className="text-xl font-light mb-2 text-slate-900">No orders yet</h3>
                <p className="text-slate-600 mb-6">Start your shopping journey with us</p>
                <button className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300">
                  Explore Products
                </button>
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
            <motion.div variants={fadeInUp} className="flex items-center justify-between">
              <h2 className="text-2xl font-light text-slate-900">Wishlist</h2>
              <div className="text-sm text-slate-500">{wishlist.length} items</div>
            </motion.div>
            
            {wishlist.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {wishlist.map((item) => (
                  <motion.div 
                    key={item.id}
                    variants={fadeInUp}
                    className="group bg-white rounded-2xl overflow-hidden border border-slate-200 hover:shadow-xl transition-all duration-500"
                  >
                    <div className="aspect-square overflow-hidden bg-slate-100 relative">
                      <img 
                        src={item.image} 
                        alt={item.name} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <button className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors duration-200">
                          <Heart size={16} className="text-red-500 fill-red-500" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="p-6">
                      <h3 className="font-medium text-slate-900 mb-2 group-hover:text-slate-700 transition-colors duration-300">
                        {item.name}
                      </h3>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-xl font-light text-slate-900">{formatPrice(item.price)}</span>
                        
                        <button className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-xl font-medium transition-all duration-300 transform hover:scale-105">
                          Add to Cart
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <motion.div 
                variants={fadeIn}
                className="text-center py-16 bg-slate-50 rounded-2xl"
              >
                <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart size={24} className="text-slate-400" />
                </div>
                <h3 className="text-xl font-light mb-2 text-slate-900">Your wishlist is empty</h3>
                <p className="text-slate-600 mb-6">Discover and save items you love</p>
                <button className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300">
                  Explore Products
                </button>
              </motion.div>
            )}
          </motion.div>
        );
        
      case 'settings':
        return (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="space-y-8"
          >
            <motion.div variants={fadeInUp}>
              <h2 className="text-2xl font-light text-slate-900 mb-8">Account Settings</h2>
            </motion.div>
            
            <div className="space-y-6">
              {/* Security */}
              <motion.div variants={fadeInUp} className="bg-white rounded-2xl p-8 border border-slate-200">
                <h3 className="text-xl font-light mb-6 text-slate-900">Security</h3>
                
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">Current Password</label>
                    <input
                      type="password"
                      className="w-full px-4 py-4 bg-slate-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all duration-200"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-slate-700">New Password</label>
                      <input
                        type="password"
                        className="w-full px-4 py-4 bg-slate-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all duration-200"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-slate-700">Confirm Password</label>
                      <input
                        type="password"
                        className="w-full px-4 py-4 bg-slate-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all duration-200"
                      />
                    </div>
                  </div>
                  
                  <button className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-4 rounded-xl font-medium transition-all duration-300 transform hover:scale-[1.02]">
                    Update Password
                  </button>
                </div>
              </motion.div>
              
              {/* Notifications */}
              <motion.div variants={fadeInUp} className="bg-white rounded-2xl p-8 border border-slate-200">
                <h3 className="text-xl font-light mb-6 text-slate-900">Notifications</h3>
                
                <div className="space-y-6">
                  {[
                    { title: 'Order Updates', desc: 'Get notified about your order status' },
                    { title: 'Promotional Offers', desc: 'Receive exclusive offers and updates' },
                    { title: 'New Products', desc: 'Be the first to know about new arrivals' },
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                      <div>
                        <h4 className="font-medium text-slate-900">{item.title}</h4>
                        <p className="text-sm text-slate-600">{item.desc}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked={index < 2} />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-slate-900"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </motion.div>
              
              {/* Danger Zone */}
              <motion.div variants={fadeInUp} className="bg-red-50 rounded-2xl p-8 border border-red-200">
                <h3 className="text-xl font-light mb-6 text-red-900">Danger Zone</h3>
                
                <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-red-200">
                  <div>
                    <h4 className="font-medium text-red-900">Delete Account</h4>
                    <p className="text-sm text-red-600">This action cannot be undone</p>
                  </div>
                  <button className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300">
                    Delete Account
                  </button>
                </div>
              </motion.div>
            </div>
          </motion.div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white border-b border-slate-200 px-4 py-4 sticky top-0 z-50">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-medium text-slate-900">Account</h1>
          <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors duration-200">
            <Bell size={20} className="text-slate-600" />
          </button>
        </div>
      </div>

      <div className="py-8 lg:py-16">
        <div className="container mx-auto px-4 lg:px-8 max-w-7xl">
          {/* Desktop Header */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            className="hidden lg:block mb-12"
          >
            <h1 className="text-4xl lg:text-5xl font-light text-slate-900 tracking-tight mb-4">
              Account
            </h1>
            <p className="text-lg text-slate-600">
              Manage your profile and preferences
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Mobile Navigation */}
            <div className="lg:hidden">
              <div className="bg-white rounded-2xl border border-slate-200 p-2">
                <div className="grid grid-cols-4 gap-1">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-all duration-200 ${
                          activeTab === item.id 
                            ? 'bg-slate-900 text-white' 
                            : 'text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <Icon size={18} />
                        <span className="text-xs font-medium">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Desktop Sidebar Navigation */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeIn}
              className="hidden lg:block lg:col-span-1"
            >
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden sticky top-24">
                <nav className="p-2">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={`w-full flex items-center gap-3 p-4 rounded-xl mb-1 text-left transition-all duration-200 ${
                          activeTab === item.id 
                            ? 'bg-slate-900 text-white' 
                            : 'text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <Icon size={18} />
                        <span className="font-medium">{item.label}</span>
                      </button>
                    );
                  })}
                  
                  <div className="border-t border-slate-200 mt-4 pt-4">
                    <button className="w-full flex items-center gap-3 p-4 rounded-xl text-left text-slate-600 hover:bg-slate-100 transition-all duration-200">
                      <LogOut size={18} />
                      <span className="font-medium">Sign Out</span>
                    </button>
                  </div>
                </nav>
              </div>
            </motion.div>

            {/* Main Content */}
            <div className="lg:col-span-4">
              <div className="bg-white rounded-2xl border border-slate-200 p-6 lg:p-8 min-h-[600px]">
                {renderTabContent()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountPage;