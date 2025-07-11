import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { formatPrice } from '../../lib/utils';
import { LoadingOverlay, LoadingState } from '../../components/ui/LoadingState';
import ErrorState from '../../components/ui/ErrorState';
import { toast } from 'react-hot-toast';
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
import PropTypes from 'prop-types';

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Status' },
  { value: 'in_stock', label: 'In Stock' },
  { value: 'low_stock', label: 'Low Stock' },
  { value: 'out_of_stock', label: 'Out of Stock' },
];

const InventoryPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
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
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page')) || 1);
  const [itemsPerPage, setItemsPerPage] = useState(parseInt(searchParams.get('limit')) || 5);
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
      setInventory(data.items || []);
      setTotalItems(data.total || 0);
    } catch (err) {
      console.error('Error fetching inventory:', err);
      setError(err);
      setInventory([]);
      setTotalItems(0);
      toast({ title: 'Error', description: err.response?.data?.message || 'Failed to load inventory data', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const fetchInventoryStats = async () => {
    setStatsLoading(true);
    try {
      const stats = await InventoryService.getInventoryStatistics();
      setInventoryStats({
        totalProducts: stats.totalProducts || 0,
        inStockCount: stats.inStockCount || 0,
        lowStockCount: stats.lowStockCount || 0,
        outOfStockCount: stats.outOfStockCount || 0,
        totalValue: stats.totalValue || 0,
      });
    } catch (err) {
      console.error('Error fetching inventory statistics:', err);
      setInventoryStats({
        totalProducts: 0,
        inStockCount: 0,
        lowStockCount: 0,
        outOfStockCount: 0,
        totalInventoryValue: 0,
      });
      toast({ title: 'Error', description: err.response?.data?.message || 'Failed to load inventory statistics', variant: 'destructive' });
    } finally {
      setStatsLoading(false);
    }
  };

  const fetchLowStockItems = async () => {
    setLowStockLoading(true);
    try {
      const data = await InventoryService.getLowStockItems({ limit: 10 });
      setLowStockItems(data.items || []);
    } catch (err) {
      console.error('Error fetching low stock items:', err);
      setLowStockItems([]);
      toast({ title: 'Error', description: err.response?.data?.message || 'Failed to load low stock items', variant: 'destructive' });
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

  const handleStatusChange = (e) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1);
  };

  const handleRefresh = () => {
    fetchInventory();
    fetchInventoryStats();
    fetchLowStockItems();
    toast({ title: 'Refreshed', description: 'Inventory data has been refreshed', variant: 'success' });
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
      toast({ title: 'Error', description: 'Please select a reason for the adjustment', variant: 'destructive' });
      return;
    }
    
    // Validate adjustment quantity
    if (adjustmentQuantity === 0) {
      toast({ title: 'Error', description: 'Adjustment quantity cannot be zero', variant: 'destructive' });
      return;
    }
    
    // Check if adjustment would result in negative stock
    if (selectedItem.quantity + parseInt(adjustmentQuantity) < 0) {
      toast({ title: 'Warning', description: 'This adjustment would result in negative stock. Please adjust the quantity.', variant: 'destructive' });
      return;
    }
    
    setAdjustmentLoading(true);
    try {
      await InventoryService.adjustStock(selectedItem.id, {
        quantity: parseInt(adjustmentQuantity),
        reason: adjustmentReason,
        variantId: selectedItem.variantId || null,
      });
      toast({ title: 'Success', description: 'Inventory updated successfully', variant: 'success' });
      fetchInventory();
      fetchInventoryStats();
      fetchLowStockItems();
      closeAdjustmentModal();
    } catch (err) {
      console.error('Error adjusting inventory:', err);
      toast({ title: 'Error', description: err.response?.data?.message || 'Failed to update inventory', variant: 'destructive' });
    } finally {
      setAdjustmentLoading(false);
    }
  };

  const handleGenerateReport = async () => {
    try {
      const blob = await InventoryService.generateReport();
      
      // Validate that we received a valid blob
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
      
      // Clean up the URL object
      setTimeout(() => window.URL.revokeObjectURL(url), 100);
      
      toast({ title: 'Success', description: 'Report generated successfully', variant: 'success' });
    } catch (err) {
      console.error('Error generating report:', err);
      toast({ title: 'Error', description: err.message || 'Failed to generate report', variant: 'destructive' });
    }
  };

  const handleExportCSV = async () => {
    try {
      const blob = await InventoryService.exportCSV();
      
      // Validate that we received a valid blob
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
      
      // Clean up the URL object
      setTimeout(() => window.URL.revokeObjectURL(url), 100);
      
      toast({ title: 'Success', description: 'CSV exported successfully', variant: 'success' });
    } catch (err) {
      console.error('Error exporting CSV:', err);
      toast({ title: 'Error', description: err.message || 'Failed to export CSV', variant: 'destructive' });
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
        />
      ) : (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-heading font-medium text-secondary">Inventory Management</h1>
              <p className="text-secondary/70 mt-1">Manage your product stock levels</p>
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <LoadingOverlay loading={statsLoading}>
              <Card>
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
              <Card>
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
              <Card>
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
              <Card>
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

          <Card>
            <CardHeader>
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
                      value={searchTerm}
                      onChange={handleSearchChange}
                      className="pl-10 pr-4 py-2 border border-slate-200 rounded-md w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-primary/50"
                      aria-label="Search inventory items"
                    />
                  </div>
                  <select
                    value={statusFilter}
                    onChange={handleStatusChange}
                    className="px-4 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 bg-white"
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
            <CardContent>
              <LoadingOverlay loading={loading}>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="text-left font-medium p-3 pl-0">Product</th>
                        <th className="text-left font-medium p-3">SKU</th>
                        <th className="text-center font-medium p-3">Stock</th>
                                                <th className="text-right font-medium p-3">Price</th>
                        <th className="text-left font-medium p-3">Status</th>
                        <th className="text-right font-medium p-3 pr-0">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {inventory.map(item => (
                        <tr key={item.id} className="border-b border-slate-100">
                          <td className="p-3 pl-0 font-medium">
                            {item.name}
                            {item.variantName && (
                              <span className="block text-xs text-slate-500">{item.variantName}</span>
                            )}
                          </td>
                          <td className="p-3">{item.sku}</td>
                          <td className="p-3 text-center">{item.quantity}</td>
                          <td className="p-3 text-right">{formatPrice(item.price)}</td>
                          <td className="p-3">
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
                          </td>
                          <td className="p-3 pr-0 text-right">
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
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </LoadingOverlay>
            </CardContent>
            <CardContent>
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
                    className="px-4 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 bg-white"
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

          <Card>
            <CardHeader>
              <CardTitle>Low Stock Alerts</CardTitle>
              <CardDescription>Products requiring attention</CardDescription>
            </CardHeader>
            <CardContent>
              <LoadingOverlay loading={lowStockLoading}>
                {lowStockItems.length === 0 ? (
                  <div className="text-center text-slate-500 py-6">
                    No low stock items found
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-200">
                          <th className="text-left font-medium p-3 pl-0">Product</th>
                          <th className="text-left font-medium p-3">SKU</th>
                          <th className="text-center font-medium p-3">Stock</th>
                          <th className="text-right font-medium p-3 pr-0">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {lowStockItems.map(item => (
                          <tr key={item.id} className="border-b border-slate-100">
                            <td className="p-3 pl-0 font-medium">
                              {item.name}
                              {item.variantName && (
                                <span className="block text-xs text-slate-500">{item.variantName}</span>
                              )}
                            </td>
                            <td className="p-3">{item.sku}</td>
                            <td className="p-3 text-center">{item.quantity}</td>
                            <td className="p-3 pr-0 text-right">
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
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </LoadingOverlay>
            </CardContent>
          </Card>

          {showAdjustmentModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" role="dialog" aria-modal="true">
              <div className="bg-white rounded-lg shadow-lg w-full max-w-md mx-4">
                <div className="p-6">
                  <h3 className="text-xl font-heading font-medium text-secondary mb-4">
                    Adjust Inventory: {selectedItem?.name}
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-secondary mb-1">
                        Current Stock
                      </label>
                      <input
                        type="text"
                        value={selectedItem?.quantity}
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
                          className="w-full px-4 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 text-center"
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
                        className="w-full px-4 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 bg-white"
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
                  <div className="flex justify-end mt-6 space-x-3">
                    <Button
                      variant="outline"
                      onClick={closeAdjustmentModal}
                      disabled={adjustmentLoading}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="default"
                      onClick={handleAdjustment}
                      disabled={adjustmentLoading || !adjustmentReason}
                      className="flex items-center"
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

InventoryPage.propTypes = {
  inventory: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      name: PropTypes.string,
      sku: PropTypes.string,
      stock: PropTypes.number,
      reorder_point: PropTypes.number,
      price: PropTypes.number,
      status: PropTypes.string,
      variant: PropTypes.string,
    })
  ),
  inventoryStats: PropTypes.shape({
    totalProducts: PropTypes.number,
    inStockCount: PropTypes.number,
    lowStockCount: PropTypes.number,
    outOfStockCount: PropTypes.number,
    totalInventoryValue: PropTypes.number,
  }),
};

export default InventoryPage;