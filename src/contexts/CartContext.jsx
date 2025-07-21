import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import CartService from '../services/cart.service';
import { useAuth } from './AuthContext';
import { useToast } from '../components/ui/Toast';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const { addToast } = useToast();
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const initializeCart = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (isAuthenticated) {
        const cartData = await CartService.getCart();
        setCart(cartData || { items: [], totalItems: 0, subtotal: 0, discount: 0, total: 0, coupon: null });
      } else {
        const localCart = localStorage.getItem('cart');
        if (localCart) {
          setCart(JSON.parse(localCart));
        } else {
          const cartData = await CartService.getCart(); // Fetch guest cart from session
          setCart(cartData || { items: [], totalItems: 0, subtotal: 0, discount: 0, total: 0, coupon: null });
        }
      }
    } catch (err) {
      console.error('Error initializing cart:', err);
      setError(err.response?.data?.message || 'Failed to load cart. Please try again.');
      addToast('Failed to load cart', 'error');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, addToast]);

  const saveCartToLocalStorage = useCallback(() => {
    if (!isAuthenticated && cart) {
      localStorage.setItem('cart', JSON.stringify(cart));
    }
  }, [cart, isAuthenticated]);

  useEffect(() => {
    initializeCart();
  }, [initializeCart]);

  useEffect(() => {
    saveCartToLocalStorage();
  }, [saveCartToLocalStorage]);

  const addToCart = async (product, quantity = 1, variantId = null) => {
    setLoading(true);
    setError(null);
    try {
      const updatedCart = await CartService.addToCart({
        productId: product.id,
        quantity,
        variantId,
      });
      setCart(updatedCart);
      if (!isAuthenticated) {
        localStorage.setItem('cart', JSON.stringify(updatedCart));
      }
      await initializeCart(); // Ensure latest state
      console.log('added', product)
      addToast(`${product.name} added to cart`, 'success');
    } catch (err) {
      console.error('Error adding to cart:', err);
      setError(err.response?.data?.message || 'Failed to add item to cart. Please try again.');
      addToast(err.response?.data?.message || 'Failed to add item to cart', 'error');
    } finally {
      setLoading(false);
    }
  };

  const updateCartItem = async (itemId, quantity) => {
    if (quantity < 1) {
      return removeFromCart(itemId);
    }
    setLoading(true);
    setError(null);
    try {
      const updatedCart = await CartService.updateCartItem(itemId, { quantity });
      setCart(updatedCart);
      if (!isAuthenticated) {
        localStorage.setItem('cart', JSON.stringify(updatedCart));
      }
      await initializeCart();
      addToast('Cart updated successfully', 'success');
    } catch (err) {
      console.error('Error updating cart item:', err);
      setError(err.response?.data?.message || 'Failed to update cart. Please try again.');
      addToast(err.response?.data?.message || 'Failed to update cart', 'error');
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (itemId) => {
    setLoading(true);
    setError(null);
    try {
      const updatedCart = await CartService.removeFromCart(itemId);
      setCart(updatedCart);
      if (!isAuthenticated) {
        localStorage.setItem('cart', JSON.stringify(updatedCart));
      }
      await initializeCart();
      addToast('Item removed from cart', 'success');
    } catch (err) {
      console.error('Error removing from cart:', err);
      setError(err.response?.data?.message || 'Failed to remove item from cart. Please try again.');
      addToast(err.response?.data?.message || 'Failed to remove item from cart', 'error');
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    setLoading(true);
    setError(null);
    try {
      const updatedCart = await CartService.clearCart();
      setCart(updatedCart);
      if (!isAuthenticated) {
        localStorage.setItem('cart', JSON.stringify(updatedCart));
      }
      await initializeCart();
      addToast('Cart cleared', 'success');
    } catch (err) {
      console.error('Error clearing cart:', err);
      setError(err.response?.data?.message || 'Failed to clear cart. Please try again.');
      addToast(err.response?.data?.message || 'Failed to clear cart', 'error');
    } finally {
      setLoading(false);
    }
  };

  const applyCoupon = async (code) => {
    setLoading(true);
    setError(null);
    try {
      if (!isAuthenticated) {
        setError('Please log in to apply coupons');
        addToast('Please log in to apply coupons', 'error');
        return;
      }
      const updatedCart = await CartService.applyCoupon({ code });
      setCart(updatedCart);
      await initializeCart();
      addToast('Coupon applied successfully', 'success');
    } catch (err) {
      console.error('Error applying coupon:', err);
      setError(err.response?.data?.message || 'Failed to apply coupon. Please check the code and try again.');
      addToast(err.response?.data?.message || 'Invalid coupon code', 'error');
    } finally {
      setLoading(false);
    }
  };

  const removeCoupon = async () => {
    setLoading(true);
    setError(null);
    try {
      if (!isAuthenticated) {
        setError('Please log in to remove coupons');
        addToast('Please log in to remove coupons', 'error');
        return;
      }
      const updatedCart = await CartService.removeCoupon();
      setCart(updatedCart);
      await initializeCart();
      addToast('Coupon removed', 'success');
    } catch (err) {
      console.error('Error removing coupon:', err);
      setError(err.response?.data?.message || 'Failed to remove coupon. Please try again.');
      addToast(err.response?.data?.message || 'Failed to remove coupon', 'error');
    } finally {
      setLoading(false);
    }
  };

  const mergeWithUserCart = async () => {
    if (!isAuthenticated || !cart || cart.items.length === 0) return;
    setLoading(true);
    setError(null);
    try {
      for (const item of cart.items) {
        await CartService.addToCart({
          productId: item.product,
          quantity: item.quantity,
          variantId: item.variant?._id || null,
        });
      }
      await initializeCart();
      localStorage.removeItem('cart');
      addToast('Cart updated with your items', 'success');
    } catch (err) {
      console.error('Error merging carts:', err);
      setError(err.response?.data?.message || 'Failed to update your cart. Please try again.');
      addToast(err.response?.data?.message || 'Failed to update cart', 'error');
    } finally {
      setLoading(false);
    }
  };

  const value = {
    cart,
    loading,
    error,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    applyCoupon,
    removeCoupon,
    mergeWithUserCart,
    initializeCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};