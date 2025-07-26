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
import { useQuery, useQueryClient } from '@tanstack/react-query'; // Import useQuery and useQueryClient
import { debounce } from 'lodash'; // Keep debounce for search input

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
    const queryClient = useQueryClient(); // Initialize queryClient

    const queryParams = new URLSearchParams(location.search);
    // State for filters and pagination, controlled by URL
    const [searchTerm, setSearchTerm] = useState(queryParams.get('search') || '');
    const [selectedCategory, setSelectedCategory] = useState(queryParams.get('category') || 'all');
    const [selectedStatus, setSelectedStatus] = useState(queryParams.get('status') || 'all');
    const [currentPage, setCurrentPage] = useState(parseInt(queryParams.get('page'), 10) || 1);
    const [itemsPerPage] = useState(10); // Fixed items per page

    // Effect for syncing state with URL
    useEffect(() => {
        const params = new URLSearchParams();
        if (searchTerm) params.set('search', searchTerm);
        if (selectedCategory && selectedCategory !== 'all') params.set('category', selectedCategory);
        if (selectedStatus && selectedStatus !== 'all') params.set('status', selectedStatus);
        if (currentPage > 1) params.set('page', currentPage.toString()); // Only add if not page 1
        // itemsPerPage is fixed, no need to add to URL unless it becomes dynamic

        navigate(`${location.pathname}?${params.toString()}`, { replace: true });
    }, [currentPage, selectedCategory, selectedStatus, searchTerm, navigate, location.pathname]);

    // Query for products
    const {
        data: productsData,
        isLoading: productsLoading,
        isFetching: productsFetching,
        error: productsError,
        refetch: refetchProducts,
    } = useQuery({
        queryKey: ['products', { page: currentPage, limit: itemsPerPage, search: searchTerm, category: selectedCategory, status: selectedStatus }],
        queryFn: async ({ queryKey }) => {
            const [, filters] = queryKey;
            const params = { ...filters };

            // Map frontend status to backend stock filter
            if (params.status && params.status !== 'all') {
                if (params.status === 'Out of Stock') params.stock = 'out_of_stock';
                else if (params.status === 'Low Stock') params.stock = 'low_stock';
                else if (params.status === 'Active') params.status = 'published'; // Use 'published' for 'Active' status
            } else {
                delete params.status; // Remove status if 'all'
            }

            // Remove category if 'all'
            if (params.category === 'all') {
                delete params.category;
            }

            const response = await ProductService.getAllProducts(params);
            return response; // Should return { data: [], total: 0 }
        },
        placeholderData: (previousData) => previousData, // Keep previous data while fetching new
        staleTime: 5 * 60 * 1000, // Data considered fresh for 5 minutes
        keepPreviousData: true, // Keep old data visible while new data is loading
        onError: (err) => {
            addToast(err.message || 'Failed to load products', 'error');
        },
    });

    const products = productsData?.data || [];
    const totalProducts = productsData?.total || 0;
    const loading = productsLoading || productsFetching;
    const error = productsError;

    // Query for categories (less frequent refresh needed)
    const {
        data: categoriesData,
        isLoading: categoriesLoading,
        error: categoriesError,
    } = useQuery({
        queryKey: ['categories'],
        queryFn: () => ProductService.getAllCategories(),
        staleTime: 15 * 60 * 1000, // Categories can be fresh for longer (15 minutes)
        onError: (err) => {
            addToast(err.message || 'Failed to load categories', 'error');
        },
    });

    const categories = categoriesData?.data || [];


    const handleDeleteProduct = async (productId) => {
        if (!window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) return;

        setDeleteLoading(productId);
        try {
            await ProductService.deleteProduct(productId);
            addToast('Product deleted successfully', 'success');
            // Invalidate products query to refetch the list
            queryClient.invalidateQueries(['products']);
            // If the deleted product was the only one on the page, go to previous page
            if (products.length === 1 && currentPage > 1) {
                setCurrentPage(prev => prev - 1);
            }
        } catch (err) {
            addToast(err.message || 'Failed to delete product', 'error');
        } finally {
            setDeleteLoading(null);
        }
    };

    const totalPages = Math.ceil(totalProducts / itemsPerPage);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Debounced search handler
    const handleSearchChange = useCallback(
        debounce((value) => {
            setSearchTerm(value);
            setCurrentPage(1); // Reset to first page on new search
        }, 300),
        []
    );

    const [deleteLoading, setDeleteLoading] = useState(null); // State for individual product delete loading

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
                            onClick={() => {
                                queryClient.invalidateQueries(['products']); // Invalidate products cache
                                queryClient.invalidateQueries(['categories']); // Invalidate categories cache
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
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-background border border-primary/20 rounded-lg p-6 text-center shadow-sm"
                    >
                        <AlertCircle className="mx-auto h-10 w-10 text-destructive" />
                        <h3 className="text-lg font-semibold text-secondary mt-3">Failed to load products</h3>
                        <p className="text-sm text-muted-foreground mt-1">{error.message}</p> {/* Display error message */}
                        <Button
                            variant="default"
                            size="sm"
                            onClick={() => refetchProducts()} // Use refetch from useQuery
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
                                    disabled={loading || categoriesLoading}
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
                                        <SelectItem value="published">Published</SelectItem> {/* Corresponds to backend 'published' */}
                                        <SelectItem value="draft">Draft</SelectItem>       {/* Corresponds to backend 'draft' */}
                                        <SelectItem value="archived">Archived</SelectItem> {/* Corresponds to backend 'archived' */}
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
                                                                        product.stockStatus === 'In Stock' // Changed from 'Active'
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
                                                                        product.stockStatus === 'In Stock' // Changed from 'Active'
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
                                        Showing {Math.min((currentPage - 1) * itemsPerPage + 1, totalProducts)} to{' '}
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
