import type {
  ReactNode,
} from "react";

import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { PublicBlogHeader } from "@/components/blog/PublicBlogHeader";
import { createClient } from "@/lib/supabase/server";

export const dynamic =
  "force-dynamic";

export default async function BlogLayout({
  children,
}: {
  children: ReactNode;
}) {
  const supabase =
    await createClient();

  const {
    data: { user },
  } =
    await supabase.auth.getUser();

  if (user) {
    return (
      <DashboardLayout>
        {children}
      </DashboardLayout>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <PublicBlogHeader />
      {children}
    </div>
  );
}
