import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trash2, ShoppingBag, ArrowRight, Plus, Minus } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { formatPrice } from '../lib/utils';

const CartPage = () => {
  // Mock cart data (in a real app, this would come from context or state management)
  const [cartItems, setCartItems] = useState([
    {
      id: '1',
      name: 'Amber & Lavender Candle',
      price: 32.00,
      image: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80',
      quantity: 2,
      category: 'candles'
    },
    {
      id: '2',
      name: 'Sandalwood Reed Diffuser',
      price: 45.00,
      image: 'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=688&q=80',
      quantity: 1,
      category: 'diffusers'
    },
  ]);

  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };

  const slideIn = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: "easeOut" } },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1
      }
    }
  };

  // Calculate subtotal
  const subtotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  
  // Shipping cost (free over $100)
  const shipping = subtotal >= 100 ? 0 : 10;
  
  // Total cost
  const total = subtotal + shipping;

  // Update quantity
  const updateQuantity = (id, newQuantity) => {
    if (newQuantity < 1) return;
    
    setCartItems(prevItems => 
      prevItems.map(item => 
        item.id === id ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  // Remove item from cart
  const removeItem = (id) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== id));
  };

  // If cart is empty
  if (cartItems.length === 0) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          className="text-center max-w-sm"
        >
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-24 h-24 bg-gradient-to-br from-primary/10 to-primary/5 rounded-full flex items-center justify-center mx-auto mb-8 border border-primary/10"
          >
            <ShoppingBag size={36} className="text-primary/60" />
          </motion.div>
          <h2 className="font-heading text-3xl mb-4 text-secondary">Your cart is empty</h2>
          <p className="text-secondary/60 mb-10 leading-relaxed">
            Discover our collection of premium products and start building your perfect selection.
          </p>
          <Button asChild size="lg" className="px-8">
            <Link to="/shop" className="inline-flex items-center gap-2">
              Start Shopping
              <ArrowRight size={18} />
            </Link>
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50/30 min-h-screen py-16">
      <div className="container max-w-7xl">
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          className="text-center mb-16"
        >
          <h1 className="font-heading text-4xl md:text-5xl mb-4 text-secondary">
            Shopping Cart
          </h1>
          <p className="text-secondary/60 text-lg max-w-md mx-auto">
            Review your selected items before checkout
          </p>
        </motion.div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-12">
          {/* Cart Items */}
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="xl:col-span-8"
          >
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100/50 overflow-hidden">
              <div className="px-8 py-6 border-b border-gray-100/50 bg-gray-50/50">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="font-heading text-xl text-secondary">Cart Items</h2>
                    <p className="text-sm text-secondary/60 mt-1">{cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}</p>
                  </div>
                  <Link 
                    to="/shop" 
                    className="text-primary hover:text-primary-dark transition-colors text-sm font-medium inline-flex items-center gap-1 group"
                  >
                    Continue Shopping
                    <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              </div>

              {/* Cart Item List */}
              <div className="divide-y divide-gray-100/50">
                {cartItems.map((item, index) => (
                  <motion.div 
                    key={item.id}
                    variants={slideIn}
                    custom={index}
                    className="p-8 hover:bg-gray-50/30 transition-colors group"
                  >
                    <div className="flex flex-col lg:flex-row gap-6">
                      {/* Product Image */}
                      <div className="w-full lg:w-32 h-32 bg-gradient-to-br from-gray-100 to-gray-50 rounded-xl overflow-hidden flex-shrink-0 border border-gray-100/50">
                        <img 
                          src={item.image} 
                          alt={item.name} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>

                      {/* Product Details */}
                      <div className="flex-grow">
                        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
                          <div className="flex-grow">
                            <h3 className="font-medium text-lg text-secondary mb-2">{item.name}</h3>
                            <p className="text-sm text-secondary/60 capitalize bg-gray-100/70 px-3 py-1 rounded-full inline-block">
                              {item.category}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-xl text-secondary">{formatPrice(item.price)}</p>
                            <p className="text-sm text-secondary/60 mt-1">per item</p>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-8 gap-4">
                          {/* Quantity Controls */}
                          <div className="flex items-center bg-gray-50 rounded-xl border border-gray-200/50 overflow-hidden">
                            <button 
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="p-3 hover:bg-gray-100 transition-colors flex items-center justify-center text-secondary/80 hover:text-secondary"
                              disabled={item.quantity <= 1}
                            >
                              <Minus size={16} />
                            </button>
                            <div className="px-6 py-3 min-w-[60px] text-center font-medium text-secondary border-x border-gray-200/50">
                              {item.quantity}
                            </div>
                            <button 
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="p-3 hover:bg-gray-100 transition-colors flex items-center justify-center text-secondary/80 hover:text-secondary"
                            >
                              <Plus size={16} />
                            </button>
                          </div>

                          <div className="flex items-center gap-6">
                            <div className="text-right">
                              <p className="text-sm text-secondary/60">Subtotal</p>
                              <p className="font-semibold text-lg text-secondary">
                                {formatPrice(item.price * item.quantity)}
                              </p>
                            </div>
                            
                            {/* Remove Button */}
                            <button 
                              onClick={() => removeItem(item.id)}
                              className="p-2 text-secondary/40 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all flex items-center justify-center group/remove"
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

          {/* Order Summary */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            className="xl:col-span-4"
          >
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100/50 overflow-hidden sticky top-24">
              <div className="px-8 py-6 border-b border-gray-100/50 bg-gray-50/50">
                <h2 className="font-heading text-xl text-secondary">Order Summary</h2>
              </div>
              
              <div className="p-8 space-y-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-secondary/70">Subtotal</span>
                    <span className="font-medium text-secondary">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-secondary/70">Shipping</span>
                    <span className="font-medium text-secondary">
                      {shipping === 0 ? (
                        <span className="text-green-600 font-medium">Free</span>
                      ) : (
                        formatPrice(shipping)
                      )}
                    </span>
                  </div>
                  {shipping > 0 && (
                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
                      <p className="text-xs text-blue-700">
                        💡 Add {formatPrice(100 - subtotal)} more for free shipping
                      </p>
                    </div>
                  )}
                </div>

                <div className="border-t border-gray-200/50 pt-6">
                  <div className="flex justify-between items-center mb-6">
                    <span className="font-semibold text-lg text-secondary">Total</span>
                    <span className="font-bold text-2xl text-secondary">{formatPrice(total)}</span>
                  </div>

                  <Button asChild className="w-full h-14 text-base font-medium rounded-xl">
                    <Link to="/checkout" className="flex items-center justify-center gap-3">
                      Proceed to Checkout
                      <ArrowRight size={20} />
                    </Link>
                  </Button>
                </div>

                <div className="pt-6 border-t border-gray-200/50">
                  <p className="text-xs text-secondary/60 mb-3 font-medium">Secure Payment Methods</p>
                  <div className="flex gap-2">
                    <div className="w-12 h-8 bg-gradient-to-r from-blue-600 to-blue-700 rounded-md flex items-center justify-center">
                      <span className="text-white text-xs font-bold">VISA</span>
                    </div>
                    <div className="w-12 h-8 bg-gradient-to-r from-red-500 to-yellow-500 rounded-md flex items-center justify-center">
                      <span className="text-white text-xs font-bold">MC</span>
                    </div>
                    <div className="w-12 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-md flex items-center justify-center">
                      <span className="text-white text-xs font-bold">AMEX</span>
                    </div>
                    <div className="w-12 h-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-md flex items-center justify-center">
                      <span className="text-white text-xs font-bold">PP</span>
                    </div>
                  </div>
                  <p className="text-xs text-secondary/50 mt-3">
                    🔒 Your payment information is secure and encrypted
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