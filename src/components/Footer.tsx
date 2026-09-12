import React from 'react';
import { Gauge, MapPin, Phone, Mail, Clock, ShieldCheck, ArrowUpRight, Lock } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';

interface FooterProps {
  navigate: (route: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ navigate }) => {
  const { settings, activeCategories } = useStore();
  const { user, isAdmin } = useAuth();

  const handleWhatsApp = (phone?: string) => {
    const p = phone?.replace(/[^0-9]/g, '') || '923354499186';
    window.open(`https://wa.me/${p}`, '_blank');
  };

  return (
    <footer className="bg-neutral-950 text-neutral-300 pt-16 pb-12 border-t border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-14 border-b border-neutral-800">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <div
              onClick={() => navigate('/')}
              className="flex items-center gap-3 cursor-pointer group select-none inline-flex"
            >
              <div className="w-10 h-10 rounded-lg bg-orange-600 text-white flex items-center justify-center shadow-md">
                <Gauge className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-2xl tracking-tight text-white uppercase">
                Gauge<span className="text-orange-500">House</span>
              </span>
            </div>

            <p className="text-sm text-neutral-400 max-w-sm leading-relaxed">
              {settings.businessType || 'Industrial Equipment Supplier, Importer & Exporter'} — Providing Pakistan's petrochemical, fertilizer, power, and manufacturing sectors with certified pressure, temperature, and automation instrumentation.
            </p>

            <div className="pt-2 flex items-center gap-2 text-xs text-orange-400 font-semibold tracking-wide uppercase">
              <ShieldCheck className="w-4 h-4 text-orange-500" />
              <span>{settings.tagline || 'Precision You Can Trust'} • Est. 1998</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold tracking-wider text-white uppercase">Navigation</h3>
            <ul className="space-y-2 text-sm text-neutral-400">
              <li>
                <button
                  onClick={() => navigate('/')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/catalog')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  All Products Catalog
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/cart')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Shopping Cart
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/account')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Customer Account
                </button>
              </li>
              {(!user || isAdmin) && (
                <li>
                  <button
                    onClick={() => navigate('/admin')}
                    className="flex items-center gap-1 text-neutral-500 hover:text-orange-400 transition-colors cursor-pointer text-xs pt-1"
                  >
                    <Lock className="w-3 h-3" />
                    <span>Admin Portal</span>
                  </button>
                </li>
              )}
            </ul>
          </div>

          {/* Categories */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold tracking-wider text-white uppercase">Categories</h3>
            <ul className="space-y-2 text-sm text-neutral-400">
              {activeCategories.slice(0, 6).map((c) => (
                <li key={c.id}>
                  <button
                    onClick={() => navigate(`/category/${c.slug}`)}
                    className="hover:text-white transition-colors cursor-pointer text-left"
                  >
                    {c.name}
                  </button>
                </li>
              ))}
              {activeCategories.length === 0 && (
                <li className="text-xs text-neutral-500">Categories being updated</li>
              )}
            </ul>
          </div>

          {/* Contact Information */}
          <div className="space-y-3 lg:col-span-1">
            <h3 className="text-sm font-bold tracking-wider text-white uppercase">Showroom & Supply</h3>
            <div className="space-y-3 text-xs text-neutral-400 leading-normal">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                <span>{settings.address}</span>
              </div>

              <div className="flex items-start gap-2">
                <Phone className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                <div className="flex flex-col gap-0.5">
                  {(settings.phones || []).slice(0, 3).map((ph, idx) => (
                    <a
                      key={idx}
                      href={`tel:${ph.replace(/[^0-9]/g, '')}`}
                      className="hover:text-white transition-colors"
                    >
                      {ph}
                    </a>
                  ))}
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Mail className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                <div className="flex flex-col gap-0.5">
                  {(settings.emails || []).map((em, idx) => (
                    <a
                      key={idx}
                      href={`mailto:${em}`}
                      className="hover:text-white transition-colors break-all"
                    >
                      {em}
                    </a>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 text-neutral-400 pt-1">
                <Clock className="w-4 h-4 text-neutral-500 shrink-0" />
                <span>Mon – Sat: 9:00 AM – 7:00 PM</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
          <div>
            © {new Date().getFullYear()} Gauge House. All rights reserved.
          </div>
          <div className="flex items-center gap-6">
            <span>Currency: <strong className="text-neutral-300">PKR (Rs.)</strong></span>
            <span>Brandreth Road, Lahore</span>
            <button
              onClick={() => navigate('/admin')}
              className="text-neutral-600 hover:text-neutral-400 transition-colors cursor-pointer"
            >
              Staff Access
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
