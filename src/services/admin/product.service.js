// src/services/admin/product.service.js
import api from '../api';

// No more manual caching here; @tanstack/react-query will handle it.

/**
 * Product service for admin product and category operations
 */
const ProductService = {
    /**
     * Get all products with pagination and filtering.
     * @param {Object} params - Query parameters for filtering and pagination
     * @returns {Promise<Object>} - { data: Array<Product>, total: number }
     */
    getAllProducts: async (params = {}) => {
        try {
            const response = await api.get('/admin/products', { params });
            // Backend now directly returns formatted items and total,
            // so we just pass it through.
            return {
                data: response.data?.data || [],
                total: response.data?.pagination?.total || 0,
            };
        } catch (error) {
            console.error(`Error fetching products: ${error.response?.data?.message || error.message}`);
            // Re-throw to be caught by useQuery's error handling
            throw new Error(error.response?.data?.message || 'Failed to fetch products');
        }
    },

/**
 * Get a single product by ID.
 * @param {string} id - Product ID
 * @returns {Promise<Object>} - Product data
 */
getProduct: async (id) => {
  try {
    const response = await api.get(`/admin/products/${id}`);
    console.log('Raw API Response:', response); // Debug: Log the full response
    // Handle various response structures
    const product = response.data?.data?.product || response.data?.product || response.data || {};
    
    // Normalize data structure
    const normalizedProduct = {
      id: product.id || product._id || '',
      name: product.name || '',
      sku: product.sku || '',
      price: product.price || 0,
      stock: product.stock || 0,
      status: product.status || 'published',
      category: typeof product.category === 'object' ? product.category : { _id: product.category || 'all', name: product.categoryName || '' },
      description: product.description || '',
      scentNotes: {
        top: product.scentNotes?.top || [],
        middle: product.scentNotes?.middle || [],
        base: product.scentNotes?.base || [],
      },
      ingredients: Array.isArray(product.ingredients) ? product.ingredients : [],
      variants: product.variants || [],
      images: product.images || [],
    };
    
    console.log('Normalized Product:', normalizedProduct); // Debug: Log normalized data
    return normalizedProduct;
  } catch (error) {
    console.error('Error in getProduct:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    throw new Error(error.response?.data?.message || 'Failed to fetch product');
  }
},
    /**
     * Get all categories with pagination.
     * @param {Object} params - Query parameters
     * @returns {Promise<Object>} - { data: Array<Category>, total: number }
     */
    getAllCategories: async (params = {}) => {
        try {
            const response = await api.get('/admin/categories', { params });
            // Backend now returns data and pagination directly.
            return {
                data: response.data?.data || [],
                total: response.data?.pagination?.total || 0,
            };
        } catch (error) {
            console.error(`Error fetching categories: ${error.response?.data?.message || error.message}`);
            throw new Error(error.response?.data?.message || 'Failed to fetch categories');
        }
    },

    /**
     * Get category tree.
     * @returns {Promise<Object>} - { data: Array<CategoryTree> }
     */
    getCategoryTree: async () => {
        try {
            const response = await api.get('/admin/categories', { params: { tree: true } });
            // Backend returns data.categories for tree, or empty array.
            return { data: response.data?.data?.categories || [] };
        } catch (error) {
            console.error(`Error fetching category tree: ${error.response?.data?.message || error.message}`);
            throw new Error(error.response?.data?.message || 'Failed to fetch category tree');
        }
    },

    /**
     * Get a single category by ID.
     * @param {string} id - Category ID
     * @returns {Promise<Object>} - Category data
     */
    getCategory: async (id) => {
        try {
            const response = await api.get(`/admin/categories/${id}`);
            return response.data; // Assuming backend returns { success, message, data: category }
        } catch (error) {
            console.error(`Error fetching category: ${error.response?.data?.message || error.message}`);
            throw new Error(error.response?.data?.message || 'Failed to fetch category');
        }
    },

    /**
     * Create a new product.
     * @param {Object} productData - Product data
     * @returns {Promise<Object>} - Created product data
     */
    createProduct: async (productData) => {
        try {
            const response = await api.post('/admin/products', productData);
            return response.data;
        } catch (error) {
            console.error(`Error creating product: ${error.response?.data?.message || error.message}`);
            throw new Error(error.response?.data?.message || 'Failed to create product');
        }
    },

    /**
     * Update an existing product.
     * @param {string} id - Product ID
     * @param {Object} productData - Updated product data
     * @returns {Promise<Object>} - Updated product data
     */
    updateProduct: async (id, productData) => {
        try {
            const response = await api.put(`/admin/products/${id}`, productData);
            return response.data;
        } catch (error) {
            console.error(`Error updating product: ${error.response?.data?.message || error.message}`);
            throw new Error(error.response?.data?.message || 'Failed to update product');
        }
    },

    /**
     * Delete a product.
     * @param {string} id - Product ID
     * @returns {Promise<Object>} - API response
     */
    deleteProduct: async (id) => {
        try {
            const response = await api.delete(`/admin/products/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error deleting product: ${error.response?.data?.message || error.message}`);
            throw new Error(error.response?.data?.message || 'Failed to delete product');
        }
    },

    /**
     * Upload images for a product.
     * @param {string} productId - Product ID
     * @param {FormData} formData - FormData containing images
     * @param {Function} onUploadProgress - Progress callback
     * @returns {Promise<Object>} - Updated product data with new images
     */
    uploadProductImages: async (productId, formData, onUploadProgress) => {
        try {
            const response = await api.post(`/admin/products/${productId}/images`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                onUploadProgress,
            });
            // Backend now returns the full updated product, so we just return it.
            return response.data;
        } catch (error) {
            console.error(`Error uploading product images: ${error.response?.data?.message || error.message}`);
            throw new Error(error.response?.data?.message || 'Failed to upload images');
        }
    },

    /**
     * Delete a product image.
     * @param {string} productId - Product ID
     * @param {string} imageId - Image ID to delete
     * @returns {Promise<Object>} - Updated product data
     */
    deleteProductImage: async (productId, imageId) => {
        try {
            const response = await api.delete(`/admin/products/${productId}/images/${imageId}`);
            return response.data;
        } catch (error) {
            console.error(`Error deleting product image: ${error.response?.data?.message || error.message}`);
            throw new Error(error.response?.data?.message || 'Failed to delete image');
        }
    },

    /**
     * Set a product image as the main image.
     * @param {string} productId - Product ID
     * @param {string} imageId - Image ID to set as main
     * @returns {Promise<Object>} - Updated product data
     */
    setMainProductImage: async (productId, imageId) => {
        try {
            const response = await api.put(`/admin/products/${productId}/images/${imageId}/main`);
            return response.data;
        } catch (error) {
            console.error(`Error setting main product image: ${error.response?.data?.message || error.message}`);
            throw new Error(error.response?.data?.message || 'Failed to set main image');
        }
    },

    /**
     * Create a new category.
     * @param {Object} categoryData - Category data
     * @returns {Promise<Object>} - Created category data
     */
    createCategory: async (categoryData) => {
        try {
            const response = await api.post('/admin/categories', categoryData);
            return response.data;
        } catch (error) {
            console.error(`Error creating category: ${error.response?.data?.message || error.message}`);
            throw new Error(error.response?.data?.message || 'Failed to create category');
        }
    },

    /**
     * Update an existing category.
     * @param {string} id - Category ID
     * @param {Object} categoryData - Updated category data
     * @returns {Promise<Object>} - Updated category data
     */
    updateCategory: async (id, categoryData) => {
        try {
            const response = await api.put(`/admin/categories/${id}`, categoryData);
            return response.data;
        } catch (error) {
            console.error(`Error updating category: ${error.response?.data?.message || error.message}`);
            throw new Error(error.response?.data?.message || 'Failed to update category');
        }
    },

    /**
     * Delete a category.
     * @param {string} id - Category ID
     * @returns {Promise<Object>} - API response
     */
    deleteCategory: async (id) => {
        try {
            const response = await api.delete(`/admin/categories/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error deleting category: ${error.response?.data?.message || error.message}`);
            throw new Error(error.response?.data?.message || 'Failed to delete category');
        }
    },

    /**
     * Generate a new SKU for a product.
     * @param {string} categoryId - Category ID for SKU generation
     * @returns {Promise<Object>} - { sku: string }
     */
    generateSKU: async (categoryId) => {
        try {
            const response = await api.get('/admin/products/sku', { params: { categoryId } });
            return response.data; // Returns { success, message, data: { sku: '...' } }
        } catch (error) {
            console.error(`Error generating SKU: ${error.response?.data?.message || error.message}`);
            throw new Error(error.response?.data?.message || 'Failed to generate SKU');
        }
    },

    /**
     * Generate a new variant SKU.
     * @param {string} productSKU - The base product SKU
     * @param {string} size - The variant size
     * @returns {Promise<string>} - The generated variant SKU string
     */
    generateVariantSKU: async (productSKU, size) => {
        try {
            const response = await api.post('/admin/products/variant-sku', { productSKU, size });
            return response.data.data.sku; // Backend returns { success, message, data: { sku: '...' } }
        } catch (error) {
            console.error(`Error generating variant SKU: ${error.response?.data?.message || error.message}`);
            throw new Error(error.response?.data?.message || 'Failed to generate variant SKU');
        }
    },
};

export default ProductService;