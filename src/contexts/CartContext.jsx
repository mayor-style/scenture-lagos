import React, { createContext, useContext, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import CartService from '../services/cart.service';
import { useAuth } from './AuthContext';
import { useToast } from '../components/ui/Toast';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

// Define a query key to be used by React Query for caching and invalidation
const cartQueryKey = ['cart'];

export const CartProvider = ({ children }) => {
  const queryClient = useQueryClient();
  const { addToast } = useToast();
  const { isAuthenticated } = useAuth();

  // --- QUERIES ---
  // useQuery handles fetching, caching, loading, and error states for us.
  const { data: cart, isLoading, error, isSuccess } = useQuery({
    queryKey: cartQueryKey,
    queryFn: CartService.getCart,
    staleTime: 1000 * 60 * 5, // Cache cart for 5 minutes
    refetchOnWindowFocus: true, // Refetch when user returns to the tab
  });

  // --- MUTATIONS ---
  // useMutation handles the logic for modifying data (POST, PUT, DELETE).
  const { mutate: addToCart } = useMutation({
    mutationFn: (item) => CartService.addToCart(item),
    onSuccess: (updatedCart, variables) => {
      // Instantly update the local cache with the server's response
      queryClient.setQueryData(cartQueryKey, updatedCart);
      addToast(`${variables.productName} added to cart`, 'success');
    },
    onError: (err) => {
      addToast(err.message || 'Failed to add item', 'error');
    },
  });

  const { mutate: updateCartItem } = useMutation({
    mutationFn: ({ itemId, quantity }) => CartService.updateCartItem(itemId, { quantity }),
    onSuccess: (updatedCart) => {
      queryClient.setQueryData(cartQueryKey, updatedCart);
      addToast('Cart updated', 'success');
    },
    onError: (err) => {
      addToast(err.message || 'Failed to update item', 'error');
    },
  });

  const { mutate: removeFromCart } = useMutation({
    mutationFn: (itemId) => CartService.removeFromCart(itemId),
    onSuccess: (updatedCart) => {
      queryClient.setQueryData(cartQueryKey, updatedCart);
      addToast('Item removed from cart', 'success');
    },
    onError: (err) => {
      addToast(err.message || 'Failed to remove item', 'error');
    },
  });

  const { mutate: clearCart } = useMutation({
    mutationFn: CartService.clearCart,
    onSuccess: (updatedCart) => {
      queryClient.setQueryData(cartQueryKey, updatedCart);
      addToast('Cart cleared', 'success');
    },
    onError: (err) => {
      addToast(err.message || 'Failed to clear cart', 'error');
    },
  });

  const { mutate: applyCoupon } = useMutation({
    mutationFn: (code) => CartService.applyCoupon({ code }),
    onSuccess: (updatedCart) => {
      queryClient.setQueryData(cartQueryKey, updatedCart);
      addToast('Coupon applied', 'success');
    },
    onError: (err) => {
      addToast(err.message || 'Invalid coupon code', 'error');
    },
  });

  const { mutate: removeCoupon } = useMutation({
    mutationFn: CartService.removeCoupon,
    onSuccess: (updatedCart) => {
      queryClient.setQueryData(cartQueryKey, updatedCart);
      addToast('Coupon removed', 'success');
    },
    onError: (err) => {
      addToast(err.message || 'Failed to remove coupon', 'error');
    },
  });
  
  // When authentication status changes, invalidate the cart query
  // This will trigger a refetch to get the correct cart (guest or user)
  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: cartQueryKey });
  }, [isAuthenticated, queryClient]);

  // When cart is fetched, check for backend validation messages
  useEffect(() => {
    if (isSuccess && cart) {
      cart.items.forEach(item => {
        if (item.hasPriceChanged) {
          addToast(`Price of ${item.productName} updated`, 'info');
        }
        if (item.quantity > item.availableStock) {
          addToast(`${item.productName} quantity adjusted due to stock`, 'warning');
        }
      });
    }
  }, [cart, isSuccess, addToast]);


  const value = {
    cart: cart || { items: [] }, // Provide a default empty cart structure
    isLoading,
    error: error?.message,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    applyCoupon,
    removeCoupon,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};