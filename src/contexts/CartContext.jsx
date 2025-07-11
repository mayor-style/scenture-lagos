import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import CartService from '../services/cart.service';
import { useAuth } from './AuthContext';
import { toast } from 'react-hot-toast';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
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
        setCart(cartData);
      } else {
        const localCart = localStorage.getItem('cart');
        if (localCart) {
          setCart(JSON.parse(localCart));
        } else {
          setCart({
            items: [],
            totalItems: 0,
            subtotal: 0,
            discount: 0,
            total: 0,
            coupon: null
          });
        }
      }
    } catch (err) {
      console.error('Error initializing cart:', err);
      setError('Failed to load cart. Please try again.');
      setCart({
        items: [],
        totalItems: 0,
        subtotal: 0,
        discount: 0,
        total: 0,
        coupon: null
      });
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

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
      if (isAuthenticated) {
        const cartData = await CartService.addToCart({
          productId: product.id,
          quantity,
          variantId
        });
        setCart(cartData);
      } else {
        const cartItem = {
          id: `${product.id}${variantId ? `-${variantId}` : ''}`,
          product: {
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image || (product.images && product.images.length > 0 ? product.images[0] : null),
            category: product.category || 'Unknown',
          },
          quantity,
          variantId,
          price: product.price,
          subtotal: product.price * quantity
        };

        const existingItemIndex = cart.items.findIndex(
          item => item.product.id === product.id && item.variantId === variantId
        );

        let updatedItems;
        if (existingItemIndex >= 0) {
          updatedItems = [...cart.items];
          updatedItems[existingItemIndex].quantity += quantity;
          updatedItems[existingItemIndex].subtotal = 
            updatedItems[existingItemIndex].price * updatedItems[existingItemIndex].quantity;
        } else {
          updatedItems = [...cart.items, cartItem];
        }

        const totalItems = updatedItems.reduce((sum, item) => sum + item.quantity, 0);
        const subtotal = updatedItems.reduce((sum, item) => sum + item.subtotal, 0);
        const total = subtotal - (cart.discount || 0);

        setCart({
          ...cart,
          items: updatedItems,
          totalItems,
          subtotal,
          total
        });
      }
    } catch (err) {
      console.error('Error adding to cart:', err);
      setError('Failed to add item to cart. Please try again.');
      toast.error('Failed to add item to cart');
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
      if (isAuthenticated) {
        const cartData = await CartService.updateCartItem(itemId, { quantity });
        setCart(cartData);
      } else {
        const updatedItems = cart.items.map(item => {
          if (item.id === itemId) {
            return {
              ...item,
              quantity,
              subtotal: item.price * quantity
            };
          }
          return item;
        });

        const totalItems = updatedItems.reduce((sum, item) => sum + item.quantity, 0);
        const subtotal = updatedItems.reduce((sum, item) => sum + item.subtotal, 0);
        const total = subtotal - (cart.discount || 0);

        setCart({
          ...cart,
          items: updatedItems,
          totalItems,
          subtotal,
          total
        });
      }
    } catch (err) {
      console.error('Error updating cart item:', err);
      setError('Failed to update cart. Please try again.');
      toast.error('Failed to update cart');
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (itemId) => {
    setLoading(true);
    setError(null);
    
    try {
      if (isAuthenticated) {
        const cartData = await CartService.removeFromCart(itemId);
        setCart(cartData);
      } else {
        const updatedItems = cart.items.filter(item => item.id !== itemId);

        const totalItems = updatedItems.reduce((sum, item) => sum + item.quantity, 0);
        const subtotal = updatedItems.reduce((sum, item) => sum + item.subtotal, 0);
        const total = subtotal - (cart.discount || 0);

        setCart({
          ...cart,
          items: updatedItems,
          totalItems,
          subtotal,
          total
        });
      }
      
      toast.success('Item removed from cart');
    } catch (err) {
      console.error('Error removing from cart:', err);
      setError('Failed to remove item from cart. Please try again.');
      toast.error('Failed to remove item from cart');
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    setLoading(true);
    setError(null);
    
    try {
      if (isAuthenticated) {
        await CartService.clearCart();
      }
      
      setCart({
        items: [],
        totalItems: 0,
        subtotal: 0,
        discount: 0,
        total: 0,
        coupon: null
      });
      
      toast.success('Cart cleared');
    } catch (err) {
      console.error('Error clearing cart:', err);
      setError('Failed to clear cart. Please try again.');
      toast.error('Failed to clear cart');
    } finally {
      setLoading(false);
    }
  };

  const applyCoupon = async (code) => {
    setLoading(true);
    setError(null);
    
    try {
      if (isAuthenticated) {
        const cartData = await CartService.applyCoupon({ code });
        setCart(cartData);
      } else {
        toast.error('Coupon functionality requires login');
        setError('Please log in to apply coupons');
        return;
      }
      
      toast.success('Coupon applied successfully');
    } catch (err) {
      console.error('Error applying coupon:', err);
      setError('Failed to apply coupon. Please check the code and try again.');
      toast.error('Invalid coupon code');
    } finally {
      setLoading(false);
    }
  };

  const removeCoupon = async () => {
    setLoading(true);
    setError(null);
    
    try {
      if (isAuthenticated) {
        const cartData = await CartService.removeCoupon();
        setCart(cartData);
      } else {
        setCart({
          ...cart,
          coupon: null,
          discount: 0,
          total: cart.subtotal
        });
      }
      
      toast.success('Coupon removed');
    } catch (err) {
      console.error('Error removing coupon:', err);
      setError('Failed to remove coupon. Please try again.');
      toast.error('Failed to remove coupon');
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
          productId: item.product.id,
          quantity: item.quantity,
          variantId: item.variantId
        });
      }
      
      const cartData = await CartService.getCart();
      setCart(cartData);
      
      localStorage.removeItem('cart');
      
      toast.success('Cart updated with your items');
    } catch (err) {
      console.error('Error merging carts:', err);
      setError('Failed to update your cart. Please try again.');
      toast.error('Failed to update cart');
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
    initializeCart
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};