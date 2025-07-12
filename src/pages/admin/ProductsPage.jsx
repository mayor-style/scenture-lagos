// File: src/pages/admin/ProductsPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate, useLocation } from 'react-router-dom';
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
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import ProductService from '../../services/admin/product.service';
import { LoadingOverlay } from '../../components/ui/LoadingState';
import {useToast} from '../../components/ui/Toast';

const ProductsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {addToast} = useToast();
  
  const queryParams = new URLSearchParams(location.search);
  const initialPage = parseInt(queryParams.get('page')) || 1;
  const initialCategory = queryParams.get('category') || '';
  const initialStatus = queryParams.get('status') || '';
  const initialSearch = queryParams.get('search') || '';
  
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [totalProducts, setTotalProducts] = useState(0);
  
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedStatus, setSelectedStatus] = useState(initialStatus);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [itemsPerPage] = useState(10);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(null);
  
  useEffect(() => {
    const params = new URLSearchParams();
    if (currentPage > 1) params.set('page', currentPage);
    if (selectedCategory) params.set('category', selectedCategory);
    if (selectedStatus) params.set('status', selectedStatus);
    if (searchTerm) params.set('search', searchTerm);
    
    const newUrl = `${location.pathname}?${params.toString()}`;
    navigate(newUrl, { replace: true });
  }, [currentPage, selectedCategory, selectedStatus, searchTerm, navigate, location.pathname]);
  
  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm,
      };
      
      if (selectedCategory) params.category = selectedCategory;
      if (selectedStatus) {
        if (selectedStatus === 'Out of Stock') params.stock = 'out_of_stock';
        else if (selectedStatus === 'Low Stock') params.stock = 'low_stock';
        else if (selectedStatus === 'Active') params.status = 'published';
      }
      
      const { data, total } = await ProductService.getAllProducts(params);
      setProducts(data);
      setTotalProducts(total);
      
      if (categories.length === 0) {
        const categoriesResponse = await ProductService.getAllCategories();
        setCategories(categoriesResponse.data);
      }
      
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
      setProducts([]);
      if (categories.length === 0) {
        setCategories([]);
      }
    }
  };
  
  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }
    
    setDeleteLoading(productId);
    
    try {
      await ProductService.deleteProduct(productId);
      addToast('Product deleted successfully', 'success');
      fetchProducts();
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setDeleteLoading(null);
    }
  };
  
  useEffect(() => {
    fetchProducts();
  }, [currentPage, selectedCategory, selectedStatus, searchTerm]);
  
  const totalPages = Math.ceil(totalProducts / itemsPerPage);
  
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };
  
  const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  };
  
  const handleSearchChange = debounce((value) => {
    setSearchTerm(value);
    setCurrentPage(1);
  }, 300);

  return (
    <>
      <Helmet>
        <title>Products | Scenture Lagos Admin</title>
      </Helmet>
      
        <div className="space-y-8 px-0">
          <div className="mb-8 lg:mb-12">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-6 lg:space-y-0">
              <div className="space-y-2">
                <h1 className="dashboardHeading">
                  Products
                </h1>
                <p className="dashboardSubHeading">
                  Manage your product inventory with elegance
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 lg:gap-4">
                <Button 
                  variant="outline" 
                  onClick={fetchProducts}
                  disabled={loading}
                >
                  <RefreshCw size={18} className={`mr-3 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
                <Link to="/admin/products/new">
                  <Button variant="default" className="bg-gradient-to-r from-slate-900 to-slate-800 text-white">
                    <Plus size={18} className="mr-3" />
                    Add New Product
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {loading && !error && (
            <div className="flex items-center justify-center py-20">
              <div className="text-center space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-2 border-slate-300 border-t-slate-900 mx-auto"></div>
                <p className="text-slate-600 font-light">Loading your products...</p>
              </div>
            </div>
          )}
          
          {error && (
            <div className="bg-white/60 backdrop-blur-sm border border-red-200/60 rounded-2xl p-8 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle size={24} className="text-red-600" />
              </div>
              <h3 className="text-xl font-medium text-slate-900 mb-2">Failed to load products</h3>
              <p className="text-slate-600 mb-6">{error}</p>
              <Button onClick={fetchProducts} className="bg-red-600 hover:bg-red-700 text-white">
                Try Again
              </Button>
            </div>
          )}
          
          <div className="bg-white/60 backdrop-blur-sm border border-slate-200/60 rounded-2xl shadow-sm overflow-hidden">
            <div className="border-b border-slate-200/60 bg-white/40 px-6 lg:px-8 py-6 lg:py-8">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                <div>
                  <h2 className="text-2xl lg:text-3xl font-light text-slate-900">Product Collection</h2>
                  <p className="text-slate-600 mt-1 font-light">View and manage all products</p>
                </div>
                
                <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 lg:items-center min-w-0">
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type="text"
                      placeholder="Search products..."
                      className="w-full pl-12 pr-4 py-3 bg-white/80 border border-slate-200/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                      defaultValue={searchTerm}
                      onChange={(e) => handleSearchChange(e.target.value)}
                    />
                  </div>
                  
                  <div className="flex  max-sm:flex-col gap-3 lg:gap-4">
                    <div className="relative">
                      <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
                      <select
                        className="pl-11 pr-8 py-3 bg-white/80 border max-sm:w-full border-slate-200/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                        value={selectedCategory}
                        onChange={(e) => {
                          setSelectedCategory(e.target.value);
                          setCurrentPage(1);
                        }}
                      >
                        <option value="">All Categories</option>
                        {categories.map(category => (
                          <option key={category.id} value={category.id}>{category.name}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="relative">
                      <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
                      <select
                        className="pl-11 pr-8 py-3 bg-white/80 border max-sm:w-full border-slate-200/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                        value={selectedStatus}
                        onChange={(e) => {
                          setSelectedStatus(e.target.value);
                          setCurrentPage(1);
                        }}
                      >
                        <option value="">All Status</option>
                        <option value="Active">Active</option>
                        <option value="Out of Stock">Out of Stock</option>
                        <option value="Low Stock">Low Stock</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 lg:px-8 py-6 lg:py-8">
              <LoadingOverlay loading={loading && !error}>
                <div className="hidden lg:block">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-200/60">
                        <th className="text-left font-medium text-slate-900 py-4 pl-0 pr-6">Product</th>
                        <th className="text-left font-medium text-slate-900 py-4 px-6">SKU</th>
                        <th className="text-left font-medium text-slate-900 py-4 px-6">Price</th>
                        <th className="text-left font-medium text-slate-900 py-4 px-6">Stock</th>
                        <th className="text-left font-medium text-slate-900 py-4 px-6">Category</th>
                        <th className="text-left font-medium text-slate-900 py-4 px-6">Status</th>
                        <th className="text-right font-medium text-slate-900 py-4 pl-6 pr-0">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.length > 0 ? (
                        products.map((product, index) => (
                          <tr key={product.id} className={`border-b border-slate-100/60 ${index === products.length - 1 ? 'border-b-0' : ''}`}>
                            <td className="py-6 pl-0 pr-6">{product.name}</td>
                            <td className="py-6 px-6">{product.sku}</td>
                            <td className="py-6 px-6">{formatPrice(product.price)}</td>
                            <td className="py-6 px-6">{product.stock}</td>
                            <td className="py-6 px-6">{product.categoryName}</td>
                            <td className="py-6 px-6">
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                product.stockStatus === 'Active' ? 'bg-emerald-100 text-emerald-800' :
                                product.stockStatus === 'Out of Stock' ? 'bg-red-100 text-red-800' :
                                'bg-amber-100 text-amber-800'
                              }`}>
                                {product.stockStatus}
                              </span>
                            </td>
                            <td className="py-6 pl-6 pr-0">
                              <div className="flex items-center justify-end space-x-1">
                                <button onClick={() => navigate(`/admin/products/${product.id}`)}>
                                  <Eye size={16} />
                                </button>
                                <Link to={`/admin/products/${product.id}/edit`}>
                                  <Edit size={16} />
                                </Link>
                                <button 
                                  onClick={() => handleDeleteProduct(product.id)}
                                  disabled={deleteLoading === product.id}
                                >
                                  {deleteLoading === product.id ? (
                                    <RefreshCw size={16} className="animate-spin" />
                                  ) : (
                                    <Trash2 size={16} />
                                  )}
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="7" className="py-20 text-center">
                            <div className="text-slate-500 space-y-2">
                              {error ? (
                                <div className="flex items-center justify-center">
                                  <AlertCircle size={20} className="mr-2 text-red-500" />
                                  <span>{error}</span>
                                </div>
                              ) : (
                                <div className="space-y-2">
                                  <div className="text-lg font-medium">No products found</div>
                                  <div className="text-sm">Try adjusting your search or filters</div>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="lg:hidden space-y-4">
                  {products.length > 0 ? (
                    products.map((product) => (
                      <div key={product.id} className="bg-white/80 border border-slate-200/60 rounded-2xl p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-slate-900 text-lg mb-1 truncate">{product.name}</h3>
                            <p className="text-slate-600 text-sm font-mono">{product.sku}</p>
                          </div>
                          <div className="flex items-center space-x-2 ml-4">
                            <button onClick={() => navigate(`/admin/products/${product.id}`)}>
                              <Eye size={16} />
                            </button>
                            <Link to={`/admin/products/${product.id}/edit`}>
                              <Edit size={16} />
                            </Link>
                            <button 
                              onClick={() => handleDeleteProduct(product.id)}
                              disabled={deleteLoading === product.id}
                            >
                              {deleteLoading === product.id ? (
                                <RefreshCw size={16} className="animate-spin" />
                              ) : (
                                <Trash2 size={16} />
                              )}
                            </button>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-slate-600">Price</span>
                            <div className="font-semibold text-slate-900 mt-1">{formatPrice(product.price)}</div>
                          </div>
                          <div>
                            <span className="text-slate-600">Stock</span>
                            <div className="font-medium text-slate-900 mt-1">{product.stock}</div>
                          </div>
                          <div>
                            <span className="text-slate-600">Category</span>
                            <div className="text-slate-900 mt-1">{product.categoryName}</div>
                          </div>
                          <div>
                            <span className="text-slate-600">Status</span>
                            <div className="mt-1">
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                product.stockStatus === 'Active' ? 'bg-emerald-100 text-emerald-800' :
                                product.stockStatus === 'Out of Stock' ? 'bg-red-100 text-red-800' :
                                'bg-amber-100 text-amber-800'
                              }`}>
                                {product.stockStatus}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-20">
                      <div className="text-slate-500 space-y-2">
                        {error ? (
                          <div className="flex items-center justify-center">
                            <AlertCircle size={20} className="mr-2 text-red-500" />
                            <span>{error}</span>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <div className="text-lg font-medium">No products found</div>
                            <div className="text-sm">Try adjusting your search or filters</div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </LoadingOverlay>

              {totalProducts > 0 && (
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-8 pt-8 border-t border-slate-200/60">
                  <div className="text-sm text-slate-600">
                    Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, totalProducts)} of {totalProducts} products
                  </div>
                  <div className="flex items-center justify-center sm:justify-end space-x-2 mt-4 sm:mt-0">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1 || loading}
                      className="p-2 rounded-xl border border-slate-200/60 disabled:opacity-50"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    {totalPages <= 5 ? (
                      Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          disabled={loading}
                          className={`min-w-[2.5rem] h-10 rounded-xl ${currentPage === page ? 'bg-slate-900 text-white' : 'bg-white/80 border border-slate-200/60'}`}
                        >
                          {page}
                        </button>
                      ))
                    ) : (
                      <>
                        <button
                          onClick={() => handlePageChange(1)}
                          disabled={loading}
                          className={`min-w-[2.5rem] h-10 rounded-xl ${currentPage === 1 ? 'bg-slate-900 text-white' : 'bg-white/80 border border-slate-200/60'}`}
                        >
                          1
                        </button>
                        {currentPage > 3 && <span className="px-2 text-slate-500">...</span>}
                        {Array.from({ length: Math.min(3, totalPages) }, (_, i) => {
                          let pageNum;
                          if (currentPage <= 2) pageNum = i + 2;
                          else if (currentPage >= totalPages - 1) pageNum = totalPages - 3 + i;
                          else pageNum = currentPage - 1 + i;
                          if (pageNum > 1 && pageNum < totalPages) {
                            return (
                              <button
                                key={pageNum}
                                onClick={() => handlePageChange(pageNum)}
                                disabled={loading}
                                className={`min-w-[2.5rem] h-10 rounded-xl ${currentPage === pageNum ? 'bg-slate-900 text-white' : 'bg-white/80 border border-slate-200/60'}`}
                              >
                                {pageNum}
                              </button>
                            );
                          }
                          return null;
                        }).filter(Boolean)}
                        {currentPage < totalPages - 2 && <span className="px-2 text-slate-500">...</span>}
                        <button
                          onClick={() => handlePageChange(totalPages)}
                          disabled={loading}
                          className={`min-w-[2.5rem] h-10 rounded-xl ${currentPage === totalPages ? 'bg-slate-900 text-white' : 'bg-white/80 border border-slate-200/60'}`}
                        >
                          {totalPages}
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages || loading}
                      className="p-2 rounded-xl border border-slate-200/60 disabled:opacity-50"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div> 
    </>
  );
};

export default ProductsPage;