import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, Check } from 'lucide-react'; // _RESPONSIVE-UPDATE_: Removed unused icons
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
      <div className="flex items-start justify-center max-w-lg mx-auto"> {/* _RESPONSIVE-UPDATE_: Changed to items-start for better alignment with text */}
        {steps.map((s, index) => (
          <React.Fragment key={s}>
            <div
              className="flex flex-col items-center cursor-pointer text-center" // _RESPONSIVE-UPDATE_: Added text-center
              onClick={() => (isStepDone(s) && s !== 'Complete' ? setStep(s) : null)}
            >
              <div
                className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center border-2 transition-all ${ // _RESPONSIVE-UPDATE_: Smaller circles on mobile
                  isStepDone(s) || isStepCurrent(s) ? 'bg-primary border-primary text-white' : 'border-gray-300 text-gray-400'
                }`}
              >
                {isStepDone(s) ? <Check size={16} /> : <span className="text-sm sm:text-base">{index + 1}</span>} {/* _RESPONSIVE-UPDATE_: Responsive text size */}
              </div>
              <span className={`mt-2 text-xs font-medium w-20 sm:w-auto ${isStepDone(s) || isStepCurrent(s) ? 'text-primary' : 'text-gray-400'}`}> {/* _RESPONSIVE-UPDATE_: Adjusted text size and added fixed width on mobile to prevent layout shifts */}
                {s}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div className={`flex-1 h-px mx-1 sm:mx-4 mt-4 sm:mt-5 transition-all ${isStepDone(s) ? 'bg-primary' : 'bg-gray-300'}`} /> // _RESPONSIVE-UPDATE_: Reduced margin, adjusted top margin to align with circles
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
  const { currentUser } = useAuth(); // _RESPONSIVE-UPDATE_: Removed unused variable
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
    }
  }, [location.search]); // _RESPONSIVE-UPDATE_: More specific dependency

  // Redirect if cart is empty, but NOT if we are confirming or verifying an order
  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const isVerifyingPayment = query.has('reference');
    const isFinalStep = formStep === 'Confirmation' || formStep === 'Verifying';

    if (!isFinalStep && !isVerifyingPayment && !isCartLoading && (!cart || cart.items.length === 0)) {
        addToast('Your cart is empty. Please add items before checkout.', 'warning');
        navigate('/cart');
    }
  }, [isCartLoading, cart, navigate, addToast, formStep, location.search]); // _RESPONSIVE-UPDATE_: More specific dependency

  // Fetch shipping and payment methods
  useEffect(() => {
    const fetchData = async () => {
        try {
            const methods = await OrderService.getPaymentMethods();
            setPaymentMethods(methods);
            if (methods.length > 0) {
                setSelectedPaymentMethod(methods[0].name);
            }
        } catch (error) {
            addToast(error.message || 'Failed to fetch payment options.', 'error');
        }
    };
    fetchData();
  }, [addToast]); // _RESPONSIVE-UPDATE_: Added dependency
  
  useEffect(() => {
    const fetchShippingMethods = async (state) => {
        if (!state) return;
        setIsLoadingShipping(true);
        setSelectedShippingMethod(null);
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
  }, [shippingInfo.state, addToast]); // _RESPONSIVE-UPDATE_: Added dependency


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

  const taxRate = 5;
  const taxAmount = useMemo(() => (cart?.subtotal * taxRate) / 100, [cart?.subtotal, taxRate]); // _RESPONSIVE-UPDATE_: Optional chaining for safety
  const totalAmount = useMemo(() => cart?.subtotal + shippingFee + taxAmount, [cart?.subtotal, shippingFee, taxAmount]); // _RESPONSIVE-UPDATE_: Optional chaining for safety

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

      const { order: createdOrder } = await OrderService.createOrder(orderData);
      
      if (!createdOrder) throw new Error('Failed to create order. Please try again.');
      
      setOrder(createdOrder);

      if (selectedPaymentMethod === 'paystack') {
        const paymentResponse = await OrderService.initializePayment(createdOrder._id);
        window.location.href = paymentResponse.authorization_url;
      } else {
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
      navigate(location.pathname, { replace: true });

    } catch (error) {
      addToast(error.message || 'Payment failed. Please try again or use a different method.', 'error');
      setFormStep('Payment');
      navigate(location.pathname, { replace: true });
    }
  };


  // --- Render Logic ---

  if (isCartLoading) return <LoadingSpinner />;
  if (formStep === 'Verifying') return <LoadingSpinner text="Verifying your payment, please wait..." />;
  
  const renderShippingForm = () => (
    <form onSubmit={handleFormSubmit} className="space-y-6">
        <h2 className="text-xl sm:text-2xl font-bold text-secondary">Shipping Information</h2> {/* _RESPONSIVE-UPDATE_: Responsive heading */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
                <label htmlFor="firstName" className="block text-sm font-semibold text-secondary mb-1">First Name</label>
                <input type="text" id="firstName" name="firstName" value={shippingInfo.firstName} onChange={handleInputChange} required className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
            <div>
                <label htmlFor="lastName" className="block text-sm font-semibold text-secondary mb-1">Last Name</label>
                <input type="text" id="lastName" name="lastName" value={shippingInfo.lastName} onChange={handleInputChange} required className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
        </div>
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
                <select id="state" name="state" value={shippingInfo.state} onChange={handleInputChange} required className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white"> {/* _RESPONSIVE-UPDATE_: Added bg-white for consistency */}
                    {NIGERIAN_STATES.map(state => <option key={state} value={state}>{state}</option>)}
                </select>
            </div>
        </div>
        <hr/>
        <div className="space-y-4">
            <h3 className="font-semibold text-secondary text-lg sm:text-xl">Shipping Method</h3> {/* _RESPONSIVE-UPDATE_: Responsive heading */}
            {isLoadingShipping ? (
                <div className="text-center p-4">Loading...</div>
            ) : shippingMethods.length > 0 ? (
                shippingMethods.map(method => (
                    <label 
                      key={method.id} 
                      htmlFor={method.id}
                      className={`border rounded-xl p-3 sm:p-4 cursor-pointer transition-all ${selectedShippingMethod === method.id ? 'border-primary bg-primary/5' : 'border-gray-200'}`} // _RESPONSIVE-UPDATE_: Responsive padding
                    >
                        <div className="flex items-center gap-2 sm:gap-0"> {/* _RESPONSIVE-UPDATE_: Added gap for mobile */}
                             <input 
                                type="radio" 
                                id={method.id} 
                                name="shippingMethod" 
                                value={method.id} 
                                checked={selectedShippingMethod === method.id} 
                                onChange={() => setSelectedShippingMethod(method.id)}
                                className="h-4 w-4 text-primary focus:ring-primary"
                              />
                            <div className="ml-3 flex-grow">
                                <span className="font-medium text-secondary text-sm sm:text-base">{method.name}</span> {/* _RESPONSIVE-UPDATE_: Responsive text */}
                                <p className="text-xs sm:text-sm text-secondary/60">{method.description}</p> {/* _RESPONSIVE-UPDATE_: Responsive text */}
                            </div>
                            <span className="font-semibold text-secondary text-sm sm:text-base">{formatPrice(method.price)}</span> {/* _RESPONSIVE-UPDATE_: Responsive text */}
                        </div>
                    </label>
                ))
            ) : (
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm text-yellow-800">No shipping methods are available for the selected state.</div>
            )}
        </div>
        <Button type="submit" className="w-full h-12 text-sm sm:text-base" disabled={isProcessing || isLoadingShipping || !selectedShippingMethod}> {/* _RESPONSIVE-UPDATE_: Responsive text */}
            {isProcessing ? 'Processing...' : 'Continue to Payment'}
        </Button>
    </form>
  );

  const renderPaymentForm = () => (
    <form onSubmit={handleFormSubmit} className="space-y-6">
        <div className="border border-gray-200 rounded-xl p-4">
            <div className="flex justify-between items-center">
                <h3 className="font-semibold text-secondary text-base sm:text-lg">Ship To</h3> {/* _RESPONSIVE-UPDATE_: Responsive heading */}
                <Button variant="link" size="sm" onClick={() => setFormStep('Shipping')}>Change</Button>
            </div>
            <div className="text-sm text-secondary/80 mt-2 space-y-1"> {/* _RESPONSIVE-UPDATE_: Added space-y for better readability */}
                <p>{shippingInfo.firstName} {shippingInfo.lastName}</p>
                <p>{shippingInfo.address}, {shippingInfo.city}, {shippingInfo.state}</p>
                <p>{shippingInfo.email}</p>
            </div>
        </div>
        <hr/>
        <div className="space-y-4">
            <h3 className="font-semibold text-secondary text-lg sm:text-xl">Payment Method</h3> {/* _RESPONSIVE-UPDATE_: Responsive heading */}
            {paymentMethods.length > 0 ? paymentMethods.map(method => (
                <label key={method.id} htmlFor={method.id} className={`border rounded-xl p-3 sm:p-4 cursor-pointer transition-all ${selectedPaymentMethod === method.name ? 'border-primary bg-primary/5' : 'border-gray-200'}`} > {/* _RESPONSIVE-UPDATE_: Responsive padding */}
                    <div className="flex items-center">
                        <input type="radio" id={method.name} name="paymentMethod" value={method.name} checked={selectedPaymentMethod === method.name} onChange={() => setSelectedPaymentMethod(method.name)} className="h-4 w-4 text-primary focus:ring-primary"/> {/* _RESPONSIVE-UPDATE_: Switched to onChange */}
                        <div className="ml-3 flex-grow">
                            <span className="font-medium text-secondary text-sm sm:text-base">{method.displayName}</span> {/* _RESPONSIVE-UPDATE_: Responsive text */}
                            <p className="text-xs sm:text-sm text-secondary/60">{method.description}</p> {/* _RESPONSIVE-UPDATE_: Responsive text */}
                        </div>
                    </div>
                </label>
            )) : <p>No payment methods available.</p>}
        </div>
        <Button type="submit" className="w-full h-12 text-sm sm:text-base" disabled={isProcessing}> {/* _RESPONSIVE-UPDATE_: Responsive text */}
            {isProcessing ? 'Processing...' : `Pay ${formatPrice(totalAmount)}`}
        </Button>
    </form>
  );

  const renderConfirmation = () => (
    <div className="text-center py-8 sm:py-12"> {/* _RESPONSIVE-UPDATE_: Responsive padding */}
      <div className="w-20 h-20 sm:w-24 sm:h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"> {/* _RESPONSIVE-UPDATE_: Responsive icon size */}
          <Check size={40} className="text-green-600" />
      </div>
      <h2 className="font-bold text-2xl sm:text-3xl text-secondary mb-4">Order Confirmed!</h2> {/* _RESPONSIVE-UPDATE_: Responsive heading */}
      <p className="text-secondary/70 max-w-md mx-auto mb-6 text-sm sm:text-base">Thank you for your purchase! A confirmation email has been sent to <span className="font-medium text-secondary">{order?.shippingAddress.email}</span>.</p> {/* _RESPONSIVE-UPDATE_: Responsive text */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 sm:p-6 max-w-md mx-auto mb-8 text-left"> {/* _RESPONSIVE-UPDATE_: Responsive padding */}
          <h3 className="font-semibold text-secondary mb-4 text-base sm:text-lg">Order #{order?.orderNumber}</h3> {/* _RESPONSIVE-UPDATE_: Responsive heading */}
          {order?.items.map(item => (
              <div key={item._id} className="flex justify-between items-center text-sm py-2 border-b">
                  <span className="text-secondary/80 pr-2">{item.name} x {item.quantity}</span> {/* _RESPONSIVE-UPDATE_: Added padding right */}
                  <span className="font-medium text-secondary text-right flex-shrink-0">{formatPrice(item.price)}</span> {/* _RESPONSIVE-UPDATE_: Added text-right and shrink */}
              </div>
          ))}
          <div className="space-y-2 pt-4">
              <div className="flex justify-between text-sm"><span className="text-secondary/70">Subtotal</span><span>{formatPrice(order?.subtotal)}</span></div>
              <div className="flex justify-between text-sm"><span className="text-secondary/70">Shipping</span><span>{formatPrice(order?.shippingFee)}</span></div>
              <div className="flex justify-between text-sm"><span className="text-secondary/70">Tax</span><span>{formatPrice(order?.taxAmount)}</span></div>
              <div className="flex justify-between font-bold text-base pt-2 border-t"><span className="text-secondary">Total</span><span>{formatPrice(order?.totalAmount)}</span></div>
          </div>
      </div>
      <div className="flex flex-col sm:flex-row gap-4 justify-center"> {/* _RESPONSIVE-UPDATE_: Stack buttons on mobile */}
          <Button asChild className="text-sm sm:text-base"><Link to="/shop">Continue Shopping</Link></Button> {/* _RESPONSIVE-UPDATE_: Responsive text */}
          <Button asChild variant="outline" className="text-sm sm:text-base"><Link to={`/orders/${order?._id}`}>View Order</Link></Button> {/* _RESPONSIVE-UPDATE_: Responsive text */}
      </div>
    </div>
  );

  const renderOrderSummary = () => (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100/50 sticky top-24">
      <div className="p-4 sm:p-6 border-b"> {/* _RESPONSIVE-UPDATE_: Responsive padding */}
        <h2 className="font-bold text-lg sm:text-xl text-secondary">Order Summary</h2> {/* _RESPONSIVE-UPDATE_: Responsive heading */}
      </div>
      {cart?.items && ( // _RESPONSIVE-UPDATE_: Check if cart.items exists
        <div className="p-4 sm:p-6 space-y-4"> {/* _RESPONSIVE-UPDATE_: Responsive padding */}
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
      )}
      <div className="p-4 sm:p-6 space-y-3 border-t"> {/* _RESPONSIVE-UPDATE_: Responsive padding */}
          <div className="flex justify-between text-sm"><span className="text-secondary/70">Subtotal</span><span className="font-medium text-secondary">{formatPrice(cart?.subtotal)}</span></div> {/* _RESPONSIVE-UPDATE_: Optional chaining */}
          <div className="flex justify-between text-sm"><span className="text-secondary/70">Shipping</span><span className="font-medium text-secondary">{selectedShippingMethod ? formatPrice(shippingFee) : '---'}</span></div>
          <div className="flex justify-between text-sm"><span className="text-secondary/70">Tax ({taxRate}%)</span><span className="font-medium text-secondary">{formatPrice(taxAmount)}</span></div>
          <div className="flex justify-between items-center pt-4 border-t font-bold text-base sm:text-lg"><span className="text-secondary">Total</span><span className="text-secondary">{formatPrice(totalAmount)}</span></div> {/* _RESPONSIVE-UPDATE_: Responsive text */}
      </div>
    </div>
  );

  return (
    <div className="bg-gray-50/30 min-h-screen py-8 sm:py-12"> {/* _RESPONSIVE-UPDATE_: Responsive padding */}
      <div className="container max-w-7xl px-4"> {/* _RESPONSIVE-UPDATE_: Added horizontal padding */}
        <CheckoutProgress step={formStep} setStep={setFormStep} />
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
           <main className={`lg:col-span-3 ${formStep === 'Confirmation' && 'lg:col-span-5'} bg-white rounded-2xl shadow-sm border border-gray-100/50 p-4 sm:p-6`}> {/* _RESPONSIVE-UPDATE_: Responsive padding */}
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