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
  const name = String(body?.name || "").trim();

  if (!name) {
    return NextResponse.json(
      { message: "Nazwa użytkownika jest wymagana." },
      { status: 400 }
    );
  }

  const { error } = await supabase.auth.updateUser({
    data: {
      full_name: name,
      name,
    },
  });

  if (error) {
    return NextResponse.json(
      { message: error.message || "Nie udało się zapisać danych profilu." },
      { status: 400 }
    );
  }

  return NextResponse.json({
    message: "Dane profilu zostały zapisane.",
  });
}