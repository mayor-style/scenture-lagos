import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/Select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../components/ui/Dialog';
import { LoadingOverlay } from '../../components/ui/LoadingState';
import { useToast } from '../../components/ui/Toast';
import SettingsService from '../../services/admin/settings.service';
import { Save, Store, Mail, Phone, DollarSign, Truck, CreditCard, Users, Plus, Trash, Edit, Settings as SettingsIcon, AlertCircle } from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

const SettingsPage = () => {
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState(null);
  const [adminUsers, setAdminUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [newUser, setNewUser] = useState({ name: '', email: '', role: 'Editor', password: '' });
  const [showAddUserForm, setShowAddUserForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [isZoneModalOpen, setZoneModalOpen] = useState(false);
  const [editingZone, setEditingZone] = useState(null);
  const [isRateModalOpen, setRateModalOpen] = useState(false);
  const [currentZoneForRates, setCurrentZoneForRates] = useState(null);
  const [isPaymentMethodModalOpen, setPaymentMethodModalOpen] = useState(false);
  const [editingPaymentMethod, setEditingPaymentMethod] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [settingsData, usersData] = await Promise.all([
          SettingsService.getStoreSettings(),
          SettingsService.getAdminUsers(),
        ]);
        setSettings(settingsData);
        setAdminUsers(usersData?.users || []);
      } catch (err) {
        const errorMessage = err.response?.data?.error || err.message || 'Failed to load settings';
        setError(errorMessage);
        addToast(errorMessage, 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [addToast]);

  const handleSettingsChange = (path, value) => {
    setSettings((prev) => {
      const keys = path.split('.');
      const newSettings = JSON.parse(JSON.stringify(prev));
      let current = newSettings;
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
      return newSettings;
    });
  };

  const handleSaveGeneralSettings = async () => {
    setSaving(true);
    try {
      const payload = {
        storeName: settings.storeName,
        storeEmail: settings.storeEmail,
        storePhone: settings.storePhone,
        lowStockThreshold: settings.lowStockThreshold,
        socialMedia: settings.socialMedia,
        currency: settings.currency,
        tax: settings.tax,
        emailNotifications: settings.emailNotifications,
      };
      const updatedSettings = await SettingsService.updateStoreSettings(payload);
      setSettings(updatedSettings);
      addToast('General settings updated successfully', 'success');
    } catch (err) {
      addToast(err.message || 'Failed to save settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleOpenZoneModal = (zone = null) => {
    setEditingZone(
      zone
        ? { ...zone, regions: zone.regions.join(', ') }
        : { name: '', regions: '', active: true, shippingRates: [] }
    );
    setZoneModalOpen(true);
  };

  const handleSaveZone = async () => {
    if (!editingZone.name || !editingZone.regions) {
      addToast('Zone name and regions are required.', 'error');
      return;
    }
    setSaving(true);
    const payload = {
      ...editingZone,
      regions: editingZone.regions.split(',').map((r) => r.trim()).filter(Boolean),
    };
    try {
      let response;
      if (editingZone._id) {
        response = await SettingsService.updateShippingZone(editingZone._id, payload);
        setSettings((prev) => ({
          ...prev,
          shipping: {
            ...prev.shipping,
            zones: prev.shipping.zones.map((z) => (z._id === response._id ? response : z)),
          },
        }));
      } else {
        response = await SettingsService.addShippingZone(payload);
        setSettings((prev) => ({
          ...prev,
          shipping: {
            ...prev.shipping,
            zones: [...prev.shipping.zones, response],
          },
        }));
      }
      addToast(`Shipping zone ${editingZone._id ? 'updated' : 'added'} successfully.`, 'success');
      setZoneModalOpen(false);
      setEditingZone(null);
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteZone = async (zoneId) => {
    if (!window.confirm('Are you sure you want to delete this shipping zone and all its rates?')) return;
    setSaving(true);
    try {
      await SettingsService.deleteShippingZone(zoneId);
      setSettings((prev) => ({
        ...prev,
        shipping: {
          ...prev.shipping,
          zones: prev.shipping.zones.filter((z) => z._id !== zoneId),
        },
      }));
      addToast('Shipping zone deleted successfully.', 'success');
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleOpenRateManager = (zone) => {
    setCurrentZoneForRates(zone);
    setRateModalOpen(true);
  };

  const handleSaveRate = async (rateData) => {
    setSaving(true);
    try {
      let updatedRate;
      if (rateData._id) {
        updatedRate = await SettingsService.updateRateInZone(currentZoneForRates._id, rateData._id, rateData);
      } else {
        updatedRate = await SettingsService.addRateToZone(currentZoneForRates._id, rateData);
      }
      const updatedZones = settings.shipping.zones.map((zone) => {
        if (zone._id === currentZoneForRates._id) {
          const newRates = rateData._id
            ? zone.shippingRates.map((r) => (r._id === updatedRate._id ? updatedRate : r))
            : [...zone.shippingRates, updatedRate];
          return { ...zone, shippingRates: newRates };
        }
        return zone;
      });
      setSettings((prev) => ({ ...prev, shipping: { ...prev.shipping, zones: updatedZones } }));
      setCurrentZoneForRates((prev) => ({
        ...prev,
        shippingRates: updatedZones.find((z) => z._id === prev._id).shippingRates,
      }));
      addToast(`Shipping rate ${rateData._id ? 'updated' : 'saved'}.`, 'success');
      return true;
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
    return false;
  };

  const handleDeleteRate = async (rateId) => {
    if (!window.confirm('Are you sure you want to delete this shipping rate?')) return;
    setSaving(true);
    try {
      await SettingsService.deleteRateFromZone(currentZoneForRates._id, rateId);
      const updatedZones = settings.shipping.zones.map((zone) => {
        if (zone._id === currentZoneForRates._id) {
          return { ...zone, shippingRates: zone.shippingRates.filter((r) => r._id !== rateId) };
        }
        return zone;
      });
      setSettings((prev) => ({ ...prev, shipping: { ...prev.shipping, zones: updatedZones } }));
      setCurrentZoneForRates((prev) => ({
        ...prev,
        shippingRates: prev.shippingRates.filter((r) => r._id !== rateId),
      }));
      addToast('Shipping rate deleted.', 'success');
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleOpenPaymentMethodModal = (method = null) => {
    setEditingPaymentMethod(
      method || { name: '', displayName: '', description: '', active: true, config: {} }
    );
    setPaymentMethodModalOpen(true);
  };

  const handleSavePaymentMethod = async () => {
    if (!editingPaymentMethod.name || !editingPaymentMethod.displayName) {
      addToast('Provider name and display name are required.', 'error');
      return;
    }
    setSaving(true);
    try {
      let response;
      if (editingPaymentMethod._id) {
        response = await SettingsService.updatePaymentMethod(editingPaymentMethod._id, editingPaymentMethod);
        setSettings((prev) => ({
          ...prev,
          payment: {
            ...prev.payment,
            methods: prev.payment.methods.map((m) => (m._id === response._id ? response : m)),
          },
        }));
      } else {
        response = await SettingsService.addPaymentMethod(editingPaymentMethod);
        setSettings((prev) => ({
          ...prev,
          payment: {
            ...prev.payment,
            methods: [...(prev.payment?.methods || []), response],
          },
        }));
      }
      addToast(`Payment method ${editingPaymentMethod._id ? 'updated' : 'added'}.`, 'success');
      setPaymentMethodModalOpen(false);
      setEditingPaymentMethod(null);
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePaymentMethod = async (methodId) => {
    if (!window.confirm('Are you sure you want to delete this payment method?')) return;
    setSaving(true);
    try {
      await SettingsService.deletePaymentMethod(methodId);
      setSettings((prev) => ({
        ...prev,
        payment: {
          ...prev.payment,
          methods: prev.payment.methods.filter((m) => m._id !== methodId),
        },
      }));
      addToast('Payment method deleted successfully.', 'success');
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
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
      setAdminUsers((prev) => [...prev, response.user]);
      setNewUser({ name: '', email: '', role: 'Editor', password: '' });
      setShowAddUserForm(false);
      addToast('User added successfully', 'success');
    } catch (err) {
      addToast(err.response?.data?.error || 'Failed to add user', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleEditUser = (user) => {
    setEditingUser({
      _id: user._id,
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
      const response = await SettingsService.updateAdminUser(editingUser._id, userData);
      setAdminUsers((prev) =>
        prev.map((user) => (user._id === editingUser._id ? response.user : user))
      );
      setEditingUser(null);
      addToast('User updated successfully', 'success');
    } catch (err) {
      addToast(err.response?.data?.error || 'Failed to update user', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user? This cannot be undone.')) return;
    setSaving(true);
    try {
      await SettingsService.deleteAdminUser(id);
      setAdminUsers((prev) => prev.filter((user) => user._id !== id));
      addToast('User deleted successfully', 'success');
    } catch (err) {
      addToast(err.response?.data?.error || 'Failed to delete user', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingOverlay loading={true} />;
  }

  if (error || !settings) {
    return (
      <motion.div
        variants={itemVariants}
        initial="hidden"
        animate="visible"
        className="text-center p-8 bg-destructive/10 border border-destructive/20 rounded-md"
      >
        <AlertCircle className="mx-auto h-10 w-10 text-destructive mb-2" />
        <h2 className="text-xl font-bold text-secondary mb-2">Failed to load settings</h2>
        <p className="text-muted-foreground">{error || 'The settings object could not be retrieved. Please try refreshing the page.'}</p>
      </motion.div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Settings | Scenture Admin</title>
      </Helmet>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="container mx-auto space-y-6 py-6 sm:py-8 px-4 sm:px-6 max-w-7xl"
      >
        <motion.header variants={itemVariants}>
          <h1 className="text-2xl sm:text-3xl font-heading font-medium text-secondary tracking-tight">
            Settings
          </h1>
          <p className="text-sm text-muted-foreground mt-1.5">Manage your store settings, shipping, payments, and users.</p>
        </motion.header>

        <motion.div variants={itemVariants} className="flex flex-col md:flex-row gap-6">
          <div className="md:w-64">
            <Card className="border-primary/20 shadow-sm">
              <CardContent className="p-0">
                <nav className="flex flex-col">
                  {[
                    { tab: 'general', icon: Store, label: 'General' },
                    { tab: 'shipping', icon: Truck, label: 'Shipping' },
                    { tab: 'payment', icon: CreditCard, label: 'Payment' },
                    { tab: 'users', icon: Users, label: 'Admin Users' },
                  ].map(({ tab, icon: Icon, label }) => (
                    <motion.button
                      key={tab}
                      variants={itemVariants}
                      onClick={() => setActiveTab(tab)}
                      className={`flex items-center px-4 py-3 text-sm transition-all ${
                        activeTab === tab
                          ? 'bg-primary/10 text-primary border-l-2 border-primary'
                          : 'text-secondary hover:bg-primary/5'
                      }`}
                    >
                      <Icon className="mr-2 h-4 w-4" />
                      {label}
                    </motion.button>
                  ))}
                </nav>
              </CardContent>
            </Card>
          </div>

          <div className="flex-1">
            {/* General Settings Tab */}
            {activeTab === 'general' && (
              <motion.div variants={itemVariants}>
                <Card className="border-primary/20 bg-background shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-xl font-heading text-secondary">General Settings</CardTitle>
                    <CardDescription className="text-sm text-muted-foreground">
                      Basic store information and preferences.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-secondary mb-1.5">Store Name</label>
                        <Input
                          value={settings.storeName || ''}
                          onChange={(e) => handleSettingsChange('storeName', e.target.value)}
                          placeholder="Enter store name"
                          disabled={saving}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-secondary mb-1.5">Contact Email</label>
                        <Input
                          type="email"
                          value={settings.storeEmail || ''}
                          onChange={(e) => handleSettingsChange('storeEmail', e.target.value)}
                          placeholder="Enter contact email"
                          disabled={saving}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-secondary mb-1.5">Contact Phone</label>
                        <Input
                          value={settings.storePhone || ''}
                          onChange={(e) => handleSettingsChange('storePhone', e.target.value)}
                          placeholder="Enter contact phone"
                          disabled={saving}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-secondary mb-1.5">Low Stock Threshold</label>
                        <Input
                          type="number"
                          value={settings.lowStockThreshold || 0}
                          onChange={(e) => handleSettingsChange('lowStockThreshold', parseInt(e.target.value))}
                          placeholder="Enter threshold"
                          min="0"
                          disabled={saving}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-secondary mb-1.5">Currency Code</label>
                        <Select
                          value={settings.currency?.code || 'NGN'}
                          onValueChange={(value) => handleSettingsChange('currency.code', value)}
                          disabled={saving}
                        >
                          <SelectTrigger className="bg-background border-primary/20">
                            <SelectValue placeholder="Select currency" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="NGN">NGN</SelectItem>
                            <SelectItem value="USD">USD</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-secondary mb-1.5">Currency Symbol</label>
                        <Input
                          value={settings.currency?.symbol || '₦'}
                          onChange={(e) => handleSettingsChange('currency.symbol', e.target.value)}
                          placeholder="Enter currency symbol"
                          disabled={saving}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <input
                          id="order-confirm"
                          type="checkbox"
                          checked={settings.emailNotifications?.orderConfirmation || false}
                          onChange={(e) => handleSettingsChange('emailNotifications.orderConfirmation', e.target.checked)}
                          className="h-4 w-4 rounded border-primary/20 text-primary focus:ring-primary/50"
                          disabled={saving}
                        />
                        <label htmlFor="order-confirm" className="ml-2 block text-sm text-secondary">
                          Send order confirmation emails to customers
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input
                          id="admin-notify"
                          type="checkbox"
                          checked={settings.emailNotifications?.orderStatusUpdate || false}
                          onChange={(e) => handleSettingsChange('emailNotifications.orderStatusUpdate', e.target.checked)}
                          className="h-4 w-4 rounded border-primary/20 text-primary focus:ring-primary/50"
                          disabled={saving}
                        />
                        <label htmlFor="admin-notify" className="ml-2 block text-sm text-secondary">
                          Send new order notifications to admin
                        </label>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end">
                    <Button
                      onClick={handleSaveGeneralSettings}
                      disabled={saving}
                      className="bg-primary hover:bg-primary-dark"
                    >
                      <Save className="mr-2 h-4 w-4" />
                      {saving ? 'Saving...' : 'Save General Settings'}
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            )}

            {/* Shipping Settings Tab */}
            {activeTab === 'shipping' && (
              <motion.div variants={itemVariants}>
                <Card className="border-primary/20 bg-background shadow-sm">
                  <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div>
                        <CardTitle className="text-xl font-heading text-secondary">Shipping Settings</CardTitle>
                        <CardDescription className="text-sm text-muted-foreground">
                          Manage shipping zones and delivery rates.
                        </CardDescription>
                      </div>
                      <Button
                        onClick={() => handleOpenZoneModal()}
                        disabled={saving}
                        className="bg-primary hover:bg-primary-dark"
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Zone
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-muted/50">
                            <th className="text-left font-medium p-3 pl-0">Zone Name</th>
                            <th className="text-left font-medium p-3">Regions</th>
                            <th className="text-center font-medium p-3">Status</th>
                            <th className="text-center font-medium p-3">Rates</th>
                            <th className="text-right font-medium p-3 pr-0">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          <AnimatePresence>
                            {settings.shipping?.zones?.map((zone) => (
                              <motion.tr
                                key={zone._id}
                                variants={itemVariants}
                                initial="hidden"
                                animate="visible"
                                exit={{ opacity: 0, height: 0 }}
                                className="border-b border-muted/50 hover:bg-primary/10"
                              >
                                <td className="p-3 pl-0 font-medium text-secondary">{zone.name}</td>
                                <td className="p-3 text-muted-foreground max-w-xs truncate">
                                  {zone.regions.join(', ')}
                                </td>
                                <td className="p-3 text-center">
                                  <span
                                    className={`px-2 py-1 text-xs rounded-full ${
                                      zone.active ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-700'
                                    }`}
                                  >
                                    {zone.active ? 'Active' : 'Inactive'}
                                  </span>
                                </td>
                                <td className="p-3 text-center">{zone.shippingRates?.length || 0}</td>
                                <td className="p-3 pr-0 text-right">
                                  <div className="flex items-center justify-end space-x-1">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleOpenRateManager(zone)}
                                      className="hover:bg-primary/10"
                                    >
                                      <SettingsIcon className="mr-2 h-4 w-4" />
                                      Rates
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => handleOpenZoneModal(zone)}
                                      className="hover:bg-primary/20"
                                    >
                                      <Edit className="h-4 w-4 text-secondary" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => handleDeleteZone(zone._id)}
                                      disabled={saving}
                                      className="hover:bg-destructive/10 hover:text-destructive"
                                    >
                                      <Trash className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </td>
                              </motion.tr>
                            ))}
                          </AnimatePresence>
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Payment Settings Tab */}
            {activeTab === 'payment' && (
              <motion.div variants={itemVariants}>
                <Card className="border-primary/20 bg-background shadow-sm">
                  <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div>
                        <CardTitle className="text-xl font-heading text-secondary">Payment Settings</CardTitle>
                        <CardDescription className="text-sm text-muted-foreground">
                          Configure accepted payment methods.
                        </CardDescription>
                      </div>
                      <Button
                        onClick={() => handleOpenPaymentMethodModal()}
                        disabled={saving}
                        className="bg-primary hover:bg-primary-dark"
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Method
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <AnimatePresence>
                      {settings.payment?.methods?.map((method) => (
                        <motion.div
                          key={method._id}
                          variants={itemVariants}
                          initial="hidden"
                          animate="visible"
                          exit={{ opacity: 0, height: 0 }}
                          className="border border-primary/20 rounded-lg p-4 bg-background hover:shadow-sm"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium text-secondary">{method.displayName}</h4>
                              <p className="text-sm text-muted-foreground">{method.description}</p>
                              <span
                                className={`mt-1 inline-block px-2 py-0.5 text-xs rounded-full ${
                                  method.active ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-700'
                                }`}
                              >
                                {method.active ? 'Enabled' : 'Disabled'}
                              </span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleOpenPaymentMethodModal(method)}
                                className="hover:bg-primary/20"
                              >
                                <Edit className="h-4 w-4 text-secondary" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeletePaymentMethod(method._id)}
                                disabled={saving}
                                className="hover:bg-destructive/10 hover:text-destructive"
                              >
                                <Trash className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Admin Users Tab */}
            {activeTab === 'users' && (
              <motion.div variants={itemVariants}>
                <Card className="border-primary/20 bg-background shadow-sm">
                  <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div>
                        <CardTitle className="text-xl font-heading text-secondary">Admin Users</CardTitle>
                        <CardDescription className="text-sm text-muted-foreground">
                          Manage administrator accounts and permissions
                        </CardDescription>
                      </div>
                      <Button
                        onClick={() => setShowAddUserForm(true)}
                        disabled={saving}
                        className="bg-primary hover:bg-primary-dark"
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Add User
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <AnimatePresence>
                      {showAddUserForm && (
                        <motion.div
                          variants={itemVariants}
                          initial="hidden"
                          animate="visible"
                          exit={{ opacity: 0, height: 0 }}
                          className="mb-6 p-4 border border-primary/20 rounded-md bg-background"
                        >
                          <h3 className="text-lg font-medium text-secondary mb-4">Add New User</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                              placeholder="Full Name"
                              value={newUser.name}
                              onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                              disabled={saving}
                            />
                            <Input
                              type="email"
                              placeholder="Email Address"
                              value={newUser.email}
                              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                              disabled={saving}
                            />
                            <Select
                              value={newUser.role}
                              onValueChange={(value) => setNewUser({ ...newUser, role: value })}
                              disabled={saving}
                            >
                              <SelectTrigger className="bg-background border-primary/20">
                                <SelectValue placeholder="Select role" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Editor">Editor</SelectItem>
                                <SelectItem value="Administrator">Administrator</SelectItem>
                              </SelectContent>
                            </Select>
                            <Input
                              type="password"
                              placeholder="Password"
                              value={newUser.password}
                              onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                              disabled={saving}
                            />
                          </div>
                          <div className="flex justify-end mt-4 space-x-3">
                            <Button
                              variant="outline"
                              onClick={() => setShowAddUserForm(false)}
                              disabled={saving}
                              className="hover:bg-primary/10"
                            >
                              Cancel
                            </Button>
                            <Button
                              onClick={handleAddUser}
                              disabled={saving || !newUser.name || !newUser.email || !newUser.password}
                              className="bg-primary hover:bg-primary-dark"
                            >
                              Add User
                            </Button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-muted/50">
                            <th className="text-left font-medium p-3 pl-0">Name</th>
                            <th className="text-left font-medium p-3">Email</th>
                            <th className="text-left font-medium p-3">Role</th>
                            <th className="text-left font-medium p-3">Last Login</th>
                            <th className="text-right font-medium p-3 pr-0">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          <AnimatePresence>
                            {adminUsers.map((user) => (
                              <motion.tr
                                key={user._id}
                                variants={itemVariants}
                                initial="hidden"
                                animate="visible"
                                exit={{ opacity: 0, height: 0 }}
                                className="border-b border-muted/50 hover:bg-primary/10"
                              >
                                <td className="p-3 pl-0 font-medium text-secondary">
                                  {`${user.firstName} ${user.lastName || ''}`.trim()}
                                </td>
                                <td className="p-3 text-muted-foreground">{user.email}</td>
                                <td className="p-3">
                                  <span
                                    className={`px-2 py-1 text-xs rounded-full ${
                                      user.role === 'superadmin'
                                        ? 'bg-purple-50 text-purple-700'
                                        : 'bg-blue-50 text-blue-700'
                                    }`}
                                  >
                                    {user.role === 'superadmin' ? 'Administrator' : 'Editor'}
                                  </span>
                                </td>
                                <td className="p-3 text-muted-foreground">
                                  {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}
                                </td>
                                <td className="p-3 pr-0 text-right">
                                  <div className="flex items-center justify-end space-x-2">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleEditUser(user)}
                                      className="hover:bg-primary/20"
                                    >
                                      <Edit className="h-4 w-4 text-secondary" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleDeleteUser(user._id)}
                                      disabled={user.role === 'superadmin' || saving}
                                      className="hover:bg-destructive/10 hover:text-destructive"
                                    >
                                      <Trash
                                        className={`h-4 w-4 ${
                                          user.role === 'superadmin' ? 'text-muted-foreground/30' : ''
                                        }`}
                                      />
                                    </Button>
                                  </div>
                                </td>
                              </motion.tr>
                            ))}
                          </AnimatePresence>
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Modals */}
        <Dialog open={isZoneModalOpen} onOpenChange={setZoneModalOpen}>
          <DialogContent className="sm:max-w-md bg-background border-primary/20">
            <DialogHeader>
              <DialogTitle className="text-xl font-heading text-secondary">
                {editingZone?._id ? 'Edit Shipping Zone' : 'Add Shipping Zone'}
              </DialogTitle>
              <DialogDescription>Configure the shipping zone details.</DialogDescription>
            </DialogHeader>
            <motion.div variants={itemVariants} initial="hidden" animate="visible" className="space-y-4 py-4">
              <div>
                <label className="block text-sm font-medium text-secondary mb-1.5">Zone Name</label>
                <Input
                  value={editingZone?.name || ''}
                  onChange={(e) => setEditingZone({ ...editingZone, name: e.target.value })}
                  placeholder="e.g., Lagos Mainland"
                  disabled={saving}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary mb-1.5">
                  Regions (comma-separated)
                </label>
                <Input
                  value={editingZone?.regions || ''}
                  onChange={(e) => setEditingZone({ ...editingZone, regions: e.target.value })}
                  placeholder="e.g., Ikeja, Surulere, Yaba"
                  disabled={saving}
                />
              </div>
              <div className="flex items-center">
                <input
                  id="zone-active"
                  type="checkbox"
                  checked={editingZone?.active || false}
                  onChange={(e) => setEditingZone({ ...editingZone, active: e.target.checked })}
                  className="h-4 w-4 rounded border-primary/20 text-primary focus:ring-primary/50"
                  disabled={saving}
                />
                <label htmlFor="zone-active" className="ml-2 block text-sm text-secondary">
                  Enable this shipping zone
                </label>
              </div>
            </motion.div>
            <DialogFooter className="flex flex-col sm:flex-row gap-3 sm:gap-2">
              <Button
                variant="outline"
                onClick={() => setZoneModalOpen(false)}
                disabled={saving}
                className="w-full sm:w-auto hover:bg-primary/10"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveZone}
                disabled={saving}
                className="w-full sm:w-auto bg-primary hover:bg-primary-dark"
              >
                {saving ? 'Saving...' : 'Save Zone'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isRateModalOpen} onOpenChange={setRateModalOpen}>
          <DialogContent className="sm:max-w-2xl bg-background border-primary/20">
            <DialogHeader>
              <DialogTitle className="text-xl font-heading text-secondary">
                Manage Rates for: {currentZoneForRates?.name}
              </DialogTitle>
              <DialogDescription>Configure shipping rates for this zone.</DialogDescription>
            </DialogHeader>
            <motion.div variants={itemVariants} initial="hidden" animate="visible">
              <RateManager
                zone={currentZoneForRates}
                onSaveRate={handleSaveRate}
                onDeleteRate={handleDeleteRate}
                saving={saving}
              />
            </motion.div>
          </DialogContent>
        </Dialog>

        <Dialog open={isPaymentMethodModalOpen} onOpenChange={setPaymentMethodModalOpen}>
          <DialogContent className="sm:max-w-md bg-background border-primary/20">
            <DialogHeader>
              <DialogTitle className="text-xl font-heading text-secondary">
                {editingPaymentMethod?._id ? 'Edit Payment Method' : 'Add Payment Method'}
              </DialogTitle>
              <DialogDescription>Configure the payment method details.</DialogDescription>
            </DialogHeader>
            <motion.div variants={itemVariants} initial="hidden" animate="visible" className="space-y-4 py-4">
              <div>
                <label className="block text-sm font-medium text-secondary mb-1.5">
                  Provider Name (unique identifier)
                </label>
                <Input
                  value={editingPaymentMethod?.name || ''}
                  onChange={(e) => setEditingPaymentMethod({ ...editingPaymentMethod, name: e.target.value })}
                  placeholder="e.g., paystack, bank_transfer"
                  disabled={saving}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary mb-1.5">Display Name</label>
                <Input
                  value={editingPaymentMethod?.displayName || ''}
                  onChange={(e) =>
                    setEditingPaymentMethod({ ...editingPaymentMethod, displayName: e.target.value })
                  }
                  placeholder="e.g., Pay with Card, Direct Bank Transfer"
                  disabled={saving}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary mb-1.5">Description</label>
                <Input
                  value={editingPaymentMethod?.description || ''}
                  onChange={(e) =>
                    setEditingPaymentMethod({ ...editingPaymentMethod, description: e.target.value })
                  }
                  placeholder="Instructions for the customer"
                  disabled={saving}
                />
              </div>
              {editingPaymentMethod?.name === 'bank_transfer' && (
                <div className="p-4 border border-primary/20 rounded-md space-y-4">
                  <h4 className="font-medium text-secondary">Bank Account Details</h4>
                  <Input
                    placeholder="Bank Name"
                    value={editingPaymentMethod?.config.bankName || ''}
                    onChange={(e) =>
                      setEditingPaymentMethod({
                        ...editingPaymentMethod,
                        config: { ...editingPaymentMethod.config, bankName: e.target.value },
                      })
                    }
                    disabled={saving}
                  />
                  <Input
                    placeholder="Account Number"
                    value={editingPaymentMethod?.config.accountNumber || ''}
                    onChange={(e) =>
                      setEditingPaymentMethod({
                        ...editingPaymentMethod,
                        config: { ...editingPaymentMethod.config, accountNumber: e.target.value },
                      })
                    }
                    disabled={saving}
                  />
                  <Input
                    placeholder="Account Name"
                    value={editingPaymentMethod?.config.accountName || ''}
                    onChange={(e) =>
                      setEditingPaymentMethod({
                        ...editingPaymentMethod,
                        config: { ...editingPaymentMethod.config, accountName: e.target.value },
                      })
                    }
                    disabled={saving}
                  />
                </div>
              )}
              {editingPaymentMethod?.name === 'paystack' && (
                <div className="p-4 border border-primary/20 rounded-md space-y-4">
                  <h4 className="font-medium text-secondary">Paystack API Keys</h4>
                  <Input
                    placeholder="Public Key"
                    value={editingPaymentMethod?.config.publicKey || ''}
                    onChange={(e) =>
                      setEditingPaymentMethod({
                        ...editingPaymentMethod,
                        config: { ...editingPaymentMethod.config, publicKey: e.target.value },
                      })
                    }
                    disabled={saving}
                  />
                  <Input
                    type="password"
                    placeholder="Secret Key"
                    value={editingPaymentMethod?.config.secretKey || ''}
                    onChange={(e) =>
                      setEditingPaymentMethod({
                        ...editingPaymentMethod,
                        config: { ...editingPaymentMethod.config, secretKey: e.target.value },
                      })
                    }
                    disabled={saving}
                  />
                </div>
              )}
              <div className="flex items-center">
                <input
                  id="method-active"
                  type="checkbox"
                  checked={editingPaymentMethod?.active || false}
                  onChange={(e) =>
                    setEditingPaymentMethod({ ...editingPaymentMethod, active: e.target.checked })
                  }
                  className="h-4 w-4 rounded border-primary/20 text-primary focus:ring-primary/50"
                  disabled={saving}
                />
                <label htmlFor="method-active" className="ml-2 block text-sm text-secondary">
                  Enable this payment method
                </label>
              </div>
            </motion.div>
            <DialogFooter className="flex flex-col sm:flex-row gap-3 sm:gap-2">
              <Button
                variant="outline"
                onClick={() => setPaymentMethodModalOpen(false)}
                disabled={saving}
                className="w-full sm:w-auto hover:bg-primary/10"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSavePaymentMethod}
                disabled={saving}
                className="w-full sm:w-auto bg-primary hover:bg-primary-dark"
              >
                {saving ? 'Saving...' : 'Save Method'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={editingUser} onOpenChange={() => setEditingUser(null)}>
          <DialogContent className="sm:max-w-md bg-background border-primary/20">
            <DialogHeader>
              <DialogTitle className="text-xl font-heading text-secondary">Edit User</DialogTitle>
              <DialogDescription>Update the user’s account details.</DialogDescription>
            </DialogHeader>
            <motion.div variants={itemVariants} initial="hidden" animate="visible" className="space-y-4 py-4">
              <Input
                placeholder="Full Name"
                value={editingUser?.name || ''}
                onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                disabled={saving}
              />
              <Input
                type="email"
                placeholder="Email Address"
                value={editingUser?.email || ''}
                onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                disabled={saving}
              />
              <Select
                value={editingUser?.role || ''}
                onValueChange={(value) => setEditingUser({ ...editingUser, role: value })}
                disabled={editingUser?.role === 'Administrator' || saving}
              >
                <SelectTrigger className="bg-background border-primary/20">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Editor">Editor</SelectItem>
                  <SelectItem value="Administrator">Administrator</SelectItem>
                </SelectContent>
              </Select>
              <Input
                type="password"
                placeholder="New Password (leave blank to keep)"
                value={editingUser?.password || ''}
                onChange={(e) => setEditingUser({ ...editingUser, password: e.target.value })}
                disabled={saving}
              />
            </motion.div>
            <DialogFooter className="flex flex-col sm:flex-row gap-3 sm:gap-2">
              <Button
                variant="outline"
                onClick={() => setEditingUser(null)}
                disabled={saving}
                className="w-full sm:w-auto hover:bg-primary/10"
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpdateUser}
                disabled={saving || !editingUser?.name || !editingUser?.email}
                className="w-full sm:w-auto bg-primary hover:bg-primary-dark"
              >
                Update User
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </motion.div>
    </>
  );
};

const RateManager = ({ zone, onSaveRate, onDeleteRate, saving }) => {
  const [editingRate, setEditingRate] = useState(null);

  const handleEdit = (rate) => {
    setEditingRate({ ...rate });
  };

  const handleAddNew = () => {
    setEditingRate({ name: '', price: 0, description: '', freeShippingThreshold: 0, active: true });
  };

  const handleSave = async () => {
    const success = await onSaveRate(editingRate);
    if (success) {
      setEditingRate(null);
    }
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="py-4">
      {!editingRate && (
        <motion.div variants={itemVariants} className="flex justify-end mb-4">
          <Button
            onClick={handleAddNew}
            disabled={saving}
            className="bg-primary hover:bg-primary-dark"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add New Rate
          </Button>
        </motion.div>
      )}
      <AnimatePresence>
        {editingRate ? (
          <motion.div
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0, height: 0 }}
            className="p-4 border border-primary/20 rounded-md bg-background space-y-4"
          >
            <h4 className="font-medium text-secondary">{editingRate._id ? 'Edit Rate' : 'Add New Rate'}</h4>
            <Input
              placeholder="Rate Name (e.g., Standard, Express)"
              value={editingRate.name}
              onChange={(e) => setEditingRate({ ...editingRate, name: e.target.value })}
              disabled={saving}
            />
            <Input
              type="number"
              placeholder="Price"
              value={editingRate.price}
              onChange={(e) => setEditingRate({ ...editingRate, price: parseFloat(e.target.value) || 0 })}
              min="0"
              disabled={saving}
            />
            <Input
              placeholder="Description (e.g., 2-3 business days)"
              value={editingRate.description || ''}
              onChange={(e) => setEditingRate({ ...editingRate, description: e.target.value })}
              disabled={saving}
            />
            <div>
              <label className="block text-sm font-medium text-secondary mb-1.5">
                Free Shipping Threshold (0 for none)
              </label>
              <Input
                type="number"
                placeholder="Threshold"
                value={editingRate.freeShippingThreshold || 0}
                onChange={(e) =>
                  setEditingRate({ ...editingRate, freeShippingThreshold: parseFloat(e.target.value) || 0 })
                }
                min="0"
                disabled={saving}
              />
            </div>
            <div className="flex items-center">
              <input
                id="rate-active"
                type="checkbox"
                checked={editingRate.active}
                onChange={(e) => setEditingRate({ ...editingRate, active: e.target.checked })}
                className="h-4 w-4 rounded border-primary/20 text-primary focus:ring-primary/50"
                disabled={saving}
              />
              <label htmlFor="rate-active" className="ml-2 block text-sm text-secondary">
                Enable this shipping rate
              </label>
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setEditingRate(null)}
                disabled={saving}
                className="hover:bg-primary/10"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving}
                className="bg-primary hover:bg-primary-dark"
              >
                {saving ? 'Saving...' : 'Save Rate'}
              </Button>
            </div>
          </motion.div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-muted/50">
                  <th className="text-left font-medium p-2 pl-0">Name</th>
                  <th className="text-right font-medium p-2">Price</th>
                  <th className="text-center font-medium p-2">Status</th>
                  <th className="text-right font-medium p-2 pr-0">Actions</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {zone?.shippingRates?.map((rate) => (
                    <motion.tr
                      key={rate._id}
                      variants={itemVariants}
                      initial="hidden"
                      animate="visible"
                      exit={{ opacity: 0, height: 0 }}
                      className="border-b border-muted/50 hover:bg-primary/10"
                    >
                      <td className="p-2 pl-0 font-medium text-secondary">{rate.name}</td>
                      <td className="p-2 text-right text-secondary">
                        ₦{rate.price?.toLocaleString() || 0}
                      </td>
                      <td className="p-2 text-center">
                        <span
                          className={`px-2 py-0.5 text-xs rounded-full ${
                            rate.active ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-700'
                          }`}
                        >
                          {rate.active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="p-2 pr-0 text-right">
                        <div className="flex items-center justify-end">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(rate)}
                            className="hover:bg-primary/20"
                          >
                            <Edit className="h-4 w-4 text-secondary" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onDeleteRate(rate._id)}
                            disabled={saving}
                            className="hover:bg-destructive/10 hover:text-destructive"
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default SettingsPage;