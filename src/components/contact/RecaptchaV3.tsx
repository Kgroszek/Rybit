"use client";

import Script from "next/script";

const siteKey =
  process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY?.trim() ?? "";

type GrecaptchaApi = {
  ready: (callback: () => void) => void;
  execute: (
    siteKey: string,
    options: {
      action: string;
    }
  ) => Promise<string>;
};

declare global {
  interface Window {
    grecaptcha?: GrecaptchaApi;
  }
}

export function isRecaptchaEnabled() {
  return Boolean(siteKey);
}

export function RecaptchaV3Script() {
  if (!siteKey) {
    return null;
  }

  return (
    <Script
      id="google-recaptcha-v3"
      src={`https://www.google.com/recaptcha/api.js?render=${encodeURIComponent(
        siteKey
      )}`}
      strategy="afterInteractive"
    />
  );
}

function waitForRecaptcha(timeoutMs = 8000) {
  return new Promise<GrecaptchaApi>((resolve, reject) => {
    const startedAt = Date.now();

    function check() {
      if (window.grecaptcha) {
        resolve(window.grecaptcha);
        return;
      }

      if (Date.now() - startedAt >= timeoutMs) {
        reject(
          new Error(
            "Nie udało się załadować Google reCAPTCHA. Odśwież stronę i spróbuj ponownie."
          )
        );
        return;
      }

      window.setTimeout(check, 100);
    }

    check();
  });
}

/**
 * reCAPTCHA v3 generuje token dopiero w momencie wysyłki formularza.
 *
 * To ważne, ponieważ token jest krótkotrwały i powinien zostać
 * natychmiast przesłany do backendu do weryfikacji.
 */
export async function executeRecaptcha(
  action = "contact_form"
) {
  if (!siteKey) {
    return "";
  }

  const grecaptcha = await waitForRecaptcha();

  return new Promise<string>((resolve, reject) => {
    grecaptcha.ready(() => {
      grecaptcha
        .execute(siteKey, {
          action,
        })
        .then(resolve)
        .catch(() => {
          reject(
            new Error(
              "Nie udało się wykonać weryfikacji reCAPTCHA. Spróbuj ponownie."
            )
          );
        });
    });
  });
}
