// src/components/product/ProductCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Loader2 } from 'lucide-react';
import { Card, CardContent, CardFooter } from '../ui/Card';
import { Button } from '../ui/Button';
import { formatPrice } from '../../lib/utils';
import { useCart } from '../../contexts/CartContext';

// Memoize the component to prevent unnecessary re-renders.
const ProductCard = React.memo(({ product }) => {
  // We get the mutation function and its loading state from the context
  const { addToCart, isLoading: isAddingToCart } = useCart();

  if (!product) {
    return null; // Or a placeholder, to prevent errors if product is undefined
  }

  // Robustly select the main image URL.
  const mainImage = product.images?.find(img => img.isMain) || product.images?.[0];
  const productImgUrl = mainImage?.url || 'https://via.placeholder.com/400?text=Scenture';

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();

    // The addToCart mutation from CartContext expects a single object.
    // We only need to send the ID and quantity. The backend will handle the rest.
    // We also send productName to be used in the success toast message.
    addToCart({
      productId: product._id,
      quantity: 1,
      variantId: null, // This card adds the base product without a variant
      productName: product.name,
    });
  };

  return (
    <Card
      className="group relative flex flex-col h-full overflow-hidden rounded-2xl border border-neutral-200/80 bg-white transition-all duration-300 ease-in-out hover:shadow-xl hover:border-transparent hover:-translate-y-1"
      role="article"
      aria-label={`Product: ${product.name}`}
    >
      <Link to={`/product/${product.slug}`} className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-neutral-900 rounded-t-lg">
        <div className="aspect-square overflow-hidden bg-neutral-100">
          <img
            src={productImgUrl}
            alt={`Image of ${product.name}`}
            className="w-full h-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-105"
            loading="lazy"
          />
        </div>
      </Link>

      <CardContent className="pt-5 px-5 flex-grow flex flex-col">
        {product.category?.name && (
          <span className="text-xs text-neutral-500 uppercase tracking-wider mb-2">
            {product.category.name}
          </span>
        )}
        <Link to={`/product/${product.slug}`} className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 rounded">
          <h3 className="font-heading text-lg text-neutral-800 leading-tight transition-colors group-hover:text-black">
            {product.name}
          </h3>
        </Link>
      </CardContent>

      <CardFooter className="px-5 pb-5 pt-2 mt-auto">
        <div className="flex justify-between items-center w-full">
          <span className="text-lg font-medium text-neutral-900">
            {formatPrice(product.price)}
          </span>
          <Button
            variant="outline"
            size="icon"
            className="rounded-full w-10 h-10 shrink-0 border-neutral-300 text-neutral-600 hover:bg-neutral-900 hover:text-white hover:border-neutral-900 focus-visible:ring-offset-0"
            onClick={handleAddToCart}
            aria-label={`Add ${product.name} to cart`}
            disabled={isAddingToCart} // Disable button while adding
          >
            {isAddingToCart ? <Loader2 size={18} className="animate-spin" /> : <ShoppingBag size={18} />}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
});

export default ProductCard;