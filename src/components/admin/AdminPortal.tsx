import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  FolderTree,
  Sliders,
  Settings,
  Shield,
  Plus,
  Trash2,
  Edit2,
  ExternalLink,
  Eye,
  CheckCircle2,
  Clock,
  AlertTriangle,
  RefreshCw,
  LogOut,
  Save,
  Printer,
  ChevronRight,
  Search,
  Database,
  Layers,
  FileSpreadsheet,
  Lock,
  Mail,
  EyeOff,
  Users,
  UserCheck,
  UserPlus,
  Award,
  Copy
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useStore } from '../../context/StoreContext';
import {
  saveProductInFirestore,
  deleteProductInFirestore,
  saveCategoryInFirestore,
  deleteCategoryInFirestore,
  saveBannerInFirestore,
  deleteBannerInFirestore,
  updateOrderStatusInFirestore,
  saveStoreSettingsInFirestore,
  subscribeToOrders,
  subscribeToCustomers,
  saveCustomerProfile,
  seedDefaultCategories,
  seedSampleProducts,
  clearSampleProducts
} from '../../services/firestoreService';
import { Product, Category, Banner, Order, StoreSettings, CustomerUser } from '../../types';
import { AdminProductModal } from './AdminProductModal';
import { CustomersView } from './CustomersView';
import { SingleImageUploader } from './ImageUploader';
import { deleteImageFromStorage } from '../../lib/storageService';

interface AdminPortalProps {
  navigate: (route: string) => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({ navigate }) => {
  const { user, isAdmin, loading: authLoading, signInWithEmail, signOut, refreshAdminStatus } = useAuth();
  const { products, categories, banners, settings, formatPrice } = useStore();

  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'orders' | 'customers' | 'leads' | 'products' | 'categories' | 'banners' | 'settings' | 'tools'
  >('dashboard');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  // Customers Database State
  const [customers, setCustomers] = useState<CustomerUser[]>([]);
  const [loadingCustomers, setLoadingCustomers] = useState(true);

  // Admin email/password login form state
  const [adminEmail, setAdminEmail] = useState('gaugehouse1998@gmail.com');
  const [adminPassword, setAdminPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [signingIn, setSigningIn] = useState(false);

  const handleAdminSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminEmail.trim() || !adminPassword) {
      setAuthError('Please enter both your administrative email and password.');
      return;
    }
    setAuthError(null);
    setSigningIn(true);
    try {
      await signInWithEmail(adminEmail.trim(), adminPassword);
    } catch (err: any) {
      const code = err?.code || '';
      const msg = err?.message || '';
      if (
        code === 'auth/invalid-credential' ||
        code === 'auth/wrong-password' ||
        code === 'auth/user-not-found' ||
        code === 'auth/invalid-email'
      ) {
        setAuthError('Invalid administrator email or password. Please verify your credentials.');
      } else if (code === 'auth/too-many-requests') {
        setAuthError('Too many failed attempts. Please wait a moment before trying again.');
      } else if (msg.includes('Access Denied')) {
        setAuthError(msg);
      } else {
        setAuthError(msg || 'Authentication failed. Please verify your credentials.');
      }
    } finally {
      setSigningIn(false);
    }
  };

  // Product Modal State
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Selected Order for Modal/Inspection
  const [inspectingOrder, setInspectingOrder] = useState<Order | null>(null);

  // Filter States
  const [productSearch, setProductSearch] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState('all');
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  const [orderSearch, setOrderSearch] = useState('');

  // Category Edit State
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [catName, setCatName] = useState('');
  const [catSlug, setCatSlug] = useState('');
  const [catDesc, setCatDesc] = useState('');
  const [catImage, setCatImage] = useState('');
  const [catOrder, setCatOrder] = useState(0);

