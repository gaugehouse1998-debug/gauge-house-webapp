import React, { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { StoreProvider, useStore } from './context/StoreContext';
import { CartProvider } from './context/CartContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HomePage } from './components/HomePage';
import { CatalogPage } from './components/CatalogPage';
import { ProductDetailPage } from './components/ProductDetailPage';
import { CartPage } from './components/CartPage';
import { CheckoutPage } from './components/CheckoutPage';
import { OrderConfirmationPage } from './components/OrderConfirmationPage';
import { AccountPage } from './components/AccountPage';
import { AdminPortal } from './components/admin/AdminPortal';
import { SearchModal } from './components/SearchModal';
import { QuickViewModal } from './components/QuickViewModal';
import { Product, Order } from './types';
import { seedDefaultCategories } from './services/firestoreService';

function MainApp() {
  const { publishedProducts, categories, loading } = useStore();

  const normalizeRoute = (rawRoute: string): string => {
    let route = rawRoute;
    if (route.startsWith('/gauge-house-webapp/')) {
      route = route.slice('/gauge-house-webapp/'.length - 1);
    } else if (route === '/gauge-house-webapp') {
      route = '/';
    }
    return route || '/';
  };

  // Navigation route state
  const [currentRoute, setCurrentRoute] = useState<string>(() => {
    const hash = window.location.hash.replace(/^#/, '');
    if (hash) return normalizeRoute(hash);
    return normalizeRoute(window.location.pathname || '/');
  });

  // Modals & temporary views state
  const [searchOpen, setSearchOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [lastPlacedOrder, setLastPlacedOrder] = useState<Order | null>(() => {
    try {
      const saved = sessionStorage.getItem('gh_last_order');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Auto-seed default official categories if Firestore has none yet
  useEffect(() => {
    if (!loading && categories.length === 0) {
      seedDefaultCategories().catch((e) => console.log('Auto-seed check note:', e));
    }
  }, [loading, categories.length]);

  // Sync route on popstate and hashchange
  useEffect(() => {
    const handleLocationChange = () => {
      const hash = window.location.hash.replace(/^#/, '');
      const rawRoute = hash || window.location.pathname || '/';
      setCurrentRoute(normalizeRoute(rawRoute));
    };

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);

  // Global Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const navigate = (route: string) => {
    window.location.hash = route;
    setCurrentRoute(route);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOrderSuccess = (order: Order) => {
    setLastPlacedOrder(order);
    try {
      sessionStorage.setItem('gh_last_order', JSON.stringify(order));
    } catch (e) {
      console.warn('Session save note:', e);
    }
    navigate('/order-confirmation');
  };

  // Route matching logic
  const renderRouteContent = () => {
    // 1. Admin Portal
    if (currentRoute === '/admin' || currentRoute.startsWith('/admin/')) {
      return <AdminPortal navigate={navigate} />;
    }

    // 2. Product Detail Page: /product/:slug
    if (currentRoute.startsWith('/product/')) {
      const slug = currentRoute.replace('/product/', '').split('?')[0];
      const product = publishedProducts.find((p) => p.slug === slug);

      if (product) {
        return <ProductDetailPage product={product} navigate={navigate} />;
      }

      if (loading) {
        return (
          <div className="min-h-[60vh] flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-orange-600 border-t-transparent rounded-full animate-spin" />
          </div>
        );
      }

      return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
          <h2 className="text-2xl font-bold text-neutral-900 mb-2">Product Not Found</h2>
          <p className="text-neutral-500 text-xs sm:text-sm mb-6 max-w-sm">
            The requested industrial product may have been updated or moved.
          </p>
          <button
            onClick={() => navigate('/catalog')}
            className="px-6 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold"
          >
            Browse All Products
          </button>
        </div>
      );
    }

    // 3. Category Catalog: /category/:slug
    if (currentRoute.startsWith('/category/')) {
      const catSlug = currentRoute.replace('/category/', '').split('?')[0];
      return <CatalogPage navigate={navigate} initialCategorySlug={catSlug} />;
    }

    // 4. Catalog Page: /catalog
    if (currentRoute.startsWith('/catalog')) {
      const urlParams = new URLSearchParams(currentRoute.includes('?') ? currentRoute.split('?')[1] : '');
      const q = urlParams.get('q') || '';
      return <CatalogPage navigate={navigate} initialSearchQuery={q} />;
    }

    // 5. Cart Page: /cart
    if (currentRoute === '/cart') {
      return <CartPage navigate={navigate} />;
    }

    // 6. Checkout Page: /checkout
    if (currentRoute === '/checkout') {
      return <CheckoutPage navigate={navigate} onOrderSuccess={handleOrderSuccess} />;
    }

    // 7. Order Confirmation Page: /order-confirmation
    if (currentRoute === '/order-confirmation') {
      if (lastPlacedOrder) {
        return <OrderConfirmationPage order={lastPlacedOrder} navigate={navigate} />;
      }
      return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
          <h2 className="text-xl font-bold text-neutral-900 mb-2">No Active Order Selected</h2>
          <p className="text-neutral-500 text-xs sm:text-sm mb-6">
            View your placed orders in your customer account or browse the catalog.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/account')}
              className="px-5 py-2.5 bg-neutral-900 text-white rounded-xl text-xs font-bold"
            >
              Customer Account
            </button>
            <button
              onClick={() => navigate('/catalog')}
              className="px-5 py-2.5 bg-orange-600 text-white rounded-xl text-xs font-bold"
            >
              Browse Catalog
            </button>
          </div>
        </div>
      );
    }

    // 8. Account / Orders: /account
    if (currentRoute === '/account') {
      return (
        <AccountPage
          navigate={navigate}
          onSelectOrder={(order) => {
            setLastPlacedOrder(order);
            navigate('/order-confirmation');
          }}
        />
      );
    }

    // Default: Home Page: /
    return <HomePage navigate={navigate} />;
  };

  const isAdminRoute = currentRoute === '/admin' || currentRoute.startsWith('/admin/');

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 font-sans text-neutral-900 antialiased selection:bg-orange-500 selection:text-white">
      {/* Customer Header (hidden on Admin route) */}
      {!isAdminRoute && (
        <Header
          currentRoute={currentRoute}
          navigate={navigate}
          onOpenSearch={() => setSearchOpen(true)}
        />
      )}

      {/* Main Page View */}
      <main className="flex-1">
        {renderRouteContent()}
      </main>

      {/* Customer Footer (hidden on Admin route) */}
      {!isAdminRoute && <Footer navigate={navigate} />}

      {/* Instant Search Overlay */}
      <SearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        navigate={navigate}
      />

      {/* Quick View Modal */}
      <QuickViewModal
        product={quickViewProduct}
        isOpen={!!quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        navigate={navigate}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <StoreProvider>
        <CartProvider>
          <MainApp />
        </CartProvider>
      </StoreProvider>
    </AuthProvider>
  );
}
