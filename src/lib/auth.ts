import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

type AdminUserLike = Pick<User, "email" | "app_metadata">;

const ADMIN_ROLE = "admin";

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

/**
 * Pobiera adresy administratorów zapisane po stronie serwera.
 *
 * Obsługiwane zmienne:
 * ADMIN_EMAIL=admin@example.com
 * ADMIN_EMAILS=admin1@example.com,admin2@example.com
 */
export function getAdminEmails(): string[] {
  const configuredValues = [
    process.env.ADMIN_EMAIL,
    process.env.ADMIN_EMAILS,
  ].filter((value): value is string => Boolean(value));

  const emails = configuredValues
    .flatMap((value) => value.split(","))
    .map(normalizeEmail)
    .filter(Boolean);

  return [...new Set(emails)];
}

/**
 * Sprawdza, czy użytkownik jest administratorem.
 *
 * Administrator może zostać rozpoznany wyłącznie przez:
 * 1. rolę "admin" znajdującą się w app_metadata,
 * 2. adres e-mail zapisany w serwerowej zmiennej środowiskowej.
 *
 * Funkcja celowo nie korzysta z user_metadata.
 */
export function isAdminUser(
  user: AdminUserLike | null | undefined
): boolean {
  if (!user) {
    return false;
  }

  const role =
    typeof user.app_metadata?.role === "string"
      ? user.app_metadata.role.trim().toLowerCase()
      : "";

  if (role === ADMIN_ROLE) {
    return true;
  }

  const userEmail =
    typeof user.email === "string" ? normalizeEmail(user.email) : "";

  if (!userEmail) {
    return false;
  }

  return getAdminEmails().includes(userEmail);
}

/**
 * Zwraca aktualnego użytkownika, jeżeli jest administratorem.
 * W przeciwnym przypadku zwraca null.
 *
 * Funkcja jest przeznaczona wyłącznie do używania po stronie serwera.
 */
export async function requireAdmin(): Promise<User | null> {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  if (!isAdminUser(user)) {
    return null;
  }

  return user;
}