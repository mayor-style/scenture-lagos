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
import { Input } from '../../components/ui/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/Select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription, DialogTrigger } from '../../components/ui/Dialog';

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Status' },
  { value: 'in_stock', label: 'In Stock' },
  { value: 'low_stock', label: 'Low Stock' },
  { value: 'out_of_stock', label: 'Out of Stock' },
];

const InventoryPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { addToast } = useToast();
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
  const [currentPage, setCurrentPage] = useState(
    Number.isInteger(parseInt(searchParams.get('page'))) ? parseInt(searchParams.get('page')) : 1
  );
  const [itemsPerPage, setItemsPerPage] = useState(
    Number.isInteger(parseInt(searchParams.get('limit'))) ? parseInt(searchParams.get('limit')) : 5
  );
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
      setInventory(Array.isArray(data.items) ? data.items : []);
      setTotalItems(Number.isInteger(data.total) ? data.total : 0);
    } catch (err) {
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
      setInventoryStats({
        totalProducts: stats.totalProducts || 0,
        inStockCount: stats.inStockCount || 0,
        lowStockCount: stats.lowStockCount || 0,
        outOfStockCount: stats.outOfStockCount || 0,
        totalInventoryValue: stats.totalValue || 0,
      });
    } catch (err) {
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
      setLowStockItems(Array.isArray(data.items) ? data.items : []);
    } catch (err) {
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
    return handleSearchChange.cancel;
  }, []);

  const handleStatusChange = (value) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  const handleRefresh = () => {
    fetchInventory();
    fetchInventoryStats();
    fetchLowStockItems();
    addToast('Inventory data refreshed', 'success');
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
      addToast('Please select a reason', 'error');
      return;
    }
    if (adjustmentQuantity === 0) {
      addToast('Adjustment quantity cannot be zero', 'error');
      return;
    }
    if (selectedItem.quantity + parseInt(adjustmentQuantity) < 0) {
      addToast('Cannot adjust to negative stock', 'error');
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
      const errorMessage = err.response?.data?.message || 'Failed to update inventory';
      addToast(errorMessage, 'error');
    } finally {
      setAdjustmentLoading(false);
    }
  };

  const handleGenerateReport = async () => {
    try {
      const blob = await InventoryService.generateReport();
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `inventory-report-${new Date().toISOString().split('T')[0]}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      addToast('Report generated successfully', 'success');
    } catch (err) {
      const errorMessage = err.message || 'Failed to generate report';
      addToast(errorMessage, 'error');
    }
  };

  const handleExportCSV = async () => {
    try {
      const blob = await InventoryService.exportCSV();
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `inventory-export-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      addToast('CSV exported successfully', 'success');
    } catch (err) {
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
      for (let i = 1; i <= totalPages; i++) buttons.push(i);
    } else {
      buttons.push(1);
      let startPage = Math.max(2, currentPage - 1);
      let endPage = Math.min(totalPages - 1, currentPage + 1);
      if (currentPage <= 3) endPage = 4;
      if (currentPage >= totalPages - 2) startPage = totalPages - 3;
      if (startPage > 2) buttons.push('...');
      for (let i = startPage; i <= endPage; i++) buttons.push(i);
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
        <div className="container mx-auto space-y-6 py-6 sm:py-8">
          {/* Header */}
          <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-4 sm:px-0">
            <div>
              <h1 className="text-2xl sm:text-3xl font-heading font-medium text-secondary tracking-tight">
                Inventory Management
              </h1>
              <p className="text-sm text-muted-foreground mt-1.5">Track and manage your product stock levels</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link to="/admin/settings?tab=general">
                <Button variant="outline" size="sm" className="group hover:bg-primary/10">
                  <Settings className="mr-2 h-4 w-4 group-hover:text-primary" />
                  Settings
                </Button>
              </Link>
              <Button variant="outline" size="sm" onClick={handleGenerateReport} className="group hover:bg-primary/10">
                <FileText className="mr-2 h-4 w-4 group-hover:text-primary" />
                Generate Report
              </Button>
              <Button variant="outline" size="sm" onClick={handleExportCSV} className="group hover:bg-primary/10">
                <Download className="mr-2 h-4 w-4 group-hover:text-primary" />
                Export CSV
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={handleRefresh}
                disabled={loading || statsLoading || lowStockLoading}
                className="group"
              >
                <RefreshCw
                  className={`mr-2 h-4 w-4 ${loading || statsLoading || lowStockLoading ? 'animate-spin' : ''}`}
                />
                {loading || statsLoading || lowStockLoading ? 'Refreshing...' : 'Refresh'}
              </Button>
            </div>
          </header>

          {/* Stats Cards */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                title: 'Total Products',
                value: totalProducts,
                icon: <Package className="h-6 w-6 text-primary" />,
                bg: 'bg-primary/10',
              },
              {
                title: 'In Stock',
                value: inStockCount,
                icon: <CheckCircle className="h-6 w-6 text-green-600" />,
                bg: 'bg-green-50',
              },
              {
                title: 'Low Stock',
                value: lowStockCount,
                icon: <AlertTriangle className="h-6 w-6 text-yellow-600" />,
                bg: 'bg-yellow-50',
              },
              {
                title: 'Inventory Value',
                value: formatPrice(totalInventoryValue, { notation: 'compact' }),
                icon: <Package className="h-6 w-6 text-blue-600" />,
                bg: 'bg-blue-50',
              },
            ].map(({ title, value, icon, bg }, index) => (
              <LoadingOverlay key={index} loading={statsLoading}>
                <Card className="group relative overflow-hidden border-primary/20 bg-background hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground font-medium">{title}</p>
                        <h3 className="text-xl font-semibold text-secondary tracking-tight">{value}</h3>
                      </div>
                      <div className={`h-10 w-10 rounded-full ${bg} flex items-center justify-center`}>{icon}</div>
                    </div>
                  </CardContent>
                </Card>
              </LoadingOverlay>
            ))}
          </section>

          {/* Inventory List */}
          <Card className="border-primary/20 bg-background">
            <CardHeader className="p-5 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle className="text-xl font-heading text-secondary">Inventory List</CardTitle>
                  <CardDescription className="text-sm text-muted-foreground mt-1">
                    {loading ? 'Loading...' : `${totalItems} items found`}
                  </CardDescription>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Search inventory..."
                      defaultValue={searchTerm}
                      onChange={handleSearchChange}
                      className="pl-10 w-full sm:w-64 bg-background border-primary/20 focus:ring-primary/50 hover:shadow-sm transition-shadow"
                      aria-label="Search inventory items"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={handleStatusChange} disabled={loading}>
                    <SelectTrigger className="w-full sm:w-48 bg-background border-primary/20 focus:ring-primary/50 hover:shadow-sm">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map(({ value, label }) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-5 sm:p-6">
              <LoadingOverlay loading={loading}>
                {inventory.length === 0 ? (
                  <div className="py-8 text-center text-muted-foreground text-sm">No inventory items found</div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3  gap-4">
                    {inventory.map((item) => (
                      <Card
                        key={item.id || Math.random()}
                        className="group border-primary/20 bg-background hover:shadow-lg transition-all duration-300"
                      >
                        <CardContent className="p-4">
                          <div className="flex flex-col space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                  <Package className="h-4 w-4 text-primary" />
                                </div>
                                <div className="space-y-0.5">
                                  <div className="text-sm font-medium text-secondary truncate max-w-[150px]">
                                    {item.name || 'Unknown'}
                                  </div>
                                  {item.variantName && (
                                    <div className="text-xs text-muted-foreground truncate max-w-[150px]">
                                      {typeof item.variantName === 'string' ? item.variantName : item.variant?.title || 'N/A'}
                                    </div>
                                  )}
                                </div>
                              </div>
                              <span
                                className={`px-2 py-1 text-xs font-medium rounded-full ${
                                  item.status === 'in_stock'
                                    ? 'bg-green-50 text-green-700'
                                    : item.status === 'low_stock'
                                    ? 'bg-yellow-50 text-yellow-700'
                                    : 'bg-red-50 text-red-700'
                                }`}
                              >
                                {item.status === 'in_stock' ? 'In Stock' : item.status === 'low_stock' ? 'Low Stock' : 'Out of Stock'}
                              </span>
                            </div>
                            <div className="space-y-1.5 text-sm">
                              <div className="flex items-center">
                                <span className="font-medium text-muted-foreground mr-2">SKU:</span>
                                <span className="truncate">{item.sku || 'N/A'}</span>
                              </div>
                              <div className="flex items-center">
                                <span className="font-medium text-muted-foreground mr-2">Stock:</span>
                                <span>{item.quantity ?? 0}</span>
                              </div>
                              <div className="flex items-center">
                                <span className="font-medium text-muted-foreground mr-2">Price:</span>
                                <span>{formatPrice(item.price || 0, { notation: 'compact' })}</span>
                              </div>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openAdjustmentModal(item)}
                              disabled={loading || adjustmentLoading}
                              className="group mt-3 w-full hover:bg-primary/10"
                            >
                              <Package className="mr-2 h-4 w-4 group-hover:text-primary" />
                              Adjust
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </LoadingOverlay>
            </CardContent>
            <CardContent className="p-5 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="text-sm text-muted-foreground">
                  Showing {indexOfFirstItem} to {indexOfLastItem} of {totalItems} items
                </div>
                <div className="flex items-center gap-2">
                  <Select
                    value={itemsPerPage.toString()}
                    onValueChange={(value) => {
                      setItemsPerPage(parseInt(value));
                      setCurrentPage(1);
                    }}
                    disabled={loading}
                  >
                    <SelectTrigger className="w-32 bg-background border-primary/20 focus:ring-primary/50 hover:shadow-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[5, 10, 20, 50].map((value) => (
                        <SelectItem key={value} value={value.toString()}>
                          {value} per page
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1 || loading}
                      className="h-8 w-8 hover:bg-primary/10"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    {getPaginationButtons().map((page, index) => (
                      <Button
                        key={index}
                        variant={page === currentPage ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => typeof page === 'number' && handlePageChange(page)}
                        disabled={typeof page !== 'number' || loading}
                        className="h-8 w-8 hover:bg-primary/10"
                      >
                        {page}
                      </Button>
                    ))}
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages || loading}
                      className="h-8 w-8 hover:bg-primary/10"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Low Stock Alerts */}
          <Card className="border-primary/20 bg-background">
            <CardHeader className="p-5 sm:p-6">
              <CardTitle className="text-xl font-heading text-secondary">Low Stock Alerts</CardTitle>
              <CardDescription className="text-sm text-muted-foreground mt-1">
                Products requiring immediate attention
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5 sm:p-6">
              <LoadingOverlay loading={lowStockLoading}>
                {lowStockItems.length === 0 ? (
                  <div className="py-8 text-center text-muted-foreground text-sm">No low stock items found</div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3  gap-4">
                    {lowStockItems.map((item) => (
                      <Card
                        key={item.id || Math.random()}
                        className="group border-primary/20 bg-background hover:shadow-lg transition-all duration-300"
                      >
                        <CardContent className="p-4">
                          <div className="flex flex-col space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-full bg-yellow-50 flex items-center justify-center">
                                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                                </div>
                                <div className="space-y-0.5">
                                  <div className="text-sm font-medium text-secondary truncate max-w-[150px]">
                                    {item.name || 'Unknown'}
                                  </div>
                                  {item.variantName && (
                                    <div className="text-xs text-muted-foreground truncate max-w-[150px]">
                                      {typeof item.variantName === 'string' ? item.variantName : item.variant?.title || 'N/A'}
                                    </div>
                                  )}
                                </div>
                              </div>
                              <span
                                className={`px-2 py-1 text-xs font-medium rounded-full ${
                                  item.status === 'low_stock' ? 'bg-yellow-50 text-yellow-700' : 'bg-red-50 text-red-700'
                                }`}
                              >
                                {item.status === 'low_stock' ? 'Low Stock' : 'Out of Stock'}
                              </span>
                            </div>
                            <div className="space-y-1.5 text-sm">
                              <div className="flex items-center">
                                <span className="font-medium text-muted-foreground mr-2">SKU:</span>
                                <span className="truncate">{item.sku || 'N/A'}</span>
                              </div>
                              <div className="flex items-center">
                                <span className="font-medium text-muted-foreground mr-2">Stock:</span>
                                <span>{item.quantity ?? 0}</span>
                              </div>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openAdjustmentModal(item)}
                              disabled={loading || adjustmentLoading}
                              className="group mt-3 w-full hover:bg-primary/10"
                            >
                              <Package className="mr-2 h-4 w-4 group-hover:text-primary" />
                              Adjust
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </LoadingOverlay>
            </CardContent>
          </Card>

          {/* Adjustment Modal */}
         <Dialog open={showAdjustmentModal} onOpenChange={setShowAdjustmentModal}>
  <DialogContent className="sm:max-w-md bg-background border-primary/20">
    <DialogHeader>
      <DialogTitle className="text-xl font-heading text-secondary">
        Adjust Inventory: {selectedItem?.name || 'Unknown'}
      </DialogTitle>
      <DialogDescription>Modify the stock quantity for this item.</DialogDescription>
    </DialogHeader>
    <div className="space-y-4 py-4">
      <div>
        <label className="block text-sm font-medium text-secondary mb-1.5">Current Stock</label>
        <Input
          value={selectedItem?.quantity ?? 0}
          disabled
          className="bg-muted/50 border-primary/20 text-secondary"
          aria-label="Current stock"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-secondary mb-1.5">Adjustment Quantity</label>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setAdjustmentQuantity((prev) => prev - 1)}
            disabled={adjustmentLoading}
            className="h-8 w-8 hover:bg-primary/10"
          >
            <Minus className="h-4 w-4" />
          </Button>
          <Input
            type="number"
            value={adjustmentQuantity}
            onChange={(e) => setAdjustmentQuantity(parseInt(e.target.value) || 0)}
            className="text-center border-primary/20 focus:ring-primary/50 hover:shadow-sm"
            aria-label="Adjustment quantity"
          />
          <Button
            variant="outline"
            size="icon"
            onClick={() => setAdjustmentQuantity((prev) => prev + 1)}
            disabled={adjustmentLoading}
            className="h-8 w-8 hover:bg-primary/10"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-secondary mb-1.5">Reason</label>
        <Select
          value={adjustmentReason}
          onValueChange={setAdjustmentReason}
          disabled={adjustmentLoading}
        >
          <SelectTrigger className="bg-background border-primary/20 focus:ring-primary/50 hover:shadow-sm">
            <SelectValue placeholder="Select a reason" />
          </SelectTrigger>
          <SelectContent>
            {['restock', 'return', 'damage', 'theft', 'correction', 'other'].map((reason) => (
              <SelectItem key={reason} value={reason}>
                {reason.charAt(0).toUpperCase() + reason.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
    <DialogFooter className="flex flex-col sm:flex-row gap-3 sm:gap-2">
      <Button
        variant="outline"
        onClick={closeAdjustmentModal}
        disabled={adjustmentLoading}
        className="w-full sm:w-auto hover:bg-primary/10"
      >
        Cancel
      </Button>
      <Button
        variant="default"
        onClick={handleAdjustment}
        disabled={adjustmentLoading || !adjustmentReason}
        className="w-full sm:w-auto"
      >
        {adjustmentLoading ? (
          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <CheckCircle className="mr-2 h-4 w-4" />
        )}
        {adjustmentLoading ? 'Adjusting...' : 'Adjust Stock'}
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
        </div>
      )}
    </>
  );
};

export default InventoryPage;