import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Save,
  Trash2,
  Edit,
  Upload,
  X,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { useToast } from '../../components/ui/Toast';
import { useRefresh } from '../../contexts/RefreshContext';
import ProductService from '../../services/admin/product.service';
import DashboardService from '../../services/admin/dashboard.service';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/Select';
import { LoadingOverlay } from '../../components/ui/LoadingState';
import ErrorState from '../../components/ui/ErrorState';
import ConfirmationModal from '../../components/ui/ConfirmationModal';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

const fieldVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
};

const CategoryFormPage = () => {
  const { id, action } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { needsRefresh, setNeedsRefresh } = useRefresh();
  const isViewMode = action === 'view';
  const isEditMode = action === 'edit' || (id && !action);
  const isNewMode = !id && !action;

  const [category, setCategory] = useState({
    name: '',
    description: '',
    parent: 'none',
    featured: false,
  });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(isEditMode || isViewMode);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);

  const isValidObjectId = (id) => /^[0-9a-fA-F]{24}$/.test(id);

  useEffect(() => {
    const fetchData = async () => {
      if ((isEditMode || isViewMode) && (!id || !isValidObjectId(id))) {
        addToast('Invalid category ID', 'error');
        navigate('/admin/categories', { replace: true });
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const cacheKey = `categories_${JSON.stringify({})}`;
        const cachedCategories = ProductService.getCachedData(cacheKey);
        if (cachedCategories && !needsRefresh) {
          setCategories(cachedCategories.data);
        } else {
          const categoriesResponse = await ProductService.getAllCategories();
          setCategories(categoriesResponse.data || []);
        }

        if (id && (isEditMode || isViewMode)) {
          const categoryCacheKey = `category_${id}`;
          const cachedCategory = ProductService.getCachedData(categoryCacheKey);
          if (cachedCategory && !needsRefresh) {
            setCategory({
              name: cachedCategory.data.category.name || '',
              description: cachedCategory.data.category.description || '',
              parent: cachedCategory.data.category.parent || 'none',
              featured: cachedCategory.data.category.featured || false,
            });
            if (cachedCategory.data.image) {
              setImagePreview(cachedCategory.data.image);
            }
          } else {
            const categoryResponse = await ProductService.getCategory(id);
            const categoryData = categoryResponse.data;
            setCategory({
              name: categoryData.category.name || '',
              description: categoryData.category.description || '',
              parent: categoryData.category.parent || 'none',
              featured: categoryData.category.featured || false,
            });
            if (categoryData.image) {
              setImagePreview(categoryData.image);
            }
          }
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch data');
        addToast(err.response?.data?.message || 'Failed to fetch data', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, isEditMode, isViewMode, needsRefresh, navigate, addToast]);

  const handleInputChange = (name, value) => {
    if (isViewMode) return;
    setCategory((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const compressImage = async (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 600;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            },
            'image/jpeg',
            0.7
          );
        };
      };
    });
  };

  const handleImageChange = async (e) => {
    if (isViewMode) return;
    const file = e.target.files[0];
    if (file) {
      setImageLoading(true);
      try {
        const compressedFile = await compressImage(file);
        setImageFile(compressedFile);
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result);
        };
        reader.readAsDataURL(compressedFile);
      } catch (err) {
        addToast('Failed to process image', 'error');
      } finally {
        setImageLoading(false);
      }
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    if (isViewMode) return;
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      setImageLoading(true);
      try {
        const compressedFile = await compressImage(file);
        setImageFile(compressedFile);
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result);
        };
        reader.readAsDataURL(compressedFile);
      } catch (err) {
        addToast('Failed to process image', 'error');
      } finally {
        setImageLoading(false);
      }
    } else {
      addToast('Please drop a valid image file', 'error');
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    if (!isViewMode) setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleRemoveImage = () => {
    if (isViewMode) return;
    setImageFile(null);
    setImagePreview(null);
  };

  const validateForm = () => {
    const errors = {};
    if (!category.name.trim()) {
      errors.name = 'Category name is required';
    }
    if (isEditMode && category.parent === id) {
      errors.parent = 'A category cannot be its own parent';
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isViewMode) return;
    if (!validateForm()) return;

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('name', category.name);
      formData.append('description', category.description);
      if (category.parent !== 'none') {
        formData.append('parent', category.parent);
      }
      formData.append('featured', category.featured);
      if (imageFile) {
        formData.append('image', imageFile);
      }

      if (isEditMode) {
        await ProductService.updateCategory(id, formData);
        addToast('Category updated successfully', 'success');
      } else {
        await ProductService.createCategory(formData);
        addToast('Category created successfully', 'success');
      }

      ProductService.clearCache();
      DashboardService.clearCache();
      setNeedsRefresh(true);
      navigate('/admin/categories');
    } catch (err) {
      if (err.response?.data?.errors) {
        setValidationErrors(err.response.data.errors);
      }
      addToast(err.response?.data?.message || 'Failed to save category', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (isViewMode) return;
    setSaving(true);
    try {
      await ProductService.deleteCategory(id);
      addToast('Category deleted successfully', 'success');
      ProductService.clearCache();
      DashboardService.clearCache();
      setNeedsRefresh(true);
      navigate('/admin/categories');
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to delete category', 'error');
    } finally {
      setSaving(false);
      setDeleteModalOpen(false);
    }
  };

  const getPageTitle = () => {
    if (isViewMode) return 'View Category';
    if (isEditMode) return 'Edit Category';
    return 'Add New Category';
  };

  return (
    <>
      <Helmet>
        <title>{getPageTitle()} | Scenture Admin</title>
      </Helmet>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="container mx-auto space-y-6 py-6 sm:py-8 px-4 sm:px-6 max-w-7xl"
      >
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div>
            <h1 className="text-2xl sm:text-3xl font-heading font-medium text-secondary tracking-tight">
              {getPageTitle()}
            </h1>
            <p className="text-sm text-muted-foreground mt-1.5">
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
              size="sm"
              onClick={() => navigate('/admin/categories')}
              className="hover:bg-primary/10"
              aria-label="Back to categories"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            {isViewMode && (
              <Button
                variant="default"
                size="sm"
                onClick={() => navigate(`/admin/categories/${id}/edit`)}
                className="bg-primary hover:bg-primary-dark"
                aria-label="Edit category"
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
            )}
            {(isViewMode || isEditMode) && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDeleteModalOpen(true)}
                className="hover:bg-destructive/10 hover:text-destructive"
                aria-label="Delete category"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            )}
          </div>
        </motion.header>

        <LoadingOverlay loading={loading}>
          {error ? (
            <motion.div variants={cardVariants}>
              <ErrorState
                message={error}
                onRetry={async () => {
                  ProductService.clearCache();
                  await fetchData();
                }}
              />
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  <motion.div variants={cardVariants}>
                    <Card className="border-primary/20 bg-background shadow-sm">
                      <CardContent className="p-6">
                        <h2 className="text-xl font-heading text-secondary mb-4">Category Information</h2>
                        <div className="space-y-6">
                          <motion.div variants={fieldVariants}>
                            <label htmlFor="name" className="block text-sm font-medium text-secondary mb-1.5">
                              Category Name <span className="text-destructive">*</span>
                            </label>
                            <Input
                              id="name"
                              name="name"
                              type="text"
                              value={category.name}
                              onChange={(e) => handleInputChange('name', e.target.value)}
                              disabled={isViewMode}
                              placeholder="Enter category name"
                              className={validationErrors.name ? 'border-destructive' : ''}
                              aria-invalid={validationErrors.name ? 'true' : 'false'}
                            />
                            {validationErrors.name && (
                              <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="mt-1 text-sm text-destructive"
                              >
                                {validationErrors.name}
                              </motion.p>
                            )}
                          </motion.div>
                          <motion.div variants={fieldVariants}>
                            <label htmlFor="description" className="block text-sm font-medium text-secondary mb-1.5">
                              Description
                            </label>
                            <Textarea
                              id="description"
                              name="description"
                              value={category.description}
                              onChange={(e) => handleInputChange('description', e.target.value)}
                              disabled={isViewMode}
                              rows={4}
                              placeholder="Enter category description"
                              className="resize-none"
                            />
                          </motion.div>
                          <motion.div variants={fieldVariants}>
                            <label htmlFor="parent" className="block text-sm font-medium text-secondary mb-1.5">
                              Parent Category
                            </label>
                            <Select
                              value={category.parent}
                              onValueChange={(value) => handleInputChange('parent', value)}
                              disabled={isViewMode}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select parent category" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">None (Top Level Category)</SelectItem>
                                {categories
                                  .filter((cat) => cat._id !== id)
                                  .map((cat) => (
                                    <SelectItem key={cat._id} value={cat._id}>
                                      {cat.name}
                                    </SelectItem>
                                  ))}
                              </SelectContent>
                            </Select>
                            {validationErrors.parent && (
                              <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="mt-1 text-sm text-destructive"
                              >
                                {validationErrors.parent}
                              </motion.p>
                            )}
                          </motion.div>
                          <motion.div variants={fieldVariants} className="flex items-center">
                            <input
                              id="featured"
                              name="featured"
                              type="checkbox"
                              checked={category.featured}
                              onChange={(e) => handleInputChange('featured', e.target.checked)}
                              disabled={isViewMode}
                              className="h-4 w-4 rounded border-muted text-primary focus:ring-primary/50"
                            />
                            <label htmlFor="featured" className="ml-2 text-sm text-secondary">
                              Featured Category (highlighted in store)
                            </label>
                          </motion.div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </div>
                <div className="space-y-6">
                  <motion.div variants={cardVariants}>
                    <Card className="border-primary/20 bg-background shadow-sm">
                      <CardContent className="p-6">
                        <h2 className="text-xl font-heading text-secondary mb-4">Category Image</h2>
                        <div
                          className={`border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center text-center transition-colors ${
                            isDragging && !isViewMode ? 'border-primary bg-primary/10' : 'border-muted'
                          }`}
                          onDragOver={handleDragOver}
                          onDragLeave={handleDragLeave}
                          onDrop={handleDrop}
                        >
                          {imageLoading ? (
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="flex flex-col items-center"
                            >
                              <Loader2 className="h-8 w-8 text-primary animate-spin mb-2" />
                              <p className="text-sm text-secondary">Processing image...</p>
                            </motion.div>
                          ) : imagePreview ? (
                            <div className="relative w-full">
                              <motion.img
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                src={imagePreview}
                                alt="Category preview"
                                className="w-full h-48 object-cover rounded-md"
                              />
                              {!isViewMode && (
                                <motion.button
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  type="button"
                                  onClick={handleRemoveImage}
                                  className="absolute top-2 right-2 p-1.5 bg-background rounded-full shadow-md hover:bg-muted"
                                  aria-label="Remove image"
                                >
                                  <X className="h-4 w-4 text-secondary" />
                                </motion.button>
                              )}
                            </div>
                          ) : (
                            <>
                              <div className="mb-3 p-3 bg-muted rounded-full">
                                <Upload className="h-6 w-6 text-muted-foreground" />
                              </div>
                              <p className="text-sm text-secondary mb-1">No image uploaded</p>
                              <p className="text-xs text-muted-foreground mb-3">
                                Recommended size: 800x600px, max 2MB
                              </p>
                              {!isViewMode && (
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  className="relative overflow-hidden hover:bg-primary/10"
                                >
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                    aria-label="Upload category image"
                                  />
                                  Upload Image
                                </Button>
                              )}
                            </>
                          )}
                        </div>
                        {imagePreview && !isViewMode && !imageLoading && (
                          <div className="flex justify-center mt-4">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="relative overflow-hidden hover:bg-primary/10"
                            >
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="absolute inset-0 opacity-0 cursor-pointer"
                                aria-label="Change category image"
                              />
                              Change Image
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                  {!isViewMode && (
                    <motion.div variants={fieldVariants} className="flex justify-end">
                      <Button
                        type="submit"
                        variant="default"
                        size="sm"
                        className="w-full sm:w-auto bg-primary hover:bg-primary-dark"
                        disabled={saving}
                        aria-label={isEditMode ? 'Update category' : 'Create category'}
                      >
                        {saving ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="mr-2 h-4 w-4" />
                            {isEditMode ? 'Update Category' : 'Create Category'}
                          </>
                        )}
                      </Button>
                    </motion.div>
                  )}
                </div>
              </div>
            </form>
          )}
        </LoadingOverlay>
      </motion.div>

      <ConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete Category"
        message={
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <p className="mb-4 text-secondary">
              Are you sure you want to delete "{category.name}"? This action cannot be undone.
            </p>
            <div className="flex items-start p-3 bg-amber-50 text-amber-800 rounded-md">
              <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
              <p className="text-sm">
                If this category has products or subcategories, the deletion will fail. You must reassign or delete those items first.
              </p>
            </div>
          </motion.div>
        }
        confirmText="Delete"
        confirmVariant="danger"
      />
    </>
  );
};

export default CategoryFormPage;