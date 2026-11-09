import type {
  User,
} from "@supabase/supabase-js";

import {
  createAdminClient,
} from "@/lib/supabase/admin";

export async function getAllAdminUsers(): Promise<
  User[]
> {
  const supabaseAdmin =
    createAdminClient();

  const users: User[] = [];
  const perPage = 1000;
  let page = 1;

  while (true) {
    const { data, error } =
      await supabaseAdmin.auth.admin.listUsers(
        {
          page,
          perPage,
        }
      );

    if (error) {
      throw error;
    }

    const batch =
      data.users ?? [];

    users.push(...batch);

    if (
      batch.length <
      perPage
    ) {
      break;
    }

    page += 1;
  }

  return users;
}

export function getAdminUserDisplayName(
  user: User
) {
  const metadata =
    user.user_metadata;

  for (const key of [
    "name",
    "full_name",
    "display_name",
  ]) {
    const value =
      metadata?.[key];

    if (
      typeof value ===
        "string" &&
      value.trim()
    ) {
      return value.trim();
    }
  }

  return "Użytkownik";
}
