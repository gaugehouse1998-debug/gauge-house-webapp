import React, { useState } from 'react';
import {
  Search,
  ShoppingCart,
  Menu,
  X,
  Phone,
  Mail,
  Shield,
  MessageSquare,
  Gauge,
  User,
  ChevronDown
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
  currentRoute: string;
  navigate: (route: string) => void;
  onOpenSearch: () => void;
}

export const Header: React.FC<HeaderProps> = ({ currentRoute, navigate, onOpenSearch }) => {
  const { itemCount } = useCart();
  const { settings, activeCategories } = useStore();
  const { user, isAdmin } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);

  const primaryPhone = settings.phones?.[0] || '0335-4499186';
  const primaryEmail = settings.emails?.[0] || 'gaugehouse1998@gmail.com';

  const handleNav = (route: string) => {
    navigate(route);
    setMobileMenuOpen(false);
    setCategoryDropdownOpen(false);
  };

  const handleWhatsAppClick = () => {
    const phone = settings.whatsappNumber?.replace(/[^0-9]/g, '') || '923354499186';
    const url = `https://wa.me/${phone}?text=${encodeURIComponent('Hello Gauge House, I have an inquiry regarding industrial gauges and equipment.')}`;
    window.open(url, '_blank');
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-neutral-200 shadow-xs">
      {/* Top Announcement Bar */}
      <div className="bg-neutral-900 text-neutral-300 text-xs py-2 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-2">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="flex items-center gap-1 font-medium text-orange-400">
              <Shield className="w-3.5 h-3.5" />
              {settings.businessType || 'Industrial Equipment Supplier, Importer & Exporter'}
            </span>
            <span className="hidden md:inline text-neutral-500">•</span>
            <span className="hidden md:flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-neutral-400" />
              Direct Helpline: <span className="text-white font-semibold">{primaryPhone}</span>
            </span>
            <span className="hidden lg:flex items-center gap-1">
              <Mail className="w-3.5 h-3.5 text-neutral-400" />
              {primaryEmail}
            </span>
          </div>

          <div className="flex items-center gap-3 ml-auto">
            <button
              onClick={handleWhatsAppClick}
              className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 transition-colors font-medium cursor-pointer"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>WhatsApp Inquiries</span>
            </button>
            <span className="text-neutral-700">|</span>
            {/* Discreet Admin Link */}
            <button
              onClick={() => handleNav('/admin')}
              className={`flex items-center gap-1 transition-colors cursor-pointer ${
                isAdmin ? 'text-orange-400 font-semibold' : 'text-neutral-400 hover:text-neutral-200'
              }`}
              title="Admin Portal"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>{isAdmin ? 'Admin Console' : 'Staff'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo */}
          <div
            onClick={() => handleNav('/')}
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            <div className="w-11 h-11 rounded-lg bg-orange-600 text-white flex items-center justify-center shadow-md shadow-orange-600/20 group-hover:bg-orange-700 transition-colors">
              <Gauge className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-2xl tracking-tight text-neutral-900 uppercase">
                  Gauge<span className="text-orange-600">House</span>
                </span>
              </div>
              <p className="text-[11px] font-medium tracking-wide uppercase text-neutral-500 -mt-1">
                {settings.tagline || 'Precision You Can Trust'}
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            <button
              onClick={() => handleNav('/')}
              className={`font-semibold text-sm transition-colors cursor-pointer ${
                currentRoute === '/'
                  ? 'text-orange-600'
                  : 'text-neutral-700 hover:text-orange-600'
              }`}
            >
              Home
            </button>

            <button
              onClick={() => handleNav('/catalog')}
              className={`font-semibold text-sm transition-colors cursor-pointer ${
                currentRoute.startsWith('/catalog')
                  ? 'text-orange-600'
                  : 'text-neutral-700 hover:text-orange-600'
              }`}
            >
              All Products
            </button>

            {/* Categories Dropdown */}
            <div className="relative group">
              <button
                onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
                className="flex items-center gap-1.5 font-semibold text-sm text-neutral-700 hover:text-orange-600 transition-colors cursor-pointer py-1"
                aria-expanded={categoryDropdownOpen}
              >
                <span>Categories</span>
                <ChevronDown className={`w-4 h-4 text-neutral-400 group-hover:text-orange-600 transition-transform ${categoryDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {categoryDropdownOpen && (
                <div 
                  className="absolute top-full left-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-neutral-200/90 py-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150"
                  onMouseLeave={() => setCategoryDropdownOpen(false)}
                >
                  <div className="px-3.5 py-1.5 border-b border-neutral-100 flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                      Product Categories
                    </span>
                    <span className="text-[10px] bg-orange-100 text-orange-700 font-bold px-1.5 py-0.5 rounded-full">
                      {activeCategories.length}
                    </span>
                  </div>

                  <div className="max-h-80 overflow-y-auto py-1">
                    {activeCategories.length > 0 ? (
                      activeCategories.map((cat) => (
                        <button
                          key={cat.id}
                          onClick={() => {
                            setCategoryDropdownOpen(false);
                            handleNav(`/category/${cat.slug}`);
                          }}
                          className="w-full text-left px-4 py-2.5 text-xs font-semibold text-neutral-700 hover:bg-orange-50 hover:text-orange-600 transition-colors cursor-pointer flex items-center justify-between group/item"
                        >
                          <span>{cat.name}</span>
                          <span className="text-[10px] text-neutral-400 group-hover/item:text-orange-600 transition-colors">
                            Explore →
                          </span>
                        </button>
                      ))
                    ) : (
                      <div className="px-4 py-3 text-xs text-neutral-500">
                        No categories found in database.
                      </div>
                    )}
                  </div>

                  <div className="border-t border-neutral-100 mt-1 pt-1.5 px-2">
                    <button
                      onClick={() => {
                        setCategoryDropdownOpen(false);
                        handleNav('/catalog');
                      }}
                      className="w-full text-center py-2 text-xs font-bold text-orange-600 hover:bg-orange-50 rounded-xl transition-colors cursor-pointer"
                    >
                      Browse All Categories & Products →
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => handleNav('/#why-gauge-house')}
              className="font-semibold text-sm text-neutral-700 hover:text-orange-600 transition-colors cursor-pointer"
            >
              Why Gauge House
            </button>

            <button
              onClick={() => handleNav('/#contact')}
              className="font-semibold text-sm text-neutral-700 hover:text-orange-600 transition-colors cursor-pointer"
            >
              Contact & Showroom
            </button>
          </nav>

          {/* Right Action Icons */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Search Button */}
            <button
              onClick={onOpenSearch}
              className="p-2.5 rounded-full text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 transition-colors cursor-pointer"
              title="Search catalog"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* User Account / Profile */}
            <button
              onClick={() => handleNav('/account')}
              className="p-2.5 rounded-full text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 transition-colors cursor-pointer"
              title={user ? `Signed in as ${user.email}` : 'Customer Account'}
              aria-label="Account"
            >
              <User className="w-5 h-5" />
            </button>

            {/* Cart Button */}
            <button
              onClick={() => handleNav('/cart')}
              className="relative flex items-center gap-2 px-3.5 py-2 rounded-full bg-neutral-900 text-white hover:bg-neutral-800 transition-all cursor-pointer shadow-xs"
              aria-label="Shopping Cart"
            >
              <ShoppingCart className="w-5 h-5 text-orange-400" />
              <span className="hidden sm:inline text-xs font-semibold">Cart</span>
              {itemCount > 0 && (
                <span className="min-w-5 h-5 px-1.5 rounded-full bg-orange-600 text-white text-xs font-bold flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 lg:hidden rounded-lg text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
              aria-label="Open menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-neutral-200 bg-white px-4 pt-3 pb-6 space-y-3 shadow-lg">
          <div className="space-y-1">
            <button
              onClick={() => handleNav('/')}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-semibold ${
                currentRoute === '/' ? 'bg-orange-50 text-orange-600' : 'text-neutral-800'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => handleNav('/catalog')}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-semibold ${
                currentRoute.startsWith('/catalog') ? 'bg-orange-50 text-orange-600' : 'text-neutral-800'
              }`}
            >
              All Products Catalog
            </button>
            <div className="pt-3 pb-1 px-3 flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                Browse Categories
              </span>
              <span className="text-[10px] font-bold bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">
                {activeCategories.length} Categories
              </span>
            </div>
            <div className="grid grid-cols-1 gap-1 px-2">
              {activeCategories.map((cat) => {
                const isCurrent = currentRoute === `/category/${cat.slug}`;
                return (
                  <button
                    key={cat.id}
                    onClick={() => handleNav(`/category/${cat.slug}`)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-between transition-colors ${
                      isCurrent
                        ? 'bg-orange-600 text-white shadow-xs'
                        : 'text-neutral-700 hover:bg-orange-50 hover:text-orange-600'
                    }`}
                  >
                    <span>{cat.name}</span>
                    <span className={`text-[10px] ${isCurrent ? 'text-orange-200' : 'text-neutral-400'}`}>
                      View →
                    </span>
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => handleNav('/#why-gauge-house')}
              className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-semibold text-neutral-800"
            >
              Why Gauge House
            </button>
            <button
              onClick={() => handleNav('/#contact')}
              className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-semibold text-neutral-800"
            >
              Contact & Showroom
            </button>
            <button
              onClick={() => handleNav('/account')}
              className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-semibold text-neutral-800"
            >
              Customer Account / Login
            </button>
            <button
              onClick={() => handleNav('/admin')}
              className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-semibold text-orange-600 bg-orange-50"
            >
              Staff / Admin Portal
            </button>
          </div>

          <div className="pt-4 border-t border-neutral-100 flex flex-col gap-2">
            <button
              onClick={handleWhatsAppClick}
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold flex items-center justify-center gap-2 shadow-xs cursor-pointer"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Inquire via WhatsApp</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
