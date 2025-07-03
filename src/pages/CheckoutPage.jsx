import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, CreditCard, Check, Shield, Truck, Mail, Phone } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { formatPrice } from '../lib/utils';

const CheckoutPage = () => {
  // Mock cart data (in a real app, this would come from context or state management)
  const [cartItems] = useState([
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

  // Calculate subtotal
  const subtotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  
  // Shipping cost (free over $100)
  const shipping = subtotal >= 100 ? 0 : 10;
  
  // Total cost
  const total = subtotal + shipping;

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

  // Progress indicator
  const renderProgressIndicator = () => (
    <div className="mb-12">
      <div className="flex items-center justify-center space-x-8">
        <div className="flex items-center">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
            formStep === 'shipping' ? 'bg-primary border-primary text-white' : 
            formStep === 'payment' || formStep === 'confirmation' ? 'bg-primary border-primary text-white' : 
            'border-gray-300 text-gray-400'
          }`}>
            {formStep === 'payment' || formStep === 'confirmation' ? <Check size={16} /> : '1'}
          </div>
          <span className={`ml-3 text-sm font-medium ${
            formStep === 'shipping' ? 'text-primary' : 
            formStep === 'payment' || formStep === 'confirmation' ? 'text-green-600' : 
            'text-gray-400'
          }`}>
            Shipping
          </span>
        </div>
        
        <div className={`h-px w-16 transition-all ${
          formStep === 'payment' || formStep === 'confirmation' ? 'bg-primary' : 'bg-gray-300'
        }`} />
        
        <div className="flex items-center">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
            formStep === 'payment' ? 'bg-primary border-primary text-white' : 
            formStep === 'confirmation' ? 'bg-primary border-primary text-white' : 
            'border-gray-300 text-gray-400'
          }`}>
            {formStep === 'confirmation' ? <Check size={16} /> : '2'}
          </div>
          <span className={`ml-3 text-sm font-medium ${
            formStep === 'payment' ? 'text-primary' : 
            formStep === 'confirmation' ? 'text-green-600' : 
            'text-gray-400'
          }`}>
            Payment
          </span>
        </div>
        
        <div className={`h-px w-16 transition-all ${
          formStep === 'confirmation' ? 'bg-primary' : 'bg-gray-300'
        }`} />
        
        <div className="flex items-center">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
            formStep === 'confirmation' ? 'bg-primary border-primary text-white' : 
            'border-gray-300 text-gray-400'
          }`}>
            {formStep === 'confirmation' ? <Check size={16} /> : '3'}
          </div>
          <span className={`ml-3 text-sm font-medium ${
            formStep === 'confirmation' ? 'text-primary' : 'text-gray-400'
          }`}>
            Complete
          </span>
        </div>
      </div>
    </div>
  );

  // Render order summary
  const renderOrderSummary = () => (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100/50 overflow-hidden sticky top-24">
      <div className="px-8 py-6 border-b border-gray-100/50 bg-gray-50/50">
        <h2 className="font-heading text-xl text-secondary">Order Summary</h2>
        <p className="text-sm text-secondary/60 mt-1">{cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}</p>
      </div>
      
      <div className="p-8">
        <div className="space-y-4 mb-6">
          {cartItems.map((item) => (
            <div key={item.id} className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-50 rounded-xl overflow-hidden border border-gray-100/50 flex-shrink-0">
                <img 
                  src={item.image} 
                  alt={item.name} 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-grow">
                <h4 className="font-medium text-sm text-secondary mb-1">{item.name}</h4>
                <p className="text-xs text-secondary/60">Qty: {item.quantity}</p>
              </div>
              <p className="font-semibold text-secondary">{formatPrice(item.price * item.quantity)}</p>
            </div>
          ))}
        </div>

        <div className="space-y-4 pt-4 border-t border-gray-200/50">
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
          <div className="border-t border-gray-200/50 pt-4 flex justify-between items-center">
            <span className="font-semibold text-lg text-secondary">Total</span>
            <span className="font-bold text-2xl text-secondary">{formatPrice(total)}</span>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200/50">
          <div className="flex items-center gap-2 text-xs text-secondary/60 mb-2">
            <Shield size={14} />
            <span>Secure checkout protected by 256-bit SSL</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-secondary/60">
            <Truck size={14} />
            <span>Free returns within 30 days</span>
          </div>
        </div>
      </div>
    </div>
  );

  // Render shipping form
  const renderShippingForm = () => (
    <motion.form 
      onSubmit={handleSubmit} 
      className="space-y-8"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={slideIn} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label htmlFor="firstName" className="block text-sm font-semibold text-secondary">First Name</label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            value={shippingInfo.firstName}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-gray-50/50 hover:bg-white"
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
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-gray-50/50 hover:bg-white"
            placeholder="Enter your last name"
          />
        </div>
      </motion.div>

      <motion.div variants={slideIn} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label htmlFor="email" className="block text-sm font-semibold text-secondary flex items-center gap-2">
            <Mail size={16} />
            Email Address
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={shippingInfo.email}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-gray-50/50 hover:bg-white"
            placeholder="your.email@example.com"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="phone" className="block text-sm font-semibold text-secondary flex items-center gap-2">
            <Phone size={16} />
            Phone Number
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={shippingInfo.phone}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-gray-50/50 hover:bg-white"
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
          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-gray-50/50 hover:bg-white"
          placeholder="123 Main Street, Apt 4B"
        />
      </motion.div>

      <motion.div variants={slideIn} className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="col-span-2 space-y-2">
          <label htmlFor="city" className="block text-sm font-semibold text-secondary">City</label>
          <input
            type="text"
            id="city"
            name="city"
            value={shippingInfo.city}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-gray-50/50 hover:bg-white"
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
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-gray-50/50 hover:bg-white"
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
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-gray-50/50 hover:bg-white"
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
          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-gray-50/50 hover:bg-white"
        >
          <option value="United States">United States</option>
          <option value="Canada">Canada</option>
          <option value="United Kingdom">United Kingdom</option>
          <option value="Australia">Australia</option>
        </select>
      </motion.div>

      <motion.div variants={slideIn} className="pt-6">
        <Button type="submit" className="w-full h-14 text-base font-medium rounded-xl">
          Continue to Payment
        </Button>
      </motion.div>
    </motion.form>
  );

  // Render payment form
  const renderPaymentForm = () => (
    <motion.form 
      onSubmit={handleSubmit} 
      className="space-y-8"
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
          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-gray-50/50 hover:bg-white"
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
            className="w-full px-4 py-3 pl-12 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-gray-50/50 hover:bg-white"
          />
          <CreditCard className="absolute left-4 top-1/2 transform -translate-y-1/2 text-secondary/50" size={20} />
        </div>
      </motion.div>

      <motion.div variants={slideIn} className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <label htmlFor="expiry" className="block text-sm font-semibold text-secondary">Expiry Date</label>
          <input
            type="text"
            id="expiry"
            name="expiry"
            placeholder="MM/YY"
            required
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-gray-50/50 hover:bg-white"
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
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-gray-50/50 hover:bg-white"
          />
        </div>
      </motion.div>

      <motion.div variants={slideIn} className="bg-blue-50 border border-blue-100 rounded-xl p-4">
        <div className="flex items-center gap-3">
          <Shield className="text-blue-600 flex-shrink-0" size={20} />
          <div>
            <h4 className="font-medium text-blue-900 text-sm">Secure Payment</h4>
            <p className="text-blue-700 text-xs mt-1">Your payment information is encrypted and secure</p>
          </div>
        </div>
      </motion.div>

      <motion.div variants={slideIn} className="pt-6 flex flex-col sm:flex-row gap-4">
        <Button 
          type="button" 
          variant="outline" 
          className="sm:flex-1 h-14 text-base font-medium rounded-xl"
          onClick={() => setFormStep('shipping')}
        >
          Back to Shipping
        </Button>
        <Button type="submit" className="sm:flex-1 h-14 text-base font-medium rounded-xl">
          Complete Order
        </Button>
      </motion.div>
    </motion.form>
  );

  // Render confirmation
  const renderConfirmation = () => (
    <motion.div 
      className="text-center py-16"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <motion.div 
        className="w-24 h-24 bg-gradient-to-br from-green-100 to-green-50 rounded-full flex items-center justify-center mx-auto mb-8 border-4 border-green-200"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
      >
        <Check size={40} className="text-green-600" />
      </motion.div>
      
      <motion.h2 
        className="font-heading text-4xl mb-4 text-secondary"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        Order Confirmed!
      </motion.h2>
      
      <motion.p 
        className="text-secondary/70 text-lg mb-6 max-w-md mx-auto leading-relaxed"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        Thank you for your purchase. Your order has been successfully placed and is being processed.
      </motion.p>
      
      <motion.div 
        className="bg-gray-50 border border-gray-200 rounded-xl p-6 max-w-md mx-auto mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <h3 className="font-semibold text-secondary mb-2">Order Details</h3>
        <p className="text-secondary/70 text-sm mb-1">Order Number: <span className="font-mono text-primary">#SCN{Math.floor(100000 + Math.random() * 900000)}</span></p>
        <p className="text-secondary/70 text-sm mb-1">Total: <span className="font-semibold">{formatPrice(total)}</span></p>
        <p className="text-secondary/70 text-sm">A confirmation email has been sent to your inbox</p>
      </motion.div>
      
      <motion.div 
        className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Button asChild variant="outline" className="px-8">
          <Link to="/orders">View Order Status</Link>
        </Button>
        <Button asChild className="px-8">
          <Link to="/shop">Continue Shopping</Link>
        </Button>
      </motion.div>
    </motion.div>
  );

  return (
    <div className="bg-gray-50/30 min-h-screen py-16">
      <div className="container max-w-7xl">
        {/* Breadcrumb */}
        {formStep !== 'confirmation' && (
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            className="mb-8"
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
              <div className="text-center mb-12">
                <h1 className="font-heading text-4xl md:text-5xl mb-4 text-secondary">
                  Secure Checkout
                </h1>
                <p className="text-secondary/60 text-lg max-w-md mx-auto">
                  Complete your purchase with confidence
                </p>
              </div>

              {renderProgressIndicator()}

              <div className="grid grid-cols-1 xl:grid-cols-12 gap-12">
                {/* Form */}
                <div className="xl:col-span-8">
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100/50 overflow-hidden">
                    <div className="px-8 py-6 border-b border-gray-100/50 bg-gray-50/50">
                      <h2 className="font-heading text-xl text-secondary">
                        {formStep === 'shipping' ? 'Shipping Information' : 'Payment Details'}
                      </h2>
                      <p className="text-sm text-secondary/60 mt-1">
                        {formStep === 'shipping' ? 'Where should we send your order?' : 'How would you like to pay?'}
                      </p>
                    </div>
                    <div className="p-8">
                      {formStep === 'shipping' ? renderShippingForm() : renderPaymentForm()}
                    </div>
                  </div>
                </div>

                {/* Order Summary */}
                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={fadeIn}
                  className="xl:col-span-4"
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