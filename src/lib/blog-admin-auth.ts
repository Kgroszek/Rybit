import { NextResponse } from "next/server";

import { isAdminUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export async function getBlogAdmin() {
  const supabase =
    await createClient();

  const {
    data: { user },
  } =
    await supabase.auth.getUser();

  if (
    !user ||
    !isAdminUser(user)
  ) {
    return {
      ok: false as const,
      response:
        NextResponse.json(
          {
            message:
              "Brak uprawnień.",
          },
          {
            status: 403,
          }
        ),
    };
  }

  return {
    ok: true as const,
    user,
  };
}

export function getBlogAuthorName(
  user: {
    email?: string | null;
    user_metadata?: Record<
      string,
      unknown
    >;
  }
) {
  const metadata =
    user.user_metadata ?? {};

  for (const key of [
    "full_name",
    "name",
    "display_name",
  ]) {
    const value =
      metadata[key];

    if (
      typeof value ===
        "string" &&
      value.trim()
    ) {
      return value.trim();
    }
  }

  return (
    user.email ||
    "Rybio"
  );
}
