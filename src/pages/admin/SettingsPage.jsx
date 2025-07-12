import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { LoadingOverlay } from '../../components/ui/LoadingState';
import { useToast } from '../../components/Toast'; // Import custom toast
import SettingsService from '../../services/admin/settings.service';
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
  Plus,
  Trash,
  Edit,
  Check,
  X,
} from 'lucide-react';

const SettingsPage = () => {
  const { addToast } = useToast(); // Initialize custom toast
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState({
    storeName: 'Scenture Lagos',
    storeEmail: 'hello@scenture.com',
    storePhone: '+234 812 345 6789',
    website: 'https://scenture.com',
    currency: 'NGN',
    timezone: 'Africa/Lagos',
    orderPrefix: 'ORD-',
    invoicePrefix: 'INV-',
    sendOrderConfirmation: true,
    sendAdminNotification: true,
    lowStockThreshold: 5,
    shippingZones: [],
    paymentMethods: [],
  });
  const [adminUsers, setAdminUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'Editor',
    password: '',
  });
  const [showAddUserForm, setShowAddUserForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [settingsData, usersData] = await Promise.all([
          SettingsService.getStoreSettings(),
          SettingsService.getAdminUsers(),
        ]);
        console.log('settingsData:', settingsData);
        console.log('usersData:', usersData);
        setSettings({
          storeName: settingsData?.storeName || 'Scenture Lagos',
          storeEmail: settingsData?.storeEmail || 'hello@scenture.com',
          storePhone: settingsData?.storePhone || '',
          website: settingsData?.socialMedia?.website || 'https://scenture.com',
          currency: settingsData?.currency?.code || 'NGN',
          timezone: settingsData?.timezone || 'Africa/Lagos',
          orderPrefix: settingsData?.orderPrefix || 'ORD-',
          invoicePrefix: settingsData?.invoicePrefix || 'INV-',
          sendOrderConfirmation: settingsData?.emailNotifications?.orderConfirmation ?? true,
          sendAdminNotification: settingsData?.emailNotifications?.orderStatusUpdate ?? true,
          lowStockThreshold: settingsData?.lowStockThreshold || 5,
          shippingZones: settingsData?.shipping?.zones || [],
          paymentMethods: settingsData?.payment?.methods?.map(method => ({
            id: method._id,
            name: method.displayName,
            provider: method.name,
            enabled: method.active,
            config: method.config,
          })) || [],
        });
        setAdminUsers(usersData?.users || []);
      } catch (err) {
        console.error('Error fetching settings:', err);
        const errorMessage = err.response?.data?.error || err.message || 'Failed to load settings';
        setError(errorMessage);
        addToast(errorMessage, 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSaveGeneralSettings = async () => {
    setSaving(true);
    try {
      await SettingsService.updateStoreSettings({
        storeName: settings.storeName,
        storeEmail: settings.storeEmail,
        storePhone: settings.storePhone,
        socialMedia: { website: settings.website },
        currency: { code: settings.currency },
        emailNotifications: {
          orderConfirmation: settings.sendOrderConfirmation,
          orderStatusUpdate: settings.sendAdminNotification,
        },
        lowStockThreshold: parseInt(settings.lowStockThreshold),
        orderPrefix: settings.orderPrefix,
        invoicePrefix: settings.invoicePrefix,
      });
      addToast('Settings updated successfully', 'success');
    } catch (err) {
      console.error('Error saving settings:', err);
      addToast(err.response?.data?.error || 'Failed to save settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveShippingSettings = async () => {
    setSaving(true);
    try {
      await SettingsService.updateStoreSettings({
        shipping: { zones: settings.shippingZones },
      });
      addToast('Shipping settings updated successfully', 'success');
    } catch (err) {
      console.error('Error saving shipping settings:', err);
      addToast(err.response?.data?.error || 'Failed to save shipping settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleSavePaymentSettings = async () => {
    setSaving(true);
    try {
      await SettingsService.updateStoreSettings({
        payment: {
          methods: settings.paymentMethods.map(method => ({
            _id: method.id,
            name: method.provider,
            displayName: method.name,
            active: method.enabled,
            config: method.config,
          })),
        },
      });
      addToast('Payment settings updated successfully', 'success');
    } catch (err) {
      console.error('Error saving payment settings:', err);
      addToast(err.response?.data?.error || 'Failed to save payment settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  const togglePaymentMethod = (id) => {
    setSettings(prev => ({
      ...prev,
      paymentMethods: prev.paymentMethods.map(method =>
        method.id === id ? { ...method, enabled: !method.enabled } : method
      ),
    }));
  };

  const handleAddUser = async () => {
    if (!newUser.name || !newUser.email || !newUser.password) {
      addToast('Please fill all required fields', 'error');
      return;
    }
    setSaving(true);
    try {
      const [firstName, ...lastNameParts] = newUser.name.split(' ');
      const lastName = lastNameParts.join(' ') || 'User';
      const userData = {
        firstName,
        lastName,
        email: newUser.email,
        password: newUser.password,
        role: newUser.role.toLowerCase() === 'editor' ? 'admin' : 'superadmin',
      };
      const response = await SettingsService.createAdminUser(userData);
      setAdminUsers(prev => [...prev, response.user]);
      setNewUser({ name: '', email: '', role: 'Editor', password: '' });
      setShowAddUserForm(false);
      addToast('User added successfully', 'success');
    } catch (err) {
      console.error('Error adding user:', err);
      addToast(err.response?.data?.error || 'Failed to add user', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleEditUser = (user) => {
    setEditingUser({
      id: user._id,
      name: `${user.firstName} ${user.lastName || ''}`.trim(),
      email: user.email,
      role: user.role === 'superadmin' ? 'Administrator' : 'Editor',
      password: '',
    });
  };

  const handleUpdateUser = async () => {
    if (!editingUser.name || !editingUser.email) {
      addToast('Please fill all required fields', 'error');
      return;
    }
    setSaving(true);
    try {
      const [firstName, ...lastNameParts] = editingUser.name.split(' ');
      const lastName = lastNameParts.join(' ') || 'User';
      const userData = {
        firstName,
        lastName,
        email: editingUser.email,
        role: editingUser.role.toLowerCase() === 'editor' ? 'admin' : 'superadmin',
        ...(editingUser.password && { password: editingUser.password }),
      };
      const response = await SettingsService.updateAdminUser(editingUser.id, userData);
      setAdminUsers(prev =>
        prev.map(user => (user.id === editingUser.id ? response.user : user))
      );
      setEditingUser(null);
      addToast('User updated successfully', 'success');
    } catch (err) {
      console.error('Error updating user:', err);
      addToast(err.response?.data?.error || 'Failed to update user', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteUser = async (id) => {
    setSaving(true);
    try {
      await SettingsService.deleteAdminUser(id);
      setAdminUsers(prev => prev.filter(user => user.id !== id));
      addToast('User deleted successfully', 'success');
    } catch (err) {
      console.error('Error deleting user:', err);
      addToast(err.response?.data?.error || 'Failed to delete user', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Settings | Scenture Lagos Admin</title>
      </Helmet>
      <LoadingOverlay loading={loading}>
        {error ? (
          <div className="text-center text-red-600">{error}</div>
        ) : (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-heading font-medium text-secondary">Settings</h1>
              <p className="text-secondary/70 mt-1">Manage your store settings</p>
            </div>

            <div className="flex flex-col md:flex-row gap-6">
              <div className="md:w-64">
                <Card>
                  <CardContent className="p-0">
                    <nav className="flex flex-col">
                      <button
                        onClick={() => setActiveTab('general')}
                        className={`flex items-center px-4 py-3 text-sm ${
                          activeTab === 'general' ? 'bg-primary/5 text-primary border-l-2 border-primary' : 'text-secondary hover:bg-slate-50'
                        }`}
                      >
                        <Store size={16} className="mr-2" />
                        General
                      </button>
                      <button
                        onClick={() => setActiveTab('shipping')}
                        className={`flex items-center px-4 py-3 text-sm ${
                          activeTab === 'shipping' ? 'bg-primary/5 text-primary border-l-2 border-primary' : 'text-secondary hover:bg-slate-50'
                        }`}
                      >
                        <Truck size={16} className="mr-2" />
                        Shipping
                      </button>
                      <button
                        onClick={() => setActiveTab('payment')}
                        className={`flex items-center px-4 py-3 text-sm ${
                          activeTab === 'payment' ? 'bg-primary/5 text-primary border-l-2 border-primary' : 'text-secondary hover:bg-slate-50'
                        }`}
                      >
                        <CreditCard size={16} className="mr-2" />
                        Payment
                      </button>
                      <button
                        onClick={() => setActiveTab('users')}
                        className={`flex items-center px-4 py-3 text-sm ${
                          activeTab === 'users' ? 'bg-primary/5 text-primary border-l-2 border-primary' : 'text-secondary hover:bg-slate-50'
                        }`}
                      >
                        <Users size={16} className="mr-2" />
                        Admin Users
                      </button>
                    </nav>
                  </CardContent>
                </Card>
              </div>

              <div className="flex-1">
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
                              value={settings.storeName}
                              onChange={e => setSettings({ ...settings, storeName: e.target.value })}
                              className="w-full px-4 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                              aria-label="Store name"
                            />
                          </div>
                          <div>
                            <label htmlFor="contact-email" className="block text-sm font-medium text-secondary mb-1">
                              Contact Email
                            </label>
                            <input
                              id="contact-email"
                              type="email"
                              value={settings.storeEmail}
                              onChange={e => setSettings({ ...settings, storeEmail: e.target.value })}
                              className="w-full px-4 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                              aria-label="Contact email"
                            />
                          </div>
                          <div>
                            <label htmlFor="contact-phone" className="block text-sm font-medium text-secondary mb-1">
                              Contact Phone
                            </label>
                            <input
                              id="contact-phone"
                              type="text"
                              value={settings.storePhone}
                              onChange={e => setSettings({ ...settings, storePhone: e.target.value })}
                              className="w-full px-4 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                              aria-label="Contact phone"
                            />
                          </div>
                          <div>
                            <label htmlFor="website" className="block text-sm font-medium text-secondary mb-1">
                              Website URL
                            </label>
                            <input
                              id="website"
                              type="text"
                              value={settings.website}
                              onChange={e => setSettings({ ...settings, website: e.target.value })}
                              className="w-full px-4 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                              aria-label="Website URL"
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
                              value={settings.currency}
                              onChange={e => setSettings({ ...settings, currency: e.target.value })}
                              className="w-full px-4 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 bg-white"
                              aria-label="Currency"
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
                              value={settings.timezone}
                              onChange={e => setSettings({ ...settings, timezone: e.target.value })}
                              className="w-full px-4 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 bg-white"
                              aria-label="Timezone"
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
                              value={settings.orderPrefix}
                              onChange={e => setSettings({ ...settings, orderPrefix: e.target.value })}
                              className="w-full px-4 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                              aria-label="Order number prefix"
                            />
                          </div>
                          <div>
                            <label htmlFor="invoice-prefix" className="block text-sm font-medium text-secondary mb-1">
                              Invoice Number Prefix
                            </label>
                            <input
                              id="invoice-prefix"
                              type="text"
                              value={settings.invoicePrefix}
                              onChange={e => setSettings({ ...settings, invoicePrefix: e.target.value })}
                              className="w-full px-4 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                              aria-label="Invoice number prefix"
                            />
                          </div>
                          <div>
                            <label htmlFor="low-stock-threshold" className="block text-sm font-medium text-secondary mb-1">
                              Low Stock Threshold
                            </label>
                            <input
                              id="low-stock-threshold"
                              type="number"
                              value={settings.lowStockThreshold}
                              onChange={e => setSettings({ ...settings, lowStockThreshold: parseInt(e.target.value) })}
                              className="w-full px-4 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                              min="0"
                              aria-label="Low stock threshold"
                            />
                            <p className="text-xs text-slate-500 mt-1">
                              Products with stock below this number will trigger low stock alerts
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <input
                            id="send-order-confirmation"
                            type="checkbox"
                            checked={settings.sendOrderConfirmation}
                            onChange={e => setSettings({ ...settings, sendOrderConfirmation: e.target.checked })}
                            className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary/50"
                            aria-label="Send order confirmation emails"
                          />
                          <label htmlFor="send-order-confirmation" className="ml-2 block text-sm text-secondary">
                            Send order confirmation emails to customers
                          </label>
                        </div>
                        <div className="flex items-center">
                          <input
                            id="send-admin-notification"
                            type="checkbox"
                            checked={settings.sendAdminNotification}
                            onChange={e => setSettings({ ...settings, sendAdminNotification: e.target.checked })}
                            className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary/50"
                            aria-label="Send admin notifications"
                          />
                          <label htmlFor="send-admin-notification" className="ml-2 block text-sm text-secondary">
                            Send new order notifications to admin
                          </label>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-end">
                      <Button onClick={handleSaveGeneralSettings} disabled={saving} className="flex items-center">
                        {saving ? (
                          <span className="animate-spin mr-2">⟳</span>
                        ) : (
                          <Save size={16} className="mr-2" />
                        )}
                        {saving ? 'Saving...' : 'Save Changes'}
                      </Button>
                    </CardFooter>
                  </Card>
                )}

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
                              {settings.shippingZones.map(zone => (
                                <tr key={zone._id} className="border-b border-slate-100">
                                  <td className="p-3 pl-0 font-medium">{zone.name}</td>
                                  <td className="p-3">
                                    <div className="max-w-xs truncate">{zone.regions.join(', ')}</div>
                                  </td>
                                  <td className="p-3 text-right">₦{zone.rate.toLocaleString()}</td>
                                  <td className="p-3">{zone.estimatedDelivery || 'N/A'}</td>
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
                                type="number"
                                value={settings.shippingZones[0]?.freeShippingThreshold || 25000}
                                onChange={e =>
                                  setSettings({
                                    ...settings,
                                    shippingZones: settings.shippingZones.map((zone, i) =>
                                      i === 0 ? { ...zone, freeShippingThreshold: parseInt(e.target.value) } : zone
                                    ),
                                  })
                                }
                                className="w-full pl-8 pr-4 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                                aria-label="Free shipping threshold"
                              />
                            </div>
                            <p className="text-xs text-slate-500 mt-1">Orders above this amount qualify for free shipping</p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <input
                            id="enable-free-shipping"
                            type="checkbox"
                            checked={settings.shippingZones[0]?.active ?? true}
                            onChange={e =>
                              setSettings({
                                ...settings,
                                shippingZones: settings.shippingZones.map((zone, i) =>
                                  i === 0 ? { ...zone, active: e.target.checked } : zone
                                ),
                              })
                            }
                            className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary/50"
                            aria-label="Enable free shipping"
                          />
                          <label htmlFor="enable-free-shipping" className="ml-2 block text-sm text-secondary">
                            Enable free shipping for orders above threshold
                          </label>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-end">
                      <Button onClick={handleSaveShippingSettings} disabled={saving} className="flex items-center">
                        {saving ? (
                          <span className="animate-spin mr-2">⟳</span>
                        ) : (
                          <Save size={16} className="mr-2" />
                        )}
                        {saving ? 'Saving...' : 'Save Changes'}
                      </Button>
                    </CardFooter>
                  </Card>
                )}

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
                          {settings.paymentMethods.map(method => (
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
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                                      method.enabled ? 'bg-primary' : 'bg-slate-200'
                                    }`}
                                    aria-label={`Toggle ${method.name} payment method`}
                                  >
                                    <span
                                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                                        method.enabled ? 'translate-x-6' : 'translate-x-1'
                                      }`}
                                    />
                                  </button>
                                </div>
                              </div>
                              {method.provider === 'paystack' && method.enabled && (
                                <div className="mt-4 pt-4 border-t border-slate-100">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                      <label className="block text-sm font-medium text-secondary mb-1">
                                        Public Key
                                      </label>
                                      <input
                                        type="text"
                                        value={method.config?.publicKey || ''}
                                        onChange={e =>
                                          setSettings({
                                            ...settings,
                                            paymentMethods: settings.paymentMethods.map(m =>
                                              m.id === method.id ? { ...m, config: { ...m.config, publicKey: e.target.value } } : m
                                            ),
                                          })
                                        }
                                        className="w-full px-4 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                                        aria-label="Paystack public key"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-sm font-medium text-secondary mb-1">
                                        Secret Key
                                      </label>
                                      <input
                                        type="password"
                                        value={method.config?.secretKey || ''}
                                        onChange={e =>
                                          setSettings({
                                            ...settings,
                                            paymentMethods: settings.paymentMethods.map(m =>
                                              m.id === method.id ? { ...m, config: { ...m.config, secretKey: e.target.value } } : m
                                            ),
                                          })
                                        }
                                        className="w-full px-4 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                                        aria-label="Paystack secret key"
                                      />
                                    </div>
                                  </div>
                                </div>
                              )}
                              {method.provider === 'bank_transfer' && method.enabled && (
                                <div className="mt-4 pt-4 border-t border-slate-100">
                                  <div className="space-y-4">
                                    <div>
                                      <label className="block text-sm font-medium text-secondary mb-1">
                                        Bank Name
                                      </label>
                                      <input
                                        type="text"
                                        value={method.config?.bankName || ''}
                                        onChange={e =>
                                          setSettings({
                                            ...settings,
                                            paymentMethods: settings.paymentMethods.map(m =>
                                              m.id === method.id ? { ...m, config: { ...m.config, bankName: e.target.value } } : m
                                            ),
                                          })
                                        }
                                        className="w-full px-4 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                                        aria-label="Bank name"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-sm font-medium text-secondary mb-1">
                                        Account Number
                                      </label>
                                      <input
                                        type="text"
                                        value={method.config?.accountNumber || ''}
                                        onChange={e =>
                                          setSettings({
                                            ...settings,
                                            paymentMethods: settings.paymentMethods.map(m =>
                                              m.id === method.id ? { ...m, config: { ...m.config, accountNumber: e.target.value } } : m
                                            ),
                                          })
                                        }
                                        className="w-full px-4 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                                        aria-label="Account number"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-sm font-medium text-secondary mb-1">
                                        Account Name
                                      </label>
                                      <input
                                        type="text"
                                        value={method.config?.accountName || ''}
                                        onChange={e =>
                                          setSettings({
                                            ...settings,
                                            paymentMethods: settings.paymentMethods.map(m =>
                                              m.id === method.id ? { ...m, config: { ...m.config, accountName: e.target.value } } : m
                                            ),
                                          })
                                        }
                                        className="w-full px-4 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                                        aria-label="Account name"
                                      />
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-end">
                      <Button onClick={handleSavePaymentSettings} disabled={saving} className="flex items-center">
                        {saving ? (
                          <span className="animate-spin mr-2">⟳</span>
                        ) : (
                          <Save size={16} className="mr-2" />
                        )}
                        {saving ? 'Saving...' : 'Save Changes'}
                      </Button>
                    </CardFooter>
                  </Card>
                )}

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
                          disabled={saving}
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
                                onChange={e => setNewUser({ ...newUser, name: e.target.value })}
                                className="w-full px-4 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                                aria-label="New user name"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-secondary mb-1">
                                Email
                              </label>
                              <input
                                type="email"
                                value={newUser.email}
                                onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                                className="w-full px-4 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                                aria-label="New user email"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-secondary mb-1">
                                Role
                              </label>
                              <select
                                value={newUser.role}
                                onChange={e => setNewUser({ ...newUser, role: e.target.value })}
                                className="w-full px-4 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 bg-white"
                                aria-label="New user role"
                              >
                                <option value="Administrator">Administrator</option>
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
                                onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                                className="w-full px-4 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                                aria-label="New user password"
                              />
                            </div>
                          </div>
                          <div className="flex justify-end mt-4 space-x-3">
                            <Button variant="outline" onClick={() => setShowAddUserForm(false)} disabled={saving}>
                              Cancel
                            </Button>
                            <Button
                              variant="default"
                              onClick={handleAddUser}
                              disabled={saving || !newUser.name || !newUser.email || !newUser.password}
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
                            {adminUsers.map(user => (
                              <tr key={user._id} className="border-b border-slate-100">
                                <td className="p-3 pl-0 font-medium">{`${user.firstName} ${user.lastName || ''}`.trim()}</td>
                                <td className="p-3">{user.email}</td>
                                <td className="p-3">
                                  <span
                                    className={`px-2 py-1 text-xs rounded-full ${
                                      user.role === 'superadmin'
                                        ? 'bg-purple-100 text-purple-800'
                                        : 'bg-blue-100 text-blue-800'
                                    }`}
                                  >
                                    {user.role === 'superadmin' ? 'Administrator' : 'Editor'}
                                  </span>
                                </td>
                                <td className="p-3">{user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}</td>
                                <td className="p-3 pr-0 text-right">
                                  <div className="flex items-center justify-end space-x-2">
                                    <Button variant="ghost" size="sm" onClick={() => handleEditUser(user)}>
                                      <Edit size={16} />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleDeleteUser(user._id)}
                                      disabled={user.role === 'superadmin' || saving}
                                    >
                                      <Trash size={16} className={user.role === 'superadmin' ? 'text-slate-300' : 'text-red-500'} />
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      {editingUser && (
                        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" role="dialog" aria-modal="true">
                          <div className="bg-white rounded-lg shadow-lg w-full max-w-md mx-4">
                            <div className="p-6">
                              <h3 className="text-xl font-heading font-medium text-secondary mb-4">Edit User</h3>
                              <div className="space-y-4">
                                <div>
                                  <label className="block text-sm font-medium text-secondary mb-1">Name</label>
                                  <input
                                    type="text"
                                    value={editingUser.name}
                                    onChange={e => setEditingUser({ ...editingUser, name: e.target.value })}
                                    className="w-full px-4 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    aria-label="Edit user name"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-secondary mb-1">Email</label>
                                  <input
                                    type="email"
                                    value={editingUser.email}
                                    onChange={e => setEditingUser({ ...editingUser, email: e.target.value })}
                                    className="w-full px-4 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    aria-label="Edit user email"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-secondary mb-1">Role</label>
                                  <select
                                    value={editingUser.role}
                                    onChange={e => setEditingUser({ ...editingUser, role: e.target.value })}
                                    className="w-full px-4 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 bg-white"
                                    disabled={editingUser.role === 'superadmin'}
                                    aria-label="Edit user role"
                                  >
                                    <option value="Administrator">Administrator</option>
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
                                    onChange={e => setEditingUser({ ...editingUser, password: e.target.value })}
                                    className="w-full px-4 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    aria-label="Edit user password"
                                  />
                                </div>
                              </div>
                              <div className="flex justify-end mt-6 space-x-3">
                                <Button variant="outline" onClick={() => setEditingUser(null)} disabled={saving}>
                                  Cancel
                                </Button>
                                <Button
                                  variant="default"
                                  onClick={handleUpdateUser}
                                  disabled={saving || !editingUser.name || !editingUser.email}
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
        )}
      </LoadingOverlay>
    </>
  );
};

export default SettingsPage;