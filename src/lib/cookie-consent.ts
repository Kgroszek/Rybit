export type CookiePreferences = {
  necessary: true;
  analytics: boolean;
  marketing: boolean;
};

export type StoredCookieConsent = {
  version: string;
  preferences: CookiePreferences;
  createdAt: string;
};

export const COOKIE_CONSENT_STORAGE_KEY = "rybio-cookie-consent";
export const COOKIE_CONSENT_VERSION = "1.0";
export const COOKIE_CONSENT_UPDATED_EVENT = "cookie-consent-updated";

export const DEFAULT_COOKIE_PREFERENCES: CookiePreferences = {
  necessary: true,
  analytics: false,
  marketing: false,
};

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

function isCookiePreferences(value: unknown): value is CookiePreferences {
  if (!value || typeof value !== "object") {
    return false;
  }

  const preferences = value as Partial<CookiePreferences>;

  return (
    preferences.necessary === true &&
    typeof preferences.analytics === "boolean" &&
    typeof preferences.marketing === "boolean"
  );
}

function parseStoredConsent(value: string): StoredCookieConsent | null {
  try {
    const parsed: unknown = JSON.parse(value);

    if (!parsed || typeof parsed !== "object") {
      return null;
    }

    const consent = parsed as Partial<StoredCookieConsent>;

    if (
      consent.version !== COOKIE_CONSENT_VERSION ||
      !isCookiePreferences(consent.preferences) ||
      typeof consent.createdAt !== "string"
    ) {
      return null;
    }

    return {
      version: consent.version,
      preferences: consent.preferences,
      createdAt: consent.createdAt,
    };
  } catch {
    return null;
  }
}

export function getCookieConsent(): StoredCookieConsent | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const savedConsent = window.localStorage.getItem(
      COOKIE_CONSENT_STORAGE_KEY
    );

    if (!savedConsent) {
      return null;
    }

    const parsedConsent = parseStoredConsent(savedConsent);

    if (!parsedConsent) {
      window.localStorage.removeItem(COOKIE_CONSENT_STORAGE_KEY);
      return null;
    }

    return parsedConsent;
  } catch {
    return null;
  }
}

export function saveCookieConsent(preferences: CookiePreferences) {
  if (typeof window === "undefined") {
    return;
  }

  const consent: StoredCookieConsent = {
    version: COOKIE_CONSENT_VERSION,
    preferences,
    createdAt: new Date().toISOString(),
  };

  try {
    window.localStorage.setItem(
      COOKIE_CONSENT_STORAGE_KEY,
      JSON.stringify(consent)
    );
  } catch {
    // Brak dostępu do localStorage nie powinien blokować działania strony.
  }

  window.dispatchEvent(new Event(COOKIE_CONSENT_UPDATED_EVENT));
}

export function hasCookieConsent(type: "analytics" | "marketing") {
  const consent = getCookieConsent();
  return Boolean(consent?.preferences[type]);
}

function ensureGtagQueue() {
  if (typeof window === "undefined") {
    return null;
  }

  window.dataLayer = window.dataLayer || [];

  if (!window.gtag) {
    window.gtag = function gtag() {
      window.dataLayer?.push(arguments);
    };
  }

  return window.gtag;
}

/**
 * Ustawia Consent Mode zanim komponent GoogleAnalytics doładuje gtag.js.
 *
 * Sam Google Analytics nie jest ładowany bez zgody analitycznej. Jeżeli
 * użytkownik wyrazi zgodę na analitykę, ale nie na marketing, pola reklamowe
 * pozostają w stanie "denied".
 */
export function applyGoogleConsent(preferences: CookiePreferences) {
  const gtag = ensureGtagQueue();

  if (!gtag) {
    return;
  }

  gtag("consent", "default", {
    analytics_storage: "denied",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
  });

  gtag("consent", "update", {
    analytics_storage: preferences.analytics ? "granted" : "denied",
    ad_storage: preferences.marketing ? "granted" : "denied",
    ad_user_data: preferences.marketing ? "granted" : "denied",
    ad_personalization: preferences.marketing ? "granted" : "denied",
  });
}
