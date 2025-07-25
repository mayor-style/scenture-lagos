import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, X, ChevronDown, AlertCircle, ShoppingBag } from 'lucide-react';

import ProductService from '../services/product.service';
import ProductCard from '../components/product/ProductCard';
import { Button } from '../components/ui/Button';

// --- Reusable Components ---

const SkeletonCard = () => (
  <div className="animate-pulse">
    <div className="aspect-square bg-neutral-200 rounded-lg mb-4"></div>
    <div className="h-4 bg-neutral-200 rounded w-3/4 mb-2"></div>
    <div className="h-4 bg-neutral-200 rounded w-1/2"></div>
  </div>
);

const EmptyState = ({ onClear }) => (
  <div className="col-span-full flex flex-col items-center justify-center text-center py-20">
    <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-6">
      <ShoppingBag className="w-8 h-8 text-neutral-400" />
    </div>
    <h3 className="font-heading text-2xl text-neutral-900 mb-2">No Products Found</h3>
    <p className="text-neutral-600 mb-6 max-w-sm">
      Your search or filter combination returned no results. Try adjusting your criteria or view all products.
    </p>
    <Button onClick={onClear}>View All Products</Button>
  </div>
);

const ErrorState = ({ error, onRetry }) => (
  <div className="col-span-full flex flex-col items-center justify-center text-center py-20 bg-red-50/50 rounded-lg">
    <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
    <h3 className="font-heading text-2xl text-red-800 mb-2">Something Went Wrong</h3>
    <p className="text-red-700 mb-6 max-w-md">{error?.message || 'Failed to load products. Please check your connection.'}</p>
    <Button onClick={onRetry} variant="destructive">Try Again</Button>
  </div>
);

// --- Main Shop Page Component ---

