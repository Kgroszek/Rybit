"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function BlogAdminListActions({
  id,
  slug,
  status,
}: {
  id: string;
  slug: string;
  status: string;
}) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    const confirmed = window.confirm(
      "Czy na pewno chcesz usunąć ten artykuł? Tej operacji nie można cofnąć."
    );

    if (!confirmed) {
      return;
    }

    setIsDeleting(true);

    try {
      const response = await fetch(`/api/admin/blog/posts/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        window.alert(
          data?.message || "Nie udało się usunąć artykułu."
        );
        return;
      }

      router.refresh();
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="flex flex-wrap justify-end gap-2">
      {status === "published" && (
        <Link
          href={`/blog/${slug}`}
          target="_blank"
          className="rounded-xl bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 transition hover:bg-blue-100"
        >
          Podgląd ↗
        </Link>
      )}

      <Link
        href={`/admin/blog/${id}/edytuj`}
        className="rounded-xl bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-200"
      >
        Edytuj
      </Link>

      <button
        type="button"
        onClick={() => void handleDelete()}
        disabled={isDeleting}
        className="rounded-xl bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-100 disabled:opacity-50"
      >
        {isDeleting ? "Usuwanie..." : "Usuń"}
      </button>
    </div>
  );
}
