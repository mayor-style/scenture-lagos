import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ShoppingBag, Heart, Share2, Star, Minus, Plus, Check, Truck, Shield, RotateCcw } from 'lucide-react';
import { Button } from '../components/ui/Button';
import ProductCard from '../components/product/ProductCard';
import { products } from '../lib/mockData';
import { formatPrice } from '../lib/utils';
import {Helmet} from 'react-helmet-async';

const ProductDetailPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [selectedTab, setSelectedTab] = useState('description');
  
  // Enhanced animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
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

  const slideIn = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: "easeOut" } },
  };

  // Find the product and related products
  useEffect(() => {
    if (id) {
      const foundProduct = products.find(p => p.id === id);
      if (foundProduct) {
        setProduct(foundProduct);
        
        // Find related products (same category, excluding current product)
        const related = products
          .filter(p => p.category === foundProduct.category && p.id !== id)
          .slice(0, 4);
        setRelatedProducts(related);
      }
    }
  }, [id]);

  // Handle quantity change
  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0) {
      setQuantity(value);
    }
  };

  // Increment quantity
  const incrementQuantity = () => {
    setQuantity(prev => prev + 1);
  };

  // Decrement quantity
  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  // Toggle wishlist
  const toggleWishlist = () => {
    setIsWishlisted(!isWishlisted);
  };

  // Mock product images
  const productImages = [
    product?.image,
    'https://images.unsplash.com/photo-1594035910387-fea47794261f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=880&q=80',
    'https://images.unsplash.com/photo-1599446794254-16ca8daa4c48?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80',
  ];

  if (!product) {
    return (
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
        className="min-h-[60vh] flex items-center justify-center bg-gradient-to-br from-gray-50 to-white"
      >
        <div className="text-center space-y-6 max-w-md mx-auto px-4">
          <div className="w-20 h-20 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
            <ShoppingBag size={32} className="text-gray-400" />
          </div>
          <div className="space-y-3">
            <h2 className="font-heading text-2xl text-gray-900">Product Not Found</h2>
            <p className="text-gray-600 text-sm leading-relaxed">
              The product you're looking for doesn't exist or has been removed from our catalog.
            </p>
          </div>
          <Button asChild className="px-8 py-3 rounded-full">
            <Link to="/shop">Continue Shopping</Link>
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
        <Helmet>
        <title>{product.name} | Scenture Lagos</title>
        <meta name="description" content={product.description} />
      </Helmet>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Breadcrumb */}
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={slideIn}
          className="mb-8"
        >
          <Link 
            to="/shop" 
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 transition-colors duration-200 group"
          >
            <ArrowLeft size={16} className="mr-2 group-hover:-translate-x-1 transition-transform duration-200" />
            Back to Shop
          </Link>
        </motion.div>

        {/* Product Details */}
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 mb-20"
        >
          {/* Product Images */}
          <motion.div variants={fadeInUp} className="space-y-4">
            <div className="relative aspect-square bg-gray-50 rounded-2xl overflow-hidden group">
              <img 
                src={productImages[activeImage]} 
                alt={product.name} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
            </div>
            <div className="grid grid-cols-3 gap-3">
              {productImages.map((image, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveImage(index)}
                  className={`aspect-square bg-gray-50 rounded-xl overflow-hidden border-2 transition-all duration-300 ${
                    activeImage === index 
                      ? 'border-black shadow-lg ring-2 ring-black/10' 
                      : 'border-transparent hover:border-gray-200'
                  }`}
                >
                  <img 
                    src={image} 
                    alt={`${product.name} view ${index + 1}`} 
                    className="w-full h-full object-cover"
                  />
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Product Info */}
          <motion.div variants={fadeInUp} className="space-y-8">
            {/* Header */}
            <div className="space-y-4">
              <div className="space-y-2">
                <h1 className="font-heading text-3xl lg:text-4xl text-gray-900 leading-tight">
                  {product.name}
                </h1>
                <div className="flex items-center gap-4">
                  <p className="text-3xl font-light text-gray-900">{formatPrice(product.price)}</p>
                  <span className="px-3 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-full uppercase tracking-wide">
                    In Stock
                  </span>
                </div>
              </div>

              {/* Ratings */}
              <div className="flex items-center gap-3">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      size={16} 
                      className={i < 4 ? 'text-amber-400 fill-amber-400' : 'text-gray-300'} 
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-500">4.0 (24 reviews)</span>
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-100">
              <nav className="flex gap-8">
                {['description', 'details', 'reviews'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setSelectedTab(tab)}
                    className={`py-3 text-sm font-medium capitalize transition-colors duration-200 border-b-2 ${
                      selectedTab === tab
                        ? 'text-gray-900 border-black'
                        : 'text-gray-500 border-transparent hover:text-gray-700'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab Content */}
            <motion.div 
              key={selectedTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              {selectedTab === 'description' && (
                <div className="prose prose-sm max-w-none text-gray-600">
                  <p className="leading-relaxed">
                    Experience the luxurious blend of {product.name}, crafted to transform your space into a sanctuary of elegance. 
                    This premium fragrance combines notes of amber, vanilla, and exotic woods for a warm, inviting aroma that lingers delicately.
                  </p>
                  <p className="leading-relaxed">
                    Each {product.category === 'candles' ? 'candle' : product.category === 'diffusers' ? 'diffuser' : 'fragrance'} is 
                    meticulously created using the finest ingredients, ensuring a consistent, long-lasting scent that evolves beautifully over time.
                  </p>
                </div>
              )}

              {selectedTab === 'details' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900">Product Details</h4>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex justify-between">
                        <span>Category:</span>
                        <span className="capitalize font-medium">{product.category}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Size:</span>
                        <span className="font-medium">
                          {product.category === 'candles' ? '250g' : 
                           product.category === 'diffusers' ? '200ml' : '50ml'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Burn Time:</span>
                        <span className="font-medium">
                          {product.category === 'candles' ? '45 hours' : 
                           product.category === 'diffusers' ? '3 months' : 'All day'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900">Fragrance Notes</h4>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div><span className="font-medium">Top:</span> Bergamot, Citrus</div>
                      <div><span className="font-medium">Middle:</span> Jasmine, Rose</div>
                      <div><span className="font-medium">Base:</span> Sandalwood, Amber</div>
                    </div>
                  </div>
                </div>
              )}

              {selectedTab === 'reviews' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-900">Customer Reviews</h4>
                    <Button variant="outline" size="sm">Write a Review</Button>
                  </div>
                  <div className="text-sm text-gray-500">
                    Reviews feature coming soon. Be the first to share your experience!
                  </div>
                </div>
              )}
            </motion.div>

            {/* Add to Cart Section */}
            <div className="space-y-6 pt-6 border-t border-gray-100">
              {/* Quantity & Actions */}
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-gray-200 rounded-lg">
                  <button 
                    onClick={decrementQuantity}
                    className="p-3 hover:bg-gray-50 transition-colors duration-200 rounded-l-lg"
                    disabled={quantity <= 1}
                  >
                    <Minus size={16} className={quantity <= 1 ? 'text-gray-300' : 'text-gray-600'} />
                  </button>
                  <input 
                    type="number" 
                    min="1" 
                    value={quantity} 
                    onChange={handleQuantityChange}
                    className="w-16 py-3 text-center text-sm font-medium border-x border-gray-200 focus:outline-none focus:ring-2 focus:ring-black/10"
                  />
                  <button 
                    onClick={incrementQuantity}
                    className="p-3 hover:bg-gray-50 transition-colors duration-200 rounded-r-lg"
                  >
                    <Plus size={16} className="text-gray-600" />
                  </button>
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={toggleWishlist}
                  className={`p-3 rounded-lg border transition-all duration-200 ${
                    isWishlisted 
                      ? 'border-red-200 bg-red-50 text-red-600' 
                      : 'border-gray-200 hover:border-gray-300 text-gray-600'
                  }`}
                  aria-label="Add to Wishlist"
                >
                  <Heart size={18} className={isWishlisted ? 'fill-current' : ''} />
                </motion.button>
                
                <button className="p-3 rounded-lg border border-gray-200 hover:border-gray-300 text-gray-600 transition-colors duration-200">
                  <Share2 size={18} />
                </button>
              </div>

              {/* Add to Cart Button */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button className="w-full py-4 text-base font-medium rounded-xl bg-black hover:bg-gray-800 text-white transition-all duration-200 shadow-lg hover:shadow-xl">
                  <ShoppingBag size={20} className="mr-3" />
                  Add to Cart • {formatPrice(product.price * quantity)}
                </Button>
              </motion.div>

              {/* Trust Indicators */}
              <div className="grid grid-cols-3 gap-4 pt-4">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Truck size={16} className="text-gray-400" />
                  <span>Free Shipping</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Shield size={16} className="text-gray-400" />
                  <span>Secure Payment</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <RotateCcw size={16} className="text-gray-400" />
                  <span>Easy Returns</span>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <motion.section
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="space-y-8"
          >
            <motion.div variants={fadeInUp}>
              <h2 className="font-heading text-2xl lg:text-3xl text-gray-900 mb-2">
                You May Also Like
              </h2>
              <p className="text-gray-600 text-sm">
                Discover similar products that complement your selection
              </p>
            </motion.div>
            
            <motion.div
              variants={staggerContainer}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {relatedProducts.map((relatedProduct, index) => (
                <motion.div
                  key={relatedProduct.id}
                  variants={fadeInUp}
                  transition={{ delay: index * 0.1 }}
                >
                  <ProductCard product={relatedProduct} />
                </motion.div>
              ))}
            </motion.div>
          </motion.section>
        )}
      </div>
    </div>
  );
};

export default ProductDetailPage;