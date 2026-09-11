import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, Product, ProductVariant } from '../types';
import { getItemPriceBreakdown, calculateLineSubtotal } from '../utils/pricing';

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, quantity: number, variant?: ProductVariant | { attributes: Record<string, string>; price?: number; salePrice?: number; sku?: string; stock?: number; id?: string }) => void;
  addMultipleItems: (selections: Array<{ product: Product; quantity: number; variant?: ProductVariant | { attributes: Record<string, string>; price?: number; salePrice?: number; sku?: string; stock?: number; id?: string } }>) => void;
  updateQuantity: (id: string, qty: number) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  itemCount: number;
  subtotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'gauge_house_cart_v1';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      if (!saved) return [];
      const parsed: CartItem[] = JSON.parse(saved);
      // Ensure all persisted cart items have strictly recalculated subtotals based on selling unitPrice
      return parsed.map((item) => {
        const effectiveUnit = (item.discountPrice && item.discountPrice > 0) ? item.discountPrice : item.unitPrice;
        return {
          ...item,
          unitPrice: effectiveUnit,
          subtotal: calculateLineSubtotal(effectiveUnit, item.quantity),
        };
      });
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.warn('Failed to save cart to localStorage', e);
    }
  }, [items]);

  const generateCartItemId = (productId: string, attributes?: Record<string, string>): string => {
    if (!attributes || Object.keys(attributes).length === 0) {
      return `${productId}_base`;
    }
    const sortedKeys = Object.keys(attributes).sort();
    const attrString = sortedKeys.map(k => `${k}:${attributes[k]}`).join('|');
    return `${productId}__${attrString}`;
  };

  const addItem = (
    product: Product,
    quantity: number,
    variant?: ProductVariant | { attributes: Record<string, string>; price?: number; salePrice?: number; sku?: string; stock?: number; id?: string }
  ) => {
    if (quantity <= 0) return;

    setItems((prevItems) => {
      const priceInfo = getItemPriceBreakdown(product, variant);
      const unitPrice = priceInfo.sellingPrice; // Discount Price if discount exists, else Regular Price
      const regularPrice = priceInfo.regularPrice;
      const discountPrice = priceInfo.discountPrice;
      const hasDiscount = priceInfo.hasDiscount;

      const sku = variant?.sku || product.sku || 'GH-ITEM';
      const maxStock = variant?.stock ?? product.stock ?? 999;
      const id = generateCartItemId(product.id, variant?.attributes);

      const existingIndex = prevItems.findIndex((item) => item.id === id);

      if (existingIndex > -1) {
        const existing = prevItems[existingIndex];
        const newQty = Math.min(existing.quantity + quantity, maxStock);
        const updated = [...prevItems];
        updated[existingIndex] = {
          ...existing,
          unitPrice,
          regularPrice,
          discountPrice,
          hasDiscount,
          quantity: newQty,
          subtotal: calculateLineSubtotal(unitPrice, newQty),
        };
        return updated;
      } else {
        const finalQty = Math.min(quantity, maxStock);
        const newItem: CartItem = {
          id,
          productId: product.id,
          productTitle: product.title,
          productSlug: product.slug,
          productImage: product.images?.[0] || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=400&q=80',
          sku,
          selectedVariant: variant?.attributes ? {
            id: variant.id,
            attributes: variant.attributes,
          } : undefined,
          unitPrice,
          regularPrice,
          discountPrice,
          hasDiscount,
          quantity: finalQty,
          subtotal: calculateLineSubtotal(unitPrice, finalQty),
          maxStock,
        };
        return [...prevItems, newItem];
      }
    });
  };

  const addMultipleItems = (
    selections: Array<{ product: Product; quantity: number; variant?: ProductVariant | { attributes: Record<string, string>; price?: number; salePrice?: number; sku?: string; stock?: number; id?: string } }>
  ) => {
    selections.forEach(sel => {
      addItem(sel.product, sel.quantity, sel.variant);
    });
  };

  const updateQuantity = (id: string, qty: number) => {
    if (qty <= 0) {
      removeItem(id);
      return;
    }
    setItems((prevItems) =>
      prevItems.map((item) => {
        if (item.id === id) {
          const validatedQty = Math.min(qty, item.maxStock || 999);
          return {
            ...item,
            quantity: validatedQty,
            subtotal: calculateLineSubtotal(item.unitPrice, validatedQty),
          };
        }
        return item;
      })
    );
  };

  const removeItem = (id: string) => {
    setItems((prevItems) => prevItems.filter((item) => item.id !== id));
  };

  const clearCart = () => {
    setItems([]);
  };

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        addMultipleItems,
        updateQuantity,
        removeItem,
        clearCart,
        itemCount,
        subtotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
