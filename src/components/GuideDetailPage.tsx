import React from 'react';
import { ChevronRight, Clock, Calendar, CheckCircle2, ArrowRight, MessageSquare, Phone, BookOpen, Share2 } from 'lucide-react';
import { IndustrialGuide, INDUSTRIAL_GUIDES } from '../data/guidesData';
import { SEOHead } from './SEOHead';
import { SEOLink } from './SEOLink';
import { generateBreadcrumbSchema, generateFAQSchema, BASE_URL } from '../utils/seo';
import { useStore } from '../context/StoreContext';

interface GuideDetailPageProps {
  guide: IndustrialGuide;
  navigate: (route: string) => void;
}

export const GuideDetailPage: React.FC<GuideDetailPageProps> = ({ guide, navigate }) => {
  const { settings } = useStore();

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Guides', url: '/guides' },
    { name: guide.h1, url: `/guides/${guide.slug}` },
  ]);

  const faqSchema = generateFAQSchema(guide.faqs);

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: guide.title,
    description: guide.metaDescription,
    datePublished: guide.publishedDate,
    dateModified: guide.publishedDate,
    author: {
      '@type': 'Organization',
      name: 'Gauge House Technical Editorial Team',
      url: `${BASE_URL}/`,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Gauge House',
      url: `${BASE_URL}/`,
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${BASE_URL}/guides/${guide.slug}`,
    },
  };

  const combinedSchemas = [breadcrumbSchema, faqSchema, articleSchema];

  const handleWhatsApp = () => {
    const phone = settings.whatsappNumber?.replace(/[^0-9]/g, '') || '923354499186';
    const text = encodeURIComponent(`Hello Gauge House, I was reading your guide: "${guide.title}" and have an instrumentation inquiry.`);
    window.open(`https://wa.me/${phone}?text=${text}`, '_blank');
  };

  return (
    <div className="bg-neutral-50 min-h-screen py-8">
      <SEOHead
        title={`${guide.title} | Gauge House Pakistan`}
        description={guide.metaDescription}
        canonicalPath={`/guides/${guide.slug}`}
        type="article"
        jsonLd={combinedSchemas}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-xs text-neutral-500 mb-6 flex-wrap">
          <SEOLink to="/" navigate={navigate} className="hover:text-orange-600 transition-colors">
            Home
          </SEOLink>
          <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
          <SEOLink to="/guides" navigate={navigate} className="hover:text-orange-600 transition-colors">
            Engineering Guides
          </SEOLink>
          <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
          <span className="text-neutral-900 font-semibold truncate max-w-xs">{guide.h1}</span>
        </nav>

        {/* Main Article Container */}
        <article className="bg-white rounded-2xl border border-neutral-200/90 shadow-xs overflow-hidden p-6 sm:p-10 mb-10">
          {/* Metadata Bar */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-500 mb-4 pb-4 border-b border-neutral-100">
            <span className="px-2.5 py-1 rounded-md bg-orange-100 text-orange-700 font-bold uppercase tracking-wider">
              {guide.category}
            </span>
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-neutral-400" />
              <span>{guide.readTime}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-neutral-400" />
              <span>Published {guide.publishedDate}</span>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-neutral-900 leading-tight mb-6">
            {guide.title}
          </h1>

          {/* Executive Summary Lead */}
          <div className="p-5 rounded-xl bg-orange-50/70 border border-orange-200/60 mb-8 text-neutral-800 text-sm sm:text-base leading-relaxed font-medium">
            {guide.summary}
          </div>

          {/* Content Sections */}
          <div className="space-y-8 text-neutral-800 text-sm sm:text-base leading-relaxed">
            {guide.sections.map((sec, idx) => (
              <section key={idx} className="space-y-3">
                <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 tracking-tight">
                  {sec.heading}
                </h2>
                <p className="text-neutral-700 leading-relaxed whitespace-pre-line">
                  {sec.content}
                </p>

                {sec.keyPoints && sec.keyPoints.length > 0 && (
                  <div className="bg-neutral-50 rounded-xl p-4 border border-neutral-200/70 mt-3 space-y-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 block mb-1">
                      Key Technical Takeaways:
                    </span>
                    <ul className="space-y-1.5 text-xs sm:text-sm text-neutral-700">
                      {sec.keyPoints.map((pt, pIdx) => (
                        <li key={pIdx} className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{pt}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </section>
            ))}
          </div>

          {/* FAQ Accordion Section */}
          {guide.faqs && guide.faqs.length > 0 && (
            <div className="mt-12 pt-8 border-t border-neutral-200">
              <h2 className="text-xl sm:text-2xl font-extrabold text-neutral-900 mb-6">
                Frequently Asked Engineering Questions
              </h2>
              <div className="space-y-4">
                {guide.faqs.map((faq, fIdx) => (
                  <div key={fIdx} className="bg-neutral-50 rounded-xl p-5 border border-neutral-200/80">
                    <h3 className="text-sm sm:text-base font-bold text-neutral-900 mb-2">
                      {faq.question}
                    </h3>
                    <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Author / Source Box */}
          <div className="mt-10 p-5 rounded-xl bg-neutral-100/70 border border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-neutral-600">
              <strong className="text-neutral-900 font-bold block mb-0.5">Published by Gauge House Technical Team</strong>
              Brandreth Road, Lahore — Supplying precision pressure & temperature instrumentation across Pakistan since 1998.
            </div>
            <button
              onClick={handleWhatsApp}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shrink-0 transition-all"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Ask Engineer on WhatsApp</span>
            </button>
          </div>
        </article>

        {/* Related Guides / Catalog CTA */}
        <div className="bg-white rounded-2xl border border-neutral-200 p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 mb-12">
          <div>
            <h3 className="text-lg font-bold text-neutral-900">Explore Instruments Covered in this Guide</h3>
            <p className="text-xs sm:text-sm text-neutral-500 mt-1">
              Browse certified pressure gauges, transmitters, and fittings in our live stock catalog.
            </p>
          </div>
          <SEOLink
            to="/catalog"
            navigate={navigate}
            className="px-6 py-3 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all shrink-0"
          >
            <span>View Catalog</span>
            <ArrowRight className="w-4 h-4" />
          </SEOLink>
        </div>
      </div>
    </div>
  );
};
