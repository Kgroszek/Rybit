import { createClient } from "@supabase/supabase-js";

export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    throw new Error("Brakuje NEXT_PUBLIC_SUPABASE_URL w .env.");
  }

  if (!serviceRoleKey) {
    throw new Error("Brakuje SUPABASE_SERVICE_ROLE_KEY w .env.");
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export const createSupabaseAdminClient = createAdminClient;