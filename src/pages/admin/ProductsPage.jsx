import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Filter, Edit, Trash2, Eye, ChevronLeft, ChevronRight, RefreshCw, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/Select';
import { formatPrice } from '../../lib/utils';
import ProductService from '../../services/admin/product.service';
import { LoadingOverlay } from '../../components/ui/LoadingState';
import { useToast } from '../../components/ui/Toast';
import { useRefresh } from '../../contexts/RefreshContext';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.3 } },
};

const ProductsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { addToast } = useToast();
  const { needsRefresh, setNeedsRefresh } = useRefresh();

  const queryParams = new URLSearchParams(location.search);
  const initialPage = parseInt(queryParams.get('page')) || 1;
  const initialCategory = queryParams.get('category') || 'all';
  const initialStatus = queryParams.get('status') || 'all';
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
    if (selectedCategory && selectedCategory !== 'all') params.set('category', selectedCategory);
    if (selectedStatus && selectedStatus !== 'all') params.set('status', selectedStatus);
    if (searchTerm) params.set('search', searchTerm);
    navigate(`${location.pathname}?${params.toString()}`, { replace: true });
  }, [currentPage, selectedCategory, selectedStatus, searchTerm, navigate, location.pathname]);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm,
      };
      if (selectedCategory && selectedCategory !== 'all') params.category = selectedCategory;
      if (selectedStatus && selectedStatus !== 'all') {
        if (selectedStatus === 'Out of Stock') params.stock = 'out_of_stock';
        else if (selectedStatus === 'Low Stock') params.stock = 'low_stock';
        else if (selectedStatus === 'Active') params.stock = 'published';
      }

      const { data, total } = await ProductService.getAllProducts(params);
      setProducts(data);
      setTotalProducts(total || data.length);

      const categoriesResponse = await ProductService.getAllCategories();
      setCategories(categoriesResponse.data);
    } catch (err) {
      setError(err.message || 'Failed to load products');
      addToast('Failed to load products', 'error');
      setProducts([]);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage, searchTerm, selectedCategory, selectedStatus, addToast]);

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;

    setDeleteLoading(productId);
    try {
      await ProductService.deleteProduct(productId);
      addToast('Product deleted successfully', 'success');
      ProductService.clearCache();
      setNeedsRefresh(true);
      await fetchProducts();
    } catch (err) {
      addToast(err.message || 'Failed to delete product', 'error');
    } finally {
      setDeleteLoading(null);
    }
  };

  useEffect(() => {
    const checkCache = async () => {
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm,
      };
      if (selectedCategory && selectedCategory !== 'all') params.category = selectedCategory;
      if (selectedStatus && selectedStatus !== 'all') {
        if (selectedStatus === 'Out of Stock') params.stock = 'out_of_stock';
        else if (selectedStatus === 'Low Stock') params.stock = 'low_stock';
        else if (selectedStatus === 'Active') params.stock = 'published';
      }

      const productsCached = ProductService.getCachedData(`products_${JSON.stringify(params)}`);
      const categoriesCached = ProductService.getCachedData(`categories_${JSON.stringify({})}`);

      if (needsRefresh || !productsCached || !categoriesCached) {
        ProductService.clearCache();
        await fetchProducts();
        setNeedsRefresh(false);
      } else {
        setProducts(productsCached.data);
        setTotalProducts(productsCached.total);
        setCategories(categoriesCached.data);
        setLoading(false);
      }
    };
    checkCache();
  }, [currentPage, selectedCategory, selectedStatus, searchTerm, needsRefresh, fetchProducts]);

  const totalPages = Math.ceil(totalProducts / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
        <title>Products | Scenture Admin</title>
      </Helmet>
      <div className="container mx-auto space-y-6 py-6 sm:py-8 px-2 sm:px-4">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div>
            <h1 className="text-2xl sm:text-3xl font-heading font-medium text-secondary tracking-tight">
              Products
            </h1>
            <p className="text-sm text-muted-foreground mt-1.5">Curate your product collection with elegance</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                ProductService.clearCache();
                setNeedsRefresh(true);
                await fetchProducts();
                addToast('Products refreshed', 'success');
              }}
              disabled={loading}
              className="group hover:bg-primary/10"
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''} group-hover:text-primary`} />
              {loading ? 'Refreshing...' : 'Refresh'}
            </Button>
            <Button
              variant="default"
              size="sm"
              asChild
              className="group bg-primary hover:bg-primary-dark"
            >
              <Link to="/admin/products/new" className='flex'>
                <Plus className="mr-2 h-4 w-4 group-hover:text-background" />
                Add New Product
              </Link>
            </Button>
          </div>
        </motion.header>

        {/* Error State */}
        {error && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-background border border-primary/20 rounded-lg p-6 text-center shadow-sm"
          >
            <AlertCircle className="mx-auto h-10 w-10 text-destructive" />
            <h3 className="text-lg font-semibold text-secondary mt-3">Failed to load products</h3>
            <p className="text-sm text-muted-foreground mt-1">{error}</p>
            <Button
              variant="default"
              size="sm"
              onClick={async () => {
                ProductService.clearCache();
                await fetchProducts();
              }}
              className="mt-4 bg-destructive hover:bg-destructive-dark"
            >
              Try Again
            </Button>
          </motion.div>
        )}

        {/* Main Content */}
        <Card className="border-primary/20 bg-background shadow-sm">
          <CardHeader className="p-5 sm:p-6">
            <CardTitle className="text-xl font-heading text-secondary">Product Collection</CardTitle>
            <CardDescription className="text-sm text-muted-foreground mt-1">
              Browse and manage your product inventory
            </CardDescription>
          </CardHeader>
          <CardContent className="p-5 sm:p-6">
            {/* Filters and Search */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6"
            >
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search products..."
                  defaultValue={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-10 bg-background border-primary/20 focus:ring-primary/50 hover:shadow-sm"
                  disabled={loading}
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Select
                  value={selectedCategory}
                  onValueChange={(value) => {
                    setSelectedCategory(value);
                    setCurrentPage(1);
                  }}
                  disabled={loading}
                >
                  <SelectTrigger className="w-full sm:w-40 bg-background border-primary/20 focus:ring-primary/50 hover:shadow-sm">
                    <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={selectedStatus}
                  onValueChange={(value) => {
                    setSelectedStatus(value);
                    setCurrentPage(1);
                  }}
                  disabled={loading}
                >
                  <SelectTrigger className="w-full sm:w-40 bg-background border-primary/20 focus:ring-primary/50 hover:shadow-sm">
                    <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Out of Stock">Out of Stock</SelectItem>
                    <SelectItem value="Low Stock">Low Stock</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </motion.div>

            {/* Product List */}
            <LoadingOverlay loading={loading && !error}>
              <motion.div variants={containerVariants} initial="hidden" animate="visible">
                {/* Desktop Table */}
                <div className="hidden lg:block overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-muted/50 text-left text-sm font-medium text-muted-foreground">
                        <th className="py-4 pl-0 pr-6">Product</th>
                        <th className="py-4 px-6">SKU</th>
                        <th className="py-4 px-6">Price</th>
                        <th className="py-4 px-6">Stock</th>
                        <th className="py-4 px-6">Category</th>
                        <th className="py-4 px-6">Status</th>
                        <th className="py-4 pl-6 pr-0 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      <AnimatePresence>
                        {products.length > 0 ? (
                          products.map((product) => (
                            <motion.tr
                              key={product.id}
                              variants={itemVariants}
                              initial="hidden"
                              animate="visible"
                              exit={{ opacity: 0, height: 0 }}
                              className="border-b border-muted/50 last:border-b-0 hover:bg-primary/10 transition-all duration-200"
                            >
                              <td className="py-4 pl-0 pr-6 font-medium text-secondary truncate max-w-xs">
                                {product.name}
                              </td>
                              <td className="py-4 px-6 text-secondary">{product.sku}</td>
                              <td className="py-4 px-6 text-secondary">{formatPrice(product.price, { notation: 'compact' })}</td>
                              <td className="py-4 px-6 text-secondary">{product.stock}</td>
                              <td className="py-4 px-6 text-secondary">{product.categoryName}</td>
                              <td className="py-4 px-6">
                                <span
                                  className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                                    product.stockStatus === 'Active'
                                      ? 'bg-green-50 text-green-700'
                                      : product.stockStatus === 'Out of Stock'
                                      ? 'bg-red-50 text-red-700'
                                      : 'bg-yellow-50 text-yellow-700'
                                  }`}
                                >
                                  {product.stockStatus}
                                </span>
                              </td>
                              <td className="py-4 pl-6 pr-0 text-right">
                                <div className="flex items-center justify-end space-x-2">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => navigate(`/admin/products/${product.id}`)}
                                    className="hover:bg-primary/20"
                                    aria-label={`View product ${product.name}`}
                                  >
                                    <Eye className="h-4 w-4 text-secondary" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    asChild
                                    className="hover:bg-primary/20"
                                    aria-label={`Edit product ${product.name}`}
                                  >
                                    <Link to={`/admin/products/${product.id}/edit`}>
                                      <Edit className="h-4 w-4 text-secondary" />
                                    </Link>
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleDeleteProduct(product.id)}
                                    disabled={deleteLoading === product.id}
                                    className="hover:bg-red-50 hover:text-red-700"
                                    aria-label={`Delete product ${product.name}`}
                                  >
                                    {deleteLoading === product.id ? (
                                      <RefreshCw className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <Trash2 className="h-4 w-4" />
                                    )}
                                  </Button>
                                </div>
                              </td>
                            </motion.tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="7" className="py-12 text-center">
                              <div className="text-muted-foreground space-y-2">
                                <p className="text-lg font-medium">No products found</p>
                                <p className="text-sm">Try adjusting your search or filters</p>
                              </div>
                            </td>
                          </tr>
                        )}
                      </AnimatePresence>
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards */}
                <div className="lg:hidden space-y-4">
                  <AnimatePresence>
                    {products.length > 0 ? (
                      products.map((product) => (
                        <motion.div
                          key={product.id}
                          variants={itemVariants}
                          initial="hidden"
                          animate="visible"
                          exit={{ opacity: 0, height: 0 }}
                          className="border border-primary/20 bg-background rounded-lg p-4 shadow-sm hover:shadow-md transition-all duration-200"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1 min-w-0">
                              <h3 className="text-base font-semibold text-secondary truncate">{product.name}</h3>
                              <p className="text-xs text-muted-foreground font-mono mt-1">{product.sku}</p>
                            </div>
                            <div className="flex items-center space-x-2 ml-3">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => navigate(`/admin/products/${product.id}`)}
                                className="hover:bg-primary/20"
                                aria-label={`View product ${product.name}`}
                              >
                                <Eye className="h-4 w-4 text-secondary" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                asChild
                                className="hover:bg-primary/20"
                                aria-label={`Edit product ${product.name}`}
                              >
                                <Link to={`/admin/products/${product.id}/edit`}>
                                  <Edit className="h-4 w-4 text-secondary" />
                                </Link>
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteProduct(product.id)}
                                disabled={deleteLoading === product.id}
                                className="hover:bg-red-50 hover:text-red-700"
                                aria-label={`Delete product ${product.name}`}
                              >
                                {deleteLoading === product.id ? (
                                  <RefreshCw className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Trash2 className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground text-xs">Price</span>
                              <p className="font-medium text-secondary mt-1">{formatPrice(product.price, { notation: 'compact' })}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground text-xs">Stock</span>
                              <p className="font-medium text-secondary mt-1">{product.stock}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground text-xs">Category</span>
                              <p className="text-secondary mt-1">{product.categoryName}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground text-xs">Status</span>
                              <p className="mt-1">
                                <span
                                  className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                                    product.stockStatus === 'Active'
                                      ? 'bg-green-50 text-green-700'
                                      : product.stockStatus === 'Out of Stock'
                                      ? 'bg-red-50 text-red-700'
                                      : 'bg-yellow-50 text-yellow-700'
                                  }`}
                                >
                                  {product.stockStatus}
                                </span>
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      ))
                    ) : (
                      <div className="text-center py-12">
                        <div className="text-muted-foreground space-y-2">
                          <p className="text-lg font-medium">No products found</p>
                          <p className="text-sm">Try adjusting your search or filters</p>
                        </div>
                      </div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>

              {/* Pagination */}
              {totalProducts > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-6 pt-6 border-t border-muted/50"
                >
                  <p className="text-sm text-muted-foreground">
                    Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
                    {Math.min(currentPage * itemsPerPage, totalProducts)} of {totalProducts} products
                  </p>
                  <div className="flex items-center justify-center sm:justify-end space-x-2 mt-4 sm:mt-0">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1 || loading}
                      className="hover:bg-primary/10"
                      aria-label="Previous page"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    {totalPages <= 5 ? (
                      Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <Button
                          key={page}
                          variant={currentPage === page ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => handlePageChange(page)}
                          disabled={loading}
                          className={currentPage === page ? 'bg-primary hover:bg-primary-dark' : 'hover:bg-primary/10'}
                          aria-label={`Go to page ${page}`}
                        >
                          {page}
                        </Button>
                      ))
                    ) : (
                      <>
                        <Button
                          variant={currentPage === 1 ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => handlePageChange(1)}
                          disabled={loading}
                          className={currentPage === 1 ? 'bg-primary hover:bg-primary-dark' : 'hover:bg-primary/10'}
                          aria-label="Go to first page"
                        >
                          1
                        </Button>
                        {currentPage > 3 && <span className="px-2 text-muted-foreground">...</span>}
                        {Array.from({ length: Math.min(3, totalPages) }, (_, i) => {
                          let pageNum;
                          if (currentPage <= 2) pageNum = i + 2;
                          else if (currentPage >= totalPages - 1) pageNum = totalPages - 3 + i;
                          else pageNum = currentPage - 1 + i;
                          if (pageNum > 1 && pageNum < totalPages) {
                            return (
                              <Button
                                key={pageNum}
                                variant={currentPage === pageNum ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => handlePageChange(pageNum)}
                                disabled={loading}
                                className={currentPage === pageNum ? 'bg-primary hover:bg-primary-dark' : 'hover:bg-primary/10'}
                                aria-label={`Go to page ${pageNum}`}
                              >
                                {pageNum}
                              </Button>
                            );
                          }
                          return null;
                        }).filter(Boolean)}
                        {currentPage < totalPages - 2 && <span className="px-2 text-muted-foreground">...</span>}
                        <Button
                          variant={currentPage === totalPages ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => handlePageChange(totalPages)}
                          disabled={loading}
                          className={currentPage === totalPages ? 'bg-primary hover:bg-primary-dark' : 'hover:bg-primary/10'}
                          aria-label="Go to last page"
                        >
                          {totalPages}
                        </Button>
                      </>
                    )}
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages || loading}
                      className="hover:bg-primary/10"
                      aria-label="Next page"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </motion.div>
              )}
            </LoadingOverlay>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default ProductsPage;