export const CONTACT_FORM_TYPES = [
  "contact",
  "website",
  "cooperation",
] as const;

export type ContactFormType = (typeof CONTACT_FORM_TYPES)[number];

export const CONTACT_FIELD_LIMITS = {
  formType: 30,
  name: 120,
  email: 254,
  company: 160,
  subject: 180,
  message: 5000,
  fisheryName: 160,
  phone: 40,
  location: 160,
  currentWebsite: 500,
  budget: 80,
  deadline: 80,
  website: 300,
  recaptchaToken: 4096,
} as const;

export const CONTACT_BODY_LIMIT_BYTES = 20_000;

export const WEBSITE_BUDGET_OPTIONS = [
  "Nie wiem, potrzebuję wyceny",
  "do 2000 zł",
  "2000–4000 zł",
  "4000–7000 zł",
  "powyżej 7000 zł",
] as const;

export const WEBSITE_DEADLINE_OPTIONS = [
  "Jak najszybciej",
  "W ciągu miesiąca",
  "W ciągu 2–3 miesięcy",
  "Nie mam konkretnego terminu",
] as const;

export type ContactPayloadInput = {
  formType?: unknown;
  name?: unknown;
  email?: unknown;
  company?: unknown;
  subject?: unknown;
  message?: unknown;
  fisheryName?: unknown;
  phone?: unknown;
  location?: unknown;
  currentWebsite?: unknown;
  budget?: unknown;
  deadline?: unknown;
  website?: unknown;
  recaptchaToken?: unknown;
};

export type ValidatedContactPayload = {
  formType: ContactFormType;
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

export class ContactValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ContactValidationError";
  }
}

function getTrimmedString(
  value: unknown,
  label: string,
  maxLength: number
) {
  if (value === undefined || value === null) {
    return "";
  }

  if (typeof value !== "string") {
    throw new ContactValidationError(
      `${label} ma nieprawidłowy format.`
    );
  }

  const normalized = value.trim();

  if (normalized.length > maxLength) {
    throw new ContactValidationError(
      `${label} może mieć maksymalnie ${maxLength} znaków.`
    );
  }

  return normalized;
}

function requireValue(
  value: string,
  message: string
) {
  if (!value) {
    throw new ContactValidationError(message);
  }
}

function isContactFormType(
  value: string
): value is ContactFormType {
  return (CONTACT_FORM_TYPES as readonly string[]).includes(value);
}

function isValidEmail(email: string) {
  if (!email || email.length > CONTACT_FIELD_LIMITS.email) {
    return false;
  }

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Telefon jest opcjonalny.
 *
 * Akceptujemy popularne formaty:
 * +48 600 700 800
 * 600-700-800
 * (22) 123 45 67
 *
 * Po usunięciu znaków formatowania numer musi mieć
 * od 7 do 15 cyfr (zgodnie z maksymalną długością E.164).
 */
function isValidPhone(phone: string) {
  if (!phone) {
    return true;
  }

  if (!/^[0-9+\s().-]+$/.test(phone)) {
    return false;
  }

  const plusCount = (phone.match(/\+/g) ?? []).length;

  if (plusCount > 1) {
    return false;
  }

  if (plusCount === 1 && !phone.trimStart().startsWith("+")) {
    return false;
  }

  const digits = phone.replace(/\D/g, "");

  return digits.length >= 7 && digits.length <= 15;
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

function isAllowedBudget(
  value: string
) {
  return (WEBSITE_BUDGET_OPTIONS as readonly string[]).includes(value);
}

function isAllowedDeadline(
  value: string
) {
  return (WEBSITE_DEADLINE_OPTIONS as readonly string[]).includes(value);
}

export function validateContactPayload(
  body: ContactPayloadInput
): ValidatedContactPayload {
  const formTypeRaw = getTrimmedString(
    body.formType,
    "Typ formularza",
    CONTACT_FIELD_LIMITS.formType
  );

  if (!isContactFormType(formTypeRaw)) {
    throw new ContactValidationError(
      "Nieprawidłowy typ formularza."
    );
  }

  const payload: ValidatedContactPayload = {
    formType: formTypeRaw,

    name: getTrimmedString(
      body.name,
      "Imię i nazwisko",
      CONTACT_FIELD_LIMITS.name
    ),

    email: getTrimmedString(
      body.email,
      "Adres e-mail",
      CONTACT_FIELD_LIMITS.email
    ),

    company: getTrimmedString(
      body.company,
      "Firma / marka",
      CONTACT_FIELD_LIMITS.company
    ),

    subject: getTrimmedString(
      body.subject,
      "Temat",
      CONTACT_FIELD_LIMITS.subject
    ),

    message: getTrimmedString(
      body.message,
      "Wiadomość",
      CONTACT_FIELD_LIMITS.message
    ),

    fisheryName: getTrimmedString(
      body.fisheryName,
      "Nazwa łowiska",
      CONTACT_FIELD_LIMITS.fisheryName
    ),

    phone: getTrimmedString(
      body.phone,
      "Telefon",
      CONTACT_FIELD_LIMITS.phone
    ),

    location: getTrimmedString(
      body.location,
      "Lokalizacja",
      CONTACT_FIELD_LIMITS.location
    ),

    currentWebsite: getTrimmedString(
      body.currentWebsite,
      "Adres strony",
      CONTACT_FIELD_LIMITS.currentWebsite
    ),

    budget: getTrimmedString(
      body.budget,
      "Budżet",
      CONTACT_FIELD_LIMITS.budget
    ),

    deadline: getTrimmedString(
      body.deadline,
      "Termin",
      CONTACT_FIELD_LIMITS.deadline
    ),

    website: getTrimmedString(
      body.website,
      "Pole bezpieczeństwa",
      CONTACT_FIELD_LIMITS.website
    ),

    recaptchaToken: getTrimmedString(
      body.recaptchaToken,
      "Token bezpieczeństwa",
      CONTACT_FIELD_LIMITS.recaptchaToken
    ),
  };

  requireValue(
    payload.name,
    "Podaj imię i nazwisko."
  );

  if (!isValidEmail(payload.email)) {
    throw new ContactValidationError(
      "Podaj poprawny adres e-mail."
    );
  }

  requireValue(
    payload.message,
    "Wiadomość jest wymagana."
  );

  if (!isValidPhone(payload.phone)) {
    throw new ContactValidationError(
      "Podaj poprawny numer telefonu."
    );
  }

  if (!isValidHttpUrl(payload.currentWebsite)) {
    throw new ContactValidationError(
      "Podaj poprawny adres strony zaczynający się od http:// lub https://."
    );
  }

  if (
    payload.formType === "contact" ||
    payload.formType === "cooperation"
  ) {
    requireValue(
      payload.subject,
      "Podaj temat wiadomości."
    );
  }

  if (payload.formType === "website") {
    requireValue(
      payload.fisheryName,
      "Podaj nazwę łowiska."
    );

    requireValue(
      payload.location,
      "Podaj lokalizację łowiska."
    );

    if (!isAllowedBudget(payload.budget)) {
      throw new ContactValidationError(
        "Wybierz poprawny planowany budżet."
      );
    }

    if (!isAllowedDeadline(payload.deadline)) {
      throw new ContactValidationError(
        "Wybierz poprawny termin realizacji."
      );
    }
  }

  return payload;
}
