import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Search, RefreshCw, Edit, Trash2, Eye, ChevronLeft, ChevronRight, Filter, X, AlertCircle, List, Grid
} from 'lucide-react';
import { useToast } from '../../components/ui/Toast';
import { useRefresh } from '../../contexts/RefreshContext';
import ProductService from '../../services/admin/product.service';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/Tabs';
import { Input } from '../../components/ui/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/Select';
import { LoadingOverlay } from '../../components/ui/LoadingState';
import ErrorState from '../../components/ui/ErrorState';
import ConfirmationModal from '../../components/ui/ConfirmationModal';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import CategoryTree from '../../components/admin/CategoryTree';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

const rowVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
};

const CategoryPage = () => {
 const navigate = useNavigate();
    const location = useLocation();
    const { addToast } = useToast();
    const queryClient = useQueryClient(); // Get the query client instance

    // --- State for Filters and UI ---
    // These states are for user interaction, not for storing server data
    const queryParams = new URLSearchParams(location.search);
    const [page, setPage] = useState(parseInt(queryParams.get('page') || '1'));
    const [limit, setLimit] = useState(parseInt(queryParams.get('limit') || '10'));
    const [searchTerm, setSearchTerm] = useState(queryParams.get('search') || '');
    const [parentFilter, setParentFilter] = useState(queryParams.get('parent') || 'all');
    const [featuredFilter, setFeaturedFilter] = useState(queryParams.get('featured') || 'all');
    const [viewMode, setViewMode] = useState(queryParams.get('view') || 'list');
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState(null);

  useEffect(() => {
    const newQueryParams = new URLSearchParams();
    if (page > 1) newQueryParams.set('page', page.toString());
    if (limit !== 10) newQueryParams.set('limit', limit.toString());
    if (searchTerm) newQueryParams.set('search', searchTerm);
    if (parentFilter !== 'all') newQueryParams.set('parent', parentFilter);
    if (featuredFilter !== 'all') newQueryParams.set('featured', featuredFilter);
    if (viewMode !== 'list') newQueryParams.set('view', viewMode);

    const newUrl = `${location.pathname}${newQueryParams.toString() ? `?${newQueryParams.toString()}` : ''}`;
    navigate(newUrl, { replace: true });
  }, [page, limit, searchTerm, parentFilter, featuredFilter, viewMode, navigate, location.pathname]);

   // --- 1. Replace manual fetching with useQuery ---
    const queryKey = ['categories', { page, limit, searchTerm, parentFilter, featuredFilter }];
    
    const { 
        data: categoriesData, 
        isLoading, 
        isError, 
        error 
    } = useQuery({
        queryKey: queryKey,
        queryFn: () => ProductService.getAllCategories({
            page,
            limit,
            search: searchTerm,
            parent: parentFilter === 'all' ? undefined : parentFilter,
            featured: featuredFilter === 'all' ? undefined : featuredFilter,
        }),
        placeholderData: (previousData) => previousData, // Keeps old data while new is fetching for smoother UX
    });

    // Derive values from useQuery's return
    const categories = categoriesData?.data || [];
    const total = categoriesData?.total || 0;

    // --- 2. Replace manual delete with useMutation ---
    const deleteCategoryMutation = useMutation({
        mutationFn: ProductService.deleteCategory,
        onSuccess: () => {
            addToast('Category deleted successfully', 'success');
            // Invalidate the 'categories' query to trigger an automatic refetch
            queryClient.invalidateQueries({ queryKey: ['categories'] });
        },
        onError: (err) => {
            addToast(err.response?.data?.message || 'Failed to delete category', 'error');
        },
        onSettled: () => {
            setDeleteModalOpen(false);
            setCategoryToDelete(null);
        }
    });

    const handleDeleteCategory = () => {
        if (categoryToDelete) {
            deleteCategoryMutation.mutate(categoryToDelete._id); // Pass the ID to the mutation
        }
    };

  const openDeleteModal = (category) => {
    setCategoryToDelete(category);
    setDeleteModalOpen(true);
  };

  const handleApplyFilters = () => {
    setPage(1);
    ProductService.clearCache();
    setNeedsRefresh(true);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setParentFilter('all');
    setFeaturedFilter('all');
    setPage(1);
    ProductService.clearCache();
    setNeedsRefresh(true);
  };

  const totalPages = Math.ceil(total / limit);
  const startItem = (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, total);

  return (
    <>
      <Helmet>
        <title>Categories | Scenture Admin</title>
      </Helmet>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="container mx-auto space-y-6 py-6 sm:py-8 px-4 sm:px-6 max-w-7xl"
      >
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div>
            <h1 className="text-2xl sm:text-3xl font-heading font-medium text-secondary tracking-tight">
              Categories
            </h1>
            <p className="text-sm text-muted-foreground mt-1.5">Manage product categories</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center border border-primary/20 rounded-md overflow-hidden">
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="icon"
                onClick={() => setViewMode('list')}
                className={viewMode === 'list' ? 'bg-primary text-background hover:bg-primary-dark' : 'hover:bg-primary/10'}
                aria-label="Switch to list view"
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'tree' ? 'default' : 'ghost'}
                size="icon"
                onClick={() => setViewMode('tree')}
                className={viewMode === 'tree' ? 'bg-primary text-background hover:bg-primary-dark' : 'hover:bg-primary/10'}
                aria-label="Switch to tree view"
              >
                <Grid className="h-4 w-4" />
              </Button>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                ProductService.clearCache();
                setNeedsRefresh(true);
                await fetchCategories();
                addToast('Categories refreshed', 'success');
              }}
              disabled={isLoading}
              className="hover:bg-primary/10"
              aria-label="Refresh categories"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Refreshing...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh
                </>
              )}
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={() => navigate('/admin/categories/new')}
              className="bg-primary hover:bg-primary-dark"
              aria-label="Add new category"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Category
            </Button>
          </div>
        </motion.header>

        {/* Tabs */}
        <Tabs value={viewMode} onValueChange={setViewMode} className="w-full">
          <TabsList className="hidden">
            <TabsTrigger value="list">List View</TabsTrigger>
            <TabsTrigger value="tree">Tree View</TabsTrigger>
          </TabsList>

          {/* List View */}
          <TabsContent value="list" className="mt-0">
            {/* Filters */}
            <motion.div variants={cardVariants}>
              <Card className="border-primary/20 bg-background shadow-sm mb-6">
                <CardContent className="p-4 sm:p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label htmlFor="search" className="block text-sm font-medium text-secondary mb-1.5">
                        Search
                      </label>
                      <div className="relative">
                        <Input
                          id="search"
                          type="text"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          placeholder="Search categories..."
                          className="pl-10"
                          onKeyPress={(e) => e.key === 'Enter' && handleApplyFilters()}
                        />
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="parent" className="block text-sm font-medium text-secondary mb-1.5">
                        Parent Category
                      </label>
                      <Select
                        value={parentFilter}
                        onValueChange={setParentFilter}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="All Categories" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Categories</SelectItem>
                          <SelectItem value="none">Top Level Only</SelectItem>
                          {categories
                            .filter((cat) => !cat.parent)
                            .map((cat) => (
                              <SelectItem key={cat.id} value={cat.id}>
                                {cat.name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label htmlFor="featured" className="block text-sm font-medium text-secondary mb-1.5">
                        Featured Status
                      </label>
                      <Select
                        value={featuredFilter}
                        onValueChange={setFeaturedFilter}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="All" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All</SelectItem>
                          <SelectItem value="true">Featured</SelectItem>
                          <SelectItem value="false">Not Featured</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex flex-col gap-2 sm:items-end">
                      <Button
                        variant="default"
                        size="sm"
                        onClick={handleApplyFilters}
                        className="w-full sm:w-auto bg-primary hover:bg-primary-dark"
                      >
                        <Filter className="mr-2 h-4 w-4" />
                        Apply Filters
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleClearFilters}
                        className="w-full sm:w-auto hover:bg-primary/10"
                      >
                        <X className="mr-2 h-4 w-4" />
                        Clear
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Categories List */}
            <motion.div variants={cardVariants}>
              <Card className="border-primary/20 bg-background shadow-sm">
                <CardContent className="p-0">
                  <LoadingOverlay isLoading={isLoading}>
                    {error ? (
                      <ErrorState
                        message={error}
                        onRetry={async () => {
                          ProductService.clearCache();
                          await fetchCategories();
                        }}
                      />
                    ) : categories.length === 0 ? (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex flex-col items-center justify-center py-12"
                      >
                        <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-xl font-heading text-secondary mb-2">No Categories Found</h3>
                        <p className="text-muted-foreground mb-6 text-center max-w-md">
                          {searchTerm || parentFilter !== 'all' || featuredFilter !== 'all'
                            ? 'No categories match your filters. Try adjusting your search criteria.'
                            : "You haven't created any categories yet. Add your first category to get started."}
                        </p>
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => navigate('/admin/categories/new')}
                          className="bg-primary hover:bg-primary-dark"
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Add Category
                        </Button>
                      </motion.div>
                    ) : (
                      <>
                        {/* Desktop Table */}
                        <div className="hidden md:block overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b border-muted/50">
                                <th className="text-left font-medium p-4 text-secondary">Name</th>
                                <th className="text-left font-medium p-4 text-secondary">Parent</th>
                                <th className="text-left font-medium p-4 text-secondary">Products</th>
                                <th className="text-left font-medium p-4 text-secondary">Subcategories</th>
                                <th className="text-center font-medium p-4 text-secondary">Featured</th>
                                <th className="text-right font-medium p-4 text-secondary">Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              <AnimatePresence>
                                {categories.map((category) => (
                                  <motion.tr
                                    key={category.id}
                                    variants={rowVariants}
                                    initial="hidden"
                                    animate="visible"
                                    exit="hidden"
                                    className="border-b border-muted/50 last:border-b-0 hover:bg-primary/10"
                                  >
                                    <td className="p-4">
                                      <div className="font-medium text-secondary">{category.name}</div>
                                      <div className="text-xs text-muted-foreground">{category.slug}</div>
                                    </td>
                                    <td className="p-4 text-secondary">
                                      {category.parent ? category.parentName || 'Unknown' : 'None'}
                                    </td>
                                    <td className="p-4 text-secondary">{category.productCount || 0}</td>
                                    <td className="p-4 text-secondary">{category.subcategoryCount || 0}</td>
                                    <td className="p-4 text-center">
                                      <span
                                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                          category.featured
                                            ? 'bg-primary/20 text-primary-dark'
                                            : 'bg-muted text-muted-foreground'
                                        }`}
                                      >
                                        {category.featured ? 'Featured' : 'Standard'}
                                      </span>
                                    </td>
                                    <td className="p-4 text-right">
                                      <div className="flex items-center justify-end space-x-2">
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          onClick={() => {
                                            if (category.id && /^[0-9a-fA-F]{24}$/.test(category.id)) {
                                              navigate(`/admin/categories/${category.id}`);
                                            } else {
                                              addToast('Invalid category ID', 'error');
                                            }
                                          }}
                                          className="hover:bg-primary/20"
                                          aria-label={`View category ${category.name}`}
                                        >
                                          <Eye className="h-4 w-4" />
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          onClick={() => {
                                            if (category.id && /^[0-9a-fA-F]{24}$/.test(category.id)) {
                                              navigate(`/admin/categories/${category.id}/edit`);
                                            } else {
                                              addToast('Invalid category ID', 'error');
                                            }
                                          }}
                                          className="hover:bg-primary/20"
                                          aria-label={`Edit category ${category.name}`}
                                        >
                                          <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          onClick={() => openDeleteModal(category)}
                                          disabled={category.productCount > 0 || category.subcategoryCount > 0}
                                          className={
                                            category.productCount > 0 || category.subcategoryCount > 0
                                              ? 'text-muted-foreground cursor-not-allowed'
                                              : 'hover:bg-destructive/20 hover:text-destructive'
                                          }
                                          aria-label={`Delete category ${category.name}`}
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    </td>
                                  </motion.tr>
                                ))}
                              </AnimatePresence>
                            </tbody>
                          </table>
                        </div>

                        {/* Mobile Cards */}
                        <div className="md:hidden space-y-4">
                          <AnimatePresence>
                            {categories.map((category) => (
                              <motion.div
                                key={category.id}
                                variants={cardVariants}
                                initial="hidden"
                                animate="visible"
                                exit="hidden"
                                className="border border-primary/20 bg-background rounded-md p-4"
                              >
                                <div className="flex justify-between items-start mb-2">
                                  <div>
                                    <h3 className="font-medium text-secondary">{category.name}</h3>
                                    <p className="text-xs text-muted-foreground">{category.slug}</p>
                                  </div>
                                  <span
                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                      category.featured
                                        ? 'bg-primary/20 text-primary-dark'
                                        : 'bg-muted text-muted-foreground'
                                    }`}
                                  >
                                    {category.featured ? 'Featured' : 'Standard'}
                                  </span>
                                </div>
                                <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
                                  <div>
                                    <span className="text-muted-foreground">Parent:</span>{' '}
                                    <span className="text-secondary">
                                      {category.parent ? category.parentName || 'Unknown' : 'None'}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">Products:</span>{' '}
                                    <span className="text-secondary">{category.productCount || 0}</span>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">Subcategories:</span>{' '}
                                    <span className="text-secondary">{category.subcategoryCount || 0}</span>
                                  </div>
                                </div>
                                <div className="flex justify-end space-x-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => navigate(`/admin/categories/${category.id}`)}
                                    className="hover:bg-primary/10"
                                    aria-label={`View category ${category.name}`}
                                  >
                                    <Eye className="mr-1 h-4 w-4" />
                                    View
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => navigate(`/admin/categories/${category.id}/edit`)}
                                    className="hover:bg-primary/10"
                                    aria-label={`Edit category ${category.name}`}
                                  >
                                    <Edit className="mr-1 h-4 w-4" />
                                    Edit
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => openDeleteModal(category)}
                                    disabled={category.productCount > 0 || category.subcategoryCount > 0}
                                    className={
                                      category.productCount > 0 || category.subcategoryCount > 0
                                        ? 'text-muted-foreground cursor-not-allowed'
                                        : 'hover:bg-destructive/10 hover:text-destructive'
                                    }
                                    aria-label={`Delete category ${category.name}`}
                                  >
                                    <Trash2 className="mr-1 h-4 w-4" />
                                    Delete
                                  </Button>
                                </div>
                              </motion.div>
                            ))}
                          </AnimatePresence>
                        </div>
                      </>
                    )}
                  </LoadingOverlay>
                </CardContent>
              </Card>
            </motion.div>

            {/* Pagination */}
            {!isLoading && !error && categories.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-6"
              >
                <div className="text-sm text-muted-foreground">
                  Showing <span className="font-medium text-secondary">{startItem}</span> to{' '}
                  <span className="font-medium text-secondary">{endItem}</span> of{' '}
                  <span className="font-medium text-secondary">{total}</span> categories
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                    className="hover:bg-primary/10"
                    aria-label="Previous page"
                  >
                    <ChevronLeft className="mr-1 h-4 w-4" />
                    Previous
                  </Button>
                  <div className="flex items-center space-x-1">
                    {totalPages <= 7 ? (
                      [...Array(totalPages)].map((_, i) => (
                        <Button
                          key={i + 1}
                          variant={page === i + 1 ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setPage(i + 1)}
                          className="w-9 h-9 p-0"
                          aria-label={`Page ${i + 1}`}
                        >
                          {i + 1}
                        </Button>
                      ))
                    ) : (
                      <>
                        <Button
                          variant={page === 1 ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setPage(1)}
                          className="w-9 h-9 p-0"
                          aria-label="Page 1"
                        >
                          1
                        </Button>
                        {page > 3 && <span className="text-muted-foreground">...</span>}
                        {page > 2 && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage(page - 1)}
                            className="w-9 h-9 p-0"
                            aria-label={`Page ${page - 1}`}
                          >
                            {page - 1}
                          </Button>
                        )}
                        {page !== 1 && page !== totalPages && (
                          <Button
                            variant="default"
                            size="sm"
                            className="w-9 h-9 p-0"
                            aria-label={`Page ${page}`}
                          >
                            {page}
                          </Button>
                        )}
                        {page < totalPages - 1 && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage(page + 1)}
                            className="w-9 h-9 p-0"
                            aria-label={`Page ${page + 1}`}
                          >
                            {page + 1}
                          </Button>
                        )}
                        {page < totalPages - 2 && <span className="text-muted-foreground">...</span>}
                        <Button
                          variant={page === totalPages ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setPage(totalPages)}
                          className="w-9 h-9 p-0"
                          aria-label={`Page ${totalPages}`}
                        >
                          {totalPages}
                        </Button>
                      </>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(page + 1)}
                    disabled={page === totalPages}
                    className="hover:bg-primary/10"
                    aria-label="Next page"
                  >
                    Next
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            )}
          </TabsContent>

          {/* Tree View */}
          <TabsContent value="tree" className="mt-0">
            <motion.div variants={cardVariants}>
              <Card className="border-primary/20 bg-background shadow-sm">
                <CardContent className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-heading text-secondary">Category Hierarchy</h2>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={async () => {
                        ProductService.clearCache();
                        setNeedsRefresh(true);
                        await fetchCategories();
                        addToast('Category tree refreshed', 'success');
                      }}
                      className="hover:bg-primary/10"
                      aria-label="Refresh category tree"
                    >
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Refresh Tree
                    </Button>
                  </div>
                  <LoadingOverlay isLoading={isLoading}>
                    <CategoryTree />
                  </LoadingOverlay>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteCategory}
        title="Delete Category"
        message={
          categoryToDelete?.productCount > 0 || categoryToDelete?.subcategoryCount > 0
            ? `Cannot delete "${categoryToDelete?.name}". This category has ${categoryToDelete?.productCount || 0} products and ${categoryToDelete?.subcategoryCount || 0} subcategories associated with it.`
            : `Are you sure you want to delete "${categoryToDelete?.name}"? This action cannot be undone.`
        }
        confirmText="Delete"
        confirmVariant="danger"
        disabled={categoryToDelete?.productCount > 0 || categoryToDelete?.subcategoryCount > 0}
      />
    </>
  );
};

export default CategoryPage;