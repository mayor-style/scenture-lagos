import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { formatPrice } from '../../lib/utils';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye,
  ChevronLeft,
  ChevronRight,
  Check,
  X
} from 'lucide-react';

// Sample data for demonstration
const products = [
  { id: 1, name: 'Lavender Dreams Candle', sku: 'CAN-001', price: 12500, stock: 45, status: 'Active', category: 'Candles' },
  { id: 2, name: 'Vanilla Bliss Room Spray', sku: 'SPR-002', price: 8700, stock: 32, status: 'Active', category: 'Room Sprays' },
  { id: 3, name: 'Citrus Grove Diffuser', sku: 'DIF-003', price: 15000, stock: 18, status: 'Active', category: 'Diffusers' },
  { id: 4, name: 'Ocean Breeze Candle', sku: 'CAN-004', price: 13500, stock: 27, status: 'Active', category: 'Candles' },
  { id: 5, name: 'Midnight Jasmine Candle', sku: 'CAN-005', price: 14000, stock: 0, status: 'Out of Stock', category: 'Candles' },
  { id: 6, name: 'Sandalwood Luxury Candle', sku: 'CAN-006', price: 18000, stock: 12, status: 'Active', category: 'Candles' },
  { id: 7, name: 'Fresh Linen Room Spray', sku: 'SPR-007', price: 9500, stock: 23, status: 'Active', category: 'Room Sprays' },
  { id: 8, name: 'Eucalyptus Mint Diffuser', sku: 'DIF-008', price: 16500, stock: 15, status: 'Active', category: 'Diffusers' },
  { id: 9, name: 'Amber & Oud Luxury Candle', sku: 'CAN-009', price: 22000, stock: 8, status: 'Low Stock', category: 'Candles' },
  { id: 10, name: 'Rose Garden Room Spray', sku: 'SPR-010', price: 10000, stock: 0, status: 'Out of Stock', category: 'Room Sprays' },
];

const categories = [
  { id: 1, name: 'Candles' },
  { id: 2, name: 'Room Sprays' },
  { id: 3, name: 'Diffusers' },
  { id: 4, name: 'Gift Sets' },
];

const ProductsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Filter products based on search term, category, and status
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          product.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory ? product.category === selectedCategory : true;
    const matchesStatus = selectedStatus ? product.status === selectedStatus : true;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <>
      <Helmet>
        <title>Products | Scenture Lagos Admin</title>
      </Helmet>
      
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-heading font-medium text-secondary">Products</h1>
            <p className="text-secondary/70 mt-1">Manage your product inventory</p>
          </div>
          <div className="mt-4 md:mt-0">
            <Link to="/admin/products/new">
              <Button variant="default" className="flex items-center">
                <Plus size={16} className="mr-2" />
                Add New Product
              </Button>
            </Link>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Product List</CardTitle>
            <CardDescription>View and manage all products</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  placeholder="Search by name or SKU..."
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                  <select
                    className="pl-10 pr-4 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 bg-white"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                  >
                    <option value="">All Categories</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.name}>{category.name}</option>
                    ))}
                  </select>
                </div>
                
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                  <select
                    className="pl-10 pr-4 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 bg-white"
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                  >
                    <option value="">All Status</option>
                    <option value="Active">Active</option>
                    <option value="Out of Stock">Out of Stock</option>
                    <option value="Low Stock">Low Stock</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left font-medium p-3 pl-0">Product Name</th>
                    <th className="text-left font-medium p-3">SKU</th>
                    <th className="text-left font-medium p-3">Price</th>
                    <th className="text-left font-medium p-3">Stock</th>
                    <th className="text-left font-medium p-3">Category</th>
                    <th className="text-left font-medium p-3">Status</th>
                    <th className="text-right font-medium p-3 pr-0">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.length > 0 ? (
                    currentItems.map((product) => (
                      <tr key={product.id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="p-3 pl-0">{product.name}</td>
                        <td className="p-3">{product.sku}</td>
                        <td className="p-3">{formatPrice(product.price)}</td>
                        <td className="p-3">{product.stock}</td>
                        <td className="p-3">{product.category}</td>
                        <td className="p-3">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            product.status === 'Active' ? 'bg-green-100 text-green-800' :
                            product.status === 'Out of Stock' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {product.status}
                          </span>
                        </td>
                        <td className="p-3 pr-0 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <button className="p-1 text-slate-500 hover:text-secondary rounded-md hover:bg-slate-100">
                              <Eye size={16} />
                            </button>
                            <Link to={`/admin/products/${product.id}/edit`} className="p-1 text-slate-500 hover:text-secondary rounded-md hover:bg-slate-100">
                              <Edit size={16} />
                            </Link>
                            <button className="p-1 text-slate-500 hover:text-red-600 rounded-md hover:bg-slate-100">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="p-3 text-center text-slate-500">
                        No products found matching your criteria
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {filteredProducts.length > 0 && (
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-slate-500">
                  Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredProducts.length)} of {filteredProducts.length} products
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2 rounded-md border border-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`w-8 h-8 rounded-md ${currentPage === page ? 'bg-primary text-secondary' : 'border border-slate-200'}`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-md border border-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default ProductsPage;