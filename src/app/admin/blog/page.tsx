import Link from "next/link";
import {
  redirect,
} from "next/navigation";

import {
  BlogAdminListActions,
} from "@/components/admin/blog/BlogAdminListActions";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import {
  BLOG_CATEGORIES,
  getBlogCategoryLabel,
  getBlogPublicationState,
  isBlogCategory,
} from "@/lib/blog";
import { isAdminUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/cn";

export const dynamic =
  "force-dynamic";

type AdminBlogPageProps = {
  searchParams: Promise<{
    search?: string;
    status?: string;
    category?: string;
  }>;
};

export default async function AdminBlogPage({
  searchParams,
}: AdminBlogPageProps) {
  const supabase =
    await createClient();

  const {
    data: { user },
  } =
    await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  if (!isAdminUser(user)) {
    redirect("/dashboard");
  }

  const params =
    await searchParams;

  const search =
    params.search?.trim() ||
    "";

  const status =
    params.status ===
      "draft" ||
    params.status ===
      "published" ||
    params.status ===
      "scheduled"
      ? params.status
      : "all";

  const category =
    params.category &&
    isBlogCategory(
      params.category
    )
      ? params.category
      : "all";

  const now = new Date();

  const statusWhere =
    status === "draft"
      ? {
          status: "draft",
        }
      : status ===
          "scheduled"
        ? {
            status:
              "published",
            publishedAt: {
              gt: now,
            },
          }
        : status ===
            "published"
          ? {
              status:
                "published",
              publishedAt: {
                lte: now,
              },
            }
          : {};

  const where = {
    ...statusWhere,
    ...(category !== "all"
      ? { category }
      : {}),
    ...(search
      ? {
          OR: [
            {
              title: {
                contains:
                  search,
                mode: "insensitive" as const,
              },
            },
            {
              slug: {
                contains:
                  search,
                mode: "insensitive" as const,
              },
            },
          ],
        }
      : {}),
  };

  const [
    posts,
    allCount,
    draftCount,
    publishedCount,
    scheduledCount,
  ] = await Promise.all([
    prisma.blogPost.findMany({
      where,
      orderBy: [
        {
          updatedAt: "desc",
        },
      ],
      take: 80,
    }),
    prisma.blogPost.count(),
    prisma.blogPost.count({
      where: {
        status: "draft",
      },
    }),
    prisma.blogPost.count({
      where: {
        status: "published",
        publishedAt: {
          lte: now,
        },
      },
    }),
    prisma.blogPost.count({
      where: {
        status: "published",
        publishedAt: {
          gt: now,
        },
      },
    }),
  ]);

  const hasFilters =
    Boolean(search) ||
    status !== "all" ||
    category !== "all";

  return (
    <DashboardLayout>
      <div className="space-y-8 pb-6 lg:space-y-9">
        <header className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-primary">
              Panel administratora
            </p>

            <h1 className="mt-2 font-display text-3xl font-extrabold tracking-[-0.035em] text-text sm:text-4xl">
              Wiedza Rybio
            </h1>

            <p className="mt-2 max-w-3xl text-sm leading-6 text-text-secondary">
              Twórz,
              planuj i rozwijaj
              artykuły w jednym
              systemie redakcyjnym.
            </p>
          </div>

          <Link
            href="/admin/blog/nowy"
            className="inline-flex min-h-11 items-center justify-center rounded-control bg-primary px-5 text-sm font-extrabold text-white shadow-sm transition hover:bg-primary-hover"
          >
            + Nowy artykuł
          </Link>
        </header>

        <section className="overflow-hidden rounded-panel border border-border bg-surface shadow-card">
          <div className="grid grid-cols-2 xl:grid-cols-4">
            <Stat
              label="Wszystkie"
              value={allCount}
            />

            <Stat
              label="Szkice"
              value={draftCount}
              border
            />

            <Stat
              label="Online"
              value={
                publishedCount
              }
              borderTop
              border
            />

            <Stat
              label="Zaplanowane"
              value={
                scheduledCount
              }
              borderTop
              border
            />
          </div>
        </section>

        <section className="overflow-visible rounded-panel border border-border bg-surface shadow-card">
          <div className="border-b border-border px-4 py-5 sm:px-5">
            <h2 className="font-display text-xl font-extrabold tracking-[-0.025em] text-text">
              Artykuły
            </h2>

            <p className="mt-1.5 text-sm leading-6 text-text-secondary">
              Wyszukuj materiały,
              filtruj status i
              zarządzaj publikacją.
            </p>
          </div>

          <form
            action="/admin/blog"
            className="grid gap-3 border-b border-border px-4 py-4 sm:px-5 lg:grid-cols-[minmax(0,1fr)_180px_220px_auto]"
          >
            <input
              name="search"
              defaultValue={search}
              placeholder="Szukaj po tytule lub slugu..."
              className="h-11 min-w-0 rounded-control border border-border-strong bg-surface px-3.5 text-sm font-semibold text-text outline-none transition placeholder:text-text-muted focus:border-primary focus:ring-4 focus:ring-primary-100"
            />

            <select
              name="status"
              defaultValue={status}
              className="h-11 rounded-control border border-border-strong bg-surface px-3.5 text-sm font-bold text-text-secondary outline-none focus:border-primary"
            >
              <option value="all">
                Wszystkie statusy
              </option>
              <option value="draft">
                Szkice
              </option>
              <option value="published">
                Online
              </option>
              <option value="scheduled">
                Zaplanowane
              </option>
            </select>

            <select
              name="category"
              defaultValue={category}
              className="h-11 rounded-control border border-border-strong bg-surface px-3.5 text-sm font-bold text-text-secondary outline-none focus:border-primary"
            >
              <option value="all">
                Wszystkie kategorie
              </option>

              {BLOG_CATEGORIES.map(
                (item) => (
                  <option
                    key={
                      item.value
                    }
                    value={
                      item.value
                    }
                  >
                    {item.label}
                  </option>
                )
              )}
            </select>

            <button
              type="submit"
              className="h-11 rounded-control bg-primary px-5 text-sm font-extrabold text-white transition hover:bg-primary-hover"
            >
              Filtruj
            </button>
          </form>

          {hasFilters && (
            <div className="flex items-center justify-between gap-4 border-b border-border bg-surface-muted px-4 py-3 sm:px-5">
              <p className="text-xs font-bold text-text-muted">
                {posts.length}{" "}
                wyników
              </p>

              <Link
                href="/admin/blog"
                className="text-xs font-extrabold text-primary-700"
              >
                Wyczyść filtry
              </Link>
            </div>
          )}

          {posts.length > 0 ? (
            <div className="divide-y divide-border">
              {posts.map(
                (post) => {
                  const state =
                    getBlogPublicationState(
                      post.status,
                      post.publishedAt,
                      now
                    );

                  return (
                    <article
                      key={
                        post.id
                      }
                      className="grid gap-4 px-4 py-5 sm:px-5 xl:grid-cols-[minmax(0,1fr)_180px_170px_110px_50px] xl:items-center"
                    >
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <StatusBadge
                            state={
                              state
                            }
                          />

                          {post.isFeatured && (
                            <span className="rounded-full bg-primary-50 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.09em] text-primary-700">
                              Wyróżniony
                            </span>
                          )}
                        </div>

                        <h3 className="mt-2 truncate font-display text-base font-extrabold tracking-[-0.015em] text-text">
                          {
                            post.title
                          }
                        </h3>

                        <p className="mt-1 truncate text-xs font-semibold text-text-muted">
                          /blog/
                          {
                            post.slug
                          }
                        </p>
                      </div>

                      <MetaCell
                        label="Kategoria"
                        value={getBlogCategoryLabel(
                          post.category
                        )}
                      />

                      <MetaCell
                        label={
                          state ===
                          "scheduled"
                            ? "Publikacja"
                            : "Aktualizacja"
                        }
                        value={
                          state ===
                            "scheduled" &&
                          post.publishedAt
                            ? formatDateTime(
                                post.publishedAt
                              )
                            : formatDate(
                                post.updatedAt
                              )
                        }
                      />

                      <MetaCell
                        label="Treść"
                        value={`${Array.isArray(
                          post.content
                        ) ? post.content.length : 0} bloków`}
                      />

                      <div className="flex justify-end">
                        <BlogAdminListActions
                          id={
                            post.id
                          }
                          slug={
                            post.slug
                          }
                          publicVisible={
                            state ===
                            "published"
                          }
                        />
                      </div>
                    </article>
                  );
                }
              )}
            </div>
          ) : (
            <div className="px-6 py-14 text-center">
              <p className="font-display text-2xl font-extrabold text-text">
                Brak artykułów
              </p>

              <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-text-secondary">
                {hasFilters
                  ? "Zmień filtry albo wyczyść wyszukiwanie."
                  : "Utwórz pierwszy materiał do Wiedzy Rybio."}
              </p>

              {!hasFilters && (
                <Link
                  href="/admin/blog/nowy"
                  className="mt-5 inline-flex min-h-11 items-center justify-center rounded-control bg-primary px-5 text-sm font-extrabold text-white"
                >
                  Utwórz artykuł
                </Link>
              )}
            </div>
          )}
        </section>
      </div>
    </DashboardLayout>
  );
}

function Stat({
  label,
  value,
  border = false,
  borderTop = false,
}: {
  label: string;
  value: number;
  border?: boolean;
  borderTop?: boolean;
}) {
  return (
    <div
      className={cn(
        "px-5 py-5 sm:px-6",
        border &&
          "border-l border-border",
        borderTop &&
          "border-t border-border xl:border-t-0"
      )}
    >
      <p className="text-[10px] font-black uppercase tracking-[0.13em] text-text-muted">
        {label}
      </p>

      <p className="mt-2 font-display text-3xl font-extrabold tracking-[-0.035em] text-text">
        {value}
      </p>
    </div>
  );
}

function StatusBadge({
  state,
}: {
  state:
    | "draft"
    | "scheduled"
    | "published";
}) {
  return (
    <span
      className={cn(
        "rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.09em]",
        state ===
          "published"
          ? "bg-success-subtle text-success-foreground"
          : state ===
              "scheduled"
            ? "bg-primary-50 text-primary-700"
            : "bg-warning-subtle text-warning-foreground"
      )}
    >
      {state ===
      "published"
        ? "Online"
        : state ===
            "scheduled"
          ? "Zaplanowany"
          : "Szkic"}
    </span>
  );
}

function MetaCell({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-[9px] font-black uppercase tracking-[0.1em] text-text-muted">
        {label}
      </p>

      <p className="mt-1 text-sm font-bold text-text-secondary">
        {value}
      </p>
    </div>
  );
}

function formatDate(
  date: Date
) {
  return new Intl.DateTimeFormat(
    "pl-PL",
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }
  ).format(date);
}

function formatDateTime(
  date: Date
) {
  return new Intl.DateTimeFormat(
    "pl-PL",
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  ).format(date);
}
