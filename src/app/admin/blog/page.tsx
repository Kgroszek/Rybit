import Link from "next/link";
import { redirect } from "next/navigation";

import { BlogAdminListActions } from "@/components/admin/blog/BlogAdminListActions";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { getBlogCategoryLabel } from "@/lib/blog";
import { isAdminUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AdminBlogPage() {
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

  const [posts, draftCount, publishedCount] = await Promise.all([
    prisma.blogPost.findMany({
      orderBy: {
        updatedAt: "desc",
      },
    }),
    prisma.blogPost.count({
      where: {
        status: "draft",
      },
    }),
    prisma.blogPost.count({
      where: {
        status: "published",
      },
    }),
  ]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <header className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">
              Panel administratora
            </p>

            <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
              Blog Rybio
            </h1>

            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
              Twórz artykuły, dodawaj zdjęcia bezpośrednio w treści, zarządzaj
              kategoriami, tagami i publikacją.
            </p>
          </div>

          <Link
            href="/admin/blog/nowy"
            className="inline-flex items-center justify-center rounded-2xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700"
          >
            + Nowy artykuł
          </Link>
        </header>

        <section className="grid gap-4 sm:grid-cols-3">
          <StatCard label="Wszystkie" value={posts.length} />
          <StatCard label="Szkice" value={draftCount} />
          <StatCard label="Opublikowane" value={publishedCount} />
        </section>

        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
            <h2 className="text-xl font-extrabold text-slate-950">
              Artykuły
            </h2>
          </div>

          {posts.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {posts.map((post) => (
                <article
                  key={post.id}
                  className="grid gap-4 px-5 py-5 sm:px-6 xl:grid-cols-[minmax(0,1fr)_180px_150px_auto] xl:items-center"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          post.status === "published"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        {post.status === "published"
                          ? "Opublikowany"
                          : "Szkic"}
                      </span>

                      {post.isFeatured && (
                        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                          Wyróżniony
                        </span>
                      )}
                    </div>

                    <h3 className="mt-2 truncate text-base font-bold text-slate-950">
                      {post.title}
                    </h3>

                    <p className="mt-1 truncate text-xs text-slate-400">
                      /blog/{post.slug}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                      Kategoria
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-700">
                      {getBlogCategoryLabel(post.category)}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                      Aktualizacja
                    </p>
                    <p className="mt-1 text-sm font-medium text-slate-600">
                      {formatDate(post.updatedAt)}
                    </p>
                  </div>

                  <BlogAdminListActions
                    id={post.id}
                    slug={post.slug}
                    status={post.status}
                  />
                </article>
              ))}
            </div>
          ) : (
            <div className="p-10 text-center">
              <p className="text-xl font-bold text-slate-950">
                Nie ma jeszcze artykułów
              </p>
              <p className="mt-2 text-sm text-slate-500">
                Utwórz pierwszy materiał do bazy wiedzy Rybio.
              </p>
            </div>
          )}
        </section>
      </div>
    </DashboardLayout>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
        {label}
      </p>
      <p className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950">
        {value}
      </p>
    </div>
  );
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("pl-PL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}
