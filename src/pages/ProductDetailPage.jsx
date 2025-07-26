import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ShoppingBag, Heart, Share2, Star, Minus, Plus, Truck, Shield, RotateCcw, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '../components/ui/Button';
import ProductCard from '../components/product/ProductCard';
import { formatPrice } from '../lib/utils';
import { Helmet } from 'react-helmet-async';
import { useCart } from '../contexts/CartContext';
import ProductService from '../services/product.service';

// Custom Hook using TanStack Query for data fetching
const useProductDetail = (slug) => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['product', slug],
    queryFn: () => ProductService.getProduct(slug),
    enabled: !!slug, // Only run the query if the slug exists
    staleTime: 1000 * 60 * 5, // Cache data for 5 minutes
  });

  return {
    product: data?.product,
    relatedProducts: data?.relatedProducts || [],
    isLoading,
    isError,
    error,
  };
};

// --- Sub-components for better structure and performance ---

const ProductImageGallery = React.memo(({ images = [], productName }) => {
  const [activeImage, setActiveImage] = useState(0);

  if (images.length === 0) {
    return <div className="aspect-square bg-slate-100 rounded-2xl flex items-center justify-center"><p className="text-slate-500">No Image</p></div>;
  }

  return (
    <div className="space-y-4">
      <div className="relative aspect-square bg-slate-50 rounded-2xl overflow-hidden shadow-sm">
        <AnimatePresence mode="wait">
          <motion.img key={activeImage} src={images[activeImage].url} alt={images[activeImage].alt || productName} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="w-full h-full object-cover" />
        </AnimatePresence>
      </div>
      <div className="grid grid-cols-4 gap-3">
        {images.map((image, index) => (
          <motion.button key={image.public_id || index} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setActiveImage(index)} className={`aspect-square bg-slate-50 rounded-xl overflow-hidden ring-2 ring-offset-2 transition-all duration-200 ${activeImage === index ? 'ring-slate-900' : 'ring-transparent hover:ring-slate-300'}`}>
            <img src={image.url} alt={image.alt || `${productName} view ${index + 1}`} className="w-full h-full object-cover" />
          </motion.button>
        ))}
      </div>
    </div>
  );
});

