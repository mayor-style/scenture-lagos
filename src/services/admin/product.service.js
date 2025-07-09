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
      console.error(`Error fetching products: ${error.response?.status || error.message}`);
      if (process.env.NODE_ENV === 'development') {
        return {
          data: FALLBACK_PRODUCTS,
          total: FALLBACK_PRODUCTS.length
        };
      }
      throw error;
    }
  },

  getProduct: async (id) => {
    try {
      const response = await api.get(`/admin/products/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching product: ${error.response?.status || error.message}`);
      if (process.env.NODE_ENV === 'development') {
        return {
          product: {
            id: '1',
            name: 'Lavender Dreams Candle',
            sku: 'CAN-001',
            price: 12500,
            stock: 45,
            status: 'published',
            category: 'Candles',
            categoryId: '1',
            description: 'A soothing lavender scented candle.',
            scent_notes: ['Lavender', 'Vanilla', 'Bergamot'],
            ingredients: 'Soy wax, Lavender essential oil, Vanilla extract',
            variants: [
              { id: 1, size: '8oz', price: 12500, stock: 25 },
              { id: 2, size: '12oz', price: 18500, stock: 20 }
            ],
            images: ['/images/product1.jpg']
          }
        };
      }
      throw error;
    }
  },

  getAllCategories: async () => {
    try {
      const response = await api.get('/admin/categories');
      const { data } = response.data;
      return {
        data: data || []
      };
    } catch (error) {
      console.error(`Error fetching categories: ${error.response?.status || error.message}`);
      if (process.env.NODE_ENV === 'development') {
        return {
          data: FALLBACK_CATEGORIES
        };
      }
      throw error;
    }
  },

  createProduct: async (productData) => {
    try {
      const response = await api.post('/admin/products', productData);
      return response.data;
    } catch (error) {
      console.error(`Error creating product: ${error.response?.status || error.message}`);
      throw error;
    }
  },

  updateProduct: async (id, productData) => {
    try {
      const response = await api.put(`/admin/products/${id}`, productData);
      return response.data;
    } catch (error) {
      console.error(`Error updating product: ${error.response?.status || error.message}`);
      throw error;
    }
  },

  deleteProduct: async (id) => {
    try {
      const response = await api.delete(`/admin/products/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting product: ${error.response?.status || error.message}`);
      throw error;
    }
  },

  uploadProductImages: async (productId, formData) => {
    try {
      const response = await api.post(`/admin/products/${productId}/images`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    } catch (error) {
      console.error(`Error uploading product images: ${error.response?.status || error.message}`);
      throw error;
    }
  },

  deleteProductImage: async (productId, imageId) => {
    try {
      const response = await api.delete(`/admin/products/${productId}/images/${imageId}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting product image: ${error.response?.status || error.message}`);
      throw error;
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
    try {
      const response = await api.get('/admin/products/sku', { params: { categoryId } });
      return response.data;
    } catch (error) {
      console.error(`Error generating SKU: ${error.response?.status || error.message}`);
      if (process.env.NODE_ENV === 'development') {
        // Fallback SKU generation for development
        const category = FALLBACK_CATEGORIES.find(cat => cat.id === categoryId);
        const prefix = category ? category.name.slice(0, 3).toUpperCase() : 'PRO';
        return { sku: `${prefix}-001` };
      }
      throw error;
    }
  }
};

export default ProductService;