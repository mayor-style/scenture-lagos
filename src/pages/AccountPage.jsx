import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Package, Heart, Settings, LogOut, Edit, MapPin, Shield, CreditCard } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

// --- ACCOUNT DATA HOOK ---
const useAccountData = () => {
  const { currentUser, loading, logout, updateDetails } = useAuth();
  const navigate = useNavigate();
  
  // Default placeholder data
  const [orders] = React.useState([
    { id: 'ORD-2025-1234', date: 'July 15, 2025', status: 'Processing', total: 110.00, items: [{ id: '1', image: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?ixlib=rb-4.0.3&w=200' }, { id: '4', image: 'https://images.unsplash.com/photo-1596435163709-b374d6578397?ixlib=rb-4.0.3&w=200' }] },
    { id: 'ORD-2025-0987', date: 'April 3, 2025', status: 'Delivered', total: 45.00, items: [{ id: '2', image: 'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?ixlib=rb-4.0.3&w=200' }] },
  ]);
  
  const [wishlist] = React.useState([
    { id: '3', name: 'Midnight Jasmine Candle', price: 28.00, image: 'https://images.unsplash.com/photo-1547887538-e3a2f32cb1cc?ixlib=rb-4.0.3&w=400' },
    { id: '6', name: 'Rose Garden Diffuser', price: 35.00, image: 'https://images.unsplash.com/photo-1602910344008-22f323cc1817?ixlib=rb-4.0.3&w=400' },
  ]);
  
  // Format user data from currentUser
  const user = currentUser ? {
    name: currentUser.name || 'User',
    email: currentUser.email,
    avatar: currentUser.avatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(currentUser.name || 'User'),
    joined: new Date(currentUser.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' }),
    location: currentUser.location || 'Not specified',
    memberTier: currentUser.role === 'admin' ? 'Admin' : 'Customer'
  } : null;
  
  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };
  
  // Handle profile update
  const handleUpdateProfile = async (updatedData) => {
    try {
      await updateDetails(updatedData);
      return true;
    } catch (error) {
      console.error('Profile update failed:', error);
      return false;
    }
  };
  
  return { 
    user, 
    orders, 
    wishlist, 
    loading, 
    handleLogout,
    handleUpdateProfile
  };
};

const formatPrice = (price) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price);

// --- NAVIGATION ---
const navItems = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'orders', label: 'My Orders', icon: Package },
  { id: 'wishlist', label: 'Wishlist', icon: Heart },
  { id: 'settings', label: 'Settings', icon: Settings },
];