  // Banner Edit State
  const [bannerModalOpen, setBannerModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [banTitle, setBanTitle] = useState('');
  const [banSubtitle, setBanSubtitle] = useState('');
  const [banImage, setBanImage] = useState('');
  const [banCta, setBanCta] = useState('');
  const [banLink, setBanLink] = useState('');
  const [isSavingBanner, setIsSavingBanner] = useState(false);
  const [bannerError, setBannerError] = useState<string | null>(null);

  const [isSavingCategory, setIsSavingCategory] = useState(false);
  const [categoryError, setCategoryError] = useState<string | null>(null);

  // Global Notification State
  const [notification, setNotification] = useState<{
    type: 'success' | 'warning' | 'error';
    message: string;
  } | null>(null);

  const showNotification = (type: 'success' | 'warning' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification((curr) => (curr?.message === message ? null : curr));
    }, 6000);
  };

  // Delete Confirmation Modal State
  const [deleteModal, setDeleteModal] = useState<{
    open: boolean;
    type: 'banner' | 'product' | 'category';
    id: string;
    title: string;
    imageUrl?: string;
    isDeleting: boolean;
    error: string | null;
  }>({
    open: false,
    type: 'banner',
    id: '',
    title: '',
    imageUrl: undefined,
    isDeleting: false,
    error: null,
  });

  // Settings form state
  const [settingsForm, setSettingsForm] = useState<StoreSettings>(settings);
  const [settingsSavedMessage, setSettingsSavedMessage] = useState(false);

  // Tools feedback
  const [toolsMessage, setToolsMessage] = useState<string | null>(null);

  useEffect(() => {
    setSettingsForm(settings);
  }, [settings]);

  // Subscribe to all orders and customers for admin
  useEffect(() => {
    if (!isAdmin) return;

    const unsubOrders = subscribeToOrders(
      (data) => {
        setOrders(data);
        setLoadingOrders(false);
      },
      (err) => {
        console.warn('Orders fetch note:', err);
        setLoadingOrders(false);
      }
    );

    const unsubCustomers = subscribeToCustomers(
      (data) => {
        setCustomers(data);
        setLoadingCustomers(false);
      },
      (err) => {
        console.warn('Customers fetch note:', err);
        setLoadingCustomers(false);
      }
    );

    return () => {
      unsubOrders();
      unsubCustomers();
    };
  }, [isAdmin]);

  // Handle Auth Gate
  if (authLoading) {
    return (
      <div className="min-h-screen bg-neutral-900 flex items-center justify-center text-white">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-semibold text-neutral-400">Verifying Administrative Access...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl p-8 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-orange-600/20 text-orange-500 border border-orange-500/30 flex items-center justify-center mx-auto shadow-inner">
              <Shield className="w-7 h-7" />
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              Gauge House Admin Portal
            </h1>
            <p className="text-xs text-neutral-400">
              Sign in with your authorized administrator credentials
            </p>
          </div>

          {authError && (
            <div className="p-3.5 rounded-xl bg-red-950/70 border border-red-800 text-xs text-red-200 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleAdminSignIn} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
                Admin Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  autoComplete="username"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="gaugehouse1998@gmail.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs sm:text-sm text-white placeholder-neutral-500 focus:outline-hidden focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs sm:text-sm text-white placeholder-neutral-500 focus:outline-hidden focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={signingIn}
              className="w-full py-3 px-4 rounded-xl bg-orange-600 hover:bg-orange-500 disabled:opacity-60 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-orange-600/20"
            >
              {signingIn && <RefreshCw className="w-4 h-4 animate-spin" />}
              <span>{signingIn ? 'Verifying Credentials...' : 'Sign In'}</span>
            </button>
          </form>

          <div className="pt-2 border-t border-neutral-800 text-center">
            <button
              onClick={() => navigate('/')}
              className="text-xs text-neutral-500 hover:text-neutral-300 transition-colors cursor-pointer"
            >
              ← Return to Customer Storefront
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl p-8 text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-red-600/20 text-red-500 border border-red-500/30 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-8 h-8" />
          </div>

          <div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">Access Restricted</h1>
            <p className="text-xs text-neutral-400 mt-1">
              The account <strong>{user.email}</strong> is not authorized to access the Gauge House Administration Panel.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={() => signOut()}
              className="w-full py-2.5 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              Sign Out &amp; Return to Login
            </button>

            <button
              onClick={() => navigate('/')}
              className="text-xs text-neutral-500 hover:text-neutral-300 pt-2"
            >
              ← Back to Catalog
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Admin Calculations
  const totalProducts = products.length;
  const activeProducts = products.filter((p) => p.published !== false).length;
  const totalCategories = categories.length;
  const totalOrders = orders.length;
  const pendingOrders = orders.filter((o) => ['new', 'confirmed', 'processing'].includes(o.status)).length;
  const completedOrders = orders.filter((o) => o.status === 'completed').length;
  const totalRevenue = orders.reduce((sum, o) => sum + (o.status !== 'cancelled' ? o.total : 0), 0);

  // Customer & Lead Calculations (Section 8)
  const totalCustomers = customers.length;
  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
  const newCustomers = customers.filter(
    (c) => c.createdAt && new Date(c.createdAt).getTime() >= thirtyDaysAgo
  ).length;

  const purchasingCustomerUids = new Set<string>();
  orders.forEach((o) => {
    if (o.customerUid) purchasingCustomerUids.add(o.customerUid);
    if (o.customer?.userId) purchasingCustomerUids.add(o.customer.userId);
  });

  const purchasingCustomers = customers.filter(
    (c) =>
      c.purchaseStatus === 'purchased' ||
      (c.orderCount || 0) > 0 ||
      purchasingCustomerUids.has(c.uid)
  );
  const purchasingCustomersCount = purchasingCustomers.length;
  const noPurchaseCustomersCount = Math.max(0, totalCustomers - purchasingCustomersCount);

  // Repeat customers (more than 1 order)
  const repeatCustomersCount = customers.filter((c) => {
    if ((c.orderCount || 0) > 1) return true;
    const customerOrders = orders.filter(
      (o) =>
        o.customerUid === c.uid ||
        o.customer?.userId === c.uid ||
        (c.email && o.customer?.email?.toLowerCase() === c.email.toLowerCase())
    );
    return customerOrders.length > 1;
  }).length;

  const handleUpdateCustomerStatus = async (uid: string, status: 'active' | 'suspended') => {
    try {
      await saveCustomerProfile({ uid, accountStatus: status });
      showNotification('success', `Customer account status updated to ${status}.`);
    } catch (err: any) {
      showNotification('error', err?.message || 'Failed to update customer status.');
    }
  };

  // Filtered Products
  const filteredProducts = products.filter((p) => {
    if (productCategoryFilter !== 'all' && p.category !== productCategoryFilter) return false;
    if (productSearch.trim()) {
      const q = productSearch.toLowerCase().trim();
      return (
        p.title.toLowerCase().includes(q) ||
        p.sku?.toLowerCase().includes(q) ||
        p.brand?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Filtered Orders
  const filteredOrders = orders.filter((o) => {
    if (orderStatusFilter !== 'all' && o.status !== orderStatusFilter) return false;
    if (orderSearch.trim()) {
      const q = orderSearch.toLowerCase().trim();
      return (
        o.orderNumber?.toLowerCase().includes(q) ||
        o.customer?.fullName?.toLowerCase().includes(q) ||
        o.customer?.phone?.toLowerCase().includes(q) ||
        o.customer?.city?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Handlers for Products
  const handleOpenNewProduct = () => {
    setEditingProduct(null);
    setProductModalOpen(true);
  };

  const handleEditProduct = (p: Product) => {
    setEditingProduct(p);
    setProductModalOpen(true);
  };

  const promptDeleteProduct = (p: Product) => {
    setDeleteModal({
      open: true,
      type: 'product',
      id: p.id,
      title: p.title,
      imageUrl: p.images?.[0],
      isDeleting: false,
      error: null,
    });
  };

  const promptDeleteCategory = (c: Category) => {
    setDeleteModal({
      open: true,
      type: 'category',
      id: c.id,
      title: c.name,
      imageUrl: c.imageUrl || c.image,
      isDeleting: false,
      error: null,
    });
  };

  const promptDeleteBanner = (b: Banner) => {
    setDeleteModal({
      open: true,
      type: 'banner',
      id: b.id,
      title: b.title,
      imageUrl: b.imageUrl || b.image,
      isDeleting: false,
      error: null,
    });
  };

  const handleConfirmDelete = async () => {
    if (!deleteModal.id) return;
    setDeleteModal((prev) => ({ ...prev, isDeleting: true, error: null }));

    try {
      if (deleteModal.type === 'banner') {
        const ban = banners.find((b) => b.id === deleteModal.id);
        const imageUrl = ban?.imageUrl || ban?.image || deleteModal.imageUrl;

        // 1. Delete Firestore banner document
        await deleteBannerInFirestore(deleteModal.id);

        // 2. Delete corresponding image file from storage if present
        let storageWarning: string | null = null;
        if (imageUrl) {
          try {
            const res = await deleteImageFromStorage(imageUrl);
            if (!res.storageCleaned && res.error) {
              storageWarning = res.error;
            }
          } catch (storageErr: any) {
            storageWarning = storageErr?.message || 'Storage cleanup warning';
          }
        }

        if (storageWarning) {
          showNotification('warning', `Hero banner "${deleteModal.title}" deleted from Firestore. (Storage note: ${storageWarning})`);
        } else {
          showNotification('success', `Hero banner "${deleteModal.title}" permanently deleted from Firestore and storefront.`);
        }
      } else if (deleteModal.type === 'product') {
        const prod = products.find((p) => p.id === deleteModal.id);
        await deleteProductInFirestore(deleteModal.id);
        if (prod?.images && prod.images.length > 0) {
          for (const img of prod.images) {
            await deleteImageFromStorage(img);
          }
        }
        showNotification('success', `Product "${deleteModal.title}" deleted from Firestore.`);
      } else if (deleteModal.type === 'category') {
        const cat = categories.find((c) => c.id === deleteModal.id);
        await deleteCategoryInFirestore(deleteModal.id);
        if (cat?.image || cat?.imageUrl) {
          await deleteImageFromStorage(cat.image || cat.imageUrl || '');
        }
        showNotification('success', `Category "${deleteModal.title}" deleted from Firestore.`);
      }

      setDeleteModal({
        open: false,
        type: 'banner',
        id: '',
        title: '',
        imageUrl: undefined,
        isDeleting: false,
        error: null,
      });
    } catch (err: any) {
      console.error('Delete operation failed:', err);
      setDeleteModal((prev) => ({
        ...prev,
        isDeleting: false,
        error: err?.message || 'Failed to delete from Firestore. Please try again.',
      }));
    }
  };

  const handleSaveProduct = async (data: Partial<Product>) => {
    const payload = editingProduct?.id ? { ...data, id: editingProduct.id } : data;
    await saveProductInFirestore(payload as any);
    showNotification('success', `Product "${data.title || ''}" saved successfully.`);
  };

  // Handlers for Category
  const handleOpenNewCategory = () => {
    setEditingCategory(null);
    setCatName('');
    setCatSlug('');
    setCatDesc('');
    setCatImage('');
    setCatOrder(categories.length);
    setCategoryError(null);
    setCategoryModalOpen(true);
  };

  const handleEditCategory = (c: Category) => {
    setEditingCategory(c);
    setCatName(c.name);
    setCatSlug(c.slug);
    setCatDesc(c.description || '');
    setCatImage(c.imageUrl || c.image || '');
    setCatOrder(c.displayOrder || 0);
    setCategoryError(null);
    setCategoryModalOpen(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) {
      setCategoryError('Category title is required.');
      return;
    }
    setIsSavingCategory(true);
    setCategoryError(null);

    try {
      const catPayload: any = {
        name: catName.trim(),
        slug: catSlug.trim() || catName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        description: catDesc.trim(),
        image: catImage.trim() || '',
        imageUrl: catImage.trim() || '',
        displayOrder: Number(catOrder) || 0,
        active: true,
      };
      if (editingCategory?.id) catPayload.id = editingCategory.id;
      await saveCategoryInFirestore(catPayload);
      showNotification('success', `Category "${catPayload.name}" saved successfully.`);
      setCategoryModalOpen(false);
    } catch (err: any) {
      console.error('Failed to save category:', err);
      setCategoryError(err?.message || 'Failed to save category to Firestore.');
    } finally {
      setIsSavingCategory(false);
    }
  };

  // Handlers for Banners
  const handleOpenNewBanner = () => {
    setEditingBanner(null);
    setBanTitle('');
    setBanSubtitle('');
    setBanImage('');
    setBanCta('Explore Full Catalog');
    setBanLink('/catalog');
    setBannerError(null);
    setBannerModalOpen(true);
  };

  const handleEditBanner = (b: Banner) => {
    setEditingBanner(b);
    setBanTitle(b.title);
    setBanSubtitle(b.subtitle || '');
    setBanImage(b.imageUrl || b.image || '');
    setBanCta(b.ctaText || b.buttonText || 'Explore Full Catalog');
    setBanLink(b.targetUrl || b.destination || '/catalog');
    setBannerError(null);
    setBannerModalOpen(true);
  };

  const handleSaveBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!banTitle.trim()) {
      setBannerError('Headline title is required.');
      return;
    }
    if (!banImage.trim()) {
      setBannerError('Please upload or select an image for the hero banner.');
      return;
    }

    setIsSavingBanner(true);
    setBannerError(null);

    try {
      const bannerPayload: any = {
        title: banTitle.trim(),
        subtitle: banSubtitle.trim(),
        imageUrl: banImage.trim(),
        image: banImage.trim(),
        ctaText: banCta.trim() || 'Explore Full Catalog',
        buttonText: banCta.trim() || 'Explore Full Catalog',
        targetUrl: banLink.trim() || '/catalog',
        destination: banLink.trim() || '/catalog',
        active: true,
      };
      if (editingBanner?.id) bannerPayload.id = editingBanner.id;
      await saveBannerInFirestore(bannerPayload);
      showNotification('success', `Hero banner "${bannerPayload.title}" saved successfully to Firestore!`);
      setBannerModalOpen(false);
    } catch (err: any) {
      console.error('Failed to save banner:', err);
      setBannerError(err?.message || 'Failed to save banner to Firestore.');
    } finally {
      setIsSavingBanner(false);
    }
  };

  // Order Status Handler
  const handleUpdateOrderStatus = async (orderId: string, status: any) => {
    await updateOrderStatusInFirestore(orderId, status);
  };

  // Save Settings Handler
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveStoreSettingsInFirestore(settingsForm);
    setSettingsSavedMessage(true);
    setTimeout(() => setSettingsSavedMessage(false), 3000);
  };

  // Seeding tools handlers
  const handleSeedCategories = async () => {
    setToolsMessage('Seeding official categories...');
    try {
      await seedDefaultCategories();
      setToolsMessage('Official categories initialized successfully!');
    } catch (e: any) {
      setToolsMessage(`Error: ${e.message}`);
    }
  };

  const handleSeedProducts = async () => {
    setToolsMessage('Seeding multi-variant industrial products...');
    try {
      await seedSampleProducts();
      setToolsMessage('Sample multi-variant products added for testing.');
    } catch (e: any) {
      setToolsMessage(`Error: ${e.message}`);
    }
  };

  const handleClearProducts = async () => {
    if (window.confirm('Clear all sample/demo products from the database? This keeps categories and settings intact.')) {
      setToolsMessage('Clearing sample products...');
      try {
        await clearSampleProducts();
        setToolsMessage('Sample products successfully cleared! Catalog is clean.');
      } catch (e: any) {
        setToolsMessage(`Error: ${e.message}`);
      }
    }
  };

  return (
    <div className="bg-neutral-100 min-h-screen">
      {/* Top Admin Header Bar */}
      <header className="bg-neutral-900 text-white border-b border-neutral-800 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-orange-600 flex items-center justify-center font-black text-white">
                GH
              </div>
              <div>
                <span className="font-extrabold text-sm sm:text-base uppercase tracking-tight">
                  Gauge House <span className="text-orange-500">Staff Console</span>
                </span>
                <span className="hidden sm:inline-block ml-2 px-2 py-0.5 rounded bg-neutral-800 text-neutral-400 text-[10px] font-mono">
                  v2.4
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs">
              <button
                onClick={() => navigate('/')}
                className="text-neutral-400 hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
              >
                <span>View Customer Storefront</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>

              <div className="hidden sm:flex items-center gap-2 pl-4 border-l border-neutral-800 text-neutral-300">
                <span>{user.email}</span>
              </div>

              <button
                onClick={() => signOut()}
                className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-neutral-950 border-t border-neutral-800/80 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto flex items-center gap-1 sm:gap-2 overflow-x-auto py-2">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
              { id: 'orders', label: `Orders (${orders.length})`, icon: ShoppingCart },
              { id: 'customers', label: `Customers (${customers.length})`, icon: Users },
              { id: 'leads', label: `Customer Leads (${purchasingCustomersCount})`, icon: UserCheck },
              { id: 'products', label: `Products (${products.length})`, icon: Package },
              { id: 'categories', label: `Categories (${categories.length})`, icon: FolderTree },
              { id: 'banners', label: `Hero Banners (${banners.length})`, icon: Sliders },
              { id: 'settings', label: 'Store Settings', icon: Settings },
              { id: 'tools', label: 'Catalog Tools', icon: Database },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
                    isActive
                      ? 'bg-orange-600 text-white shadow-sm'
                      : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Main Admin Content Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ========================================================= */}
        {/* 1. DASHBOARD TAB */}
        {/* ========================================================= */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            {/* Stat Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-white border border-neutral-200/80 shadow-xs">
                <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider block">
                  Total Products
                </span>
                <span className="text-2xl sm:text-3xl font-extrabold text-neutral-900 mt-1 block">
                  {totalProducts}
                </span>
                <span className="text-[11px] text-emerald-600 font-semibold">
                  {activeProducts} active in catalog
                </span>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-neutral-200/80 shadow-xs">
                <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider block">
                  Pending Orders
                </span>
                <span className="text-2xl sm:text-3xl font-extrabold text-orange-600 mt-1 block">
                  {pendingOrders}
                </span>
                <span className="text-[11px] text-neutral-500">
                  {totalOrders} total lifetime orders
                </span>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-neutral-200/80 shadow-xs">
                <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider block">
                  Completed Orders
                </span>
                <span className="text-2xl sm:text-3xl font-extrabold text-emerald-600 mt-1 block">
                  {completedOrders}
                </span>
                <span className="text-[11px] text-neutral-500">Fully dispatched</span>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-neutral-200/80 shadow-xs">
                <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider block">
                  Recorded Volume
                </span>
                <span className="text-2xl sm:text-3xl font-extrabold text-neutral-900 mt-1 block truncate">
                  {formatPrice(totalRevenue)}
                </span>
                <span className="text-[11px] text-neutral-500">In order pipeline</span>
              </div>
            </div>

            {/* Customer Intelligence & Lead Metrics (Section 8) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-neutral-900 tracking-tight flex items-center gap-2">
                  <Users className="w-4 h-4 text-orange-600" />
                  <span>Customer Lead Intelligence & Metrics</span>
                </h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveTab('customers')}
                    className="text-xs font-bold text-neutral-600 hover:text-neutral-900 cursor-pointer"
                  >
                    View All Customers ({totalCustomers})
                  </button>
                  <span className="text-neutral-300">•</span>
                  <button
                    onClick={() => setActiveTab('leads')}
                    className="text-xs font-bold text-orange-600 hover:text-orange-700 cursor-pointer"
                  >
                    View Purchasing Leads ({purchasingCustomersCount}) →
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {/* Total Customers */}
                <div className="p-4 rounded-2xl bg-white border border-neutral-200/80 shadow-xs">
                  <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block">
                    Total Customers
                  </span>
                  <span className="text-xl sm:text-2xl font-black text-neutral-900 mt-1 block">
                    {totalCustomers}
                  </span>
                  <span className="text-[11px] text-neutral-400">Registered accounts</span>
                </div>

                {/* New Customers */}
                <div className="p-4 rounded-2xl bg-white border border-neutral-200/80 shadow-xs">
                  <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block">
                    New (Last 30 Days)
                  </span>
                  <span className="text-xl sm:text-2xl font-black text-blue-600 mt-1 block">
                    {newCustomers}
                  </span>
                  <span className="text-[11px] text-neutral-400">Recent signups</span>
                </div>

                {/* Purchasing Customers (Leads) */}
                <div className="p-4 rounded-2xl bg-white border border-neutral-200/80 shadow-xs">
                  <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block">
                    Purchasing Customers
                  </span>
                  <span className="text-xl sm:text-2xl font-black text-emerald-600 mt-1 block">
                    {purchasingCustomersCount}
                  </span>
                  <span className="text-[11px] text-emerald-600 font-semibold">
                    {totalCustomers > 0 ? Math.round((purchasingCustomersCount / totalCustomers) * 100) : 0}% buyer conversion
                  </span>
                </div>

                {/* No Purchase Yet */}
                <div className="p-4 rounded-2xl bg-white border border-neutral-200/80 shadow-xs">
                  <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block">
                    No Purchase Yet
                  </span>
                  <span className="text-xl sm:text-2xl font-black text-amber-600 mt-1 block">
                    {noPurchaseCustomersCount}
                  </span>
                  <span className="text-[11px] text-neutral-400">Prospects to nurture</span>
                </div>

                {/* Repeat Customers */}
                <div className="p-4 rounded-2xl bg-white border border-neutral-200/80 shadow-xs col-span-2 sm:col-span-1">
                  <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block">
                    Repeat Customers
                  </span>
                  <span className="text-xl sm:text-2xl font-black text-purple-600 mt-1 block">
                    {repeatCustomersCount}
                  </span>
                  <span className="text-[11px] text-purple-600 font-semibold">2+ lifetime orders</span>
                </div>
              </div>
            </div>

            {/* Recent Orders Overview */}
            <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-xs p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-neutral-900">Recent Customer Orders</h2>
                  <p className="text-xs text-neutral-500">Latest industrial orders placed via customer catalog</p>
                </div>
                <button
                  onClick={() => setActiveTab('orders')}
                  className="text-xs font-bold text-orange-600 hover:text-orange-700"
                >
                  View All Orders →
                </button>
              </div>

              {orders.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-neutral-50 text-neutral-600 font-bold border-b border-neutral-200">
                      <tr>
                        <th className="py-2.5 px-3">Order No</th>
                        <th className="py-2.5 px-3">Customer</th>
                        <th className="py-2.5 px-3">City</th>
                        <th className="py-2.5 px-3">Lines</th>
                        <th className="py-2.5 px-3">Total</th>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                      {orders.slice(0, 5).map((o) => (
                        <tr key={o.id} className="hover:bg-neutral-50">
                          <td className="py-2.5 px-3 font-mono font-bold text-neutral-900">
                            {o.orderNumber}
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="font-semibold block">{o.customer.fullName}</span>
                            <span className="text-[11px] text-neutral-400">{o.customer.phone}</span>
                          </td>
                          <td className="py-2.5 px-3">{o.customer.city}</td>
                          <td className="py-2.5 px-3 font-mono">{o.items.length}</td>
                          <td className="py-2.5 px-3 font-bold text-neutral-900">{formatPrice(o.total)}</td>
                          <td className="py-2.5 px-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                o.status === 'completed'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : o.status === 'shipped'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-orange-100 text-orange-800'
                              }`}
                            >
                              {o.status}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <button
                              onClick={() => setInspectingOrder(o)}
                              className="px-2.5 py-1 bg-neutral-100 hover:bg-neutral-200 rounded font-semibold text-neutral-700"
                            >
                              Inspect
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-8 text-center text-xs text-neutral-500">
                  No orders recorded yet. As customers place orders in the store, they will appear here in real time.
                </div>
              )}
            </div>

            {/* Quick Actions Card */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <button
                onClick={handleOpenNewProduct}
                className="p-4 rounded-xl bg-white border border-neutral-200 hover:border-orange-500 text-left transition-all group shadow-2xs"
              >
                <Plus className="w-5 h-5 text-orange-600 mb-2 group-hover:scale-110 transition-transform" />
                <h3 className="font-bold text-sm text-neutral-900">Add New Product</h3>
                <p className="text-xs text-neutral-500 mt-0.5">Create an industrial item with multi-variants</p>
              </button>

              <button
                onClick={handleOpenNewCategory}
                className="p-4 rounded-xl bg-white border border-neutral-200 hover:border-orange-500 text-left transition-all group shadow-2xs"
              >
                <FolderTree className="w-5 h-5 text-orange-600 mb-2 group-hover:scale-110 transition-transform" />
                <h3 className="font-bold text-sm text-neutral-900">Add Category</h3>
                <p className="text-xs text-neutral-500 mt-0.5">Organize product hierarchy</p>
              </button>

              <button
                onClick={() => setActiveTab('tools')}
                className="p-4 rounded-xl bg-white border border-neutral-200 hover:border-orange-500 text-left transition-all group shadow-2xs"
              >
                <Database className="w-5 h-5 text-orange-600 mb-2 group-hover:scale-110 transition-transform" />
                <h3 className="font-bold text-sm text-neutral-900">Catalog Seeding Tools</h3>
                <p className="text-xs text-neutral-500 mt-0.5">Initialize categories or manage demo items</p>
              </button>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* 2. ORDERS TAB */}
        {/* ========================================================= */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-extrabold text-neutral-900">Customer Orders</h2>
                <p className="text-xs text-neutral-500">Live order queue with multi-variant specifications</p>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    placeholder="Search order no, customer, city..."
                    className="pl-8 pr-3 py-1.5 text-xs bg-white border border-neutral-300 rounded-lg focus:outline-hidden"
                  />
                </div>

                <select
                  value={orderStatusFilter}
                  onChange={(e) => setOrderStatusFilter(e.target.value)}
                  className="px-3 py-1.5 text-xs font-semibold bg-white border border-neutral-300 rounded-lg"
                >
                  <option value="all">All Statuses</option>
                  <option value="new">New</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-neutral-50 text-neutral-600 font-bold border-b border-neutral-200">
                    <tr>
                      <th className="py-3 px-4">Order ID & Date</th>
                      <th className="py-3 px-4">Customer & Phone</th>
                      <th className="py-3 px-4">Address & City</th>
                      <th className="py-3 px-4">Variant Items</th>
                      <th className="py-3 px-4">Grand Total</th>
                      <th className="py-3 px-4">Status Update</th>
                      <th className="py-3 px-4 text-right">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {filteredOrders.length > 0 ? (
                      filteredOrders.map((order) => (
                        <tr key={order.id} className="hover:bg-neutral-50/80">
                          <td className="py-3 px-4">
                            <span className="font-mono font-bold text-neutral-900 block">
                              {order.orderNumber}
                            </span>
                            <span className="text-[11px] text-neutral-400">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </span>
                          </td>

                          <td className="py-3 px-4">
                            <span className="font-semibold text-neutral-900 block">{order.customer.fullName}</span>
                            <span className="text-neutral-500 block">{order.customer.phone}</span>
                            {order.customer.companyName && (
                              <span className="text-[10px] text-orange-600">{order.customer.companyName}</span>
                            )}
                          </td>

                          <td className="py-3 px-4 max-w-xs truncate">
                            <span className="font-semibold block">{order.customer.city}</span>
                            <span className="text-[11px] text-neutral-500 truncate block">{order.customer.address}</span>
                          </td>

                          <td className="py-3 px-4">
                            <span className="font-bold text-neutral-800 block">
                              {order.items.reduce((s, it) => s + it.quantity, 0)} units
                            </span>
                            <span className="text-[11px] text-neutral-400">
                              across {order.items.length} line{order.items.length > 1 ? 's' : ''}
                            </span>
                          </td>

                          <td className="py-3 px-4 font-extrabold text-neutral-900 text-sm">
                            {formatPrice(order.total)}
                          </td>

                          <td className="py-3 px-4">
                            <select
                              value={order.status}
                              onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                              className="px-2 py-1 bg-neutral-50 border border-neutral-300 rounded font-bold text-[11px]"
                            >
                              <option value="new">NEW</option>
                              <option value="confirmed">CONFIRMED</option>
                              <option value="processing">PROCESSING</option>
                              <option value="shipped">SHIPPED</option>
                              <option value="completed">COMPLETED</option>
                              <option value="cancelled">CANCELLED</option>
                            </select>
                          </td>

                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => setInspectingOrder(order)}
                              className="px-2.5 py-1.5 bg-orange-50 hover:bg-orange-100 text-orange-700 rounded-lg font-bold text-xs cursor-pointer"
                            >
                              Inspect
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-neutral-400">
                          No orders matching criteria.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* CUSTOMERS DATABASE TAB */}
        {/* ========================================================= */}
        {activeTab === 'customers' && (
          <CustomersView
            customers={customers}
            orders={orders}
            viewMode="all"
            formatPrice={formatPrice}
            onSelectOrder={(ord) => {
              setInspectingOrder(ord);
              setActiveTab('orders');
            }}
            onUpdateCustomerStatus={handleUpdateCustomerStatus}
            onShowNotification={showNotification}
          />
        )}

        {/* ========================================================= */}
        {/* PURCHASING CUSTOMER LEADS TAB */}
        {/* ========================================================= */}
        {activeTab === 'leads' && (
          <CustomersView
            customers={customers}
            orders={orders}
            viewMode="leads"
            formatPrice={formatPrice}
            onSelectOrder={(ord) => {
              setInspectingOrder(ord);
              setActiveTab('orders');
            }}
            onUpdateCustomerStatus={handleUpdateCustomerStatus}
            onShowNotification={showNotification}
          />
        )}

        {/* ========================================================= */}
        {/* PRODUCTS TAB */}
        {/* ========================================================= */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-extrabold text-neutral-900">Product Management</h2>
                <p className="text-xs text-neutral-500">Add, edit, or configure multi-variant product specifications</p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    placeholder="Search title, SKU..."
                    className="pl-8 pr-3 py-1.5 text-xs bg-white border border-neutral-300 rounded-lg focus:outline-hidden"
                  />
                </div>

                <select
                  value={productCategoryFilter}
                  onChange={(e) => setProductCategoryFilter(e.target.value)}
                  className="px-3 py-1.5 text-xs font-semibold bg-white border border-neutral-300 rounded-lg"
                >
                  <option value="all">All Categories</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>

                <button
                  onClick={handleOpenNewProduct}
                  className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>New Product</span>
                </button>
              </div>
            </div>

            {/* Products Table */}
            <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-neutral-50 text-neutral-600 font-bold border-b border-neutral-200">
                    <tr>
                      <th className="py-3 px-4">Item</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">SKU</th>
                      <th className="py-3 px-4">Price</th>
                      <th className="py-3 px-4">Stock</th>
                      <th className="py-3 px-4">Variants</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {filteredProducts.length > 0 ? (
                      filteredProducts.map((product) => {
                        const hasVar = (product.variantDimensions?.length || 0) > 0 || (product.variants?.length || 0) > 0;
                        return (
                          <tr key={product.id} className="hover:bg-neutral-50/80">
                            <td className="py-3 px-4 flex items-center gap-3">
                              <img
                                src={
                                  product.images?.[0] ||
                                  'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=100&q=80'
                                }
                                alt={product.title}
                                className="w-10 h-10 rounded-lg object-cover bg-neutral-100 border border-neutral-200 shrink-0"
                              />
                              <div className="min-w-0">
                                <span className="font-bold text-neutral-900 block truncate max-w-xs">
                                  {product.title}
                                </span>
                                <span className="text-[10px] text-neutral-400 uppercase font-mono">
                                  {product.brand || 'Gauge House'}
                                </span>
                              </div>
                            </td>

                            <td className="py-3 px-4 font-medium text-neutral-700">{product.category}</td>

                            <td className="py-3 px-4 font-mono text-neutral-600">{product.sku}</td>

                            <td className="py-3 px-4 font-extrabold text-neutral-900">
                              {formatPrice(product.salePrice || product.price)}
                            </td>

                            <td className="py-3 px-4 font-semibold text-neutral-800">{product.stock}</td>

                            <td className="py-3 px-4">
                              {hasVar ? (
                                <span className="px-2 py-0.5 rounded bg-orange-100 text-orange-800 text-[10px] font-bold">
                                  Multi-Variant
                                </span>
                              ) : (
                                <span className="text-neutral-400 text-[11px]">Single Unit</span>
                              )}
                            </td>

                            <td className="py-3 px-4">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                  product.published !== false
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-neutral-200 text-neutral-600'
                                }`}
                              >
                                {product.published !== false ? 'Published' : 'Draft'}
                              </span>
                            </td>

                            <td className="py-3 px-4 text-right space-x-2">
                              <button
                                onClick={() => handleEditProduct(product)}
                                className="p-1.5 hover:bg-neutral-100 rounded text-neutral-600 hover:text-neutral-900 cursor-pointer"
                                title="Edit"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => promptDeleteProduct(product)}
                                className="p-1.5 hover:bg-red-50 rounded text-neutral-400 hover:text-red-600 cursor-pointer"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={8} className="py-8 text-center text-neutral-400">
                          No products found. Click "New Product" or use "Catalog Tools" to add items.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* 4. CATEGORIES TAB */}
        {/* ========================================================= */}
        {activeTab === 'categories' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-extrabold text-neutral-900">Categories Management</h2>
                <p className="text-xs text-neutral-500">Configure catalog categories and their images</p>
              </div>
              <button
                onClick={handleOpenNewCategory}
                className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Add Category</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((cat) => (
                <div key={cat.id} className="p-4 bg-white rounded-xl border border-neutral-200 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-sm text-neutral-900">{cat.name}</h3>
                      <span className="text-[10px] font-mono text-neutral-400 block">ID: {cat.id}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleEditCategory(cat)}
                        className="p-1.5 text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100 rounded-lg cursor-pointer"
                        title="Edit Category"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => promptDeleteCategory(cat)}
                        className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg cursor-pointer"
                        title="Delete Category"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-neutral-500 line-clamp-2">{cat.description || 'No description'}</p>

                  {cat.imageUrl && (
                    <div className="w-full h-24 rounded-lg overflow-hidden bg-neutral-100 border border-neutral-200">
                      <img
                        src={cat.imageUrl}
                        alt={cat.name}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  )}

                  <div className="pt-2 border-t border-neutral-100 flex items-center justify-between text-[11px] text-neutral-400 font-mono">
                    <span>Slug: /{cat.slug}</span>
                    <span>Order: #{cat.displayOrder ?? 0}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* 5. HERO BANNERS TAB */}
        {/* ========================================================= */}
        {activeTab === 'banners' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-extrabold text-neutral-900">Homepage Hero Banners</h2>
                <p className="text-xs text-neutral-500">Control hero showcase titles, slogans, images, and CTA buttons</p>
              </div>
              <button
                onClick={handleOpenNewBanner}
                className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Add Banner</span>
              </button>
            </div>

            <div className="space-y-4">
              {banners.length === 0 ? (
                <div className="bg-white rounded-2xl border border-dashed border-neutral-300 p-12 text-center space-y-3">
                  <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center mx-auto">
                    <Sliders className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-neutral-800 text-sm">No Hero Banners Published</h4>
                  <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                    The customer homepage is currently displaying the default Gauge House showroom view. Click "Add Banner" to upload and publish custom hero banners.
                  </p>
                  <button
                    onClick={handleOpenNewBanner}
                    className="mt-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold inline-flex items-center gap-2 cursor-pointer shadow-xs"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Hero Banner</span>
                  </button>
                </div>
              ) : (
                banners.map((ban) => (
                  <div
                    key={ban.id}
                    className="p-4 bg-white rounded-xl border border-neutral-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-4">
                      <img
                        src={ban.imageUrl || ban.image || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=200&q=80'}
                        alt={ban.title}
                        className="w-24 h-16 rounded-lg object-cover bg-neutral-100 border border-neutral-200 shrink-0"
                        referrerPolicy="no-referrer"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm text-neutral-900">{ban.title}</h4>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-100 text-neutral-600 border border-neutral-200">
                            Doc ID: {ban.id}
                          </span>
                        </div>
                        <p className="text-xs text-neutral-500 line-clamp-1 mt-0.5">{ban.subtitle}</p>
                        <span className="text-[11px] text-orange-600 font-semibold mt-1 inline-block">
                          CTA: {ban.ctaText || ban.buttonText || 'Explore Full Catalog'} → {ban.targetUrl || ban.destination || '/catalog'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleEditBanner(ban)}
                        className="px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => promptDeleteBanner(ban)}
                        className="p-2 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        title="Delete Hero Banner"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* 6. STORE SETTINGS TAB */}
        {/* ========================================================= */}
        {activeTab === 'settings' && (
          <div className="max-w-3xl space-y-6">
            <div>
              <h2 className="text-xl font-extrabold text-neutral-900">Store Settings & Business Identity</h2>
              <p className="text-xs text-neutral-500">Contact information, Lahore showroom address, shipping fee rules</p>
            </div>

            {settingsSavedMessage && (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Store settings updated successfully!</span>
              </div>
            )}

            <form onSubmit={handleSaveSettings} className="bg-white rounded-2xl border border-neutral-200 p-6 space-y-4 shadow-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">Store Name</label>
                  <input
                    type="text"
                    value={settingsForm.storeName}
                    onChange={(e) => setSettingsForm({ ...settingsForm, storeName: e.target.value })}
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-neutral-50 border border-neutral-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">Tagline</label>
                  <input
                    type="text"
                    value={settingsForm.tagline}
                    onChange={(e) => setSettingsForm({ ...settingsForm, tagline: e.target.value })}
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-neutral-50 border border-neutral-300 rounded-lg"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-neutral-700 mb-1">Showroom Address</label>
                  <input
                    type="text"
                    value={settingsForm.address}
                    onChange={(e) => setSettingsForm({ ...settingsForm, address: e.target.value })}
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-neutral-50 border border-neutral-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">Primary WhatsApp Number</label>
                  <input
                    type="text"
                    value={settingsForm.whatsappNumber || ''}
                    onChange={(e) => setSettingsForm({ ...settingsForm, whatsappNumber: e.target.value })}
                    placeholder="923354499186"
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-neutral-50 border border-neutral-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">Currency Symbol</label>
                  <input
                    type="text"
                    value={settingsForm.currencySymbol}
                    onChange={(e) => setSettingsForm({ ...settingsForm, currencySymbol: e.target.value })}
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-neutral-50 border border-neutral-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">Flat Cargo / Delivery Fee (PKR)</label>
                  <input
                    type="number"
                    value={settingsForm.shippingFlatRate}
                    onChange={(e) => setSettingsForm({ ...settingsForm, shippingFlatRate: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-neutral-50 border border-neutral-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">Free Shipping Threshold (PKR)</label>
                  <input
                    type="number"
                    value={settingsForm.freeShippingThreshold}
                    onChange={(e) => setSettingsForm({ ...settingsForm, freeShippingThreshold: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-neutral-50 border border-neutral-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-neutral-200 flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shadow-xs"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Store Settings</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ========================================================= */}
        {/* 7. CATALOG TOOLS TAB */}
        {/* ========================================================= */}
        {activeTab === 'tools' && (
          <div className="max-w-2xl space-y-6">
            <div>
              <h2 className="text-xl font-extrabold text-neutral-900">Catalog Seeding & Maintenance Tools</h2>
              <p className="text-xs text-neutral-500">
                Manage initial store setup, categories, and test datasets.
              </p>
            </div>

            {toolsMessage && (
              <div className="p-4 rounded-xl bg-orange-50 border border-orange-200 text-orange-900 text-xs font-bold">
                {toolsMessage}
              </div>
            )}

            <div className="space-y-4">
              {/* Tool 1 */}
              <div className="p-5 bg-white rounded-2xl border border-neutral-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
                <div>
                  <h3 className="font-bold text-sm text-neutral-900">Initialize Official Categories</h3>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    Seeds the 8 official Gauge House categories (Pressure Gauges, Temperature Gauges, Transmitters, WIKA, etc.).
                  </p>
                </div>
                <button
                  onClick={handleSeedCategories}
                  className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-bold whitespace-nowrap cursor-pointer"
                >
                  Seed Categories
                </button>
              </div>

              {/* Tool 2 */}
              <div className="p-5 bg-white rounded-2xl border border-neutral-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
                <div>
                  <h3 className="font-bold text-sm text-neutral-900">Seed Multi-Variant Sample Products</h3>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    Populates realistic industrial pressure gauges with Dial Size & Pressure Range variant dimensions for live verification.
                  </p>
                </div>
                <button
                  onClick={handleSeedProducts}
                  className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold whitespace-nowrap cursor-pointer"
                >
                  Seed Demo Products
                </button>
              </div>

              {/* Tool 3 */}
              <div className="p-5 bg-white rounded-2xl border border-red-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
                <div>
                  <h3 className="font-bold text-sm text-red-900">Clear Sample Products</h3>
                  <p className="text-xs text-red-700/80 mt-0.5">
                    Wipes all sample products to keep the production catalog 100% clean for real customer data.
                  </p>
                </div>
                <button
                  onClick={handleClearProducts}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold whitespace-nowrap cursor-pointer"
                >
                  Clear All Products
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Admin Product Modal */}
      <AdminProductModal
        isOpen={productModalOpen}
        product={editingProduct}
        categories={categories}
        onClose={() => setProductModalOpen(false)}
        onSave={handleSaveProduct}
      />

      {/* Category Modal */}
      {categoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/70 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="font-bold text-base text-neutral-900">
              {editingCategory ? 'Edit Category' : 'Add New Category'}
            </h3>
            <form onSubmit={handleSaveCategory} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Category Name</label>
                <input
                  type="text"
                  required
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Slug</label>
                <input
                  type="text"
                  value={catSlug}
                  onChange={(e) => setCatSlug(e.target.value)}
                  placeholder="auto-generated"
                  className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-300 rounded-lg font-mono"
                />
              </div>
              <div>
                <SingleImageUploader
                  label="Category Cover Picture"
                  sublabel="Select from device gallery or drop photo"
                  folder="categories"
                  itemId={editingCategory?.id || catSlug || 'new_category'}
                  value={catImage}
                  onChange={setCatImage}
                  aspectRatio="video"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={catDesc}
                  onChange={(e) => setCatDesc(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-300 rounded-lg"
                />
              </div>

              {categoryError && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{categoryError}</span>
                </div>
              )}

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  disabled={isSavingCategory}
                  onClick={() => setCategoryModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-neutral-600 font-semibold cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingCategory}
                  className="px-4 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-60 shadow-xs"
                >
                  {isSavingCategory && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>{isSavingCategory ? 'Saving Category...' : 'Save Category'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Banner Modal */}
      {bannerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/70 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="font-bold text-base text-neutral-900">
              {editingBanner ? 'Edit Banner' : 'Add Hero Banner'}
            </h3>
            <form onSubmit={handleSaveBanner} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Headline Title</label>
                <input
                  type="text"
                  required
                  value={banTitle}
                  onChange={(e) => setBanTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Subtitle</label>
                <textarea
                  rows={2}
                  value={banSubtitle}
                  onChange={(e) => setBanSubtitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-300 rounded-lg"
                />
              </div>
              <div>
                <SingleImageUploader
                  label="Hero Banner Picture"
                  sublabel="Upload wide hero banner for the homepage"
                  folder="banners"
                  itemId={editingBanner?.id || 'new_banner'}
                  value={banImage}
                  onChange={setBanImage}
                  aspectRatio="banner"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">CTA Text</label>
                  <input
                    type="text"
                    value={banCta}
                    onChange={(e) => setBanCta(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">Target Link</label>
                  <input
                    type="text"
                    value={banLink}
                    onChange={(e) => setBanLink(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-300 rounded-lg"
                  />
                </div>
              </div>

              {bannerError && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{bannerError}</span>
                </div>
              )}

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  disabled={isSavingBanner}
                  onClick={() => setBannerModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-neutral-600 font-semibold cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingBanner}
                  className="px-4 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-60 shadow-xs"
                >
                  {isSavingBanner && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>{isSavingBanner ? 'Saving Banner...' : 'Save Banner'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Inspect Order Modal */}
      {inspectingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/70 backdrop-blur-xs">
          <div className="w-full max-w-2xl bg-white rounded-2xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
              <div>
                <span className="font-mono font-bold text-lg text-neutral-900 block">
                  {inspectingOrder.orderNumber}
                </span>
                <span className="text-xs text-neutral-500">
                  {new Date(inspectingOrder.createdAt).toLocaleString()}
                </span>
              </div>
              <button
                onClick={() => setInspectingOrder(null)}
                className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700"
              >
                ✕
              </button>
            </div>

            {/* Customer Information (Section 9 Email Visibility & Account Link) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-neutral-50 p-4 rounded-xl border border-neutral-200">
              <div className="space-y-1.5">
                <p>
                  <strong>Customer:</strong> {inspectingOrder.customer.fullName}
                </p>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <strong>Email:</strong>{' '}
                  <span className="font-mono text-neutral-900 font-semibold select-all">
                    {inspectingOrder.customer.email}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(inspectingOrder.customer.email);
                      showNotification('success', `Copied customer email: ${inspectingOrder.customer.email}`);
                    }}
                    className="p-1 rounded text-neutral-400 hover:text-orange-600 hover:bg-neutral-200 transition-colors"
                    title="Copy Email"
                  >
                    <Mail className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <strong>Phone:</strong>{' '}
                  <span className="font-mono text-neutral-900 font-semibold select-all">
                    {inspectingOrder.customer.phone}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(inspectingOrder.customer.phone);
                      showNotification('success', `Copied customer phone: ${inspectingOrder.customer.phone}`);
                    }}
                    className="p-1 rounded text-neutral-400 hover:text-orange-600 hover:bg-neutral-200 transition-colors"
                    title="Copy Phone"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <a
                    href={`https://wa.me/${inspectingOrder.customer.phone.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] font-bold text-emerald-700 hover:underline inline-flex items-center gap-1"
                  >
                    WhatsApp Chat ↗
                  </a>
                </div>
                {inspectingOrder.customer.companyName && (
                  <p>
                    <strong>Company:</strong> {inspectingOrder.customer.companyName}
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <p>
                  <strong>City:</strong> {inspectingOrder.customer.city}
                </p>
                <p>
                  <strong>Delivery Address:</strong> {inspectingOrder.customer.address}
                </p>
                <div>
                  <strong>Customer Account:</strong>{' '}
                  {inspectingOrder.customerUid || inspectingOrder.customer.userId ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      Registered Customer Account ({inspectingOrder.customerUid || inspectingOrder.customer.userId})
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-neutral-200 text-neutral-700 text-[10px] font-semibold">
                      Guest Checkout
                    </span>
                  )}
                </div>
                {inspectingOrder.notes && (
                  <p>
                    <strong>Order Notes:</strong> {inspectingOrder.notes}
                  </p>
                )}
              </div>
            </div>

            {/* Items with Variants */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">
                Order Items & Variant Specifications
              </h4>
              <div className="space-y-2">
                {inspectingOrder.items.map((it) => (
                  <div key={it.id} className="p-3 bg-neutral-50 rounded-xl flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-neutral-900">{it.productTitle}</p>
                      {it.selectedVariant?.attributes && (
                        <p className="text-[11px] text-orange-700">
                          {Object.entries(it.selectedVariant.attributes).map(([k, v]) => `${k}: ${v}`).join(' | ')}
                        </p>
                      )}
                      <p className="text-[10px] text-neutral-400 font-mono">SKU: {it.sku}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-neutral-900">{formatPrice(it.subtotal)}</p>
                      <p className="text-[11px] text-neutral-500">{it.quantity} × {formatPrice(it.unitPrice)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Status Update & Total */}
            <div className="pt-3 border-t border-neutral-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold">Status:</span>
                <select
                  value={inspectingOrder.status}
                  onChange={async (e) => {
                    const newSt = e.target.value as any;
                    await handleUpdateOrderStatus(inspectingOrder.id, newSt);
                    setInspectingOrder({ ...inspectingOrder, status: newSt });
                  }}
                  className="px-2 py-1 bg-neutral-50 border border-neutral-300 rounded font-bold text-xs"
                >
                  <option value="new">NEW</option>
                  <option value="confirmed">CONFIRMED</option>
                  <option value="processing">PROCESSING</option>
                  <option value="shipped">SHIPPED</option>
                  <option value="completed">COMPLETED</option>
                  <option value="cancelled">CANCELLED</option>
                </select>
              </div>

              <div className="text-right">
                <span className="text-xs text-neutral-500 mr-2">Grand Total:</span>
                <span className="font-extrabold text-orange-600 text-lg">
                  {formatPrice(inspectingOrder.total)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* ========================================================= */}
      {/* DELETE CONFIRMATION MODAL */}
      {/* ========================================================= */}
      {deleteModal.open && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-neutral-950/75 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl border border-neutral-200 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="font-extrabold text-base text-neutral-900">
                  Delete {deleteModal.type === 'banner' ? 'Hero Banner' : deleteModal.type === 'product' ? 'Product' : 'Category'}
                </h3>
                <p className="text-xs text-neutral-500 leading-relaxed">
                  Permanently delete this document from Firestore database
                  {deleteModal.type === 'banner' && ' and remove it immediately from the customer homepage'}.
                </p>
              </div>
            </div>

            {/* Target Details Preview */}
            <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 flex items-center gap-3">
              {deleteModal.imageUrl ? (
                <img
                  src={deleteModal.imageUrl}
                  alt={deleteModal.title}
                  className="w-16 h-12 rounded-lg object-cover bg-neutral-200 border border-neutral-300 shrink-0"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-16 h-12 rounded-lg bg-neutral-200 flex items-center justify-center text-neutral-400 shrink-0">
                  <Layers className="w-5 h-5" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <h4 className="text-xs font-bold text-neutral-900 truncate">{deleteModal.title}</h4>
                <p className="text-[11px] font-mono text-neutral-500 truncate">
                  Firestore Doc ID: <span className="text-neutral-800 font-semibold">{deleteModal.id}</span>
                </p>
              </div>
            </div>

            {deleteModal.error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{deleteModal.error}</span>
              </div>
            )}

            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                disabled={deleteModal.isDeleting}
                onClick={() =>
                  setDeleteModal({
                    open: false,
                    type: 'banner',
                    id: '',
                    title: '',
                    imageUrl: undefined,
                    isDeleting: false,
                    error: null,
                  })
                }
                className="px-4 py-2 text-xs font-bold text-neutral-700 hover:bg-neutral-100 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleteModal.isDeleting}
                onClick={handleConfirmDelete}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-xs disabled:opacity-60"
              >
                {deleteModal.isDeleting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>{deleteModal.isDeleting ? 'Deleting...' : 'Confirm & Delete'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* GLOBAL NOTIFICATION TOAST */}
      {/* ========================================================= */}
      {notification && (
        <div
          className={`fixed top-4 right-4 z-70 max-w-md p-4 rounded-xl shadow-xl border flex items-start gap-3 transition-all animate-in fade-in slide-in-from-top-2 ${
            notification.type === 'success'
              ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
              : notification.type === 'warning'
              ? 'bg-amber-50 border-amber-300 text-amber-900'
              : 'bg-red-50 border-red-300 text-red-900'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          )}
          <div className="flex-1 text-xs font-semibold leading-relaxed">{notification.message}</div>
          <button
            onClick={() => setNotification(null)}
            className="text-neutral-400 hover:text-neutral-700 text-xs font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
};
