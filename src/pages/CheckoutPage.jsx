import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, CreditCard, Check, Shield, Truck, Mail, Phone, ShoppingCart } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { formatPrice } from '../lib/utils';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/ui/Toast';
import OrderService from '../services/order.service';
import { NIGERIAN_STATES } from '../lib/locations';

// --- Reusable Child Components for a Cleaner Structure ---

const LoadingSpinner = ({ text }) => (
  <div className="min-h-[70vh] flex flex-col items-center justify-center text-center">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
    {text && <p className="text-secondary/80 font-medium">{text}</p>}
  </div>
);

const CheckoutProgress = ({ step, setStep }) => {
  const steps = ['Shipping', 'Payment', 'Complete'];
  const isStepDone = (s) => steps.indexOf(s) < steps.indexOf(step);
  const isStepCurrent = (s) => s === step;

  return (
    <div className="mb-8 md:mb-12">
      <div className="flex items-center justify-center max-w-lg mx-auto">
        {steps.map((s, index) => (
          <React.Fragment key={s}>
            <div
              className="flex flex-col items-center cursor-pointer"
              onClick={() => (isStepDone(s) && s !== 'Complete' ? setStep(s) : null)}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                  isStepDone(s) || isStepCurrent(s) ? 'bg-primary border-primary text-white' : 'border-gray-300 text-gray-400'
                }`}
              >
                {isStepDone(s) ? <Check size={16} /> : <span>{index + 1}</span>}
              </div>
              <span className={`mt-2 text-xs sm:text-sm font-medium ${isStepDone(s) || isStepCurrent(s) ? 'text-primary' : 'text-gray-400'}`}>
                {s}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div className={`flex-1 h-px mx-4 transition-all ${isStepDone(s) ? 'bg-primary' : 'bg-gray-300'}`} />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

// --- Main Checkout Page Component ---

const CheckoutPage = () => {
  const { cart, loading: isCartLoading, clearCart } = useCart();
  const { currentUser, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { addToast } = useToast();

  const [formStep, setFormStep] = useState('Shipping'); // 'Shipping', 'Payment', 'Confirmation', 'Verifying'
  const [isProcessing, setIsProcessing] = useState(false);
  const [order, setOrder] = useState(null);

  const [shippingInfo, setShippingInfo] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    address: '', city: '', state: 'Lagos', postalCode: '', country: 'Nigeria',
  });

  const [shippingMethods, setShippingMethods] = useState([]);
  const [selectedShippingMethod, setSelectedShippingMethod] = useState(null);
  const [isLoadingShipping, setIsLoadingShipping] = useState(false);

  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');

  // Pre-fill form if user is logged in
  useEffect(() => {
    if (currentUser) {
      setShippingInfo(prev => ({
        ...prev,
        firstName: currentUser.firstName || currentUser.name?.split(' ')[0] || '',
        lastName: currentUser.lastName || currentUser.name?.split(' ').slice(1).join(' ') || '',
        email: currentUser.email || '',
        phone: currentUser.phone || '',
      }));
    }
  }, [currentUser]);
  
  // Handle payment verification on redirect from Paystack
  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const reference = query.get('reference');
    if (reference) {
      setFormStep('Verifying');
      verifyPayment(reference);
      // Clean up URL
      navigate(location.pathname, { replace: true });
    }
  }, [location]);

// Redirect if cart is empty, but NOT if we are confirming or verifying an order
useEffect(() => {
     // Check if a payment verification is in progress by looking for 'reference' in the URL.
    const query = new URLSearchParams(location.search);
    const isVerifyingPayment = query.has('reference');

    // The checkout process is complete or in verification stages.
    const isFinalStep = formStep === 'Confirmation' || formStep === 'Verifying';

    // **CRITICAL FIX**: Do NOT redirect to cart if we are in a final step OR if we are
    // currently verifying a payment (even if the cart is empty).
    if (!isFinalStep && !isVerifyingPayment && !isCartLoading && (!cart || cart.items.length === 0)) {
        addToast('Your cart is empty. Please add items before checkout.', 'warning');
        navigate('/cart');
    }
}, [isCartLoading, cart, navigate, addToast, formStep]);

  // Fetch shipping and payment methods
  useEffect(() => {
    const fetchData = async () => {
        try {
            const methods = await OrderService.getPaymentMethods();
            setPaymentMethods(methods);
            if (methods.length > 0) {
                setSelectedPaymentMethod(methods[0].name); // Select the first available method
            }
        } catch (error) {
            addToast(error.message || 'Failed to fetch payment options.', 'error');
        }
    };
    fetchData();
  }, []);
  
  useEffect(() => {
    const fetchShippingMethods = async (state) => {
        if (!state) return;
        setIsLoadingShipping(true);
        setSelectedShippingMethod(null); // Reset selection
        try {
            const methods = await OrderService.getShippingRates(state);
            setShippingMethods(methods);
            if (methods.length === 0) {
                addToast('No shipping methods available for your location.', 'warning');
            }
        } catch (error) {
            addToast(error.message || 'Failed to fetch shipping methods.', 'error');
            setShippingMethods([]);
        } finally {
            setIsLoadingShipping(false);
        }
    };
    fetchShippingMethods(shippingInfo.state);
  }, [shippingInfo.state]);


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setShippingInfo((prev) => ({ ...prev, [name]: value }));
  };

  const selectedRate = useMemo(() => {
    if (!selectedShippingMethod) return null;
    return shippingMethods.find(m => m.id === selectedShippingMethod);
  }, [selectedShippingMethod, shippingMethods]);

  const shippingFee = useMemo(() => {
    if (!selectedRate || !cart) return 0;
    const isEligibleForFree = selectedRate.freeShippingThreshold && cart.subtotal >= selectedRate.freeShippingThreshold;
    return isEligibleForFree ? 0 : selectedRate.price;
  }, [selectedRate, cart]);

  // Mock tax calculation - in a real app, this should come from settings
  const taxRate = 5; // e.g., 5%
  const taxAmount = useMemo(() => (cart.subtotal * taxRate) / 100, [cart.subtotal, taxRate]);
  const totalAmount = useMemo(() => cart.subtotal + shippingFee + taxAmount, [cart.subtotal, shippingFee, taxAmount]);

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (formStep === 'Shipping') {
        if (!selectedShippingMethod) {
            return addToast('Please select a shipping method.', 'error');
        }
        setFormStep('Payment');
    } else if (formStep === 'Payment') {
        if (!selectedPaymentMethod) {
            return addToast('Please select a payment method.', 'error');
        }
        await createOrderAndPay();
    }
  };

  const createOrderAndPay = async () => {
    setIsProcessing(true);
    try {
      const orderData = {
        items: cart.items.map((item) => ({
          product: item.product,
          quantity: item.quantity,
          variant: item.variant?._id || null,
        })),
        shippingAddress: {
          firstName: shippingInfo.firstName,
          lastName: shippingInfo.lastName,
          email: shippingInfo.email,
          phone: shippingInfo.phone,
          street: shippingInfo.address,
          city: shippingInfo.city,
          state: shippingInfo.state,
          postalCode: shippingInfo.postalCode,
          country: shippingInfo.country,
        },
        paymentMethod: selectedPaymentMethod,
        shippingRateId: selectedShippingMethod,
      };

      console.log('Creating order with data:', orderData);
      const { order: createdOrder } = await OrderService.createOrder(orderData);
      
      if (!createdOrder) throw new Error('Failed to create order. Please try again.');
      
      setOrder(createdOrder);

      if (selectedPaymentMethod === 'paystack') {
        const paymentResponse = await OrderService.initializePayment(createdOrder._id);
        console.log('payment response', paymentResponse)
        window.location.href = paymentResponse.authorization_url;
      } else {
        // Handle other payment methods like Bank Transfer or COD
        setFormStep('Confirmation');
        clearCart();
        addToast('Order placed successfully!', 'success');
      }
    } catch (error) {
      addToast(error.message || 'An error occurred while placing your order.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const verifyPayment = async (reference) => {
    try {
      const { order: verifiedOrder } = await OrderService.verifyPayment(reference);
      if (!verifiedOrder) throw new Error('Invalid payment verification response.');
      
      setOrder(verifiedOrder);
      clearCart();
      setFormStep('Confirmation');
      addToast('Payment successful! Your order has been confirmed.', 'success');
    } catch (error) {
       // 1. Show a specific error message.
      addToast(error.message || 'Payment failed. Please try again or use a different method.', 'error');
      
      // 2. Return the user to the payment step to try again seamlessly.
      setFormStep('Payment');

      // 3. Clean the URL to remove the failed payment reference.
      navigate(location.pathname, { replace: true });
    }
  };


  // --- Render Logic ---

  if (isCartLoading) return <LoadingSpinner />;
  if (formStep === 'Verifying') return <LoadingSpinner text="Verifying your payment, please wait..." />;
  
  const renderShippingForm = () => (
    <form onSubmit={handleFormSubmit} className="space-y-6">
        <h2 className="text-xl font-bold text-secondary">Shipping Information</h2>
        {/* Input fields for shipping info go here... (e.g., first name, address, etc.) */}
        {/* Using a grid layout for better alignment */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* First Name */}
            <div>
                <label htmlFor="firstName" className="block text-sm font-semibold text-secondary mb-1">First Name</label>
                <input type="text" id="firstName" name="firstName" value={shippingInfo.firstName} onChange={handleInputChange} required className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
            {/* Last Name */}
            <div>
                <label htmlFor="lastName" className="block text-sm font-semibold text-secondary mb-1">Last Name</label>
                <input type="text" id="lastName" name="lastName" value={shippingInfo.lastName} onChange={handleInputChange} required className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
        </div>
        {/* Email and Phone */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
                <label htmlFor="email" className="block text-sm font-semibold text-secondary mb-1">Email Address</label>
                <input type="email" id="email" name="email" value={shippingInfo.email} onChange={handleInputChange} required className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
            <div>
                <label htmlFor="phone" className="block text-sm font-semibold text-secondary mb-1">Phone Number</label>
                <input type="tel" id="phone" name="phone" value={shippingInfo.phone} onChange={handleInputChange} required className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
        </div>
        {/* Address and City */}
        <div>
            <label htmlFor="address" className="block text-sm font-semibold text-secondary mb-1">Street Address</label>
            <input type="text" id="address" name="address" value={shippingInfo.address} onChange={handleInputChange} required className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
                <label htmlFor="city" className="block text-sm font-semibold text-secondary mb-1">City</label>
                <input type="text" id="city" name="city" value={shippingInfo.city} onChange={handleInputChange} required className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
            <div>
                <label htmlFor="state" className="block text-sm font-semibold text-secondary mb-1">State</label>
                <select id="state" name="state" value={shippingInfo.state} onChange={handleInputChange} required className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20">
                    {NIGERIAN_STATES.map(state => <option key={state} value={state}>{state}</option>)}
                </select>
            </div>
        </div>
        <hr/>
        {/* Shipping Method Selection */}
        <div className="space-y-4">
            <h3 className="font-semibold text-secondary text-lg">Shipping Method</h3>
            {isLoadingShipping ? (
                <div className="text-center p-4">Loading...</div>
            ) : shippingMethods.length > 0 ? (
                shippingMethods.map(method => (
                  <label 
                    key={method.id} 
                    htmlFor={method.id} // Link label to the input
                    className={`border rounded-xl p-4 cursor-pointer transition-all ${selectedShippingMethod === method.id ? 'border-primary bg-primary/5' : 'border-gray-200'}`}
                  >
                        <div className="flex items-center">
                             <input 
                            type="radio" 
                            id={method.id} 
                            name="shippingMethod" 
                            value={method.id} 
                            checked={selectedShippingMethod === method.id} 
                            onChange={() => setSelectedShippingMethod(method.id)} // Handle change here
                            className="h-4 w-4 text-primary focus:ring-primary"
                          />
                            <div className="ml-3 flex-grow">
                                <span className="font-medium text-secondary">{method.name}</span>
                                <p className="text-sm text-secondary/60">{method.description}</p>
                            </div>
                            <span className="font-semibold text-secondary">{formatPrice(method.price)}</span>
                        </div>
                    </label>
                ))
            ) : (
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm text-yellow-800">No shipping methods are available for the selected state.</div>
            )}
        </div>
        <Button type="submit" className="w-full h-12 text-base" disabled={isProcessing || isLoadingShipping || !selectedShippingMethod}>
            {isProcessing ? 'Processing...' : 'Continue to Payment'}
        </Button>
    </form>
  );

  const renderPaymentForm = () => (
    <form onSubmit={handleFormSubmit} className="space-y-6">
        <div className="border border-gray-200 rounded-xl p-4">
            <div className="flex justify-between items-center">
                <h3 className="font-semibold text-secondary">Ship To</h3>
                <Button variant="link" size="sm" onClick={() => setFormStep('Shipping')}>Change</Button>
            </div>
            <div className="text-sm text-secondary/80 mt-2">
                <p>{shippingInfo.firstName} {shippingInfo.lastName}</p>
                <p>{shippingInfo.address}, {shippingInfo.city}, {shippingInfo.state}</p>
                <p>{shippingInfo.email}</p>
            </div>
        </div>
        <hr/>
        <div className="space-y-4">
            <h3 className="font-semibold text-secondary text-lg">Payment Method</h3>
            {paymentMethods.length > 0 ? paymentMethods.map(method => (
                <label key={method.id} htmlFor={method.id} className={`border rounded-xl p-4 cursor-pointer transition-all ${selectedPaymentMethod === method.name ? 'border-primary bg-primary/5' : 'border-gray-200'}`} >
                    <div className="flex items-center">
                        <input type="radio" id={method.name} name="paymentMethod" value={method.name} checked={selectedPaymentMethod === method.name} onClick={() => setSelectedPaymentMethod(method.name)} className="h-4 w-4 text-primary focus:ring-primary"/>
                        <div className="ml-3 flex-grow">
                            <span className="font-medium text-secondary">{method.displayName}</span>
                            <p className="text-sm text-secondary/60">{method.description}</p>
                        </div>
                    </div>
                </label>
            )) : <p>No payment methods available.</p>}
        </div>
        <Button type="submit" className="w-full h-12 text-base" disabled={isProcessing}>
            {isProcessing ? 'Processing...' : `Pay ${formatPrice(totalAmount)}`}
        </Button>
    </form>
  );

  const renderConfirmation = () => (
    <div className="text-center py-12">
      <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Check size={40} className="text-green-600" />
      </div>
      <h2 className="font-bold text-3xl text-secondary mb-4">Order Confirmed!</h2>
      <p className="text-secondary/70 max-w-md mx-auto mb-6">Thank you for your purchase! A confirmation email has been sent to <span className="font-medium text-secondary">{order?.shippingAddress.email}</span>.</p>
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 max-w-md mx-auto mb-8 text-left">
          <h3 className="font-semibold text-secondary mb-4">Order #{order?.orderNumber}</h3>
          {order?.items.map(item => (
              <div key={item._id} className="flex justify-between items-center text-sm py-2 border-b">
                  <span className="text-secondary/80">{item.name} x {item.quantity}</span>
                  <span className="font-medium text-secondary">{formatPrice(item.price)}</span>
              </div>
          ))}
          <div className="space-y-2 pt-4">
              <div className="flex justify-between text-sm"><span className="text-secondary/70">Subtotal</span><span>{formatPrice(order?.subtotal)}</span></div>
              <div className="flex justify-between text-sm"><span className="text-secondary/70">Shipping</span><span>{formatPrice(order?.shippingFee)}</span></div>
              <div className="flex justify-between text-sm"><span className="text-secondary/70">Tax</span><span>{formatPrice(order?.taxAmount)}</span></div>
              <div className="flex justify-between font-bold text-base pt-2 border-t"><span className="text-secondary">Total</span><span>{formatPrice(order?.totalAmount)}</span></div>
          </div>
      </div>
      <div className="flex gap-4 justify-center">
          <Button asChild><Link to="/shop">Continue Shopping</Link></Button>
          <Button asChild variant="outline"><Link to={`/orders/${order?._id}`}>View Order</Link></Button>
      </div>
    </div>
  );

  const renderOrderSummary = () => (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100/50 sticky top-24">
      <div className="p-6 border-b">
        <h2 className="font-bold text-xl text-secondary">Order Summary</h2>
      </div>
      <div className="p-6 space-y-4">
        {cart.items.map(item => (
            <div key={item._id} className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    <img src={item.productImage} alt={item.productName} className="w-full h-full object-cover"/>
                </div>
                <div className="flex-grow">
                    <h4 className="font-medium text-sm text-secondary">{item.productName}</h4>
                    <p className="text-xs text-secondary/60">Qty: {item.quantity}</p>
                </div>
                <p className="font-semibold text-secondary text-sm">{formatPrice(item.total)}</p>
            </div>
        ))}
      </div>
      <div className="p-6 space-y-3 border-t">
          <div className="flex justify-between text-sm"><span className="text-secondary/70">Subtotal</span><span className="font-medium text-secondary">{formatPrice(cart.subtotal)}</span></div>
          <div className="flex justify-between text-sm"><span className="text-secondary/70">Shipping</span><span className="font-medium text-secondary">{selectedShippingMethod ? formatPrice(shippingFee) : '---'}</span></div>
          <div className="flex justify-between text-sm"><span className="text-secondary/70">Tax ({taxRate}%)</span><span className="font-medium text-secondary">{formatPrice(taxAmount)}</span></div>
          <div className="flex justify-between items-center pt-4 border-t font-bold text-lg"><span className="text-secondary">Total</span><span className="text-secondary">{formatPrice(totalAmount)}</span></div>
      </div>
    </div>
  );

  return (
    <div className="bg-gray-50/30 min-h-screen py-12">
      <div className="container max-w-7xl">
        <CheckoutProgress step={formStep} setStep={setFormStep} />
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Make the main content area full-width on the confirmation screen */}
           <main className={`lg:col-span-3 ${formStep === 'Confirmation' && 'lg:col-span-5'} bg-white rounded-2xl shadow-sm border border-gray-100/50 p-6`}>
                <AnimatePresence mode="wait">
                    <motion.div
                        key={formStep}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.3 }}
                    >
                        {formStep === 'Shipping' && renderShippingForm()}
                        {formStep === 'Payment' && renderPaymentForm()}
                        {formStep === 'Confirmation' && renderConfirmation()}
                    </motion.div>
                </AnimatePresence>
            </main>
          {/* Only show the sidebar if we are NOT on the confirmation step */}
            {formStep !== 'Confirmation' && (
              <aside className="lg:col-span-2">
                {renderOrderSummary()}
              </aside>
            )}
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;