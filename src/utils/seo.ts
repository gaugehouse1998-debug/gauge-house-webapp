import { Product, Category } from '../types';

export const SITE_NAME = 'Gauge House';
export const SITE_TAGLINE = 'Precision You Can Trust — Industrial Pressure Gauges & Instrumentation';
export const BASE_URL = 'https://gaugehouse1998-debug.github.io/gauge-house-webapp';
export const BASE_PATH = '/gauge-house-webapp';

export const VERIFIED_BUSINESS = {
  name: 'Gauge House',
  legalName: 'Gauge House',
  email: 'gaugehouse1998@gmail.com',
  phone: '03354499186',
  intlPhone: '+923354499186',
  website: 'https://gaugehouse1998-debug.github.io/gauge-house-webapp/',
  instagram: 'https://www.instagram.com/gaugehouse/',
  googleBusiness: 'https://share.google/vF3mPKSlCp18rInyh',
  country: 'Pakistan',
  defaultCurrency: 'PKR',
};

/**
 * Normalizes a relative route to an absolute canonical URL
 */
export function getCanonicalUrl(route: string): string {
  let clean = (route || '').trim();
  clean = clean.replace(/^#+/, '');
  clean = clean.split('?')[0];

  if (clean.startsWith('/gauge-house-webapp/')) {
    clean = clean.replace('/gauge-house-webapp', '');
  } else if (clean === '/gauge-house-webapp') {
    clean = '';
  }

  clean = clean.replace(/^\/+/, '');
  if (!clean) {
    return `${BASE_URL}/`;
  }
  return `${BASE_URL}/${clean}`;
}

/**
 * Creates a clean SEO-friendly slug
 */
export function slugify(text: string): string {
  return (text || '')
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/&/g, '-and-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

/**
 * Generates dynamic SEO metadata for any catalog product
 */
export function generateProductSEO(product: Product) {
  const brandName = product.brand && product.brand !== 'Gauge House' ? `${product.brand} | Gauge House` : 'Gauge House Pakistan';
  
  // Extract key specs for description
  const dialSize = product.specifications?.['Dial Size'] || '';
  const material = product.specifications?.['Wetted Parts'] || product.specifications?.['Case Material'] || '';
  const range = product.specifications?.['Pressure Range'] || '';
  
  const specSnippets: string[] = [];
  if (dialSize) specSnippets.push(dialSize);
  if (material) specSnippets.push(material);
  if (range) specSnippets.push(`Range ${range}`);
  
  const specText = specSnippets.length > 0 ? ` featuring ${specSnippets.join(', ')}` : '';
  const priceText = product.price > 0 ? ` Available at Rs. ${product.salePrice || product.price} with nationwide dispatch in Pakistan.` : ' Available with nationwide dispatch in Pakistan.';

  const title = `${product.title} | ${brandName}`;
  const description = `${product.description ? product.description.slice(0, 110) + '...' : `Shop ${product.title} from Gauge House`}${specText}.${priceText}`.slice(0, 160);
  const canonicalUrl = getCanonicalUrl(`/product/${product.slug}`);
  const imageUrl = product.images && product.images.length > 0 ? product.images[0] : `${BASE_URL}/assets/gaugehouse-og.jpg`;

  return {
    title,
    description,
    canonicalUrl,
    imageUrl,
    brand: product.brand || 'Gauge House',
    category: product.category,
    price: product.salePrice || product.price,
    inStock: product.stock > 0,
    sku: product.sku,
  };
}

/**
 * Builds Schema.org Product JSON-LD for an individual product
 */
export function generateProductSchema(product: Product) {
  const seo = generateProductSEO(product);
  const effectivePrice = product.salePrice || product.price;

  const schema: Record<string, any> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    image: product.images && product.images.length > 0 ? product.images : [seo.imageUrl],
    description: product.description || `${product.title} from Gauge House Pakistan.`,
    sku: product.sku || `GH-${product.id}`,
    url: seo.canonicalUrl,
    brand: {
      '@type': 'Brand',
      name: product.brand || 'Gauge House',
    },
    category: product.category,
    offers: {
      '@type': 'Offer',
      price: effectivePrice,
      priceCurrency: 'PKR',
      priceValidUntil: '2027-12-31',
      availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition',
      url: seo.canonicalUrl,
      seller: {
        '@type': 'Organization',
        name: VERIFIED_BUSINESS.name,
        url: VERIFIED_BUSINESS.website,
      },
    },
  };

  // Add specifications as additionalProperty
  if (product.specifications && Object.keys(product.specifications).length > 0) {
    schema.additionalProperty = Object.entries(product.specifications).map(([key, val]) => ({
      '@type': 'PropertyValue',
      name: key,
      value: String(val),
    }));
  }

  return schema;
}

/**
 * Builds Schema.org Organization structured data using verified information
 */
export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: VERIFIED_BUSINESS.name,
    legalName: VERIFIED_BUSINESS.legalName,
    url: VERIFIED_BUSINESS.website,
    email: VERIFIED_BUSINESS.email,
    telephone: VERIFIED_BUSINESS.phone,
    sameAs: [
      VERIFIED_BUSINESS.instagram,
      VERIFIED_BUSINESS.googleBusiness,
    ],
    areaServed: {
      '@type': 'Country',
      name: VERIFIED_BUSINESS.country,
    },
    description: 'Gauge House: Industrial Equipment Supplier, Importer & Exporter of precision pressure gauges, vacuum gauges, and transmitters in Pakistan.',
  };
}

/**
 * Builds Schema.org LocalBusiness structured data using verified information only
 */
export function generateLocalBusinessSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: VERIFIED_BUSINESS.name,
    legalName: VERIFIED_BUSINESS.legalName,
    url: VERIFIED_BUSINESS.website,
    telephone: VERIFIED_BUSINESS.phone,
    email: VERIFIED_BUSINESS.email,
    sameAs: [
      VERIFIED_BUSINESS.instagram,
      VERIFIED_BUSINESS.googleBusiness,
    ],
    priceRange: 'PKR',
    areaServed: {
      '@type': 'Country',
      name: VERIFIED_BUSINESS.country,
    },
  };
}

/**
 * Builds Schema.org WebSite structured data with search action
 */
export function generateWebSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: VERIFIED_BUSINESS.name,
    url: VERIFIED_BUSINESS.website,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${BASE_URL}/catalog?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

/**
 * Builds Schema.org BreadcrumbList structured data
 */
export function generateBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : getCanonicalUrl(item.url),
    })),
  };
}

/**
 * Builds Schema.org FAQPage structured data
 */
export function generateFAQSchema(faqs: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}
