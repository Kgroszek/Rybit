import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import { DashboardChrome } from "@/components/dashboard/DashboardChrome";
import { getDashboardLayoutContext } from "@/lib/dashboard-layout-context";
import { createClient } from "@/lib/supabase/server";

type DashboardLayoutProps = {
  children: ReactNode;
};

export async function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const context = await getDashboardLayoutContext(user);

  return (
    <DashboardChrome {...context}>
      {children}
    </DashboardChrome>
  );
}
