import React, { useState, useEffect } from 'react';
import {
  User as UserIcon,
  LogOut,
  Package,
  Shield,
  MapPin,
  Phone,
  Mail,
  Calendar,
  CheckCircle2,
  Clock,
  ChevronRight,
  Edit3,
  Trash2,
  AlertCircle,
  ShoppingBag,
  ExternalLink,
  Lock,
  Eye,
  EyeOff
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';
import { subscribeToOrders, subscribeToUserOrders } from '../services/firestoreService';
import { Order, CustomerUser } from '../types';

interface AccountPageProps {
  navigate: (route: string) => void;
  onSelectOrder?: (order: Order) => void;
}

export const AccountPage: React.FC<AccountPageProps> = ({ navigate, onSelectOrder }) => {
  const {
    user,
    customerProfile,
    isAdmin,
    signInWithEmail,
    registerWithEmail,
    signInWithGoogle,
    signOut,
    updateCustomerData,
    deleteAccount,
    loading: authLoading
  } = useAuth();

  const { formatPrice } = useStore();

  // Auth Mode: 'signin' or 'register'
  const [authMode, setAuthMode] = useState<'signin' | 'register'>('signin');
  const [submittingAuth, setSubmittingAuth] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Sign In Form State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Register Form State
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regAddress, setRegAddress] = useState('');
  const [regCity, setRegCity] = useState('Lahore');

  // Customer Orders
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  // Edit Profile Modal State
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editCity, setEditCity] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Delete Account Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  useEffect(() => {
    if (!user) {
      setOrders([]);
      setLoadingOrders(false);
      return;
    }

    const subscriptionFn = isAdmin
      ? (cb: (list: Order[]) => void, errCb: (e: any) => void) => subscribeToOrders(cb, errCb)
      : (cb: (list: Order[]) => void, errCb: (e: any) => void) => subscribeToUserOrders(user.uid, cb, errCb);

    const unsub = subscriptionFn(
      (list) => {
        const userOrders = list.filter(
          (o) =>
            o.customer?.userId === user.uid ||
            o.customerUid === user.uid ||
            o.customer?.email?.toLowerCase() === user.email?.toLowerCase()
        );
        setOrders(userOrders.length > 0 ? userOrders : list);
        setLoadingOrders(false);
      },
      (err) => {
        console.warn('Orders note:', err);
        setLoadingOrders(false);
      }
    );

    return () => unsub();
  }, [user, isAdmin]);

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail.trim() || !loginPassword) {
      setAuthError('Please enter both your email address and password.');
      return;
    }
    setSubmittingAuth(true);
    setAuthError(null);
    try {
      await signInWithEmail(loginEmail.trim(), loginPassword);
    } catch (err: any) {
      const code = err?.code || '';
      const msg = err?.message || '';
      if (
        code === 'auth/invalid-credential' ||
        code === 'auth/wrong-password' ||
        code === 'auth/user-not-found'
      ) {
        setAuthError('Invalid email or password. Please verify your credentials or create a new account.');
      } else if (code === 'auth/too-many-requests') {
        setAuthError('Too many failed attempts. Please wait a few minutes before trying again.');
      } else {
        setAuthError(msg || 'Sign in failed. Please verify your details.');
      }
    } finally {
      setSubmittingAuth(false);
    }
  };

  const handleEmailRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim()) {
      setAuthError('Please enter your full name.');
      return;
    }
    if (!regEmail.trim() || !regEmail.includes('@')) {
      setAuthError('Please enter a valid email address.');
      return;
    }
    if (!regPassword || regPassword.length < 6) {
      setAuthError('Password must be at least 6 characters.');
      return;
    }
    if (!regPhone.trim()) {
      setAuthError('Please enter your contact phone / WhatsApp number.');
      return;
    }
    if (!regAddress.trim()) {
      setAuthError('Please provide your complete shipping / delivery address.');
      return;
    }

    setSubmittingAuth(true);
    setAuthError(null);
    try {
      await registerWithEmail({
        name: regName.trim(),
        email: regEmail.trim(),
        password: regPassword,
        phone: regPhone.trim(),
        address: regAddress.trim(),
        city: regCity.trim() || 'Lahore',
      });
    } catch (err: any) {
      const code = err?.code || '';
      const msg = err?.message || '';
      if (code === 'auth/email-already-in-use') {
        setAuthError('An account with this email address already exists. Please sign in instead.');
      } else if (code === 'auth/weak-password') {
        setAuthError('Password is too weak. Please use at least 6 characters.');
      } else {
        setAuthError(msg || 'Registration failed. Please try again.');
      }
    } finally {
      setSubmittingAuth(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setSubmittingAuth(true);
    setAuthError(null);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      setAuthError(err?.message || 'Google sign in was cancelled or failed.');
    } finally {
      setSubmittingAuth(false);
    }
  };

  const handleOpenEditProfile = () => {
    setEditName(customerProfile?.name || user?.displayName || '');
    setEditPhone(customerProfile?.phone || '');
    setEditAddress(customerProfile?.address || '');
    setEditCity(customerProfile?.city || 'Lahore');
    setEditProfileOpen(true);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) return;
    setIsSavingProfile(true);
    try {
      await updateCustomerData({
        name: editName.trim(),
        phone: editPhone.trim(),
        address: editAddress.trim(),
        city: editCity.trim(),
      });
      setEditProfileOpen(false);
    } catch (err) {
      console.error('Failed to update profile:', err);
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeletingAccount(true);
    try {
      await deleteAccount();
      setDeleteModalOpen(false);
    } catch (err) {
      console.error('Error deleting account:', err);
    } finally {
      setIsDeletingAccount(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-orange-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // If not signed in, show unified Registration / Sign In Form
  if (!user) {
    return (
      <div className="bg-neutral-50 min-h-screen py-12 px-4 sm:px-6">
        <div className="max-w-md mx-auto bg-white rounded-3xl border border-neutral-200/90 p-6 sm:p-8 shadow-xs">
          {/* Header Icon */}
          <div className="w-14 h-14 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center mx-auto mb-4 shadow-inner">
            <UserIcon className="w-7 h-7" />
          </div>

          <h1 className="text-2xl font-black text-center text-neutral-900 tracking-tight">
            Customer Portal
          </h1>
          <p className="text-xs text-neutral-500 text-center mt-1 mb-6">
            Access your orders, track instrument dispatches, and manage your delivery details.
          </p>

          {/* Tab Switcher: Sign In vs Register */}
          <div className="grid grid-cols-2 p-1 bg-neutral-100 rounded-xl mb-6 text-xs font-bold">
            <button
              type="button"
              onClick={() => {
                setAuthMode('signin');
                setAuthError(null);
              }}
              className={`py-2 rounded-lg transition-all cursor-pointer ${
                authMode === 'signin'
                  ? 'bg-white text-neutral-900 shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode('register');
                setAuthError(null);
              }}
              className={`py-2 rounded-lg transition-all cursor-pointer ${
                authMode === 'register'
                  ? 'bg-white text-neutral-900 shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              Create Account
            </button>
          </div>

          {authError && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{authError}</span>
            </div>
          )}

          {/* SIGN IN FORM */}
          {authMode === 'signin' ? (
            <form onSubmit={handleEmailSignIn} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="customer@example.com"
                    className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-neutral-50 border border-neutral-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-10 py-2 text-xs sm:text-sm bg-neutral-50 border border-neutral-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={submittingAuth}
                className="w-full py-2.5 px-4 rounded-xl bg-orange-600 hover:bg-orange-700 disabled:opacity-60 text-white font-bold text-xs sm:text-sm transition-all shadow-sm cursor-pointer mt-2"
              >
                {submittingAuth ? 'Signing in...' : 'Sign In to Account'}
              </button>
            </form>
          ) : (
            /* REGISTRATION FORM */
            <form onSubmit={handleEmailRegister} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="e.g. Tariq Mehmood"
                    className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-neutral-50 border border-neutral-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="tariq@gmail.com"
                    className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-neutral-50 border border-neutral-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full pl-9 pr-10 py-2 text-xs sm:text-sm bg-neutral-50 border border-neutral-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    Phone / WhatsApp <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      required
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder="0300-1234567"
                      className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-neutral-50 border border-neutral-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    City <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={regCity}
                    onChange={(e) => setRegCity(e.target.value)}
                    placeholder="e.g. Lahore"
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-neutral-50 border border-neutral-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  Complete Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
                  <textarea
                    rows={2}
                    required
                    value={regAddress}
                    onChange={(e) => setRegAddress(e.target.value)}
                    placeholder="Plot / House number, Street name, Area"
                    className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-neutral-50 border border-neutral-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500 focus:outline-hidden resize-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submittingAuth}
                className="w-full py-2.5 px-4 rounded-xl bg-orange-600 hover:bg-orange-700 disabled:opacity-60 text-white font-bold text-xs sm:text-sm transition-all shadow-sm cursor-pointer mt-2"
              >
                {submittingAuth ? 'Creating Account...' : 'Register New Account'}
              </button>
            </form>
          )}

          {/* Social Sign-in Divider */}
          <div className="relative my-6 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-neutral-200" />
            </div>
            <span className="relative bg-white px-3 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
              Or continue with
            </span>
          </div>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={submittingAuth}
            className="w-full py-2.5 px-4 rounded-xl border border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-700 font-bold text-xs sm:text-sm flex items-center justify-center gap-3 transition-all cursor-pointer shadow-2xs"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          <p className="mt-6 text-center text-[11px] text-neutral-400">
            Guest checkout is also always supported during catalog checkout.
          </p>
        </div>
      </div>
    );
  }

  // LOGGED IN CUSTOMER VIEW
  const displayName = customerProfile?.name || user.displayName || user.email?.split('@')[0] || 'Valued Customer';
  const customerEmail = customerProfile?.email || user.email;
  const isPurchased = customerProfile?.purchaseStatus === 'purchased' || orders.length > 0;

  return (
    <div className="bg-neutral-50 min-h-screen py-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Customer Profile & Status Card */}
        <div className="bg-white rounded-3xl border border-neutral-200/90 p-6 sm:p-8 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-neutral-100">
            <div className="flex items-start sm:items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-orange-100 text-orange-600 font-black text-2xl flex items-center justify-center shrink-0 shadow-inner">
                {displayName.charAt(0).toUpperCase()}
              </div>

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight">
                    {displayName}
                  </h1>
                  {isPurchased ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Verified Buyer
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-neutral-100 text-neutral-700 text-[11px] font-semibold">
                      Registered Member
                    </span>
                  )}
                  {isAdmin && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-800 text-[11px] font-bold uppercase">
                      <Shield className="w-3 h-3 text-orange-600" /> Admin
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-4 mt-1 text-xs text-neutral-500 flex-wrap">
                  <span className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-neutral-400" />
                    {customerEmail}
                  </span>
                  {customerProfile?.phone && (
                    <span className="flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-neutral-400" />
                      {customerProfile.phone}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
              <button
                onClick={handleOpenEditProfile}
                className="px-3.5 py-2 rounded-xl border border-neutral-300 hover:bg-neutral-50 text-neutral-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Details</span>
              </button>

              {isAdmin && (
                <button
                  onClick={() => navigate('/admin')}
                  className="px-3.5 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs"
                >
                  Admin Console
                </button>
              )}

              <button
                onClick={() => signOut()}
                className="px-3.5 py-2 border border-neutral-300 hover:bg-neutral-100 text-neutral-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>

          {/* Delivery & Account Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 text-xs">
            <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-100">
              <span className="font-bold text-neutral-400 uppercase tracking-wider text-[10px] block mb-1">
                Saved Delivery Address
              </span>
              {customerProfile?.address ? (
                <p className="text-neutral-800 font-medium">
                  {customerProfile.address}
                  {customerProfile.city ? `, ${customerProfile.city}` : ''}
                </p>
              ) : (
                <p className="text-neutral-400 italic">No delivery address saved yet.</p>
              )}
            </div>

            <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-100">
              <span className="font-bold text-neutral-400 uppercase tracking-wider text-[10px] block mb-1">
                Account Status & History
              </span>
              <p className="text-neutral-800 font-medium">
                Status: <span className="font-bold text-emerald-600">Active</span>
              </p>
              <p className="text-neutral-500 text-[11px] mt-0.5">
                Member since:{' '}
                {customerProfile?.createdAt
                  ? new Date(customerProfile.createdAt).toLocaleDateString()
                  : 'Recent'}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-100">
              <span className="font-bold text-neutral-400 uppercase tracking-wider text-[10px] block mb-1">
                Order Statistics
              </span>
              <p className="text-neutral-800 font-medium">
                Lifetime Orders: <span className="font-bold text-neutral-900">{orders.length}</span>
              </p>
              <p className="text-neutral-500 text-[11px] mt-0.5">
                Total spend:{' '}
                <span className="font-bold text-orange-600">
                  {formatPrice(orders.reduce((sum, o) => sum + (o.total || 0), 0))}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Orders Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
              <Package className="w-5 h-5 text-orange-600" />
              Your Order History ({orders.length})
            </h2>
            <button
              onClick={() => navigate('/catalog')}
              className="text-xs font-bold text-orange-600 hover:underline cursor-pointer"
            >
              Order New Instruments →
            </button>
          </div>

          {loadingOrders ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-neutral-200">
              <div className="w-6 h-6 border-2 border-orange-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <p className="text-xs text-neutral-500">Loading your orders...</p>
            </div>
          ) : orders.length > 0 ? (
            <div className="space-y-3">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white rounded-2xl border border-neutral-200/90 p-5 shadow-xs space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-neutral-100 gap-2">
                    <div>
                      <span className="font-mono font-bold text-sm text-neutral-900 block">
                        {order.orderNumber}
                      </span>
                      <span className="text-[11px] text-neutral-400">
                        Placed on {new Date(order.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                          order.status === 'Completed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : order.status === 'Shipped'
                            ? 'bg-blue-100 text-blue-800'
                            : order.status === 'Processing' || order.status === 'Confirmed'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-orange-100 text-orange-800'
                        }`}
                      >
                        {order.status}
                      </span>
                      <span className="font-extrabold text-neutral-900 text-sm sm:text-base">
                        {formatPrice(order.total || order.totalAmount || 0)}
                      </span>
                    </div>
                  </div>

                  {/* Items summary */}
                  <div className="divide-y divide-neutral-100">
                    {order.items.map((it) => (
                      <div key={it.id} className="py-2 flex items-center justify-between gap-3 text-xs">
                        <div className="truncate">
                          <span className="font-semibold text-neutral-800">{it.productTitle}</span>
                          {it.selectedVariant?.attributes && (
                            <span className="text-neutral-500 ml-2">
                              ({Object.entries(it.selectedVariant.attributes).map(([k, v]) => `${k}: ${v}`).join(', ')})
                            </span>
                          )}
                        </div>
                        <span className="text-neutral-600 font-mono shrink-0">
                          Qty {it.quantity} • {formatPrice(it.subtotal)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {onSelectOrder && (
                    <div className="pt-2 flex justify-end">
                      <button
                        onClick={() => onSelectOrder(order)}
                        className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1 cursor-pointer"
                      >
                        <span>View Invoice Summary</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-neutral-200 p-10 text-center text-xs text-neutral-500">
              <ShoppingBag className="w-10 h-10 text-neutral-300 mx-auto mb-3" />
              <p className="font-bold text-neutral-800 text-sm">No orders placed yet</p>
              <p className="mt-1">Orders placed under this account will appear here with live tracking.</p>
              <button
                onClick={() => navigate('/catalog')}
                className="mt-4 px-6 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-xl cursor-pointer transition-all shadow-xs"
              >
                Browse Catalog
              </button>
            </div>
          )}
        </div>

        {/* Security & Account Management Footer */}
        <div className="pt-6 border-t border-neutral-200 flex items-center justify-between text-xs text-neutral-400">
          <span>Customer Account ID: {user.uid}</span>
          <button
            onClick={() => setDeleteModalOpen(true)}
            className="text-neutral-400 hover:text-red-600 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete Account</span>
          </button>
        </div>
      </div>

      {/* EDIT PROFILE MODAL */}
      {editProfileOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-xl border border-neutral-200 space-y-4">
            <h3 className="text-lg font-black text-neutral-900">
              Edit Account Details
            </h3>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-neutral-50 border border-neutral-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  Phone / WhatsApp
                </label>
                <input
                  type="tel"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  placeholder="0300-1234567"
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-neutral-50 border border-neutral-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  City
                </label>
                <input
                  type="text"
                  value={editCity}
                  onChange={(e) => setEditCity(e.target.value)}
                  placeholder="Lahore"
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-neutral-50 border border-neutral-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  Complete Delivery Address
                </label>
                <textarea
                  rows={3}
                  value={editAddress}
                  onChange={(e) => setEditAddress(e.target.value)}
                  placeholder="Street, Sector, Area..."
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-neutral-50 border border-neutral-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500 focus:outline-hidden resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditProfileOpen(false)}
                  className="px-4 py-2 rounded-xl border border-neutral-300 text-neutral-700 text-xs font-bold hover:bg-neutral-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold cursor-pointer disabled:opacity-60"
                >
                  {isSavingProfile ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE ACCOUNT CONFIRMATION MODAL */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-xl border border-neutral-200 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-black text-neutral-900">
              Delete Customer Account?
            </h3>

            <p className="text-xs text-neutral-500 leading-relaxed">
              Are you sure you want to delete your account? Your personal login credentials will be removed. Historical tax invoices and placed orders are retained for accounting records.
            </p>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-neutral-300 text-neutral-700 text-xs font-bold hover:bg-neutral-50 cursor-pointer"
              >
                Keep Account
              </button>
              <button
                type="button"
                disabled={isDeletingAccount}
                onClick={handleDeleteAccount}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold cursor-pointer disabled:opacity-60"
              >
                {isDeletingAccount ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
