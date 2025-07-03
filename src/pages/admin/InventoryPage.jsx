import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { formatPrice } from '../../lib/utils';
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

// Sample inventory data for demonstration
const sampleInventory = [
  {
    id: 1,
    product_id: 'PROD-001',
    name: 'Lavender Dreams Candle',
    variant: '8oz',
    sku: 'LD-C8-001',
    stock: 25,
    reorder_point: 10,
    price: 5500,
    status: 'In Stock',
    last_updated: '2023-05-10',
  },
  {
    id: 2,
    product_id: 'PROD-001',
    name: 'Lavender Dreams Candle',
    variant: '12oz',
    sku: 'LD-C12-001',
    stock: 18,
    reorder_point: 8,
    price: 7500,
    status: 'In Stock',
    last_updated: '2023-05-10',
  },
  {
    id: 3,
    product_id: 'PROD-002',
    name: 'Vanilla Bliss Room Spray',
    variant: 'Standard',
    sku: 'VB-RS-001',
    stock: 12,
    reorder_point: 15,
    price: 5500,
    status: 'Low Stock',
    last_updated: '2023-05-12',
  },
  {
    id: 4,
    product_id: 'PROD-003',
    name: 'Citrus Sunshine Diffuser',
    variant: '100ml',
    sku: 'CS-D1-001',
    stock: 8,
    reorder_point: 10,
    price: 8500,
    status: 'Low Stock',
    last_updated: '2023-05-15',
  },
  {
    id: 5,
    product_id: 'PROD-003',
    name: 'Citrus Sunshine Diffuser',
    variant: '200ml',
    sku: 'CS-D2-001',
    stock: 0,
    reorder_point: 5,
    price: 12500,
    status: 'Out of Stock',
    last_updated: '2023-05-15',
  },
  {
    id: 6,
    product_id: 'PROD-004',
    name: 'Ocean Breeze Candle',
    variant: '8oz',
    sku: 'OB-C8-001',
    stock: 30,
    reorder_point: 10,
    price: 5500,
    status: 'In Stock',
    last_updated: '2023-05-08',
  },
  {
    id: 7,
    product_id: 'PROD-005',
    name: 'Midnight Jasmine Candle',
    variant: '12oz',
    sku: 'MJ-C12-001',
    stock: 5,
    reorder_point: 8,
    price: 7500,
    status: 'Low Stock',
    last_updated: '2023-05-14',
  },
];

const InventoryPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedItem, setSelectedItem] = useState(null);
  const [adjustmentQuantity, setAdjustmentQuantity] = useState(0);
  const [adjustmentReason, setAdjustmentReason] = useState('');
  const [showAdjustmentModal, setShowAdjustmentModal] = useState(false);
  const itemsPerPage = 5;

  // Filter inventory based on search term and status filter
  const filteredInventory = sampleInventory.filter(item => {
    const matchesSearch = 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.variant && item.variant.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = 
      statusFilter === 'all' ||
      (statusFilter === 'in_stock' && item.status === 'In Stock') ||
      (statusFilter === 'low_stock' && item.status === 'Low Stock') ||
      (statusFilter === 'out_of_stock' && item.status === 'Out of Stock');
    
    return matchesSearch && matchesStatus;
  });

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredInventory.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredInventory.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
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

  const handleAdjustment = () => {
    // In a real app, you would update the inventory via an API
    // For now, we'll just update the local state
    const updatedInventory = sampleInventory.map(item => {
      if (item.id === selectedItem.id) {
        const newStock = item.stock + parseInt(adjustmentQuantity);
        let newStatus = item.status;
        
        if (newStock <= 0) {
          newStatus = 'Out of Stock';
        } else if (newStock <= item.reorder_point) {
          newStatus = 'Low Stock';
        } else {
          newStatus = 'In Stock';
        }
        
        return {
          ...item,
          stock: newStock,
          status: newStatus,
          last_updated: new Date().toISOString().split('T')[0],
        };
      }
      return item;
    });
    
    // In a real app, you would save this to a database
    // For now, we'll just log it
    console.log('Inventory updated:', updatedInventory);
    console.log('Adjustment reason:', adjustmentReason);
    
    closeAdjustmentModal();
  };

  // Count items by status
  const inStockCount = sampleInventory.filter(item => item.status === 'In Stock').length;
  const lowStockCount = sampleInventory.filter(item => item.status === 'Low Stock').length;
  const outOfStockCount = sampleInventory.filter(item => item.status === 'Out of Stock').length;

  // Calculate total inventory value
  const totalInventoryValue = sampleInventory.reduce((total, item) => {
    return total + (item.price * item.stock);
  }, 0);

  return (
    <>
      <Helmet>
        <title>Inventory Management | Scenture Lagos Admin</title>
      </Helmet>
      
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
            <Button variant="default" className="flex items-center">
              <RefreshCw size={16} className="mr-2" />
              Sync Inventory
            </Button>
          </div>
        </div>

        {/* Inventory Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Total Products</p>
                  <h3 className="text-2xl font-medium mt-1">{sampleInventory.length}</h3>
                </div>
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <Package size={24} className="text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
          
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
        </div>

        {/* Inventory List */}
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <CardTitle>Inventory List</CardTitle>
                <CardDescription>
                  {filteredInventory.length} items found
                </CardDescription>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="text"
                    placeholder="Search inventory..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-slate-200 rounded-md w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
                
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 bg-white"
                >
                  <option value="all">All Status</option>
                  <option value="in_stock">In Stock</option>
                  <option value="low_stock">Low Stock</option>
                  <option value="out_of_stock">Out of Stock</option>
                </select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
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
                  {currentItems.length > 0 ? (
                    currentItems.map((item) => (
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
                          >
                            Adjust
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="p-4 text-center text-slate-500">
                        No inventory items found matching your criteria
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {filteredInventory.length > 0 && (
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-slate-500">
                  Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredInventory.length)} of {filteredInventory.length} items
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft size={16} />
                  </Button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      variant={currentPage === page ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handlePageChange(page)}
                    >
                      {page}
                    </Button>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight size={16} />
                  </Button>
                </div>
              </div>
            )}
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
                  {sampleInventory
                    .filter(item => item.status === 'Low Stock' || item.status === 'Out of Stock')
                    .map((item) => (
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
                    ))}
                  {sampleInventory.filter(item => item.status === 'Low Stock' || item.status === 'Out of Stock').length === 0 && (
                    <tr>
                      <td colSpan="5" className="p-4 text-center text-slate-500">
                        No low stock alerts at this time
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stock Adjustment Modal */}
      {showAdjustmentModal && selectedItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md mx-4">
            <div className="p-6">
              <h3 className="text-xl font-heading font-medium text-secondary mb-4">
                Adjust Stock: {selectedItem.name} ({selectedItem.variant})
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
                    >
                      <Minus size={16} />
                    </button>
                    <input
                      type="number"
                      value={adjustmentQuantity}
                      onChange={(e) => setAdjustmentQuantity(e.target.value)}
                      className="flex-1 px-4 py-2 border-y border-slate-200 text-center focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                    <button
                      onClick={() => setAdjustmentQuantity(prev => parseInt(prev) + 1)}
                      className="px-4 py-2 border border-slate-200 rounded-r-md bg-slate-50 hover:bg-slate-100"
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
                      className="w-full px-4 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                      rows={2}
                    ></textarea>
                  </div>
                )}
              </div>
              
              <div className="flex justify-end mt-6 space-x-3">
                <Button variant="outline" onClick={closeAdjustmentModal}>
                  Cancel
                </Button>
                <Button
                  variant="default"
                  onClick={handleAdjustment}
                  disabled={!adjustmentReason}
                >
                  Save Adjustment
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default InventoryPage;