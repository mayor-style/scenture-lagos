import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { formatPrice } from '../../lib/utils';
import { LoadingOverlay, LoadingState } from '../../components/ui/LoadingState';
import ErrorState from '../../components/ui/ErrorState';
import { useToast } from '../../components/ui/Toast';
import InventoryService from '../../services/admin/inventory.service';
import { debounce } from 'lodash';
import {
  Search,
  FileText,
  Download,
  RefreshCw,
  Package,
  CheckCircle,
  AlertTriangle,
  Plus,
  Minus,
  ChevronLeft,
  ChevronRight,
  Settings,
} from 'lucide-react';

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Status' },
  { value: 'in_stock', label: 'In Stock' },
  { value: 'low_stock', label: 'Low Stock' },
  { value: 'out_of_stock', label: 'Out of Stock' },
];

const InventoryPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {addToast} = useToast();
  const searchParams = new URLSearchParams(location.search);

  const [inventory, setInventory] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [inventoryStats, setInventoryStats] = useState({
    totalProducts: 0,
    inStockCount: 0,
    lowStockCount: 0,
    outOfStockCount: 0,
    totalInventoryValue: 0,
  });
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'all');
  const [currentPage, setCurrentPage] = useState(Number.isInteger(parseInt(searchParams.get('page'))) ? parseInt(searchParams.get('page')) : 1);
  const [itemsPerPage, setItemsPerPage] = useState(Number.isInteger(parseInt(searchParams.get('limit'))) ? parseInt(searchParams.get('limit')) : 5);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [lowStockLoading, setLowStockLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [adjustmentQuantity, setAdjustmentQuantity] = useState(0);
  const [adjustmentReason, setAdjustmentReason] = useState('');
  const [showAdjustmentModal, setShowAdjustmentModal] = useState(false);
  const [adjustmentLoading, setAdjustmentLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams();
    if (searchTerm) params.set('search', searchTerm);
    if (statusFilter !== 'all') params.set('status', statusFilter);
    if (currentPage !== 1) params.set('page', currentPage.toString());
    if (itemsPerPage !== 5) params.set('limit', itemsPerPage.toString());

    const newUrl = `${location.pathname}${params.toString() ? `?${params.toString()}` : ''}`;
    navigate(newUrl, { replace: true });
  }, [searchTerm, statusFilter, currentPage, itemsPerPage, navigate, location.pathname]);

  const fetchInventory = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm,
        ...(statusFilter !== 'all' && { status: statusFilter }),
      };
      const data = await InventoryService.getInventory(params);
      console.log('Inventory data:', data); // For debugging
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid inventory data received');
      }
      setInventory(Array.isArray(data.items) ? data.items : []);
      setTotalItems(Number.isInteger(data.total) ? data.total : 0);
    } catch (err) {
      console.error('Error fetching inventory:', err, err.response?.data);
      const errorMessage = err.response?.data?.message || 'Failed to load inventory data';
      setError(errorMessage);
      setInventory([]);
      setTotalItems(0);
      addToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchInventoryStats = async () => {
    setStatsLoading(true);
    try {
      const stats = await InventoryService.getInventoryStatistics();
      console.log('Inventory stats:', stats); // For debugging
      setInventoryStats({
        totalProducts: stats.totalProducts || 0,
        inStockCount: stats.inStockCount || 0,
        lowStockCount: stats.lowStockCount || 0,
        outOfStockCount: stats.outOfStockCount || 0,
        totalInventoryValue: stats.totalValue || 0,
      });
    } catch (err) {
      console.error('Error fetching inventory statistics:', err, err.response?.data);
      const errorMessage = err.response?.data?.message || 'Failed to load inventory statistics';
      setInventoryStats({
        totalProducts: 0,
        inStockCount: 0,
        lowStockCount: 0,
        outOfStockCount: 0,
        totalInventoryValue: 0,
      });
      addToast(errorMessage, 'error');
    } finally {
      setStatsLoading(false);
    }
  };

  const fetchLowStockItems = async () => {
    setLowStockLoading(true);
    try {
      const data = await InventoryService.getLowStockItems({ limit: 10 });
      console.log('Low stock items:', data); // For debugging
      setLowStockItems(Array.isArray(data.items) ? data.items : []);
    } catch (err) {
      console.error('Error fetching low stock items:', err, err.response?.data);
      const errorMessage = err.response?.data?.message || 'Failed to load low stock items';
      setLowStockItems([]);
      addToast(errorMessage, 'error');
    } finally {
      setLowStockLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, [currentPage, itemsPerPage, searchTerm, statusFilter]);

  useEffect(() => {
    fetchInventoryStats();
    fetchLowStockItems();
  }, []);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleSearchChange = debounce((e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  }, 300);

  useEffect(() => {
    return () => {
      handleSearchChange.cancel(); // Cleanup debounce
    };
  }, []);

  const handleStatusChange = (e) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1);
  };

  const handleRefresh = () => {
    fetchInventory();
    fetchInventoryStats();
    fetchLowStockItems();
    addToast('Inventory data has been refreshed', 'success');
  };

  const openAdjustmentModal = (item) => {
    setSelectedItem(item);
    setAdjustmentQuantity(0);
    setAdjustmentReason('');
    setShowAdjustmentModal(true);
  };

  const closeAdjustmentModal = () => {
    setShowAdjustmentModal(false);
    setSelectedItem(null);
    setAdjustmentQuantity(0);
    setAdjustmentReason('');
  };

  const handleAdjustment = async () => {
    if (!adjustmentReason) {
      addToast('Please select a reason for the adjustment', 'error');
      return;
    }

    if (adjustmentQuantity === 0) {
      addToast('Adjustment quantity cannot be zero', 'error');
      return;
    }

    if (selectedItem.quantity + parseInt(adjustmentQuantity) < 0) {
      addToast('This adjustment would result in negative stock. Please adjust the quantity.', 'error');
      return;
    }

    setAdjustmentLoading(true);
    try {
      await InventoryService.adjustStock(selectedItem.id, {
        quantity: parseInt(adjustmentQuantity),
        reason: adjustmentReason,
        variantId: selectedItem.variantId || null,
      });
      addToast('Inventory updated successfully', 'success');
      fetchInventory();
      fetchInventoryStats();
      fetchLowStockItems();
      closeAdjustmentModal();
    } catch (err) {
      console.error('Error adjusting inventory:', err, err.response?.data);
      const errorMessage = err.response?.data?.message || 'Failed to update inventory';
      addToast(errorMessage, 'error');
    } finally {
      setAdjustmentLoading(false);
    }
  };

  const handleGenerateReport = async () => {
    try {
      const blob = await InventoryService.generateReport();
      if (!(blob instanceof Blob)) {
        throw new Error('Invalid report format received');
      }
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `inventory-report-${new Date().toISOString().split('T')[0]}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => window.URL.revokeObjectURL(url), 100);
      addToast('Report generated successfully', 'success');
    } catch (err) {
      console.error('Error generating report:', err);
      const errorMessage = err.message || 'Failed to generate report';
      addToast(errorMessage, 'error');
    }
  };

  const handleExportCSV = async () => {
    try {
      const blob = await InventoryService.exportCSV();
      if (!(blob instanceof Blob)) {
        throw new Error('Invalid export format received');
      }
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `inventory-export-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => window.URL.revokeObjectURL(url), 100);
      addToast('CSV exported successfully', 'success');
    } catch (err) {
      console.error('Error exporting CSV:', err);
      const errorMessage = err.message || 'Failed to export CSV';
      addToast(errorMessage, 'error');
    }
  };

  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const indexOfFirstItem = (currentPage - 1) * itemsPerPage + 1;
  const indexOfLastItem = Math.min(currentPage * itemsPerPage, totalItems);

  const getPaginationButtons = () => {
    const buttons = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        buttons.push(i);
      }
    } else {
      buttons.push(1);
      let startPage = Math.max(2, currentPage - 1);
      let endPage = Math.min(totalPages - 1, currentPage + 1);
      if (currentPage <= 3) endPage = 4;
      if (currentPage >= totalPages - 2) startPage = totalPages - 3;
      if (startPage > 2) buttons.push('...');
      for (let i = startPage; i <= endPage; i++) {
        buttons.push(i);
      }
      if (endPage < totalPages - 1) buttons.push('...');
      buttons.push(totalPages);
    }
    return buttons;
  };

  const { totalProducts, inStockCount, lowStockCount, outOfStockCount, totalInventoryValue } = inventoryStats;

  return (
    <>
      <Helmet>
        <title>Inventory Management | Scenture Lagos Admin</title>
      </Helmet>
      {error ? (
        <ErrorState
          title="Failed to load inventory"
          message="There was an error loading the inventory data. Please try again."
          onRetry={fetchInventory}
          className="py-12 px-4 sm:px-6"
        />
      ) : (
        <div className="space-y-6 px-0">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 px-4 sm:px-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-heading font-medium text-secondary">Inventory Management</h1>
              <p className="text-sm text-secondary/70 mt-1">Manage your product stock levels</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link to="/admin/settings?tab=general">
                <Button variant="outline" className="flex items-center">
                  <Settings size={16} className="mr-2" />
                  Settings
                </Button>
              </Link>
              <Button variant="outline" className="flex items-center" onClick={handleGenerateReport}>
                <FileText size={16} className="mr-2" />
                Generate Report
              </Button>
              <Button variant="outline" className="flex items-center" onClick={handleExportCSV}>
                <Download size={16} className="mr-2" />
                Export CSV
              </Button>
              <Button
                variant="default"
                className="flex items-center"
                onClick={handleRefresh}
                disabled={loading || statsLoading || lowStockLoading}
              >
                <RefreshCw size={16} className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
                {loading ? 'Refreshing...' : 'Refresh'}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 px-4 sm:px-6">
            <LoadingOverlay loading={statsLoading}>
              <Card className="shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-500">Total Products</p>
                      <h3 className="text-2xl font-medium mt-1">{totalProducts}</h3>
                    </div>
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <Package size={24} className="text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </LoadingOverlay>
            <LoadingOverlay loading={statsLoading}>
              <Card className="shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-500">In Stock</p>
                      <h3 className="text-2xl font-medium mt-1">{inStockCount}</h3>
                    </div>
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle size={24} className="text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </LoadingOverlay>
            <LoadingOverlay loading={statsLoading}>
              <Card className="shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-500">Low Stock</p>
                      <h3 className="text-2xl font-medium mt-1">{lowStockCount}</h3>
                    </div>
                    <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                      <AlertTriangle size={24} className="text-yellow-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </LoadingOverlay>
            <LoadingOverlay loading={statsLoading}>
              <Card className="shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-500">Inventory Value</p>
                      <h3 className="text-2xl font-medium mt-1">{formatPrice(totalInventoryValue)}</h3>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <Package size={24} className="text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </LoadingOverlay>
          </div>

          <Card className="mx-0 shadow-sm">
            <CardHeader className="px-4 sm:px-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <CardTitle>Inventory List</CardTitle>
                  <CardDescription>{loading ? 'Loading...' : `${totalItems} items found`}</CardDescription>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type="text"
                      placeholder="Search inventory..."
                      defaultValue={searchTerm}
                      onChange={handleSearchChange}
                      className="pl-10 pr-4 py-2 border border-slate-200 rounded-md w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow hover:shadow-sm"
                      aria-label="Search inventory items"
                    />
                  </div>
                  <select
                    value={statusFilter}
                    onChange={handleStatusChange}
                    className="px-4 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 bg-white transition-shadow hover:shadow-sm"
                    disabled={loading}
                    aria-label="Filter by stock status"
                  >
                    {STATUS_OPTIONS.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-4 sm:px-6">
              <LoadingOverlay loading={loading}>
                {inventory.length === 0 ? (
                  <div className="text-center text-slate-500 py-6">
                    No inventory items found
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {inventory.map(item => (
                      <Card key={item.id || Math.random()} className="shadow-sm hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex flex-col space-y-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                                  <Package size={16} className="text-primary" />
                                </div>
                                <div>
                                  <div className="font-medium text-secondary truncate">{item.name || 'Unknown'}</div>
                                  {item.variantName && (
                                    <div className="text-xs text-slate-500 truncate">
                                      {typeof item.variantName === 'string' ? item.variantName : (item.variant?.title || 'N/A')}
                                    </div>
                                  )}
                                </div>
                              </div>
                              <span
                                className={`px-2 py-1 text-xs rounded-full ${
                                  item.status === 'in_stock'
                                    ? 'bg-green-100 text-green-800'
                                    : item.status === 'low_stock'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-red-100 text-red-800'
                                }`}
                              >
                                {item.status === 'in_stock'
                                  ? 'In Stock'
                                  : item.status === 'low_stock'
                                  ? 'Low Stock'
                                  : 'Out of Stock'}
                              </span>
                            </div>
                            <div className="space-y-2">
                              <div className="flex items-center text-sm">
                                <span className="font-medium mr-2">SKU:</span>
                                <span className="truncate">{item.sku || 'N/A'}</span>
                              </div>
                              <div className="flex items-center text-sm">
                                <span className="font-medium mr-2">Stock:</span>
                                <span>{item.quantity ?? 0}</span>
                              </div>
                              <div className="flex items-center text-sm">
                                <span className="font-medium mr-2">Price:</span>
                                <span>{formatPrice(item.price || 0)}</span>
                              </div>
                            </div>
                            <div className="flex justify-end">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openAdjustmentModal(item)}
                                disabled={loading || adjustmentLoading}
                                className="flex items-center"
                              >
                                <Package size={16} className="mr-2" />
                                Adjust
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </LoadingOverlay>
            </CardContent>
            <CardContent className="px-4 sm:px-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="text-sm text-slate-500">
                  Showing {indexOfFirstItem} to {indexOfLastItem} of {totalItems} items
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={itemsPerPage}
                    onChange={e => {
                      setItemsPerPage(parseInt(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="px-4 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 bg-white transition-shadow hover:shadow-sm"
                    disabled={loading}
                    aria-label="Items per page"
                  >
                    <option value={5}>5 per page</option>
                    <option value={10}>10 per page</option>
                    <option value={20}>20 per page</option>
                    <option value={50}>50 per page</option>
                  </select>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1 || loading}
                      className="p-2"
                    >
                      <ChevronLeft size={16} />
                    </Button>
                    {getPaginationButtons().map((page, index) => (
                      <Button
                        key={index}
                        variant={page === currentPage ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => typeof page === 'number' && handlePageChange(page)}
                        disabled={typeof page !== 'number' || loading}
                        className="w-10"
                      >
                        {page}
                      </Button>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages || loading}
                      className="p-2"
                    >
                      <ChevronRight size={16} />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mx-0 shadow-sm">
            <CardHeader className="px-4 sm:px-6">
              <CardTitle>Low Stock Alerts</CardTitle>
              <CardDescription>Products requiring attention</CardDescription>
            </CardHeader>
            <CardContent className="px-4 sm:px-6">
              <LoadingOverlay loading={lowStockLoading}>
                {lowStockItems.length === 0 ? (
                  <div className="text-center text-slate-500 py-6">
                    No low stock items found
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {lowStockItems.map(item => (
                      <Card key={item.id || Math.random()} className="shadow-sm hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex flex-col space-y-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center mr-3">
                                  <AlertTriangle size={16} className="text-yellow-600" />
                                </div>
                                <div>
                                  <div className="font-medium text-secondary truncate">{item.name || 'Unknown'}</div>
                                  {item.variantName && (
                                    <div className="text-xs text-slate-500 truncate">
                                      {typeof item.variantName === 'string' ? item.variantName : (item.variant?.title || 'N/A')}
                                    </div>
                                  )}
                                </div>
                              </div>
                              <span
                                className={`px-2 py-1 text-xs rounded-full ${
                                  item.status === 'low_stock' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                                }`}
                              >
                                {item.status === 'low_stock' ? 'Low Stock' : 'Out of Stock'}
                              </span>
                            </div>
                            <div className="space-y-2">
                              <div className="flex items-center text-sm">
                                <span className="font-medium mr-2">SKU:</span>
                                <span className="truncate">{item.sku || 'N/A'}</span>
                              </div>
                              <div className="flex items-center text-sm">
                                <span className="font-medium mr-2">Stock:</span>
                                <span>{item.quantity ?? 0}</span>
                              </div>
                            </div>
                            <div className="flex justify-end">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openAdjustmentModal(item)}
                                disabled={loading || adjustmentLoading}
                                className="flex items-center"
                              >
                                <Package size={16} className="mr-2" />
                                Adjust
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </LoadingOverlay>
            </CardContent>
          </Card>

          {showAdjustmentModal && selectedItem && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" role="dialog" aria-modal="true">
              <div className="bg-white rounded-lg shadow-lg w-full max-w-md mx-4">
                <div className="p-6">
                  <h3 className="text-xl font-heading font-medium text-secondary mb-4">
                    Adjust Inventory: {selectedItem.name || 'Unknown'}
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-secondary mb-1">
                        Current Stock
                      </label>
                      <input
                        type="text"
                        value={selectedItem.quantity ?? 0}
                        disabled
                        className="w-full px-4 py-2 border border-slate-200 rounded-md bg-slate-100"
                        aria-label="Current stock"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-secondary mb-1">
                        Adjustment Quantity
                      </label>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setAdjustmentQuantity(prev => prev - 1)}
                          disabled={adjustmentLoading}
                          className="p-2"
                        >
                          <Minus size={16} />
                        </Button>
                        <input
                          type="number"
                          value={adjustmentQuantity}
                          onChange={e => setAdjustmentQuantity(parseInt(e.target.value) || 0)}
                          className="w-full px-4 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 text-center transition-shadow hover:shadow-sm"
                          aria-label="Adjustment quantity"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setAdjustmentQuantity(prev => prev + 1)}
                          disabled={adjustmentLoading}
                          className="p-2"
                        >
                          <Plus size={16} />
                        </Button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-secondary mb-1">
                        Reason
                      </label>
                      <select
                        value={adjustmentReason}
                        onChange={e => setAdjustmentReason(e.target.value)}
                        className="w-full px-4 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 bg-white transition-shadow hover:shadow-sm"
                        disabled={adjustmentLoading}
                        aria-label="Adjustment reason"
                      >
                        <option value="">Select a reason</option>
                        <option value="restock">Restock</option>
                        <option value="return">Return</option>
                        <option value="damage">Damage</option>
                        <option value="theft">Theft</option>
                        <option value="correction">Stock Correction</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row justify-end mt-6 gap-3 sm:gap-0 sm:space-x-3">
                    <Button
                      variant="outline"
                      onClick={closeAdjustmentModal}
                      disabled={adjustmentLoading}
                      className="w-full sm:w-auto"
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="default"
                      onClick={handleAdjustment}
                      disabled={adjustmentLoading || !adjustmentReason}
                      className="w-full sm:w-auto flex items-center"
                    >
                      {adjustmentLoading ? (
                        <span className="animate-spin mr-2">⟳</span>
                      ) : (
                        <CheckCircle size={16} className="mr-2" />
                      )}
                      {adjustmentLoading ? 'Adjusting...' : 'Adjust Stock'}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default InventoryPage;