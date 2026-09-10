import React, { useState, useEffect, useRef } from 'react';
import { Search, X, ArrowRight, PackageOpen, Layers } from 'lucide-react';
import { useStore } from '../context/StoreContext';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  navigate: (route: string) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose, navigate }) => {
  const { publishedProducts, formatPrice } = useStore();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const results = query.trim()
    ? publishedProducts.filter((p) => {
        const q = query.toLowerCase().trim();
        return (
          p.title.toLowerCase().includes(q) ||
          p.sku?.toLowerCase().includes(q) ||
          p.brand?.toLowerCase().includes(q) ||
          p.category?.toLowerCase().includes(q) ||
          Object.values(p.specifications || {}).some((v) => String(v).toLowerCase().includes(q))
        );
      }).slice(0, 8)
    : [];

  const handleSelectProduct = (slug: string) => {
    navigate(`/product/${slug}`);
    onClose();
  };

  const handleViewAllResults = () => {
    navigate(`/catalog?q=${encodeURIComponent(query)}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-neutral-950/70 backdrop-blur-xs">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Search Header Input */}
        <div className="relative border-b border-neutral-200 p-4 flex items-center gap-3">
          <Search className="w-5 h-5 text-orange-600 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && query.trim()) {
                handleViewAllResults();
              }
            }}
            placeholder="Search industrial gauges, WIKA, 0-10 bar, 4 inch dial, SKU..."
            className="w-full text-sm sm:text-base font-medium text-neutral-900 placeholder:text-neutral-400 focus:outline-hidden"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-neutral-400 hover:text-neutral-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="text-xs font-semibold px-2 py-1 rounded-md bg-neutral-100 hover:bg-neutral-200 text-neutral-600 transition-colors"
          >
            ESC
          </button>
        </div>

        {/* Results Body */}
        <div className="max-h-96 overflow-y-auto p-4">
          {query.trim() === '' ? (
            <div className="py-8 text-center text-xs text-neutral-500">
              <p className="font-semibold text-neutral-700 mb-1">
                Instant Gauge House Catalog Search
              </p>
              <p>Type model number, dial size (e.g. 4 inch), pressure range, or category.</p>
            </div>
          ) : results.length > 0 ? (
            <div className="space-y-2">
              <div className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 px-2 pb-1">
                Products Matching "{query}"
              </div>
              {results.map((product) => (
                <div
                  key={product.id}
                  onClick={() => handleSelectProduct(product.slug)}
                  className="p-2.5 rounded-xl hover:bg-orange-50/80 border border-transparent hover:border-orange-200 flex items-center justify-between gap-3 cursor-pointer transition-all group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={
                        product.images?.[0] ||
                        'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=200&q=80'
                      }
                      alt={product.title}
                      referrerPolicy="no-referrer"
                      className="w-12 h-12 rounded-lg object-cover bg-neutral-100 border border-neutral-200 shrink-0"
                    />
                    <div className="min-w-0">
                      <h4 className="text-xs sm:text-sm font-bold text-neutral-900 group-hover:text-orange-600 truncate transition-colors">
                        {product.title}
                      </h4>
                      <p className="text-[11px] text-neutral-500 truncate">
                        {product.category} • SKU: {product.sku} {product.brand ? `• ${product.brand}` : ''}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs sm:text-sm font-extrabold text-neutral-900 block">
                      {formatPrice(product.salePrice || product.price)}
                    </span>
                    <span
                      className={`text-[10px] font-semibold ${
                        product.stock > 0 ? 'text-emerald-600' : 'text-neutral-400'
                      }`}
                    >
                      {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </div>
                </div>
              ))}

              <div className="pt-3 border-t border-neutral-100 text-center">
                <button
                  onClick={handleViewAllResults}
                  className="text-xs font-bold text-orange-600 hover:text-orange-700 inline-flex items-center gap-1 cursor-pointer"
                >
                  <span>View all results in Catalog</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-neutral-500">
              <PackageOpen className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
              <p className="font-bold text-neutral-800">No products found matching "{query}"</p>
              <p className="mt-1">Try checking your spelling or searching for a broader term.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
