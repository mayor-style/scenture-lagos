// src/services/product.service.js
import api from './api'; // Assuming you have an axios instance configured here

/**
 * A centralized error handler that logs the error and throws a new,
 * user-friendly error for React Query to catch.
 * @param {string} context - A description of what was happening when the error occurred.
 * @param {Error} error - The original error object from the catch block.
 */
const handleError = (context, error) => {
  console.error(`Error ${context}:`, error.response?.data || error.message);
  throw new Error(`Could not fetch ${context}. Please try again later.`);
};
/**
 * Product service for user-facing e-commerce website
 */
const ProductService = {
 /**
   * Get all products with full filtering and pagination options.
   * @param {Object} [params={}] - Query parameters for filtering, sorting, and pagination.
   * @returns {Promise<Object>} A promise that resolves to the API response data.
   */
  getProducts: async (params = {}) => {
    try {
      const sortMap = {
        'price-low-high': 'price-asc',
        'price-high-low': 'price-desc',
        newest: 'newest',
        featured: 'featured',
      };
      const mappedParams = {
        ...params,
        sort: sortMap[params.sort] || params.sort || 'newest',
      };
      const response = await api.get('/products', { params: mappedParams });
      return response.data;
    } catch (error) {
      handleError('products', error);
    }
  },

  /**
   * Get a single product by its unique slug.
   * @param {string} slug - The product slug.
   * @returns {Promise<Object>} A promise that resolves to a single product object.
   */
  getProduct: async (slug) => {
    if (!slug) throw new Error('A product slug must be provided.');
    try {
      const response = await api.get(`/products/${slug}`);
      return response.data.data;
    } catch (error) {
      handleError(`product "${slug}"`, error);
    }
  },

   /**
   * Get a limited number of featured products.
   * This is the function that will be called by React Query.
   * @param {number} [limit=4] - The number of products to fetch.
   * @returns {Promise<Array>} A promise that resolves to an array of product objects.
   */
  getFeaturedProducts: async (limit = 4) => {
    try {
      const response = await api.get('/products/featured', { params: { limit } });
      // Ensure we always return an array, even if the API response is slightly different.
      return response.data.data.products || [];
    } catch (error) {
      handleError('featured products', error);
    }
  },

  /**
   * Get all categories
   * @returns {Promise<Object>} Categories data
   */
  getCategories: async () => {
    try {
      const response = await api.get('/categories', { params: { parent: 'none' } });
      return response.data.data.categories || [];
    } catch (error) {
      handleError(`product categories`, error)
    }
  },

  /**
   * Get a single category by ID
   * @param {string} id - Category ID
   * @returns {Promise<Object>} Category data
   */
  getCategory: async (id) => {
    try {
      const response = await api.get(`/categories/${id}`);
      return response.data;
    } catch (error) {
     handleError('product Category');
    }
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
    try {
      const response = await api.get('/products', {
        params: { ...params, category: categoryId },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching products by category:', error);
      return { data: [], total: 0, page: 1, limit: params.limit || 12 };
    }
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
    try {
      const response = await api.get('/products', {
        params: { ...params, search: query },
      });
      return response.data;
    } catch (error) {
      console.error('Error searching products:', error);
      return { data: [], total: 0, page: 1, limit: params.limit || 12 };
    }
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
    try {
      const response = await api.get(`/products/${productId}/reviews`, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching product reviews:', error);
      return { data: [], total: 0, page: 1, limit: params.limit || 5 };
    }
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
    try {
      const response = await api.post(`/products/${productId}/reviews`, reviewData);
      return response.data;
    } catch (error) {
      console.error('Error submitting review:', error);
      throw error;
    }
  },
};

export default ProductService;