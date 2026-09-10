import React from 'react';
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Truck,
  Layers,
  PackageOpen
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useStore } from '../context/StoreContext';

interface CartPageProps {
  navigate: (route: string) => void;
}

export const CartPage: React.FC<CartPageProps> = ({ navigate }) => {
  const { items, updateQuantity, removeItem, clearCart, subtotal, itemCount } = useCart();
  const { formatPrice, settings } = useStore();

  const isFreeShipping = subtotal >= settings.freeShippingThreshold && settings.freeShippingThreshold > 0;
  const shippingFee = items.length === 0 ? 0 : isFreeShipping ? 0 : settings.shippingFlatRate;
  const grandTotal = subtotal + shippingFee;

  return (
    <div className="bg-neutral-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight flex items-center gap-3">
              <ShoppingCart className="w-7 h-7 text-orange-600" />
              Industrial Order Cart
            </h1>
            <p className="text-xs sm:text-sm text-neutral-500 mt-1">
              {itemCount} total item{itemCount !== 1 ? 's' : ''} across {items.length} line{items.length !== 1 ? 's' : ''}
            </p>
          </div>

          {items.length > 0 && (
            <button
              onClick={clearCart}
              className="text-xs text-neutral-500 hover:text-red-600 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Cart</span>
            </button>
          )}
        </div>

        {items.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Items List (8 cols) */}
            <div className="lg:col-span-8 space-y-4">
              <div className="bg-white rounded-2xl border border-neutral-200/90 shadow-xs divide-y divide-neutral-200 overflow-hidden">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    {/* Image & Main Info */}
                    <div className="flex items-start gap-4 flex-1">
                      <img
                        src={item.productImage}
                        alt={item.productTitle}
                        referrerPolicy="no-referrer"
                        className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl object-cover bg-neutral-100 border border-neutral-200 shrink-0"
                      />

                      <div className="space-y-1">
                        <button
                          onClick={() => navigate(`/product/${item.productSlug}`)}
                          className="font-bold text-sm sm:text-base text-neutral-900 hover:text-orange-600 transition-colors text-left line-clamp-2"
                        >
                          {item.productTitle}
                        </button>

                        {/* Variant Attributes Badge */}
                        {item.selectedVariant?.attributes && Object.keys(item.selectedVariant.attributes).length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {Object.entries(item.selectedVariant.attributes).map(([attrK, attrV]) => (
                              <span
                                key={attrK}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-orange-50 border border-orange-200/80 text-[11px] font-semibold text-orange-800"
                              >
                                <span className="text-orange-600 font-bold">{attrK}:</span>
                                <span>{attrV}</span>
                              </span>
                            ))}
                          </div>
                        )}

                        <div className="text-xs text-neutral-500 font-mono pt-1">
                          SKU: <span className="font-semibold text-neutral-700">{item.sku}</span>
                        </div>

                        <div className="text-xs text-neutral-600 font-medium sm:hidden pt-1">
                          Unit: {formatPrice(item.unitPrice)}
                        </div>
                      </div>
                    </div>

                    {/* Quantity & Subtotal Controls */}
                    <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-neutral-100">
                      {/* Quantity Stepper */}
                      <div className="flex items-center border border-neutral-300 rounded-lg bg-white overflow-hidden shadow-2xs">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-2 hover:bg-neutral-100 transition-colors cursor-pointer text-neutral-600"
                          title="Decrease quantity"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <input
                          type="number"
                          min="1"
                          max={item.maxStock || 999}
                          value={item.quantity}
                          onChange={(e) => {
                            const val = parseInt(e.target.value);
                            if (!isNaN(val) && val >= 1) {
                              updateQuantity(item.id, val);
                            }
                          }}
                          className="w-12 text-center text-xs font-bold text-neutral-900 focus:outline-hidden py-1"
                        />
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          disabled={item.quantity >= item.maxStock}
                          className="p-2 hover:bg-neutral-100 disabled:opacity-30 transition-colors cursor-pointer text-neutral-600"
                          title="Increase quantity"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Subtotal */}
                      <div className="text-right min-w-24">
                        <span className="text-sm sm:text-base font-extrabold text-neutral-900 block">
                          {formatPrice(item.subtotal)}
                        </span>
                        <span className="text-[11px] text-neutral-400 hidden sm:block">
                          {item.quantity} × {formatPrice(item.unitPrice)}
                        </span>
                      </div>

                      {/* Remove */}
                      <button
                        onClick={() => removeItem(item.id)}
                        className="p-2 text-neutral-400 hover:text-red-600 transition-colors cursor-pointer rounded-lg hover:bg-red-50"
                        title="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Continue Shopping Button */}
              <div className="pt-2">
                <button
                  onClick={() => navigate('/catalog')}
                  className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-neutral-700 hover:text-orange-600 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Continue Browsing Catalog</span>
                </button>
              </div>
            </div>

            {/* Order Summary Sidebar (4 cols) */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-white rounded-2xl border border-neutral-200/90 p-6 shadow-xs space-y-6">
                <h2 className="text-lg font-bold text-neutral-900 border-b border-neutral-100 pb-3">
                  Order Calculation
                </h2>

                <div className="space-y-3 text-sm text-neutral-600">
                  <div className="flex justify-between">
                    <span>Catalog Subtotal</span>
                    <span className="font-bold text-neutral-900">{formatPrice(subtotal)}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span>Shipping / Delivery</span>
                    <span className="font-bold text-neutral-900">
                      {isFreeShipping ? (
                        <span className="text-emerald-600 font-extrabold">FREE Delivery</span>
                      ) : (
                        formatPrice(shippingFee)
                      )}
                    </span>
                  </div>

                  {settings.freeShippingThreshold > 0 && !isFreeShipping && (
                    <p className="text-[11px] text-neutral-500 bg-orange-50/70 p-2.5 rounded-lg border border-orange-100">
                      Add {formatPrice(settings.freeShippingThreshold - subtotal)} more for free nationwide shipping!
                    </p>
                  )}

                  <div className="border-t border-neutral-200 pt-3 flex justify-between items-baseline">
                    <div>
                      <span className="text-base font-extrabold text-neutral-900 block">Total Amount</span>
                      <span className="text-[11px] text-neutral-400">Includes all line variants</span>
                    </div>
                    <span className="text-2xl font-extrabold text-orange-600">
                      {formatPrice(grandTotal)}
                    </span>
                  </div>
                </div>

                {/* Checkout CTA */}
                <button
                  onClick={() => navigate('/checkout')}
                  className="w-full py-3.5 px-6 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                {/* Trust Badges */}
                <div className="pt-4 border-t border-neutral-100 space-y-2 text-xs text-neutral-500">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-orange-600 shrink-0" />
                    <span>Official GST/NTN Tax Invoicing Available</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-orange-600 shrink-0" />
                    <span>Secure Packaging & Industrial Transit Insurance</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Empty Cart State */
          <div className="bg-white rounded-2xl border border-neutral-200 p-12 text-center max-w-md mx-auto my-12 shadow-xs">
            <div className="w-16 h-16 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center mx-auto mb-4">
              <ShoppingCart className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-neutral-900 mb-2">Your Cart is Empty</h2>
            <p className="text-xs sm:text-sm text-neutral-500 mb-6 leading-relaxed">
              You have not added any industrial gauges, transmitters, or accessories to your cart yet.
            </p>
            <button
              onClick={() => navigate('/catalog')}
              className="px-6 py-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs sm:text-sm shadow-xs transition-all cursor-pointer"
            >
              Browse Catalog
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
