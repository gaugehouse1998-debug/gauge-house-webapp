import React, { useState, useMemo, useEffect } from 'react';
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  Check,
  Share2,
  Copy,
  MessageSquare,
  ShieldCheck,
  Truck,
  Layers,
  ArrowLeft,
  ChevronRight,
  ZoomIn,
  AlertCircle
} from 'lucide-react';
import { Product, ProductVariant } from '../types';
import { getItemPriceBreakdown, calculateLineSubtotal } from '../utils/pricing';
import { useStore } from '../context/StoreContext';
import { useCart } from '../context/CartContext';
import { ProductCard } from './ProductCard';

interface StagedVariantLine {
  id: string; // local temporary id for the staged line
  attributes: Record<string, string>;
  quantity: number;
}

interface ProductDetailPageProps {
  product: Product;
  navigate: (route: string) => void;
}

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80';

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({ product, navigate }) => {
  const { formatPrice, publishedProducts, settings } = useStore();
  const { addItem, addMultipleItems } = useCart();

  // Gallery state
  const images = product.images && product.images.length > 0 ? product.images : [FALLBACK_IMAGE];
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [zoomed, setZoomed] = useState(false);

  // Variant dimensions & pre-configured variants
  const hasDimensions = product.variantDimensions && product.variantDimensions.length > 0;
  const hasConfiguredVariants = product.variants && product.variants.length > 0;
  const hasVariants = hasDimensions || hasConfiguredVariants;

  // Single product non-variant quantity
  const [singleQuantity, setSingleQuantity] = useState(1);

  // Helper to get initial default attributes for a new staged row
  const getDefaultAttributes = (): Record<string, string> => {
    const attrs: Record<string, string> = {};
    if (product.variantDimensions && product.variantDimensions.length > 0) {
      product.variantDimensions.forEach((dim) => {
        if (dim.options && dim.options.length > 0) {
          attrs[dim.name] = dim.options[0];
        }
      });
    } else if (product.variants && product.variants.length > 0) {
      // Pick first configured variant's attributes
      return { ...product.variants[0].attributes };
    }
    return attrs;
  };

  // MULTI-VARIANT STAGED SELECTION LINES:
  // Each line is a user-selected combination + quantity
  const [stagedLines, setStagedLines] = useState<StagedVariantLine[]>(() => {
    if (hasVariants) {
      return [{
        id: `staged_1`,
        attributes: getDefaultAttributes(),
        quantity: 1,
      }];
    }
    return [];
  });

  const [notification, setNotification] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [activeVariantImage, setActiveVariantImage] = useState<string | null>(null);

  // Lookup matching configured variant if available to get specialized price, SKU, stock
  const findMatchingVariant = (attributes: Record<string, string>): ProductVariant | undefined => {
    if (!product.variants || product.variants.length === 0) return undefined;
    return product.variants.find((v) => {
      return Object.entries(attributes).every(([key, val]) => v.attributes[key] === val);
    });
  };

  // Sync main gallery image with selected variant image
  useEffect(() => {
    if (stagedLines.length > 0) {
      const match = findMatchingVariant(stagedLines[0].attributes);
      if (match?.image) {
        setActiveVariantImage(match.image);
      }
    }
  }, [stagedLines]);

  // Calculate pricing & stock for a staged line
  const getLineDetails = (line: StagedVariantLine) => {
    const match = findMatchingVariant(line.attributes);
    const priceInfo = getItemPriceBreakdown(product, match);
    const unitPrice = priceInfo.sellingPrice; // Discount price if discount exists, else regular price
    const regularPrice = priceInfo.regularPrice;
    const discountPrice = priceInfo.discountPrice;
    const hasDiscount = priceInfo.hasDiscount;
    const sku = match?.sku || product.sku || 'GH-ITEM';
    const stock = match?.stock ?? product.stock ?? 999;
    const isAvailable = (match ? match.enabled !== false : true) && stock > 0;
    const subtotal = calculateLineSubtotal(unitPrice, line.quantity);

    return { match, unitPrice, regularPrice, discountPrice, hasDiscount, sku, stock, isAvailable, subtotal };
  };

  // Add another staged variant row
  const handleAddAnotherVariant = () => {
    setStagedLines((prev) => [
      ...prev,
      {
        id: `staged_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
        attributes: getDefaultAttributes(),
        quantity: 1,
      },
    ]);
  };

  // Remove a staged line
  const handleRemoveStagedLine = (id: string) => {
    setStagedLines((prev) => prev.filter((l) => l.id !== id));
  };

  // Update attributes for a specific staged line
  const handleUpdateLineAttribute = (lineId: string, attrName: string, attrVal: string) => {
    setStagedLines((prev) =>
      prev.map((line) => {
        if (line.id === lineId) {
          return {
            ...line,
            attributes: {
              ...line.attributes,
              [attrName]: attrVal,
            },
          };
        }
        return line;
      })
    );
  };

  // Update quantity for a specific staged line
  const handleUpdateLineQuantity = (lineId: string, delta: number) => {
    setStagedLines((prev) =>
      prev.map((line) => {
        if (line.id === lineId) {
          const details = getLineDetails(line);
          const newQty = Math.max(1, Math.min(line.quantity + delta, details.stock));
          return { ...line, quantity: newQty };
        }
        return line;
      })
    );
  };

  // Add all staged variants to cart
  const handleAddAllStagedToCart = (goToCheckout = false) => {
    if (!hasVariants) {
      addItem(product, singleQuantity);
      setNotification(`Added ${singleQuantity} unit(s) to cart!`);
      setTimeout(() => setNotification(null), 2500);
      if (goToCheckout) navigate('/checkout');
      return;
    }

    if (stagedLines.length === 0) return;

    const itemsToAdd = stagedLines.map((line) => {
      const details = getLineDetails(line);
      return {
        product,
        quantity: line.quantity,
        variant: details.match ? details.match : {
          attributes: line.attributes,
          price: details.unitPrice,
          sku: details.sku,
          stock: details.stock,
        },
      };
    });

    addMultipleItems(itemsToAdd);

    const totalUnits = stagedLines.reduce((acc, l) => acc + l.quantity, 0);
    setNotification(`Added ${totalUnits} items (${stagedLines.length} variant combinations) to cart!`);
    setTimeout(() => setNotification(null), 3000);

    if (goToCheckout) {
      navigate('/checkout');
    }
  };

  // Grand total of currently staged lines
  const stagedSummary = useMemo(() => {
    let totalQty = 0;
    let totalPrice = 0;
    stagedLines.forEach((line) => {
      const { unitPrice } = getLineDetails(line);
      totalQty += line.quantity;
      totalPrice += unitPrice * line.quantity;
    });
    return { totalQty, totalPrice };
  }, [stagedLines, product]);

  // Related products from same category
  const relatedProducts = useMemo(() => {
    return publishedProducts
      .filter((p) => p.id !== product.id && p.category === product.category)
      .slice(0, 4);
  }, [publishedProducts, product]);

  // Social share handlers
  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleWhatsAppShare = () => {
    const text = `Take a look at this industrial product from Gauge House: ${product.title}\n${window.location.href}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleEmailShare = () => {
    const subject = encodeURIComponent(`Product Inquiry: ${product.title}`);
    const body = encodeURIComponent(`Hello,\n\nPlease see this product on Gauge House:\n${product.title}\nSKU: ${product.sku}\nURL: ${window.location.href}\n`);
    window.location.href = `mailto:gaugehouse1998@gmail.com?subject=${subject}&body=${body}`;
  };

  const hasDiscount = product.salePrice && product.salePrice > 0 && product.salePrice < product.price;

  return (
    <div className="bg-neutral-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs text-neutral-500 mb-6 flex-wrap">
          <button onClick={() => navigate('/')} className="hover:text-orange-600 transition-colors">
            Home
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
          <button onClick={() => navigate('/catalog')} className="hover:text-orange-600 transition-colors">
            Catalog
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
          <button onClick={() => navigate(`/category/${product.category.toLowerCase().replace(/\s+/g, '-')}`)} className="hover:text-orange-600 transition-colors">
            {product.category}
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
          <span className="text-neutral-900 font-semibold truncate max-w-xs">{product.title}</span>
        </nav>

        {/* Floating Notification */}
        {notification && (
          <div className="fixed bottom-6 right-6 z-50 bg-neutral-900 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2 border border-orange-500/30">
            <Check className="w-5 h-5 text-emerald-400 shrink-0" />
            <span className="text-sm font-medium">{notification}</span>
            <button
              onClick={() => navigate('/cart')}
              className="ml-2 px-3 py-1 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-xs font-semibold"
            >
              View Cart
            </button>
          </div>
        )}

        {/* Main Product Container */}
        <div className="bg-white rounded-2xl border border-neutral-200 shadow-xs overflow-hidden mb-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 p-6 sm:p-8 lg:p-10">
            {/* Left: Image Gallery (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              {/* Main Image View */}
              <div
                onClick={() => setZoomed(!zoomed)}
                className="relative aspect-square w-full rounded-xl bg-neutral-100 overflow-hidden border border-neutral-200 cursor-zoom-in group"
              >
                <img
                  src={activeVariantImage || images[selectedImageIdx] || images[0]}
                  alt={product.title}
                  referrerPolicy="no-referrer"
                  className={`w-full h-full object-cover object-center transition-transform duration-300 ${
                    zoomed ? 'scale-150' : 'group-hover:scale-105'
                  }`}
                />
                <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-xs p-2 rounded-lg text-neutral-700 shadow-sm opacity-80 group-hover:opacity-100 transition-opacity">
                  <ZoomIn className="w-4 h-4" />
                </div>
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setSelectedImageIdx(idx);
                        setActiveVariantImage(null);
                      }}
                      className={`relative w-20 h-20 rounded-lg overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${
                        !activeVariantImage && selectedImageIdx === idx
                          ? 'border-orange-600 ring-2 ring-orange-500/20'
                          : 'border-neutral-200 hover:border-neutral-400'
                      }`}
                    >
                      <img
                        src={img}
                        alt={`Thumb ${idx + 1}`}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* Industrial Assurance Badges */}
              <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200/80 space-y-2.5 text-xs text-neutral-600">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-orange-600 shrink-0" />
                  <span>100% Genuine Certified Industrial Instrumentation</span>
                </div>
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-orange-600 shrink-0" />
                  <span>Prompt Dispatch Across Pakistan & Export Support</span>
                </div>
              </div>
            </div>

            {/* Right: Product Details & Multi-Variant Builder (7 cols) */}
            <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
              <div>
                {/* Brand & Stock Header */}
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <span className="px-2.5 py-1 rounded-md bg-orange-100 text-orange-700 text-xs font-bold uppercase tracking-wider">
                    {product.brand || 'Gauge House'}
                  </span>
                  <span className={`text-xs font-semibold flex items-center gap-1 ${
                    product.stock > 0 ? 'text-emerald-700' : 'text-neutral-500'
                  }`}>
                    <span className={`w-2 h-2 rounded-full ${product.stock > 0 ? 'bg-emerald-500' : 'bg-neutral-400'}`} />
                    {product.stock > 0 ? `In Stock (${product.stock} units ready)` : 'Out of Stock / Inquire'}
                  </span>
                </div>

                {/* Title */}
                <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 leading-tight mb-2">
                  {product.title}
                </h1>

                {/* SKU & Category */}
                <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-500 font-mono mb-4">
                  <span>SKU: <strong className="text-neutral-700">{product.sku}</strong></span>
                  <span>Category: <strong className="text-neutral-700">{product.category}</strong></span>
                </div>

                {/* Base Price Display */}
                <div className="flex items-baseline gap-3 mb-6 p-4 rounded-xl bg-neutral-50 border border-neutral-200/60">
                  <span className="text-2xl sm:text-3xl font-extrabold text-neutral-900">
                    {formatPrice(hasDiscount ? product.salePrice : product.price)}
                  </span>
                  {hasDiscount && (
                    <span className="text-base text-neutral-400 line-through">
                      {formatPrice(product.price)}
                    </span>
                  )}
                  <span className="text-xs text-neutral-500 font-medium">
                    {product.unit ? `per ${product.unit}` : 'unit price'} (excl. GST/Freight)
                  </span>
                </div>

                {/* Description */}
                {product.description && (
                  <div className="text-sm text-neutral-700 leading-relaxed mb-6 whitespace-pre-line">
                    {product.description}
                  </div>
                )}

                {/* ========================================================= */}
                {/* MULTI-VARIANT SELECTION BUILDER */}
                {/* ========================================================= */}
                <div className="border-t border-neutral-200 pt-6">
                  {hasVariants ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div>
                          <h3 className="text-base font-bold text-neutral-900 flex items-center gap-2">
                            <Layers className="w-5 h-5 text-orange-600" />
                            Multi-Variant Specification Order Builder
                          </h3>
                          <p className="text-xs text-neutral-500 mt-0.5">
                            Select multiple variant combinations with custom quantities for your industrial order:
                          </p>
                        </div>
                      </div>

                      {/* Staged Lines List */}
                      <div className="space-y-3">
                        {stagedLines.map((line, idx) => {
                          const details = getLineDetails(line);
                          return (
                            <div
                              key={line.id}
                              className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 relative group transition-all"
                            >
                              <div className="flex items-center justify-between mb-3">
                                <span className="text-xs font-bold uppercase tracking-wider text-orange-700 bg-orange-100/80 px-2 py-0.5 rounded">
                                  Variant Combination #{idx + 1}
                                </span>
                                {stagedLines.length > 1 && (
                                  <button
                                    onClick={() => handleRemoveStagedLine(line.id)}
                                    className="text-neutral-400 hover:text-red-600 transition-colors p-1 cursor-pointer"
                                    title="Remove this combination"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                )}
                              </div>

                              {/* Dimension Selectors */}
                              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mb-3">
                                {product.variantDimensions?.map((dim) => (
                                  <div key={dim.name}>
                                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                                      {dim.name}
                                    </label>
                                    <select
                                      value={line.attributes[dim.name] || ''}
                                      onChange={(e) =>
                                        handleUpdateLineAttribute(line.id, dim.name, e.target.value)
                                      }
                                      className="w-full text-xs font-medium bg-white border border-neutral-300 rounded-lg px-2.5 py-2 text-neutral-800 focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
                                    >
                                      {dim.options.map((opt) => (
                                        <option key={opt} value={opt}>
                                          {opt}
                                        </option>
                                      ))}
                                    </select>
                                  </div>
                                ))}

                                {/* Fallback if only raw variants configured */}
                                {!product.variantDimensions && product.variants && (
                                  <div className="sm:col-span-2">
                                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                                      Select Configured Variant
                                    </label>
                                    <select
                                      value={JSON.stringify(line.attributes)}
                                      onChange={(e) => {
                                        try {
                                          const parsed = JSON.parse(e.target.value);
                                          setStagedLines((prev) =>
                                            prev.map((l) =>
                                              l.id === line.id ? { ...l, attributes: parsed } : l
                                            )
                                          );
                                        } catch {
                                          // ignore
                                        }
                                      }}
                                      className="w-full text-xs font-medium bg-white border border-neutral-300 rounded-lg px-2.5 py-2 text-neutral-800"
                                    >
                                      {product.variants.map((v) => (
                                        <option key={v.id} value={JSON.stringify(v.attributes)}>
                                          {Object.entries(v.attributes).map(([k, val]) => `${k}: ${val}`).join(' | ')} ({formatPrice(v.price)})
                                        </option>
                                      ))}
                                    </select>
                                  </div>
                                )}
                              </div>

                              {/* Quantity & Pricing for this line */}
                              <div className="pt-2 border-t border-neutral-200/80 flex flex-wrap items-center justify-between gap-3 text-xs">
                                <div className="flex items-center gap-4">
                                  {/* Quantity Controls */}
                                  <div className="flex items-center border border-neutral-300 rounded-lg bg-white overflow-hidden shadow-2xs">
                                    <button
                                      onClick={() => handleUpdateLineQuantity(line.id, -1)}
                                      disabled={line.quantity <= 1}
                                      className="p-1.5 hover:bg-neutral-100 disabled:opacity-40 transition-colors cursor-pointer"
                                      aria-label="Decrease quantity"
                                    >
                                      <Minus className="w-3.5 h-3.5" />
                                    </button>
                                    <span className="w-10 text-center font-bold text-neutral-900">
                                      {line.quantity}
                                    </span>
                                    <button
                                      onClick={() => handleUpdateLineQuantity(line.id, 1)}
                                      disabled={line.quantity >= details.stock}
                                      className="p-1.5 hover:bg-neutral-100 disabled:opacity-40 transition-colors cursor-pointer"
                                      aria-label="Increase quantity"
                                    >
                                      <Plus className="w-3.5 h-3.5" />
                                    </button>
                                  </div>

                                  <span className="text-neutral-500 font-mono">
                                    SKU: {details.sku}
                                  </span>
                                </div>

                                <div className="text-right">
                                  <span className="text-neutral-500 mr-2">
                                    {details.hasDiscount && details.regularPrice && (
                                      <span className="line-through text-neutral-400 mr-1.5 text-xs">
                                        {formatPrice(details.regularPrice)}
                                      </span>
                                    )}
                                    {line.quantity} × <strong className="text-neutral-700">{formatPrice(details.unitPrice)}</strong>
                                  </span>
                                  <span className="font-extrabold text-neutral-900 text-sm">
                                    = {formatPrice(details.subtotal)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Add Another Variant Button */}
                      <button
                        onClick={handleAddAnotherVariant}
                        className="w-full py-2.5 px-4 border-2 border-dashed border-orange-300 hover:border-orange-500 bg-orange-50/50 hover:bg-orange-50 text-orange-700 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                        <span>+ Add another variant combination</span>
                      </button>

                      {/* Staged Summary & Actions */}
                      <div className="p-4 rounded-xl bg-neutral-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4 mt-4">
                        <div>
                          <span className="text-xs text-neutral-400 block uppercase tracking-wider font-semibold">
                            Total Multi-Variant Selection
                          </span>
                          <div className="flex items-baseline gap-2">
                            <span className="text-xl font-extrabold text-orange-400">
                              {formatPrice(stagedSummary.totalPrice)}
                            </span>
                            <span className="text-xs text-neutral-300 font-medium">
                              ({stagedSummary.totalQty} total units across {stagedLines.length} variant{stagedLines.length > 1 ? 's' : ''})
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 w-full sm:w-auto">
                          <button
                            onClick={() => handleAddAllStagedToCart(false)}
                            className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
                          >
                            <ShoppingCart className="w-4 h-4" />
                            <span>Add All to Cart</span>
                          </button>

                          <button
                            onClick={() => handleAddAllStagedToCart(true)}
                            className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-white hover:bg-neutral-100 text-neutral-900 font-bold text-xs sm:text-sm transition-all cursor-pointer"
                          >
                            Order Now
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Simple Single Product (no variants) */
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center border border-neutral-300 rounded-xl bg-white overflow-hidden shadow-2xs">
                          <button
                            onClick={() => setSingleQuantity(Math.max(1, singleQuantity - 1))}
                            disabled={singleQuantity <= 1}
                            className="p-3 hover:bg-neutral-100 disabled:opacity-40 transition-colors cursor-pointer"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-12 text-center font-bold text-neutral-900 text-base">
                            {singleQuantity}
                          </span>
                          <button
                            onClick={() => setSingleQuantity(Math.min(product.stock, singleQuantity + 1))}
                            disabled={singleQuantity >= product.stock}
                            className="p-3 hover:bg-neutral-100 disabled:opacity-40 transition-colors cursor-pointer"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="text-sm">
                          <span className="text-neutral-500 block">Subtotal</span>
                          <span className="font-extrabold text-neutral-900 text-lg">
                            {formatPrice(calculateLineSubtotal(getItemPriceBreakdown(product).sellingPrice, singleQuantity))}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-3 pt-2">
                        <button
                          onClick={() => handleAddAllStagedToCart(false)}
                          disabled={product.stock <= 0}
                          className="flex-1 py-3 px-6 rounded-xl bg-orange-600 hover:bg-orange-700 disabled:bg-neutral-200 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
                        >
                          <ShoppingCart className="w-4 h-4" />
                          <span>Add to Cart</span>
                        </button>
                        <button
                          onClick={() => handleAddAllStagedToCart(true)}
                          disabled={product.stock <= 0}
                          className="flex-1 py-3 px-6 rounded-xl bg-neutral-900 hover:bg-neutral-800 disabled:bg-neutral-200 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
                        >
                          <span>Buy Now</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Share & Inquire Bar */}
              <div className="border-t border-neutral-100 pt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-neutral-500">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-neutral-700 flex items-center gap-1">
                    <Share2 className="w-3.5 h-3.5 text-neutral-500" /> Share:
                  </span>
                  <button
                    onClick={handleWhatsAppShare}
                    className="p-1.5 rounded-md hover:bg-emerald-50 text-emerald-600 transition-colors cursor-pointer font-medium flex items-center gap-1"
                    title="Share via WhatsApp"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </button>
                  <button
                    onClick={handleCopyLink}
                    className="p-1.5 rounded-md hover:bg-neutral-100 text-neutral-600 transition-colors cursor-pointer font-medium flex items-center gap-1"
                    title="Copy Link"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copiedLink ? 'Copied!' : 'Copy Link'}</span>
                  </button>
                </div>

                <button
                  onClick={handleEmailShare}
                  className="text-orange-600 hover:text-orange-700 font-semibold cursor-pointer"
                >
                  Inquire directly about this product →
                </button>
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* TECHNICAL SPECIFICATIONS TABLE */}
          {/* ========================================================= */}
          {product.specifications && Object.keys(product.specifications).length > 0 && (
            <div className="border-t border-neutral-200 p-6 sm:p-8 lg:p-10 bg-neutral-50/50">
              <h2 className="text-xl font-extrabold text-neutral-900 mb-4 flex items-center gap-2">
                Technical Specifications
              </h2>
              <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
                <table className="w-full text-left text-xs sm:text-sm">
                  <tbody className="divide-y divide-neutral-200">
                    {Object.entries(product.specifications).map(([specKey, specVal], idx) => (
                      <tr key={specKey} className={idx % 2 === 0 ? 'bg-white' : 'bg-neutral-50/60'}>
                        <td className="py-3 px-4 sm:px-6 font-bold text-neutral-700 w-1/3 sm:w-1/4">
                          {specKey}
                        </td>
                        <td className="py-3 px-4 sm:px-6 text-neutral-900 font-medium">
                          {specVal}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-extrabold text-neutral-900">
                  Related Products
                </h2>
                <p className="text-xs sm:text-sm text-neutral-500">
                  Other industrial instruments in {product.category}
                </p>
              </div>
              <button
                onClick={() => navigate('/catalog')}
                className="text-xs sm:text-sm font-bold text-orange-600 hover:text-orange-700 transition-colors cursor-pointer"
              >
                View All Catalog →
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {relatedProducts.map((rel) => (
                <ProductCard
                  key={rel.id}
                  product={rel}
                  onNavigate={(slug) => navigate(`/product/${slug}`)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
