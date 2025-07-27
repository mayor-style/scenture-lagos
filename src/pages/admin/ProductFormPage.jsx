import React, { useState, useCallback, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Save, Edit, Trash2, Plus, X, Upload, Image as ImageIcon, Eye, RefreshCw } from 'lucide-react';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/Select';
import ProductService from '../../services/admin/product.service';
import { useToast } from '../../components/ui/Toast';
import { formatPrice } from '../../lib/utils';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

const ProductFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isEditMode = location.pathname.includes('/edit');
  const isViewMode = !!id && !isEditMode;
  const isCreateMode = !id;
  const { addToast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    price: '',
    stock: '',
    status: 'published',
    category: '',
    categoryId: 'all',
    description: '',
    scent_notes: [],
    ingredients: '',
    variants: [],
    images: [],
  });
  const [newScentNote, setNewScentNote] = useState('');
  const [newVariant, setNewVariant] = useState({ size: '', price: '', stockQuantity: '', scentIntensity: 'medium', sku: '' });
  const [imageFiles, setImageFiles] = useState([]);
  const [errors, setErrors] = useState({});
  const [isGeneratingSKU, setIsGeneratingSKU] = useState(false);
  const [isGeneratingVariantSKU, setIsGeneratingVariantSKU] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  // --- React Query for Product Data ---
  const {
    data: productData,
    isLoading: productLoading,
    isError: productError,
    error: productErrorMessage,
  } = useQuery({
    queryKey: ['product', id],
    queryFn: () => ProductService.getProduct(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

useEffect(() => {
  if (productData) {
    console.log('Hydrating form with productData:', productData); // For your confirmation
    setFormData({
      name: productData.name || '',
      sku: productData.sku || '',
      price: productData.price || '',
      stock: productData.stock || '',
      status: productData.status || 'published',
      // Note: useQuery will give you the normalized category object from your service
      category: productData.category?.name ||  productData.category?._id || '', 
      categoryId: productData.category?._id || 'all',
      description: productData.description || '',
      // Combine all scent notes into one array for the form state
      scent_notes: [
        ...(productData.scentNotes?.top || []),
        ...(productData.scentNotes?.middle || []),
        ...(productData.scentNotes?.base || []),
      ],
      ingredients: Array.isArray(productData.ingredients) ? productData.ingredients.join(', ') : '',
      variants: productData.variants || [],
      images: productData.images || [],
    });
  }
}, [productData]); // This effect runs only when `productData` changes


  // --- React Query for Categories ---
  const {
    data: categoriesData,
    isLoading: categoriesLoading,
    isError: categoriesError,
    error: categoriesErrorMessage,
  } = useQuery({
    queryKey: ['categories'],
    queryFn: () => ProductService.getAllCategories(),
    onError: (err) => {
      console.error('Categories Query Error:', err);
      addToast(`Failed to load categories: ${err.message}`, 'error');
    },
    staleTime: 15 * 60 * 1000,
  });

  const categories = categoriesData?.data || [];
  const loading = isCreateMode ? false : productLoading || categoriesLoading;


  // --- Mutations ---
  const createProductMutation = useMutation({
    mutationFn: ProductService.createProduct,
    onSuccess: async (response) => {
      console.log('Create Product Response:', response);
      addToast('Product created successfully', 'success');
      if (imageFiles.length > 0) {
        const formData = new FormData();
        imageFiles.forEach((file) => formData.append('images', file));
       await uploadProductImagesMutation.mutateAsync({ productId: response.data?.product?._id, formData });
      }
      queryClient.invalidateQueries(['products']);
      queryClient.invalidateQueries(['product', response.data?.product._id]);
      navigate('/admin/products');
    },
    onError: (err) => {
      console.error('Create Product Error:', err);
      addToast(`Failed to create product: ${err.message}`, 'error');
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: ({ id, payload }) => ProductService.updateProduct(id, payload),
    onSuccess: async () => {
      addToast('Product updated successfully', 'success');
      if (imageFiles.length > 0) {
        const formData = new FormData();
        imageFiles.forEach((file) => formData.append('images', file));
        await uploadProductImagesMutation.mutateAsync({ productId: id, formData });
      }
      queryClient.invalidateQueries(['products']);
      queryClient.invalidateQueries(['product', id]);
      navigate('/admin/products');
    },
    onError: (err) => {
      addToast(`Failed to update product: ${err.message}`, 'error');
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: ProductService.deleteProduct,
    onSuccess: () => {
      addToast('Product deleted successfully', 'success');
      queryClient.invalidateQueries(['products']);
      navigate('/admin/products');
    },
    onError: (err) => {
      addToast(`Failed to delete product: ${err.message}`, 'error');
    },
  });

  const uploadProductImagesMutation = useMutation({
    mutationFn: ({ productId, formData }) =>
      ProductService.uploadProductImages(productId, formData, (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        setUploadProgress(percentCompleted);
      }),
    onMutate: () => {
      setIsUploading(true);
      setUploadProgress(0);
    },
    onSuccess: (response) => {
      setFormData((prev) => ({
        ...prev,
        images: response.data.product.images,
      }));
      addToast('Images uploaded successfully', 'success');
      queryClient.invalidateQueries(['product', id]);
    },
    onError: (err) => {
      addToast(`Failed to upload images: ${err.message}`, 'error');
    },
    onSettled: () => {
      setIsUploading(false);
      setUploadProgress(0);
      setImageFiles([]);
    },
  });

  const deleteProductImageMutation = useMutation({
    mutationFn: ({ productId, imageId }) => ProductService.deleteProductImage(productId, imageId),
    onSuccess: (response) => {
      setFormData((prev) => ({
        ...prev,
        images: response.data.product.images,
      }));
      addToast('Image removed successfully', 'success');
      queryClient.invalidateQueries(['product', id]);
    },
    onError: (err) => {
      addToast(`Failed to remove image: ${err.message}`, 'error');
    },
  });

  const setMainProductImageMutation = useMutation({
    mutationFn: ({ productId, imageId }) => ProductService.setMainProductImage(productId, imageId),
    onSuccess: (response) => {
      setFormData((prev) => ({
        ...prev,
        images: response.data.product.images,
      }));
      addToast('Main image updated successfully', 'success');
      queryClient.invalidateQueries(['product', id]);
    },
    onError: (err) => {
      addToast(`Failed to set main image: ${err.message}`, 'error');
    },
  });

  // --- Handlers ---
  const handleChange = useCallback((e) => {
    if (isViewMode) return;
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  }, [isViewMode]);

  const handleAddScentNote = useCallback(() => {
    if (isViewMode || !newScentNote.trim()) return;
    setFormData((prev) => ({
      ...prev,
      scent_notes: [...prev.scent_notes, newScentNote.trim()],
    }));
    setNewScentNote('');
  }, [isViewMode, newScentNote]);

  const handleRemoveScentNote = useCallback((index) => {
    if (isViewMode) return;
    setFormData((prev) => ({
      ...prev,
      scent_notes: prev.scent_notes.filter((_, i) => i !== index),
    }));
  }, [isViewMode]);

  const handleVariantChange = useCallback((e) => {
    if (isViewMode) return;
    const { name, value } = e.target;
    setNewVariant((prev) => ({ ...prev, [name]: value }));
  }, [isViewMode]);

  const handleAddVariant = async () => {
    if (isViewMode) return;
    if (!formData.sku) {
      addToast('Please generate a product SKU first', 'error');
      return;
    }
    if (!newVariant.size || !newVariant.price || !newVariant.stockQuantity || !newVariant.scentIntensity) {
      addToast('Please fill all required variant fields', 'error');
      return;
    }
    setIsGeneratingVariantSKU(true);
    try {
      const variantSKU = await ProductService.generateVariantSKU(formData.sku, newVariant.size);
      setFormData((prev) => ({
        ...prev,
        variants: [
          ...prev.variants,
          {
            ...newVariant,
            _id: Date.now().toString(),
            sku: variantSKU,
            priceAdjustment: parseFloat(newVariant.price || 0) - parseFloat(formData.price || 0),
          },
        ],
      }));
      setNewVariant({ size: '', price: '', stockQuantity: '', scentIntensity: 'medium', sku: '' });
    } catch (err) {
      addToast(`Failed to add variant: ${err.message}`, 'error');
    } finally {
      setIsGeneratingVariantSKU(false);
    }
  };

  const handleRemoveVariant = useCallback((id) => {
    if (isViewMode) return;
    setFormData((prev) => ({
      ...prev,
      variants: prev.variants.filter((variant) => variant._id !== id && variant.id !== id),
    }));
  }, [isViewMode]);

  const compressImage = async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 800;
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
              if (!blob) {
                reject(new Error('Image compression failed: Blob is null.'));
                return;
              }
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            },
            'image/jpeg',
            0.8
          );
        };
        img.onerror = () => reject(new Error('Failed to load image for compression.'));
      };
      reader.onerror = () => reject(new Error('Failed to read file for compression.'));
    });
  };

  const handleImageUpload = async (e) => {
    if (isViewMode) return;
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const compressPromises = files.map((file) => compressImage(file));
      const compressedFiles = await Promise.all(compressPromises);
      setImageFiles((prev) => [...prev, ...compressedFiles]);

      if (isEditMode || id) {
        const formData = new FormData();
        compressedFiles.forEach((file) => formData.append('images', file));
        await uploadProductImagesMutation.mutateAsync({ productId: id, formData });
      } else {
        const newImageUrls = compressedFiles.map((file) => ({
          url: URL.createObjectURL(file),
          _id: null,
          isMain: formData.images.length === 0 && !formData.images.some((img) => img.isMain),
          public_id: null,
        }));
        setFormData((prev) => ({
          ...prev,
          images: [...prev.images, ...newImageUrls],
        }));
      }
    } catch (err) {
      addToast(`Failed to upload images: ${err.message}`, 'error');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleRemoveImage = async (index) => {
    if (isViewMode) return;
    const newImages = [...formData.images];
    const imageId = newImages[index]?._id;
    newImages.splice(index, 1);

    if (newImages.length > 0 && newImages[0]) {
      newImages[0].isMain = true;
    }

    setFormData((prev) => ({ ...prev, images: newImages }));
    setImageFiles((prev) => prev.filter((_, i) => i !== index));

    if ((isEditMode || id) && imageId) {
      await deleteProductImageMutation.mutateAsync({ productId: id, imageId });
    }
  };

  const handleSetMainImage = async (imageId) => {
    if (isViewMode || !imageId) return;
    await setMainProductImageMutation.mutateAsync({ productId: id, imageId });
  };

  const validateForm = useCallback(() => {
    const newErrors = {};
    if (!formData.name) newErrors.name = 'Product name is required';
    if (!formData.sku) newErrors.sku = 'Please generate a SKU';
    if (!formData.price) newErrors.price = 'Price is required';
    else if (isNaN(parseFloat(formData.price)) || parseFloat(formData.price) < 0) {
      newErrors.price = 'Price must be a valid positive number';
    }
    if (!formData.stock) newErrors.stock = 'Stock quantity is required';
    else if (isNaN(parseInt(formData.stock)) || parseInt(formData.stock) < 0) {
      newErrors.stock = 'Stock must be a valid positive number';
    }
    if (formData.categoryId === 'all') newErrors.category = 'Category is required';
    if (formData.variants.length > 0) {
      const variantNames = new Set();
      const variantSkus = new Set();
      const variantErrors = [];
      formData.variants.forEach((variant, index) => {
        if (!variant.sku) {
          variantErrors.push(`Variant #${index + 1}: SKU is required`);
        } else if (variantSkus.has(variant.sku)) {
          variantErrors.push(`Variant #${index + 1}: Duplicate SKU ${variant.sku}`);
        }
        variantSkus.add(variant.sku);
        if (variantNames.has(variant.size)) {
          variantErrors.push(`Duplicate variant name: ${variant.size}`);
        }
        variantNames.add(variant.size);
        if (isNaN(parseFloat(variant.price)) || parseFloat(variant.price) < 0) {
          variantErrors.push(`Variant #${index + 1}: Price must be a valid positive number`);
        }
        if (isNaN(parseInt(variant.stockQuantity)) || parseInt(variant.stockQuantity) < 0) {
          variantErrors.push(`Variant #${index + 1}: Stock must be a valid positive number`);
        }
      });
      if (variantErrors.length > 0) {
        newErrors.variants = variantErrors;
      }
    }
    if (formData.images.length === 0 && imageFiles.length === 0) {
      newErrors.images = 'At least one product image is required';
    } else if (formData.images.length > 0 && !formData.images.some((img) => img.isMain)) {
      newErrors.images = 'At least one image must be set as the main image';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isViewMode) return;
    if (!validateForm()) return;

    const payload = {
      name: formData.name,
      sku: formData.sku,
      price: parseFloat(formData.price),
      stockQuantity: parseInt(formData.stock),
      status: formData.status,
      category: formData.categoryId === 'all' ? '' : formData.categoryId,
      description: formData.description,
      scentNotes: {
        top: formData.scent_notes.slice(0, Math.ceil(formData.scent_notes.length / 3)),
        middle: formData.scent_notes.slice(
          Math.ceil(formData.scent_notes.length / 3),
          Math.ceil(formData.scent_notes.length * 2 / 3)
        ),
        base: formData.scent_notes.slice(Math.ceil(formData.scent_notes.length * 2 / 3)),
      },
      ingredients: formData.ingredients.split(',').map((item) => item.trim()).filter(Boolean),
      variants: formData.variants.map((variant) => ({
        sku: variant.sku,
        size: variant.size,
        priceAdjustment: parseFloat(variant.price) - parseFloat(formData.price),
        stockQuantity: parseInt(variant.stockQuantity),
        scentIntensity: variant.scentIntensity,
      })),
    };

    if (isEditMode) {
      await updateProductMutation.mutateAsync({ id, payload });
    } else {
      await createProductMutation.mutateAsync(payload);
    }
  };

  const handleDelete = async () => {
    if (!id) {
      addToast('No product ID provided', 'error');
      return;
    }
    if (window.confirm('Are you sure you want to delete this product?')) {
      await deleteProductMutation.mutateAsync(id);
    }
  };

  const handleGenerateSKU = async () => {
    if (isViewMode || formData.categoryId === 'all') {
      addToast('Select a category first', 'error');
      return;
    }
    setIsGeneratingSKU(true);
    try {
      const response = await ProductService.generateSKU(formData.categoryId);
      const sku = response.data.sku;
      if (!sku) throw new Error('No SKU returned from server');
      setFormData((prev) => ({ ...prev, sku }));
      setErrors((prev) => ({ ...prev, sku: '' }));
    } catch (err) {
      addToast(err.message || 'Failed to generate SKU', 'error');
    } finally {
      setIsGeneratingSKU(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>
          {isViewMode ? 'View Product' : isEditMode ? 'Edit Product' : 'Add New Product'} | Scenture Admin
        </title>
      </Helmet>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto space-y-6 py-6 sm:py-8 px-4 sm:px-6 max-w-7xl"
      >
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              asChild
              className="mr-4 hover:bg-primary/20"
              aria-label="Back to products"
            >
              <Link to="/admin/products">
                <ArrowLeft className="h-5 w-5 text-secondary" />
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-heading font-medium text-secondary tracking-tight">
                {isViewMode ? 'View Product' : isEditMode ? 'Edit Product' : 'Add New Product'}
              </h1>
              <p className="text-sm text-muted-foreground mt-1.5">
                {isViewMode ? 'View product details' : isEditMode ? 'Update product information' : 'Create a new product'}
              </p>
            </div>
          </div>
          {id && (
            <div className="flex gap-2">
              {isViewMode && (
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="hover:bg-primary/10"
                >
                  <Link to={`/admin/products/${id}/edit`}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Product
                  </Link>
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={handleDelete}
                className="hover:bg-destructive/10 hover:text-destructive"
                aria-label="Delete product"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Product
              </Button>
            </div>
          )}
        </motion.header>

        {/* Error State */}
        {(productError || categoriesError) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-md"
          >
            <p>{productErrorMessage?.message || categoriesErrorMessage?.message || 'Failed to load data'}</p>
          </motion.div>
        )}

        {/* Loading State */}
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center py-20"
          >
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-2 border-primary/50 border-t-primary mx-auto"></div>
              <p className="text-muted-foreground font-light">Loading product data...</p>
            </div>
          </motion.div>
        )}

        {/* Form Content */}
        {!loading && (
          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Basic Info, Scent Notes, Ingredients, Variants */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information */}
              <motion.div variants={cardVariants}>
                <Card className="border-primary/20 bg-background shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-xl font-heading text-secondary">Basic Information</CardTitle>
                    <CardDescription className="text-sm text-muted-foreground">Core details of the product</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-secondary mb-1.5">
                        Product Name*
                      </label>
                      {isViewMode ? (
                        <p className="text-secondary">{formData.name || 'N/A'}</p>
                      ) : (
                        <>
                          <Input
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Enter product name"
                            disabled={isViewMode}
                            className={errors.name ? 'border-destructive' : ''}
                          />
                          {errors.name && <p className="mt-1 text-sm text-destructive">{errors.name}</p>}
                        </>
                      )}
                    </div>

                    <div>
                      <label htmlFor="description" className="block text-sm font-medium text-secondary mb-1.5">
                        Description
                      </label>
                      {isViewMode ? (
                        <p className="text-secondary">{formData.description || 'N/A'}</p>
                      ) : (
                        <Textarea
                          id="description"
                          name="description"
                          value={formData.description}
                          onChange={handleChange}
                          rows={5}
                          placeholder="Enter product description"
                          disabled={isViewMode}
                        />
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="sku" className="block text-sm font-medium text-secondary mb-1.5">
                          SKU*
                        </label>
                        {isViewMode ? (
                          <p className="text-secondary">{formData.sku || 'N/A'}</p>
                        ) : (
                          <div className="flex flex-col gap-3">
                            <Input
                              id="sku"
                              name="sku"
                              value={formData.sku}
                              readOnly
                              className="bg-muted/50 text-muted-foreground cursor-not-allowed"
                              placeholder="Generate SKU"
                            />
                            {isCreateMode && (
                              <Button
                                type="button"
                                onClick={handleGenerateSKU}
                                className="bg-primary hover:bg-primary-dark"
                                disabled={isGeneratingSKU || formData.sku}
                              >
                                {isGeneratingSKU ? (
                                  <>
                                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                    Generating...
                                  </>
                                ) : (
                                  'Generate SKU'
                                )}
                              </Button>
                            )}
                          </div>
                        )}
                        {errors.sku && <p className="mt-1 text-sm text-destructive">{errors.sku}</p>}
                      </div>
                      <div>
                        <label htmlFor="categoryId" className="block text-sm font-medium text-secondary mb-1.5">
                          Category*
                        </label>
                        {isViewMode ? (
                          <p className="text-secondary">{formData.category || 'N/A'}</p>
                        ) : (
                          <>
                            <Select
                              value={formData.categoryId}
                              onValueChange={(value) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  categoryId: value,
                                  category: categories.find((cat) => cat.id === value)?.name || '',
                                }))
                              }
                              disabled={isViewMode}
                            >
                              <SelectTrigger className={errors.category ? 'border-destructive' : ''}>
                                <SelectValue placeholder="Select a category" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">Select a category</SelectItem>
                                {categories.map((category) => (
                                  <SelectItem key={category.id} value={category.id}>
                                    {category.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {errors.category && <p className="mt-1 text-sm text-destructive">{errors.category}</p>}
                          </>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label htmlFor="price" className="block text-sm font-medium text-secondary mb-1.5">
                          Base Price (₦)*
                        </label>
                        {isViewMode ? (
                          <p className="text-secondary">{formatPrice(formData.price) || 'N/A'}</p>
                        ) : (
                          <>
                            <Input
                              type="number"
                              id="price"
                              name="price"
                              value={formData.price}
                              onChange={handleChange}
                              placeholder="0.00"
                              min="0"
                              step="100"
                              disabled={isViewMode}
                              className={errors.price ? 'border-destructive' : ''}
                            />
                            {errors.price && <p className="mt-1 text-sm text-destructive">{errors.price}</p>}
                          </>
                        )}
                      </div>
                      <div>
                        <label htmlFor="stock" className="block text-sm font-medium text-secondary mb-1.5">
                          Stock Quantity*
                        </label>
                        {isViewMode ? (
                          <p className="text-secondary">{formData.stock || 'N/A'}</p>
                        ) : (
                          <>
                            <Input
                              type="number"
                              id="stock"
                              name="stock"
                              value={formData.stock}
                              onChange={handleChange}
                              placeholder="0"
                              min="0"
                              disabled={isViewMode}
                              className={errors.stock ? 'border-destructive' : ''}
                            />
                            {errors.stock && <p className="mt-1 text-sm text-destructive">{errors.stock}</p>}
                          </>
                        )}
                      </div>
                      <div>
                        <label htmlFor="status" className="block text-sm font-medium text-secondary mb-1.5">
                          Status
                        </label>
                        {isViewMode ? (
                          <p className="text-secondary">{formData.status || 'N/A'}</p>
                        ) : (
                          <Select
                            value={formData.status}
                            onValueChange={(value) => setFormData((prev) => ({ ...prev, status: value }))}
                            disabled={isViewMode}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="published">Published</SelectItem>
                              <SelectItem value="draft">Draft</SelectItem>
                              <SelectItem value="archived">Archived</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Scent Notes */}
              <motion.div variants={cardVariants}>
                <Card className="border-primary/20 bg-background shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-xl font-heading text-secondary">Scent Notes</CardTitle>
                    <CardDescription className="text-sm text-muted-foreground">Fragrance notes for the product</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-wrap gap-2 mb-4">
                      <AnimatePresence>
                        {formData.scent_notes.length > 0 ? (
                          formData.scent_notes.map((note, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.8 }}
                              className="flex items-center bg-primary/10 px-3 py-1.5 rounded-full"
                            >
                              <span className="text-sm text-secondary">{note}</span>
                              {!isViewMode && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveScentNote(index)}
                                  className="ml-2 text-destroy hover:text-destructive"
                                  aria-label={`Remove scent note ${note}`}
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              )}
                            </motion.div>
                          ))
                        ) : (
                          <p className="text-muted-foreground">No scent notes added</p>
                        )}
                      </AnimatePresence>
                    </div>
                    {!isViewMode && (
                      <div className="flex gap-2">
                        <Input
                          value={newScentNote}
                          onChange={(e) => setNewScentNote(e.target.value)}
                          placeholder="Add a scent note (e.g., Lavender)"
                          onKeyPress={(e) => e.key === 'Enter' && handleAddScentNote()}
                        />
                        <Button
                          type="button"
                          onClick={handleAddScentNote}
                          className="bg-primary hover:bg-primary-dark"
                          disabled={!newScentNote.trim()}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Ingredients */}
              <motion.div variants={cardVariants}>
                <Card className="border-primary/20 bg-background shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-xl font-heading text-secondary">Ingredients</CardTitle>
                    <CardDescription className="text-sm text-muted-foreground">Ingredients used in the product</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isViewMode ? (
                      <p className="text-secondary">{formData.ingredients || 'N/A'}</p>
                    ) : (
                      <Textarea
                        id="ingredients"
                        name="ingredients"
                        value={formData.ingredients}
                        onChange={handleChange}
                        rows={4}
                        placeholder="Enter product ingredients, separated by commas"
                        disabled={isViewMode}
                      />
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Product Variants */}
              <motion.div variants={cardVariants}>
                <Card className="border-primary/20 bg-background shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-xl font-heading text-secondary">Product Variants</CardTitle>
                    <CardDescription className="text-sm text-muted-foreground">Size or scent variants with specific pricing</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {errors.variants && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="bg-destructive/10 border border-destructive/20 text-destructive px-3 py-3 rounded-md"
                      >
                        <p className="font-medium">Please fix the following issues:</p>
                        <ul className="list-disc pl-5 mt-1 text-sm">
                          {Array.isArray(errors.variants) ? (
                            errors.variants.map((error, index) => (
                              <li key={index}>{error}</li>
                            ))
                          ) : (
                            <li>{errors.variants}</li>
                          )}
                        </ul>
                      </motion.div>
                    )}
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-muted/50">
                            <th className="text-left font-medium p-3 pl-0">Size/Variant</th>
                            <th className="text-left font-medium p-3">SKU</th>
                            <th className="text-left font-medium p-3">Price (₦)</th>
                            <th className="text-left font-medium p-3">Stock</th>
                            <th className="text-left font-medium p-3">Scent Intensity</th>
                            {!isViewMode && <th className="text-right font-medium p-3 pr-0">Actions</th>}
                          </tr>
                        </thead>
                        <tbody>
                          <AnimatePresence>
                            {formData.variants.length > 0 ? (
                              formData.variants.map((variant) => (
                                <motion.tr
                                  key={variant._id || variant.id}
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  exit={{ opacity: 0 }}
                                  className="border-b border-muted/50 last:border-b-0 hover:bg-primary/10"
                                >
                                  <td className="p-3 pl-0 text-secondary">{variant.size}</td>
                                  <td className="p-3 text-secondary">{variant.sku}</td>
                                  <td className="p-3 text-secondary">{formatPrice(variant.priceAdjustment + formData.price)}</td>
                                  <td className="p-3 text-secondary">{variant.stockQuantity}</td>
                                  <td className="p-3 text-secondary">{variant.scentIntensity}</td>
                                  {!isViewMode && (
                                    <td className="p-3 pr-0 text-right">
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleRemoveVariant(variant._id || variant.id)}
                                        className="hover:bg-destructive/10 hover:text-destructive"
                                        aria-label={`Remove variant ${variant.size}`}
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </td>
                                  )}
                                </motion.tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan={isViewMode ? 5 : 6} className="p-3 text-center text-muted-foreground">
                                  No variants added yet
                                </td>
                              </tr>
                            )}
                          </AnimatePresence>
                        </tbody>
                      </table>
                    </div>
                    {!isViewMode && (
                      <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 mt-4">
                        <Input
                          name="size"
                          value={newVariant.size}
                          onChange={handleVariantChange}
                          placeholder="Size (e.g., 8oz)"
                        />
                        <Input
                          type="number"
                          name="price"
                          value={newVariant.price}
                          onChange={handleVariantChange}
                          placeholder="Price"
                          min="0"
                          step="100"
                        />
                        <Input
                          type="number"
                          name="stockQuantity"
                          value={newVariant.stockQuantity}
                          onChange={handleVariantChange}
                          placeholder="Stock"
                          min="0"
                        />
                        <Select
                          value={newVariant.scentIntensity}
                          onValueChange={(value) =>
                            setNewVariant((prev) => ({ ...prev, scentIntensity: value }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Scent Intensity" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="light">Light</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="strong">Strong</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          type="button"
                          onClick={handleAddVariant}
                          className="bg-primary hover:bg-primary-dark"
                          disabled={isGeneratingVariantSKU}
                        >
                          {isGeneratingVariantSKU ? (
                            <RefreshCw className="h-4 w-4 animate-spin" />
                          ) : (
                            <Plus className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Right Column: Images and Submit */}
            <div className="space-y-6">
              {/* Product Images */}
              <motion.div variants={cardVariants}>
                <Card className="border-primary/20 bg-background shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-xl font-heading text-secondary">Product Images</CardTitle>
                    <CardDescription className="text-sm text-muted-foreground">High-quality product images</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {errors.images && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="bg-destructive/10 border border-destructive/20 text-destructive px-3 py-3 rounded-md"
                      >
                        <p>{errors.images}</p>
                      </motion.div>
                    )}
                    <div className="grid grid-cols-2 gap-4">
                      <AnimatePresence>
                        {formData.images.map((image, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="relative group aspect-square"
                          >
                            <div className={`bg-muted/50 rounded-md overflow-hidden ${image.isMain ? 'ring-2 ring-primary' : ''}`}>
                              <img
                                src={image.url}
                                alt={`Product image ${index + 1}`}
                                className="w-full h-full object-cover"
                              />
                              {image.isMain && (
                                <div className="absolute top-2 left-2 bg-primary text-background text-xs px-2 py-1 rounded-md">
                                  Main Image
                                </div>
                              )}
                            </div>
                            {!isViewMode && (
                              <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                {!image.isMain && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleSetMainImage(image._id)}
                                    className="bg-background hover:bg-primary/20"
                                    aria-label={`Set image ${index + 1} as main`}
                                  >
                                    <Eye className="h-4 w-4 text-secondary" />
                                  </Button>
                                )}
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleRemoveImage(index)}
                                  className="bg-background hover:bg-destructive/20 hover:text-destructive"
                                  aria-label={`Remove image ${index + 1}`}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            )}
                          </motion.div>
                        ))}
                      </AnimatePresence>
                      {!isViewMode && formData.images.length < 4 && (
                        <label className="aspect-square bg-muted/50 border-2 border-dashed border-primary/50 rounded-md flex flex-col items-center justify-center cursor-pointer hover:bg-primary/10 transition-all group relative">
                          {isUploading ? (
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="flex flex-col items-center justify-center w-full h-full"
                            >
                              <div className="w-16 h-16 mb-2 relative">
                                <svg className="w-full h-full" viewBox="0 0 36 36">
                                  <circle cx="18" cy="18" r="16" fill="none" className="stroke-muted" strokeWidth="2" />
                                  <motion.circle
                                    cx="18"
                                    cy="18"
                                    r="16"
                                    fill="none"
                                    className="stroke-primary"
                                    strokeWidth="2"
                                    strokeDasharray="100"
                                    strokeDashoffset={100 - uploadProgress}
                                    transform="rotate(-90 18 18)"
                                    animate={{ strokeDashoffset: 100 - uploadProgress }}
                                    transition={{ ease: 'easeInOut' }}
                                  />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center text-sm font-medium text-primary">
                                  {uploadProgress}%
                                </div>
                              </div>
                              <span className="text-sm text-muted-foreground">Uploading...</span>
                            </motion.div>
                          ) : (
                            <>
                              <Upload className="h-6 w-6 text-muted-foreground mb-2 group-hover:text-primary" />
                              <span className="text-sm text-muted-foreground group-hover:text-primary">Upload Image</span>
                              <span className="text-xs text-muted-foreground mt-1 text-center">
                                Images will be compressed
                              </span>
                            </>
                          )}
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/jpg"
                            onChange={handleImageUpload}
                            className="hidden"
                            multiple
                            disabled={isUploading}
                          />
                        </label>
                      )}
                    </div>
                    {formData.images.length === 0 && (
                      <div className="text-center py-8">
                        <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
                        <p className="text-muted-foreground">No images uploaded yet</p>
                        <p className="text-sm text-muted-foreground mt-1">Upload high-quality product images</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Submit Button */}
              {!isViewMode && (
                <motion.div variants={cardVariants}>
                  <Card className="border-primary/20 bg-background shadow-sm">
                    <CardContent className="p-6">
                      <Button
                        type="submit"
                        onClick={handleSubmit}
                        className="w-full bg-primary hover:bg-primary-dark"
                        disabled={createProductMutation.isLoading || updateProductMutation.isLoading}
                      >
                        {(createProductMutation.isLoading || updateProductMutation.isLoading) ? (
                          <>
                            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                            {isEditMode ? 'Updating...' : 'Creating...'}
                          </>
                        ) : (
                          <>
                            <Save className="mr-2 h-4 w-4" />
                            {isEditMode ? 'Update Product' : 'Create Product'}
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </motion.div>
    </>
  );
};

export default ProductFormPage;