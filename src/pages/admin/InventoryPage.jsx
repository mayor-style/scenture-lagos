import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { formatPrice } from '../../lib/utils';
import { LoadingOverlay } from '../../components/ui/LoadingState';
import ErrorState from '../../components/ui/ErrorState';
import { useToast } from '../../components/ui/Toast';
import InventoryService from '../../services/admin/inventory.service';
import { debounce } from 'lodash';
import { Search, FileText, Download, RefreshCw, Package, CheckCircle, AlertTriangle, Plus, Minus, ChevronLeft, ChevronRight, Settings } from 'lucide-react';
import { Input } from '../../components/ui/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/Select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '../../components/ui/Dialog';

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
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page'), 10) || 1);
  const [itemsPerPage, setItemsPerPage] = useState(parseInt(searchParams.get('limit'), 10) || 10);
  
  const [loading, setLoading] = useState(true);
  const [lowStockLoading, setLowStockLoading] = useState(true);
  const [adjustmentLoading, setAdjustmentLoading] = useState(false);
  const [error, setError] = useState(null);

  const [selectedItem, setSelectedItem] = useState(null);
  const [adjustmentQuantity, setAdjustmentQuantity] = useState(0);
  const [adjustmentReason, setAdjustmentReason] = useState('');
  const [isAdjustmentModalOpen, setIsAdjustmentModalOpen] = useState(false);

  const fetchInventoryData = useCallback(async () => {
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
      setTotalItems(data.pagination?.total || 0);

      const stats = data.summary || {};
      setInventoryStats({
        totalProducts: stats.totalProducts || 0,
        inStockCount: stats.inStockProducts || 0,
        lowStockCount: stats.lowStockProducts || 0,
        outOfStockCount: stats.outOfStockProducts || 0,
        totalInventoryValue: data.totalInventoryValue || 0,
      });

    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to load inventory data';
      setError(errorMessage);
      addToast(errorMessage, 'error');
      setInventory([]);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage, searchTerm, statusFilter, addToast]);
  
  const fetchLowStockItems = useCallback(async () => {
    setLowStockLoading(true);
    try {
      const data = await InventoryService.getLowStockItems({ limit: 10 });
      setLowStockItems(Array.isArray(data.items) ? data.items : []);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to load low stock items';
      addToast(errorMessage, 'error');
    } finally {
      setLowStockLoading(false);
    }
  }, [addToast]);
  
  // Effect for syncing state with URL
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchTerm) params.set('search', searchTerm);
    if (statusFilter !== 'all') params.set('status', statusFilter);
    if (currentPage !== 1) params.set('page', currentPage.toString());
    if (itemsPerPage !== 10) params.set('limit', itemsPerPage.toString());

    navigate(`${location.pathname}?${params.toString()}`, { replace: true });
  }, [searchTerm, statusFilter, currentPage, itemsPerPage, navigate, location.pathname]);

  // Effect for fetching data when filters change
  useEffect(() => {
    fetchInventoryData();
  }, [fetchInventoryData]);

  // Effect for initial load of secondary data
  useEffect(() => {
    fetchLowStockItems();
  }, [fetchLowStockItems]);

  const debouncedSearch = useCallback(
    debounce((value) => {
      setSearchTerm(value);
      setCurrentPage(1);
    }, 300),
    []
  );

  const handleSearchChange = (e) => {
    debouncedSearch(e.target.value);
  };

  const handleRefresh = () => {
    fetchInventoryData();
    fetchLowStockItems();
    addToast('Inventory data refreshed', 'success');
  };

  const openAdjustmentModal = (item) => {
    setSelectedItem(item);
    setIsAdjustmentModalOpen(true);
  };

  const closeAdjustmentModal = () => {
    setIsAdjustmentModalOpen(false);
    setSelectedItem(null);
    setAdjustmentQuantity(0);
    setAdjustmentReason('');
  };

  const handleAdjustment = async () => {
    if (!adjustmentReason || adjustmentQuantity === 0) {
      addToast('Please provide a non-zero quantity and a reason', 'error');
      return;
    }
    // ✅ CORRECT: Check against `stockQuantity`
    if (selectedItem.stockQuantity + adjustmentQuantity < 0) {
      addToast('Adjustment would result in negative stock', 'error');
      return;
    }

    setAdjustmentLoading(true);
    try {
      await InventoryService.adjustStock(selectedItem._id, {
        adjustment: adjustmentQuantity,
        reason: adjustmentReason,
      });
      addToast('Inventory updated successfully', 'success');
      closeAdjustmentModal();
      // Refetch all data to reflect changes
      fetchInventoryData();
      fetchLowStockItems();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to update inventory', 'error');
    } finally {
      setAdjustmentLoading(false);
    }
  };
  
  const downloadFile = (blob, filename) => {
    const url = window.URL.createObjectURL(new Blob([blob]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  }

  const handleGenerateReport = async () => {
    addToast('Generating report...', 'info');
    try {
      const blob = await InventoryService.generateReport();
      downloadFile(blob, `inventory-report-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (err) {
      addToast(err.message || 'Failed to generate report', 'error');
    }
  };

  const handleExportCSV = async () => {
    addToast('Exporting CSV...', 'info');
    try {
      const blob = await InventoryService.exportCSV();
      downloadFile(blob, `inventory-export-${new Date().toISOString().split('T')[0]}.csv`);
    } catch (err) {
      addToast(err.message || 'Failed to export CSV', 'error');
    }
  };

  const totalPages = Math.ceil(totalItems / itemsPerPage);
  
  const { totalProducts, inStockCount, lowStockCount, outOfStockCount, totalInventoryValue } = inventoryStats;
  
  const STATS_CARDS = [
    { title: 'Total Products', value: totalProducts, icon: <Package className="h-6 w-6 text-primary" />, bg: 'bg-primary/10' },
    { title: 'In Stock', value: inStockCount, icon: <CheckCircle className="h-6 w-6 text-green-600" />, bg: 'bg-green-50' },
    { title: 'Low Stock', value: lowStockCount, icon: <AlertTriangle className="h-6 w-6 text-yellow-600" />, bg: 'bg-yellow-50' },
    { title: 'Inventory Value', value: formatPrice(totalInventoryValue, { notation: 'compact' }), icon: <Package className="h-6 w-6 text-blue-600" />, bg: 'bg-blue-50' },
  ];
  
  const getStatusLabel = (status) => STATUS_OPTIONS.find(opt => opt.value === status)?.label || 'Unknown';
  
  const renderItemCard = (item) => (
    // ✅ CORRECT: Use `_id` for key, remove `Math.random`
    <Card key={item._id} className="group border-primary/20 bg-background hover:shadow-lg transition-all duration-300">
      <CardContent className="p-4 flex flex-col justify-between h-full">
        <div>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex-shrink-0 flex items-center justify-center">
                <Package className="h-4 w-4 text-primary" />
              </div>
              <div className="space-y-0.5">
                <div className="text-sm font-medium text-secondary truncate max-w-[150px]" title={item.name}>
                  {item.name || 'Unknown'}
                </div>
                 {/* ✅ CORRECT: Removed variant name logic which was not supported by data */}
              </div>
            </div>
            <span className={`px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap ${
                item.status === 'in_stock' ? 'bg-green-50 text-green-700'
                : item.status === 'low_stock' ? 'bg-yellow-50 text-yellow-700'
                : 'bg-red-50 text-red-700'
            }`}>
              {getStatusLabel(item.status)}
            </span>
          </div>
          <div className="mt-3 space-y-1.5 text-sm">
            <div className="flex items-center">
              <span className="font-medium text-muted-foreground mr-2 w-16">SKU:</span>
              <span className="truncate">{item.sku || 'N/A'}</span>
            </div>
            <div className="flex items-center">
              <span className="font-medium text-muted-foreground mr-2 w-16">Stock:</span>
              {/* ✅ CORRECT: Use `stockQuantity` */}
              <span>{item.stockQuantity ?? 0}</span>
            </div>
            <div className="flex items-center">
              <span className="font-medium text-muted-foreground mr-2 w-16">Price:</span>
              <span>{formatPrice(item.price || 0)}</span>
            </div>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={() => openAdjustmentModal(item)} disabled={loading || adjustmentLoading} className="group mt-4 w-full hover:bg-primary/10">
          <Package className="mr-2 h-4 w-4 group-hover:text-primary" />
          Adjust Stock
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <>
      <Helmet>
        <title>Inventory Management | Scenture Lagos Admin</title>
      </Helmet>
      {error && !loading ? (
        <ErrorState title="Failed to load inventory" message={error} onRetry={fetchInventoryData} className="py-12" />
      ) : (
        <div className="container mx-auto space-y-6 py-6 sm:py-8">
          {/* Header */}
          <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-4 sm:px-0">
            <div>
              <h1 className="text-2xl sm:text-3xl font-heading font-medium text-secondary tracking-tight">Inventory Management</h1>
              <p className="text-sm text-muted-foreground mt-1.5">Track and manage your product stock levels</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button as={Link} to="/admin/settings?tab=inventory" variant="outline" size="sm"><Settings className="mr-2 h-4 w-4" />Settings</Button>
              <Button variant="outline" size="sm" onClick={handleGenerateReport}><FileText className="mr-2 h-4 w-4" />Report</Button>
              <Button variant="outline" size="sm" onClick={handleExportCSV}><Download className="mr-2 h-4 w-4" />Export</Button>
              <Button variant="default" size="sm" onClick={handleRefresh} disabled={loading || lowStockLoading}>
                <RefreshCw className={`mr-2 h-4 w-4 ${loading || lowStockLoading ? 'animate-spin' : ''}`} />
                {loading || lowStockLoading ? 'Refreshing...' : 'Refresh'}
              </Button>
            </div>
          </header>

          {/* Stats Cards */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {STATS_CARDS.map(({ title, value, icon, bg }, index) => (
              <LoadingOverlay key={index} loading={loading}>
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
                      {loading ? 'Loading...' : `Showing ${Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)} to ${Math.min(currentPage * itemsPerPage, totalItems)} of ${totalItems} items`}
                    </CardDescription>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input placeholder="Search by name or SKU..." defaultValue={searchTerm} onChange={handleSearchChange} className="pl-10 w-full sm:w-64" />
                    </div>
                    <Select value={statusFilter} onValueChange={(value) => { setStatusFilter(value); setCurrentPage(1); }} disabled={loading}>
                      <SelectTrigger className="w-full sm:w-48"><SelectValue /></SelectTrigger>
                      <SelectContent>{STATUS_OPTIONS.map(({ value, label }) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </div>
            </CardHeader>
            <CardContent className="p-5 sm:p-6">
              <LoadingOverlay loading={loading}>
                {!loading && inventory.length === 0 ? (
                  <div className="py-8 text-center text-muted-foreground text-sm">No inventory items found for the current filters.</div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {inventory.map(renderItemCard)}
                  </div>
                )}
              </LoadingOverlay>
            </CardContent>
             {totalPages > 1 && (
                <CardContent className="p-5 sm:p-6 border-t border-primary/10">
                  {/* Pagination component here */}
                </CardContent>
            )}
          </Card>

          {/* Low Stock Alerts */}
          <Card className="border-primary/20 bg-background">
              <CardHeader className="p-5 sm:p-6">
                <CardTitle className="text-xl font-heading text-secondary">Low Stock Alerts</CardTitle>
                <CardDescription className="text-sm text-muted-foreground mt-1">Products requiring immediate attention</CardDescription>
              </CardHeader>
              <CardContent className="p-5 sm:p-6">
                <LoadingOverlay loading={lowStockLoading}>
                  {!lowStockLoading && lowStockItems.length === 0 ? (
                    <div className="py-8 text-center text-muted-foreground text-sm">No low stock items found. Great job!</div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {lowStockItems.map(renderItemCard)}
                    </div>
                  )}
                </LoadingOverlay>
              </CardContent>
          </Card>

          {/* Adjustment Modal */}
          <Dialog open={isAdjustmentModalOpen} onOpenChange={setIsAdjustmentModalOpen}>
            <DialogContent className="sm:max-w-md bg-background border-primary/20">
              <DialogHeader>
                <DialogTitle className="text-xl font-heading text-secondary">Adjust Stock: {selectedItem?.name}</DialogTitle>
                <DialogDescription>Modify the stock for SKU: {selectedItem?.sku || 'N/A'}</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <label className="block text-sm font-medium text-secondary mb-1.5">Current Stock</label>
                   {/* ✅ CORRECT: Use `stockQuantity` */}
                  <Input value={selectedItem?.stockQuantity ?? 0} disabled className="bg-muted/50" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary mb-1.5">Adjustment Quantity</label>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={() => setAdjustmentQuantity(q => q - 1)} disabled={adjustmentLoading}><Minus className="h-4 w-4" /></Button>
                    <Input type="number" value={adjustmentQuantity} onChange={(e) => setAdjustmentQuantity(parseInt(e.target.value, 10) || 0)} className="text-center" />
                    <Button variant="outline" size="icon" onClick={() => setAdjustmentQuantity(q => q + 1)} disabled={adjustmentLoading}><Plus className="h-4 w-4" /></Button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary mb-1.5">Reason</label>
                  <Select value={adjustmentReason} onValueChange={setAdjustmentReason} disabled={adjustmentLoading}>
                    <SelectTrigger><SelectValue placeholder="Select a reason" /></SelectTrigger>
                    <SelectContent>{['restock', 'return', 'damage', 'theft', 'correction', 'other'].map(r => <SelectItem key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={closeAdjustmentModal} disabled={adjustmentLoading}>Cancel</Button>
                <Button onClick={handleAdjustment} disabled={adjustmentLoading || !adjustmentReason || adjustmentQuantity === 0}>
                  {adjustmentLoading ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />}
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