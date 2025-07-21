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
   * @param {string} [params.category] - Filter by category slug
   * @param {boolean} [params.featured] - Filter by featured status
   * @param {number} [params.minPrice] - Filter by minimum price
   * @param {number} [params.maxPrice] - Filter by maximum price
   * @returns {Promise<Object>} Products data with pagination
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
      console.error('Error fetching products:', error);
      return { data: [], total: 0, page: 1, limit: params.limit || 12 };
    }
  },

  /**
   * Get a single product by slug
   * @param {string} slug - Product slug
   * @returns {Promise<Object>} Product data with related products
   */
  getProduct: async (slug) => {
    try {
      const response = await api.get(`/products/${slug}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching product:', error);
      throw error;
    }
  },

  /**
   * Get featured products
   * @returns {Promise<Object>} Featured products
   */
  getFeaturedProducts: async () => {
    try {
      const response = await api.get('/products/featured', { params: { limit: 4 } });
      return response.data.data.products || [];
    } catch (error) {
      console.error('Error fetching featured products:', error);
      return [];
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
      console.error('Error fetching categories:', error);
      return [];
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
      console.error('Error fetching category:', error);
      throw error;
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