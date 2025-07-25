import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ShoppingBag, Heart, Share2, Star, Minus, Plus, Truck, Shield, RotateCcw } from 'lucide-react';
import { Button } from '../components/ui/Button';
import ProductCard from '../components/product/ProductCard';
import { formatPrice } from '../lib/utils';
import { Helmet } from 'react-helmet-async';
import { useCart } from '../contexts/CartContext';
import { useToast } from '../components/ui/Toast';
import ProductService from '../services/product.service';

// Custom Hook to encapsulate product fetching and state logic
const useProductDetail = (slug) => {
  const [product, setProduct] = React.useState(null);
  const [relatedProducts, setRelatedProducts] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const { addToast } = useToast();

  React.useEffect(() => {
    const fetchProductData = async () => {
      setLoading(true);
      setError(null);
      // Reset state when slug changes to avoid showing stale data
      setProduct(null);
      setRelatedProducts([]);
      
      try {
        const { product: fetchedProduct, relatedProducts: fetchedRelated } = await ProductService.getProduct(slug);
        
        setProduct({
          id: fetchedProduct._id,
          slug: fetchedProduct.slug,
          name: fetchedProduct.name,
          price: fetchedProduct.price,
          images: fetchedProduct.images || [],
          category: fetchedProduct.category?.name || 'Uncategorized',
          description: fetchedProduct.description,
          scentNotes: fetchedProduct.scentNotes || { top: [], middle: [], base: [] },
          averageRating: fetchedProduct.averageRating || 0,
          numReviews: fetchedProduct.numReviews || 0,
          stockQuantity: fetchedProduct.stockQuantity || 0,
          sku: fetchedProduct.sku || `SKU-${fetchedProduct._id}`,
        });

        setRelatedProducts(fetchedRelated.map((p) => ({
          id: p._id,
          slug: p.slug,
          name: p.name,
          price: p.price,
          images: p.images || [],
          category: p.category?.name || 'Uncategorized',
          sku: p.sku || `SKU-${p._id}`,
        })));

      } catch (err) {
        setError('Failed to load product. Please try again.');
        addToast('Error loading product details.', 'error');
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchProductData();
    }
  }, [slug, addToast]);

  return { product, relatedProducts, loading, error };
};

// --- Sub-components for better structure and performance ---

// Memoized Image Gallery Component
const ProductImageGallery = React.memo(({ images, productName }) => {
  const [activeImage, setActiveImage] = React.useState(0);

  if (!images || images.length === 0) {
    return (
      <div className="aspect-square bg-slate-100 rounded-2xl flex items-center justify-center">
        <p className="text-slate-500">No Image</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative aspect-square bg-slate-50 rounded-2xl overflow-hidden shadow-sm">
        <AnimatePresence mode="wait">
          <motion.img
            key={activeImage}
            src={images[activeImage].url}
            alt={images[activeImage].alt || productName}
            initial={{ opacity: 0.5, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0.5, scale: 0.98 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="w-full h-full object-cover"
          />
        </AnimatePresence>
      </div>
      <div className="grid grid-cols-4 gap-3">
        {images.map((image, index) => (
          <motion.button
            key={index}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveImage(index)}
            className={`aspect-square bg-slate-50 rounded-xl overflow-hidden ring-2 ring-offset-2 transition-all duration-200 ${
              activeImage === index ? 'ring-slate-900' : 'ring-transparent hover:ring-slate-200'
            }`}
          >
            <img
              src={image.url}
              alt={image.alt || `${productName} view ${index + 1}`}
              className="w-full h-full object-cover"
            />
          </motion.button>
        ))}
      </div>
    </div>
  );
});

// Memoized Product Information & Actions Component
const ProductInfoPanel = React.memo(({ product }) => {
  const { addToCart } = useCart();
  const { addToast } = useToast();
  const [quantity, setQuantity] = React.useState(1);
  const [isWishlisted, setIsWishlisted] = React.useState(false);
  const [selectedTab, setSelectedTab] = React.useState('description');

  const handleQuantityChange = (amount) => {
    const newQuantity = quantity + amount;
    if (newQuantity > 0 && newQuantity <= (product.stockQuantity || 1)) {
      setQuantity(newQuantity);
    }
  };

  const toggleWishlist = () => {
    setIsWishlisted(!isWishlisted);
    addToast(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist', 'success');
  };

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images?.[0]?.url || '',
      category: product.category,
      slug: product.slug,
      sku: product.sku,
    }, quantity);
  };
  
  const tabs = ['description', 'details', 'reviews'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-3">
        <h1 className="font-heading text-3xl lg:text-4xl text-slate-900 leading-tight">{product.name}</h1>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <p className="text-3xl font-light text-slate-800">{formatPrice(product.price)}</p>
          <span className={`px-3 py-1 text-xs font-semibold rounded-full uppercase tracking-wide ${product.stockQuantity > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
            {product.stockQuantity > 0 ? 'In Stock' : 'Out of Stock'}
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <div className="flex">
            {[...Array(5)].map((_, i) => <Star key={i} size={16} className={i < Math.round(product.averageRating) ? 'text-amber-400 fill-amber-400' : 'text-slate-300'} />)}
          </div>
          <span>{product.averageRating.toFixed(1)} ({product.numReviews} reviews)</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <nav className="flex gap-6 -mb-px">
          {tabs.map((tab) => (
            <button key={tab} onClick={() => setSelectedTab(tab)} className="py-3 text-sm font-medium capitalize relative transition-colors">
              <span className={selectedTab === tab ? 'text-slate-900' : 'text-slate-500 hover:text-slate-700'}>{tab}</span>
              {selectedTab === tab && <motion.div className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-900" layoutId="underline" />}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div key={selectedTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
            {selectedTab === 'description' && <div className="prose prose-sm max-w-none text-slate-600 leading-relaxed"><p>{product.description}</p></div>}
            {selectedTab === 'details' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 text-sm">
                <div className="space-y-2">
                    <h4 className="font-medium text-slate-800 mb-1">Scent Notes</h4>
                    <p><strong className="font-medium text-slate-600">Top:</strong> {product.scentNotes.top.join(', ') || 'N/A'}</p>
                    <p><strong className="font-medium text-slate-600">Middle:</strong> {product.scentNotes.middle.join(', ') || 'N/A'}</p>
                    <p><strong className="font-medium text-slate-600">Base:</strong> {product.scentNotes.base.join(', ') || 'N/A'}</p>
                </div>
                <div className="space-y-2">
                     <h4 className="font-medium text-slate-800 mb-1">Product Info</h4>
                     <p><strong className="font-medium text-slate-600">Category:</strong> {product.category}</p>
                     <p><strong className="font-medium text-slate-600">Stock:</strong> {product.stockQuantity} units</p>
                     <p><strong className="font-medium text-slate-600">SKU:</strong> {product.sku}</p>
                </div>
              </div>
            )}
            {selectedTab === 'reviews' && <div className="text-sm text-slate-500">No reviews yet. Be the first to share your thoughts!</div>}
        </motion.div>
      </AnimatePresence>

      {/* Purchase Section */}
      <div className="space-y-5 pt-5 border-t border-slate-200">
        <div className="flex items-center gap-4">
          <div className="flex items-center border border-slate-200 rounded-full">
            <button onClick={() => handleQuantityChange(-1)} disabled={quantity <= 1} className="p-3 text-slate-500 disabled:text-slate-300 hover:bg-slate-100 rounded-l-full transition-colors"><Minus size={16} /></button>
            <span className="w-12 text-center text-sm font-medium text-slate-800">{quantity}</span>
            <button onClick={() => handleQuantityChange(1)} disabled={quantity >= product.stockQuantity} className="p-3 text-slate-500 disabled:text-slate-300 hover:bg-slate-100 rounded-r-full transition-colors"><Plus size={16} /></button>
          </div>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-grow">
            <Button className="w-full py-3.5 text-base font-medium rounded-full" onClick={handleAddToCart} disabled={product.stockQuantity === 0}>
              <ShoppingBag size={20} className="mr-2" />
              <span>Add to Cart &bull; {formatPrice(product.price * quantity)}</span>
            </Button>
          </motion.div>
        </div>
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
                <button onClick={toggleWishlist} className={`p-2.5 rounded-full transition-all duration-200 ${isWishlisted ? 'bg-red-100 text-red-500' : 'bg-slate-100 hover:bg-slate-200 text-slate-500'}`} aria-label="Add to Wishlist">
                    <Heart size={18} className={isWishlisted ? 'fill-current' : ''} />
                </button>
                <button className="p-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors" aria-label="Share">
                    <Share2 size={18} />
                </button>
            </div>
            {/* Trust Indicators */}
            <div className="flex items-center gap-4 text-xs text-slate-500">
                <div className="flex items-center gap-1.5"><Truck size={16} /><span className="hidden sm:inline">Free Shipping</span></div>
                <div className="flex items-center gap-1.5"><Shield size={16} /><span className="hidden sm:inline">Secure Payment</span></div>
                <div className="flex items-center gap-1.5"><RotateCcw size={16} /><span className="hidden sm:inline">Easy Returns</span></div>
            </div>
        </div>
      </div>
    </div>
  );
});

// Skeleton Loader Component
const ProductPageSkeleton = () => (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 animate-pulse">
      <div className="h-5 w-32 bg-slate-200 rounded-md mb-8"></div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
        {/* Image Skeleton */}
        <div className="space-y-4">
          <div className="aspect-square bg-slate-200 rounded-2xl"></div>
          <div className="grid grid-cols-4 gap-3">
            <div className="aspect-square bg-slate-200 rounded-xl"></div>
            <div className="aspect-square bg-slate-200 rounded-xl"></div>
            <div className="aspect-square bg-slate-200 rounded-xl"></div>
            <div className="aspect-square bg-slate-200 rounded-xl"></div>
          </div>
        </div>
        {/* Info Skeleton */}
        <div className="space-y-6">
          <div className="h-10 w-3/4 bg-slate-200 rounded-lg"></div>
          <div className="h-8 w-1/3 bg-slate-200 rounded-lg"></div>
          <div className="h-5 w-1/2 bg-slate-200 rounded-md"></div>
          <div className="h-px bg-slate-200 my-6"></div>
          <div className="h-5 w-full bg-slate-200 rounded-md"></div>
          <div className="h-5 w-5/6 bg-slate-200 rounded-md"></div>
          <div className="h-5 w-3/4 bg-slate-200 rounded-md"></div>
          <div className="pt-6 border-t border-slate-200 mt-6">
             <div className="h-12 w-full bg-slate-200 rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );

// Main Page Component
const ProductDetailPage = () => {
  const { slug } = useParams();
  const { product, relatedProducts, loading, error } = useProductDetail(slug);

  if (loading) return <ProductPageSkeleton />;

  if (error || !product) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-slate-50 p-4">
        <div className="text-center space-y-4">
          <ShoppingBag size={40} className="mx-auto text-slate-400" />
          <h2 className="font-heading text-2xl text-slate-800">Product Not Found</h2>
          <p className="text-slate-500 max-w-sm">{error || "The product you're looking for might have been moved or doesn't exist."}</p>
          <Button asChild>
            <Link to="/shop">Continue Shopping</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white">
      <Helmet>
        <title>{`${product.name} | Scenture Lagos`}</title>
        <meta name="description" content={product.description.substring(0, 160)} />
      </Helmet>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <Link to="/shop" className="inline-flex items-center text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors group">
            <ArrowLeft size={16} className="mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Shop
          </Link>
        </motion.div>

        <motion.div 
          initial="hidden" 
          animate="visible" 
          variants={{ visible: { transition: { staggerChildren: 0.1 } } }} 
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 mb-20"
        >
          <motion.div variants={{ hidden: { opacity: 0, x: -20 }, visible: { opacity: 1, x: 0 } }}>
            <ProductImageGallery images={product.images} productName={product.name} />
          </motion.div>
          <motion.div variants={{ hidden: { opacity: 0, x: 20 }, visible: { opacity: 1, x: 0 } }}>
            <ProductInfoPanel product={product} />
          </motion.div>
        </motion.div>

        {relatedProducts.length > 0 && (
          <motion.section initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true, amount: 0.2 }} className="space-y-8">
            <div>
              <h2 className="font-heading text-3xl text-slate-900">You Might Also Like</h2>
              <p className="text-slate-500 mt-1">Discover complementary scents and products.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </motion.section>
        )}
      </div>
    </div>
  );
};

export default ProductDetailPage;