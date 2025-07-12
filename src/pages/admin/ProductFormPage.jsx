// src/pages/admin/ProductFormPage.jsx
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { ArrowLeft, Save, Trash2, Plus, X, Upload, Image as ImageIcon, Eye } from 'lucide-react';
import ProductService from '../../services/admin/product.service';
import { useToast } from '../../components/ui/Toast';
import { useRefresh } from '../../contexts/RefreshContext';
import { formatPrice } from '../../lib/utils';
import DashboardService from '../../services/admin/dashboard.service';

const ProductFormPage = () => {
  const { id, action } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id && action === 'edit');
  const isViewMode = Boolean(id && action === 'view');
  const isCreateMode = !id && !action;
  const { addToast } = useToast();
  const { setNeedsRefresh } = useRefresh();

  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    price: '',
    stock: '',
    status: 'published',
    category: '',
    categoryId: '',
    description: '',
    scent_notes: [],
    ingredients: '',
    variants: [],
    images: [],
  });
  const [categories, setCategories] = useState([]);
  const [newScentNote, setNewScentNote] = useState('');
  const [newVariant, setNewVariant] = useState({ size: '', price: '', stock: '' });
  const [imageFiles, setImageFiles] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(isEditMode || isViewMode);
  const [isGenerating, setIsGenerating] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const cachedCategories = ProductService.getCachedData(`categories_${JSON.stringify({})}`);
        if (cachedCategories) {
          setCategories(cachedCategories.data);
        } else {
          const categoriesResponse = await ProductService.getAllCategories();
          setCategories(categoriesResponse.data);
        }

        if (id) {
          const cachedProduct = ProductService.getCachedData(`product_${id}`);
          if (cachedProduct) {
            setFormData({
              name: cachedProduct.product.name,
              sku: cachedProduct.product.sku,
              price: cachedProduct.product.price,
              stock: cachedProduct.product.stock,
              status: cachedProduct.product.status,
              category: cachedProduct.product.category,
              categoryId: cachedProduct.product.categoryId,
              description: cachedProduct.product.description,
              scent_notes: cachedProduct.product.scent_notes,
              ingredients: cachedProduct.product.ingredients,
              variants: cachedProduct.product.variants,
              images: cachedProduct.product.images,
            });
          } else {
            const { product } = await ProductService.getProduct(id);
            setFormData({
              name: product.name || '',
              sku: product.sku || '',
              price: product.price || '',
              stock: product.stock || '',
              status: product.status || 'published',
              category: product.category || '',
              categoryId: product.categoryId || '',
              description: product.description || '',
              scent_notes: product.scent_notes || [],
              ingredients: product.ingredients || '',
              variants: product.variants || [],
              images: product.images.map(img => ({ url: img.url, _id: img._id, isMain: img.isMain || false })) || [],
            });
          }
        }
      } catch (err) {
        addToast(err.message, 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, isEditMode, isViewMode]);

  const handleChange = (e) => {
    if (isViewMode) return;
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddScentNote = () => {
    if (isViewMode) return;
    if (newScentNote.trim()) {
      setFormData(prev => ({
        ...prev,
        scent_notes: [...prev.scent_notes, newScentNote.trim()],
      }));
      setNewScentNote('');
    }
  };

  const handleRemoveScentNote = (index) => {
    if (isViewMode) return;
    setFormData(prev => ({
      ...prev,
      scent_notes: prev.scent_notes.filter((_, i) => i !== index),
    }));
  };

  const handleVariantChange = (e) => {
    if (isViewMode) return;
    const { name, value } = e.target;
    setNewVariant(prev => ({ ...prev, [name]: value }));
  };

  const handleAddVariant = () => {
    if (isViewMode) return;
    if (newVariant.size && newVariant.price && newVariant.stock) {
      setFormData(prev => ({
        ...prev,
        variants: [...prev.variants, { ...newVariant, id: Date.now() }],
      }));
      setNewVariant({ size: '', price: '', stock: '' });
    }
  };

  const handleRemoveVariant = (id) => {
    if (isViewMode) return;
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.filter(variant => variant.id !== id),
    }));
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
          const MAX_WIDTH = 1200;
          const MAX_HEIGHT = 1200;
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

  const handleImageUpload = async (e) => {
    if (isViewMode) return;
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const compressPromises = files.map(file => compressImage(file));
      const compressedFiles = await Promise.all(compressPromises);
      setImageFiles(prev => [...prev, ...compressedFiles]);

      if (isEditMode) {
        const formData = new FormData();
        compressedFiles.forEach(file => formData.append('images', file));
        const response = await ProductService.uploadProductImages(id, formData, (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        });
        setFormData(prev => ({
          ...prev,
          images: response.product.images.map(img => ({
            url: img.url,
            _id: img._id,
            isMain: img.isMain || false,
          })),
        }));
        addToast('Images uploaded successfully', 'success');
        ProductService.clearCache();
        DashboardService.clearCache();
        setNeedsRefresh(true);
      } else {
        const newImageUrls = compressedFiles.map(file => ({
          url: URL.createObjectURL(file),
          _id: null,
          isMain: formData.images.length === 0,
        }));
        setFormData(prev => ({
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
    setFormData(prev => ({ ...prev, images: newImages }));
    setImageFiles(prev => prev.filter((_, i) => i !== index));

    if (isEditMode && imageId) {
      try {
        await ProductService.deleteProductImage(id, imageId);
        addToast('Image removed successfully', 'success');
        ProductService.clearCache();
        DashboardService.clearCache();
        setNeedsRefresh(true);
      } catch (err) {
        addToast(`Failed to remove image: ${err.message}`, 'error');
      }
    }
  };

  const handleSetMainImage = async (imageId) => {
    if (isViewMode || !imageId) return;
    try {
      const response = await ProductService.setMainProductImage(id, imageId);
      const updatedImages = formData.images.map(img => ({
        ...img,
        isMain: img._id === imageId,
      }));
      setFormData(prev => ({ ...prev, images: updatedImages }));
      addToast('Main image updated successfully', 'success');
      ProductService.clearCache();
      DashboardService.clearCache();
      setNeedsRefresh(true);
    } catch (err) {
      addToast(`Failed to set main image: ${err.message}`, 'error');
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = 'Product name is required';
    if (!formData.sku) newErrors.sku = 'SKU is required';
    if (!formData.price) newErrors.price = 'Price is required';
    else if (isNaN(parseFloat(formData.price)) || parseFloat(formData.price) < 0) {
      newErrors.price = 'Price must be a valid positive number';
    }
    if (!formData.stock) newErrors.stock = 'Stock quantity is required';
    else if (isNaN(parseInt(formData.stock)) || parseInt(formData.stock) < 0) {
      newErrors.stock = 'Stock must be a valid positive number';
    }
    if (!formData.categoryId) newErrors.category = 'Category is required';
    if (formData.variants.length > 0) {
      const variantNames = new Set();
      const variantErrors = [];
      formData.variants.forEach((variant, index) => {
        if (variantNames.has(variant.size)) {
          variantErrors.push(`Duplicate variant name: ${variant.size}`);
        }
        variantNames.add(variant.size);
        if (isNaN(parseFloat(variant.price)) || parseFloat(variant.price) < 0) {
          variantErrors.push(`Variant #${index + 1}: Price must be a valid positive number`);
        }
        if (isNaN(parseInt(variant.stock)) || parseInt(variant.stock) < 0) {
          variantErrors.push(`Variant #${index + 1}: Stock must be a valid positive number`);
        }
      });
      if (variantErrors.length > 0) {
        newErrors.variants = variantErrors;
      }
    }
    if (formData.images.length === 0 && imageFiles.length === 0) {
      newErrors.images = 'At least one product image is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isViewMode) return;
    if (validateForm()) {
      try {
        const payload = {
          name: formData.name,
          sku: formData.sku,
          price: parseFloat(formData.price),
          stockQuantity: parseInt(formData.stock),
          status: formData.status,
          category: formData.categoryId,
          description: formData.description,
          scentNotes: {
            top: formData.scent_notes.slice(0, Math.ceil(formData.scent_notes.length / 3)),
            middle: formData.scent_notes.slice(Math.ceil(formData.scent_notes.length / 3), Math.ceil(formData.scent_notes.length * 2 / 3)),
            base: formData.scent_notes.slice(Math.ceil(formData.scent_notes.length * 2 / 3)),
          },
          ingredients: formData.ingredients.split(',').map(item => item.trim()).filter(Boolean),
          variants: formData.variants.map(variant => ({
            size: variant.size,
            priceAdjustment: parseFloat(variant.price) - parseFloat(formData.price),
            stockQuantity: parseInt(variant.stock),
          })),
        };

        let response;
        if (isEditMode) {
          response = await ProductService.updateProduct(id, payload);
          addToast('Product updated successfully', 'success');
        } else {
          response = await ProductService.createProduct(payload);
          if (imageFiles.length > 0) {
            const formData = new FormData();
            imageFiles.forEach(file => formData.append('images', file));
            await ProductService.uploadProductImages(response.data.product._id, formData);
          }
          addToast('Product created successfully', 'success');
        }
        ProductService.clearCache();
        DashboardService.clearCache();
        setNeedsRefresh(true);
        navigate('/admin/products');
      } catch (err) {
        addToast(err.toString(), 'error');
      }
    }
  };

  const handleDelete = async () => {
    if (isViewMode) return;
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await ProductService.deleteProduct(id);
        addToast('Product deleted successfully', 'success');
        ProductService.clearCache();
        DashboardService.clearCache();
        setNeedsRefresh(true);
        navigate('/admin/products');
      } catch (err) {
        addToast(err.message, 'error');
      }
    }
  };

  return (
    <>
      <Helmet>
        <title>
          {isViewMode ? 'View Product' : isEditMode ? 'Edit Product' : 'Add New Product'} | Scenture Lagos Admin
        </title>
      </Helmet>
      <div className="space-y-6 max-w-7xl mx-auto px-0 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="flex items-center">
            <Link to="/admin/products" className="mr-4">
              <Button variant="ghost" size="icon">
                <ArrowLeft size={20} />
              </Button>
            </Link>
            <div>
              <h1 className="dashboardHeading">
                {isViewMode ? 'View Product' : isEditMode ? 'Edit Product' : 'Add New Product'}
              </h1>
              <p className="dashboardSubHeading">
                {isViewMode ? 'View product details' : isEditMode ? 'Update product information' : 'Create a new product'}
              </p>
            </div>
          </div>
          {(isEditMode || isViewMode) && (
            <div className="mt-4 md:mt-0 flex gap-2">
              {isViewMode && (
                <Link to={`/admin/products/${id}/edit`}>
                  <Button variant="outline" className="text-slate-900 hover:bg-slate-100">
                    <Edit size={16} className="mr-2" />
                    Edit Product
                  </Button>
                </Link>
              )}
              {isEditMode && (
                <Button variant="outline" className="text-red-600 hover:bg-red-50" onClick={handleDelete}>
                  <Trash2 size={16} className="mr-2" />
                  Delete Product
                </Button>
              )}
            </div>
          )}
        </div>

        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-2 border-slate-300 border-t-slate-900 mx-auto"></div>
              <p className="text-slate-600 font-light">Loading product data...</p>
            </div>
          </div>
        )}

        {!loading && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                  <CardDescription>Core details of the product</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-slate-900 mb-1">
                      Product Name*
                    </label>
                    {isViewMode ? (
                      <p className="text-slate-900">{formData.name || 'N/A'}</p>
                    ) : (
                      <>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          className={`w-full px-4 py-2 border ${errors.name ? 'border-red-300' : 'border-slate-200'} rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900/10`}
                          placeholder="Enter product name"
                          disabled={isViewMode}
                        />
                        {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                      </>
                    )}
                  </div>

                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-slate-900 mb-1">
                      Description
                    </label>
                    {isViewMode ? (
                      <p className="text-slate-900">{formData.description || 'N/A'}</p>
                    ) : (
                      <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows={5}
                        className="w-full px-4 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                        placeholder="Enter product description"
                        disabled={isViewMode}
                      />
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="sku" className="block text-sm font-medium text-slate-900 mb-1">
                        SKU*
                      </label>
                      {isViewMode ? (
                        <p className="text-slate-900">{formData.sku || 'N/A'}</p>
                      ) : (
                        <div className="flex flex-col gap-3">
                          <input
                            type="text"
                            id="sku"
                            name="sku"
                            value={formData.sku}
                            onChange={handleChange}
                            className={`flex-1 mb-2 px-4 py-2 border ${errors.sku ? 'border-red-300' : 'border-slate-200'} rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900/10`}
                            placeholder="Enter SKU or generate"
                            disabled={isEditMode}
                          />
                          {isCreateMode && (
                            <Button
                              type="button"
                              onClick={async () => {
                                setIsGenerating(true);
                                try {
                                  if (!formData.categoryId) {
                                    addToast('Select a category first', 'error');
                                    return;
                                  }
                                  const response = await ProductService.generateSKU(formData.categoryId);
                                  const sku = response.sku;
                                  if (!sku) {
                                    throw new Error('No SKU returned from server');
                                  }
                                  setFormData(prev => ({ ...prev, sku }));
                                } catch (err) {
                                  addToast(err.message || 'Failed to generate SKU', 'error');
                                } finally {
                                  setIsGenerating(false);
                                }
                              }}
                              className="px-4 py-2 bg-slate-900 text-white hover:bg-slate-800"
                              disabled={isGenerating}
                            >
                              {isGenerating ? (
                                <>
                                  <svg
                                    className="animate-spin h-5 w-5 mr-2 text-white"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                  >
                                    <circle
                                      className="opacity-25"
                                      cx="12"
                                      cy="12"
                                      r="10"
                                      stroke="currentColor"
                                      strokeWidth="4"
                                    ></circle>
                                    <path
                                      className="opacity-75"
                                      fill="currentColor"
                                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    ></path>
                                  </svg>
                                  Generating...
                                </>
                              ) : (
                                'Generate SKU'
                              )}
                            </Button>
                          )}
                        </div>
                      )}
                      {errors.sku && <p className="mt-1 text-sm text-red-600">{errors.sku}</p>}
                    </div>
                    <div>
                      <label htmlFor="categoryId" className="block text-sm font-medium text-slate-900 mb-1">
                        Category*
                      </label>
                      {isViewMode ? (
                        <p className="text-slate-900">{formData.category || 'N/A'}</p>
                      ) : (
                        <>
                          <select
                            id="categoryId"
                            name="categoryId"
                            value={formData.categoryId}
                            onChange={(e) =>
                              setFormData(prev => ({
                                ...prev,
                                categoryId: e.target.value,
                                category: categories.find(cat => cat.id === e.target.value)?.name || '',
                              }))
                            }
                            className={`w-full px-4 py-2 border ${errors.category ? 'border-red-300' : 'border-slate-200'} rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900/10`}
                            disabled={isViewMode}
                          >
                            <option value="">Select a category</option>
                            {categories.map(category => (
                              <option key={category.id} value={category.id}>{category.name}</option>
                            ))}
                          </select>
                          {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category}</p>}
                        </>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label htmlFor="price" className="block text-sm font-medium text-slate-900 mb-1">
                        Base Price (₦)*
                      </label>
                      {isViewMode ? (
                        <p className="text-slate-900">{formatPrice(formData.price) || 'N/A'}</p>
                      ) : (
                        <>
                          <input
                            type="number"
                            id="price"
                            name="price"
                            value={formData.price}
                            onChange={handleChange}
                            className={`w-full px-4 py-2 border ${errors.price ? 'border-red-300' : 'border-slate-200'} rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900/10`}
                            placeholder="0.00"
                            min="0"
                            step="100"
                            disabled={isViewMode}
                          />
                          {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price}</p>}
                        </>
                      )}
                    </div>

                    <div>
                      <label htmlFor="stock" className="block text-sm font-medium text-slate-900 mb-1">
                        Stock Quantity*
                      </label>
                      {isViewMode ? (
                        <p className="text-slate-900">{formData.stock || 'N/A'}</p>
                      ) : (
                        <>
                          <input
                            type="number"
                            id="stock"
                            name="stock"
                            value={formData.stock}
                            onChange={handleChange}
                            className={`w-full px-4 py-2 border ${errors.stock ? 'border-red-300' : 'border-slate-200'} rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900/10`}
                            placeholder="0"
                            min="0"
                            disabled={isViewMode}
                          />
                          {errors.stock && <p className="mt-1 text-sm text-red-600">{errors.stock}</p>}
                        </>
                      )}
                    </div>

                    <div>
                      <label htmlFor="status" className="block text-sm font-medium text-slate-900 mb-1">
                        Status
                      </label>
                      {isViewMode ? (
                        <p className="text-slate-900">{formData.status || 'N/A'}</p>
                      ) : (
                        <select
                          id="status"
                          name="status"
                          value={formData.status}
                          onChange={handleChange}
                          className="w-full px-4 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                          disabled={isViewMode}
                        >
                          <option value="published">Published</option>
                          <option value="draft">Draft</option>
                          <option value="archived">Archived</option>
                        </select>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Scent Notes</CardTitle>
                  <CardDescription>Fragrance notes for the product</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-2 mb-4">
                    {formData.scent_notes.length > 0 ? (
                      formData.scent_notes.map((note, index) => (
                        <div key={index} className="flex items-center bg-slate-100 px-3 py-1 rounded-full">
                          <span className="text-sm">{note}</span>
                          {!isViewMode && (
                            <button
                              type="button"
                              onClick={() => handleRemoveScentNote(index)}
                              className="ml-2 text-slate-600 hover:text-slate-900"
                            >
                              <X size={14} />
                            </button>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="text-slate-500">No scent notes added</p>
                    )}
                  </div>

                  {!isViewMode && (
                    <div className="flex">
                      <input
                        type="text"
                        value={newScentNote}
                        onChange={(e) => setNewScentNote(e.target.value)}
                        className="flex-1 px-4 py-2 border border-slate-200 rounded-l-md focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                        placeholder="Add a scent note (e.g., Lavender)"
                      />
                      <button
                        type="button"
                        onClick={handleAddScentNote}
                        className="px-4 py-2 bg-slate-900 text-white rounded-r-md hover:bg-slate-800"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Ingredients</CardTitle>
                  <CardDescription>Ingredients used in the product</CardDescription>
                </CardHeader>
                <CardContent>
                  {isViewMode ? (
                    <p className="text-slate-900">{formData.ingredients || 'N/A'}</p>
                  ) : (
                    <textarea
                      id="ingredients"
                      name="ingredients"
                      value={formData.ingredients}
                      onChange={handleChange}
                      rows={4}
                      className="w-full px-4 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                      placeholder="Enter product ingredients, separated by commas"
                      disabled={isViewMode}
                    />
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Product Variants</CardTitle>
                  <CardDescription>Size or scent variants with specific pricing</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {errors.variants && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-3 rounded-md mb-4">
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
                    </div>
                  )}
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-200">
                          <th className="text-left font-medium p-3 pl-0">Size/Variant</th>
                          <th className="text-left font-medium p-3">Price (₦)</th>
                          <th className="text-left font-medium p-3">Stock</th>
                          <th className="text-right font-medium p-3 pr-0">{!isViewMode && 'Actions'}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {formData.variants.length > 0 ? (
                          formData.variants.map((variant) => (
                            <tr key={variant.id} className="border-b border-slate-100">
                              <td className="p-3 pl-0">{variant.size}</td>
                              <td className="p-3">{formatPrice(variant.price)}</td>
                              <td className="p-3">{variant.stock}</td>
                              {!isViewMode && (
                                <td className="p-3 pr-0 text-right">
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveVariant(variant.id)}
                                    className="p-1 text-slate-500 hover:text-red-600"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </td>
                              )}
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={isViewMode ? 3 : 4} className="p-3 text-center text-slate-500">
                              No variants added yet
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {!isViewMode && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div>
                        <input
                          type="text"
                          name="size"
                          value={newVariant.size}
                          onChange={handleVariantChange}
                          className="w-full px-4 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                          placeholder="Size/Variant (e.g., 8oz)"
                        />
                      </div>
                      <div>
                        <input
                          type="number"
                          name="price"
                          value={newVariant.price}
                          onChange={handleVariantChange}
                          className="w-full px-4 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                          placeholder="Price"
                          min="0"
                          step="100"
                        />
                      </div>
                      <div className="flex">
                        <input
                          type="number"
                          name="stock"
                          value={newVariant.stock}
                          onChange={handleVariantChange}
                          className="flex-1 px-4 py-2 border border-slate-200 rounded-l-md focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                          placeholder="Stock"
                          min="0"
                        />
                        <button
                          type="button"
                          onClick={handleAddVariant}
                          className="px-4 py-2 bg-slate-900 text-white rounded-r-md hover:bg-slate-800"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Product Images</CardTitle>
                  <CardDescription>High-quality product images</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {errors.images && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">
                      <p>{errors.images}</p>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-4">
                    {formData.images.map((image, index) => (
                      <div key={index} className="relative group">
                        <div className={`aspect-square bg-slate-100 rounded-md overflow-hidden ${image.isMain ? 'ring-2 ring-blue-500' : ''}`}>
                          <img src={image.url} alt={`Product ${index + 1}`} className="w-full h-full object-cover" />
                          {image.isMain && (
                            <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-md">
                              Main Image
                            </div>
                          )}
                        </div>
                        {!isViewMode && (
                          <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100">
                            {!image.isMain && (
                              <button
                                type="button"
                                onClick={() => handleSetMainImage(image._id)}
                                className="p-1 bg-blue-500 text-white rounded-full shadow-md hover:bg-blue-600"
                                title="Set as main image"
                              >
                                <Eye size={14} />
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(index)}
                              className="p-1 bg-white rounded-full shadow-md hover:bg-red-50"
                              title="Remove image"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                    {!isViewMode && formData.images.length < 4 && (
                      <label className="aspect-square bg-slate-50 border-2 border-dashed border-slate-200 rounded-md flex flex-col items-center justify-center cursor-pointer hover:bg-slate-100 relative">
                        {isUploading ? (
                          <div className="flex flex-col items-center justify-center w-full h-full">
                            <div className="w-16 h-16 mb-2 relative">
                              <svg className="w-full h-full" viewBox="0 0 36 36">
                                <circle cx="18" cy="18" r="16" fill="none" className="stroke-slate-200" strokeWidth="2"></circle>
                                <circle
                                  cx="18"
                                  cy="18"
                                  r="16"
                                  fill="none"
                                  className="stroke-blue-500"
                                  strokeWidth="2"
                                  strokeDasharray="100"
                                  strokeDashoffset={100 - uploadProgress}
                                  transform="rotate(-90 18 18)"
                                ></circle>
                              </svg>
                              <div className="absolute inset-0 flex items-center justify-center text-sm font-medium text-blue-500">
                                {uploadProgress}%
                              </div>
                            </div>
                            <span className="text-sm text-slate-500">Uploading...</span>
                          </div>
                        ) : (
                          <>
                            <Upload size={24} className="text-slate-400 mb-2" />
                            <span className="text-sm text-slate-500">Upload Image</span>
                            <span className="text-xs text-slate-400 text-center mt-1">Images will be compressed</span>
                          </>
                        )}
                        <input
                          type="file"
                          accept="image/*"
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
                      <ImageIcon size={48} className="mx-auto text-slate-300 mb-2" />
                      <p className="text-slate-500">No images uploaded yet</p>
                      <p className="text-sm text-slate-400 mt-1">Upload high-quality product images</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {!isViewMode && (
                <Card>
                  <CardContent className="p-6">
                    <Button
                      type="submit"
                      onClick={handleSubmit}
                      className="w-full flex items-center justify-center bg-slate-900 text-white hover:bg-slate-800"
                    >
                      <Save size={16} className="mr-2" />
                      {isEditMode ? 'Update Product' : 'Create Product'}
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ProductFormPage;