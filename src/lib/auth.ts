import { createClient } from "@/lib/supabase/server";

export function getAdminEmails() {
  const singleAdminEmail = process.env.ADMIN_EMAIL ?? "";
  const multipleAdminEmails = process.env.ADMIN_EMAILS ?? "";

  return [singleAdminEmail, multipleAdminEmails]
    .join(",")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminUser(user: {
  email?: string;
  app_metadata?: {
    role?: string;
  };
  user_metadata?: {
    role?: string;
  };
} | null) {
  if (!user) {
    return false;
  }

  const adminEmails = getAdminEmails();
  const userEmail = user.email?.trim().toLowerCase() ?? "";

  return (
    user.app_metadata?.role === "admin" ||
    user.user_metadata?.role === "admin" ||
    adminEmails.includes(userEmail)
  );
}

export async function requireAdmin() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  if (!isAdminUser(user)) {
    return null;
  }

  return user;
}