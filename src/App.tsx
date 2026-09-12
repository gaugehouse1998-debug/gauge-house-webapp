import React, { useState, useEffect } from 'react';
import { ShieldAlert } from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
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
  const { user, isAdmin, loading: authLoading } = useAuth();

  const normalizeRoute = (rawRoute: string): string => {
    let route = (rawRoute || '').trim();
    // Strip leading hashes
    route = route.replace(/^#+/, '');
    
    // Ignore pure anchor hashes like why-gauge-house or contact
    if (route === 'why-gauge-house' || route === 'contact') {
      return '/';
    }

    // Dynamically strip GitHub Pages repo path if hosted on *.github.io
    if (typeof window !== 'undefined' && window.location.hostname.includes('github.io')) {
      const segments = window.location.pathname.split('/').filter(Boolean);
      if (segments.length > 0) {
        const repoPrefix = '/' + segments[0];
        if (route.startsWith(repoPrefix + '/')) {
          route = route.slice(repoPrefix.length);
        } else if (route === repoPrefix) {
          route = '/';
        } else if (route.startsWith(segments[0] + '/')) {
          route = '/' + route.slice(segments[0].length + 1);
        } else if (route === segments[0]) {
          route = '/';
        }
      }
    }

    // Strip known hardcoded repo variations
    if (route.startsWith('/gauge-house-webapp/')) {
      route = route.slice('/gauge-house-webapp/'.length - 1);
    } else if (route === '/gauge-house-webapp') {
      route = '/';
    } else if (route.startsWith('gauge-house-webapp/')) {
      route = '/' + route.slice('gauge-house-webapp/'.length);
    } else if (route === 'gauge-house-webapp') {
      route = '/';
    }

    // Strip query params for route matching
    const baseRoute = route.split('?')[0];

    // Ensure leading slash if not empty
    if (!baseRoute.startsWith('/')) {
      return '/' + baseRoute;
    }

    return baseRoute || '/';
  };

  // Navigation route state
  const [currentRoute, setCurrentRoute] = useState<string>(() => {
    const hash = window.location.hash;
    if (hash && hash !== '#') {
      return normalizeRoute(hash);
    }
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

  // Auto-seed default official categories only if admin and Firestore has none yet
  useEffect(() => {
    if (isAdmin && !loading && categories.length === 0) {
      seedDefaultCategories().catch((e) => console.log('Auto-seed check note:', e));
    }
  }, [isAdmin, loading, categories.length]);

  // Sync route on popstate and hashchange
  useEffect(() => {
    const handleLocationChange = () => {
      const hash = window.location.hash;
      const rawRoute = (hash && hash !== '#') ? hash : (window.location.pathname || '/');
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
    // Handle anchor links like /#why-gauge-house or #contact
    if (route.startsWith('/#') || route.startsWith('#')) {
      const elementId = route.replace(/^\/?#/, '');
      const el = document.getElementById(elementId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
        return;
      }
      // If not on homepage, navigate to homepage first then scroll
      setCurrentRoute('/');
      window.location.hash = '/';
      setTimeout(() => {
        const elDelayed = document.getElementById(elementId);
        if (elDelayed) elDelayed.scrollIntoView({ behavior: 'smooth' });
      }, 100);
      return;
    }

    const cleanRoute = route.startsWith('/') ? route : '/' + route;
    window.location.hash = cleanRoute;
    setCurrentRoute(cleanRoute);
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
      if (user && !isAdmin && !authLoading) {
        return (
          <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center bg-neutral-50 py-16">
            <div className="max-w-md w-full bg-white rounded-3xl border border-neutral-200 p-8 shadow-xs">
              <div className="w-16 h-16 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
                <ShieldAlert className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-black text-neutral-900 mb-2">Access Denied</h2>
              <p className="text-neutral-600 text-xs sm:text-sm mb-6 leading-relaxed">
                The Administration Portal is restricted to authorized Gauge House management. Your account does not have administrator privileges.
              </p>
              <button
                onClick={() => navigate('/')}
                className="w-full px-6 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Return to Storefront
              </button>
            </div>
          </div>
        );
      }
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
