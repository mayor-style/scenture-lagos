import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Filter, ChevronDown, Grid3X3 } from 'lucide-react';
import ProductCard from '../components/product/ProductCard';
import { Button } from '../components/ui/Button';
import ProductService from '../services/product.service';

const ShopPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(12);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortOption, setSortOption] = useState('featured');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get category from URL params
  const categoryParam = searchParams.get('category');

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        duration: 0.8, 
        ease: [0.22, 1, 0.36, 1] 
      } 
    },
  };

  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1, 
      transition: { 
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1]
      } 
    },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const scaleIn = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { 
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1]
      }
    },
  };

  const slideDown = {
    hidden: { height: 0, opacity: 0 },
    visible: { 
      height: 'auto', 
      opacity: 1,
      transition: { 
        duration: 0.4,
        ease: [0.22, 1, 0.36, 1]
      }
    },
    exit: { 
      height: 0, 
      opacity: 0,
      transition: { 
        duration: 0.3,
        ease: [0.22, 1, 0.36, 1]
      }
    }
  };

  // Fetch products and categories
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Fetch categories
        const categoriesData = await ProductService.getCategories();
        setCategories([{ slug: 'all', name: 'All Categories' }, ...categoriesData]);

        // Fetch products
        const params = {
          page,
          limit,
          sort: sortOption,
          category: categoryParam || (selectedCategory !== 'all' ? selectedCategory : undefined),
        };
        const { data, pagination } = await ProductService.getProducts(params);
        setProducts(data.map(product => ({
          id: product._id,
          name: product.name,
          price: product.price,
          images: product.images,
          category: product.category?.name || 'Uncategorized',
          slug:product.slug,
        })));
        setTotalProducts(pagination.total);
        setSelectedCategory(categoryParam || 'all');
      } catch (err) {
        setError('Failed to load products or categories. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [page, sortOption, categoryParam, selectedCategory, limit]);

  // Handle category change
  const handleCategoryChange = (categorySlug) => {
    setSelectedCategory(categorySlug);
    setPage(1); // Reset to first page
    if (categorySlug === 'all') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', categorySlug);
    }
    setSearchParams(searchParams);
  };

  // Handle sort change
  const handleSortChange = (e) => {
    setSortOption(e.target.value);
    setPage(1); // Reset to first page
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Toggle filter visibility on mobile
  const toggleFilter = () => {
    setIsFilterOpen(!isFilterOpen);
  };

  // Calculate total pages
  const totalPages = Math.ceil(totalProducts / limit);

  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-neutral-50 via-white to-neutral-100 py-16 lg:py-24">
        <div className="container px-6 lg:px-12">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            className="max-w-4xl"
          >
            <div className="inline-flex items-center px-4 py-2 bg-white border border-neutral-200 rounded-full text-sm text-neutral-600 mb-8">
              ✨ Premium Collection
            </div>
            
            <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl mb-6 text-neutral-900 tracking-tight leading-[1.1]">
              Shop Our
              <span className="block text-neutral-500 font-light">Curated Collection</span>
            </h1>
            
            <p className="text-xl text-neutral-600 max-w-3xl leading-relaxed">
              Explore our meticulously curated selection of premium fragrances, candles, and diffusers. 
              Each product is crafted with the finest ingredients to elevate your space and senses.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="container px-6 lg:px-12 py-12 lg:py-16">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
          {/* Filter Sidebar - Desktop */}
          <motion.aside 
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            className="hidden lg:block w-72 flex-shrink-0"
          >
            <div className="sticky top-24">
              <div className="bg-white border border-neutral-200 p-8">
                <h2 className="font-heading text-2xl mb-8 text-neutral-900 tracking-tight">Categories</h2>
                <ul className="space-y-2">
                  {categories.map((category) => (
                    <li key={category.slug}>
                      <button
                        onClick={() => handleCategoryChange(category.slug)}
                        className={`text-left w-full py-3 px-4 rounded-full transition-all duration-300 text-sm font-medium ${
                          selectedCategory === category.slug 
                            ? 'bg-neutral-900 text-white' 
                            : 'hover:bg-neutral-100 text-neutral-600 hover:text-neutral-900'
                        }`}
                      >
                        {category.name}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.aside>

          {/* Mobile Filter Toggle */}
          <div className="lg:hidden">
            <Button 
              onClick={toggleFilter} 
              variant="outline" 
              className="w-full flex items-center justify-between py-4 px-6 rounded-full border-neutral-300 hover:bg-neutral-50 transition-all duration-300"
            >
              <span className="flex items-center font-medium">
                <Filter size={18} className="mr-3" />
                Filter & Sort
              </span>
              <ChevronDown 
                size={18} 
                className={`transition-transform duration-300 ${isFilterOpen ? 'rotate-180' : ''}`} 
              />
            </Button>
            
            {isFilterOpen && (
              <motion.div 
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={slideDown}
                className="mt-4 border border-neutral-200 bg-white overflow-hidden"
              >
                <div className="p-6">
                  <div className="mb-8">
                    <h3 className="font-heading text-lg mb-4 text-neutral-900">Categories</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {categories.map((category) => (
                        <button
                          key={category.slug}
                          onClick={() => handleCategoryChange(category.slug)}
                          className={`text-left py-3 px-4 text-sm transition-all duration-300 rounded-full font-medium ${
                            selectedCategory === category.slug 
                              ? 'bg-neutral-900 text-white' 
                              : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-600'
                          }`}
                        >
                          {category.name}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-heading text-lg mb-4 text-neutral-900">Sort By</h3>
                    <select
                      value={sortOption}
                      onChange={handleSortChange}
                      className="w-full p-4 border border-neutral-300 focus:border-neutral-500 focus:outline-none bg-white rounded-full font-medium text-neutral-700 transition-all duration-300"
                    >
                      <option value="featured">Featured</option>
                      <option value="price-low-high">Price: Low to High</option>
                      <option value="price-high-low">Price: High to Low</option>
                      <option value="newest">Newest</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Main Content */}
          <div className="flex-grow">
            {/* Sort - Desktop */}
            <motion.div 
              initial="hidden"
              animate="visible"
              variants={fadeIn}
              className="hidden lg:flex justify-between items-center mb-12 pb-6 border-b border-neutral-200"
            >
              <div className="flex items-center space-x-4">
                <p className="text-neutral-600 font-medium">
                  Showing {products.length} of {totalProducts} {totalProducts === 1 ? 'product' : 'products'}
                </p>
                {selectedCategory !== 'all' && (
                  <div className="inline-flex items-center px-3 py-1 bg-neutral-100 rounded-full text-sm text-neutral-700">
                    {categories.find(cat => cat.slug === selectedCategory)?.name || 'Category'}
                  </div>
                )}
              </div>
              
              <div className="flex items-center space-x-4">
                <label htmlFor="sort" className="text-sm font-medium text-neutral-700">Sort by:</label>
                <select
                  id="sort"
                  value={sortOption}
                  onChange={handleSortChange}
                  className="p-3 border border-neutral-300 focus:border-neutral-500 focus:outline-none bg-white rounded-full font-medium text-neutral-700 transition-all duration-300 min-w-[180px]"
                >
                  <option value="featured">Featured</option>
                  <option value="price-low-high">Price: Low to High</option>
                  <option value="price-high-low">Price: High to Low</option>
                  <option value="newest">Newest</option>
                </select>
              </div>
            </motion.div>

            {/* Products Grid */}
            {isLoading ? (
              <motion.div
                initial="hidden"
                animate="visible"
                variants={staggerContainer}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10"
              >
                {[...Array(limit)].map((_, index) => (
                  <motion.div key={index} variants={scaleIn}>
                    <div className="animate-pulse">
                      <div className="aspect-square bg-neutral-200 rounded-lg mb-4"></div>
                      <div className="h-4 bg-neutral-200 rounded w-3/4 mb-2"></div>
                      <div className="h-4 bg-neutral-200 rounded w-1/2"></div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            ) : error ? (
              <motion.div 
                initial="hidden"
                animate="visible"
                variants={fadeInUp}
                className="text-center py-20"
              >
                <div className="max-w-md mx-auto">
                  <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Grid3X3 className="w-8 h-8 text-neutral-400" />
                  </div>
                  
                  <h3 className="font-heading text-2xl text-neutral-900 mb-4">Error Loading Products</h3>
                  <p className="text-neutral-600 mb-8 leading-relaxed">
                    {error}
                  </p>
                  
                  <Button 
                    onClick={() => window.location.reload()} 
                    className="bg-neutral-900 hover:bg-neutral-800 text-white px-8 py-3 rounded-full transition-all duration-300"
                  >
                    Try Again
                  </Button>
                </div>
              </motion.div>
            ) : products.length > 0 ? (
              <motion.div
                initial="hidden"
                animate="visible"
                variants={staggerContainer}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10"
              >
                {products.map((product) => (
                  <motion.div key={product.id} variants={scaleIn}>
                    <ProductCard product={product} />
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div 
                initial="hidden"
                animate="visible"
                variants={fadeInUp}
                className="text-center py-20"
              >
                <div className="max-w-md mx-auto">
                  <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Grid3X3 className="w-8 h-8 text-neutral-400" />
                  </div>
                  
                  <h3 className="font-heading text-2xl text-neutral-900 mb-4">No products found</h3>
                  <p className="text-neutral-600 mb-8 leading-relaxed">
                    We couldn't find any products in this category. Try exploring our full collection.
                  </p>
                  
                  <Button 
                    onClick={() => handleCategoryChange('all')} 
                    className="bg-neutral-900 hover:bg-neutral-800 text-white px-8 py-3 rounded-full transition-all duration-300"
                  >
                    View All Products
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <motion.div
                initial="hidden"
                animate="visible"
                variants={fadeIn}
                className="flex justify-center items-center mt-12 space-x-2"
              >
                <Button
                  variant="outline"
                  disabled={page === 1}
                  onClick={() => handlePageChange(page - 1)}
                  className="px-4 py-2 rounded-full border-neutral-300 hover:bg-neutral-50 disabled:opacity-50"
                >
                  Previous
                </Button>
                <div className="flex space-x-1">
                  {[...Array(totalPages)].map((_, index) => (
                    <Button
                      key={index}
                      variant={page === index + 1 ? 'default' : 'outline'}
                      onClick={() => handlePageChange(index + 1)}
                      className={`px-4 py-2 rounded-full ${
                        page === index + 1 
                          ? 'bg-neutral-900 text-white hover:bg-neutral-800' 
                          : 'border-neutral-300 hover:bg-neutral-50'
                      }`}
                    >
                      {index + 1}
                    </Button>
                  ))}
                </div>
                <Button
                  variant="outline"
                  disabled={page === totalPages}
                  onClick={() => handlePageChange(page + 1)}
                  className="px-4 py-2 rounded-full border-neutral-300 hover:bg-neutral-50 disabled:opacity-50"
                >
                  Next
                </Button>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopPage;