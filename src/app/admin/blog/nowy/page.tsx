import Link from "next/link";
import { redirect } from "next/navigation";

import { BlogPostEditor } from "@/components/admin/blog/BlogPostEditor";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { isAdminUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function NewBlogPostPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  if (!isAdminUser(user)) {
    redirect("/dashboard");
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">
              Blog Rybio
            </p>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950">
              Nowy artykuł
            </h1>
          </div>

          <Link
            href="/admin/blog"
            className="text-sm font-semibold text-blue-600 transition hover:text-blue-700"
          >
            ← Wróć do artykułów
          </Link>
        </header>

        <BlogPostEditor initialPost={null} />
      </div>
    </DashboardLayout>
  );
}
