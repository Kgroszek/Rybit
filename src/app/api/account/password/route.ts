import { NextResponse } from "next/server";

import {
  parseAccountPasswordInput,
} from "@/lib/account/account-validation";
import { createClient } from "@/lib/supabase/server";

export async function PATCH(
  request: Request
) {
  const supabase =
    await createClient();

  const {
    data: { user },
  } =
    await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      {
        message:
          "Musisz być zalogowany.",
      },
      {
        status: 401,
      }
    );
  }

  if (!user.email) {
    return NextResponse.json(
      {
        message:
          "Nie można zweryfikować konta bez adresu e-mail.",
      },
      {
        status: 400,
      }
    );
  }

  let body: unknown;

  try {
    body =
      await request.json();
  } catch {
    return NextResponse.json(
      {
        message:
          "Nieprawidłowy format danych.",
      },
      {
        status: 400,
      }
    );
  }

  const parsed =
    parseAccountPasswordInput(
      body
    );

  if (!parsed.ok) {
    return NextResponse.json(
      {
        message:
          parsed.message,
      },
      {
        status: 400,
      }
    );
  }

  const {
    currentPassword,
    newPassword,
  } = parsed.data;

  const {
    error:
      verifyPasswordError,
  } =
    await supabase.auth.signInWithPassword(
      {
        email: user.email,
        password:
          currentPassword,
      }
    );

  if (verifyPasswordError) {
    return NextResponse.json(
      {
        message:
          "Obecne hasło jest nieprawidłowe.",
      },
      {
        status: 400,
      }
    );
  }

  const {
    error:
      updatePasswordError,
  } =
    await supabase.auth.updateUser(
      {
        password:
          newPassword,
      }
    );

  if (updatePasswordError) {
    return NextResponse.json(
      {
        message:
          updatePasswordError.message ||
          "Nie udało się zmienić hasła.",
      },
      {
        status: 400,
      }
    );
  }

  return NextResponse.json({
    message:
      "Hasło zostało zmienione.",
  });
}
