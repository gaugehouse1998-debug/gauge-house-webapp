import React, { useState } from 'react';
import { X, ShoppingCart, Layers, ExternalLink, ShieldCheck, Check } from 'lucide-react';
import { Product } from '../types';
import { useStore } from '../context/StoreContext';
import { useCart } from '../context/CartContext';

interface QuickViewModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  navigate: (route: string) => void;
}

export const QuickViewModal: React.FC<QuickViewModalProps> = ({
  product,
  isOpen,
  onClose,
  navigate,
}) => {
  if (!isOpen || !product) return null;

  const { formatPrice } = useStore();
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const hasVariants = (product.variants && product.variants.length > 0) || (product.variantDimensions && product.variantDimensions.length > 0);
  const isOutOfStock = product.stock <= 0;
  const hasDiscount = product.salePrice && product.salePrice > 0 && product.salePrice < product.price;

  const handleAdd = () => {
    if (hasVariants) {
      navigate(`/product/${product.slug}`);
      onClose();
    } else {
      addItem(product, quantity);
      setAdded(true);
      setTimeout(() => {
        setAdded(false);
        onClose();
      }, 1000);
    }
  };

  const handleFullDetails = () => {
    navigate(`/product/${product.slug}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/70 backdrop-blur-xs">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/80 hover:bg-white text-neutral-600 hover:text-neutral-900 shadow-xs transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-6">
          {/* Image */}
          <div className="aspect-square rounded-xl bg-neutral-100 overflow-hidden border border-neutral-200">
            <img
              src={
                product.images?.[0] ||
                'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80'
              }
              alt={product.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Details */}
          <div className="flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between text-xs text-neutral-500 font-mono mb-1">
                <span className="uppercase text-orange-600 font-bold">{product.brand || 'Gauge House'}</span>
                <span>SKU: {product.sku}</span>
              </div>

              <h3 className="font-extrabold text-lg text-neutral-900 leading-snug mb-2">
                {product.title}
              </h3>

              <div className="flex items-baseline gap-2 mb-3">
                <span className="text-xl font-extrabold text-neutral-900">
                  {formatPrice(hasDiscount ? product.salePrice : product.price)}
                </span>
                {hasDiscount && (
                  <span className="text-xs text-neutral-400 line-through">
                    {formatPrice(product.price)}
                  </span>
                )}
              </div>

              {product.description && (
                <p className="text-xs text-neutral-600 line-clamp-3 leading-relaxed mb-4">
                  {product.description}
                </p>
              )}

              {hasVariants && (
                <div className="p-3 bg-orange-50 border border-orange-200/80 rounded-xl text-xs text-orange-900 flex items-center gap-2 mb-4">
                  <Layers className="w-4 h-4 text-orange-600 shrink-0" />
                  <span>
                    This product supports multi-variant combinations. Click below to configure dial sizes, pressure ranges & quantities.
                  </span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <button
                onClick={handleAdd}
                disabled={isOutOfStock}
                className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer ${
                  added
                    ? 'bg-emerald-600 text-white'
                    : 'bg-orange-600 hover:bg-orange-700 text-white'
                }`}
              >
                {added ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Added to Cart</span>
                  </>
                ) : hasVariants ? (
                  <>
                    <Layers className="w-4 h-4" />
                    <span>Choose Variants & Order</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-4 h-4" />
                    <span>Add to Cart</span>
                  </>
                )}
              </button>

              <button
                onClick={handleFullDetails}
                className="w-full py-2 text-xs font-bold text-neutral-600 hover:text-neutral-900 flex items-center justify-center gap-1 transition-colors cursor-pointer"
              >
                <span>View Complete Technical Specifications</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
