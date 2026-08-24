"use client";

import { GoogleAnalytics } from "@next/third-parties/google";
import { useEffect, useState } from "react";

import {
  applyGoogleConsent,
  COOKIE_CONSENT_UPDATED_EVENT,
  DEFAULT_COOKIE_PREFERENCES,
  getCookieConsent,
} from "@/lib/cookie-consent";

type ConsentAwareGoogleAnalyticsProps = {
  gaId?: string;
};

export function ConsentAwareGoogleAnalytics({
  gaId,
}: ConsentAwareGoogleAnalyticsProps) {
  const [isAnalyticsAllowed, setIsAnalyticsAllowed] = useState(false);

  useEffect(() => {
    if (!gaId) {
      return;
    }

    const syncConsent = () => {
      const consent = getCookieConsent();
      const preferences = consent?.preferences ?? DEFAULT_COOKIE_PREFERENCES;

      // Kolejkujemy Consent Mode przed doładowaniem skryptu Google.
      applyGoogleConsent(preferences);
      setIsAnalyticsAllowed(preferences.analytics);
    };

    syncConsent();
    window.addEventListener(COOKIE_CONSENT_UPDATED_EVENT, syncConsent);

    return () => {
      window.removeEventListener(COOKIE_CONSENT_UPDATED_EVENT, syncConsent);
    };
  }, [gaId]);

  if (!gaId || !isAnalyticsAllowed) {
    return null;
  }

  return <GoogleAnalytics gaId={gaId} />;
}
