import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { 
  Plus, 
  Search, 
  RefreshCw, 
  Edit, 
  Trash, 
  Eye, 
  ChevronLeft, 
  ChevronRight,
  Filter,
  X,
  AlertCircle,
  List,
  Grid
} from 'lucide-react';
import { useToast } from '../../components/ui/Toast';

import ProductService from '../../services/admin/product.service';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/Tabs';
import { LoadingState } from '../../components/ui/LoadingState';
import ErrorState from '../../components/ui/ErrorState';
import ConfirmationModal from '../../components/ui/ConfirmationModal';
import CategoryTree from '../../components/admin/CategoryTree';

const CategoryPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);

  // State variables
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState(queryParams.get('search') || '');
  const [parentFilter, setParentFilter] = useState(queryParams.get('parent') || '');
  const [featuredFilter, setFeaturedFilter] = useState(queryParams.get('featured') || '');
  const [page, setPage] = useState(parseInt(queryParams.get('page') || '1'));
  const [limit, setLimit] = useState(parseInt(queryParams.get('limit') || '10'));
  const [total, setTotal] = useState(0);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [viewMode, setViewMode] = useState(queryParams.get('view') || 'list');
  const {addToast} = useToast()

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = {
          page,
          limit,
          search: searchTerm,
          parent: parentFilter,
          featured: featuredFilter || undefined
        };

        // Update URL query parameters
        const newQueryParams = new URLSearchParams();
        if (page !== 1) newQueryParams.set('page', page.toString());
        if (limit !== 10) newQueryParams.set('limit', limit.toString());
        if (searchTerm) newQueryParams.set('search', searchTerm);
        if (parentFilter) newQueryParams.set('parent', parentFilter);
        if (featuredFilter) newQueryParams.set('featured', featuredFilter);
        
        const newUrl = `${location.pathname}${newQueryParams.toString() ? `?${newQueryParams.toString()}` : ''}`;
        navigate(newUrl, { replace: true });

        const response = await ProductService.getAllCategories(params);
        setCategories(response.data);
        setTotal(response.total || response.data.length);
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError(err.message || 'Failed to fetch categories');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [page, limit, refreshTrigger, navigate, location.pathname]);

  // Apply filters
  const handleApplyFilters = () => {
    setPage(1); // Reset to first page when filters change
    setRefreshTrigger(prev => prev + 1);
  };

  // Clear filters
  const handleClearFilters = () => {
    setSearchTerm('');
    setParentFilter('');
    setFeaturedFilter('');
    setPage(1);
    setRefreshTrigger(prev => prev + 1);
  };

  // Handle delete category
  const handleDeleteCategory = async () => {
    if (!categoryToDelete) return;
    
    try {
      await ProductService.deleteCategory(categoryToDelete._id);
      addToast('Category deleted successfully', 'success');
      setRefreshTrigger(prev => prev + 1);
    } catch (err) {
      console.error('Error deleting category:', err);
      addToast(err.response?.data?.message || 'Failed to delete category', 'error');
    } finally {
      setDeleteModalOpen(false);
      setCategoryToDelete(null);
    }
  };

  // Open delete confirmation modal
  const openDeleteModal = (category) => {
    setCategoryToDelete(category);
    setDeleteModalOpen(true);
  };

  // Calculate pagination values
  const totalPages = Math.ceil(total / limit);
  const startItem = (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, total);

  return (
    <>
      <Helmet>
        <title>Categories | Scenture Lagos Admin</title>
      </Helmet>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="dashboardHeading">Categories</h1>
            <p className="dashboardSubHeading">Manage product categories</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center border border-slate-200 rounded-md overflow-hidden mr-2">
              <button
                className={`p-2 ${viewMode === 'list' ? 'bg-primary text-white' : 'bg-white text-secondary hover:bg-slate-50'}`}
                onClick={() => {
                  setViewMode('list');
                  const newParams = new URLSearchParams(location.search);
                  newParams.set('view', 'list');
                  navigate(`${location.pathname}?${newParams.toString()}`, { replace: true });
                }}
                title="List View"
              >
                <List size={16} />
              </button>
              <button
                className={`p-2 ${viewMode === 'tree' ? 'bg-primary text-white' : 'bg-white text-secondary hover:bg-slate-50'}`}
                onClick={() => {
                  setViewMode('tree');
                  const newParams = new URLSearchParams(location.search);
                  newParams.set('view', 'tree');
                  navigate(`${location.pathname}?${newParams.toString()}`, { replace: true });
                }}
                title="Tree View"
              >
                <Grid size={16} />
              </button>
            </div>
            <Button
              variant="outline"
              className="flex items-center"
              onClick={() => setRefreshTrigger(prev => prev + 1)}
              disabled={loading}
            >
              <RefreshCw size={16} className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button
              variant="default"
              className="flex items-center"
              onClick={() => navigate('/admin/categories/new')}
            >
              <Plus size={16} className="mr-2" />
              Add Category
            </Button>
          </div>
        </div>

        {/* Categories View */}
        <Tabs defaultValue={viewMode} value={viewMode} onValueChange={setViewMode} className="w-full">
          <TabsList className="hidden">
            <TabsTrigger value="list">List View</TabsTrigger>
            <TabsTrigger value="tree">Tree View</TabsTrigger>
          </TabsList>
          
          <TabsContent value="list" className="mt-0">
            {/* Filters - Only show in list view */}
            <Card className="mb-6">
              <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label htmlFor="search" className="block text-sm font-medium text-secondary mb-1">
                      Search
                    </label>
                    <div className="relative">
                      <input
                        id="search"
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search categories..."
                        className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                      />
                      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="parent" className="block text-sm font-medium text-secondary mb-1">
                      Parent Category
                    </label>
                    <select
                      id="parent"
                      value={parentFilter}
                      onChange={(e) => setParentFilter(e.target.value)}
                      className="w-full px-4 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 bg-white"
                    >
                      <option value="">All Categories</option>
                      <option value="none">Top Level Only</option>
                      {categories
                        .filter(cat => !cat.parent)
                        .map(cat => (
                          <option key={cat._id} value={cat._id}>
                            {cat.name}
                          </option>
                        ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="featured" className="block text-sm font-medium text-secondary mb-1">
                      Featured Status
                    </label>
                    <select
                      id="featured"
                      value={featuredFilter}
                      onChange={(e) => setFeaturedFilter(e.target.value)}
                      className="w-full px-4 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 bg-white"
                    >
                      <option value="">All</option>
                      <option value="true">Featured</option>
                      <option value="false">Not Featured</option>
                    </select>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Button
                      variant="default"
                      className="flex w-full items-center"
                      onClick={handleApplyFilters}
                    >
                      <Filter size={16} className="mr-2" />
                      Apply Filters
                    </Button>
                    <Button
                      variant="outline"
                      className="flex w-full items-center"
                      onClick={handleClearFilters}
                    >
                      <X size={16} className="mr-2" />
                      Clear
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Categories List */}
            <Card>
              <CardContent className="p-0">
                {loading ? (
                  <LoadingState message="Loading categories..." />
                ) : error ? (
                  <ErrorState message={error} />
                ) : categories.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <AlertCircle size={48} className="text-slate-300 mb-4" />
                    <h3 className="text-xl font-medium text-secondary mb-2">No Categories Found</h3>
                    <p className="text-secondary/70 mb-6 text-center max-w-md">
                      {searchTerm || parentFilter || featuredFilter
                        ? 'No categories match your filters. Try adjusting your search criteria.'
                        : 'You haven\'t created any categories yet. Add your first category to get started.'}
                    </p>
                    <Button
                      variant="default"
                      className="flex items-center"
                      onClick={() => navigate('/admin/categories/new')}
                    >
                      <Plus size={16} className="mr-2" />
                      Add Category
                    </Button>
                  </div>
                ) : (
                  <>
                    {/* Desktop View */}
                    <div className="hidden md:block overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-slate-200">
                            <th className="text-left font-medium p-4">Name</th>
                            <th className="text-left font-medium p-4">Parent</th>
                            <th className="text-left font-medium p-4">Products</th>
                            <th className="text-left font-medium p-4">Subcategories</th>
                            <th className="text-center font-medium p-4">Featured</th>
                            <th className="text-right font-medium p-4">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {categories.map((category) => (
                            <tr key={category._id} className="border-b border-slate-100">
                              <td className="p-4">
                                <div className="font-medium text-secondary">{category.name}</div>
                                <div className="text-xs text-secondary/70">{category.slug}</div>
                              </td>
                              <td className="p-4">
                                {category.parent ? (
                                  <span className="text-secondary">
                                    {category.parentName || 'Unknown'}
                                  </span>
                                ) : (
                                  <span className="text-secondary/70">None</span>
                                )}
                              </td>
                              <td className="p-4">
                                <span className="text-secondary">{category.productCount || 0}</span>
                              </td>
                              <td className="p-4">
                                <span className="text-secondary">{category.subcategoryCount || 0}</span>
                              </td>
                              <td className="p-4 text-center">
                                {category.featured ? (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    Featured
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                                    Standard
                                  </span>
                                )}
                              </td>
                              <td className="p-4 text-right">
                                <div className="flex items-center justify-end space-x-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => navigate(`/admin/categories/${category._id}`)}
                                    title="View Category"
                                  >
                                    <Eye size={16} />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => navigate(`/admin/categories/${category._id}/edit`)}
                                    title="Edit Category"
                                  >
                                    <Edit size={16} />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => openDeleteModal(category)}
                                    title="Delete Category"
                                    disabled={category.productCount > 0 || category.subcategoryCount > 0}
                                  >
                                    <Trash
                                      size={16}
                                      className={`${category.productCount > 0 || category.subcategoryCount > 0 ? 'text-slate-300' : 'text-red-500'}`}
                                    />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile View */}
                    <div className="md:hidden">
                      {categories.map((category) => (
                        <div key={category._id} className="border-b border-slate-100 p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h3 className="font-medium text-secondary">{category.name}</h3>
                              <p className="text-xs text-secondary/70">{category.slug}</p>
                            </div>
                            {category.featured && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Featured
                              </span>
                            )}
                          </div>
                          <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
                            <div>
                              <span className="text-secondary/70">Parent:</span>{' '}
                              <span className="text-secondary">
                                {category.parent
                                  ? category.parentName || 'Unknown'
                                  : 'None'}
                              </span>
                            </div>
                            <div>
                              <span className="text-secondary/70">Products:</span>{' '}
                              <span className="text-secondary">{category.productCount || 0}</span>
                            </div>
                            <div>
                              <span className="text-secondary/70">Subcategories:</span>{' '}
                              <span className="text-secondary">{category.subcategoryCount || 0}</span>
                            </div>
                          </div>
                          <div className="flex justify-end space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => navigate(`/admin/categories/${category._id}`)}
                              className="flex items-center"
                            >
                              <Eye size={14} className="mr-1" />
                              View
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => navigate(`/admin/categories/${category._id}/edit`)}
                              className="flex items-center"
                            >
                              <Edit size={14} className="mr-1" />
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openDeleteModal(category)}
                              className="flex items-center"
                              disabled={category.productCount > 0 || category.subcategoryCount > 0}
                            >
                              <Trash
                                size={14}
                                className={`mr-1 ${category.productCount > 0 || category.subcategoryCount > 0 ? 'text-slate-300' : 'text-red-500'}`}
                              />
                              Delete
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
            
            {/* Pagination - Only show in list view */}
            {!loading && !error && categories.length > 0 && (
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-6">
                <div className="text-sm text-secondary/70">
                  Showing <span className="font-medium">{startItem}</span> to{' '}
                  <span className="font-medium">{endItem}</span> of{' '}
                  <span className="font-medium">{total}</span> categories
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                    className="flex items-center"
                  >
                    <ChevronLeft size={16} className="mr-1" />
                    Previous
                  </Button>
                  <div className="flex items-center space-x-1">
                    {totalPages <= 7 ? (
                      // Show all pages if 7 or fewer
                      [...Array(totalPages)].map((_, i) => (
                        <Button
                          key={i + 1}
                          variant={page === i + 1 ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setPage(i + 1)}
                          className="w-9 h-9 p-0"
                        >
                          {i + 1}
                        </Button>
                      ))
                    ) : (
                      // Show first, last, and pages around current
                      <>
                        <Button
                          variant={page === 1 ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setPage(1)}
                          className="w-9 h-9 p-0"
                        >
                          1
                        </Button>
                        {page > 3 && <span className="text-secondary/70">...</span>}
                        {page > 2 && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage(page - 1)}
                            className="w-9 h-9 p-0"
                          >
                            {page - 1}
                          </Button>
                        )}
                        {page !== 1 && page !== totalPages && (
                          <Button variant="default" size="sm" className="w-9 h-9 p-0">
                            {page}
                          </Button>
                        )}
                        {page < totalPages - 1 && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage(page + 1)}
                            className="w-9 h-9 p-0"
                          >
                            {page + 1}
                          </Button>
                        )}
                        {page < totalPages - 2 && <span className="text-secondary/70">...</span>}
                        <Button
                          variant={page === totalPages ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setPage(totalPages)}
                          className="w-9 h-9 p-0"
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
                    className="flex items-center"
                  >
                    Next
                    <ChevronRight size={16} className="ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="tree" className="mt-0">
            <Card>
              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-medium text-secondary">Category Hierarchy</h2>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center"
                    onClick={() => setRefreshTrigger(prev => prev + 1)}
                  >
                    <RefreshCw size={14} className="mr-2" />
                    Refresh Tree
                  </Button>
                </div>
                <CategoryTree />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

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