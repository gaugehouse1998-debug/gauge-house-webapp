import React, { useEffect, useRef, useState } from 'react';
import { ADSENSE_CONFIG } from '../config/adsenseConfig';

export interface AdBannerProps {
  /**
   * Named key from ADSENSE_CONFIG.slots, e.g. 'websiteTop', 'aboveProducts', etc.
   */
  slotKey?: keyof typeof ADSENSE_CONFIG.slots;
  /**
   * Direct slot ID override (if not using slotKey)
   */
  slotId?: string;
  /**
   * AdSense ad format (default: 'auto')
   */
  format?: 'auto' | 'horizontal' | 'rectangle' | 'fluid';
  /**
   * Full width responsive ad sizing
   */
  fullWidthResponsive?: boolean;
  /**
   * Additional wrapper styling classes
   */
  className?: string;
}

export const AdBanner: React.FC<AdBannerProps> = ({
  slotKey,
  slotId,
  format = 'auto',
  fullWidthResponsive = true,
  className = '',
}) => {
  const adRef = useRef<HTMLModElement | null>(null);
  const [isUnfilled, setIsUnfilled] = useState(false);

  // Resolve the actual slot ID: either passed directly or looked up from config
  const activeSlotId = slotId || (slotKey ? ADSENSE_CONFIG.slots[slotKey] : '');

  // 1. Safe guard: If AdSense is disabled globally, or if no slot ID has been provided yet,
  // do not render any empty or blank box. Return null to preserve clean layout.
  const hasValidSlot = Boolean(ADSENSE_CONFIG.enabled && activeSlotId && activeSlotId.trim().length > 0);

  useEffect(() => {
    if (!hasValidSlot || isUnfilled) return;

    const el = adRef.current;
    if (!el) return;

    // Observe attribute changes on the <ins> tag to detect unfilled status from Google
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === 'attributes') {
          const status = el.getAttribute('data-ad-status');
          if (status === 'unfilled') {
            setIsUnfilled(true);
            break;
          }
        }
      }
    });

    observer.observe(el, {
      attributes: true,
      attributeFilter: ['data-ad-status'],
    });

    // Request AdSense ad asynchronously and safely
    try {
      if (typeof window !== 'undefined') {
        const alreadyLoaded = el.getAttribute('data-adsbygoogle-status');
        if (!alreadyLoaded) {
          ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
        }
      }
    } catch (err) {
      console.debug('AdSense notification:', err);
    }

    return () => {
      observer.disconnect();
    };
  }, [hasValidSlot, activeSlotId, isUnfilled]);

  // If no slot ID configured, or if Google AdSense marked the ad as unfilled, collapse completely
  if (!hasValidSlot || isUnfilled) {
    return null;
  }

  return (
    <div
      className={`w-full max-w-full overflow-hidden flex justify-center items-center my-3 sm:my-4 clear-both select-none ${className}`}
      aria-label="Advertisement"
    >
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: 'block', minHeight: 0, width: '100%' }}
        data-ad-client={ADSENSE_CONFIG.clientId}
        data-ad-slot={activeSlotId}
        data-ad-format={format}
        data-full-width-responsive={fullWidthResponsive ? 'true' : 'false'}
      />
    </div>
  );
};
