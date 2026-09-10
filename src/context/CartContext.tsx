import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, Product, ProductVariant } from '../types';

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, quantity: number, variant?: ProductVariant | { attributes: Record<string, string>; price?: number; sku?: string; stock?: number; id?: string }) => void;
  addMultipleItems: (selections: Array<{ product: Product; quantity: number; variant?: ProductVariant | { attributes: Record<string, string>; price?: number; sku?: string; stock?: number; id?: string } }>) => void;
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
      return saved ? JSON.parse(saved) : [];
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
    variant?: ProductVariant | { attributes: Record<string, string>; price?: number; sku?: string; stock?: number; id?: string }
  ) => {
    if (quantity <= 0) return;

    setItems((prevItems) => {
      const unitPrice = variant?.price ?? (product.salePrice && product.salePrice > 0 ? product.salePrice : product.price);
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
          quantity: newQty,
          subtotal: newQty * unitPrice,
        };
        return updated;
      } else {
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
          quantity: Math.min(quantity, maxStock),
          subtotal: Math.min(quantity, maxStock) * unitPrice,
          maxStock,
        };
        return [...prevItems, newItem];
      }
    });
  };

  const addMultipleItems = (
    selections: Array<{ product: Product; quantity: number; variant?: ProductVariant | { attributes: Record<string, string>; price?: number; sku?: string; stock?: number; id?: string } }>
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
            subtotal: validatedQty * item.unitPrice,
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
