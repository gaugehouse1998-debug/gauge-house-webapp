/**
 * Google AdSense Configuration — Gauge House
 * Publisher ID: ca-pub-4720077339963302
 * Verified Domain: gaugehouse1998-debug.github.io
 */

export interface AdSenseConfig {
  clientId: string;
  enabled: boolean;
  slots: {
    websiteTop: string;
    aboveProducts: string;
    catalogTop: string;
    productDetailTop: string;
    cartTop: string;
    checkoutTop: string;
    accountTop: string;
    orderConfirmationTop: string;
    guidesTop: string;
    guideDetailTop: string;
    privacyPolicyTop: string;
    adminTop: string;
    [key: string]: string;
  };
}

export const ADSENSE_CONFIG: AdSenseConfig = {
  clientId: 'ca-pub-4720077339963302',
  enabled: true,
  // Slot IDs are kept clearly separated and ready for real AdSense unit IDs.
  // Paste your numeric Google AdSense ad unit slot IDs below when generated.
  // When empty, the AdBanner component automatically collapses cleanly
  // without rendering any empty white or blank boxes.
  slots: {
    websiteTop: '',
    aboveProducts: '',
    catalogTop: '',
    productDetailTop: '',
    cartTop: '',
    checkoutTop: '',
    accountTop: '',
    orderConfirmationTop: '',
    guidesTop: '',
    guideDetailTop: '',
    privacyPolicyTop: '',
    adminTop: '',
  },
};
