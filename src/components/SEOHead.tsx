import React, { useEffect } from 'react';
import { SITE_NAME, SITE_TAGLINE, BASE_URL, getCanonicalUrl } from '../utils/seo';

export interface SEOHeadProps {
  title?: string;
  description?: string;
  canonicalPath?: string;
  imageUrl?: string;
  type?: 'website' | 'product' | 'article';
  noIndex?: boolean;
  jsonLd?: Record<string, any> | Record<string, any>[];
}

export const SEOHead: React.FC<SEOHeadProps> = ({
  title,
  description,
  canonicalPath,
  imageUrl,
  type = 'website',
  noIndex = false,
  jsonLd,
}) => {
  useEffect(() => {
    // 1. Page Title
    const fullTitle = title
      ? title.includes(SITE_NAME)
        ? title
        : `${title} | ${SITE_NAME}`
      : `${SITE_NAME} Pakistan | ${SITE_TAGLINE}`;
    document.title = fullTitle;

    // 2. Helper to set/update meta tags safely
    const setMetaTag = (name: string, content: string, isProperty = false) => {
      const selector = isProperty ? `meta[property="${name}"]` : `meta[name="${name}"]`;
      let el = document.querySelector(selector) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement('meta');
        if (isProperty) {
          el.setAttribute('property', name);
        } else {
          el.setAttribute('name', name);
        }
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    // 3. Meta Description
    const metaDesc =
      description ||
      'Gauge House: Leading supplier, importer and exporter of industrial pressure gauges, temperature gauges, pressure transmitters, and precision instrumentation across Pakistan since 1998.';
    setMetaTag('description', metaDesc);

    // 4. Robots Directives
    const robotsContent = noIndex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large, max-snippet:-1';
    setMetaTag('robots', robotsContent);

    // 5. Canonical URL
    const canonicalHref = canonicalPath ? getCanonicalUrl(canonicalPath) : `${BASE_URL}/`;
    let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', canonicalHref);

    // 6. Open Graph
    const finalImage = imageUrl || `${BASE_URL}/assets/gaugehouse-og.jpg`;
    setMetaTag('og:site_name', SITE_NAME, true);
    setMetaTag('og:title', fullTitle, true);
    setMetaTag('og:description', metaDesc, true);
    setMetaTag('og:url', canonicalHref, true);
    setMetaTag('og:type', type, true);
    setMetaTag('og:image', finalImage, true);

    // 7. Twitter Card
    setMetaTag('twitter:card', 'summary_large_image');
    setMetaTag('twitter:title', fullTitle);
    setMetaTag('twitter:description', metaDesc);
    setMetaTag('twitter:image', finalImage);

    // 8. JSON-LD Structured Data
    let jsonLdScript = document.getElementById('seo-structured-data') as HTMLScriptElement | null;
    if (jsonLd) {
      if (!jsonLdScript) {
        jsonLdScript = document.createElement('script');
        jsonLdScript.id = 'seo-structured-data';
        jsonLdScript.type = 'application/ld+json';
        document.head.appendChild(jsonLdScript);
      }
      jsonLdScript.textContent = JSON.stringify(jsonLd);
    } else if (jsonLdScript) {
      jsonLdScript.textContent = '';
    }
  }, [title, description, canonicalPath, imageUrl, type, noIndex, jsonLd]);

  return null;
};