export default function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // --- State derived from URL ---
  const filters = {
    page: Number(searchParams.get('page')) || 1,
    sort: searchParams.get('sort') || 'featured',
    category: searchParams.get('category') || 'all',
    limit: 12,
  };

  // --- Handlers to update URL search params ---
  const updateFilters = (newFilters) => {
    const newParams = new URLSearchParams(searchParams);
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value) {
        newParams.set(key, value);
      } else {
        newParams.delete(key);
      }
    });
    // Reset page on filter change
    if (newFilters.category || newFilters.sort) {
      newParams.set('page', '1');
    }
    setSearchParams(newParams, { replace: true });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCategoryChange = (slug) => updateFilters({ category: slug === 'all' ? null : slug });
  const handleSortChange = (e) => updateFilters({ sort: e.target.value });
  const handlePageChange = (newPage) => updateFilters({ page: newPage });
  const clearFilters = () => setSearchParams({}, { replace: true });

  // --- Data Fetching with TanStack Query ---
  const { data: categoriesData, isLoading: isLoadingCategories } = useQuery({
    queryKey: ['categories'],
    queryFn: ProductService.getCategories,
    staleTime: 1000 * 60 * 60, // Cache categories for 1 hour
  });
  const categories = [{ slug: 'all', name: 'All Categories' }, ...(categoriesData || [])];

  const { data: productsData, isLoading, isError, error, isFetching } = useQuery({
    queryKey: ['products', filters], // Query key includes filters, so it refetches when they change
    queryFn: () => ProductService.getProducts(filters),
    placeholderData: (previousData) => previousData, // Keep old data visible while new data is fetching
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  // --- Animation Variants ---
  const staggerContainer = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.05 } },
  };
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
  };

  // --- Render Logic ---
  const totalPages = productsData?.pagination?.totalPages || 1;
  const currentCategoryName = categories.find(c => c.slug === filters.category)?.name || 'All Categories';

  return (
    <div className="bg-white">
      {/* Page Header */}
      <section className="bg-neutral-50 border-b border-neutral-200/80 py-16 lg:py-20">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          className="container px-6 text-center"
        >
          <h1 className="font-heading text-4xl md:text-5xl text-neutral-900 tracking-tight">
            Our Collection
          </h1>
          <p className="mt-4 text-lg text-neutral-600 max-w-2xl mx-auto">
            Discover meticulously crafted fragrances and diffusers designed to elevate your everyday.
          </p>
        </motion.div>
      </section>

      <div className="container px-6 py-12 lg:py-16">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Desktop Filter Sidebar */}
          <aside className="hidden lg:block w-72 flex-shrink-0">
            <div className="sticky top-28 space-y-8">
              <div>
                <h3 className="font-semibold text-sm tracking-wider uppercase text-neutral-800 mb-4">Categories</h3>
                <ul className="space-y-1">
                  {categories.map((cat) => (
                    <li key={cat.slug}>
                      <button
                        onClick={() => handleCategoryChange(cat.slug)}
                        className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                          filters.category === cat.slug
                            ? 'bg-neutral-100 font-semibold text-neutral-900'
                            : 'text-neutral-600 hover:bg-neutral-100/60 hover:text-neutral-900'
                        }`}
                      >
                        {cat.name}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-grow">
            {/* Toolbar */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8 pb-4 border-b border-neutral-200/80">
              <div className="flex items-center gap-4">
                <Button onClick={() => setIsMobileFilterOpen(true)} variant="outline" className="lg:hidden flex items-center gap-2">
                  <Filter size={16} />
                  <span>Filter</span>
                </Button>
                <p className="text-sm text-neutral-600">
                  {isFetching ? 'Loading...' : `Showing ${productsData?.data?.length || 0} of ${productsData?.pagination?.total || 0} products`}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <label htmlFor="sort" className="text-sm font-medium text-neutral-700">Sort by:</label>
                <div className="relative">
                  <select
                    id="sort"
                    value={filters.sort}
                    onChange={handleSortChange}
                    className="appearance-none w-full bg-white border border-neutral-300 rounded-md py-2 pl-3 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-800"
                  >
                    <option value="featured">Featured</option>
                    <option value="price-low-high">Price: Low to High</option>
                    <option value="price-high-low">Price: High to Low</option>
                    <option value="newest">Newest</option>
                  </select>
                  <ChevronDown size={16} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Products Grid */}
            <motion.div
              key={filters.page} // Re-trigger animation on page change
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10"
            >
              {isLoading && [...Array(filters.limit)].map((_, i) => <SkeletonCard key={i} />)}
              {isError && <ErrorState error={error} onRetry={() => window.location.reload()} />}
              {!isLoading && !isError && productsData?.data.length === 0 && <EmptyState onClear={clearFilters} />}
              {!isLoading && !isError && productsData?.data.map((product) => (
                <motion.div key={product._id} variants={fadeInUp}>
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </motion.div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center mt-12 space-x-2">
                <Button variant="outline" size="sm" disabled={filters.page === 1} onClick={() => handlePageChange(filters.page - 1)}>Previous</Button>
                {[...Array(totalPages)].map((_, i) => (
                  <Button key={i} variant={filters.page === i + 1 ? 'default' : 'ghost'} size="sm" onClick={() => handlePageChange(i + 1)}>{i + 1}</Button>
                ))}
                <Button variant="outline" size="sm" disabled={filters.page === totalPages} onClick={() => handlePageChange(filters.page + 1)}>Next</Button>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Mobile Filter Overlay */}
      <AnimatePresence>
        {isMobileFilterOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            onClick={() => setIsMobileFilterOpen(false)}
          >
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="absolute top-0 left-0 h-full w-full max-w-sm bg-white shadow-2xl flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center p-4 border-b border-neutral-200">
                <h3 className="font-heading text-xl">Filter & Sort</h3>
                <Button variant="ghost" size="icon" onClick={() => setIsMobileFilterOpen(false)}><X size={20} /></Button>
              </div>
              <div className="p-6 space-y-8 overflow-y-auto">
                <div>
                  <h4 className="font-semibold text-sm tracking-wider uppercase text-neutral-800 mb-4">Categories</h4>
                  <ul className="space-y-1">
                    {categories.map((cat) => (
                      <li key={cat.slug}>
                        <button
                          onClick={() => { handleCategoryChange(cat.slug); setIsMobileFilterOpen(false); }}
                          className={`w-full text-left px-3 py-2.5 rounded-md text-base transition-colors ${
                            filters.category === cat.slug
                              ? 'bg-neutral-100 font-semibold text-neutral-900'
                              : 'text-neutral-600 hover:bg-neutral-100/60 hover:text-neutral-900'
                          }`}
                        >
                          {cat.name}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}