"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

import { useToast } from "@/components/ui/ToastProvider";

type LakeCommentDto = {
  id: string;
  userName: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  isOwn: boolean;
  isReportedByViewer: boolean;
};

type ViewerDto = {
  isAuthenticated: boolean;
  userId: string | null;
  isAdmin: boolean;
};

type CommentsResponse = {
  message?: string;
  comments?: LakeCommentDto[];
  viewer?: ViewerDto;
  comment?: LakeCommentDto;
};

type LakeCommentsSectionProps = {
  lakeSlug: string;
  lakeName: string;
};

const REPORT_REASONS = [
  {
    value: "spam",
    label: "Spam lub reklama",
  },
  {
    value: "offensive",
    label: "Obraźliwa albo niedozwolona treść",
  },
  {
    value: "misinformation",
    label: "Fałszywa lub wprowadzająca w błąd informacja",
  },
  {
    value: "privacy",
    label: "Naruszenie prywatności",
  },
  {
    value: "other",
    label: "Inny powód",
  },
] as const;

const MAX_COMMENT_LENGTH = 1000;
const MAX_REPORT_DESCRIPTION_LENGTH = 500;

async function readApiResponse(response: Response) {
  try {
    return (await response.json()) as CommentsResponse;
  } catch {
    return {};
  }
}

function getInitials(name: string) {
  const initials = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return initials || "R";
}

function formatCommentDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("pl-PL", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function LakeCommentsSection({
  lakeSlug,
  lakeName,
}: LakeCommentsSectionProps) {
  const toast = useToast();

  const [comments, setComments] = useState<LakeCommentDto[]>([]);
  const [viewer, setViewer] = useState<ViewerDto>({
    isAuthenticated: false,
    userId: null,
    isAdmin: false,
  });

  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(
    null
  );

  const [reportingComment, setReportingComment] =
    useState<LakeCommentDto | null>(null);
  const [reportReason, setReportReason] = useState("spam");
  const [reportDescription, setReportDescription] = useState("");
  const [isReporting, setIsReporting] = useState(false);

  const trimmedContent = content.trim();
  const remainingCharacters = MAX_COMMENT_LENGTH - content.length;

  const canSubmit =
    trimmedContent.length >= 3 &&
    content.length <= MAX_COMMENT_LENGTH &&
    !isSubmitting;

  const canSubmitReport = useMemo(() => {
    if (isReporting) {
      return false;
    }

    if (reportReason === "other") {
      return reportDescription.trim().length >= 10;
    }

    return true;
  }, [isReporting, reportDescription, reportReason]);

  const loadComments = useCallback(async () => {
    setIsLoading(true);
    setLoadError("");

    try {
      const response = await fetch(`/api/lakes/${lakeSlug}/comments`, {
        method: "GET",
        cache: "no-store",
      });

      const data = await readApiResponse(response);

      if (!response.ok) {
        setLoadError(data.message || "Nie udało się pobrać komentarzy.");
        return;
      }

      setComments(data.comments ?? []);
      setViewer(
        data.viewer ?? {
          isAuthenticated: false,
          userId: null,
          isAdmin: false,
        }
      );
    } catch {
      setLoadError("Nie udało się połączyć z serwerem.");
    } finally {
      setIsLoading(false);
    }
  }, [lakeSlug]);

  useEffect(() => {
    void loadComments();
  }, [loadComments]);

  async function handleAddComment(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canSubmit) {
      return;
    }

    setIsSubmitting(true);

    const toastId = toast.loading({
      title: "Dodawanie komentarza...",
      description: "Publikujemy Twój komentarz przy łowisku.",
    });

    try {
      const response = await fetch(`/api/lakes/${lakeSlug}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: trimmedContent,
        }),
      });

      const data = await readApiResponse(response);

      if (!response.ok || !data.comment) {
        toast.update(toastId, {
          type: "error",
          title: "Nie udało się dodać komentarza.",
          description: data.message || "Spróbuj ponownie za chwilę.",
          duration: 6000,
        });

        return;
      }

      setComments((current) => [data.comment!, ...current]);
      setContent("");

      toast.update(toastId, {
        type: "success",
        title: "Komentarz został dodany.",
        description: "Komentarz jest już widoczny dla innych użytkowników.",
        duration: 4500,
      });
    } catch {
      toast.update(toastId, {
        type: "error",
        title: "Nie udało się dodać komentarza.",
        description: "Wystąpił problem z połączeniem. Spróbuj ponownie.",
        duration: 6000,
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  function openReportModal(comment: LakeCommentDto) {
    setReportingComment(comment);
    setReportReason("spam");
    setReportDescription("");
  }

  function closeReportModal() {
    if (isReporting) {
      return;
    }

    setReportingComment(null);
    setReportReason("spam");
    setReportDescription("");
  }

  async function handleReportComment(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!reportingComment || !canSubmitReport) {
      return;
    }

    setIsReporting(true);

    const toastId = toast.loading({
      title: "Wysyłanie zgłoszenia...",
      description: "Przekazujemy komentarz do sprawdzenia.",
    });

    try {
      const response = await fetch(
        `/api/comments/${reportingComment.id}/report`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            reason: reportReason,
            description: reportDescription.trim(),
          }),
        }
      );

      const data = await readApiResponse(response);

      if (!response.ok) {
        toast.update(toastId, {
          type: "error",
          title: "Nie udało się zgłosić komentarza.",
          description: data.message || "Spróbuj ponownie za chwilę.",
          duration: 6000,
        });

        return;
      }

      setComments((current) =>
        current.map((comment) =>
          comment.id === reportingComment.id
            ? {
                ...comment,
                isReportedByViewer: true,
              }
            : comment
        )
      );

      setReportingComment(null);
      setReportReason("spam");
      setReportDescription("");

      toast.update(toastId, {
        type: "success",
        title: "Komentarz został zgłoszony.",
        description:
          data.message || "Administrator sprawdzi przesłane zgłoszenie.",
        duration: 4500,
      });
    } catch {
      toast.update(toastId, {
        type: "error",
        title: "Nie udało się zgłosić komentarza.",
        description: "Wystąpił problem z połączeniem. Spróbuj ponownie.",
        duration: 6000,
      });
    } finally {
      setIsReporting(false);
    }
  }

  async function handleAdminDelete(comment: LakeCommentDto) {
    const confirmed = window.confirm(
      `Czy na pewno usunąć komentarz użytkownika „${comment.userName}”?`
    );

    if (!confirmed) {
      return;
    }

    setDeletingCommentId(comment.id);

    const toastId = toast.loading({
      title: "Usuwanie komentarza...",
      description: "Komentarz zostanie usunięty razem ze zgłoszeniami.",
    });

    try {
      const response = await fetch(`/api/admin/comments/${comment.id}`, {
        method: "DELETE",
      });

      const data = await readApiResponse(response);

      if (!response.ok) {
        toast.update(toastId, {
          type: "error",
          title: "Nie udało się usunąć komentarza.",
          description: data.message || "Spróbuj ponownie za chwilę.",
          duration: 6000,
        });

        return;
      }

      setComments((current) =>
        current.filter((item) => item.id !== comment.id)
      );

      toast.update(toastId, {
        type: "success",
        title: "Komentarz został usunięty.",
        description: data.message || "Komentarz nie jest już widoczny.",
        duration: 4500,
      });
    } catch {
      toast.update(toastId, {
        type: "error",
        title: "Nie udało się usunąć komentarza.",
        description: "Wystąpił problem z połączeniem. Spróbuj ponownie.",
        duration: 6000,
      });
    } finally {
      setDeletingCommentId(null);
    }
  }

  return (
    <>
      <section className="min-w-0 overflow-hidden rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-blue-600">
              Społeczność Rybio
            </p>

            <h2 className="mt-2 text-2xl font-black text-slate-950">
              Komentarze
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Podziel się doświadczeniem z łowiska „{lakeName}”. Komentarze są
              publicznie widoczne.
            </p>
          </div>

          <span className="w-fit rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600">
            {comments.length}{" "}
            {comments.length === 1 ? "komentarz" : "komentarzy"}
          </span>
        </div>

        <div className="mt-6">
          {viewer.isAuthenticated ? (
            <form
              onSubmit={handleAddComment}
              className="rounded-3xl border border-blue-100 bg-blue-50 p-4 sm:p-5"
            >
              <label className="block">
                <span className="text-sm font-black text-blue-950">
                  Dodaj komentarz
                </span>

                <textarea
                  value={content}
                  onChange={(event) => setContent(event.target.value)}
                  rows={4}
                  maxLength={MAX_COMMENT_LENGTH}
                  disabled={isSubmitting}
                  placeholder="Napisz, jak oceniasz łowisko, warunki, ryby lub obsługę..."
                  className="mt-3 w-full resize-y rounded-2xl border border-blue-100 bg-white px-4 py-3 text-sm leading-6 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
                />
              </label>

              <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p
                  className={`text-xs font-bold ${
                    remainingCharacters < 100
                      ? "text-amber-600"
                      : "text-blue-700"
                  }`}
                >
                  Minimum 3 znaki. Pozostało: {remainingCharacters}
                </p>

                <button
                  type="submit"
                  disabled={!canSubmit}
                  className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-black text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSubmitting ? "Dodawanie..." : "Dodaj komentarz"}
                </button>
              </div>
            </form>
          ) : (
            <div className="rounded-3xl border border-blue-100 bg-blue-50 p-5">
              <h3 className="font-black text-blue-950">
                Zaloguj się, aby dodać komentarz
              </h3>

              <p className="mt-2 text-sm leading-6 text-blue-800">
                Czytanie komentarzy jest dostępne dla wszystkich. Dodawanie i
                zgłaszanie komentarzy wymaga zalogowania.
              </p>

              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/login"
                  className="rounded-2xl bg-blue-600 px-5 py-3 text-center text-sm font-black text-white transition hover:bg-blue-700"
                >
                  Zaloguj się
                </Link>

                <Link
                  href="/register"
                  className="rounded-2xl bg-white px-5 py-3 text-center text-sm font-black text-blue-700 transition hover:bg-blue-100"
                >
                  Załóż konto
                </Link>
              </div>
            </div>
          )}
        </div>

        <div className="mt-6">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="h-32 animate-pulse rounded-3xl bg-slate-100"
                />
              ))}
            </div>
          ) : loadError ? (
            <div className="rounded-3xl border border-red-100 bg-red-50 p-5 text-center">
              <p className="font-black text-red-700">
                Nie udało się wyświetlić komentarzy
              </p>

              <p className="mt-2 text-sm text-red-600">{loadError}</p>

              <button
                type="button"
                onClick={() => void loadComments()}
                className="mt-4 rounded-2xl bg-red-600 px-5 py-3 text-sm font-black text-white transition hover:bg-red-700"
              >
                Spróbuj ponownie
              </button>
            </div>
          ) : comments.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
              <p className="text-lg font-black text-slate-800">
                Nie ma jeszcze komentarzy
              </p>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Dodaj pierwszy komentarz dotyczący tego łowiska.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {comments.map((comment) => (
                <article
                  key={comment.id}
                  className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-5"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-50 text-sm font-black text-blue-700">
                      {getInitials(comment.userName)}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="break-words font-black text-slate-950">
                              {comment.userName}
                            </h3>

                            {comment.isOwn && (
                              <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-black text-blue-700">
                                Twój komentarz
                              </span>
                            )}
                          </div>

                          <p className="mt-1 text-xs font-semibold text-slate-400">
                            {formatCommentDate(comment.createdAt)}
                          </p>
                        </div>

                        <div className="flex shrink-0 flex-wrap gap-2">
                          {viewer.isAdmin ? (
                            <button
                              type="button"
                              onClick={() => void handleAdminDelete(comment)}
                              disabled={deletingCommentId === comment.id}
                              className="rounded-xl bg-red-50 px-3 py-2 text-xs font-black text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {deletingCommentId === comment.id
                                ? "Usuwanie..."
                                : "Usuń jako admin"}
                            </button>
                          ) : viewer.isAuthenticated && !comment.isOwn ? (
                            <button
                              type="button"
                              onClick={() => openReportModal(comment)}
                              disabled={comment.isReportedByViewer}
                              className="rounded-xl bg-slate-100 px-3 py-2 text-xs font-black text-slate-600 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {comment.isReportedByViewer
                                ? "Zgłoszono"
                                : "Zgłoś komentarz"}
                            </button>
                          ) : null}
                        </div>
                      </div>

                      <p className="mt-4 whitespace-pre-wrap break-words text-sm leading-7 text-slate-600">
                        {comment.content}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {reportingComment && (
        <div
          className="fixed inset-0 z-[1300] flex items-center justify-center bg-slate-950/70 p-4"
          onClick={closeReportModal}
        >
          <div
            className="w-full max-w-xl rounded-3xl bg-white p-5 shadow-2xl sm:p-6"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.16em] text-red-600">
                  Moderacja
                </p>

                <h2 className="mt-2 text-2xl font-black text-slate-950">
                  Zgłoś komentarz
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Zgłoszenie zostanie przekazane administratorowi Rybio.
                </p>
              </div>

              <button
                type="button"
                onClick={closeReportModal}
                disabled={isReporting}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xl font-black text-slate-600 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
                aria-label="Zamknij"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleReportComment} className="mt-5 space-y-4">
              <label className="block">
                <span className="mb-2 block text-sm font-black text-slate-700">
                  Powód zgłoszenia
                </span>

                <select
                  value={reportReason}
                  onChange={(event) => setReportReason(event.target.value)}
                  disabled={isReporting}
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {REPORT_REASONS.map((reason) => (
                    <option key={reason.value} value={reason.value}>
                      {reason.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-black text-slate-700">
                  Dodatkowy opis
                </span>

                <textarea
                  value={reportDescription}
                  onChange={(event) =>
                    setReportDescription(event.target.value)
                  }
                  rows={4}
                  maxLength={MAX_REPORT_DESCRIPTION_LENGTH}
                  disabled={isReporting}
                  placeholder={
                    reportReason === "other"
                      ? "Opisz powód zgłoszenia — minimum 10 znaków."
                      : "Możesz dopisać dodatkowe informacje."
                  }
                  className="w-full resize-y rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 disabled:cursor-not-allowed disabled:opacity-60"
                />

                <p className="mt-2 text-xs font-semibold text-slate-400">
                  Maksymalnie {MAX_REPORT_DESCRIPTION_LENGTH} znaków. Aktualnie:{" "}
                  {reportDescription.length}
                </p>
              </label>

              <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeReportModal}
                  disabled={isReporting}
                  className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Anuluj
                </button>

                <button
                  type="submit"
                  disabled={!canSubmitReport}
                  className="rounded-2xl bg-red-600 px-5 py-3 text-sm font-black text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isReporting ? "Wysyłanie..." : "Wyślij zgłoszenie"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}