import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, CreditCard, Check, Shield, Truck, Mail, Phone } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { formatPrice } from '../lib/utils';
import { useCart } from '../contexts/CartContext';
import { toast } from 'react-hot-toast';

const CheckoutPage = () => {
  const { cart, loading } = useCart();
  const navigate = useNavigate();

  // Form state
  const [formStep, setFormStep] = useState('shipping');
  
  // Helper function to check form step
  const isFormStep = (step) => formStep === step;
  const [shippingInfo, setShippingInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States',
  });

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
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  };

  // Handle loading state
  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Redirect to cart if cart is empty
  if (!cart || !cart.items || cart.items.length === 0) {
    // Using setTimeout to avoid immediate redirect during render
    setTimeout(() => {
      toast.error("Your cart is empty. Please add items before checkout.");
      navigate('/cart');
    }, 0);
    
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setShippingInfo(prev => ({ ...prev, [name]: value }));
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (formStep === 'shipping') {
      setFormStep('payment');
    } else if (formStep === 'payment') {
      setFormStep('confirmation');
    }
  };

  // Progress indicator - Mobile responsive
  const renderProgressIndicator = () => (
    <div className="mb-8 md:mb-12">
      <div className="flex items-center justify-center space-x-2 sm:space-x-4 md:space-x-8">
        <div className="flex items-center">
          <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center border-2 transition-all ${
            formStep === 'shipping' ? 'bg-primary border-primary text-white' : 
            formStep === 'payment' || formStep === 'confirmation' ? 'bg-primary border-primary text-white' : 
            'border-gray-300 text-gray-400'
          }`}>
            {formStep === 'payment' || formStep === 'confirmation' ? <Check size={14} className="sm:w-4 sm:h-4" /> : <span className="text-xs sm:text-sm">1</span>}
          </div>
          <span className={`ml-2 sm:ml-3 text-xs sm:text-sm font-medium ${
            formStep === 'shipping' ? 'text-primary' : 
            formStep === 'payment' || formStep === 'confirmation' ? 'text-green-600' : 
            'text-gray-400'
          }`}>
            Shipping
          </span>
        </div>
        
        <div className={`h-px w-4 sm:w-8 md:w-16 transition-all ${
          formStep === 'payment' || formStep === 'confirmation' ? 'bg-primary' : 'bg-gray-300'
        }`} />
        
        <div className="flex items-center">
          <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center border-2 transition-all ${
            formStep === 'payment' ? 'bg-primary border-primary text-white' : 
            formStep === 'confirmation' ? 'bg-primary border-primary text-white' : 
            'border-gray-300 text-gray-400'
          }`}>
            {formStep === 'confirmation' ? <Check size={14} className="sm:w-4 sm:h-4" /> : <span className="text-xs sm:text-sm">2</span>}
          </div>
          <span className={`ml-2 sm:ml-3 text-xs sm:text-sm font-medium ${
            formStep === 'payment' ? 'text-primary' : 
            formStep === 'confirmation' ? 'text-green-600' : 
            'text-gray-400'
          }`}>
            Payment
          </span>
        </div>
        
        <div className={`h-px w-4 sm:w-8 md:w-16 transition-all ${
          formStep === 'confirmation' ? 'bg-primary' : 'bg-gray-300'
        }`} />
        
        <div className="flex items-center">
          <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center border-2 transition-all ${
            formStep === 'confirmation' ? 'bg-primary border-primary text-white' : 
            'border-gray-300 text-gray-400'
          }`}>
            {formStep === 'confirmation' ? <Check size={14} className="sm:w-4 sm:h-4" /> : <span className="text-xs sm:text-sm">3</span>}
          </div>
          <span className={`ml-2 sm:ml-3 text-xs sm:text-sm font-medium ${
            formStep === 'confirmation' ? 'text-primary' : 'text-gray-400'
          }`}>
            Complete
          </span>
        </div>
      </div>
    </div>
  );

  // Render order summary - Mobile responsive
  const renderOrderSummary = () => (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100/50 overflow-hidden sticky top-20 sm:top-24">
      <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 border-b border-gray-100/50 bg-gray-50/50">
        <h2 className="font-heading text-lg sm:text-xl text-secondary">Order Summary</h2>
        <p className="text-sm text-secondary/60 mt-1">{cart.items.length} {cart.items.length === 1 ? 'item' : 'items'}</p>
      </div>
      
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
          {cart.items.map((item) => (
            <div key={item.id} className="flex items-center gap-3 sm:gap-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-gray-100 to-gray-50 rounded-xl overflow-hidden border border-gray-100/50 flex-shrink-0">
                <img 
                  src={item.product.image} 
                  alt={item.product.name} 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-grow min-w-0">
                <h4 className="font-medium text-sm text-secondary mb-1 truncate">{item.product.name}</h4>
                <p className="text-xs text-secondary/60">Qty: {item.quantity}</p>
              </div>
              <p className="font-semibold text-secondary text-sm sm:text-base">{formatPrice(item.subtotal)}</p>
            </div>
          ))}
        </div>

        <div className="space-y-3 sm:space-y-4 pt-4 border-t border-gray-200/50">
          <div className="flex justify-between items-center">
            <span className="text-secondary/70 text-sm">Subtotal</span>
            <span className="font-medium text-secondary text-sm sm:text-base">{formatPrice(cart.subtotal)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-secondary/70 text-sm">Shipping</span>
            <span className="font-medium text-secondary text-sm sm:text-base">
              {cart.subtotal >= 100 ? (
                <span className="text-green-600 font-medium">Free</span>
              ) : (
                formatPrice(10)
              )}
            </span>
          </div>
          {cart.subtotal < 100 && (
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
              <p className="text-xs text-blue-700">
                💡 Add {formatPrice(100 - cart.subtotal)} more for free shipping
              </p>
            </div>
          )}
          <div className="border-t border-gray-200/50 pt-3 sm:pt-4 flex justify-between items-center">
            <span className="font-semibold text-base sm:text-lg text-secondary">Total</span>
            <span className="font-bold text-xl sm:text-2xl text-secondary">{formatPrice(cart.subtotal >= 100 ? cart.total : cart.total + 10)}</span>
          </div>
        </div>

        <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-200/50">
          <div className="flex items-center gap-2 text-xs text-secondary/60 mb-2">
            <Shield size={12} className="sm:w-3.5 sm:h-3.5" />
            <span>Secure checkout protected by 256-bit SSL</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-secondary/60">
            <Truck size={12} className="sm:w-3.5 sm:h-3.5" />
            <span>Free returns within 30 days</span>
          </div>
        </div>
      </div>
    </div>
  );

  // Render shipping form - Mobile responsive
  const renderShippingForm = () => (
    <motion.form 
      onSubmit={handleSubmit} 
      className="space-y-6 sm:space-y-8"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={slideIn} className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        <div className="space-y-2">
          <label htmlFor="firstName" className="block text-sm font-semibold text-secondary">First Name</label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            value={shippingInfo.firstName}
            onChange={handleInputChange}
            required
            className="w-full px-3 sm:px-4 py-3 text-sm sm:text-base border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-gray-50/50 hover:bg-white"
            placeholder="Enter your first name"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="lastName" className="block text-sm font-semibold text-secondary">Last Name</label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            value={shippingInfo.lastName}
            onChange={handleInputChange}
            required
            className="w-full px-3 sm:px-4 py-3 text-sm sm:text-base border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-gray-50/50 hover:bg-white"
            placeholder="Enter your last name"
          />
        </div>
      </motion.div>

      <motion.div variants={slideIn} className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        <div className="space-y-2">
          <label htmlFor="email" className="block text-sm font-semibold text-secondary flex items-center gap-2">
            <Mail size={14} className="sm:w-4 sm:h-4" />
            Email Address
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={shippingInfo.email}
            onChange={handleInputChange}
            required
            className="w-full px-3 sm:px-4 py-3 text-sm sm:text-base border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-gray-50/50 hover:bg-white"
            placeholder="your.email@example.com"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="phone" className="block text-sm font-semibold text-secondary flex items-center gap-2">
            <Phone size={14} className="sm:w-4 sm:h-4" />
            Phone Number
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={shippingInfo.phone}
            onChange={handleInputChange}
            required
            className="w-full px-3 sm:px-4 py-3 text-sm sm:text-base border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-gray-50/50 hover:bg-white"
            placeholder="+1 (555) 123-4567"
          />
        </div>
      </motion.div>

      <motion.div variants={slideIn} className="space-y-2">
        <label htmlFor="address" className="block text-sm font-semibold text-secondary">Street Address</label>
        <input
          type="text"
          id="address"
          name="address"
          value={shippingInfo.address}
          onChange={handleInputChange}
          required
          className="w-full px-3 sm:px-4 py-3 text-sm sm:text-base border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-gray-50/50 hover:bg-white"
          placeholder="123 Main Street, Apt 4B"
        />
      </motion.div>

      <motion.div variants={slideIn} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="sm:col-span-2 space-y-2">
          <label htmlFor="city" className="block text-sm font-semibold text-secondary">City</label>
          <input
            type="text"
            id="city"
            name="city"
            value={shippingInfo.city}
            onChange={handleInputChange}
            required
            className="w-full px-3 sm:px-4 py-3 text-sm sm:text-base border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-gray-50/50 hover:bg-white"
            placeholder="New York"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="state" className="block text-sm font-semibold text-secondary">State</label>
          <input
            type="text"
            id="state"
            name="state"
            value={shippingInfo.state}
            onChange={handleInputChange}
            required
            className="w-full px-3 sm:px-4 py-3 text-sm sm:text-base border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-gray-50/50 hover:bg-white"
            placeholder="NY"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="zipCode" className="block text-sm font-semibold text-secondary">ZIP Code</label>
          <input
            type="text"
            id="zipCode"
            name="zipCode"
            value={shippingInfo.zipCode}
            onChange={handleInputChange}
            required
            className="w-full px-3 sm:px-4 py-3 text-sm sm:text-base border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-gray-50/50 hover:bg-white"
            placeholder="10001"
          />
        </div>
      </motion.div>

      <motion.div variants={slideIn} className="space-y-2">
        <label htmlFor="country" className="block text-sm font-semibold text-secondary">Country</label>
        <select
          id="country"
          name="country"
          value={shippingInfo.country}
          onChange={handleInputChange}
          required
          className="w-full px-3 sm:px-4 py-3 text-sm sm:text-base border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-gray-50/50 hover:bg-white"
        >
          <option value="United States">United States</option>
          <option value="Canada">Canada</option>
          <option value="United Kingdom">United Kingdom</option>
          <option value="Australia">Australia</option>
        </select>
      </motion.div>

      <motion.div variants={slideIn} className="pt-4 sm:pt-6">
        <Button type="submit" className="w-full h-12 sm:h-14 text-sm sm:text-base font-medium rounded-xl">
          Continue to Payment
        </Button>
      </motion.div>
    </motion.form>
  );

  // Render payment form - Mobile responsive
  const renderPaymentForm = () => (
    <motion.form 
      onSubmit={handleSubmit} 
      className="space-y-6 sm:space-y-8"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={slideIn} className="space-y-2">
        <label htmlFor="cardName" className="block text-sm font-semibold text-secondary">Name on Card</label>
        <input
          type="text"
          id="cardName"
          name="cardName"
          required
          className="w-full px-3 sm:px-4 py-3 text-sm sm:text-base border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-gray-50/50 hover:bg-white"
          placeholder="John Doe"
        />
      </motion.div>

      <motion.div variants={slideIn} className="space-y-2">
        <label htmlFor="cardNumber" className="block text-sm font-semibold text-secondary">Card Number</label>
        <div className="relative">
          <input
            type="text"
            id="cardNumber"
            name="cardNumber"
            placeholder="1234 5678 9012 3456"
            required
            className="w-full px-3 sm:px-4 py-3 pl-10 sm:pl-12 text-sm sm:text-base border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-gray-50/50 hover:bg-white"
          />
          <CreditCard className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-secondary/50" size={16} />
        </div>
      </motion.div>

      <motion.div variants={slideIn} className="grid grid-cols-2 gap-4 sm:gap-6">
        <div className="space-y-2">
          <label htmlFor="expiry" className="block text-sm font-semibold text-secondary">Expiry Date</label>
          <input
            type="text"
            id="expiry"
            name="expiry"
            placeholder="MM/YY"
            required
            className="w-full px-3 sm:px-4 py-3 text-sm sm:text-base border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-gray-50/50 hover:bg-white"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="cvc" className="block text-sm font-semibold text-secondary">Security Code</label>
          <input
            type="text"
            id="cvc"
            name="cvc"
            placeholder="123"
            required
            className="w-full px-3 sm:px-4 py-3 text-sm sm:text-base border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-gray-50/50 hover:bg-white"
          />
        </div>
      </motion.div>

      <motion.div variants={slideIn} className="bg-blue-50 border border-blue-100 rounded-xl p-3 sm:p-4">
        <div className="flex items-center gap-3">
          <Shield className="text-blue-600 flex-shrink-0" size={18} />
          <div>
            <h4 className="font-medium text-blue-900 text-sm">Secure Payment</h4>
            <p className="text-blue-700 text-xs mt-1">Your payment information is encrypted and secure</p>
          </div>
        </div>
      </motion.div>

      <motion.div variants={slideIn} className="pt-4 sm:pt-6 flex flex-col sm:flex-row gap-3 sm:gap-4">
        <Button 
          type="button" 
          variant="outline" 
          className="w-full sm:flex-1 h-12 sm:h-14 text-sm sm:text-base font-medium rounded-xl"
          onClick={() => setFormStep('shipping')}
        >
          Back to Shipping
        </Button>
        <Button type="submit" className="w-full sm:flex-1 h-12 sm:h-14 text-sm sm:text-base font-medium rounded-xl">
          Complete Order
        </Button>
      </motion.div>
    </motion.form>
  );

  // Render confirmation - Mobile responsive
  const renderConfirmation = () => (
    <motion.div 
      className="text-center py-8 sm:py-12 lg:py-16"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <motion.div 
        className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-green-100 to-green-50 rounded-full flex items-center justify-center mx-auto mb-6 sm:mb-8 border-4 border-green-200"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
      >
        <Check size={32} className="sm:w-10 sm:h-10 text-green-600" />
      </motion.div>
      
      <motion.h2 
        className="font-heading text-2xl sm:text-3xl lg:text-4xl mb-3 sm:mb-4 text-secondary px-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        Order Confirmed!
      </motion.h2>
      
      <motion.p 
        className="text-secondary/70 text-base sm:text-lg mb-6 max-w-md mx-auto leading-relaxed px-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        Thank you for your purchase. Your order has been successfully placed and is being processed.
      </motion.p>
      
      <motion.div 
        className="bg-gray-50 border border-gray-200 rounded-xl p-4 sm:p-6 max-w-md mx-auto mb-6 sm:mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <h3 className="font-semibold text-secondary mb-2">Order Details</h3>
        <p className="text-secondary/70 text-sm mb-1">Order Number: <span className="font-mono text-primary">#SCN{Math.floor(100000 + Math.random() * 900000)}</span></p>
        <p className="text-secondary/70 text-sm mb-1">Total: <span className="font-semibold">{formatPrice(cart.subtotal >= 100 ? cart.total : cart.total + 10)}</span></p>
        <p className="text-secondary/70 text-sm">A confirmation email has been sent to your inbox</p>
      </motion.div>
      
      <motion.div 
        className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center max-w-md mx-auto px-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Button asChild variant="outline" className="w-full sm:w-auto px-6 sm:px-8 h-12">
          <Link to="/orders">View Order Status</Link>
        </Button>
        <Button asChild className="w-full sm:w-auto px-6 sm:px-8 h-12">
          <Link to="/shop">Continue Shopping</Link>
        </Button>
      </motion.div>
    </motion.div>
  );

  return (
    <div className="bg-gray-50/30 min-h-screen py-8 sm:py-12 lg:py-16">
      <div className="container max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        {formStep !== 'confirmation' && (
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            className="mb-6 sm:mb-8"
          >
            <Link to="/cart" className="inline-flex items-center text-secondary/70 hover:text-primary transition-colors group">
              <ArrowLeft size={16} className="mr-2 group-hover:-translate-x-1 transition-transform" />
              Back to Cart
            </Link>
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {formStep === 'confirmation' ? (
            <motion.div
              key="confirmation"
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={fadeIn}
            >
              {renderConfirmation()}
            </motion.div>
          ) : (
            <motion.div
              key="checkout-form"
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={fadeIn}
            >
              <div className="text-center mb-8 sm:mb-12">
                <h1 className="font-heading text-2xl sm:text-3xl md:text-4xl lg:text-5xl mb-3 sm:mb-4 text-secondary px-4">
                  Secure Checkout
                </h1>
                <p className="text-secondary/60 text-base sm:text-lg max-w-md mx-auto px-4">
                  Complete your purchase with confidence
                </p>
              </div>

              {renderProgressIndicator()}

              <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 sm:gap-8 lg:gap-12">
                {/* Form */}
                <div className="xl:col-span-8 order-2 xl:order-1">
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100/50 overflow-hidden">
                    <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 border-b border-gray-100/50 bg-gray-50/50">
                      <h2 className="font-heading text-lg sm:text-xl text-secondary">
                        {formStep === 'shipping' ? 'Shipping Information' : 'Payment Details'}
                      </h2>
                      <p className="text-sm text-secondary/60 mt-1">
                        {formStep === 'shipping' ? 'Where should we send your order?' : 'How would you like to pay?'}
                      </p>
                    </div>
                    <div className="p-4 sm:p-6 lg:p-8">
                      {formStep === 'shipping' ? renderShippingForm() : renderPaymentForm()}
                    </div>
                  </div>
                </div>

                {/* Order Summary */}
                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={fadeIn}
                  className="xl:col-span-4 order-1 xl:order-2"
                >
                  {renderOrderSummary()}
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CheckoutPage;