import React from 'react';
import { BookOpen, Clock, ArrowRight, ChevronRight, CheckCircle2, Shield } from 'lucide-react';
import { INDUSTRIAL_GUIDES } from '../data/guidesData';
import { SEOHead } from './SEOHead';
import { SEOLink } from './SEOLink';
import { generateBreadcrumbSchema } from '../utils/seo';

interface GuidesPageProps {
  navigate: (route: string) => void;
}

export const GuidesPage: React.FC<GuidesPageProps> = ({ navigate }) => {
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Technical & Engineering Guides', url: '/guides' },
  ]);

  return (
    <div className="bg-neutral-50 min-h-screen py-10">
      <SEOHead
        title="Industrial Pressure & Temperature Guides | Gauge House Pakistan"
        description="Comprehensive technical guides on industrial pressure gauge selection, dial sizes, SS304 vs SS316 materials, pressure transmitters, and plant maintenance in Pakistan."
        canonicalPath="/guides"
        jsonLd={breadcrumbSchema}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs text-neutral-500 mb-6">
          <SEOLink to="/" navigate={navigate} className="hover:text-orange-600 transition-colors">
            Home
          </SEOLink>
          <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
          <span className="text-neutral-900 font-semibold">Technical & Engineering Guides</span>
        </nav>

        {/* Page Header */}
        <div className="bg-white rounded-2xl border border-neutral-200/90 p-8 sm:p-10 mb-10 shadow-xs">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 border border-orange-200 text-orange-700 text-xs font-bold uppercase tracking-wider mb-4">
            <BookOpen className="w-4 h-4 text-orange-600" />
            <span>Industrial Instrumentation Knowledge Base</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 tracking-tight mb-4">
            Industrial Pressure Measurement & Engineering Guides
          </h1>

          <p className="text-sm sm:text-base text-neutral-600 max-w-3xl leading-relaxed">
            Written for plant engineers, instrument technicians, and industrial procurement professionals in Pakistan. Explore engineering standards for dial size selection, corrosive media compatibility, transmitter signal integration, and gauge maintenance.
          </p>
        </div>

        {/* Guides Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {INDUSTRIAL_GUIDES.map((guide) => (
            <article
              key={guide.slug}
              className="bg-white rounded-2xl border border-neutral-200/90 p-6 shadow-xs hover:shadow-md hover:border-orange-500 transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-orange-600 bg-orange-50 px-2.5 py-1 rounded-md">
                    {guide.category}
                  </span>
                  <div className="flex items-center gap-1 text-xs text-neutral-400">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{guide.readTime}</span>
                  </div>
                </div>

                <h2 className="text-lg font-bold text-neutral-900 group-hover:text-orange-600 transition-colors leading-snug mb-3">
                  <SEOLink to={`/guides/${guide.slug}`} navigate={navigate}>
                    {guide.title}
                  </SEOLink>
                </h2>

                <p className="text-xs text-neutral-600 leading-relaxed line-clamp-3 mb-6">
                  {guide.summary}
                </p>
              </div>

              <div className="pt-4 border-t border-neutral-100 flex items-center justify-between">
                <span className="text-xs font-medium text-neutral-400">
                  {guide.faqs.length} FAQs Included
                </span>
                <SEOLink
                  to={`/guides/${guide.slug}`}
                  navigate={navigate}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-600 group-hover:text-orange-700 transition-colors"
                >
                  <span>Read Guide</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </SEOLink>
              </div>
            </article>
          ))}
        </div>

        {/* Industrial Authority Trust Card */}
        <div className="bg-neutral-900 rounded-2xl p-8 sm:p-10 text-white flex flex-col md:flex-row items-center justify-between gap-6 border border-neutral-800">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-orange-400 text-xs font-bold uppercase tracking-wider">
              <Shield className="w-4 h-4 text-orange-500" />
              <span>Gauge House Technical Consultancy</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-extrabold text-white">
              Need custom instrument sizing or proforma quotation?
            </h3>
            <p className="text-xs sm:text-sm text-neutral-300 max-w-xl">
              Our Lahore engineering team provides direct guidance on gauge sizing, chemical compatibility, and 4-20mA loop wiring for plants across Pakistan.
            </p>
          </div>
          <SEOLink
            to="/catalog"
            navigate={navigate}
            className="px-6 py-3.5 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0"
          >
            Browse Industrial Catalog
          </SEOLink>
        </div>
      </div>
    </div>
  );
};
