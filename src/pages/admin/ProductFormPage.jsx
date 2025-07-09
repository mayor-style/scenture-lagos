// File: ProductFormPage.jsx
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { ArrowLeft, Save, Trash2, Plus, X, Upload, Image, Eye } from 'lucide-react';
import ProductService from '../../services/admin/product.service';
import toast from 'react-hot-toast';
import { formatPrice } from '../../lib/utils';

const ProductFormPage = () => {
  const { id, action } = useParams(); // Added 'action' to handle view/edit
  const navigate = useNavigate();
  const isEditMode = Boolean(id && action === 'edit');
  const isViewMode = Boolean(id && action === 'view');
  const isCreateMode = !id && !action;

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
    images: []
  });

  const [categories, setCategories] = useState([]);
  const [newScentNote, setNewScentNote] = useState('');
  const [newVariant, setNewVariant] = useState({ size: '', price: '', stock: '' });
  const [imageFiles, setImageFiles] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(isEditMode || isViewMode);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch categories
        const categoriesResponse = await ProductService.getAllCategories();
        setCategories(categoriesResponse.data);

        // Fetch product data if in edit or view mode
        if (id) {
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
            images: product.images.map(img => img.url) || []
          });
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        toast.error('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, isEditMode, isViewMode]);

  const handleChange = (e) => {
    if (isViewMode) return; // Prevent changes in view mode
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddScentNote = () => {
    if (isViewMode) return;
    if (newScentNote.trim()) {
      setFormData(prev => ({
        ...prev,
        scent_notes: [...prev.scent_notes, newScentNote.trim()]
      }));
      setNewScentNote('');
    }
  };

  const handleRemoveScentNote = (index) => {
    if (isViewMode) return;
    setFormData(prev => ({
      ...prev,
      scent_notes: prev.scent_notes.filter((_, i) => i !== index)
    }));
  };

  const handleVariantChange = (e) => {
    if (isViewMode) return;
    const { name, value } = e.target;
    setNewVariant(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddVariant = () => {
    if (isViewMode) return;
    if (newVariant.size && newVariant.price && newVariant.stock) {
      setFormData(prev => ({
        ...prev,
        variants: [...prev.variants, { ...newVariant, id: Date.now() }]
      }));
      setNewVariant({ size: '', price: '', stock: '' });
    }
  };

  const handleRemoveVariant = (id) => {
    if (isViewMode) return;
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.filter(variant => variant.id !== id)
    }));
  };

  const handleImageUpload = async (e) => {
    if (isViewMode) return;
    const files = Array.from(e.target.files);
    setImageFiles(prev => [...prev, ...files]);

    try {
      const formData = new FormData();
      files.forEach(file => formData.append('images', file));

      if (isEditMode) {
        const response = await ProductService.uploadProductImages(id, formData);
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, ...response.product.images.map(img => img.url)]
        }));
      } else {
        const newImageUrls = files.map(file => URL.createObjectURL(file));
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, ...newImageUrls]
        }));
      }
    } catch (err) {
      console.error('Error uploading images:', err);
      toast.error('Failed to upload images');
    }
  };

  const handleRemoveImage = async (index) => {
    if (isViewMode) return;
    const newImages = [...formData.images];
    const imageId = formData.images[index]?._id;
    newImages.splice(index, 1);

    const newImageFiles = [...imageFiles];
    if (index < newImageFiles.length) {
      newImageFiles.splice(index, 1);
    }

    setFormData(prev => ({ ...prev, images: newImages }));
    setImageFiles(newImageFiles);

    if (isEditMode && imageId) {
      try {
        await ProductService.deleteProductImage(id, imageId);
        toast.success('Image removed successfully');
      } catch (err) {
        console.error('Error removing image:', err);
        toast.error('Failed to remove image');
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = 'Product name is required';
    if (!formData.sku) newErrors.sku = 'SKU is required';
    if (!formData.price) newErrors.price = 'Price is required';
    if (!formData.stock) newErrors.stock = 'Stock quantity is required';
    if (!formData.categoryId) newErrors.category = 'Category is required';
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
            base: formData.scent_notes.slice(Math.ceil(formData.scent_notes.length * 2 / 3))
          },
          ingredients: formData.ingredients.split(',').map(item => item.trim()).filter(Boolean),
          variants: formData.variants.map(variant => ({
            size: variant.size,
            priceAdjustment: parseFloat(variant.price) - parseFloat(formData.price),
            stockQuantity: parseInt(variant.stock),
            sku: `${formData.sku}-${variant.size}`
          }))
        };

        if (isEditMode) {
          await ProductService.updateProduct(id, payload);
          toast.success('Product updated successfully');
        } else {
          await ProductService.createProduct(payload);
          toast.success('Product created successfully');
        }
        navigate('/admin/products');
      } catch (err) {
        console.error('Error submitting product:', err);
        toast.error('Failed to save product');
      }
    }
  };

  const handleDelete = async () => {
    if (isViewMode) return;
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await ProductService.deleteProduct(id);
        toast.success('Product deleted successfully');
        navigate('/admin/products');
      } catch (err) {
        console.error('Error deleting product:', err);
        toast.error('Failed to delete product');
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

      <div className="space-y-6 max-w-7xl mx-auto px-3 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="flex items-center">
            <Link to="/admin/products" className="mr-4">
              <Button variant="ghost" size="icon">
                <ArrowLeft size={20} />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-medium text-slate-900">
                {isViewMode ? 'View Product' : isEditMode ? 'Edit Product' : 'Add New Product'}
              </h1>
              <p className="text-slate-600 mt-1">
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
                  <div className="flex-col gap-3">
                    <input
                      type="text"
                      id="sku"
                      name="sku"
                      value={formData.sku}
                      onChange={handleChange}
                      className={`flex-1 mb-2 px-4 py-2 border ${errors.sku ? 'border-red-300' : 'border-slate-200'} rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900/10`}
                      placeholder="Enter SKU or generate"
                      disabled={isEditMode} // Disable in edit mode to prevent SKU changes
                    />
                    {isCreateMode && (
                      <Button
                        type="button"
                        onClick={async () => {
                          setIsGenerating(true); // Set generating state
                          try {
                            const categoryId = formData.categoryId;
                            if (!categoryId) {
                              toast.error('Select a category first');
                              return;
                            }
                            const response = await ProductService.getAllCategories();
                            const category = response.data.find(cat => cat.id === categoryId);
                            const prefix = {
                              'Candles': 'CAN',
                              'Room Sprays': 'RSP',
                              'Diffusers': 'DIF',
                              'Gift Sets': 'GFT'
                            }[category?.name] || 'PRD';
                            const products = await ProductService.getAllProducts({ category: categoryId });
                            const lastNumber = products.data
                              .filter(p => p.sku.startsWith(`${prefix}-`))
                              .reduce((max, p) => {
                                const num = parseInt(p.sku.split('-')[1]) || 0;
                                return Math.max(max, num);
                              }, 0);
                            setFormData(prev => ({ ...prev, sku: `${prefix}-${String(lastNumber + 1).padStart(3, '0')}` }));
                          } catch (err) {
                            console.error('Error generating SKU:', err);
                            toast.error('Failed to generate SKU');
                          } finally {
                            setIsGenerating(false); // Revert generating state
                          }
                        }}
                        className="px-4 py-2 bg-slate-900 text-white hover:bg-slate-800"
                        disabled={isGenerating} // Disable button while generating
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
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              categoryId: e.target.value,
                              category: categories.find(cat => cat.id === e.target.value)?.name || ''
                            }))}
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
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
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
                  <div className="grid grid-cols-2 gap-4">
                    {formData.images.map((image, index) => (
                      <div key={index} className="relative group">
                        <div className="aspect-square bg-slate-100 rounded-md overflow-hidden">
                          <img
                            src={image}
                            alt={`Product ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        {!isViewMode && (
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(index)}
                            className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100"
                          >
                            <X size={14} />
                          </button>
                        )}
                      </div>
                    ))}

                    {!isViewMode && formData.images.length < 4 && (
                      <label className="aspect-square bg-slate-50 border-2 border-dashed border-slate-200 rounded-md flex flex-col items-center justify-center cursor-pointer hover:bg-slate-100">
                        <Upload size={24} className="text-slate-400 mb-2" />
                        <span className="text-sm text-slate-500">Upload Image</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                          multiple
                        />
                      </label>
                    )}
                  </div>

                  {formData.images.length === 0 && (
                    <div className="text-center py-8">
                      <Image size={48} className="mx-auto text-slate-300 mb-2" />
                      <p className="text-slate-500">No images uploaded yet</p>
                      <p className="text-sm text-slate-400 mt-1">Upload high-quality product images</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {!isViewMode && (
                <Card>
                  <CardContent className="p-6">
                    <Button type="submit" onClick={handleSubmit} className="w-full flex items-center justify-center bg-slate-900 text-white hover:bg-slate-800">
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