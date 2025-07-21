import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Plus } from 'lucide-react';
import { Card, CardContent, CardFooter } from '../ui/Card';
import { Button } from '../ui/Button';
import { formatPrice } from '../../lib/utils';
import { useCart } from '../../contexts/CartContext';
import { useToast } from '../ui/Toast';

const ProductCard = ({ product }) => {
  const { addToast } = useToast();
  const { addToCart } = useCart();
  // Select the image with isMain: true, or fall back to the first image, or placeholder
  const productImg =
    product.images && product.images.length > 0
      ? product.images.find((img) => img.isMain)?.url || product.images[0].url
      : 'https://via.placeholder.com/300?text=No+Image';

  const handleAddToCart = async (e) => {
    e.preventDefault();
    try {
      await addToCart(
        {
          id: product.id,
          name: product.name,
          price: product.price,
          image: productImg,
          category: product.category,
          slug: product.slug,
          sku: product.sku || `SKU-${product.id}`,
        },
        1
      );
    } catch (err) {
      // Error is handled by CartContext
    }
  };

  return (
    <Card
      className="overflow-hidden transition-all duration-300 hover:shadow-md hover:shadow-neutral-200/50 group border-neutral-200 hover:border-neutral-300 bg-white rounded-lg"
      role="article"
      aria-label={`Product card for ${product.name}`}
    >
      <Link to={`/product/${product.slug}`} className="block relative" tabIndex={0}>
        <div className="relative aspect-square overflow-hidden bg-neutral-100">
          <img
            src={productImg}
            alt={`Main image of ${product.name}`}
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
            to={`/product/${product.slug}`}
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