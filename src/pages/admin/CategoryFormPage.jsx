import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { 
  ArrowLeft, 
  Save, 
  Trash, 
  Edit, 
  Upload, 
  X,
  AlertCircle
} from 'lucide-react';
import { useToast } from '../../components/ui/Toast'; // Replaced react-hot-toast with custom toast

import ProductService from '../../services/admin/product.service';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { LoadingState } from '../../components/ui/LoadingState';
import ErrorState from '../../components/ui/ErrorState';
import ConfirmationModal from '../../components/ui/ConfirmationModal';

const CategoryFormPage = () => {
  const { id, action } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast(); // Use custom toast hook
  const isViewMode = action === 'view';
  const isEditMode = action === 'edit' || (id && !action);
  const isNewMode = !id && !action;

  // State variables
  const [category, setCategory] = useState({
    name: '',
    description: '',
    parent: '',
    featured: false
  });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  // Fetch category data and all categories for parent selection
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch all categories for parent dropdown
        const categoriesResponse = await ProductService.getAllCategories();
        setCategories(categoriesResponse.data || []);

        // If editing or viewing, fetch the specific category
        if (id && (isEditMode || isViewMode)) {
          const categoryResponse = await ProductService.getCategory(id);
          const categoryData = categoryResponse.data;
          
          setCategory({
            name: categoryData.category.name || '',
            description: categoryData.category.description || '',
            parent: categoryData.category.parent || '',
            featured: categoryData.category.featured || false
          });
          
          if (categoryData.image) {
            setImagePreview(categoryData.image);
          }
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.message || 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, isEditMode, isViewMode]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCategory(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear validation error when field is edited
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  // Handle image selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Remove selected image
  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  // Validate form
  const validateForm = () => {
    const errors = {};
    if (!category.name.trim()) {
      errors.name = 'Category name is required';
    }

    // Check if parent is self (for edit mode)
    if (isEditMode && category.parent === id) {
      errors.parent = 'A category cannot be its own parent';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('name', category.name);
      formData.append('description', category.description);
      if (category.parent) {
        formData.append('parent', category.parent);
      }
      formData.append('featured', category.featured);
      
      if (imageFile) {
        formData.append('image', imageFile);
      }

      let response;
      if (isEditMode) {
        response = await ProductService.updateCategory(id, formData);
        addToast('Category updated successfully', 'success'); // Updated to use custom toast
      } else {
        response = await ProductService.createCategory(formData);
        addToast('Category created successfully', 'success'); // Updated to use custom toast
      }

      // Clear categories cache to ensure fresh data
      localStorage.removeItem('categories');
      
      // Navigate back to categories list
      navigate('/admin/categories');
    } catch (err) {
      console.error('Error saving category:', err);
      
      // Handle validation errors from server
      if (err.response?.data?.errors) {
        setValidationErrors(err.response.data.errors);
      }
      
      addToast(err.response?.data?.message || 'Failed to save category', 'error'); // Updated to use custom toast
    } finally {
      setSaving(false);
    }
  };

  // Handle category deletion
  const handleDelete = async () => {
    setSaving(true);
    try {
      await ProductService.deleteCategory(id);
      addToast('Category deleted successfully', 'success'); // Updated to use custom toast
      
      // Clear categories cache to ensure fresh data
      localStorage.removeItem('categories');
      
      // Navigate back to categories list
      navigate('/admin/categories');
    } catch (err) {
      console.error('Error deleting category:', err);
      addToast(err.response?.data?.message || 'Failed to delete category', 'error'); // Updated to use custom toast
    } finally {
      setSaving(false);
      setDeleteModalOpen(false);
    }
  };

  // Page title based on mode
  const getPageTitle = () => {
    if (isViewMode) return 'View Category';
    if (isEditMode) return 'Edit Category';
    return 'Add New Category';
  };

  return (
    <>
      <Helmet>
        <title>{getPageTitle()} | Scenture Lagos Admin</title>
      </Helmet>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="dashboardHeading">{getPageTitle()}</h1>
            <p className="dashboardSubHeading">
              {isViewMode
                ? 'View category details'
                : isEditMode
                ? 'Update category information'
                : 'Create a new product category'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              className="flex items-center"
              onClick={() => navigate('/admin/categories')}
            >
              <ArrowLeft size={16} className="mr-2" />
              Back to Categories
            </Button>
            
            {isViewMode && (
              <Button
                variant="default"
                className="flex items-center"
                onClick={() => navigate(`/admin/categories/${id}/edit`)}
              >
                <Edit size={16} className="mr-2" />
                Edit
              </Button>
            )}
            
            {(isViewMode || isEditMode) && (
              <Button
                variant="outline"
                className="flex items-center text-red-500 hover:bg-red-50"
                onClick={() => setDeleteModalOpen(true)}
              >
                <Trash size={16} className="mr-2" />
                Delete
              </Button>
            )}
          </div>
        </div>

        {loading ? (
          <LoadingState message="Loading category data..." />
        ) : error ? (
          <ErrorState message={error} />
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Information */}
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardContent className="p-6">
                    <h2 className="text-xl font-medium text-secondary mb-4">Category Information</h2>
                    
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-secondary mb-1">
                          Category Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          id="name"
                          name="name"
                          type="text"
                          value={category.name}
                          onChange={handleInputChange}
                          disabled={isViewMode}
                          className={`w-full px-4 py-2 border ${validationErrors.name ? 'border-red-500' : 'border-slate-200'} rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 ${isViewMode ? 'bg-slate-50' : ''}`}
                        />
                        {validationErrors.name && (
                          <p className="mt-1 text-sm text-red-500">{validationErrors.name}</p>
                        )}
                      </div>
                      
                      <div>
                        <label htmlFor="description" className="block text-sm font-medium text-secondary mb-1">
                          Description
                        </label>
                        <textarea
                          id="description"
                          name="description"
                          value={category.description}
                          onChange={handleInputChange}
                          disabled={isViewMode}
                          rows={4}
                          className={`w-full px-4 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 ${isViewMode ? 'bg-slate-50' : ''}`}
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="parent" className="block text-sm font-medium text-secondary mb-1">
                          Parent Category
                        </label>
                        <select
                          id="parent"
                          name="parent"
                          value={category.parent}
                          onChange={handleInputChange}
                          disabled={isViewMode}
                          className={`w-full px-4 py-2 border ${validationErrors.parent ? 'border-red-500' : 'border-slate-200'} rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 bg-white ${isViewMode ? 'bg-slate-50' : ''}`}
                        >
                          <option value="">None (Top Level Category)</option>
                          {categories
                            .filter(cat => cat._id !== id) // Exclude current category
                            .map(cat => (
                              <option key={cat._id} value={cat._id}>
                                {cat.name}
                              </option>
                            ))}
                        </select>
                        {validationErrors.parent && (
                          <p className="mt-1 text-sm text-red-500">{validationErrors.parent}</p>
                        )}
                      </div>
                      
                      <div className="flex items-center">
                        <input
                          id="featured"
                          name="featured"
                          type="checkbox"
                          checked={category.featured}
                          onChange={handleInputChange}
                          disabled={isViewMode}
                          className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary/50"
                        />
                        <label htmlFor="featured" className="ml-2 block text-sm text-secondary">
                          Featured Category (will be highlighted in store)
                        </label>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                <Card>
                  <CardContent className="p-6">
                    <h2 className="text-xl font-medium text-secondary mb-4">Category Image</h2>
                    
                    <div className="space-y-4">
                      {imagePreview ? (
                        <div className="relative">
                          <img
                            src={imagePreview}
                            alt="Category preview"
                            className="w-full h-48 object-cover rounded-md"
                          />
                          {!isViewMode && (
                            <button
                              type="button"
                              onClick={handleRemoveImage}
                              className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-md hover:bg-slate-100"
                            >
                              <X size={16} className="text-secondary" />
                            </button>
                          )}
                        </div>
                      ) : (
                        <div className="border-2 border-dashed border-slate-200 rounded-md p-6 flex flex-col items-center justify-center text-center">
                          <div className="mb-3 p-3 bg-slate-100 rounded-full">
                            <Upload size={24} className="text-slate-400" />
                          </div>
                          <p className="text-sm text-secondary mb-1">No image uploaded</p>
                          <p className="text-xs text-secondary/70 mb-3">
                            Recommended size: 800x600px, max 2MB
                          </p>
                          {!isViewMode && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="relative overflow-hidden"
                            >
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="absolute inset-0 opacity-0 cursor-pointer"
                              />
                              Upload Image
                            </Button>
                          )}
                        </div>
                      )}
                      
                      {imagePreview && !isViewMode && (
                        <div className="flex justify-center">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="relative overflow-hidden"
                          >
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleImageChange}
                              className="absolute inset-0 opacity-0 cursor-pointer"
                            />
                            Change Image
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {!isViewMode && (
                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      variant="default"
                      className="w-full flex items-center justify-center"
                      disabled={saving}
                    >
                      {saving ? (
                        <span className="animate-spin mr-2">⟳</span>
                      ) : (
                        <Save size={16} className="mr-2" />
                      )}
                      {saving ? 'Saving...' : isEditMode ? 'Update Category' : 'Create Category'}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </form>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete Category"
        message={
          <>            
            <p className="mb-4">Are you sure you want to delete "{category.name}"? This action cannot be undone.</p>
            <div className="flex items-center p-3 bg-amber-50 text-amber-800 rounded-md">
              <AlertCircle size={20} className="mr-2 flex-shrink-0" />
              <p className="text-sm">
                If this category has products or subcategories, the deletion will fail. You must reassign or delete those items first.
              </p>
            </div>
          </>
        }
        confirmText="Delete"
        confirmVariant="danger"
      />
    </>
  );
};

export default CategoryFormPage;