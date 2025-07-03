import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import {
  Save,
  Store,
  Mail,
  Phone,
  Globe,
  DollarSign,
  Truck,
  CreditCard,
  Users,
  Lock,
  Plus,
  Trash,
  Edit,
  Check,
  X
} from 'lucide-react';

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [adminUsers, setAdminUsers] = useState([
    {
      id: 1,
      name: 'Admin User',
      email: 'admin@scenture.com',
      role: 'Administrator',
      lastLogin: '2023-05-15 10:30 AM',
    },
    {
      id: 2,
      name: 'Sarah Johnson',
      email: 'sarah@scenture.com',
      role: 'Manager',
      lastLogin: '2023-05-14 03:45 PM',
    },
    {
      id: 3,
      name: 'Michael Adebayo',
      email: 'michael@scenture.com',
      role: 'Editor',
      lastLogin: '2023-05-10 09:15 AM',
    },
  ]);
  
  const [shippingZones, setShippingZones] = useState([
    {
      id: 1,
      name: 'Lagos - Same Day',
      locations: ['Lagos Island', 'Victoria Island', 'Ikoyi'],
      rate: 1500,
      estimatedDelivery: '1 day',
    },
    {
      id: 2,
      name: 'Lagos - Standard',
      locations: ['Lagos Mainland'],
      rate: 2000,
      estimatedDelivery: '1-2 days',
    },
    {
      id: 3,
      name: 'Other States',
      locations: ['All other states in Nigeria'],
      rate: 3500,
      estimatedDelivery: '3-5 days',
    },
    {
      id: 4,
      name: 'International',
      locations: ['Outside Nigeria'],
      rate: 15000,
      estimatedDelivery: '7-14 days',
    },
  ]);
  
  const [paymentMethods, setPaymentMethods] = useState([
    {
      id: 1,
      name: 'Credit/Debit Card',
      provider: 'Paystack',
      enabled: true,
    },
    {
      id: 2,
      name: 'Bank Transfer',
      provider: 'Manual',
      enabled: true,
    },
    {
      id: 3,
      name: 'Cash on Delivery',
      provider: 'Manual',
      enabled: false,
    },
  ]);

  const [editingUser, setEditingUser] = useState(null);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'Editor',
    password: '',
  });
  const [showAddUserForm, setShowAddUserForm] = useState(false);

  const handleSaveGeneralSettings = () => {
    // In a real app, you would save the settings to an API
    console.log('Saving general settings...');
  };

  const handleSaveShippingSettings = () => {
    // In a real app, you would save the settings to an API
    console.log('Saving shipping settings...');
  };

  const handleSavePaymentSettings = () => {
    // In a real app, you would save the settings to an API
    console.log('Saving payment settings...');
  };

  const togglePaymentMethod = (id) => {
    setPaymentMethods(prev => 
      prev.map(method => 
        method.id === id ? { ...method, enabled: !method.enabled } : method
      )
    );
  };

  const handleAddUser = () => {
    // In a real app, you would add the user via an API
    if (newUser.name && newUser.email && newUser.password) {
      setAdminUsers(prev => [
        ...prev,
        {
          id: prev.length + 1,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          lastLogin: 'Never',
        },
      ]);
      setNewUser({
        name: '',
        email: '',
        role: 'Editor',
        password: '',
      });
      setShowAddUserForm(false);
    }
  };

  const handleEditUser = (user) => {
    setEditingUser({
      ...user,
      password: '',
    });
  };

  const handleUpdateUser = () => {
    // In a real app, you would update the user via an API
    if (editingUser && editingUser.name && editingUser.email) {
      setAdminUsers(prev => 
        prev.map(user => 
          user.id === editingUser.id ? { ...user, name: editingUser.name, email: editingUser.email, role: editingUser.role } : user
        )
      );
      setEditingUser(null);
    }
  };

  const handleDeleteUser = (id) => {
    // In a real app, you would delete the user via an API
    setAdminUsers(prev => prev.filter(user => user.id !== id));
  };

  return (
    <>
      <Helmet>
        <title>Settings | Scenture Lagos Admin</title>
      </Helmet>
      
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-heading font-medium text-secondary">Settings</h1>
          <p className="text-secondary/70 mt-1">Manage your store settings</p>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Settings Navigation */}
          <div className="md:w-64">
            <Card>
              <CardContent className="p-0">
                <nav className="flex flex-col">
                  <button
                    onClick={() => setActiveTab('general')}
                    className={`flex items-center px-4 py-3 text-sm ${activeTab === 'general' ? 'bg-primary/5 text-primary border-l-2 border-primary' : 'text-secondary hover:bg-slate-50'}`}
                  >
                    <Store size={16} className="mr-2" />
                    General
                  </button>
                  <button
                    onClick={() => setActiveTab('shipping')}
                    className={`flex items-center px-4 py-3 text-sm ${activeTab === 'shipping' ? 'bg-primary/5 text-primary border-l-2 border-primary' : 'text-secondary hover:bg-slate-50'}`}
                  >
                    <Truck size={16} className="mr-2" />
                    Shipping
                  </button>
                  <button
                    onClick={() => setActiveTab('payment')}
                    className={`flex items-center px-4 py-3 text-sm ${activeTab === 'payment' ? 'bg-primary/5 text-primary border-l-2 border-primary' : 'text-secondary hover:bg-slate-50'}`}
                  >
                    <CreditCard size={16} className="mr-2" />
                    Payment
                  </button>
                  <button
                    onClick={() => setActiveTab('users')}
                    className={`flex items-center px-4 py-3 text-sm ${activeTab === 'users' ? 'bg-primary/5 text-primary border-l-2 border-primary' : 'text-secondary hover:bg-slate-50'}`}
                  >
                    <Users size={16} className="mr-2" />
                    Admin Users
                  </button>
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Settings Content */}
          <div className="flex-1">
            {/* General Settings */}
            {activeTab === 'general' && (
              <Card>
                <CardHeader>
                  <CardTitle>General Settings</CardTitle>
                  <CardDescription>Basic store information and preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Store Information</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="store-name" className="block text-sm font-medium text-secondary mb-1">
                          Store Name
                        </label>
                        <input
                          id="store-name"
                          type="text"
                          defaultValue="Scenture Lagos"
                          className="w-full px-4 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="contact-email" className="block text-sm font-medium text-secondary mb-1">
                          Contact Email
                        </label>
                        <input
                          id="contact-email"
                          type="email"
                          defaultValue="hello@scenture.com"
                          className="w-full px-4 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="contact-phone" className="block text-sm font-medium text-secondary mb-1">
                          Contact Phone
                        </label>
                        <input
                          id="contact-phone"
                          type="text"
                          defaultValue="+234 812 345 6789"
                          className="w-full px-4 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="website" className="block text-sm font-medium text-secondary mb-1">
                          Website URL
                        </label>
                        <input
                          id="website"
                          type="text"
                          defaultValue="https://scenture.com"
                          className="w-full px-4 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Regional Settings</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="currency" className="block text-sm font-medium text-secondary mb-1">
                          Currency
                        </label>
                        <select
                          id="currency"
                          defaultValue="NGN"
                          className="w-full px-4 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 bg-white"
                        >
                          <option value="NGN">Nigerian Naira (₦)</option>
                          <option value="USD">US Dollar ($)</option>
                          <option value="EUR">Euro (€)</option>
                          <option value="GBP">British Pound (£)</option>
                        </select>
                      </div>
                      
                      <div>
                        <label htmlFor="timezone" className="block text-sm font-medium text-secondary mb-1">
                          Timezone
                        </label>
                        <select
                          id="timezone"
                          defaultValue="Africa/Lagos"
                          className="w-full px-4 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 bg-white"
                        >
                          <option value="Africa/Lagos">Africa/Lagos (GMT+1)</option>
                          <option value="Europe/London">Europe/London (GMT+0)</option>
                          <option value="America/New_York">America/New_York (GMT-5)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Order Settings</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="order-prefix" className="block text-sm font-medium text-secondary mb-1">
                          Order Number Prefix
                        </label>
                        <input
                          id="order-prefix"
                          type="text"
                          defaultValue="ORD-"
                          className="w-full px-4 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="invoice-prefix" className="block text-sm font-medium text-secondary mb-1">
                          Invoice Number Prefix
                        </label>
                        <input
                          id="invoice-prefix"
                          type="text"
                          defaultValue="INV-"
                          className="w-full px-4 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                        />
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        id="send-order-confirmation"
                        type="checkbox"
                        defaultChecked
                        className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary/50"
                      />
                      <label htmlFor="send-order-confirmation" className="ml-2 block text-sm text-secondary">
                        Send order confirmation emails to customers
                      </label>
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        id="send-admin-notification"
                        type="checkbox"
                        defaultChecked
                        className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary/50"
                      />
                      <label htmlFor="send-admin-notification" className="ml-2 block text-sm text-secondary">
                        Send new order notifications to admin
                      </label>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button onClick={handleSaveGeneralSettings} className="flex items-center">
                    <Save size={16} className="mr-2" />
                    Save Changes
                  </Button>
                </CardFooter>
              </Card>
            )}

            {/* Shipping Settings */}
            {activeTab === 'shipping' && (
              <Card>
                <CardHeader>
                  <CardTitle>Shipping Settings</CardTitle>
                  <CardDescription>Manage shipping zones and delivery options</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium">Shipping Zones</h3>
                      <Button variant="outline" size="sm" className="flex items-center">
                        <Plus size={16} className="mr-2" />
                        Add Zone
                      </Button>
                    </div>
                    
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-slate-200">
                            <th className="text-left font-medium p-3 pl-0">Zone Name</th>
                            <th className="text-left font-medium p-3">Locations</th>
                            <th className="text-right font-medium p-3">Rate</th>
                            <th className="text-left font-medium p-3">Delivery Time</th>
                            <th className="text-right font-medium p-3 pr-0">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {shippingZones.map((zone) => (
                            <tr key={zone.id} className="border-b border-slate-100">
                              <td className="p-3 pl-0 font-medium">{zone.name}</td>
                              <td className="p-3">
                                <div className="max-w-xs truncate">{zone.locations.join(', ')}</div>
                              </td>
                              <td className="p-3 text-right">₦{zone.rate.toLocaleString()}</td>
                              <td className="p-3">{zone.estimatedDelivery}</td>
                              <td className="p-3 pr-0 text-right">
                                <div className="flex items-center justify-end space-x-2">
                                  <Button variant="ghost" size="sm">
                                    <Edit size={16} />
                                  </Button>
                                  <Button variant="ghost" size="sm">
                                    <Trash size={16} className="text-red-500" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Shipping Options</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="free-shipping-threshold" className="block text-sm font-medium text-secondary mb-1">
                          Free Shipping Threshold
                        </label>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">₦</span>
                          <input
                            id="free-shipping-threshold"
                            type="text"
                            defaultValue="25000"
                            className="w-full pl-8 pr-4 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                          />
                        </div>
                        <p className="text-xs text-slate-500 mt-1">Orders above this amount qualify for free shipping</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        id="enable-free-shipping"
                        type="checkbox"
                        defaultChecked
                        className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary/50"
                      />
                      <label htmlFor="enable-free-shipping" className="ml-2 block text-sm text-secondary">
                        Enable free shipping for orders above threshold
                      </label>
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        id="enable-local-pickup"
                        type="checkbox"
                        defaultChecked
                        className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary/50"
                      />
                      <label htmlFor="enable-local-pickup" className="ml-2 block text-sm text-secondary">
                        Enable local pickup option
                      </label>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button onClick={handleSaveShippingSettings} className="flex items-center">
                    <Save size={16} className="mr-2" />
                    Save Changes
                  </Button>
                </CardFooter>
              </Card>
            )}

            {/* Payment Settings */}
            {activeTab === 'payment' && (
              <Card>
                <CardHeader>
                  <CardTitle>Payment Settings</CardTitle>
                  <CardDescription>Configure payment gateways and options</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Payment Methods</h3>
                    
                    <div className="space-y-4">
                      {paymentMethods.map((method) => (
                        <div key={method.id} className="border border-slate-200 rounded-md p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium">{method.name}</h4>
                              <p className="text-sm text-slate-500">Provider: {method.provider}</p>
                            </div>
                            <div className="flex items-center">
                              <span className="mr-3 text-sm">
                                {method.enabled ? (
                                  <span className="text-green-600">Enabled</span>
                                ) : (
                                  <span className="text-slate-500">Disabled</span>
                                )}
                              </span>
                              <button
                                onClick={() => togglePaymentMethod(method.id)}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full ${method.enabled ? 'bg-primary' : 'bg-slate-200'}`}
                              >
                                <span
                                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${method.enabled ? 'translate-x-6' : 'translate-x-1'}`}
                                />
                              </button>
                            </div>
                          </div>
                          
                          {method.provider === 'Paystack' && method.enabled && (
                            <div className="mt-4 pt-4 border-t border-slate-100">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-sm font-medium text-secondary mb-1">
                                    Public Key
                                  </label>
                                  <input
                                    type="text"
                                    defaultValue="pk_test_***********************"
                                    className="w-full px-4 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-secondary mb-1">
                                    Secret Key
                                  </label>
                                  <input
                                    type="password"
                                    defaultValue="sk_test_***********************"
                                    className="w-full px-4 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                                  />
                                </div>
                              </div>
                            </div>
                          )}
                          
                          {method.provider === 'Manual' && method.enabled && method.name === 'Bank Transfer' && (
                            <div className="mt-4 pt-4 border-t border-slate-100">
                              <div className="space-y-4">
                                <div>
                                  <label className="block text-sm font-medium text-secondary mb-1">
                                    Bank Name
                                  </label>
                                  <input
                                    type="text"
                                    defaultValue="First Bank of Nigeria"
                                    className="w-full px-4 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-secondary mb-1">
                                    Account Number
                                  </label>
                                  <input
                                    type="text"
                                    defaultValue="1234567890"
                                    className="w-full px-4 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-secondary mb-1">
                                    Account Name
                                  </label>
                                  <input
                                    type="text"
                                    defaultValue="Scenture Lagos Limited"
                                    className="w-full px-4 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                                  />
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Currency Options</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="currency-format" className="block text-sm font-medium text-secondary mb-1">
                          Currency Format
                        </label>
                        <select
                          id="currency-format"
                          defaultValue="symbol"
                          className="w-full px-4 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 bg-white"
                        >
                          <option value="symbol">Symbol (₦)</option>
                          <option value="code">Code (NGN)</option>
                          <option value="name">Name (Naira)</option>
                        </select>
                      </div>
                      
                      <div>
                        <label htmlFor="thousand-separator" className="block text-sm font-medium text-secondary mb-1">
                          Thousand Separator
                        </label>
                        <select
                          id="thousand-separator"
                          defaultValue="comma"
                          className="w-full px-4 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 bg-white"
                        >
                          <option value="comma">Comma (,)</option>
                          <option value="period">Period (.)</option>
                          <option value="space">Space ( )</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button onClick={handleSavePaymentSettings} className="flex items-center">
                    <Save size={16} className="mr-2" />
                    Save Changes
                  </Button>
                </CardFooter>
              </Card>
            )}

            {/* Admin Users Settings */}
            {activeTab === 'users' && (
              <Card>
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <CardTitle>Admin Users</CardTitle>
                      <CardDescription>Manage administrator accounts and permissions</CardDescription>
                    </div>
                    <Button 
                      variant="default" 
                      className="flex items-center"
                      onClick={() => setShowAddUserForm(true)}
                    >
                      <Plus size={16} className="mr-2" />
                      Add User
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {showAddUserForm && (
                    <div className="mb-6 p-4 border border-slate-200 rounded-md bg-slate-50">
                      <h3 className="text-lg font-medium mb-4">Add New User</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-secondary mb-1">
                            Name
                          </label>
                          <input
                            type="text"
                            value={newUser.name}
                            onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                            className="w-full px-4 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-secondary mb-1">
                            Email
                          </label>
                          <input
                            type="email"
                            value={newUser.email}
                            onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                            className="w-full px-4 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-secondary mb-1">
                            Role
                          </label>
                          <select
                            value={newUser.role}
                            onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                            className="w-full px-4 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 bg-white"
                          >
                            <option value="Administrator">Administrator</option>
                            <option value="Manager">Manager</option>
                            <option value="Editor">Editor</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-secondary mb-1">
                            Password
                          </label>
                          <input
                            type="password"
                            value={newUser.password}
                            onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                            className="w-full px-4 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end mt-4 space-x-3">
                        <Button variant="outline" onClick={() => setShowAddUserForm(false)}>
                          Cancel
                        </Button>
                        <Button 
                          variant="default" 
                          onClick={handleAddUser}
                          disabled={!newUser.name || !newUser.email || !newUser.password}
                        >
                          Add User
                        </Button>
                      </div>
                    </div>
                  )}

                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-200">
                          <th className="text-left font-medium p-3 pl-0">Name</th>
                          <th className="text-left font-medium p-3">Email</th>
                          <th className="text-left font-medium p-3">Role</th>
                          <th className="text-left font-medium p-3">Last Login</th>
                          <th className="text-right font-medium p-3 pr-0">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {adminUsers.map((user) => (
                          <tr key={user.id} className="border-b border-slate-100">
                            <td className="p-3 pl-0 font-medium">{user.name}</td>
                            <td className="p-3">{user.email}</td>
                            <td className="p-3">
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                user.role === 'Administrator' ? 'bg-purple-100 text-purple-800' :
                                user.role === 'Manager' ? 'bg-blue-100 text-blue-800' :
                                'bg-slate-100 text-slate-800'
                              }`}>
                                {user.role}
                              </span>
                            </td>
                            <td className="p-3">{user.lastLogin}</td>
                            <td className="p-3 pr-0 text-right">
                              <div className="flex items-center justify-end space-x-2">
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => handleEditUser(user)}
                                >
                                  <Edit size={16} />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => handleDeleteUser(user.id)}
                                  disabled={user.id === 1} // Prevent deleting the main admin
                                >
                                  <Trash size={16} className={user.id === 1 ? 'text-slate-300' : 'text-red-500'} />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Edit User Modal */}
                  {editingUser && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                      <div className="bg-white rounded-lg shadow-lg w-full max-w-md mx-4">
                        <div className="p-6">
                          <h3 className="text-xl font-heading font-medium text-secondary mb-4">
                            Edit User
                          </h3>
                          
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-secondary mb-1">
                                Name
                              </label>
                              <input
                                type="text"
                                value={editingUser.name}
                                onChange={(e) => setEditingUser({...editingUser, name: e.target.value})}
                                className="w-full px-4 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                              />
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium text-secondary mb-1">
                                Email
                              </label>
                              <input
                                type="email"
                                value={editingUser.email}
                                onChange={(e) => setEditingUser({...editingUser, email: e.target.value})}
                                className="w-full px-4 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                              />
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium text-secondary mb-1">
                                Role
                              </label>
                              <select
                                value={editingUser.role}
                                onChange={(e) => setEditingUser({...editingUser, role: e.target.value})}
                                className="w-full px-4 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 bg-white"
                                disabled={editingUser.id === 1} // Prevent changing main admin role
                              >
                                <option value="Administrator">Administrator</option>
                                <option value="Manager">Manager</option>
                                <option value="Editor">Editor</option>
                              </select>
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium text-secondary mb-1">
                                New Password (leave blank to keep current)
                              </label>
                              <input
                                type="password"
                                value={editingUser.password}
                                onChange={(e) => setEditingUser({...editingUser, password: e.target.value})}
                                className="w-full px-4 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                              />
                            </div>
                          </div>
                          
                          <div className="flex justify-end mt-6 space-x-3">
                            <Button variant="outline" onClick={() => setEditingUser(null)}>
                              Cancel
                            </Button>
                            <Button
                              variant="default"
                              onClick={handleUpdateUser}
                              disabled={!editingUser.name || !editingUser.email}
                            >
                              Update User
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default SettingsPage;