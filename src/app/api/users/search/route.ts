import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

type AuthUserRow = {
  id: string;
  email: string | null;
  raw_user_meta_data: Prisma.JsonValue | null;
};

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function getDisplayName(row: AuthUserRow) {
  const metadata =
    row.raw_user_meta_data &&
    typeof row.raw_user_meta_data === "object" &&
    !Array.isArray(row.raw_user_meta_data)
      ? (row.raw_user_meta_data as Record<string, unknown>)
      : {};

  const candidates = [
    metadata.display_name,
    metadata.full_name,
    metadata.name,
    metadata.username,
    metadata.user_name,
  ];

  const metadataName = candidates.find(
    (value): value is string =>
      typeof value === "string" && value.trim().length > 0
  );

  if (metadataName) {
    return metadataName.trim().slice(0, 80);
  }

  const emailName = row.email?.split("@")[0]?.trim();

  return emailName ? emailName.slice(0, 80) : "Użytkownik Rybio";
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { message: "Musisz być zalogowany." },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => null);

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { message: "Nieprawidłowe dane wyszukiwania." },
        { status: 400 }
      );
    }

    const email = normalizeEmail(
      String((body as Record<string, unknown>).email ?? "")
    );

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { message: "Wpisz pełny, poprawny adres e-mail." },
        { status: 400 }
      );
    }

    if (normalizeEmail(user.email ?? "") === email) {
      return NextResponse.json({
        user: null,
        message: "Nie możesz zaprosić samego siebie.",
      });
    }

    const rows = await prisma.$queryRaw<AuthUserRow[]>`
      SELECT
        id::text AS id,
        email,
        raw_user_meta_data
      FROM auth.users
      WHERE LOWER(email) = LOWER(${email})
      LIMIT 1
    `;

    const matchedUser = rows[0] ?? null;

    if (!matchedUser) {
      return NextResponse.json({
        user: null,
        message: "Nie znaleziono konta Rybio z takim adresem e-mail.",
      });
    }

    return NextResponse.json({
      user: {
        id: matchedUser.id,
        displayName: getDisplayName(matchedUser),
      },
    });
  } catch (error) {
    console.error("[api/users/search]", error);

    return NextResponse.json(
      {
        message:
          "Nie udało się sprawdzić użytkownika. Sprawdź konsolę serwera.",
      },
      { status: 500 }
    );
  }
}
