import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Plus } from 'lucide-react';
import { Card, CardContent, CardFooter } from '../ui/Card';
import { Button } from '../ui/Button';
import { formatPrice } from '../../lib/utils';
import { useCart } from '../../contexts/CartContext';
import { toast } from 'react-hot-toast';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();

  const handleAddToCart = (e) => {
    e.preventDefault();
    // Ensure the product object is passed with the correct structure
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image || (product.images && product.images.length > 0 ? product.images[0] : null),
      category: product.category,
    }, 1);
    toast.success(`${product.name} added to cart`);
  };

  return (
    <Card
      className="overflow-hidden transition-all duration-300 hover:shadow-md hover:shadow-neutral-200/50 group border-neutral-200 hover:border-neutral-300 bg-white rounded-lg"
      role="article"
      aria-label={`Product card for ${product.name}`}
    >
      <Link to={`/product/${product.id}`} className="block relative" tabIndex={0}>
        <div className="relative aspect-square overflow-hidden bg-neutral-100">
          <img
            src={product.image || (product.images && product.images.length > 0 ? product.images[0] : '/placeholder-image.jpg')}
            alt={`Image of ${product.name} fragrance`}
            className="object-cover w-full h-full transition-all duration-300 group-hover:scale-[1.02] group-hover:brightness-105"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-neutral-300 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </Link>

      <CardContent className="pt-6 pb-4 px-6">
        <div className="space-y-3">
          <span className="inline-block px-3 py-1 text-sm text-neutral-600 bg-neutral-50 rounded-full uppercase tracking-wide font-medium border border-neutral-100">
            {product.category}
          </span>

          <Link
            to={`/product/${product.id}`}
            className="block group/link focus:outline-none focus:ring-2 focus:ring-neutral-300 rounded"
          >
            <h3 className="font-heading text-xl lg:text-2xl text-neutral-900 group-hover/link:text-neutral-700 transition-colors duration-200 leading-tight tracking-tight">
              {product.name}
            </h3>
          </Link>

          <div className="pt-1">
            <span className="text-xl font-light text-neutral-900 tracking-tight">
              {formatPrice(product.price)}
            </span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-0 px-6 pb-6">
        <Button
          variant="outline"
          className="w-full group/btn relative overflow-hidden flex items-center justify-center gap-2 hover:bg-neutral-900 hover:text-white hover:border-neutral-900 transition-all duration-300 py-3 rounded-full border-neutral-300 font-medium text-neutral-700 hover:shadow-md"
          onClick={handleAddToCart}
          aria-label={`Add ${product.name} to cart`}
        >
          <div className="absolute inset-0 bg-neutral-900 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300 rounded-full"></div>
          <ShoppingBag
            size={16}
            className="relative z-10 transition-transform duration-300 group-hover/btn:scale-110"
          />
          <span className="relative z-10">Add to Cart</span>
          <Plus
            size={14}
            className="relative z-10 opacity-0 group-hover/btn:opacity-100 transition-all duration-300 transform translate-x-2 group-hover/btn:translate-x-0"
          />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;