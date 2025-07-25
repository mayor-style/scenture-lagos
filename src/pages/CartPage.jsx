import React from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, ShoppingBag, ArrowRight, Plus, Minus } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { formatPrice } from '../lib/utils';
import { useCart } from '../contexts/CartContext';

// --- Sub-components for better structure and performance ---

// Memoized Cart Item Component
const CartItem = React.memo(({ item, onUpdate, onRemove }) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: -50, transition: { duration: 0.3 } }}
      transition={{ type: 'spring', stiffness: 200, damping: 25 }}
      className="flex flex-col sm:flex-row gap-5 p-5"
    >
      <div className="w-full sm:w-28 h-32 sm:h-28 bg-slate-100 rounded-2xl overflow-hidden flex-shrink-0">
        <img
          src={item.productImage || 'https://via.placeholder.com/150?text=No+Image'}
          alt={item.productName}
          className="w-full h-full object-cover"
          onError={(e) => { e.target.src = 'https://via.placeholder.com/150?text=No+Image'; }}
        />
      </div>
      <div className="flex-grow flex flex-col justify-between gap-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-medium text-slate-800 leading-tight">
              <Link to={`/product/${item.productSlug}`} className="hover:text-primary transition-colors">{item.productName}</Link>
            </h3>
            <p className="text-sm text-slate-500 capitalize">{item.category || 'Uncategorized'}</p>
          </div>
          <p className="font-semibold text-lg text-slate-900">{formatPrice(item.price)}</p>
        </div>
        <div className="flex justify-between items-center">
          <div className="flex items-center border border-slate-200 rounded-full">
            <button onClick={() => onUpdate(item._id, item.quantity - 1)} disabled={item.quantity <= 1} className="p-2 text-slate-500 disabled:text-slate-300 hover:bg-slate-100 rounded-l-full transition-colors"><Minus size={16} /></button>
            <span className="w-10 text-center text-sm font-medium text-slate-800">{item.quantity}</span>
            <button onClick={() => onUpdate(item._id, item.quantity + 1)} className="p-2 text-slate-500 hover:bg-slate-100 rounded-r-full transition-colors"><Plus size={16} /></button>
          </div>
          <button onClick={() => onRemove(item._id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all" title="Remove item">
            <Trash2 size={18} />
          </button>
        </div>
      </div>
    </motion.div>
  );
});

// Memoized Order Summary Component
const OrderSummary = React.memo(({ cart }) => {
  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 xl:sticky xl:top-24">
      <div className="p-6 border-b border-slate-200">
        <h2 className="font-heading text-xl text-slate-900">Order Summary</h2>
      </div>
      <div className="p-6 space-y-4">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between items-center"><span className="text-slate-600">Subtotal</span><span className="font-medium text-slate-800">{formatPrice(cart.subtotal)}</span></div>
          {cart.discount > 0 && <div className="flex justify-between items-center"><span className="text-slate-600">Discount ({cart.coupon?.code})</span><span className="font-medium text-emerald-600">-{formatPrice(cart.discount)}</span></div>}
          <div className="flex justify-between items-center"><span className="text-slate-600">Shipping</span><span className="text-slate-500">Calculated at next step</span></div>
        </div>
        <div className="border-t border-slate-200 pt-4">
          <div className="flex justify-between items-baseline">
            <span className="font-medium text-slate-900">Estimated Total</span>
            <span className="font-semibold text-2xl text-slate-900">{formatPrice(cart.total)}</span>
          </div>
        </div>
      </div>
      <div className="p-6 bg-slate-50/50 rounded-b-3xl">
        <Button asChild size="lg" className="w-full text-base rounded-2xl">
          <Link to="/checkout">
            Proceed to Checkout <ArrowRight size={20} className="ml-2" />
          </Link>
        </Button>
      </div>
    </div>
  );
});

// Empty Cart Component
const EmptyCart = () => (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-5">
        <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto">
          <ShoppingBag size={48} strokeWidth={1.5} className="text-slate-400" />
        </div>
        <h2 className="font-heading text-3xl text-slate-800">Your cart is empty</h2>
        <p className="text-slate-500 max-w-sm">Looks like you haven't added anything to your cart yet. Explore our collections to find something you'll love.</p>
        <Button asChild size="lg" className="rounded-full">
            <Link to="/shop">
              Start Shopping <ArrowRight size={18} className="ml-2" />
            </Link>
        </Button>
      </motion.div>
    </div>
);

// Cart Page Loader
const CartPageLoader = () => (
    <div className="container max-w-7xl px-4 sm:px-6 lg:px-8 py-12 animate-pulse">
        <div className="h-10 w-1/3 bg-slate-200 rounded-lg mx-auto mb-12"></div>
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-12">
            <div className="xl:col-span-2 space-y-4">
                {[...Array(2)].map((_, i) => (
                    <div key={i} className="flex gap-5 p-5 bg-slate-100 rounded-2xl">
                        <div className="w-28 h-28 bg-slate-200 rounded-2xl flex-shrink-0"></div>
                        <div className="flex-grow space-y-4">
                            <div className="h-5 w-3/4 bg-slate-200 rounded-md"></div>
                            <div className="h-4 w-1/4 bg-slate-200 rounded-md"></div>
                            <div className="flex justify-between items-center">
                                <div className="h-10 w-28 bg-slate-200 rounded-full"></div>
                                <div className="h-8 w-8 bg-slate-200 rounded-full"></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <div className="h-80 bg-slate-100 rounded-3xl"></div>
        </div>
    </div>
);


// Main Cart Page Component
const CartPage = () => {
  const { cart, loading, updateCartItem, removeFromCart } = useCart();

  if (loading) return <CartPageLoader />;
  if (!cart || !cart.items || cart.items.length === 0) return <EmptyCart />;

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="container max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10 lg:mb-12">
          <h1 className="font-heading text-4xl lg:text-5xl text-slate-900">Your Cart</h1>
          <p className="text-slate-500 mt-2 text-lg">You have {cart.items.length} {cart.items.length === 1 ? 'item' : 'items'} in your cart.</p>
        </motion.div>
        
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 lg:gap-12">
          <div className="xl:col-span-2 bg-white rounded-3xl shadow-sm border border-slate-100 divide-y divide-slate-100">
             <AnimatePresence>
                {cart.items.map((item) => (
                    <CartItem key={item._id} item={item} onUpdate={updateCartItem} onRemove={removeFromCart} />
                ))}
            </AnimatePresence>
          </div>
          
          <div className="xl:col-span-1">
              <OrderSummary cart={cart} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;