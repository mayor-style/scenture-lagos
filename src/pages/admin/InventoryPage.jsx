import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { formatPrice } from '../../lib/utils';
import { LoadingOverlay,LoadingState,  EmptyState } from '../../components/ui/LoadingState';
import ErrorState from '../../components/ui/ErrorState';
import { toast } from 'react-hot-toast';
import InventoryService from '../../services/admin/inventory.service';
import {
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Package,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Plus,
  Minus,
  RefreshCw,
  FileText,
  Download
} from 'lucide-react';

// Status options for filtering
const STATUS_OPTIONS = [
  { value: 'all', label: 'All Status' },
  { value: 'in_stock', label: 'In Stock' },
  { value: 'low_stock', label: 'Low Stock' },
  { value: 'out_of_stock', label: 'Out of Stock' }
];

const InventoryPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  
  // State for inventory data
  const [inventory, setInventory] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [inventoryStats, setInventoryStats] = useState({
    totalProducts: 0,
    inStockCount: 0,
    lowStockCount: 0,
    outOfStockCount: 0,
    totalInventoryValue: 0
  });
  
  // State for filters and pagination
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'all');
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page')) || 1);
  const [itemsPerPage, setItemsPerPage] = useState(parseInt(searchParams.get('limit')) || 5);
  
  // State for loading and error handling
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [lowStockLoading, setLowStockLoading] = useState(true);
  
  // State for adjustment modal
  const [selectedItem, setSelectedItem] = useState(null);
  const [adjustmentQuantity, setAdjustmentQuantity] = useState(0);
  const [adjustmentReason, setAdjustmentReason] = useState('');
  const [showAdjustmentModal, setShowAdjustmentModal] = useState(false);
  const [adjustmentLoading, setAdjustmentLoading] = useState(false);

  // Update URL when filters or pagination change
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchTerm) params.set('search', searchTerm);
    if (statusFilter !== 'all') params.set('status', statusFilter);
    if (currentPage !== 1) params.set('page', currentPage.toString());
    if (itemsPerPage !== 5) params.set('limit', itemsPerPage.toString());
    
    const newUrl = `${location.pathname}${params.toString() ? `?${params.toString()}` : ''}`;
    navigate(newUrl, { replace: true });
  }, [searchTerm, statusFilter, currentPage, itemsPerPage, navigate, location.pathname]);

  // Fetch inventory data
  const fetchInventory = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm,
        ...(statusFilter !== 'all' && { status: statusFilter })
      };
      
      const data = await InventoryService.getInventory(params);
      setInventory(data.items || []);
      setTotalItems(data.total || 0);
      
    } catch (err) {
      console.error('Error fetching inventory:', err);
      setError(err);
      // Fallback to empty data in development mode
      if (process.env.NODE_ENV === 'development') {
        setInventory([]);
        setTotalItems(0);
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch inventory statistics
  const fetchInventoryStats = async () => {
    setStatsLoading(true);
    
    try {
      const stats = await InventoryService.getInventoryStatistics();
      setInventoryStats({
        totalProducts: stats.totalProducts || 0,
        inStockCount: stats.inStockCount || 0,
        lowStockCount: stats.lowStockCount || 0,
        outOfStockCount: stats.outOfStockCount || 0,
        totalInventoryValue: stats.totalValue || 0
      });
    } catch (err) {
      console.error('Error fetching inventory statistics:', err);
      // Fallback to zero values
      setInventoryStats({
        totalProducts: 0,
        inStockCount: 0,
        lowStockCount: 0,
        outOfStockCount: 0,
        totalInventoryValue: 0
      });
    } finally {
      setStatsLoading(false);
    }
  };

  // Fetch low stock items
  const fetchLowStockItems = async () => {
    setLowStockLoading(true);
    
    try {
      const data = await InventoryService.getLowStockItems({ limit: 10 });
      setLowStockItems(data.items || []);
    } catch (err) {
      console.error('Error fetching low stock items:', err);
      setLowStockItems([]);
    } finally {
      setLowStockLoading(false);
    }
  };

  // Load data on component mount and when filters/pagination change
  useEffect(() => {
    fetchInventory();
  }, [currentPage, itemsPerPage, searchTerm, statusFilter]);

  useEffect(() => {
    fetchInventoryStats();
    fetchLowStockItems();
  }, []);

  // Handle page change
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Handle search change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page on search
  };

  // Handle status filter change
  const handleStatusChange = (e) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1); // Reset to first page on filter change
  };

  // Handle refresh button click
  const handleRefresh = () => {
    fetchInventory();
    fetchInventoryStats();
    fetchLowStockItems();
    toast({
      title: 'Refreshed',
      description: 'Inventory data has been refreshed',
      variant: 'success'
    });
  };

  // Open adjustment modal
  const openAdjustmentModal = (item) => {
    setSelectedItem(item);
    setAdjustmentQuantity(0);
    setAdjustmentReason('');
    setShowAdjustmentModal(true);
  };

  // Close adjustment modal
  const closeAdjustmentModal = () => {
    setShowAdjustmentModal(false);
    setSelectedItem(null);
    setAdjustmentQuantity(0);
    setAdjustmentReason('');
  };

  // Handle stock adjustment
  const handleAdjustment = async () => {
    if (!adjustmentReason) {
      toast({
        title: 'Error',
        description: 'Please select a reason for the adjustment',
        variant: 'destructive'
      });
      return;
    }
    
    setAdjustmentLoading(true);
    
    try {
      const adjustmentData = {
        quantity: parseInt(adjustmentQuantity),
        reason: adjustmentReason
      };
      
      await InventoryService.adjustStock(selectedItem.id, adjustmentData);
      
      toast({
        title: 'Success',
        description: 'Inventory has been updated successfully',
        variant: 'success'
      });
      
      // Refresh data
      fetchInventory();
      fetchInventoryStats();
      fetchLowStockItems();
      
      closeAdjustmentModal();
    } catch (err) {
      console.error('Error adjusting inventory:', err);
      toast({
        title: 'Error',
        description: 'Failed to update inventory. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setAdjustmentLoading(false);
    }
  };

  // Calculate pagination values
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const indexOfFirstItem = (currentPage - 1) * itemsPerPage + 1;
  const indexOfLastItem = Math.min(currentPage * itemsPerPage, totalItems);
  
  // Generate pagination buttons with ellipsis for many pages
  const getPaginationButtons = () => {
    const buttons = [];
    
    if (totalPages <= 7) {
      // Show all pages if 7 or fewer
      for (let i = 1; i <= totalPages; i++) {
        buttons.push(i);
      }
    } else {
      // Always show first page
      buttons.push(1);
      
      // Calculate start and end of middle section
      let startPage = Math.max(2, currentPage - 1);
      let endPage = Math.min(totalPages - 1, currentPage + 1);
      
      // Adjust if at the beginning
      if (currentPage <= 3) {
        endPage = 4;
      }
      
      // Adjust if at the end
      if (currentPage >= totalPages - 2) {
        startPage = totalPages - 3;
      }
      
      // Add ellipsis after first page if needed
      if (startPage > 2) {
        buttons.push('...');
      }
      
      // Add middle pages
      for (let i = startPage; i <= endPage; i++) {
        buttons.push(i);
      }
      
      // Add ellipsis before last page if needed
      if (endPage < totalPages - 1) {
        buttons.push('...');
      }
      
      // Always show last page
      buttons.push(totalPages);
    }
    
    return buttons;
  };
  
  // Extract values from inventory stats
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
            <Button variant="outline" className="flex items-center">
              <FileText size={16} className="mr-2" />
              Generate Report
            </Button>
            <Button variant="outline" className="flex items-center">
              <Download size={16} className="mr-2" />
              Export CSV
            </Button>
            <Button 
              variant="default" 
              className="flex items-center"
              onClick={handleRefresh}
              disabled={loading || statsLoading || lowStockLoading}
            >
              <RefreshCw size={16} className="mr-2" className={loading ? 'animate-spin' : ''} />
              {loading ? 'Refreshing...' : 'Refresh'}
            </Button>
          </div>
        </div>

        {/* Inventory Overview Cards */}
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

        {/* Inventory List */}
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <CardTitle>Inventory List</CardTitle>
                <CardDescription>
                  {loading ? 'Loading...' : `${totalItems} items found`}
                </CardDescription>
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
                  />
                </div>
                
                <select
                  value={statusFilter}
                  onChange={handleStatusChange}
                  className="px-4 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 bg-white"
                  disabled={loading}
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
                      <th className="text-center font-medium p-3">Reorder Point</th>
                      <th className="text-right font-medium p-3">Price</th>
                      <th className="text-left font-medium p-3">Status</th>
                      <th className="text-right font-medium p-3 pr-0">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inventory.length > 0 ? (
                      inventory.map((item) => (
                        <tr key={item.id} className="border-b border-slate-100">
                          <td className="p-3 pl-0">
                            <div>
                              <div className="font-medium text-secondary">{item.name}</div>
                              {item.variant && (
                                <div className="text-xs text-slate-500">Variant: {item.variant}</div>
                              )}
                            </div>
                          </td>
                          <td className="p-3">{item.sku}</td>
                          <td className="p-3 text-center">{item.stock}</td>
                          <td className="p-3 text-center">{item.reorder_point}</td>
                          <td className="p-3 text-right">{formatPrice(item.price)}</td>
                          <td className="p-3">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              item.status === 'In Stock' ? 'bg-green-100 text-green-800' :
                              item.status === 'Low Stock' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {item.status}
                            </span>
                          </td>
                          <td className="p-3 pr-0 text-right">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => openAdjustmentModal(item)}
                              disabled={adjustmentLoading}
                            >
                              Adjust
                            </Button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="p-4 text-center text-slate-500">
                          {loading ? (
                            <LoadingState size="sm" text="Loading inventory items..." />
                          ) : (
                            "No inventory items found matching your criteria"
                          )}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {!loading && inventory.length > 0 && (
                <div className="flex items-center justify-between mt-6">
                  <div className="text-sm text-slate-500">
                    Showing {indexOfFirstItem} to {indexOfLastItem} of {totalItems} items
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1 || loading}
                    >
                      <ChevronLeft size={16} />
                    </Button>
                    
                    {getPaginationButtons().map((page, index) => (
                      page === '...' ? (
                        <span key={`ellipsis-${index}`} className="px-2">...</span>
                      ) : (
                        <Button
                          key={page}
                          variant={currentPage === page ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => handlePageChange(page)}
                          disabled={loading}
                        >
                          {page}
                        </Button>
                      )
                    ))}
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages || loading}
                    >
                      <ChevronRight size={16} />
                    </Button>
                  </div>
                </div>
              )}
            </LoadingOverlay>
          </CardContent>
        </Card>

        {/* Low Stock Alerts */}
        <Card>
          <CardHeader>
            <CardTitle>Low Stock Alerts</CardTitle>
            <CardDescription>
              Products that need to be restocked soon
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LoadingOverlay loading={lowStockLoading}>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left font-medium p-3 pl-0">Product</th>
                      <th className="text-left font-medium p-3">SKU</th>
                      <th className="text-center font-medium p-3">Current Stock</th>
                      <th className="text-center font-medium p-3">Reorder Point</th>
                      <th className="text-right font-medium p-3 pr-0">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lowStockItems.length > 0 ? (
                      lowStockItems.map((item) => (
                        <tr key={item.id} className="border-b border-slate-100">
                          <td className="p-3 pl-0">
                            <div>
                              <div className="font-medium text-secondary">{item.name}</div>
                              {item.variant && (
                                <div className="text-xs text-slate-500">Variant: {item.variant}</div>
                              )}
                            </div>
                          </td>
                          <td className="p-3">{item.sku}</td>
                          <td className="p-3 text-center">
                            <span className={`font-medium ${
                              item.stock === 0 ? 'text-red-600' : 'text-yellow-600'
                            }`}>
                              {item.stock}
                            </span>
                          </td>
                          <td className="p-3 text-center">{item.reorder_point}</td>
                          <td className="p-3 pr-0 text-right">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => openAdjustmentModal(item)}
                            >
                              Adjust
                            </Button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="p-4 text-center text-slate-500">
                          {lowStockLoading ? (
                            <LoadingState size="sm" text="Loading low stock items..." />
                          ) : (
                            "No low stock items found"
                          )}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </LoadingOverlay>
          </CardContent>
        </Card>
     

       {/* Stock Adjustment Modal */}
        {showAdjustmentModal && selectedItem && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-md mx-4">
              <div className="p-6">
                <h3 className="text-xl font-heading font-medium text-secondary mb-4">
                  Adjust Stock: {selectedItem.name} {selectedItem.variant && `(${selectedItem.variant})`}
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-secondary mb-1">
                      Current Stock
                    </label>
                    <input
                      type="text"
                      value={selectedItem.stock}
                      disabled
                      className="w-full px-4 py-2 border border-slate-200 rounded-md bg-slate-50"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-secondary mb-1">
                      Adjustment
                    </label>
                    <div className="flex">
                      <button
                        onClick={() => setAdjustmentQuantity(prev => parseInt(prev) - 1)}
                        className="px-4 py-2 border border-slate-200 rounded-l-md bg-slate-50 hover:bg-slate-100"
                        disabled={adjustmentLoading}
                      >
                        <Minus size={16} />
                      </button>
                      <input
                        type="number"
                        value={adjustmentQuantity}
                        onChange={(e) => setAdjustmentQuantity(e.target.value)}
                        className="flex-1 px-4 py-2 border-y border-slate-200 text-center focus:outline-none focus:ring-2 focus:ring-primary/50"
                        disabled={adjustmentLoading}
                      />
                      <button
                        onClick={() => setAdjustmentQuantity(prev => parseInt(prev) + 1)}
                        className="px-4 py-2 border border-slate-200 rounded-r-md bg-slate-50 hover:bg-slate-100"
                        disabled={adjustmentLoading}
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      New stock level will be: {parseInt(selectedItem.stock) + parseInt(adjustmentQuantity || 0)}
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-secondary mb-1">
                      Reason for Adjustment
                    </label>
                    <select
                      value={adjustmentReason}
                      onChange={(e) => setAdjustmentReason(e.target.value)}
                      className="w-full px-4 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 bg-white"
                      disabled={adjustmentLoading}
                    >
                      <option value="">Select a reason...</option>
                      <option value="restock">Restock</option>
                      <option value="damaged">Damaged/Defective</option>
                      <option value="correction">Inventory Correction</option>
                      <option value="returned">Customer Return</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  
                  {adjustmentReason === 'other' && (
                    <div>
                      <label className="block text-sm font-medium text-secondary mb-1">
                        Specify Reason
                      </label>
                      <textarea
                        value={adjustmentReason === 'other' ? adjustmentReason : ''}
                        onChange={(e) => setAdjustmentReason(e.target.value)}
                        className="w-full px-4 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                        rows={2}
                        disabled={adjustmentLoading}
                      ></textarea>
                    </div>
                  )}
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
                  >
                    {adjustmentLoading ? (
                      <>
                        <RefreshCw size={16} className="mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      'Save Adjustment'
                    )}
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
}

export default InventoryPage;