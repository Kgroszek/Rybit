"use client";

import { useEffect, useState } from "react";

type CookiePreferences = {
  necessary: true;
  analytics: boolean;
  marketing: boolean;
};

const STORAGE_KEY = "rybio-cookie-consent";
const CONSENT_VERSION = "1.0";

const defaultPreferences: CookiePreferences = {
  necessary: true,
  analytics: false,
  marketing: false,
};

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] =
    useState<CookiePreferences>(defaultPreferences);

  useEffect(() => {
    const savedConsent = localStorage.getItem(STORAGE_KEY);

    if (!savedConsent) {
      setIsVisible(true);
      return;
    }

    try {
      const parsedConsent = JSON.parse(savedConsent);

      if (parsedConsent.version !== CONSENT_VERSION) {
        setIsVisible(true);
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
      setIsVisible(true);
    }
  }, []);

  const saveConsent = (selectedPreferences: CookiePreferences) => {
    const consentData = {
      version: CONSENT_VERSION,
      preferences: selectedPreferences,
      createdAt: new Date().toISOString(),
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(consentData));
    window.dispatchEvent(new Event("cookie-consent-updated"));

    setPreferences(selectedPreferences);
    setIsVisible(false);
    setShowSettings(false);
  };

  const acceptAll = () => {
    saveConsent({
      necessary: true,
      analytics: true,
      marketing: true,
    });
  };

  const rejectOptional = () => {
    saveConsent({
      necessary: true,
      analytics: false,
      marketing: false,
    });
  };

  const saveSelected = () => {
    saveConsent(preferences);
  };

  const togglePreference = (key: "analytics" | "marketing") => {
    setPreferences((current) => ({
      ...current,
      [key]: !current[key],
    }));
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-end bg-slate-950/40 px-4 py-4 sm:items-center sm:justify-center">
      <div className="w-full max-w-3xl rounded-2xl border border-slate-200 bg-white shadow-2xl">
        {!showSettings ? (
          <div className="p-5 sm:p-6">
            <div className="flex flex-col gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[#0F4C5C]">
                  Prywatność i pliki cookies
                </p>

                <h2 className="mt-2 text-xl font-bold text-slate-950">
                  Ta strona korzysta z plików cookies
                </h2>

                <p className="mt-3 text-sm leading-6 text-slate-600">
                  Używamy plików cookies niezbędnych do prawidłowego działania
                  serwisu. Za Twoją zgodą możemy również wykorzystywać cookies
                  analityczne i marketingowe, aby ulepszać stronę oraz lepiej
                  dopasowywać treści.
                </p>

                <a
                  href="/polityka-prywatnosci"
                  className="mt-3 inline-block text-sm font-semibold text-[#0F4C5C] hover:underline"
                >
                  Przeczytaj politykę prywatności
                </a>
              </div>

              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={rejectOptional}
                  className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                >
                  Odrzuć opcjonalne
                </button>

                <button
                  type="button"
                  onClick={() => setShowSettings(true)}
                  className="rounded-xl border border-[#0F4C5C] px-5 py-3 text-sm font-semibold text-[#0F4C5C] transition hover:bg-[#0F4C5C]/5"
                >
                  Dostosuj
                </button>

                <button
                  type="button"
                  onClick={acceptAll}
                  className="rounded-xl bg-[#0F4C5C] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0b3b47]"
                >
                  Akceptuję wszystkie
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-5 sm:p-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[#0F4C5C]">
                Ustawienia cookies
              </p>

              <h2 className="mt-2 text-xl font-bold text-slate-950">
                Dostosuj zgody
              </h2>

              <p className="mt-3 text-sm leading-6 text-slate-600">
                Możesz zdecydować, na które rodzaje plików cookies wyrażasz
                zgodę. Cookies niezbędne są zawsze aktywne, ponieważ odpowiadają
                za podstawowe działanie strony.
              </p>
            </div>

            <div className="mt-5 space-y-3">
              <CookieOption
                title="Niezbędne"
                description="Wymagane do działania strony, logowania, bezpieczeństwa i zapamiętywania podstawowych ustawień."
                checked
                disabled
              />

              <CookieOption
                title="Analityczne"
                description="Pomagają sprawdzać, jak użytkownicy korzystają ze strony, aby ulepszać jej treści i funkcje."
                checked={preferences.analytics}
                onChange={() => togglePreference("analytics")}
              />

              <CookieOption
                title="Marketingowe"
                description="Mogą służyć do mierzenia skuteczności reklam oraz dopasowywania komunikacji marketingowej."
                checked={preferences.marketing}
                onChange={() => togglePreference("marketing")}
              />
            </div>

            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setShowSettings(false)}
                className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                Wróć
              </button>

              <button
                type="button"
                onClick={rejectOptional}
                className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                Odrzuć opcjonalne
              </button>

              <button
                type="button"
                onClick={saveSelected}
                className="rounded-xl bg-[#0F4C5C] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0b3b47]"
              >
                Zapisz wybór
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

type CookieOptionProps = {
  title: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  onChange?: () => void;
};

function CookieOption({
  title,
  description,
  checked,
  disabled = false,
  onChange,
}: CookieOptionProps) {
  return (
    <div className="mx-auto w-full max-w-3xl rounded-2xl border border-slate-200 bg-white shadow-2xl">
      <div>
        <h3 className="text-sm font-bold text-slate-900">{title}</h3>
        <p className="mt-1 text-sm leading-5 text-slate-600">{description}</p>
      </div>

      <button
        type="button"
        disabled={disabled}
        onClick={onChange}
        className={`relative mt-1 h-6 w-11 flex-shrink-0 rounded-full transition ${
          checked ? "bg-[#0F4C5C]" : "bg-slate-300"
        } ${disabled ? "cursor-not-allowed opacity-70" : "cursor-pointer"}`}
        aria-pressed={checked}
      >
        <span
          className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
            checked ? "left-6" : "left-1"
          }`}
        />
      </button>
    </div>
  );
}

export function getCookieConsent() {
  if (typeof window === "undefined") {
    return null;
  }

  const savedConsent = localStorage.getItem(STORAGE_KEY);

  if (!savedConsent) {
    return null;
  }

  try {
    return JSON.parse(savedConsent);
  } catch {
    return null;
  }
}

export function hasCookieConsent(type: "analytics" | "marketing") {
  const consent = getCookieConsent();

  return Boolean(consent?.preferences?.[type]);
}