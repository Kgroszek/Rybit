import { createClient } from "@/lib/supabase/server";

export async function getCurrentUser() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
}

export async function requireAdmin() {
  const user = await getCurrentUser();

  if (!user) {
    return null;
  }

  const adminEmail = process.env.ADMIN_EMAIL;

  if (!adminEmail) {
    return null;
  }

  if (user.email !== adminEmail) {
    return null;
  }

  return user;
}