import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { OFFICIAL_CATEGORIES, SAMPLE_PRODUCTS, DEFAULT_STORE_SETTINGS } from '../src/data/defaults.js';
import { INDUSTRIAL_GUIDES } from '../src/data/guidesData.js';
import { slugify } from '../src/utils/seo.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = 'https://gaugehouse1998-debug.github.io/gauge-house-webapp';
const BASE_PATH = '/gauge-house-webapp';

const VERIFIED_ORG = {
  name: 'Gauge House',
  url: `${BASE_URL}/`,
  email: 'gaugehouse1998@gmail.com',
  phone: '03354499186',
  instagram: 'https://www.instagram.com/gaugehouse/',
  googleBusiness: 'https://share.google/vF3mPKSlCp18rInyh',
  country: 'Pakistan',
};

function ensureDir(dirPath: string) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function escapeHtml(text: string): string {
  return (text || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function getAssetTags(htmlContent: string) {
  const scriptRegex = /<script\b[^>]*src="[^"]*"[^>]*><\/script>/gi;
  const linkCssRegex = /<link\b[^>]*rel="stylesheet"[^>]*>/gi;

  const scripts = htmlContent.match(scriptRegex) || [];
  const styles = htmlContent.match(linkCssRegex) || [];

  return {
    scriptsHtml: scripts.join('\n    '),
    stylesHtml: styles.join('\n    '),
  };
}

function buildHeaderHtml(activeTab = '') {
  return `
  <header style="padding: 1.25rem; border-bottom: 1px solid #262626; background-color: #0a0a0a; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
    <div>
      <a href="${BASE_PATH}/" style="color: #ffffff; text-decoration: none; font-weight: 800; font-size: 1.25rem;">Gauge House</a>
      <p style="color: #a3a3a3; font-size: 0.75rem; margin: 0;">Precision You Can Trust — Industrial Instrumentation Pakistan</p>
    </div>
    <nav style="display: flex; gap: 1rem; font-size: 0.875rem; flex-wrap: wrap;">
      <a href="${BASE_PATH}/catalog" style="color: ${activeTab === 'catalog' ? '#f97316' : '#e5e5e5'}; text-decoration: none; font-weight: 700;">Catalog</a>
      <a href="${BASE_PATH}/category/pressure-gauges" style="color: ${activeTab === 'pressure-gauges' ? '#f97316' : '#e5e5e5'}; text-decoration: none;">Pressure Gauges</a>
      <a href="${BASE_PATH}/category/pressure-transmitters" style="color: ${activeTab === 'pressure-transmitters' ? '#f97316' : '#e5e5e5'}; text-decoration: none;">Transmitters</a>
      <a href="${BASE_PATH}/category/wika" style="color: ${activeTab === 'wika' ? '#f97316' : '#e5e5e5'}; text-decoration: none;">WIKA</a>
      <a href="${BASE_PATH}/guides" style="color: ${activeTab === 'guides' ? '#f97316' : '#e5e5e5'}; text-decoration: none;">Guides</a>
    </nav>
  </header>`;
}

function buildFooterHtml() {
  return `
  <footer style="padding: 2.5rem 1.25rem; border-top: 1px solid #262626; background-color: #0a0a0a; font-size: 0.875rem; color: #a3a3a3; margin-top: 3rem;">
    <div style="max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 2rem; margin-bottom: 2rem;">
      <div>
        <h4 style="color: #ffffff; font-weight: 700; margin-bottom: 0.75rem;">Gauge House</h4>
        <p style="font-size: 0.8125rem; line-height: 1.6; color: #737373;">
          Supplying precision pressure gauges, vacuum gauges, and process instrumentation across Pakistan since 1998.
        </p>
        <p style="font-size: 0.8125rem; color: #737373; margin-top: 0.5rem;">
          Nationwide delivery via TCS Door-to-Door courier & Local Cargo.
        </p>
      </div>
      <div>
        <h4 style="color: #ffffff; font-weight: 700; margin-bottom: 0.75rem;">Product Categories</h4>
        <ul style="list-style: none; padding: 0; margin: 0; line-height: 2; font-size: 0.8125rem;">
          <li><a href="${BASE_PATH}/category/pressure-gauges" style="color: #a3a3a3; text-decoration: none;">Pressure Gauges</a></li>
          <li><a href="${BASE_PATH}/category/pressure-transmitters" style="color: #a3a3a3; text-decoration: none;">Pressure Transmitters</a></li>
          <li><a href="${BASE_PATH}/category/temperature-gauges" style="color: #a3a3a3; text-decoration: none;">Temperature Gauges</a></li>
          <li><a href="${BASE_PATH}/category/wika" style="color: #a3a3a3; text-decoration: none;">WIKA German Gauges</a></li>
          <li><a href="${BASE_PATH}/category/industrial-accessories" style="color: #a3a3a3; text-decoration: none;">Valves & Accessories</a></li>
        </ul>
      </div>
      <div>
        <h4 style="color: #ffffff; font-weight: 700; margin-bottom: 0.75rem;">Engineering Guides</h4>
        <ul style="list-style: none; padding: 0; margin: 0; line-height: 2; font-size: 0.8125rem;">
          <li><a href="${BASE_PATH}/guides" style="color: #a3a3a3; text-decoration: none;">Technical Knowledge Base</a></li>
          <li><a href="${BASE_PATH}/guides/how-to-select-a-pressure-gauge" style="color: #a3a3a3; text-decoration: none;">Pressure Gauge Selection</a></li>
          <li><a href="${BASE_PATH}/guides/bourdon-vs-diaphragm-vs-capsule" style="color: #a3a3a3; text-decoration: none;">Mechanism Comparison</a></li>
          <li><a href="${BASE_PATH}/guides/pressure-transmitter-calibration" style="color: #a3a3a3; text-decoration: none;">4-20mA Calibration</a></li>
        </ul>
      </div>
      <div>
        <h4 style="color: #ffffff; font-weight: 700; margin-bottom: 0.75rem;">Verified Contact Details</h4>
        <p style="font-size: 0.8125rem; line-height: 1.8; margin: 0;">
          <strong>Email:</strong> <a href="mailto:${VERIFIED_ORG.email}" style="color: #ea580c;">${VERIFIED_ORG.email}</a><br>
          <strong>Phone:</strong> <a href="tel:${VERIFIED_ORG.phone}" style="color: #ea580c;">${VERIFIED_ORG.phone}</a><br>
          <strong>Instagram:</strong> <a href="${VERIFIED_ORG.instagram}" target="_blank" rel="noopener noreferrer" style="color: #ea580c;">@gaugehouse</a><br>
          <strong>Google Business:</strong> <a href="${VERIFIED_ORG.googleBusiness}" target="_blank" rel="noopener noreferrer" style="color: #ea580c;">Gauge House Profile</a>
        </p>
      </div>
    </div>
    <div style="border-top: 1px solid #1f1f1f; padding-top: 1.5rem; text-align: center; font-size: 0.75rem; color: #525252;">
      © 2026 Gauge House. Precision You Can Trust. Industrial Equipment Supplier, Importer & Exporter in Pakistan.
    </div>
  </footer>`;
}

function generateHtmlPage({
  title,
  description,
  canonicalUrl,
  imageUrl,
  schemas = [],
  bodyContent,
  assetTags,
}: {
  title: string;
  description: string;
  canonicalUrl: string;
  imageUrl?: string;
  schemas?: Record<string, any>[];
  bodyContent: string;
  assetTags: { scriptsHtml: string; stylesHtml: string };
}) {
  const ogImg = imageUrl || `${BASE_URL}/assets/gaugehouse-og.jpg`;

  const schemaScripts = schemas
    .map(
      (s) =>
        `    <script type="application/ld+json">\n${JSON.stringify(s, null, 2)}\n    </script>`
    )
    .join('\n');

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}" />
    <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
    <link rel="canonical" href="${canonicalUrl}" />

    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${canonicalUrl}" />
    <meta property="og:title" content="${escapeHtml(title)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:image" content="${ogImg}" />
    <meta property="og:site_name" content="Gauge House" />

    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:url" content="${canonicalUrl}" />
    <meta name="twitter:title" content="${escapeHtml(title)}" />
    <meta name="twitter:description" content="${escapeHtml(description)}" />
    <meta name="twitter:image" content="${ogImg}" />

${schemaScripts}
    ${assetTags.stylesHtml}
  </head>
  <body class="bg-neutral-950 text-neutral-100 antialiased">
    <div id="root">
${bodyContent}
    </div>
    ${assetTags.scriptsHtml}
  </body>
</html>`;
}

export async function generateAllStaticPages() {
  const distDir = path.resolve(__dirname, '..', 'dist');
  const indexHtmlPath = path.join(distDir, 'index.html');

  if (!fs.existsSync(indexHtmlPath)) {
    console.error('Error: dist/index.html does not exist. Run vite build first.');
    process.exit(1);
  }

  const rawIndexHtml = fs.readFileSync(indexHtmlPath, 'utf-8');
  const assetTags = getAssetTags(rawIndexHtml);

  console.log('Generating pre-rendered static HTML pages for GitHub Pages...');

  const sitemapUrls: { loc: string; lastmod: string; changefreq: string; priority: string }[] = [];

  // 1. Organization Schema
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: VERIFIED_ORG.name,
    url: VERIFIED_ORG.url,
    email: VERIFIED_ORG.email,
    telephone: VERIFIED_ORG.phone,
    sameAs: [VERIFIED_ORG.instagram, VERIFIED_ORG.googleBusiness],
    areaServed: {
      '@type': 'Country',
      name: VERIFIED_ORG.country,
    },
    description:
      'Gauge House: Industrial Equipment Supplier, Importer & Exporter of precision pressure gauges, vacuum gauges, and transmitters in Pakistan.',
  };

  // 2. HOMEPAGE
  const homeCanonical = `${BASE_URL}/`;
  sitemapUrls.push({
    loc: homeCanonical,
    lastmod: '2026-09-17',
    changefreq: 'daily',
    priority: '1.0',
  });

  const homeCategoriesHtml = OFFICIAL_CATEGORIES.map(
    (cat) => `
      <div style="background-color: #171717; padding: 1.25rem; border-radius: 0.75rem; border: 1px solid #262626;">
        <h3 style="font-size: 1.125rem; font-weight: 700; color: #ffffff; margin-bottom: 0.5rem;">
          <a href="${BASE_PATH}/category/${cat.slug}" style="color: #ea580c; text-decoration: none;">${escapeHtml(cat.name)}</a>
        </h3>
        <p style="color: #a3a3a3; font-size: 0.875rem; line-height: 1.5;">${escapeHtml(cat.description)}</p>
      </div>`
  ).join('\n');

  const homeFeaturedProductsHtml = SAMPLE_PRODUCTS.slice(0, 6)
    .map(
      (prod) => `
      <div style="background-color: #171717; padding: 1.25rem; border-radius: 0.75rem; border: 1px solid #262626;">
        <a href="${BASE_PATH}/product/${prod.slug}" style="text-decoration: none;">
          <img src="${prod.images[0]}" alt="${escapeHtml(prod.title)}" style="width: 100%; height: 180px; object-fit: cover; border-radius: 0.5rem; margin-bottom: 0.75rem;" loading="lazy" />
          <h4 style="font-size: 1rem; font-weight: 700; color: #ffffff; margin-bottom: 0.25rem;">${escapeHtml(prod.title)}</h4>
        </a>
        <p style="color: #ea580c; font-weight: 700; font-size: 1.125rem; margin: 0.25rem 0;">Rs. ${(prod.salePrice || prod.price).toLocaleString()}</p>
        <p style="color: #737373; font-size: 0.75rem; margin: 0;">Brand: ${escapeHtml(prod.brand)} | SKU: ${escapeHtml(prod.sku)}</p>
      </div>`
    )
    .join('\n');

  const homeBody = `
    ${buildHeaderHtml()}
    <main style="max-width: 1200px; margin: 0 auto; padding: 2.5rem 1.25rem;">
      <section style="margin-bottom: 3.5rem;">
        <h1 style="font-size: 2.5rem; font-weight: 900; color: #ffffff; margin-bottom: 1rem; line-height: 1.2;">
          Gauge House — Precision Industrial Gauges & Process Instrumentation
        </h1>
        <p style="font-size: 1.125rem; color: #d4d4d4; line-height: 1.7; max-width: 850px; margin-bottom: 1.5rem;">
          Gauge House is an established industrial equipment supplier, importer, and exporter operating across Pakistan. We supply precision pressure gauges, vacuum gauges, digital pressure gauges, industrial temperature thermometers, 4-20mA pressure transmitters, and authentic German WIKA instrumentation.
        </p>
        <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
          <a href="${BASE_PATH}/catalog" style="background-color: #ea580c; color: #ffffff; padding: 0.875rem 1.75rem; border-radius: 0.5rem; text-decoration: none; font-weight: 700;">Explore Industrial Catalog</a>
          <a href="${BASE_PATH}/guides" style="background-color: #262626; color: #ffffff; padding: 0.875rem 1.75rem; border-radius: 0.5rem; text-decoration: none; font-weight: 700;">Technical Engineering Guides</a>
        </div>
      </section>

      <section style="margin-bottom: 3.5rem;">
        <h2 style="font-size: 1.5rem; font-weight: 700; color: #ffffff; margin-bottom: 1.25rem;">Industrial Equipment Categories</h2>
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.5rem;">
          ${homeCategoriesHtml}
        </div>
      </section>

      <section style="margin-bottom: 3.5rem;">
        <h2 style="font-size: 1.5rem; font-weight: 700; color: #ffffff; margin-bottom: 1.25rem;">Featured Process Instruments</h2>
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.5rem;">
          ${homeFeaturedProductsHtml}
        </div>
      </section>

      <section style="margin-bottom: 3.5rem; background-color: #171717; padding: 2rem; border-radius: 0.75rem; border: 1px solid #262626;">
        <h2 style="font-size: 1.5rem; font-weight: 700; color: #ffffff; margin-bottom: 1rem;">Procurement & Delivery Nationwide in Pakistan</h2>
        <p style="color: #d4d4d4; font-size: 0.95rem; line-height: 1.7; margin-bottom: 1rem;">
          We serve textile mills, chemical refineries, cement plants, sugar mills, and pharmaceutical manufacturing facilities across Pakistan with door-to-door courier delivery (TCS) and reliable Local Cargo shipping.
        </p>
        <p style="color: #a3a3a3; font-size: 0.875rem; margin: 0;">
          Direct procurement inquiries: <a href="mailto:${VERIFIED_ORG.email}" style="color: #ea580c;">${VERIFIED_ORG.email}</a> | Phone / WhatsApp: <a href="tel:${VERIFIED_ORG.phone}" style="color: #ea580c;">${VERIFIED_ORG.phone}</a>
        </p>
      </section>
    </main>
    ${buildFooterHtml()}`;

  const homeHtml = generateHtmlPage({
    title: 'Gauge House — Precision Industrial Gauges & Equipment Pakistan',
    description:
      'Gauge House: Industrial Equipment Supplier, Importer & Exporter in Pakistan. Online catalog for precision pressure gauges, vacuum gauges, transmitters, and calibration instrumentation.',
    canonicalUrl: homeCanonical,
    schemas: [
      organizationSchema,
      {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'Gauge House',
        url: homeCanonical,
        potentialAction: {
          '@type': 'SearchAction',
          target: `${BASE_URL}/catalog?q={search_term_string}`,
          'query-input': 'required name=search_term_string',
        },
      },
    ],
    bodyContent: homeBody,
    assetTags,
  });

  fs.writeFileSync(indexHtmlPath, homeHtml, 'utf-8');

  // 3. CATALOG PAGE
  const catalogCanonical = `${BASE_URL}/catalog`;
  sitemapUrls.push({
    loc: catalogCanonical,
    lastmod: '2026-09-17',
    changefreq: 'daily',
    priority: '0.9',
  });

  const catalogProductsHtml = SAMPLE_PRODUCTS.map(
    (prod) => `
    <div style="background-color: #171717; padding: 1.25rem; border-radius: 0.75rem; border: 1px solid #262626;">
      <a href="${BASE_PATH}/product/${prod.slug}" style="text-decoration: none;">
        <img src="${prod.images[0]}" alt="${escapeHtml(prod.title)}" style="width: 100%; height: 200px; object-fit: cover; border-radius: 0.5rem; margin-bottom: 0.75rem;" loading="lazy" />
        <h3 style="font-size: 1.05rem; font-weight: 700; color: #ffffff; margin-bottom: 0.25rem;">${escapeHtml(prod.title)}</h3>
      </a>
      <p style="color: #ea580c; font-weight: 700; font-size: 1.15rem; margin: 0.25rem 0;">Rs. ${(prod.salePrice || prod.price).toLocaleString()}</p>
      <p style="color: #a3a3a3; font-size: 0.8125rem; margin-bottom: 0.5rem;">Category: <a href="${BASE_PATH}/category/${slugify(prod.category)}" style="color: #ea580c; text-decoration: none;">${escapeHtml(prod.category)}</a> | Brand: ${escapeHtml(prod.brand)}</p>
      <a href="${BASE_PATH}/product/${prod.slug}" style="display: inline-block; background-color: #262626; color: #ffffff; padding: 0.5rem 1rem; border-radius: 0.375rem; text-decoration: none; font-size: 0.8125rem; font-weight: 700;">View Specifications</a>
    </div>`
  ).join('\n');

  const catalogBody = `
    ${buildHeaderHtml('catalog')}
    <main style="max-width: 1200px; margin: 0 auto; padding: 2.5rem 1.25rem;">
      <nav aria-label="Breadcrumb" style="font-size: 0.8125rem; color: #a3a3a3; margin-bottom: 1.5rem;">
        <a href="${BASE_PATH}/" style="color: #a3a3a3; text-decoration: none;">Home</a> / <span style="color: #ffffff;">Industrial Catalog</span>
      </nav>
      <h1 style="font-size: 2.25rem; font-weight: 900; color: #ffffff; margin-bottom: 0.75rem;">
        Complete Industrial Equipment Catalog
      </h1>
      <p style="font-size: 1rem; color: #a3a3a3; margin-bottom: 2rem; max-width: 800px; line-height: 1.6;">
        Explore our complete verified catalog of industrial pressure gauges, vacuum gauges, bimetallic temperature thermometers, 4-20mA pressure transmitters, and German WIKA instruments available with nationwide delivery across Pakistan.
      </p>
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.5rem;">
        ${catalogProductsHtml}
      </div>
    </main>
    ${buildFooterHtml()}`;

  const catalogHtml = generateHtmlPage({
    title: 'Industrial Equipment Catalog — Pressure Gauges & Transmitters | Gauge House',
    description:
      'Browse the complete industrial instrumentation catalog at Gauge House Pakistan. High-precision pressure gauges, transmitters, temperature thermometers, and accessories with nationwide delivery.',
    canonicalUrl: catalogCanonical,
    schemas: [
      organizationSchema,
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: homeCanonical },
          { '@type': 'ListItem', position: 2, name: 'Catalog', item: catalogCanonical },
        ],
      },
    ],
    bodyContent: catalogBody,
    assetTags,
  });

  const catalogDir = path.join(distDir, 'catalog');
  ensureDir(catalogDir);
  fs.writeFileSync(path.join(catalogDir, 'index.html'), catalogHtml, 'utf-8');

  // 4. CATEGORY PAGES
  for (const cat of OFFICIAL_CATEGORIES) {
    const catCanonical = `${BASE_URL}/category/${cat.slug}`;
    sitemapUrls.push({
      loc: catCanonical,
      lastmod: '2026-09-17',
      changefreq: 'weekly',
      priority: '0.85',
    });

    const matchingProducts = SAMPLE_PRODUCTS.filter(
      (p) => slugify(p.category) === cat.slug || p.category.toLowerCase() === cat.name.toLowerCase()
    );

    const catProductsHtml =
      matchingProducts.length > 0
        ? matchingProducts
            .map(
              (prod) => `
        <div style="background-color: #171717; padding: 1.25rem; border-radius: 0.75rem; border: 1px solid #262626;">
          <a href="${BASE_PATH}/product/${prod.slug}" style="text-decoration: none;">
            <img src="${prod.images[0]}" alt="${escapeHtml(prod.title)}" style="width: 100%; height: 200px; object-fit: cover; border-radius: 0.5rem; margin-bottom: 0.75rem;" loading="lazy" />
            <h3 style="font-size: 1.05rem; font-weight: 700; color: #ffffff; margin-bottom: 0.25rem;">${escapeHtml(prod.title)}</h3>
          </a>
          <p style="color: #ea580c; font-weight: 700; font-size: 1.15rem; margin: 0.25rem 0;">Rs. ${(prod.salePrice || prod.price).toLocaleString()}</p>
          <p style="color: #737373; font-size: 0.8125rem; margin-bottom: 0.5rem;">Brand: ${escapeHtml(prod.brand)} | SKU: ${escapeHtml(prod.sku)}</p>
          <a href="${BASE_PATH}/product/${prod.slug}" style="display: inline-block; background-color: #ea580c; color: #ffffff; padding: 0.5rem 1rem; border-radius: 0.375rem; text-decoration: none; font-size: 0.8125rem; font-weight: 700;">View Product Details</a>
        </div>`
            )
            .join('\n')
        : `<p style="color: #a3a3a3;">Contact our sales desk for specialized inquiries in ${escapeHtml(cat.name)}: <a href="mailto:${VERIFIED_ORG.email}" style="color: #ea580c;">${VERIFIED_ORG.email}</a>.</p>`;

    const catBody = `
      ${buildHeaderHtml(cat.slug)}
      <main style="max-width: 1200px; margin: 0 auto; padding: 2.5rem 1.25rem;">
        <nav aria-label="Breadcrumb" style="font-size: 0.8125rem; color: #a3a3a3; margin-bottom: 1.5rem;">
          <a href="${BASE_PATH}/" style="color: #a3a3a3; text-decoration: none;">Home</a> /
          <a href="${BASE_PATH}/catalog" style="color: #a3a3a3; text-decoration: none;">Catalog</a> /
          <span style="color: #ffffff;">${escapeHtml(cat.name)}</span>
        </nav>
        <h1 style="font-size: 2.25rem; font-weight: 900; color: #ffffff; margin-bottom: 0.75rem;">
          ${escapeHtml(cat.name)} in Pakistan — Gauge House
        </h1>
        <p style="font-size: 1rem; color: #a3a3a3; margin-bottom: 2rem; max-width: 800px; line-height: 1.6;">
          ${escapeHtml(cat.description)} All instruments comply with industrial pressure testing standards and are backed by Gauge House quality inspection.
        </p>
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.5rem;">
          ${catProductsHtml}
        </div>
      </main>
      ${buildFooterHtml()}`;

    const catHtml = generateHtmlPage({
      title: `${cat.name} Supplier in Pakistan — Industrial Catalog | Gauge House`,
      description: `Buy high-grade ${cat.name} in Pakistan from Gauge House. ${cat.description} Nationwide fast delivery and technical quotation support.`,
      canonicalUrl: catCanonical,
      schemas: [
        organizationSchema,
        {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: homeCanonical },
            { '@type': 'ListItem', position: 2, name: 'Catalog', item: catalogCanonical },
            { '@type': 'ListItem', position: 3, name: cat.name, item: catCanonical },
          ],
        },
      ],
      bodyContent: catBody,
      assetTags,
    });

    // Write to /category/[slug]/index.html
    const catDirPath = path.join(distDir, 'category', cat.slug);
    ensureDir(catDirPath);
    fs.writeFileSync(path.join(catDirPath, 'index.html'), catHtml, 'utf-8');

    // Also write alias to /[slug]/index.html for clean direct crawlable URLs
    const directCatDirPath = path.join(distDir, cat.slug);
    ensureDir(directCatDirPath);
    fs.writeFileSync(path.join(directCatDirPath, 'index.html'), catHtml, 'utf-8');
  }

  // 5. PRODUCT PAGES
  for (const prod of SAMPLE_PRODUCTS) {
    const prodCanonical = `${BASE_URL}/product/${prod.slug}`;
    sitemapUrls.push({
      loc: prodCanonical,
      lastmod: '2026-09-17',
      changefreq: 'weekly',
      priority: '0.8',
    });

    const effectivePrice = prod.salePrice || prod.price;
    const catSlug = slugify(prod.category);

    const specsTableRows = Object.entries(prod.specifications || {})
      .map(
        ([k, v]) => `
      <tr style="border-bottom: 1px solid #262626;">
        <th style="text-align: left; padding: 0.75rem; color: #a3a3a3; font-weight: 600; width: 35%;">${escapeHtml(k)}</th>
        <td style="padding: 0.75rem; color: #ffffff;">${escapeHtml(String(v))}</td>
      </tr>`
      )
      .join('\n');

    const productSchema: Record<string, any> = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: prod.title,
      image: prod.images,
      description: prod.description,
      sku: prod.sku,
      url: prodCanonical,
      brand: {
        '@type': 'Brand',
        name: prod.brand || 'Gauge House',
      },
      category: prod.category,
      offers: {
        '@type': 'Offer',
        price: effectivePrice,
        priceCurrency: 'PKR',
        priceValidUntil: '2027-12-31',
        availability: prod.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
        itemCondition: 'https://schema.org/NewCondition',
        url: prodCanonical,
        seller: {
          '@type': 'Organization',
          name: VERIFIED_ORG.name,
          url: VERIFIED_ORG.url,
        },
      },
    };

    if (prod.specifications) {
      productSchema.additionalProperty = Object.entries(prod.specifications).map(([k, v]) => ({
        '@type': 'PropertyValue',
        name: k,
        value: String(v),
      }));
    }

    const prodBody = `
      ${buildHeaderHtml(catSlug)}
      <main style="max-width: 1200px; margin: 0 auto; padding: 2.5rem 1.25rem;">
        <nav aria-label="Breadcrumb" style="font-size: 0.8125rem; color: #a3a3a3; margin-bottom: 1.5rem;">
          <a href="${BASE_PATH}/" style="color: #a3a3a3; text-decoration: none;">Home</a> /
          <a href="${BASE_PATH}/catalog" style="color: #a3a3a3; text-decoration: none;">Catalog</a> /
          <a href="${BASE_PATH}/category/${catSlug}" style="color: #a3a3a3; text-decoration: none;">${escapeHtml(prod.category)}</a> /
          <span style="color: #ffffff;">${escapeHtml(prod.title)}</span>
        </nav>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 2.5rem; margin-bottom: 3.5rem;">
          <div>
            <img src="${prod.images[0]}" alt="${escapeHtml(prod.title)}" style="width: 100%; max-height: 480px; object-fit: cover; border-radius: 0.75rem; border: 1px solid #262626;" />
            <div style="display: flex; gap: 0.75rem; margin-top: 0.75rem;">
              ${prod.images.map((img) => `<img src="${img}" alt="${escapeHtml(prod.title)}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 0.5rem; border: 1px solid #262626;" />`).join('')}
            </div>
          </div>

          <div>
            <span style="display: inline-block; background-color: #ea580c20; color: #ea580c; font-size: 0.75rem; font-weight: 700; padding: 0.25rem 0.5rem; border-radius: 0.25rem; margin-bottom: 0.75rem; text-transform: uppercase;">
              ${escapeHtml(prod.category)}
            </span>
            <h1 style="font-size: 2rem; font-weight: 800; color: #ffffff; margin-bottom: 0.5rem; line-height: 1.3;">
              ${escapeHtml(prod.title)}
            </h1>
            <p style="color: #737373; font-size: 0.875rem; margin-bottom: 1rem;">
              Brand: <strong style="color: #ffffff;">${escapeHtml(prod.brand)}</strong> | SKU: <strong style="color: #ffffff;">${escapeHtml(prod.sku)}</strong>
            </p>

            <div style="background-color: #171717; padding: 1.25rem; border-radius: 0.5rem; border: 1px solid #262626; margin-bottom: 1.5rem;">
              <p style="color: #ea580c; font-size: 1.75rem; font-weight: 800; margin: 0;">
                Rs. ${effectivePrice.toLocaleString()}
                ${prod.salePrice ? `<span style="text-decoration: line-line-through; font-size: 1rem; color: #737373; margin-left: 0.5rem;">Rs. ${prod.price.toLocaleString()}</span>` : ''}
              </p>
              <p style="color: ${prod.stock > 0 ? '#22c55e' : '#ef4444'}; font-size: 0.875rem; font-weight: 700; margin: 0.5rem 0 0;">
                ● ${prod.stock > 0 ? 'In Stock (Ready for Dispatch)' : 'Backorder Available'}
              </p>
            </div>

            <p style="color: #d4d4d4; font-size: 0.95rem; line-height: 1.7; margin-bottom: 1.5rem;">
              ${escapeHtml(prod.description)}
            </p>

            <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
              <a href="https://wa.me/923354499186?text=Hello%20Gauge%20House,%20I%20am%20interested%20in%20${encodeURIComponent(prod.title)}%20(SKU:%20${encodeURIComponent(prod.sku)})" target="_blank" rel="noopener noreferrer" style="background-color: #22c55e; color: #ffffff; padding: 0.875rem 1.5rem; border-radius: 0.5rem; text-decoration: none; font-weight: 700;">Order on WhatsApp</a>
              <a href="${BASE_PATH}/catalog" style="background-color: #262626; color: #ffffff; padding: 0.875rem 1.5rem; border-radius: 0.5rem; text-decoration: none; font-weight: 700;">Browse Other Models</a>
            </div>
          </div>
        </div>

        <section style="margin-bottom: 3.5rem;">
          <h2 style="font-size: 1.5rem; font-weight: 700; color: #ffffff; margin-bottom: 1rem;">
            Technical Specifications
          </h2>
          <table style="width: 100%; border-collapse: collapse; background-color: #171717; border-radius: 0.5rem; overflow: hidden; border: 1px solid #262626; font-size: 0.875rem;">
            <tbody>
              ${specsTableRows}
            </tbody>
          </table>
        </section>
      </main>
      ${buildFooterHtml()}`;

    const prodHtml = generateHtmlPage({
      title: `${prod.title} — Buy in Pakistan | Gauge House`,
      description: `${prod.description} Order ${prod.title} in Pakistan at Gauge House. Price: Rs. ${effectivePrice.toLocaleString()}. Fast nationwide shipping.`,
      canonicalUrl: prodCanonical,
      imageUrl: prod.images[0],
      schemas: [
        productSchema,
        {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: homeCanonical },
            { '@type': 'ListItem', position: 2, name: 'Catalog', item: catalogCanonical },
            { '@type': 'ListItem', position: 3, name: prod.category, item: `${BASE_URL}/category/${catSlug}` },
            { '@type': 'ListItem', position: 4, name: prod.title, item: prodCanonical },
          ],
        },
      ],
      bodyContent: prodBody,
      assetTags,
    });

    // Write /product/[slug]/index.html
    const prodDirPath = path.join(distDir, 'product', prod.slug);
    ensureDir(prodDirPath);
    fs.writeFileSync(path.join(prodDirPath, 'index.html'), prodHtml, 'utf-8');

    // Also write nested /[category-slug]/[slug]/index.html
    const nestedDirPath = path.join(distDir, catSlug, prod.slug);
    ensureDir(nestedDirPath);
    fs.writeFileSync(path.join(nestedDirPath, 'index.html'), prodHtml, 'utf-8');
  }

  // 6. TECHNICAL GUIDES HUB
  const guidesCanonical = `${BASE_URL}/guides`;
  sitemapUrls.push({
    loc: guidesCanonical,
    lastmod: '2026-09-17',
    changefreq: 'weekly',
    priority: '0.85',
  });

  const guidesListHtml = INDUSTRIAL_GUIDES.map(
    (g) => `
    <article style="background-color: #171717; padding: 1.5rem; border-radius: 0.75rem; border: 1px solid #262626;">
      <span style="font-size: 0.75rem; font-weight: 700; color: #ea580c; text-transform: uppercase;">${escapeHtml(g.category)} • ${escapeHtml(g.readTime)}</span>
      <h3 style="font-size: 1.25rem; font-weight: 700; color: #ffffff; margin: 0.5rem 0;">
        <a href="${BASE_PATH}/guides/${g.slug}" style="color: #ffffff; text-decoration: none;">${escapeHtml(g.title)}</a>
      </h3>
      <p style="color: #a3a3a3; font-size: 0.875rem; line-height: 1.6; margin-bottom: 1rem;">${escapeHtml(g.summary)}</p>
      <a href="${BASE_PATH}/guides/${g.slug}" style="color: #ea580c; font-weight: 700; font-size: 0.875rem; text-decoration: none;">Read Engineering Guide →</a>
    </article>`
  ).join('\n');

  const guidesBody = `
    ${buildHeaderHtml('guides')}
    <main style="max-width: 1200px; margin: 0 auto; padding: 2.5rem 1.25rem;">
      <nav aria-label="Breadcrumb" style="font-size: 0.8125rem; color: #a3a3a3; margin-bottom: 1.5rem;">
        <a href="${BASE_PATH}/" style="color: #a3a3a3; text-decoration: none;">Home</a> / <span style="color: #ffffff;">Technical Guides</span>
      </nav>
      <h1 style="font-size: 2.25rem; font-weight: 900; color: #ffffff; margin-bottom: 0.75rem;">
        Process Instrumentation & Pressure Engineering Guides
      </h1>
      <p style="font-size: 1rem; color: #a3a3a3; margin-bottom: 2rem; max-width: 800px; line-height: 1.6;">
        Authored by Gauge House technical specialists for process engineers, plant maintenance superintendents, and procurement managers across Pakistan.
      </p>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 1.5rem;">
        ${guidesListHtml}
      </div>
    </main>
    ${buildFooterHtml()}`;

  const guidesHtml = generateHtmlPage({
    title: 'Industrial Pressure Engineering & Calibration Guides | Gauge House',
    description:
      'Authoritative technical guides on pressure gauge selection, bourdon tubes, diaphragm seals, and 4-20mA pressure transmitter calibration for plant engineers in Pakistan.',
    canonicalUrl: guidesCanonical,
    schemas: [
      organizationSchema,
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: homeCanonical },
          { '@type': 'ListItem', position: 2, name: 'Technical Guides', item: guidesCanonical },
        ],
      },
    ],
    bodyContent: guidesBody,
    assetTags,
  });

  const guidesDir = path.join(distDir, 'guides');
  ensureDir(guidesDir);
  fs.writeFileSync(path.join(guidesDir, 'index.html'), guidesHtml, 'utf-8');

  // 7. INDIVIDUAL GUIDE DETAIL PAGES
  for (const guide of INDUSTRIAL_GUIDES) {
    const guideCanonical = `${BASE_URL}/guides/${guide.slug}`;
    sitemapUrls.push({
      loc: guideCanonical,
      lastmod: '2026-09-17',
      changefreq: 'monthly',
      priority: '0.8',
    });

    const sectionsHtml = guide.sections
      .map(
        (sec) => `
      <section style="margin-bottom: 2rem;">
        <h2 style="font-size: 1.35rem; font-weight: 700; color: #ffffff; margin-bottom: 0.75rem;">${escapeHtml(sec.heading)}</h2>
        <p style="color: #d4d4d4; font-size: 0.95rem; line-height: 1.7; margin-bottom: 0.75rem;">${escapeHtml(sec.content)}</p>
        ${
          sec.keyPoints && sec.keyPoints.length > 0
            ? `<ul style="color: #a3a3a3; font-size: 0.875rem; line-height: 1.6; padding-left: 1.25rem;">${sec.keyPoints.map((kp) => `<li>${escapeHtml(kp)}</li>`).join('')}</ul>`
            : ''
        }
      </section>`
      )
      .join('\n');

    const guideFaqsHtml = guide.faqs
      .map(
        (f) => `
      <div style="background-color: #171717; padding: 1.25rem; border-radius: 0.5rem; border: 1px solid #262626; margin-bottom: 1rem;">
        <h3 style="font-size: 1.05rem; font-weight: 700; color: #ffffff; margin-bottom: 0.5rem;">${escapeHtml(f.question)}</h3>
        <p style="color: #d4d4d4; font-size: 0.875rem; line-height: 1.6; margin: 0;">${escapeHtml(f.answer)}</p>
      </div>`
      )
      .join('\n');

    const guideFaqSchema = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: guide.faqs.map((f) => ({
        '@type': 'Question',
        name: f.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: f.answer,
        },
      })),
    };

    const guideBody = `
      ${buildHeaderHtml('guides')}
      <main style="max-width: 900px; margin: 0 auto; padding: 2.5rem 1.25rem;">
        <nav aria-label="Breadcrumb" style="font-size: 0.8125rem; color: #a3a3a3; margin-bottom: 1.5rem;">
          <a href="${BASE_PATH}/" style="color: #a3a3a3; text-decoration: none;">Home</a> /
          <a href="${BASE_PATH}/guides" style="color: #a3a3a3; text-decoration: none;">Guides</a> /
          <span style="color: #ffffff;">${escapeHtml(guide.title)}</span>
        </nav>
        <span style="font-size: 0.75rem; font-weight: 700; color: #ea580c; text-transform: uppercase;">
          ${escapeHtml(guide.category)} • Published ${escapeHtml(guide.publishedDate)} • ${escapeHtml(guide.readTime)}
        </span>
        <h1 style="font-size: 2.25rem; font-weight: 900; color: #ffffff; margin: 0.75rem 0 1.5rem; line-height: 1.3;">
          ${escapeHtml(guide.h1 || guide.title)}
        </h1>
        <div style="background-color: #171717; padding: 1.5rem; border-radius: 0.5rem; border-left: 4px solid #ea580c; margin-bottom: 2.5rem;">
          <p style="font-size: 1.05rem; color: #e5e5e5; line-height: 1.6; margin: 0;">
            ${escapeHtml(guide.summary)}
          </p>
        </div>

        <article style="margin-bottom: 3.5rem;">
          ${sectionsHtml}
        </article>

        <section style="margin-bottom: 3.5rem;">
          <h2 style="font-size: 1.5rem; font-weight: 700; color: #ffffff; margin-bottom: 1.25rem;">
            Frequently Asked Engineering Questions
          </h2>
          ${guideFaqsHtml}
        </section>

        <div style="background-color: #171717; padding: 2rem; border-radius: 0.75rem; border: 1px solid #262626; text-align: center;">
          <h3 style="color: #ffffff; font-size: 1.25rem; font-weight: 700; margin-bottom: 0.5rem;">Need Technical Instrumentation Assistance?</h3>
          <p style="color: #a3a3a3; font-size: 0.875rem; margin-bottom: 1rem;">
            Our instrumentation specialists can assist with dial range matching, thermowell selection, and 4-20mA transmitter calibration.
          </p>
          <a href="${BASE_PATH}/catalog" style="background-color: #ea580c; color: #ffffff; padding: 0.75rem 1.5rem; border-radius: 0.375rem; text-decoration: none; font-weight: 700; font-size: 0.875rem;">Explore Matching Products</a>
        </div>
      </main>
      ${buildFooterHtml()}`;

    const guideHtml = generateHtmlPage({
      title: `${guide.title} | Gauge House Pakistan`,
      description: guide.metaDescription,
      canonicalUrl: guideCanonical,
      schemas: [
        organizationSchema,
        {
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: guide.title,
          description: guide.metaDescription,
          datePublished: guide.publishedDate,
          author: {
            '@type': 'Organization',
            name: VERIFIED_ORG.name,
            url: VERIFIED_ORG.url,
          },
          publisher: {
            '@type': 'Organization',
            name: VERIFIED_ORG.name,
          },
        },
        guideFaqSchema,
      ],
      bodyContent: guideBody,
      assetTags,
    });

    const guideDetailPageDir = path.join(distDir, 'guides', guide.slug);
    ensureDir(guideDetailPageDir);
    fs.writeFileSync(path.join(guideDetailPageDir, 'index.html'), guideHtml, 'utf-8');
  }

  // 8. 404 NOT FOUND PAGE (GitHub Pages standard)
  const notFoundBody = `
    ${buildHeaderHtml()}
    <main style="min-height: 60vh; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 3rem 1.25rem; text-align: center;">
      <div style="max-width: 500px; background-color: #171717; padding: 2.5rem; border-radius: 1rem; border: 1px solid #262626;">
        <span style="font-size: 3rem; font-weight: 900; color: #ea580c; font-family: monospace;">404</span>
        <h1 style="font-size: 1.5rem; font-weight: 800; color: #ffffff; margin: 0.5rem 0 1rem;">Page Not Found</h1>
        <p style="color: #a3a3a3; font-size: 0.875rem; line-height: 1.6; margin-bottom: 1.5rem;">
          The requested product, category, or engineering guide does not exist or has been relocated.
        </p>
        <div style="display: flex; gap: 0.75rem; justify-content: center; flex-wrap: wrap;">
          <a href="${BASE_PATH}/catalog" style="background-color: #ea580c; color: #ffffff; padding: 0.625rem 1.25rem; border-radius: 0.375rem; text-decoration: none; font-size: 0.875rem; font-weight: 700;">Browse Catalog</a>
          <a href="${BASE_PATH}/" style="background-color: #262626; color: #ffffff; padding: 0.625rem 1.25rem; border-radius: 0.375rem; text-decoration: none; font-size: 0.875rem; font-weight: 700;">Back to Homepage</a>
        </div>
      </div>
    </main>
    ${buildFooterHtml()}`;

  const notFoundHtml = generateHtmlPage({
    title: '404 — Page Not Found | Gauge House',
    description: 'The requested page could not be found on Gauge House. Browse our industrial catalog for pressure gauges, vacuum gauges, and instrumentation.',
    canonicalUrl: `${BASE_URL}/404.html`,
    schemas: [organizationSchema],
    bodyContent: notFoundBody,
    assetTags,
  });

  fs.writeFileSync(path.join(distDir, '404.html'), notFoundHtml, 'utf-8');

  // 9. SITEMAP.XML
  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapUrls
  .map(
    (item) => `  <url>
    <loc>${item.loc}</loc>
    <lastmod>${item.lastmod}</lastmod>
    <changefreq>${item.changefreq}</changefreq>
    <priority>${item.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

  fs.writeFileSync(path.join(distDir, 'sitemap.xml'), sitemapXml, 'utf-8');
  // Also keep in public for source control
  const publicDir = path.resolve(__dirname, '..', 'public');
  fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), sitemapXml, 'utf-8');

  // 10. ROBOTS.TXT
  const robotsTxt = `User-agent: *
Allow: /
Allow: /gauge-house-webapp/
Allow: /gauge-house-webapp/catalog
Allow: /gauge-house-webapp/category/
Allow: /gauge-house-webapp/product/
Allow: /gauge-house-webapp/guides/
Allow: /gauge-house-webapp/assets/
Disallow: /gauge-house-webapp/admin/
Disallow: /gauge-house-webapp/checkout
Disallow: /gauge-house-webapp/cart
Disallow: /gauge-house-webapp/account
Disallow: /gauge-house-webapp/order-confirmation

# Googlebot specific rules
User-agent: Googlebot
Allow: /

User-agent: Googlebot-Image
Allow: /gauge-house-webapp/assets/
Allow: /

Sitemap: ${BASE_URL}/sitemap.xml
`;

  fs.writeFileSync(path.join(distDir, 'robots.txt'), robotsTxt, 'utf-8');
  fs.writeFileSync(path.join(publicDir, 'robots.txt'), robotsTxt, 'utf-8');

  console.log(`Generated ${sitemapUrls.length} static public URLs successfully!`);
}

generateAllStaticPages().catch((err) => {
  console.error('Failed to generate static pages:', err);
  process.exit(1);
});
