import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, Category, Banner, StoreSettings, PaymentAccount } from '../types';
import {
  subscribeToProducts,
  subscribeToCategories,
  subscribeToBanners,
  subscribeToSettings,
  subscribeToPaymentAccounts
} from '../services/firestoreService';
import { DEFAULT_STORE_SETTINGS, OFFICIAL_CATEGORIES, DEFAULT_BANNERS, SAMPLE_PRODUCTS } from '../data/defaults';

const INITIAL_CATEGORIES: Category[] = OFFICIAL_CATEGORIES.map((c, idx) => ({
  ...c,
  id: `cat-default-${idx + 1}`,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
}));

const INITIAL_BANNERS: Banner[] = DEFAULT_BANNERS.map((b, idx) => ({
  ...b,
  id: `banner-default-${idx + 1}`,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
}));

const INITIAL_PRODUCTS: Product[] = (SAMPLE_PRODUCTS as any[]).map((p, idx) => ({
  ...p,
  id: `prod-default-${idx + 1}`,
  categoryId: p.categoryId || 'cat-default-1',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
}));

interface StoreContextType {
  products: Product[];
  categories: Category[];
  banners: Banner[];
  paymentAccounts: PaymentAccount[];
  activePaymentAccounts: PaymentAccount[];
  defaultPaymentAccount?: PaymentAccount;
  settings: StoreSettings;
  loading: boolean;
  publishedProducts: Product[];
  activeCategories: Category[];
  activeBanners: Banner[];
  featuredProducts: Product[];
  formatPrice: (val?: number) => string;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [banners, setBanners] = useState<Banner[]>(INITIAL_BANNERS);
  const [paymentAccounts, setPaymentAccounts] = useState<PaymentAccount[]>([]);
  const [settings, setSettings] = useState<StoreSettings>(DEFAULT_STORE_SETTINGS);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(false);

  useEffect(() => {
    // 1. Subscribe to Products
    const unsubProducts = subscribeToProducts(
      (data) => {
        setProducts(data);
        setLoadingProducts(false);
      },
      (err) => {
        console.warn('Products subscription note:', err);
        setLoadingProducts(false);
      }
    );

    // 2. Subscribe to Categories
    const unsubCategories = subscribeToCategories(
      (data) => {
        setCategories(data);
        setLoadingCategories(false);
      },
      (err) => {
        console.warn('Categories subscription note:', err);
        setLoadingCategories(false);
      }
    );

    // 3. Subscribe to Banners
    const unsubBanners = subscribeToBanners(
      (data) => {
        setBanners(data);
      },
      (err) => {
        console.warn('Banners subscription note:', err);
      }
    );

    // 4. Subscribe to Settings
    const unsubSettings = subscribeToSettings(
      (data) => {
        setSettings(data);
      },
      (err) => {
        console.warn('Settings subscription note:', err);
      }
    );

    // 5. Subscribe to Payment Accounts
    const unsubPayments = subscribeToPaymentAccounts(
      (data) => {
        setPaymentAccounts(data);
      },
      (err) => {
        console.warn('Payment accounts subscription note:', err);
      }
    );

    return () => {
      unsubProducts();
      unsubCategories();
      unsubBanners();
      unsubSettings();
      unsubPayments();
    };
  }, []);

  const publishedProducts = products.filter((p) => p.published !== false);
  const activeCategories = categories.filter((c) => c.active !== false);
  const activeBanners = banners.filter((b) => b.active !== false);
  const featuredProducts = publishedProducts.filter((p) => p.featured === true);
  const activePaymentAccounts = paymentAccounts.filter((a) => a.active !== false);
  const defaultPaymentAccount = activePaymentAccounts.find((a) => a.isDefault) || activePaymentAccounts[0];

  const formatPrice = (val?: number): string => {
    if (val === undefined || val === null || isNaN(val)) return 'Price on Request';
    const symbol = settings.currencySymbol || 'Rs.';
    return `${symbol} ${val.toLocaleString()}`;
  };

  const loading = loadingProducts || loadingCategories;

  return (
    <StoreContext.Provider
      value={{
        products,
        categories,
        banners,
        paymentAccounts,
        activePaymentAccounts,
        defaultPaymentAccount,
        settings,
        loading,
        publishedProducts,
        activeCategories,
        activeBanners,
        featuredProducts,
        formatPrice,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
