import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Plus } from 'lucide-react';
import { Card, CardContent, CardFooter } from '../ui/Card';
import { Button } from '../ui/Button';
import { formatPrice } from '../../lib/utils';

const ProductCard = ({ product }) => {
  return (
    <Card className="overflow-hidden transition-all duration-700 hover:shadow-xl hover:shadow-slate-200/40 group border-slate-200/60 hover:border-slate-300 bg-white rounded-sm">
      <Link to={`/product/${product.id}`} className="block relative">
        <div className="relative aspect-square overflow-hidden bg-slate-100">
          <img
            src={product.image}
            alt={product.name}
            className="object-cover w-full h-full transition-all duration-700 group-hover:scale-[1.03] filter group-hover:brightness-[1.02]"
          />
          
          {/* Sophisticated overlay gradients */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/8 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-black/5 opacity-0 group-hover:opacity-100 transition-all duration-700"></div>
          
          {/* Minimal corner accent */}
          <div className="absolute top-4 right-4 w-2 h-2 bg-white/60 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500 delay-100 backdrop-blur-sm"></div>
        </div>

        {/* Subtle hover indicator */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      </Link>
      
      <CardContent className="pt-8 pb-6 px-8">
        <div className="space-y-4">
          {/* Category Badge */}
          <div className="flex items-center justify-between">
            <span className="inline-block px-3 py-1 text-xs text-slate-500 bg-slate-50 rounded-full uppercase tracking-wider font-medium border border-slate-100">
              {product.category}
            </span>
          </div>

          {/* Product Name */}
          <Link
            to={`/product/${product.id}`}
            className="block group/link"
          >
            <h3 className="font-heading text-xl lg:text-2xl text-slate-900 group-hover/link:text-slate-700 transition-colors duration-300 leading-tight font-light tracking-[-0.01em]">
              {product.name}
            </h3>
          </Link>

          {/* Price with refined styling */}
          <div className="pt-2">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-light text-slate-900 tracking-tight">
                {formatPrice(product.price)}
              </span>
              <div className="w-6 h-px bg-slate-200"></div>
            </div>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="pt-0 px-8 pb-8">
        <Button
          variant="outline"
          className="w-full group/btn relative overflow-hidden flex items-center justify-center gap-3 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all duration-500 py-4 rounded-full border-slate-300 font-medium text-slate-700 hover:shadow-lg hover:shadow-slate-900/25"
        >
          {/* Button background animation */}
          <div className="absolute inset-0 bg-slate-900 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-500 rounded-full"></div>
          
          {/* Icon with rotation animation */}
          <ShoppingBag 
            size={18} 
            className="relative z-10 transition-all duration-300 group-hover/btn:scale-110" 
          />
          
          <span className="relative z-10 transition-all duration-300">
            Add to Cart
          </span>

          {/* Subtle plus icon that appears on hover */}
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