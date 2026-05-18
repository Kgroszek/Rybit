import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function PATCH(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { message: "Musisz być zalogowany." },
      { status: 401 }
    );
  }

  const body = await request.json().catch(() => null);

  const oldPassword = String(
    body?.oldPassword || body?.currentPassword || ""
  );

  const newPassword = String(
    body?.newPassword || body?.password || ""
  );

  if (!user.email) {
    return NextResponse.json(
      { message: "Nie można zweryfikować konta bez adresu e-mail." },
      { status: 400 }
    );
  }

  if (!oldPassword.trim()) {
    return NextResponse.json(
      { message: "Wpisz obecne hasło." },
      { status: 400 }
    );
  }

  if (!newPassword.trim()) {
    return NextResponse.json(
      { message: "Wpisz nowe hasło." },
      { status: 400 }
    );
  }

  if (newPassword.length < 6) {
    return NextResponse.json(
      { message: "Nowe hasło musi mieć minimum 6 znaków." },
      { status: 400 }
    );
  }

  if (oldPassword === newPassword) {
    return NextResponse.json(
      { message: "Nowe hasło musi być inne niż obecne hasło." },
      { status: 400 }
    );
  }

  const { error: verifyPasswordError } =
    await supabase.auth.signInWithPassword({
      email: user.email,
      password: oldPassword,
    });

  if (verifyPasswordError) {
    return NextResponse.json(
      { message: "Obecne hasło jest nieprawidłowe." },
      { status: 400 }
    );
  }

  const { error: updatePasswordError } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (updatePasswordError) {
    return NextResponse.json(
      {
        message:
          updatePasswordError.message || "Nie udało się zmienić hasła.",
      },
      { status: 400 }
    );
  }

  return NextResponse.json({
    message: "Hasło zostało zmienione.",
  });
}