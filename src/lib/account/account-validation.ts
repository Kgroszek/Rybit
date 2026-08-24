import type {
  PasswordStrength,
  SettingsSection,
} from "@/lib/account/account-types";

type ValidationSuccess<T> = {
  ok: true;
  data: T;
};

type ValidationFailure = {
  ok: false;
  message: string;
};

export type ValidationResult<T> =
  | ValidationSuccess<T>
  | ValidationFailure;

export type AccountProfileInput = {
  name: string;
};

export type AccountEmailInput = {
  email: string;
};

export type AccountPasswordInput = {
  currentPassword: string;
  newPassword: string;
};

const EMAIL_PATTERN =
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function parseSettingsSection(
  value: string | null | undefined
): SettingsSection {
  return value === "security"
    ? "security"
    : "account";
}

export function parseAccountProfileInput(
  raw: unknown
): ValidationResult<AccountProfileInput> {
  if (!isRecord(raw)) {
    return fail(
      "Nieprawidłowe dane formularza."
    );
  }

  const name = cleanText(
    raw.name
  ).replace(/\s+/g, " ");

  if (name.length < 2) {
    return fail(
      "Nazwa użytkownika musi mieć co najmniej 2 znaki."
    );
  }

  if (name.length > 80) {
    return fail(
      "Nazwa użytkownika może mieć maksymalnie 80 znaków."
    );
  }

  return {
    ok: true,
    data: {
      name,
    },
  };
}

export function parseAccountEmailInput(
  raw: unknown
): ValidationResult<AccountEmailInput> {
  if (!isRecord(raw)) {
    return fail(
      "Nieprawidłowe dane formularza."
    );
  }

  const email = cleanText(raw.email)
    .toLocaleLowerCase("pl-PL");

  if (
    !email ||
    !EMAIL_PATTERN.test(email)
  ) {
    return fail(
      "Podaj poprawny adres e-mail."
    );
  }

  if (email.length > 254) {
    return fail(
      "Adres e-mail jest zbyt długi."
    );
  }

  return {
    ok: true,
    data: {
      email,
    },
  };
}

export function parseAccountPasswordInput(
  raw: unknown
): ValidationResult<AccountPasswordInput> {
  if (!isRecord(raw)) {
    return fail(
      "Nieprawidłowe dane formularza."
    );
  }

  const currentPassword =
    raw.currentPassword;

  const newPassword =
    raw.newPassword;

  if (
    typeof currentPassword !==
      "string" ||
    !currentPassword.trim()
  ) {
    return fail(
      "Wpisz obecne hasło."
    );
  }

  if (
    typeof newPassword !==
      "string" ||
    !newPassword.trim()
  ) {
    return fail(
      "Wpisz nowe hasło."
    );
  }

  if (newPassword.length < 8) {
    return fail(
      "Nowe hasło musi mieć minimum 8 znaków."
    );
  }

  if (newPassword.length > 128) {
    return fail(
      "Nowe hasło może mieć maksymalnie 128 znaków."
    );
  }

  if (
    currentPassword ===
    newPassword
  ) {
    return fail(
      "Nowe hasło musi być inne niż obecne hasło."
    );
  }

  return {
    ok: true,
    data: {
      currentPassword,
      newPassword,
    },
  };
}

export function getPasswordStrength(
  password: string
): PasswordStrength {
  if (!password) {
    return {
      score: 0,
      label: "Brak hasła",
      description:
        "Wpisz nowe hasło, aby zobaczyć jego siłę.",
    };
  }

  let points = 0;

  if (password.length >= 8) {
    points += 1;
  }

  if (password.length >= 12) {
    points += 1;
  }

  if (
    /[a-z]/.test(password) &&
    /[A-Z]/.test(password)
  ) {
    points += 1;
  }

  if (
    /\d/.test(password) ||
    /[^A-Za-z0-9]/.test(password)
  ) {
    points += 1;
  }

  const score = Math.min(
    4,
    points
  ) as PasswordStrength["score"];

  if (score <= 1) {
    return {
      score,
      label: "Słabe",
      description:
        "Użyj co najmniej 8 znaków i połącz różne typy znaków.",
    };
  }

  if (score === 2) {
    return {
      score,
      label: "Podstawowe",
      description:
        "Hasło spełnia minimum, ale warto je jeszcze wzmocnić.",
    };
  }

  if (score === 3) {
    return {
      score,
      label: "Dobre",
      description:
        "Hasło ma dobrą długość i zróżnicowaną strukturę.",
    };
  }

  return {
    score: 4,
    label: "Bardzo dobre",
    description:
      "Długie i zróżnicowane hasło zapewnia lepszą ochronę konta.",
  };
}

function isRecord(
  value: unknown
): value is Record<
  string,
  unknown
> {
  return Boolean(
    value &&
      typeof value === "object" &&
      !Array.isArray(value)
  );
}

function cleanText(
  value: unknown
) {
  return typeof value ===
    "string"
    ? value.trim()
    : "";
}

function fail(
  message: string
): ValidationFailure {
  return {
    ok: false,
    message,
  };
}
