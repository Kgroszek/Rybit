import { NextResponse } from "next/server";

import { getDashboardLayoutContext } from "@/lib/dashboard-layout-context";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      {
        authenticated: false,
      },
      {
        status: 401,
        headers: {
          "Cache-Control": "private, no-store",
        },
      }
    );
  }

  const context = await getDashboardLayoutContext(user);

  return NextResponse.json(
    {
      authenticated: true,
      context,
    },
    {
      headers: {
        "Cache-Control": "private, no-store",
      },
    }
  );
}
