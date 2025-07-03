import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combines multiple class names into a single string using clsx and tailwind-merge
 * @param {...any} inputs - Class values to be combined
 * @returns {string} Merged class string
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a price value to a currency string
 * @param {number} price - The price value to format
 * @param {string} [currency='NGN'] - The currency code (default: 'NGN')
 * @returns {string} Formatted price string
 */
export function formatPrice(price, currency = 'NGN') {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency,
  }).format(price);
}

/**
 * Generates a random ID string
 * @param {number} [length=8] - Length of the ID (default: 8)
 * @returns {string} Random ID string
 */
export function generateId(length = 8) {
  return Math.random().toString(36).substring(2, 2 + length);
}