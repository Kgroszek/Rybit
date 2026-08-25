import { createHash } from "node:crypto";

import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const RATE_LIMIT_MAX_REQUESTS = 5;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUEST_BODY_BYTES = 20_000;

const RECAPTCHA_VERIFY_URL =
  "https://www.google.com/recaptcha/api/siteverify";

const ALLOWED_FORM_TYPES = new Set([
  "contact",
  "website",
  "cooperation",
]);

type ContactPayload = {
  formType?: string;
  name?: string;
  email?: string;
  company?: string;
  subject?: string;
  message?: string;
  fisheryName?: string;
  phone?: string;
  location?: string;
  currentWebsite?: string;
  budget?: string;
  deadline?: string;

  /**
   * Honeypot. Normalny użytkownik nie powinien nigdy
   * wypełnić tego pola.
   */
  website?: string;

  /**
   * Jednorazowy token Google reCAPTCHA v3.
   */
  recaptchaToken?: string;
};

type ParsedContactPayload = {
  formType: string;
  name: string;
  email: string;
  company: string;
  subject: string;
  message: string;
  fisheryName: string;
  phone: string;
  location: string;
  currentWebsite: string;
  budget: string;
  deadline: string;
  website: string;
  recaptchaToken: string;
};

type RecaptchaResponse = {
  success?: boolean;
  score?: number;
  action?: string;
  challenge_ts?: string;
  hostname?: string;
  "error-codes"?: string[];
};

type ContactRateLimitRow = {
  count: number;
  windowStart: Date;
};

class ContactValidationError extends Error {}

