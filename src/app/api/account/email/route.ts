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
  const email = String(body?.email || "").trim().toLowerCase();

  if (!email || !email.includes("@")) {
    return NextResponse.json(
      { message: "Podaj poprawny adres e-mail." },
      { status: 400 }
    );
  }

  const { error } = await supabase.auth.updateUser({
    email,
  });

  if (error) {
    return NextResponse.json(
      { message: error.message || "Nie udało się zmienić adresu e-mail." },
      { status: 400 }
    );
  }

  return NextResponse.json({
    message:
      "Jeśli wymagane jest potwierdzenie, sprawdź skrzynkę e-mail i kliknij link aktywacyjny.",
  });
}