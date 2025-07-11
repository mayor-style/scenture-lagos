// File: ProductService.js
import api from '../api';

// Sample fallback data for development
const FALLBACK_PRODUCTS = [
  {
    id: '1',
    name: 'Lavender Dreams Candle',
    sku: 'CAN-001',
    price: 12500,
    stock: 45,
    categoryName: 'Candles',
    status: 'published',
    images: ['/images/product1.jpg'],
    variants: [
      { id: 1, size: '8oz', price: 12500, stock: 25 },
      { id: 2, size: '12oz', price: 18500, stock: 20 }
    ]
  },
  {
    id: '2',
    name: 'Ocean Breeze Diffuser',
    sku: 'DIF-001',
    price: 15000,
    stock: 10,
    categoryName: 'Diffusers',
    status: 'published',
    images: ['/images/product2.jpg'],
    variants: []
  }
];

const FALLBACK_CATEGORIES = [
  { id: '1', name: 'Candles' },
  { id: '2', name: 'Room Sprays' },
  { id: '3', name: 'Diffusers' },
  { id: '4', name: 'Gift Sets' }
];

const ProductService = {
  getAllProducts: async (params = {}) => {
    try {
      const response = await api.get('/admin/products', { params });
      const { data, total } = response.data;
      return {
        data: data || [],
        total: total || 0
      };
    } catch (error) {
      console.error(`Error fetching products: ${error.response?.data?.message || error.message}`);
      throw new Error(error.response?.data?.message || 'Failed to fetch products');
    }
  },

  getProduct: async (id) => {
    try {
      const response = await api.get(`/admin/products/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching product: ${error.response?.data?.message || error.message}`);
      throw new Error(error.response?.data?.message || 'Failed to fetch product');
    }
  },

  getAllCategories: async (params = {}) => {
    try {
      // Check if tree view is requested
      if (params.tree === true) {
        return ProductService.getCategoryTree();
      }
      
      // Only use cache if no query parameters are provided
      if (Object.keys(params).length === 0) {
        const cached = localStorage.getItem('categories');
        if (cached) {
          const { data, timestamp } = JSON.parse(cached);
          if (Date.now() - timestamp < 3600000) { // 1 hour TTL
            return { data };
          }
        }
      }
      
      const response = await api.get('/admin/categories', { params });
      const { data, total } = response.data;
      
      // Only cache the full category list without filters
      if (Object.keys(params).length === 0) {
        localStorage.setItem('categories', JSON.stringify({ data, timestamp: Date.now() }));
      }
      
      return { 
        data: data || [],
        total: total || 0
      };
    } catch (error) {
      console.error(`Error fetching categories: ${error.response?.data?.message || error.message}`);
      throw new Error(error.response?.data?.message || 'Failed to fetch categories');
    }
  },
  
getCategoryTree: async () => {
  try {
    // Check cache first
    const cached = localStorage.getItem('categoryTree');
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < 3600000) { // 1 hour TTL
        return { data };
      }
    }

    const response = await api.get('/admin/categories', { params: { tree: true } });
    const categories = response.data.data?.categories || []; // Extract categories correctly

    // Cache the category tree
    localStorage.setItem('categoryTree', JSON.stringify({ data: categories, timestamp: Date.now() }));

    return { data: categories };
  } catch (error) {
    console.error(`Error fetching category tree: ${error.response?.data?.message || error.message}`);
    throw new Error(error.response?.data?.message || 'Failed to fetch category tree');
  }
},
  
  getCategory: async (id) => {
    try {
      const response = await api.get(`/admin/categories/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching category: ${error.response?.data?.message || error.message}`);
      throw new Error(error.response?.data?.message || 'Failed to fetch category');
    }
  },

  createProduct: async (productData) => {
    try {
      const response = await api.post('/admin/products', productData);
      return response.data;
    } catch (error) {
      console.error(`Error creating product: ${error.response?.data?.error || error.message}`);
      throw new Error(error.response?.data?.error || 'Failed to create product');
    }
  },

    updateProduct: async (id, productData) => {
    try {
      const response = await api.put(`/admin/products/${id}`, productData);
      return response.data;
    } catch (error) {
      console.error(`Error updating product: ${error.response?.data?.message || error.message}`);
      throw new Error(error.response?.data?.message || 'Failed to update product');
    }
  },

   deleteProduct: async (id) => {
    try {
      const response = await api.delete(`/admin/products/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting product: ${error.response?.data?.message || error.message}`);
      throw new Error(error.response?.data?.message || 'Failed to delete product');
    }
  },

   uploadProductImages: async (productId, formData, onUploadProgress) => {
    try {
      const response = await api.post(`/admin/products/${productId}/images`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: onUploadProgress ? (progressEvent) => {
          onUploadProgress(progressEvent);
        } : undefined
      });
      return response.data;
    } catch (error) {
      console.error(`Error uploading product images: ${error.response?.data?.error || error.message}`);
      throw new Error(error.response?.data?.error || 'Failed to upload images');
    }
  },

  deleteProductImage: async (productId, imageId) => {
    try {
      const response = await api.delete(`/admin/products/${productId}/images/${imageId}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting product image: ${error.response?.data?.message || error.message}`);
      throw new Error(error.response?.data?.message || 'Failed to delete image');
    }
  },

  setMainProductImage: async (productId, imageId) => {
    try {
      const response = await api.put(`/admin/products/${productId}/images/${imageId}/main`);
      return response.data;
    } catch (error) {
      console.error(`Error setting main product image: ${error.response?.data?.message || error.message}`);
      throw new Error(error.response?.data?.message || 'Failed to set main image');
    }
  },

  createCategory: async (categoryData) => {
    try {
      const response = await api.post('/admin/categories', categoryData);
      return response.data;
    } catch (error) {
      console.error(`Error creating category: ${error.response?.status || error.message}`);
      throw error;
    }
  },

  updateCategory: async (id, categoryData) => {
    try {
      const response = await api.put(`/admin/categories/${id}`, categoryData);
      return response.data;
    } catch (error) {
      console.error(`Error updating category: ${error.response?.status || error.message}`);
      throw error;
    }
  },

  deleteCategory: async (id) => {
    try {
      const response = await api.delete(`/admin/categories/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting category: ${error.response?.status || error.message}`);
      throw error;
    }
  },

    generateSKU: async (categoryId) => {
      console.log('GENETAING SKUUUU')
    try {
      const response = await api.get('/admin/products/sku', { params: { categoryId } });
      return response.data;
    } catch (error) {
      console.error(`Error generating SKU: ${error.response?.data?.error || error.message}`);
      throw new Error(error.response?.data?.error || 'Failed to generate SKU');
    }
  }
};

export default ProductService;