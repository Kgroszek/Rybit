"server-only";

import {
  createClient,
  type SupabaseClient,
} from "@supabase/supabase-js";

let storageAdminClient: SupabaseClient | null | undefined;

export function getStorageAdminClient() {
  if (storageAdminClient !== undefined) {
    return storageAdminClient;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    storageAdminClient = null;
    return storageAdminClient;
  }

  storageAdminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return storageAdminClient;
}