const AccountSidebar = React.memo(({ activeTab, setActiveTab, handleLogout }) => (
  <div className="bg-white rounded-2xl border border-slate-200/70 p-2 lg:sticky lg:top-24">
    <nav className="flex lg:flex-col gap-1">
      {navItems.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          onClick={() => setActiveTab(id)}
          className={`group flex items-center w-full text-left gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200 relative ${
            activeTab === id ? 'text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          {activeTab === id && (
            <motion.div
              layoutId="active-nav-indicator"
              className="absolute inset-0 bg-slate-900 rounded-lg z-0"
              initial={false}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            />
          )}
          <Icon className="h-5 w-5 flex-shrink-0 z-10" />
          <span className="hidden lg:inline z-10">{label}</span>
        </button>
      ))}
      <div className="border-t border-slate-200/70 my-1 hidden lg:block"></div>
      <button 
        onClick={handleLogout}
        className="group flex items-center w-full text-left gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors duration-200"
      >
        <LogOut className="h-5 w-5 flex-shrink-0" />
        <span className="hidden lg:inline">Sign Out</span>
      </button>
    </nav>
  </div>
));


// --- TAB CONTENT COMPONENTS ---
const ProfileTab = React.memo(({ user, orders, wishlist, handleUpdateProfile }) => {
    const [formData, setFormData] = React.useState({
        name: user.name,
        email: user.email
    });
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [updateSuccess, setUpdateSuccess] = React.useState(false);
    
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setUpdateSuccess(false);
        
        try {
            const success = await handleUpdateProfile(formData);
            if (success) {
                setUpdateSuccess(true);
                setTimeout(() => setUpdateSuccess(false), 3000);
            }
        } finally {
            setIsSubmitting(false);
        }
    };
    const stats = [
        { label: "Total Orders", value: orders.length, icon: Package },
        { label: "Wishlist Items", value: wishlist.length, icon: Heart },
        { label: "Total Spent", value: formatPrice(orders.reduce((sum, o) => sum + o.total, 0)), icon: CreditCard },
        { label: "Member Tier", value: user.memberTier, icon: Shield },
    ];
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="relative flex-shrink-0">
                    <img src={user.avatar} alt={user.name} className="w-24 h-24 rounded-full object-cover ring-4 ring-white shadow-md" />
                    <button className="absolute -bottom-1 -right-1 w-8 h-8 bg-white rounded-full flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors shadow-sm border border-slate-200/80">
                        <Edit size={14} />
                    </button>
                </div>
                <div>
                    <h2 className="text-3xl font-bold text-slate-800">{user.name}</h2>
                    <p className="text-slate-500">{user.email}</p>
                    <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
                        <MapPin size={14} />
                        <span>{user.location}</span>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {stats.map(({label, value, icon: Icon}) => (
                     <div key={label} className="bg-slate-50/80 rounded-xl p-4 border border-slate-200/60">
                         <div className="flex items-center justify-between text-slate-500 mb-1">
                             <p className="text-xs font-medium uppercase tracking-wider">{label}</p>
                             <Icon size={16} />
                         </div>
                         <p className="text-2xl font-semibold text-slate-800">{value}</p>
                     </div>
                ))}
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
                <h3 className="text-xl font-semibold text-slate-700">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-slate-600 mb-1">Full Name</label>
                        <input 
                            type="text" 
                            id="name"
                            name="name"
                            value={formData.name} 
                            onChange={handleChange}
                            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-800 transition"
                        />
                    </div>
                     <div>
                        <label htmlFor="email" className="block text-sm font-medium text-slate-600 mb-1">Email Address</label>
                        <input 
                            type="email" 
                            id="email"
                            name="email"
                            value={formData.email} 
                            onChange={handleChange}
                            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-800 transition"
                        />
                    </div>
                </div>
                <div className="pt-4 flex justify-between items-center">
                    {updateSuccess && (
                        <p className="text-sm text-emerald-600 font-medium">Profile updated successfully!</p>
                    )}
                    <div className="ml-auto">
                        <button 
                            type="submit" 
                            disabled={isSubmitting}
                            className="bg-slate-900 text-white font-medium px-5 py-2.5 rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-70"
                        >
                            {isSubmitting ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </div>
            </form>
        </motion.div>
    );
});

const OrdersTab = React.memo(({ orders }) => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
        <h2 className="text-2xl font-bold text-slate-800">My Orders</h2>
        {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-xl border border-slate-200/70 p-5 hover:shadow-md hover:border-slate-300 transition-all duration-300">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 mb-4">
                    <div>
                        <h3 className="font-semibold text-slate-800">{order.id}</h3>
                        <p className="text-sm text-slate-500">Ordered on: {order.date}</p>
                    </div>
                    <div className="flex items-center gap-4">
                         <span className={`px-3 py-1 text-xs font-semibold rounded-full ${order.status === 'Delivered' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'}`}>{order.status}</span>
                         <span className="font-semibold text-slate-800 text-lg">{formatPrice(order.total)}</span>
                    </div>
                </div>
                 <div className="flex items-center gap-3 border-t border-slate-200/70 pt-4">
                    <div className="flex -space-x-4">
                        {order.items.map(item => <img key={item.id} src={item.image} alt="" className="w-12 h-12 rounded-full object-cover bg-slate-100 ring-2 ring-white"/>)}
                    </div>
                    <button className="ml-auto text-sm font-medium text-slate-700 hover:text-slate-900">View Details</button>
                 </div>
            </div>
        ))}
    </motion.div>
));

// ... WishlistTab and SettingsTab would be similar ...

// --- MAIN PAGE COMPONENT ---
const AccountPage = () => {
  const [activeTab, setActiveTab] = React.useState('profile');
  const { user, orders, wishlist, loading, handleLogout, handleUpdateProfile } = useAccountData();

  const renderContent = () => {
    switch (activeTab) {
      case 'profile': return <ProfileTab user={user} orders={orders} wishlist={wishlist} handleUpdateProfile={handleUpdateProfile} />;
      case 'orders': return <OrdersTab orders={orders} />;
      // Placeholder for other tabs
      case 'wishlist': return <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}><h2 className="text-2xl font-bold text-slate-800">My Wishlist</h2><p className="text-slate-500 mt-2">Coming Soon!</p></motion.div>;
      case 'settings': return <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}><h2 className="text-2xl font-bold text-slate-800">Account Settings</h2><p className="text-slate-500 mt-2">Coming Soon!</p></motion.div>;
      default: return null;
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto max-w-7xl px-4 py-8 sm:py-12">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">My Account</h1>
          <p className="mt-1 text-lg text-slate-600">Welcome back, {user.name.split(' ')[0]}! Manage your profile and preferences here.</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mt-8">
          {/* Sidebar */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-1">
            <AccountSidebar activeTab={activeTab} setActiveTab={setActiveTab} handleLogout={handleLogout} />
          </motion.div>

          {/* Main Content */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="lg:col-span-3">
             <div className="bg-white rounded-2xl border border-slate-200/70 p-6 md:p-8 min-h-[500px]">
                <AnimatePresence mode="wait">
                    <React.Fragment key={activeTab}>
                        {renderContent()}
                    </React.Fragment>
                </AnimatePresence>
             </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AccountPage;