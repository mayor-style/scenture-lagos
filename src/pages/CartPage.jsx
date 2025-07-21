import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trash2, ShoppingBag, ArrowRight, Plus, Minus } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { formatPrice } from '../lib/utils';
import { useCart } from '../contexts/CartContext';

const CartPage = () => {
  const { cart, loading, updateCartItem, removeFromCart } = useCart();

  const fadeIn = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] } },
  };

  const slideIn = {
    hidden: { opacity: 0, x: -30 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] } },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.2,
      },
    },
  };

  const scaleIn = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: 'easeOut' } },
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-white">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-2 border-gray-200"></div>
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-primary absolute top-0 left-0"></div>
        </div>
      </div>
    );
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          className="text-center max-w-md"
        >
          <motion.div
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 150, damping: 12 }}
            className="w-32 h-32 bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-primary/10 shadow-lg shadow-primary/5"
          >
            <ShoppingBag size={48} className="text-primary/70" />
          </motion.div>
          <h2 className="font-heading text-3xl sm:text-4xl mb-6 text-secondary bg-gradient-to-r from-secondary to-secondary/80 bg-clip-text">
            Your cart awaits
          </h2>
          <p className="text-secondary/60 mb-12 leading-relaxed text-lg">
            Discover our curated collection of premium products crafted for those who appreciate excellence.
          </p>
          <Button asChild size="lg" className="px-10 py-4 text-base font-medium rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
            <Link to="/shop" className="inline-flex items-center gap-3">
              Explore Collection
              <ArrowRight size={20} />
            </Link>
          </Button>
        </motion.div>
      </div>
    );
  }

  const handleUpdateQuantity = (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    updateCartItem(itemId, newQuantity);
  };

  const handleRemoveItem = (itemId) => {
    removeFromCart(itemId);
  };

  return (
    <div className="bg-gradient-to-br from-gray-50 via-white to-gray-50 min-h-screen">
      <div className="pt-8 sm:pt-12 lg:pt-16 pb-8 sm:pb-12">
        <div className="container max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div initial="hidden" animate="visible" variants={fadeIn} className="text-center">
            <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl mb-4 sm:mb-6 text-secondary bg-gradient-to-r from-secondary via-secondary to-secondary/80 bg-clip-text leading-tight">
              Shopping Cart
            </h1>
            <p className="text-secondary/60 text-base sm:text-lg max-w-md mx-auto leading-relaxed">
              Review your curated selection
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container max-w-7xl px-4 sm:px-6 lg:px-8 pb-16 sm:pb-24">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 sm:gap-8 lg:gap-12">
          <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="xl:col-span-2">
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100/50 overflow-hidden backdrop-blur-sm">
              <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 border-b border-gray-100/50 bg-gradient-to-r from-gray-50/50 to-gray-50/30">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
                  <div>
                    <h2 className="font-heading text-lg sm:text-xl text-secondary">Your Selection</h2>
                    <p className="text-sm text-secondary/60 mt-1">
                      {cart.items.length} {cart.items.length === 1 ? 'item' : 'items'} carefully chosen
                    </p>
                  </div>
                  <Link
                    to="/shop"
                    className="text-primary hover:text-primary-dark transition-colors text-sm font-medium inline-flex items-center gap-2 group bg-primary/5 px-3 py-2 rounded-xl hover:bg-primary/10"
                  >
                    Continue Shopping
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>

              <div className="divide-y divide-gray-100/50">
                {cart.items.map((item, index) => (
                  <motion.div
                    key={item._id}
                    variants={slideIn}
                    custom={index}
                    className="p-4 sm:p-6 lg:p-8 hover:bg-gray-50/30 transition-all duration-300 group"
                  >
                    <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                      <div className="w-full sm:w-24 lg:w-32 h-32 sm:h-24 lg:h-32 bg-gradient-to-br from-gray-100 to-gray-50 rounded-2xl overflow-hidden flex-shrink-0 border border-gray-100/50 shadow-sm">
                        <img
                          src={item.productImage || 'https://via.placeholder.com/300?text=No+Image'}
                          alt={item.productName}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/300?text=No+Image';
                          }}
                        />
                      </div>

                      <div className="flex-grow space-y-4">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                          <div className="flex-grow">
                            <h3 className="font-medium text-base sm:text-lg text-secondary mb-2 leading-tight">
                              <Link to={`/product/${item.productSlug}`}>{item.productName}</Link>
                            </h3>
                            <p className="text-xs sm:text-sm text-secondary/60 capitalize bg-gradient-to-r from-gray-100/70 to-gray-100/50 px-3 py-1.5 rounded-full inline-block font-medium">
                              {item.variant ? `${item.variant.size || ''} ${item.variant.scentIntensity || ''}` : item.category || 'Uncategorized'}
                            </p>
                          </div>
                          <div className="text-left sm:text-right">
                            <p className="font-semibold text-lg sm:text-xl text-secondary">{formatPrice(item.price)}</p>
                            <p className="text-xs sm:text-sm text-secondary/60 mt-1">per item</p>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                          <div className="flex items-center bg-gradient-to-r from-gray-50 to-gray-50/70 rounded-2xl border border-gray-200/50 overflow-hidden shadow-sm">
                            <button
                              onClick={() => handleUpdateQuantity(item._id, item.quantity - 1)}
                              className="p-2.5 sm:p-3 hover:bg-gray-100 transition-colors flex items-center justify-center text-secondary/80 hover:text-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                              disabled={item.quantity <= 1}
                            >
                              <Minus size={16} />
                            </button>
                            <div className="px-4 sm:px-6 py-2.5 sm:py-3 min-w-[60px] text-center font-semibold text-secondary border-x border-gray-200/50 bg-white">
                              {item.quantity}
                            </div>
                            <button
                              onClick={() => handleUpdateQuantity(item._id, item.quantity + 1)}
                              className="p-2.5 sm:p-3 hover:bg-gray-100 transition-colors flex items-center justify-center text-secondary/80 hover:text-secondary"
                            >
                              <Plus size={16} />
                            </button>
                          </div>

                          <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4 sm:gap-6">
                            <div className="text-left sm:text-right">
                              <p className="text-xs sm:text-sm text-secondary/60 font-medium">Subtotal</p>
                              <p className="font-bold text-base sm:text-lg text-secondary">{formatPrice(item.total)}</p>
                            </div>
                            <button
                              onClick={() => handleRemoveItem(item._id)}
                              className="p-2.5 text-secondary/40 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all duration-200 flex items-center justify-center group/remove border border-transparent hover:border-red-100"
                              title="Remove item"
                            >
                              <Trash2 size={18} className="group-hover/remove:scale-110 transition-transform" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          <motion.div initial="hidden" animate="visible" variants={scaleIn} className="xl:col-span-1">
            <div className="bg-white rounded-3xl shadow-lg border border-gray-100/50 overflow-hidden backdrop-blur-sm xl:sticky xl:top-24">
              <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 border-b border-gray-100/50 bg-gradient-to-r from-gray-50/50 to-gray-50/30">
                <h2 className="font-heading text-lg sm:text-xl text-secondary">Order Summary</h2>
              </div>

              <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
                <div className="space-y-4 sm:space-y-5">
                  <div className="flex justify-between items-center py-2">
                    <span className="text-secondary/70 font-medium">Subtotal</span>
                    <span className="font-semibold text-secondary text-lg">{formatPrice(cart.subtotal)}</span>
                  </div>
                  {cart.discount > 0 && (
                    <div className="flex justify-between items-center py-2">
                      <span className="text-secondary/70 font-medium">Discount ({cart.coupon?.code})</span>
                      <span className="font-semibold text-emerald-600">-{formatPrice(cart.discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center py-2">
                    <span className="text-secondary/70 font-medium">Shipping</span>
                    <span className="text-secondary/60 text-sm italic">Calculated at checkout</span>
                  </div>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100/50 rounded-2xl p-4 backdrop-blur-sm"
                  >
                    <p className="text-sm text-blue-700 font-medium">
                      Shipping fee will be calculated during checkout after providing your address.
                    </p>
                  </motion.div>
                </div>

                <div className="border-t border-gray-200/50 pt-6 sm:pt-8">
                  <div className="flex justify-between items-center mb-6 sm:mb-8">
                    <span className="font-bold text-lg sm:text-xl text-secondary">Total</span>
                    <span className="font-bold text-2xl sm:text-3xl text-secondary bg-gradient-to-r from-secondary to-secondary/80 bg-clip-text">
                      {formatPrice(cart.total)}
                    </span>
                  </div>

                  <Button
                    asChild
                    className="w-full h-12 sm:h-14 text-base font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <Link to="/checkout" className="flex items-center justify-center gap-3">
                      Secure Checkout
                      <ArrowRight size={20} />
                    </Link>
                  </Button>
                </div>

                <div className="pt-6 sm:pt-8 border-t border-gray-200/50">
                  <p className="text-xs sm:text-sm text-secondary/60 mb-4 font-semibold">Secure Payment</p>
                  <div className="flex gap-2 sm:gap-3 mb-4">
                    <div className="w-12 sm:w-14 h-8 sm:h-9 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg flex items-center justify-center shadow-sm">
                      <span className="text-white text-xs font-bold">VISA</span>
                    </div>
                    <div className="w-12 sm:w-14 h-8 sm:h-9 bg-gradient-to-r from-red-500 to-yellow-500 rounded-lg flex items-center justify-center shadow-sm">
                      <span className="text-white text-xs font-bold">MC</span>
                    </div>
                    <div className="w-12 sm:w-14 h-8 sm:h-9 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-sm">
                      <span className="text-white text-xs font-bold">AMEX</span>
                    </div>
                    <div className="w-12 sm:w-14 h-8 sm:h-9 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center shadow-sm">
                      <span className="text-white text-xs font-bold">PP</span>
                    </div>
                  </div>
                  <p className="text-xs text-secondary/50 leading-relaxed">
                    🔒 Bank-level encryption protects your payment information
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;