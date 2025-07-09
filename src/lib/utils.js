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

/**
 * Formats a date string or Date object to a readable format
 * @param {string|Date} date - The date to format
 * @param {Object} [options] - Formatting options
 * @param {string} [options.format='medium'] - Format style: 'short', 'medium', 'long', or 'full'
 * @returns {string} Formatted date string
 */
export function formatDate(date, options = {}) {
  if (!date) return '';
  
  const { format = 'medium' } = options;
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) {
    return 'Invalid date';
  }
  
  try {
    switch (format) {
      case 'short':
        return dateObj.toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });
      case 'long':
        return dateObj.toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' });
      case 'full':
        return dateObj.toLocaleDateString('en-NG', { 
          weekday: 'long', 
          day: 'numeric', 
          month: 'long', 
          year: 'numeric' 
        });
      case 'time':
        return dateObj.toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' });
      case 'datetime':
        return `${dateObj.toLocaleDateString('en-NG')} ${dateObj.toLocaleTimeString('en-NG', { 
          hour: '2-digit', 
          minute: '2-digit' 
        })}`;
      case 'medium':
      default:
        return dateObj.toLocaleDateString('en-NG');
    }
  } catch (error) {
    console.error('Error formatting date:', error);
    return String(dateObj);
  }
}