const ProductInfoPanel = React.memo(({ product }) => {
  const { addToCart, isLoading: isAddingToCart } = useCart();
  const [quantity, setQuantity] = useState(1);

  // --- Variant Selection Logic ---
  const defaultVariant = useMemo(() => product.variants?.find(v => v.isDefault) || product.variants?.[0], [product.variants]);
  const [selectedVariantId, setSelectedVariantId] = useState(defaultVariant?._id || null);

  const selectedVariant = useMemo(() => {
    return product.variants?.find(v => v._id === selectedVariantId);
  }, [product.variants, selectedVariantId]);

  const currentPrice = useMemo(() => {
    const basePrice = product.price || 0;
    const adjustment = selectedVariant?.priceAdjustment || 0;
    return basePrice + adjustment;
  }, [product.price, selectedVariant]);

  const currentStock = selectedVariant ? selectedVariant.stockQuantity : product.stockQuantity;
  const isInStock = currentStock > 0;

  const handleQuantityChange = (amount) => {
    const newQuantity = quantity + amount;
    if (newQuantity > 0 && newQuantity <= currentStock) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = () => {
    addToCart({
      productId: product._id,
      quantity,
      variantId: selectedVariantId,
      productName: product.name,
    });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <h1 className="font-heading text-3xl lg:text-4xl text-slate-900 leading-tight">{product.name}</h1>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <p className="text-3xl font-light text-slate-800">{formatPrice(currentPrice)}</p>
          <span className={`px-3 py-1 text-xs font-semibold rounded-full uppercase tracking-wide ${isInStock ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
            {isInStock ? 'In Stock' : 'Out of Stock'}
          </span>
        </div>
        {/* Rating component can be added here */}
      </div>

      {/* Variant Selector */}
      {product.variants && product.variants.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-slate-800">Size: <span className="text-slate-600 font-normal">{selectedVariant?.size}</span></h3>
          <div className="flex flex-wrap gap-3">
            {product.variants.map(variant => (
              <Button key={variant._id} variant={selectedVariantId === variant._id ? 'default' : 'outline'} onClick={() => setSelectedVariantId(variant._id)} disabled={variant.stockQuantity === 0} className="rounded-full">
                {variant.size}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Description can be here */}
      <div className="prose prose-sm max-w-none text-slate-600 leading-relaxed"><p>{product.description}</p></div>

      <div className="space-y-5 pt-5 border-t border-slate-200">
        <div className="flex items-center gap-4">
          <div className="flex items-center border border-slate-200 rounded-full">
            <button onClick={() => handleQuantityChange(-1)} disabled={quantity <= 1} className="p-3 text-slate-500 disabled:text-slate-300 hover:bg-slate-100 rounded-l-full transition-colors"><Minus size={16} /></button>
            <span className="w-12 text-center text-sm font-medium text-slate-800">{quantity}</span>
            <button onClick={() => handleQuantityChange(1)} disabled={quantity >= currentStock} className="p-3 text-slate-500 disabled:text-slate-300 hover:bg-slate-100 rounded-r-full transition-colors"><Plus size={16} /></button>
          </div>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-grow">
            <Button className="w-full py-3.5 text-base font-medium rounded-full" onClick={handleAddToCart} disabled={!isInStock || isAddingToCart}>
              {isAddingToCart ? <Loader2 size={20} className="mr-2 animate-spin" /> : <ShoppingBag size={20} className="mr-2" />}
              <span>{isInStock ? `Add to Cart • ${formatPrice(currentPrice * quantity)}` : 'Out of Stock'}</span>
            </Button>
          </motion.div>
        </div>
        {/* Other actions like wishlist, share */}
      </div>
    </div>
  );
});

const ProductPageSkeleton = () => (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 animate-pulse">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
        <div className="space-y-4">
          <div className="aspect-square bg-slate-200 rounded-2xl"></div>
          <div className="grid grid-cols-4 gap-3">
            {[...Array(4)].map((_, i) => <div key={i} className="aspect-square bg-slate-200 rounded-xl"></div>)}
          </div>
        </div>
        <div className="space-y-6">
          <div className="h-10 w-3/4 bg-slate-200 rounded-lg"></div>
          <div className="h-8 w-1/3 bg-slate-200 rounded-lg"></div>
          <div className="h-5 w-1/2 bg-slate-200 rounded-md"></div>
          <div className="space-y-3 pt-4">
            <div className="h-4 w-1/4 bg-slate-200 rounded-md"></div>
            <div className="flex gap-3"><div className="h-10 w-16 bg-slate-200 rounded-full"></div><div className="h-10 w-16 bg-slate-200 rounded-full"></div></div>
          </div>
          <div className="pt-6 border-t border-slate-200 mt-6"><div className="h-12 w-full bg-slate-200 rounded-full"></div></div>
        </div>
      </div>
    </div>
);

const ProductDetailPage = () => {
  const { slug } = useParams();
  const { product, relatedProducts, isLoading, isError, error } = useProductDetail(slug);

  if (isLoading) return <ProductPageSkeleton />;
  if (isError || !product) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-slate-50 p-4">
        <div className="text-center space-y-4">
          <ShoppingBag size={40} className="mx-auto text-slate-400" />
          <h2 className="font-heading text-2xl text-slate-800">Product Not Found</h2>
          <p className="text-slate-500 max-w-sm">{error?.message || "The product you're looking for might have been moved or doesn't exist."}</p>
          <Button asChild><Link to="/shop">Continue Shopping</Link></Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white">
      <Helmet>
        <title>{`${product.name} | Scenture Lagos`}</title>
        <meta name="description" content={product.description?.substring(0, 160)} />
      </Helmet>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="mb-8">
          <Link to="/shop" className="inline-flex items-center text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors group">
            <ArrowLeft size={16} className="mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Shop
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 mb-20">
          <ProductImageGallery images={product.images} productName={product.name} />
          <ProductInfoPanel product={product} />
        </div>

        {relatedProducts.length > 0 && (
          <section className="space-y-8">
            <div>
              <h2 className="font-heading text-3xl text-slate-900">You Might Also Like</h2>
              <p className="text-slate-500 mt-1">Discover complementary scents and products.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default ProductDetailPage;