function getString(value: unknown) {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

function getLimitedString(
  value: unknown,
  fieldLabel: string,
  maxLength: number
) {
  const stringValue = getString(value);

  if (stringValue.length > maxLength) {
    throw new ContactValidationError(
      `${fieldLabel} może mieć maksymalnie ${maxLength} znaków.`
    );
  }

  return stringValue;
}

function sanitizeHeaderValue(value: string) {
  return value.replace(/[\r\n]+/g, " ").trim();
}

function parsePayload(body: ContactPayload): ParsedContactPayload {
  return {
    formType: getLimitedString(body.formType, "Typ formularza", 30),
    name: getLimitedString(body.name, "Imię i nazwisko", 120),
    email: getLimitedString(body.email, "Adres e-mail", 254),
    company: getLimitedString(body.company, "Firma / marka", 160),
    subject: getLimitedString(body.subject, "Temat", 180),
    message: getLimitedString(body.message, "Wiadomość", 5000),
    fisheryName: getLimitedString(body.fisheryName, "Nazwa łowiska", 160),
    phone: getLimitedString(body.phone, "Telefon", 40),
    location: getLimitedString(body.location, "Lokalizacja", 160),
    currentWebsite: getLimitedString(
      body.currentWebsite,
      "Adres strony",
      500
    ),
    budget: getLimitedString(body.budget, "Budżet", 80),
    deadline: getLimitedString(body.deadline, "Termin", 80),
    website: getLimitedString(body.website, "Pole bezpieczeństwa", 300),
    recaptchaToken: getLimitedString(
      body.recaptchaToken,
      "Token bezpieczeństwa",
      4096
    ),
  };
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidHttpUrl(value: string) {
  if (!value) {
    return true;
  }

  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatRow(label: string, value: string) {
  if (!value) {
    return "";
  }

  return `
    <tr>
      <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0; color: #64748b; font-weight: 700; width: 180px;">
        ${escapeHtml(label)}
      </td>
      <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0; color: #0f172a;">
        ${escapeHtml(value).replaceAll("\n", "<br>")}
      </td>
    </tr>
  `;
}

function getFormLabel(formType: string) {
  if (formType === "website") {
    return "Zapytanie o stronę dla łowiska";
  }

  if (formType === "cooperation") {
    return "Współpraca";
  }

  return "Kontakt ogólny";
}

function buildEmailHtml(payload: ParsedContactPayload) {
  const formLabel = getFormLabel(payload.formType);

  return `
    <div style="font-family: Arial, sans-serif; background: #f8fafc; padding: 24px;">
      <div style="max-width: 760px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 24px; overflow: hidden;">
        <div style="background: #2563eb; padding: 24px;">
          <p style="margin: 0; color: #bfdbfe; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em;">
            Rybio
          </p>
          <h1 style="margin: 8px 0 0; color: #ffffff; font-size: 24px;">
            ${escapeHtml(formLabel)}
          </h1>
        </div>

        <div style="padding: 24px;">
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            ${formatRow("Typ formularza", formLabel)}
            ${formatRow("Imię i nazwisko", payload.name)}
            ${formatRow("E-mail", payload.email)}
            ${formatRow("Firma / marka", payload.company)}
            ${formatRow("Temat", payload.subject)}
            ${formatRow("Nazwa łowiska", payload.fisheryName)}
            ${formatRow("Telefon", payload.phone)}
            ${formatRow("Lokalizacja", payload.location)}
            ${formatRow(
              "Obecna strona / Facebook",
              payload.currentWebsite
            )}
            ${formatRow("Budżet", payload.budget)}
            ${formatRow("Termin", payload.deadline)}
            ${formatRow("Wiadomość", payload.message)}
          </table>
        </div>
      </div>
    </div>
  `;
}

function buildEmailText(payload: ParsedContactPayload) {
  return `
Rybio - ${getFormLabel(payload.formType)}

Typ formularza: ${getFormLabel(payload.formType)}
Imię i nazwisko: ${payload.name}
E-mail: ${payload.email}
Firma / marka: ${payload.company}
Temat: ${payload.subject}
Nazwa łowiska: ${payload.fisheryName}
Telefon: ${payload.phone}
Lokalizacja: ${payload.location}
Obecna strona / Facebook: ${payload.currentWebsite}
Budżet: ${payload.budget}
Termin: ${payload.deadline}

Wiadomość:
${payload.message}
  `.trim();
}

function getClientIp(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");

  if (forwardedFor) {
    const firstIp = forwardedFor.split(",")[0]?.trim();

    if (firstIp) {
      return firstIp;
    }
  }

  const realIp = request.headers.get("x-real-ip")?.trim();

  if (realIp) {
    return realIp;
  }

  return "unknown";
}

function getRateLimitKey(request: Request) {
  const ip = getClientIp(request);

  return createHash("sha256").update(ip).digest("hex");
}

function shouldUseRateLimit() {
  if (process.env.NODE_ENV === "production") {
    return true;
  }

  return process.env.CONTACT_RATE_LIMIT_IN_DEV === "true";
}

async function checkRateLimit(request: Request) {
  if (!shouldUseRateLimit()) {
    return {
      allowed: true,
      remaining: RATE_LIMIT_MAX_REQUESTS,
      resetAt: new Date(Date.now() + RATE_LIMIT_WINDOW_MS),
    };
  }

  const key = getRateLimitKey(request);
  const now = new Date();
  const resetThreshold = new Date(now.getTime() - RATE_LIMIT_WINDOW_MS);

  /**
   * Atomowy UPSERT zapobiega wyścigowi dwóch równoległych requestów.
   * Nie zapisujemy w bazie surowego IP — tylko jego SHA-256.
   */
  const rows = await prisma.$queryRaw<ContactRateLimitRow[]>`
    INSERT INTO "ContactRateLimit"
      ("key", "count", "windowStart", "createdAt", "updatedAt")
    VALUES
      (${key}, 1, ${now}, ${now}, ${now})

    ON CONFLICT ("key")
    DO UPDATE SET
      "count" =
        CASE
          WHEN "ContactRateLimit"."windowStart" <= ${resetThreshold}
          THEN 1
          ELSE "ContactRateLimit"."count" + 1
        END,

      "windowStart" =
        CASE
          WHEN "ContactRateLimit"."windowStart" <= ${resetThreshold}
          THEN ${now}
          ELSE "ContactRateLimit"."windowStart"
        END,

      "updatedAt" = ${now}

    RETURNING "count", "windowStart"
  `;

  const row = rows[0];

  if (!row) {
    throw new Error("Nie udało się sprawdzić limitu formularza.");
  }

  const resetAt = new Date(
    row.windowStart.getTime() + RATE_LIMIT_WINDOW_MS
  );

  return {
    allowed: row.count <= RATE_LIMIT_MAX_REQUESTS,
    remaining: Math.max(0, RATE_LIMIT_MAX_REQUESTS - row.count),
    resetAt,
  };
}

function getRecaptchaConfiguration() {
  const siteKey =
    process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY?.trim() ?? "";
  const secretKey = process.env.RECAPTCHA_SECRET_KEY?.trim() ?? "";

  if (!siteKey && !secretKey) {
    return {
      enabled: false as const,
      secretKey: "",
      minScore: 0.5,
    };
  }

  if (!siteKey || !secretKey) {
    throw new Error(
      "Niepełna konfiguracja reCAPTCHA. Ustaw jednocześnie NEXT_PUBLIC_RECAPTCHA_SITE_KEY i RECAPTCHA_SECRET_KEY."
    );
  }

  const configuredScore = Number(process.env.RECAPTCHA_MIN_SCORE ?? "0.5");

  const minScore =
    Number.isFinite(configuredScore) &&
    configuredScore >= 0 &&
    configuredScore <= 1
      ? configuredScore
      : 0.5;

  return {
    enabled: true as const,
    secretKey,
    minScore,
  };
}

async function verifyRecaptcha({
  token,
  request,
}: {
  token: string;
  request: Request;
}) {
  const config = getRecaptchaConfiguration();

  if (!config.enabled) {
    return {
      valid: true,
      score: null as number | null,
    };
  }

  if (!token) {
    return {
      valid: false,
      score: null as number | null,
    };
  }

  const body = new URLSearchParams({
    secret: config.secretKey,
    response: token,
  });

  const clientIp = getClientIp(request);

  if (clientIp !== "unknown") {
    body.set("remoteip", clientIp);
  }

  const response = await fetch(RECAPTCHA_VERIFY_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
    cache: "no-store",
  });

  if (!response.ok) {
    return {
      valid: false,
      score: null as number | null,
    };
  }

  const result = (await response.json()) as RecaptchaResponse;

  if (!result.success) {
    return {
      valid: false,
      score: typeof result.score === "number" ? result.score : null,
    };
  }

  if (result.action !== "contact_form") {
    return {
      valid: false,
      score: typeof result.score === "number" ? result.score : null,
    };
  }

  if (
    typeof result.score !== "number" ||
    result.score < config.minScore
  ) {
    return {
      valid: false,
      score: typeof result.score === "number" ? result.score : null,
    };
  }

  return {
    valid: true,
    score: result.score,
  };
}

function validationError(message: string) {
  return NextResponse.json(
    {
      message,
    },
    {
      status: 400,
    }
  );
}

export async function POST(request: Request) {
  try {
    const contentLengthHeader = request.headers.get("content-length");
    const contentLength = contentLengthHeader
      ? Number(contentLengthHeader)
      : null;

    if (
      contentLength !== null &&
      Number.isFinite(contentLength) &&
      contentLength > MAX_REQUEST_BODY_BYTES
    ) {
      return NextResponse.json(
        {
          message: "Formularz zawiera zbyt dużo danych.",
        },
        {
          status: 413,
        }
      );
    }

    const rawBody = await request.text();

    if (Buffer.byteLength(rawBody, "utf8") > MAX_REQUEST_BODY_BYTES) {
      return NextResponse.json(
        {
          message: "Formularz zawiera zbyt dużo danych.",
        },
        {
          status: 413,
        }
      );
    }

    let body: ContactPayload;

    try {
      body = JSON.parse(rawBody) as ContactPayload;
    } catch {
      return validationError("Nieprawidłowe dane formularza.");
    }

    const payload = parsePayload(body);

    /**
     * Honeypot.
     *
     * Bot dostaje odpowiedź wyglądającą jak sukces, ale SMTP nie jest
     * uruchamiane. Dzięki temu nie informujemy bota, co go zdradziło.
     */
    if (payload.website) {
      return NextResponse.json({
        message: "Wiadomość została wysłana.",
      });
    }

    if (!ALLOWED_FORM_TYPES.has(payload.formType)) {
      return validationError("Nieprawidłowy typ formularza.");
    }

    if (!payload.name) {
      return validationError("Podaj imię i nazwisko.");
    }

    if (!payload.email || !isValidEmail(payload.email)) {
      return validationError("Podaj poprawny adres e-mail.");
    }

    if (!payload.message) {
      return validationError("Wiadomość jest wymagana.");
    }

    if (payload.formType === "website" && !payload.fisheryName) {
      return validationError("Podaj nazwę łowiska.");
    }

    if (!isValidHttpUrl(payload.currentWebsite)) {
      return validationError(
        "Podaj poprawny adres strony zaczynający się od http:// lub https://."
      );
    }

    /**
     * Rate limit przed reCAPTCHA i SMTP.
     * Maksymalnie 5 zaakceptowanych prób na 10 minut z jednego IP.
     */
    const rateLimit = await checkRateLimit(request);

    if (!rateLimit.allowed) {
      const retryAfterSeconds = Math.max(
        1,
        Math.ceil((rateLimit.resetAt.getTime() - Date.now()) / 1000)
      );

      return NextResponse.json(
        {
          message:
            "Wysłano zbyt wiele wiadomości. Spróbuj ponownie za kilka minut.",
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(retryAfterSeconds),
            "X-RateLimit-Limit": String(RATE_LIMIT_MAX_REQUESTS),
            "X-RateLimit-Remaining": "0",
          },
        }
      );
    }

    /**
     * Google reCAPTCHA v3.
     *
     * Backend sprawdza:
     * - poprawność tokena,
     * - action === "contact_form",
     * - score >= RECAPTCHA_MIN_SCORE (domyślnie 0.5).
     */
    const recaptcha = await verifyRecaptcha({
      token: payload.recaptchaToken,
      request,
    });

    if (!recaptcha.valid) {
      return validationError(
        "Nie udało się potwierdzić zabezpieczenia antyspamowego. Odśwież stronę i spróbuj ponownie."
      );
    }

    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = Number(process.env.SMTP_PORT || "587");
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const smtpFrom = process.env.SMTP_FROM || smtpUser;
    const contactTo = process.env.CONTACT_EMAIL || "kontakt@rybio.pl";

    if (!smtpHost || !smtpUser || !smtpPass || !smtpFrom) {
      console.error("[contact] Brakuje konfiguracji SMTP.");

      return NextResponse.json(
        {
          message: "Formularz jest chwilowo niedostępny.",
        },
        {
          status: 500,
        }
      );
    }

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    const formLabel = getFormLabel(payload.formType);
    const safeSubjectSuffix = sanitizeHeaderValue(
      payload.subject || payload.fisheryName || payload.name
    );

    await transporter.sendMail({
      from: `"Rybio" <${smtpFrom}>`,
      to: contactTo,
      replyTo: payload.email,
      subject: `[Rybio] ${formLabel} - ${safeSubjectSuffix}`,
      text: buildEmailText(payload),
      html: buildEmailHtml(payload),
    });

    return NextResponse.json(
      {
        message: "Wiadomość została wysłana.",
      },
      {
        headers: {
          "X-RateLimit-Limit": String(RATE_LIMIT_MAX_REQUESTS),
          "X-RateLimit-Remaining": String(rateLimit.remaining),
        },
      }
    );
  } catch (error) {
    if (error instanceof ContactValidationError) {
      return validationError(error.message);
    }

    console.error("[contact] Błąd wysyłki formularza:", error);

    return NextResponse.json(
      {
        message: "Nie udało się wysłać wiadomości.",
      },
      {
        status: 500,
      }
    );
  }
}
