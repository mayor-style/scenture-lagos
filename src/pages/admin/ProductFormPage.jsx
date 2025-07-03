import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { 
  ArrowLeft, 
  Save, 
  Trash2, 
  Plus, 
  X,
  Upload,
  Image
} from 'lucide-react';

// Sample product data for edit mode
const sampleProduct = {
  id: 1,
  name: 'Lavender Dreams Candle',
  sku: 'CAN-001',
  price: 12500,
  stock: 45,
  status: 'Active',
  category: 'Candles',
  description: 'A soothing lavender scented candle that creates a calming atmosphere in any room. Made with 100% natural soy wax and essential oils.',
  scent_notes: ['Lavender', 'Vanilla', 'Bergamot'],
  ingredients: 'Soy wax, Lavender essential oil, Vanilla extract, Natural cotton wick',
  variants: [
    { id: 1, size: '8oz', price: 12500, stock: 25 },
    { id: 2, size: '12oz', price: 18500, stock: 20 },
  ],
  images: [
    '/images/product1.jpg',
    '/images/product1-alt.jpg',
  ]
};

const categories = [
  { id: 1, name: 'Candles' },
  { id: 2, name: 'Room Sprays' },
  { id: 3, name: 'Diffusers' },
  { id: 4, name: 'Gift Sets' },
];

const ProductFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);
  
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    price: '',
    stock: '',
    status: 'Active',
    category: '',
    description: '',
    scent_notes: [],
    ingredients: '',
    variants: [],
    images: []
  });
  
  const [newScentNote, setNewScentNote] = useState('');
  const [newVariant, setNewVariant] = useState({ size: '', price: '', stock: '' });
  const [imageFiles, setImageFiles] = useState([]);
  const [errors, setErrors] = useState({});

  // Load product data if in edit mode
  useEffect(() => {
    if (isEditMode) {
      // In a real app, you would fetch the product data from an API
      // For now, we'll use the sample data
      setFormData(sampleProduct);
    }
  }, [isEditMode, id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddScentNote = () => {
    if (newScentNote.trim()) {
      setFormData(prev => ({
        ...prev,
        scent_notes: [...prev.scent_notes, newScentNote.trim()]
      }));
      setNewScentNote('');
    }
  };

  const handleRemoveScentNote = (index) => {
    setFormData(prev => ({
      ...prev,
      scent_notes: prev.scent_notes.filter((_, i) => i !== index)
    }));
  };

  const handleVariantChange = (e) => {
    const { name, value } = e.target;
    setNewVariant(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddVariant = () => {
    if (newVariant.size && newVariant.price && newVariant.stock) {
      setFormData(prev => ({
        ...prev,
        variants: [...prev.variants, { ...newVariant, id: Date.now() }]
      }));
      setNewVariant({ size: '', price: '', stock: '' });
    }
  };

  const handleRemoveVariant = (id) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.filter(variant => variant.id !== id)
    }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    setImageFiles(prev => [...prev, ...files]);
    
    // In a real app, you would upload these files to a server
    // For now, we'll just create URLs for preview
    const newImageUrls = files.map(file => URL.createObjectURL(file));
    
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...newImageUrls]
    }));
  };

  const handleRemoveImage = (index) => {
    const newImages = [...formData.images];
    newImages.splice(index, 1);
    
    const newImageFiles = [...imageFiles];
    if (index < newImageFiles.length) {
      newImageFiles.splice(index, 1);
    }
    
    setFormData(prev => ({ ...prev, images: newImages }));
    setImageFiles(newImageFiles);
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name) newErrors.name = 'Product name is required';
    if (!formData.sku) newErrors.sku = 'SKU is required';
    if (!formData.price) newErrors.price = 'Price is required';
    if (!formData.stock) newErrors.stock = 'Stock quantity is required';
    if (!formData.category) newErrors.category = 'Category is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      // In a real app, you would submit the form data to an API
      console.log('Form submitted:', formData);
      
      // Redirect back to products page
      navigate('/admin/products');
    }
  };

  const handleDelete = () => {
    // In a real app, you would delete the product via an API
    if (window.confirm('Are you sure you want to delete this product?')) {
      console.log('Product deleted:', id);
      navigate('/admin/products');
    }
  };

  return (
    <>
      <Helmet>
        <title>{isEditMode ? 'Edit Product' : 'Add New Product'} | Scenture Lagos Admin</title>
      </Helmet>
      
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="flex items-center">
            <Link to="/admin/products" className="mr-4">
              <Button variant="ghost" size="icon">
                <ArrowLeft size={20} />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-heading font-medium text-secondary">
                {isEditMode ? 'Edit Product' : 'Add New Product'}
              </h1>
              <p className="text-secondary/70 mt-1">
                {isEditMode ? 'Update product information' : 'Create a new product'}
              </p>
            </div>
          </div>
          {isEditMode && (
            <div className="mt-4 md:mt-0">
              <Button variant="outline" className="flex items-center text-red-600 hover:bg-red-50 hover:border-red-200" onClick={handleDelete}>
                <Trash2 size={16} className="mr-2" />
                Delete Product
              </Button>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                  <CardDescription>Enter the core details of your product</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-secondary mb-1">
                      Product Name*
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 border ${errors.name ? 'border-red-300 focus:ring-red-500' : 'border-slate-200 focus:ring-primary/50'} rounded-md focus:outline-none focus:ring-2`}
                      placeholder="Enter product name"
                    />
                    {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                  </div>
                  
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-secondary mb-1">
                      Description
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows={5}
                      className="w-full px-4 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                      placeholder="Enter product description"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="sku" className="block text-sm font-medium text-secondary mb-1">
                        SKU*
                      </label>
                      <input
                        type="text"
                        id="sku"
                        name="sku"
                        value={formData.sku}
                        onChange={handleChange}
                        className={`w-full px-4 py-2 border ${errors.sku ? 'border-red-300 focus:ring-red-500' : 'border-slate-200 focus:ring-primary/50'} rounded-md focus:outline-none focus:ring-2`}
                        placeholder="Enter SKU"
                      />
                      {errors.sku && <p className="mt-1 text-sm text-red-600">{errors.sku}</p>}
                    </div>
                    
                    <div>
                      <label htmlFor="category" className="block text-sm font-medium text-secondary mb-1">
                        Category*
                      </label>
                      <select
                        id="category"
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        className={`w-full px-4 py-2 border ${errors.category ? 'border-red-300 focus:ring-red-500' : 'border-slate-200 focus:ring-primary/50'} rounded-md focus:outline-none focus:ring-2 bg-white`}
                      >
                        <option value="">Select a category</option>
                        {categories.map(category => (
                          <option key={category.id} value={category.name}>{category.name}</option>
                        ))}
                      </select>
                      {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category}</p>}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label htmlFor="price" className="block text-sm font-medium text-secondary mb-1">
                        Base Price (₦)*
                      </label>
                      <input
                        type="number"
                        id="price"
                        name="price"
                        value={formData.price}
                        onChange={handleChange}
                        className={`w-full px-4 py-2 border ${errors.price ? 'border-red-300 focus:ring-red-500' : 'border-slate-200 focus:ring-primary/50'} rounded-md focus:outline-none focus:ring-2`}
                        placeholder="0.00"
                        min="0"
                        step="100"
                      />
                      {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price}</p>}
                    </div>
                    
                    <div>
                      <label htmlFor="stock" className="block text-sm font-medium text-secondary mb-1">
                        Stock Quantity*
                      </label>
                      <input
                        type="number"
                        id="stock"
                        name="stock"
                        value={formData.stock}
                        onChange={handleChange}
                        className={`w-full px-4 py-2 border ${errors.stock ? 'border-red-300 focus:ring-red-500' : 'border-slate-200 focus:ring-primary/50'} rounded-md focus:outline-none focus:ring-2`}
                        placeholder="0"
                        min="0"
                      />
                      {errors.stock && <p className="mt-1 text-sm text-red-600">{errors.stock}</p>}
                    </div>
                    
                    <div>
                      <label htmlFor="status" className="block text-sm font-medium text-secondary mb-1">
                        Status
                      </label>
                      <select
                        id="status"
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 bg-white"
                      >
                        <option value="Active">Active</option>
                        <option value="Draft">Draft</option>
                        <option value="Out of Stock">Out of Stock</option>
                      </select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Scent Notes */}
              <Card>
                <CardHeader>
                  <CardTitle>Scent Notes</CardTitle>
                  <CardDescription>Add the fragrance notes for this product</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-2 mb-4">
                    {formData.scent_notes.map((note, index) => (
                      <div key={index} className="flex items-center bg-primary/10 px-3 py-1 rounded-full">
                        <span className="text-sm">{note}</span>
                        <button 
                          type="button" 
                          onClick={() => handleRemoveScentNote(index)}
                          className="ml-2 text-secondary/70 hover:text-secondary"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex">
                    <input
                      type="text"
                      value={newScentNote}
                      onChange={(e) => setNewScentNote(e.target.value)}
                      className="flex-1 px-4 py-2 border border-slate-200 rounded-l-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                      placeholder="Add a scent note (e.g., Lavender)"
                    />
                    <button
                      type="button"
                      onClick={handleAddScentNote}
                      className="px-4 py-2 bg-primary text-secondary rounded-r-md hover:bg-primary-dark"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </CardContent>
              </Card>

              {/* Ingredients */}
              <Card>
                <CardHeader>
                  <CardTitle>Ingredients</CardTitle>
                  <CardDescription>List the ingredients used in this product</CardDescription>
                </CardHeader>
                <CardContent>
                  <textarea
                    id="ingredients"
                    name="ingredients"
                    value={formData.ingredients}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-4 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="Enter product ingredients"
                  />
                </CardContent>
              </Card>

              {/* Variants */}
              <Card>
                <CardHeader>
                  <CardTitle>Product Variants</CardTitle>
                  <CardDescription>Add size or scent variants with specific pricing</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-200">
                          <th className="text-left font-medium p-3 pl-0">Size/Variant</th>
                          <th className="text-left font-medium p-3">Price (₦)</th>
                          <th className="text-left font-medium p-3">Stock</th>
                          <th className="text-right font-medium p-3 pr-0">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {formData.variants.length > 0 ? (
                          formData.variants.map((variant) => (
                            <tr key={variant.id} className="border-b border-slate-100">
                              <td className="p-3 pl-0">{variant.size}</td>
                              <td className="p-3">{variant.price}</td>
                              <td className="p-3">{variant.stock}</td>
                              <td className="p-3 pr-0 text-right">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveVariant(variant.id)}
                                  className="p-1 text-slate-500 hover:text-red-600 rounded-md hover:bg-slate-100"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="4" className="p-3 text-center text-slate-500">
                              No variants added yet
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    <div>
                      <input
                        type="text"
                        name="size"
                        value={newVariant.size}
                        onChange={handleVariantChange}
                        className="w-full px-4 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                        placeholder="Size/Variant (e.g., 8oz)"
                      />
                    </div>
                    <div>
                      <input
                        type="number"
                        name="price"
                        value={newVariant.price}
                        onChange={handleVariantChange}
                        className="w-full px-4 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
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
                        className="flex-1 px-4 py-2 border border-slate-200 rounded-l-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                        placeholder="Stock"
                        min="0"
                      />
                      <button
                        type="button"
                        onClick={handleAddVariant}
                        className="px-4 py-2 bg-primary text-secondary rounded-r-md hover:bg-primary-dark"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              {/* Product Images */}
              <Card>
                <CardHeader>
                  <CardTitle>Product Images</CardTitle>
                  <CardDescription>Upload high-quality product images</CardDescription>
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
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(index)}
                          className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                    
                    {formData.images.length < 4 && (
                      <label className="aspect-square bg-slate-50 border-2 border-dashed border-slate-200 rounded-md flex flex-col items-center justify-center cursor-pointer hover:bg-slate-100 transition-colors">
                        <Upload size={24} className="text-slate-400 mb-2" />
                        <span className="text-sm text-slate-500">Upload Image</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
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

              {/* Save Button */}
              <Card>
                <CardContent className="p-6">
                  <Button type="submit" className="w-full flex items-center justify-center">
                    <Save size={16} className="mr-2" />
                    {isEditMode ? 'Update Product' : 'Create Product'}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </>
  );
};

export default ProductFormPage;