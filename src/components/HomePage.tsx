import React, { useState, useEffect } from 'react';
import {
  Gauge,
  ShieldCheck,
  Truck,
  Award,
  ArrowRight,
  Phone,
  MessageSquare,
  ChevronRight,
  Layers,
  MapPin,
  Clock,
  Sparkles
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { ProductCard } from './ProductCard';

interface HomePageProps {
  navigate: (route: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ navigate }) => {
  const { publishedProducts, featuredProducts, activeCategories, activeBanners, settings } = useStore();
  const [currentBannerIdx, setCurrentBannerIdx] = useState(0);

  // Auto-advance banner every 6 seconds if multiple banners exist
  useEffect(() => {
    if (activeBanners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentBannerIdx((prev) => (prev + 1) % activeBanners.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [activeBanners.length]);

  const activeBanner = activeBanners[currentBannerIdx];

  const handleWhatsApp = () => {
    const phone = settings.whatsappNumber?.replace(/[^0-9]/g, '') || '923354499186';
    const text = encodeURIComponent('Hello Gauge House, I would like to request an industrial quote for gauges and transmitters.');
    window.open(`https://wa.me/${phone}?text=${text}`, '_blank');
  };

  return (
    <div className="bg-neutral-50 min-h-screen">
      {/* ========================================================= */}
      {/* 1. HERO SECTION */}
      {/* ========================================================= */}
      <section className="relative bg-neutral-950 text-white overflow-hidden">
        {/* Background gradient & industrial subtle grid texture */}
        <div className="absolute inset-0 bg-[radial-gradient(#ea580c_1px,transparent_1px)] [background-size:24px_24px] opacity-10" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-900 border border-neutral-800 text-orange-400 text-xs font-semibold uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4 text-orange-500" />
                <span>Pakistan's Trusted Industrial Instrumentation Source Since 1998</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
                {activeBanner?.title || (
                  <>
                    Precision You Can Trust. <span className="text-orange-500">Industrial Gauges</span> & Automation.
                  </>
                )}
              </h1>

              <p className="text-sm sm:text-base text-neutral-300 max-w-xl leading-relaxed">
                {activeBanner?.subtitle ||
                  'Specialized industrial pressure gauges, vacuum gauges, dial thermometers, transmitters, and certified calibration instrumentation ready for immediate dispatch from Brandreth Road, Lahore.'}
              </p>

              {/* Action CTAs */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={() => navigate('/catalog')}
                  className="px-6 py-3.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-sm flex items-center gap-2 shadow-lg shadow-orange-600/25 transition-all cursor-pointer"
                >
                  <span>{activeBanner?.ctaText || 'Explore Full Catalog'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={handleWhatsApp}
                  className="px-6 py-3.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-200 font-bold text-sm flex items-center gap-2 transition-all cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4 text-emerald-400" />
                  <span>Request Instant Quote</span>
                </button>
              </div>

              {/* Quick Trust Highlights */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-neutral-800/80 text-xs">
                <div>
                  <span className="font-extrabold text-orange-400 text-base sm:text-lg block">25+ Years</span>
                  <span className="text-neutral-400">Industry Experience</span>
                </div>
                <div>
                  <span className="font-extrabold text-white text-base sm:text-lg block">100% Certified</span>
                  <span className="text-neutral-400">Quality Tested Specs</span>
                </div>
                <div>
                  <span className="font-extrabold text-orange-400 text-base sm:text-lg block">Ready Stock</span>
                  <span className="text-neutral-400">Nationwide Dispatch</span>
                </div>
              </div>
            </div>

            {/* Right: Featured Hero Visual (5 cols) */}
            <div className="lg:col-span-5 relative">
              <div className="relative aspect-4/3 sm:aspect-square rounded-2xl overflow-hidden border border-neutral-800 bg-neutral-900 shadow-2xl">
                <img
                  src={
                    activeBanner?.imageUrl ||
                    'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1000&q=80'
                  }
                  alt="Industrial Gauge House"
                  className="w-full h-full object-cover object-center"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-transparent opacity-80" />

                <div className="absolute bottom-6 left-6 right-6 p-4 rounded-xl bg-neutral-900/90 backdrop-blur-md border border-neutral-800 text-white">
                  <span className="text-[10px] font-mono text-orange-400 uppercase tracking-widest block font-bold">
                    Official Showroom
                  </span>
                  <p className="text-xs font-semibold text-neutral-200 mt-0.5">
                    Al-Makkah Market-3, Dewan Street #42, Brandreth Road, Lahore
                  </p>
                </div>
              </div>

              {/* Carousel Indicators if multiple banners */}
              {activeBanners.length > 1 && (
                <div className="flex justify-center gap-2 mt-4">
                  {activeBanners.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentBannerIdx(idx)}
                      className={`h-2 rounded-full transition-all cursor-pointer ${
                        currentBannerIdx === idx ? 'w-8 bg-orange-500' : 'w-2 bg-neutral-700'
                      }`}
                      aria-label={`Slide ${idx + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 2. VALUE PROPOSITIONS / WHY GAUGE HOUSE */}
      {/* ========================================================= */}
      <section id="why-gauge-house" className="py-12 bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-5 rounded-xl bg-neutral-50 border border-neutral-200/80 flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-neutral-900 mb-1">Quality Products</h3>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  Precision-engineered gauges tested for accuracy, repeatability, and harsh industrial environments.
                </p>
              </div>
            </div>

            <div className="p-5 rounded-xl bg-neutral-50 border border-neutral-200/80 flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-neutral-900 mb-1">Industrial Expertise</h3>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  Decades of specialized technical experience assisting Pakistan's chemical, sugar, textile & power plants.
                </p>
              </div>
            </div>

            <div className="p-5 rounded-xl bg-neutral-50 border border-neutral-200/80 flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                <Truck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-neutral-900 mb-1">Reliable Supply</h3>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  Massive ready inventory in Lahore for same-day dispatch via reputable cargo and courier networks.
                </p>
              </div>
            </div>

            <div className="p-5 rounded-xl bg-neutral-50 border border-neutral-200/80 flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                <Gauge className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-neutral-900 mb-1">Import & Export</h3>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  Direct international imports of top European and Asian industrial instrumentation brands.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 3. FEATURED CATEGORIES SECTION */}
      {/* ========================================================= */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-orange-600 block mb-1">
                Industrial Catalog
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
                Product Categories
              </h2>
            </div>
            <button
              onClick={() => navigate('/catalog')}
              className="text-xs sm:text-sm font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span>View All Categories</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {activeCategories.map((cat) => (
              <div
                key={cat.id}
                onClick={() => navigate(`/category/${cat.slug}`)}
                className="group relative bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-xs hover:shadow-lg hover:border-orange-500 transition-all cursor-pointer flex flex-col justify-between"
              >
                <div className="aspect-4/3 w-full bg-neutral-100 overflow-hidden relative">
                  <img
                    src={cat.image || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80'}
                    alt={cat.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/70 via-transparent to-transparent" />
                </div>

                <div className="p-4 bg-white flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-neutral-900 group-hover:text-orange-600 transition-colors">
                      {cat.name}
                    </h3>
                    <p className="text-[11px] text-neutral-500 line-clamp-1 mt-0.5">
                      {cat.description || 'Certified industrial equipment'}
                    </p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-neutral-50 group-hover:bg-orange-600 group-hover:text-white flex items-center justify-center text-neutral-400 transition-colors shrink-0">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 4. FEATURED PRODUCTS SECTION */}
      {/* ========================================================= */}
      {featuredProducts.length > 0 && (
        <section className="py-16 bg-white border-y border-neutral-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-orange-600 block mb-1">
                  High Demand Instruments
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
                  Featured Products
                </h2>
              </div>
              <button
                onClick={() => navigate('/catalog')}
                className="text-xs sm:text-sm font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1 transition-colors cursor-pointer"
              >
                <span>Browse Full Catalog</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {featuredProducts.slice(0, 8).map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  onNavigate={(slug) => navigate(`/product/${slug}`)}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ========================================================= */}
      {/* 5. SHOWROOM & CONTACT / INQUIRY SECTION */}
      {/* ========================================================= */}
      <section id="contact" className="py-16 bg-neutral-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7 space-y-6">
              <span className="text-xs font-bold uppercase tracking-wider text-orange-400">
                Lahore Showroom & Supply Hub
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                Visit Our Brandreth Road Showroom or Request Fast Invoicing
              </h2>
              <p className="text-sm text-neutral-300 leading-relaxed">
                Whether you need bulk calibration certificates, specialized flange mountings, or immediate stock delivery for an industrial emergency, our technical engineering team is ready.
              </p>

              <div className="space-y-3 text-xs sm:text-sm text-neutral-300">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
                  <span>{settings.address}</span>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
                  <div className="flex flex-wrap gap-x-4 gap-y-1 font-semibold text-white">
                    {(settings.phones || []).map((ph, i) => (
                      <span key={i}>{ph}</span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-neutral-400 shrink-0" />
                  <span>Monday through Saturday: 9:00 AM – 7:00 PM (Closed Sunday)</span>
                </div>
              </div>

              <div className="pt-2 flex flex-wrap gap-4">
                <button
                  onClick={handleWhatsApp}
                  className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold flex items-center gap-2 shadow-lg transition-all cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Chat on WhatsApp</span>
                </button>
                <a
                  href={`tel:${settings.phones?.[0]?.replace(/[^0-9]/g, '') || '03354499186'}`}
                  className="px-6 py-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs sm:text-sm font-bold flex items-center gap-2 transition-all"
                >
                  <Phone className="w-4 h-4 text-orange-400" />
                  <span>Call {settings.phones?.[0] || '0335-4499186'}</span>
                </a>
              </div>
            </div>

            {/* Right Card */}
            <div className="lg:col-span-5 bg-neutral-950 p-6 sm:p-8 rounded-2xl border border-neutral-800 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-orange-500" />
                Specialized Bulk & Export Inquiries
              </h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                We supply government tenders, petrochemical refineries, sugar mills, and industrial EPC contractors with formal proforma invoices, GST/NTN documentation, and standard warranties.
              </p>
              <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800/80 space-y-2 text-xs">
                <p className="text-neutral-400">Official Tender & NTN Inquiries:</p>
                <p className="text-white font-mono font-bold">{settings.emails?.[0] || 'gaugehouse1998@gmail.com'}</p>
                {settings.emails?.[1] && (
                  <p className="text-neutral-400 font-mono">{settings.emails[1]}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
