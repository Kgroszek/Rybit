import { NextResponse } from "next/server";

import {
  parseAccountProfileInput,
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
    parseAccountProfileInput(
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

  const { name } =
    parsed.data;

  const { error } =
    await supabase.auth.updateUser(
      {
        data: {
          full_name: name,
          name,
        },
      }
    );

  if (error) {
    return NextResponse.json(
      {
        message:
          error.message ||
          "Nie udało się zapisać danych profilu.",
      },
      {
        status: 400,
      }
    );
  }

  return NextResponse.json({
    message:
      "Dane profilu zostały zapisane.",
    name,
  });
}
