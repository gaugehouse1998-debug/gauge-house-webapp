import React, { useState } from 'react';
import { ShoppingCart, Eye, Check, Layers, AlertCircle } from 'lucide-react';
import { Product } from '../types';
import { useStore } from '../context/StoreContext';
import { useCart } from '../context/CartContext';

interface ProductCardProps {
  product: Product;
  onNavigate: (slug: string) => void;
  onQuickView?: (product: Product) => void;
}

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80';

export const ProductCard: React.FC<ProductCardProps> = ({ product, onNavigate, onQuickView }) => {
  const { formatPrice } = useStore();
  const { addItem } = useCart();
  const [imgSrc, setImgSrc] = useState<string>(product.images?.[0] || FALLBACK_IMAGE);
  const [imgError, setImgError] = useState(false);
  const [addedAnimation, setAddedAnimation] = useState(false);

  const hasDiscount = product.salePrice && product.salePrice > 0 && product.salePrice < product.price;
  const isOutOfStock = product.stock <= 0;
  const hasVariants = (product.variants && product.variants.length > 0) || (product.variantDimensions && product.variantDimensions.length > 0);

  // Pick up to 2 key specifications to show as a compact summary
  const specSummary = Object.entries(product.specifications || {})
    .filter(([k]) => ['Dial Size', 'Pressure Range', 'Accuracy', 'Case Material', 'Model'].includes(k))
    .slice(0, 2)
    .map(([k, v]) => `${k}: ${v}`)
    .join(' • ');

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOutOfStock) return;

    if (hasVariants) {
      // If product has variants, navigate to detail page so user can choose desired variant(s)
      onNavigate(product.slug);
    } else {
      addItem(product, 1);
      setAddedAnimation(true);
      setTimeout(() => setAddedAnimation(false), 1200);
    }
  };

  return (
    <div
      onClick={() => onNavigate(product.slug)}
      className="group bg-white rounded-xl border border-neutral-200/90 overflow-hidden hover:border-orange-400/80 hover:shadow-lg transition-all duration-200 flex flex-col justify-between cursor-pointer relative"
    >
      {/* Top Image Container */}
      <div className="relative aspect-square w-full bg-neutral-50 overflow-hidden">
        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1 items-start">
          {isOutOfStock ? (
            <span className="px-2 py-0.5 text-[10px] sm:text-xs font-bold uppercase tracking-wider rounded-md bg-neutral-900 text-neutral-200 shadow-xs">
              Out of Stock
            </span>
          ) : hasDiscount ? (
            <span className="px-2 py-0.5 text-[10px] sm:text-xs font-bold uppercase tracking-wider rounded-md bg-orange-600 text-white shadow-xs">
              Sale
            </span>
          ) : product.featured ? (
            <span className="px-2 py-0.5 text-[10px] sm:text-xs font-bold uppercase tracking-wider rounded-md bg-blue-600 text-white shadow-xs">
              Featured
            </span>
          ) : null}

          {hasVariants && (
            <span className="px-1.5 py-0.5 text-[10px] font-semibold rounded bg-neutral-800/80 backdrop-blur-xs text-white flex items-center gap-1">
              <Layers className="w-2.5 h-2.5" />
              Multi-Variant
            </span>
          )}
        </div>

        {/* Product Image */}
        <img
          src={imgError ? FALLBACK_IMAGE : imgSrc}
          alt={product.title}
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={() => {
            setImgError(true);
            setImgSrc(FALLBACK_IMAGE);
          }}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
        />

        {/* Quick View Floating Action on Desktop */}
        {onQuickView && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onQuickView(product);
            }}
            className="hidden sm:flex absolute bottom-2.5 right-2.5 p-2 rounded-full bg-white/95 hover:bg-white text-neutral-700 shadow-md opacity-0 group-hover:opacity-100 transition-all cursor-pointer items-center justify-center hover:text-orange-600"
            title="Quick View"
          >
            <Eye className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Content */}
      <div className="p-3 sm:p-4 flex flex-col flex-1 justify-between">
        <div>
          {/* Brand & Category */}
          <div className="flex items-center justify-between gap-1 text-[11px] text-neutral-500 font-medium mb-1">
            <span className="uppercase tracking-wide font-semibold text-orange-600 truncate">
              {product.brand || 'Gauge House'}
            </span>
            <span className="truncate text-neutral-400">{product.category}</span>
          </div>

          {/* Title */}
          <h3 className="font-semibold text-sm sm:text-base text-neutral-900 group-hover:text-orange-600 line-clamp-2 transition-colors mb-1.5 leading-snug">
            {product.title}
          </h3>

          {/* Spec preview if exists */}
          {specSummary && (
            <p className="text-[11px] text-neutral-500 line-clamp-1 mb-2 font-mono">
              {specSummary}
            </p>
          )}
        </div>

        {/* Price & Action */}
        <div className="pt-2 border-t border-neutral-100 mt-2 flex items-center justify-between gap-2">
          <div>
            <div className="flex items-baseline gap-1.5 flex-wrap">
              <span className="font-bold text-sm sm:text-base text-neutral-900">
                {formatPrice(hasDiscount ? product.salePrice : product.price)}
              </span>
              {hasDiscount && (
                <span className="text-xs text-neutral-400 line-through">
                  {formatPrice(product.price)}
                </span>
              )}
            </div>
            <span className="text-[10px] text-neutral-400 block -mt-0.5">
              {product.unit ? `Per ${product.unit}` : 'Unit price'}
            </span>
          </div>

          {/* Action Button */}
          <button
            onClick={handleQuickAdd}
            disabled={isOutOfStock}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
              isOutOfStock
                ? 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
                : addedAnimation
                ? 'bg-emerald-600 text-white'
                : 'bg-orange-600 hover:bg-orange-700 text-white shadow-xs'
            }`}
            title={hasVariants ? 'Choose Variants' : 'Add to cart'}
          >
            {addedAnimation ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Added</span>
              </>
            ) : hasVariants ? (
              <>
                <Layers className="w-3.5 h-3.5" />
                <span>Options</span>
              </>
            ) : (
              <>
                <ShoppingCart className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Add</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
