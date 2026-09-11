import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  Lock,
  ArrowLeft,
  Truck,
  Building,
  User,
  Mail,
  Phone,
  MapPin,
  FileText,
  AlertCircle,
  Building2,
  Copy,
  Check,
  Banknote,
  CreditCard,
  LogIn,
  UserPlus
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';
import { createOrderInFirestore } from '../services/firestoreService';
import { Order, CustomerInfo, PaymentMethod } from '../types';

interface CheckoutPageProps {
  navigate: (route: string) => void;
  onOrderSuccess: (order: Order) => void;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({ navigate, onOrderSuccess }) => {
  const { items, subtotal, clearCart } = useCart();
  const { formatPrice, settings, activePaymentAccounts, defaultPaymentAccount } = useStore();
  const {
    user,
    customerProfile,
    signInWithEmail,
    registerWithEmail
  } = useAuth();

  const [customer, setCustomer] = useState<CustomerInfo>({
    fullName: customerProfile?.name || user?.displayName || '',
    email: customerProfile?.email || user?.email || '',
    phone: customerProfile?.phone || '',
    address: customerProfile?.address || '',
    city: customerProfile?.city || 'Lahore',
    companyName: '',
    notes: '',
    userId: user?.uid,
    customerUid: user?.uid,
    customerType: user ? 'registered' : 'guest',
  });

  // Payment Selection States (Advance Bank Transfer only - COD removed)
  const paymentMethod: PaymentMethod = 'bank_transfer';
  const [selectedBankId, setSelectedBankId] = useState<string>('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Inline Auth States (if not logged in)
  const [authMode, setAuthMode] = useState<'signin' | 'register'>('register');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authPhone, setAuthPhone] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    if (defaultPaymentAccount && !selectedBankId) {
      setSelectedBankId(defaultPaymentAccount.id);
    } else if (activePaymentAccounts.length > 0 && !selectedBankId) {
      setSelectedBankId(activePaymentAccounts[0].id);
    }
  }, [defaultPaymentAccount, activePaymentAccounts, selectedBankId]);

  useEffect(() => {
    if (user || customerProfile) {
      setCustomer((prev) => ({
        ...prev,
        fullName: prev.fullName || customerProfile?.name || user?.displayName || '',
        email: prev.email || customerProfile?.email || user?.email || '',
        phone: prev.phone || customerProfile?.phone || '',
        address: prev.address || customerProfile?.address || '',
        city: prev.city || customerProfile?.city || 'Lahore',
        userId: user?.uid,
        customerUid: user?.uid,
        customerType: user ? 'registered' : 'guest',
      }));
    }
  }, [user, customerProfile]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isFreeShipping = subtotal >= settings.freeShippingThreshold && settings.freeShippingThreshold > 0;
  const shippingFee = items.length === 0 ? 0 : isFreeShipping ? 0 : settings.shippingFlatRate;
  const grandTotal = subtotal + shippingFee;

  if (items.length === 0) {
    return (
      <div className="bg-neutral-50 min-h-screen py-16 px-4 text-center">
        <div className="max-w-md mx-auto bg-white p-8 rounded-2xl border border-neutral-200">
          <h2 className="text-xl font-bold text-neutral-900 mb-2">No Items to Checkout</h2>
          <p className="text-xs sm:text-sm text-neutral-500 mb-6">
            Your cart is empty. Please add products from the catalog before checking out.
          </p>
          <button
            onClick={() => navigate('/catalog')}
            className="px-6 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold text-xs"
          >
            Browse Catalog
          </button>
        </div>
      </div>
    );
  }

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleInlineAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuthenticating(true);
    setAuthError(null);
    try {
      if (authMode === 'register') {
        if (!authName.trim()) {
          setAuthError('Please provide your name.');
          setIsAuthenticating(false);
          return;
        }
        await registerWithEmail({
          name: authName.trim(),
          email: authEmail.trim(),
          password: authPassword,
          phone: authPhone.trim(),
          address: customer.address.trim(),
          city: customer.city.trim(),
        });
      } else {
        await signInWithEmail(authEmail.trim(), authPassword);
      }
    } catch (err: any) {
      setAuthError(err?.message || 'Authentication failed. Please check credentials.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const selectedBank =
    activePaymentAccounts.find((a) => a.id === selectedBankId) ||
    defaultPaymentAccount ||
    activePaymentAccounts[0];

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    // Strict Login Requirement Check
    if (!user) {
      setErrorMessage('A registered and logged-in account is strictly required to place an order. Please register or sign in above.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // Validation
    if (!customer.fullName.trim()) {
      setErrorMessage('Please provide your Full Name.');
      return;
    }
    if (!customer.email.trim() || !customer.email.includes('@')) {
      setErrorMessage('Please provide a valid Email address.');
      return;
    }
    if (!customer.phone.trim() || customer.phone.length < 8) {
      setErrorMessage('Please provide a valid Phone / Mobile number for delivery verification.');
      return;
    }
    if (!customer.address.trim()) {
      setErrorMessage('Please provide your Complete Delivery Address.');
      return;
    }
    if (!customer.city.trim()) {
      setErrorMessage('Please provide your City.');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage(null);

      const customerUid = user.uid;
      const isBank = paymentMethod === 'bank_transfer';

      const createdOrder = await createOrderInFirestore({
        customer: {
          ...customer,
          userId: customerUid,
          customerUid: customerUid,
          customerType: 'registered',
        },
        customerUid: customerUid,
        customerEmail: customer.email.trim().toLowerCase(),
        customerName: customer.fullName.trim(),
        customerPhone: customer.phone.trim(),
        customerAddress: customer.address.trim(),
        customerCity: customer.city.trim(),
        customerType: 'registered',
        totalAmount: grandTotal,
        items,
        subtotal,
        shipping: shippingFee,
        total: grandTotal,
        notes: customer.notes || '',
        paymentMethod,
        paymentStatus: isBank ? 'payment_pending' : 'unpaid',
        orderStatus: isBank ? 'payment_pending' : 'New',
        status: isBank ? 'payment_pending' : 'New',
        transactionId: '',
        paidAmount: 0,
        selectedBankAccountId: isBank ? selectedBank?.id || '' : '',
        selectedBankName: isBank ? selectedBank?.bankName || '' : '',
      });

      // Clear shopping cart
      clearCart();

      // Callback to show order confirmation view
      onOrderSuccess(createdOrder);
    } catch (err: any) {
      console.error('Failed to create order:', err);
      setErrorMessage(err?.message || 'Failed to submit order. Please check your connection and try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-neutral-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => navigate('/cart')}
            className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-600 hover:text-orange-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Cart</span>
          </button>
          <span className="text-xs text-neutral-500 font-medium flex items-center gap-1">
            <Lock className="w-3.5 h-3.5 text-emerald-600" />
            Direct Industrial Order Dispatch
          </span>
        </div>

        {/* CUSTOMER ACCOUNT REGISTRATION / LOGIN GATE IF NOT LOGGED IN */}
        {!user && (
          <div className="mb-8 bg-white rounded-2xl border border-orange-200 shadow-sm p-6 sm:p-7">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 mb-4 border-b border-neutral-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-extrabold text-neutral-900">
                    Customer Account Required for Dispatch &amp; Tracking
                  </h2>
                  <p className="text-xs text-neutral-500">
                    Please sign in or create your Gauge House account to link your order history, save delivery addresses, and track real-time verification.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 bg-neutral-100 p-1 rounded-xl shrink-0 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setAuthMode('register')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    authMode === 'register'
                      ? 'bg-white text-orange-600 shadow-xs'
                      : 'text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  Create Account
                </button>
                <button
                  type="button"
                  onClick={() => setAuthMode('signin')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    authMode === 'signin'
                      ? 'bg-white text-orange-600 shadow-xs'
                      : 'text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  Sign In
                </button>
              </div>
            </div>

            {authError && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              <form onSubmit={handleInlineAuthSubmit} className="lg:col-span-8 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {authMode === 'register' && (
                    <div>
                      <label className="block font-bold text-neutral-700 mb-1">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={authName}
                        onChange={(e) => setAuthName(e.target.value)}
                        placeholder="Muhammad Farooq"
                        className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                  )}

                  {authMode === 'register' && (
                    <div>
                      <label className="block font-bold text-neutral-700 mb-1">
                        Phone / WhatsApp <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={authPhone}
                        onChange={(e) => setAuthPhone(e.target.value)}
                        placeholder="0300-1234567"
                        className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block font-bold text-neutral-700 mb-1">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={authEmail}
                      onChange={(e) => setAuthEmail(e.target.value)}
                      placeholder="name@company.com"
                      className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-neutral-700 mb-1">
                      Password <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      required
                      value={authPassword}
                      onChange={(e) => setAuthPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-1">
                  <button
                    type="submit"
                    disabled={isAuthenticating}
                    className="px-5 py-2 text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 rounded-lg shadow-sm transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {isAuthenticating ? (
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : authMode === 'register' ? (
                      <UserPlus className="w-3.5 h-3.5" />
                    ) : (
                      <LogIn className="w-3.5 h-3.5" />
                    )}
                    <span>{authMode === 'register' ? 'Register & Continue to Checkout' : 'Sign In & Continue to Checkout'}</span>
                  </button>
                </div>
              </form>

              <div className="lg:col-span-4 bg-orange-50/60 rounded-xl p-4 border border-orange-100 text-xs text-orange-950 space-y-1.5">
                <p className="font-bold flex items-center gap-1.5 text-orange-900">
                  <ShieldCheck className="w-4 h-4 text-orange-600" />
                  Benefits of Customer Account
                </p>
                <ul className="list-disc list-inside space-y-0.5 text-[11px] text-orange-800">
                  <li>Direct access to official TID Verification</li>
                  <li>Real-time order tracking &amp; parcel dispatch queue</li>
                  <li>Automatic invoice generation &amp; tax compliance</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmitOrder}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left: Customer & Delivery Details (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              <div className="bg-white rounded-2xl border border-neutral-200/90 p-6 sm:p-8 shadow-xs space-y-6">
                <div>
                  <h1 className="text-2xl font-extrabold text-neutral-900 tracking-tight">
                    Order Delivery & Contact Details
                  </h1>
                  <p className="text-xs text-neutral-500 mt-1">
                    Please provide your contact and shipping address for parcel booking and billing.
                  </p>
                  <div className="mt-3">
                    {user ? (
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span>Registered Account Linked: {customerProfile?.name || user.email}</span>
                      </div>
                    ) : (
                      <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 font-medium">
                        ⚠️ Please Register or Sign In above. Orders cannot be submitted without an active registered account.
                      </div>
                    )}
                  </div>
                </div>

                {errorMessage && (
                  <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-neutral-700 mb-1">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={customer.fullName}
                        onChange={(e) => setCustomer({ ...customer, fullName: e.target.value })}
                        placeholder="e.g. Muhammad Farooq"
                        className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-neutral-50 border border-neutral-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-1">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        value={customer.email}
                        onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                        placeholder="name@company.com"
                        className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-neutral-50 border border-neutral-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-1">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        required
                        value={customer.phone}
                        onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                        placeholder="0300-1234567"
                        className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-neutral-50 border border-neutral-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
                      />
                    </div>
                  </div>

                  {/* Company Name (Optional) */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-neutral-700 mb-1">
                      Company / Factory / Industry Name <span className="text-neutral-400 font-normal">(Optional)</span>
                    </label>
                    <div className="relative">
                      <Building className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={customer.companyName || ''}
                        onChange={(e) => setCustomer({ ...customer, companyName: e.target.value })}
                        placeholder="e.g. Packages Ltd, Maple Leaf Cement, Fauji Fertilizer"
                        className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-neutral-50 border border-neutral-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
                      />
                    </div>
                  </div>

                  {/* Address */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-neutral-700 mb-1">
                      Complete Delivery Address <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
                      <textarea
                        required
                        rows={2}
                        value={customer.address}
                        onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
                        placeholder="Plot / Street / Area / Industrial Estate"
                        className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-neutral-50 border border-neutral-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
                      />
                    </div>
                  </div>

                  {/* City */}
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-1">
                      City <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={customer.city}
                      onChange={(e) => setCustomer({ ...customer, city: e.target.value })}
                      placeholder="e.g. Lahore, Karachi, Islamabad, Faisalabad"
                      className="w-full px-3 py-2 text-xs sm:text-sm bg-neutral-50 border border-neutral-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
                    />
                  </div>

                  {/* ---------------- PAYMENT METHOD SELECTION ---------------- */}
                  <div className="sm:col-span-2 pt-4 border-t border-neutral-200 space-y-4">
                    <div>
                      <h3 className="text-sm font-extrabold text-neutral-900 uppercase tracking-wider">
                        Payment Method
                      </h3>
                      <p className="text-xs text-neutral-500">
                        Gauge House operates strictly via Advance Bank Transfer for verified industrial dispatch.
                      </p>
                    </div>

                    {/* Advance Bank Transfer Banner */}
                    <div className="relative p-4 rounded-xl border-2 border-orange-500 bg-orange-50/40 ring-2 ring-orange-200 flex flex-col justify-between">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-orange-600 text-white shadow-xs">
                            <Building2 className="w-5 h-5" />
                          </div>
                          <div>
                            <span className="font-extrabold text-sm text-neutral-900 block">
                              Advance Bank Transfer (Official Payment Method)
                            </span>
                            <span className="text-[11px] text-orange-700 font-semibold">
                              1Link / Raast Direct / Online Banking / ATM Transfer
                            </span>
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded-md bg-orange-600 text-white text-[10px] font-bold uppercase tracking-wider">
                          Active
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-600 mt-2.5 pt-2 border-t border-orange-200/60 leading-relaxed">
                        Direct online bank transfer with priority verification &amp; fast dispatch. Please transfer the total order amount to the official Gauge House bank account details shown below.
                      </p>
                    </div>

                    {/* DYNAMIC BANK DETAILS ACCORDION (Visible ONLY if Advance Bank Payment is selected and user is logged in) */}
                    {paymentMethod === 'bank_transfer' && (
                      <div className="mt-4">
                        {!user ? (
                          <div className="p-5 rounded-2xl bg-neutral-900 text-white border border-neutral-800 space-y-1.5">
                            <p className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                              <Lock className="w-4 h-4" />
                              Official Bank Details Hidden
                            </p>
                            <p className="text-xs text-neutral-400 leading-relaxed">
                              Official Gauge House bank accounts are strictly accessible to registered and logged-in customers. Please register or sign in above to view active bank accounts and proceed.
                            </p>
                          </div>
                        ) : selectedBank ? (
                          <div className="p-5 rounded-2xl bg-neutral-900 text-white border border-neutral-800 space-y-4">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-neutral-800">
                              <div>
                                <span className="text-xs font-bold text-orange-400 uppercase tracking-wider block">
                                  Official Gauge House Bank Account
                                </span>
                                <p className="text-xs text-neutral-400">
                                  Transfer exactly <strong className="text-white font-mono">{formatPrice(grandTotal)}</strong> to the account below:
                                </p>
                              </div>

                              {activePaymentAccounts.length > 1 && (
                                <select
                                  value={selectedBankId}
                                  onChange={(e) => setSelectedBankId(e.target.value)}
                                  className="text-xs bg-neutral-800 border border-neutral-700 text-white rounded-lg px-2.5 py-1.5"
                                >
                                  {activePaymentAccounts.map((b) => (
                                    <option key={b.id} value={b.id}>
                                      {b.bankName} - {b.accountNumber}
                                    </option>
                                  ))}
                                </select>
                              )}
                            </div>

                            <div className="space-y-3 text-xs">
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="bg-neutral-800/80 p-3 rounded-xl border border-neutral-700/80">
                                  <span className="text-[10px] text-neutral-400 uppercase font-bold block">
                                    Bank &amp; Title
                                  </span>
                                  <span className="font-extrabold text-white text-sm block">
                                    {selectedBank.bankName}
                                  </span>
                                  <span className="text-xs text-neutral-300">
                                    {selectedBank.accountTitle}
                                  </span>
                                </div>

                                {/* Account Number with 1-click copy */}
                                <div className="bg-neutral-800/80 p-3 rounded-xl border border-neutral-700/80 flex items-center justify-between gap-2">
                                  <div>
                                    <span className="text-[10px] text-neutral-400 uppercase font-bold block">
                                      Account Number
                                    </span>
                                    <span className="font-mono font-extrabold text-white text-sm sm:text-base tracking-wider">
                                      {selectedBank.accountNumber}
                                    </span>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => handleCopy(selectedBank.accountNumber, 'chk_acc')}
                                    className="px-2.5 py-1.5 rounded-lg bg-neutral-700 hover:bg-neutral-600 text-white text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                                  >
                                    {copiedKey === 'chk_acc' ? (
                                      <>
                                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                                        <span className="text-emerald-400">Copied!</span>
                                      </>
                                    ) : (
                                      <>
                                        <Copy className="w-3.5 h-3.5" />
                                        <span>Copy</span>
                                      </>
                                    )}
                                  </button>
                                </div>

                                {/* Branch Code */}
                                {selectedBank.branchCode && (
                                  <div className="bg-neutral-800/80 p-3 rounded-xl border border-neutral-700/80">
                                    <span className="text-[10px] text-neutral-400 uppercase font-bold block">
                                      Branch Code
                                    </span>
                                    <span className="font-mono font-bold text-white text-sm">
                                      {selectedBank.branchCode}
                                    </span>
                                  </div>
                                )}

                                {/* IBAN */}
                                {selectedBank.iban && (
                                  <div className="sm:col-span-2 bg-neutral-800/80 p-3 rounded-xl border border-neutral-700/80 flex items-center justify-between gap-2">
                                    <div className="min-w-0">
                                      <span className="text-[10px] text-neutral-400 uppercase font-bold block">
                                        IBAN / Raast Direct
                                      </span>
                                      <span className="font-mono font-bold text-neutral-200 text-xs tracking-wider truncate block">
                                        {selectedBank.iban}
                                      </span>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => handleCopy(selectedBank.iban!, 'chk_iban')}
                                      className="px-2.5 py-1.5 rounded-lg bg-neutral-700 hover:bg-neutral-600 text-white text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors shrink-0"
                                    >
                                      {copiedKey === 'chk_iban' ? (
                                        <>
                                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                                          <span className="text-emerald-400">Copied!</span>
                                        </>
                                      ) : (
                                        <>
                                          <Copy className="w-3.5 h-3.5" />
                                          <span>Copy</span>
                                        </>
                                      )}
                                    </button>
                                  </div>
                                )}
                              </div>

                              {/* Instructions */}
                              {selectedBank.instructions && (
                                <p className="text-[11px] text-neutral-400 leading-relaxed pt-1">
                                  {selectedBank.instructions}
                                </p>
                              )}

                              {/* Notice about post-order TID submission */}
                              <div className="pt-2 border-t border-neutral-800 text-xs text-neutral-400 flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-orange-400 shrink-0" />
                                <span>You can submit your Transaction ID (TID) and payment receipt immediately on the order confirmation screen after placing the order.</span>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 text-xs text-neutral-400">
                            No active bank account currently available. Please contact support.
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Special Notes */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-neutral-700 mb-1">
                      Order Notes & Industrial Instructions <span className="text-neutral-400 font-normal">(Optional)</span>
                    </label>
                    <div className="relative">
                      <FileText className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
                      <textarea
                        rows={2}
                        value={customer.notes || ''}
                        onChange={(e) => setCustomer({ ...customer, notes: e.target.value })}
                        placeholder="Specific calibration certificate needed, gate pass requirements, or preferred cargo service (Daewoo / TCS / Leopard / Bilal Cargo)..."
                        className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-neutral-50 border border-neutral-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Itemized Multi-Variant Order Summary (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white rounded-2xl border border-neutral-200/90 p-6 shadow-xs space-y-5">
                <h2 className="text-lg font-bold text-neutral-900 border-b border-neutral-100 pb-3">
                  Order Summary ({items.length} line items)
                </h2>

                {/* Items List */}
                <div className="max-h-80 overflow-y-auto divide-y divide-neutral-100 pr-1 space-y-2">
                  {items.map((item) => (
                    <div key={item.id} className="pt-2 pb-2 flex items-start justify-between gap-3 text-xs">
                      <img
                        src={item.productImage}
                        alt={item.productTitle}
                        referrerPolicy="no-referrer"
                        className="w-12 h-12 rounded-lg object-cover bg-neutral-100 shrink-0 border border-neutral-200"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-neutral-900 truncate">
                          {item.productTitle}
                        </p>
                        {item.selectedVariant?.attributes && (
                          <p className="text-[11px] text-orange-700 font-medium truncate">
                            {Object.entries(item.selectedVariant.attributes)
                              .map(([k, v]) => `${k}: ${v}`)
                              .join(' | ')}
                          </p>
                        )}
                        <div className="text-[11px] text-neutral-400">
                          {item.hasDiscount && item.regularPrice && (
                            <span className="line-through text-neutral-400 mr-1.5">{formatPrice(item.regularPrice)}</span>
                          )}
                          <span>
                            Qty: <strong className="text-neutral-700">{item.quantity}</strong> × <strong className="text-neutral-800">{formatPrice(item.unitPrice)}</strong>
                          </span>
                        </div>
                      </div>
                      <span className="font-bold text-neutral-900 shrink-0">
                        {formatPrice(item.subtotal)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Pricing Breakdown */}
                <div className="border-t border-neutral-200 pt-4 space-y-2 text-xs">
                  <div className="flex justify-between text-neutral-600">
                    <span>Subtotal</span>
                    <span className="font-bold text-neutral-900">{formatPrice(subtotal)}</span>
                  </div>

                  <div className="flex justify-between text-neutral-600">
                    <span>Shipping Cargo / Courier</span>
                    <span className="font-bold text-neutral-900">
                      {isFreeShipping ? 'FREE Delivery' : formatPrice(shippingFee)}
                    </span>
                  </div>

                  <div className="flex justify-between text-neutral-600">
                    <span>Payment Method</span>
                    <span className="font-bold text-orange-600">
                      Advance Bank Transfer
                    </span>
                  </div>

                  <div className="border-t border-neutral-200 pt-3 flex justify-between items-baseline">
                    <span className="text-base font-extrabold text-neutral-900">Grand Total</span>
                    <span className="text-2xl font-extrabold text-orange-600">
                      {formatPrice(grandTotal)}
                    </span>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full py-3.5 px-6 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer ${
                    !user
                      ? 'bg-amber-600 hover:bg-amber-700'
                      : 'bg-orange-600 hover:bg-orange-700 disabled:bg-neutral-400'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Placing Your Order...</span>
                    </>
                  ) : !user ? (
                    <>
                      <LogIn className="w-4 h-4" />
                      <span>Please Register or Login to Place Order</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Place Order with Bank Transfer</span>
                    </>
                  )}
                </button>

                <p className="text-[11px] text-neutral-400 text-center">
                  By placing this order, you will receive a verified order reference number and immediate order summary.
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
