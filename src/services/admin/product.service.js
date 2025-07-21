// src/services/admin/product.service.js
import api from '../api';

const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

const ProductService = {
   getAllProducts: async (params = {}) => {
    const cacheKey = `products_${JSON.stringify(params)}`;
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data;
    }

    try {
      const response = await api.get('/admin/products', { params });
      const { data } = response.data || { data: [] };
      const total = response.data.pagination.total || 0;
      const result = {
        data: data.map(product => ({
          id: product.id,
          name: product.name || '',
          sku: product.sku || '',
          price: product.price || 0,
          stock: product.stock || 0,
          categoryName: product.categoryName || 'Uncategorized',
          stockStatus: product.stock === 0 ? 'Out of Stock' : product.stock < 10 ? 'Low Stock' : 'Active',
          status: product.status || 'published',
          images: product.images.map(img => ({
            url: img.url,
            _id: img._id,
            isMain: img.isMain || false,
            public_id: img.public_id || '', // Include public_id
          })) || [],
          variants: product.variants || [],
        })),
        total,
      };
      cache.set(cacheKey, { data: result, timestamp: Date.now() });
      return result;
    } catch (error) {
      console.error(`Error fetching products: ${error.response?.data?.error || error.message}`);
      const defaultData = { data: [], total: 0 };
      cache.set(cacheKey, { data: defaultData, timestamp: Date.now() });
      return defaultData;
    }
  },

  getProduct: async (id) => {
    const cacheKey = `product_${id}`;
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data;
    }

    try {
      const response = await api.get(`/admin/products/${id}`);
      console.log('🔥🔥🔥', response.data);
      const product = response.data.data.product || {};
      const result = {
        product: {
          _id: product._id || id,
          name: product.name || '',
          sku: product.sku || '',
          price: product.price || 0,
          stock: product.stock || 0,
          status: product.status || 'published',
          category: product.category || '',
          categoryId: product.categoryId || '',
          description: product.description || '',
          scent_notes: product.scent_notes || [],
          ingredients: product.ingredients || '',
          variants: product.variants || [],
          images: product.images.map(img => ({
            url: img.url,
            _id: img._id,
            isMain: img.isMain || false,
            public_id: img.public_id || '', // Include public_id
          })) || [],
        },
      };
      cache.set(cacheKey, { data: result, timestamp: Date.now() });
      return result;
    } catch (error) {
      console.error(`Error fetching product: ${error.response?.data?.message || error.message}`);
      throw new Error(error.response?.data?.message || 'Failed to fetch product');
    }
  },

  getAllCategories: async (params = {}) => {
    const cacheKey = `categories_${JSON.stringify(params)}`;
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data;
    }

    try {
      const response = await api.get('/admin/categories', { params });
      const { data, pagination } = response.data || { data: [], pagination: 0 };
      const result = {
        data: data.map(category => ({
          id: category._id,
          name: category.name || 'Uncategorized',
          description:category.description || 'None',
          slug:category.slug,
          parent:category.parent,
          parentName: category.parentName,
          featured:category.featured,
          productCount:category.productCount,
          subcategoryCount:category.subcategoryCount
        })),
        total: pagination.total || 0,
      };
      cache.set(cacheKey, { data: result, timestamp: Date.now() });
      return result;
    } catch (error) {
      console.error(`Error fetching categories: ${error.response?.data?.message || error.message}`);
      const defaultData = { data: [], total: 0 };
      cache.set(cacheKey, { data: defaultData, timestamp: Date.now() });
      return defaultData;
    }
  },

  getCategoryTree: async () => {
    const cacheKey = 'categoryTree';
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data;
    }

    try {
      const response = await api.get('/admin/categories', { params: { tree: true } });
      const categories = response.data?.data?.categories || [];
      const result = { data: categories };
      cache.set(cacheKey, { data: result, timestamp: Date.now() });
      return result;
    } catch (error) {
      console.error(`Error fetching category tree: ${error.response?.data?.message || error.message}`);
      const defaultData = { data: [] };
      cache.set(cacheKey, { data: defaultData, timestamp: Date.now() });
      return defaultData;
    }
  },

  getCategory: async (id) => {
    const cacheKey = `category_${id}`;
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data;
    }

    try {
      const response = await api.get(`/admin/categories/${id}`);
      const result = response.data || {};
      cache.set(cacheKey, { data: result, timestamp: Date.now() });
      return result;
    } catch (error) {
      console.error(`Error fetching category: ${error.response?.data?.message || error.message}`);
      throw new Error(error.response?.data?.message || 'Failed to fetch category');
    }
  },

  createProduct: async (productData) => {
    try {
      const response = await api.post('/admin/products', productData);
      cache.clear(); // Clear cache to force refresh after create
      return response.data;
    } catch (error) {
      console.error(`Error creating product: ${error.response?.data?.error || error.message}`);
      throw new Error(error.response?.data?.error || 'Failed to create product');
    }
  },

  updateProduct: async (id, productData) => {
    try {
      const response = await api.put(`/admin/products/${id}`, productData);
      cache.clear(); // Clear cache to force refresh after update
      return response.data;
    } catch (error) {
      console.error(`Error updating product: ${error.response?.data?.message || error.message}`);
      throw new Error(error.response?.data?.message || 'Failed to update product');
    }
  },

  deleteProduct: async (id) => {
    try {
      const response = await api.delete(`/admin/products/${id}`);
      cache.clear(); // Clear cache to force refresh after delete
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
        onUploadProgress,
      });
      cache.clear(); // Clear cache to force refresh after image upload
      return {
        ...response.data,
        product: {
          ...response.data.data.product,
          images: response.data.data.product.images.map(img => ({
            url: img.url,
            _id: img._id,
            isMain: img.isMain || false,
            public_id: img.public_id || '', // Include public_id
          })),
        },
      };
    } catch (error) {
      console.error(`Error uploading product images: ${error.response?.data?.error || error.message}`);
      throw new Error(error.response?.data?.error || 'Failed to upload images');
    }
  },

  deleteProductImage: async (productId, imageId) => {
    try {
      const response = await api.delete(`/admin/products/${productId}/images/${imageId}`);
      cache.clear(); // Clear cache to force refresh after image delete
      return response.data;
    } catch (error) {
      console.error(`Error deleting product image: ${error.response?.data?.message || error.message}`);
      throw new Error(error.response?.data?.message || 'Failed to delete image');
    }
  },

 setMainProductImage: async (productId, imageId) => {
  try {
    const response = await api.put(`/admin/products/${productId}/images/${imageId}/main`);
    cache.clear(); // Clear cache to force refresh after setting main image
    return {
      ...response.data,
      product: {
        ...response.data.data.product,
        images: response.data.data.product.images.map(img => ({
          url: img.url,
          _id: img._id,
          isMain: img.isMain || false,
          public_id: img.public_id || '', // Include public_id
        })),
      },
    };
  } catch (error) {
    console.error(`Error setting main product image: ${error.response?.data?.message || error.message}`);
    throw new Error(error.response?.data?.message || 'Failed to set main image');
  }
},

  createCategory: async (categoryData) => {
    try {
      const response = await api.post('/admin/categories', categoryData);
      cache.clear(); // Clear cache to force refresh after category create
      return response.data;
    } catch (error) {
      console.error(`Error creating category: ${error.response?.status || error.message}`);
      throw error;
    }
  },

  updateCategory: async (id, categoryData) => {
    try {
      const response = await api.put(`/admin/categories/${id}`, categoryData);
      cache.clear(); // Clear cache to force refresh after category update
      return response.data;
    } catch (error) {
      console.error(`Error updating category: ${error.response?.status || error.message}`);
      throw error;
    }
  },

  deleteCategory: async (id) => {
    try {
      const response = await api.delete(`/admin/categories/${id}`);
      cache.clear(); // Clear cache to force refresh after category delete
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
      console.error(`Error generating SKU: ${error.response?.data?.error || error.message}`);
      throw new Error(error.response?.data?.error || 'Failed to generate SKU');
    }
  },

  generateVariantSKU: async (productSKU, size) => {
    try {
      const response = await api.post('/admin/products/variant-sku', { productSKU, size });
      return response.data.sku;
    } catch (error) {
      console.error(`Error generating variant SKU: ${error.response?.data?.error || error.message}`);
      throw new Error(error.response?.data?.error || 'Failed to generate variant SKU');
    }
  },

  getCachedData: (cacheKey) => {
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data;
    }
    return null;
  },

  clearCache: () => {
    cache.clear();
  },
};

export default ProductService;