import api from './api';

/**
 * Product service for user-facing e-commerce website
 */
const ProductService = {
  /**
   * Get all products with pagination, sorting, and filtering
   * @param {Object} params - Query parameters
   * @param {number} [params.page=1] - Page number
   * @param {number} [params.limit=12] - Items per page
   * @param {string} [params.sort] - Sort field
   * @param {string} [params.order='asc'] - Sort order (asc, desc)
   * @param {string} [params.search] - Search term
   * @param {string} [params.category] - Filter by category ID
   * @param {boolean} [params.featured] - Filter by featured status
   * @param {number} [params.minPrice] - Filter by minimum price
   * @param {number} [params.maxPrice] - Filter by maximum price
   * @returns {Promise<Object>} Products data with pagination
   */
  getProducts: async (params = {}) => {
    const response = await api.get('/products', { params });
    return response.data;
  },

  /**
   * Get a single product by ID
   * @param {string} id - Product ID
   * @returns {Promise<Object>} Product data
   */
  getProduct: async (id) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  /**
   * Get featured products
   * @param {Object} params - Query parameters
   * @param {number} [params.limit=8] - Number of products to return
   * @returns {Promise<Object>} Featured products
   */
  getFeaturedProducts: async (params = { limit: 8 }) => {
    const response = await api.get('/products', { 
      params: { ...params, featured: true } 
    });
    return response.data;
  },

  /**
   * Get related products
   * @param {string} id - Product ID
   * @param {Object} params - Query parameters
   * @param {number} [params.limit=4] - Number of products to return
   * @returns {Promise<Object>} Related products
   */
  getRelatedProducts: async (id, params = { limit: 4 }) => {
    const response = await api.get(`/products/${id}/related`, { params });
    return response.data;
  },

  /**
   * Get all categories
   * @returns {Promise<Object>} Categories data
   */
  getCategories: async () => {
    const response = await api.get('/categories');
    return response.data;
  },

  /**
   * Get a single category by ID
   * @param {string} id - Category ID
   * @returns {Promise<Object>} Category data
   */
  getCategory: async (id) => {
    const response = await api.get(`/categories/${id}`);
    return response.data;
  },

  /**
   * Get products by category
   * @param {string} categoryId - Category ID
   * @param {Object} params - Query parameters
   * @param {number} [params.page=1] - Page number
   * @param {number} [params.limit=12] - Items per page
   * @param {string} [params.sort] - Sort field
   * @param {string} [params.order='asc'] - Sort order (asc, desc)
   * @returns {Promise<Object>} Products data with pagination
   */
  getProductsByCategory: async (categoryId, params = {}) => {
    const response = await api.get('/products', { 
      params: { ...params, category: categoryId } 
    });
    return response.data;
  },

  /**
   * Search products
   * @param {string} query - Search query
   * @param {Object} params - Query parameters
   * @param {number} [params.page=1] - Page number
   * @param {number} [params.limit=12] - Items per page
   * @returns {Promise<Object>} Search results with pagination
   */
  searchProducts: async (query, params = {}) => {
    const response = await api.get('/products', { 
      params: { ...params, search: query } 
    });
    return response.data;
  },

  /**
   * Get product reviews
   * @param {string} productId - Product ID
   * @param {Object} params - Query parameters
   * @param {number} [params.page=1] - Page number
   * @param {number} [params.limit=5] - Items per page
   * @returns {Promise<Object>} Reviews data with pagination
   */
  getProductReviews: async (productId, params = {}) => {
    const response = await api.get(`/products/${productId}/reviews`, { params });
    return response.data;
  },

  /**
   * Submit a product review
   * @param {string} productId - Product ID
   * @param {Object} reviewData - Review data
   * @param {number} reviewData.rating - Rating (1-5)
   * @param {string} reviewData.comment - Review comment
   * @returns {Promise<Object>} Created review
   */
  submitProductReview: async (productId, reviewData) => {
    const response = await api.post(`/products/${productId}/reviews`, reviewData);
    return response.data;
  }
};

export default ProductService;