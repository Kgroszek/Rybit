import { NextResponse } from "next/server";

import {
  parseAccountEmailInput,
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
    parseAccountEmailInput(
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

  const { email } =
    parsed.data;

  const currentEmail =
    user.email
      ?.trim()
      .toLocaleLowerCase(
        "pl-PL"
      ) || "";

  if (
    currentEmail &&
    currentEmail === email
  ) {
    return NextResponse.json(
      {
        message:
          "Nowy adres e-mail musi być inny niż aktualny.",
      },
      {
        status: 400,
      }
    );
  }

  const { error } =
    await supabase.auth.updateUser(
      {
        email,
      }
    );

  if (error) {
    return NextResponse.json(
      {
        message:
          error.message ||
          "Nie udało się zmienić adresu e-mail.",
      },
      {
        status: 400,
      }
    );
  }

  return NextResponse.json({
    message:
      "Zmiana została wysłana. Jeśli wymagane jest potwierdzenie, sprawdź skrzynkę nowego adresu e-mail i kliknij link aktywacyjny.",
    requestedEmail: email,
  });
}
