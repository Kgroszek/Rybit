import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { CatchModerationActions } from "@/components/dashboard/CatchModerationActions";

const BUCKET_NAME = "catch-images";

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("pl-PL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function formatWeight(weight: number | null) {
  if (weight === null) {
    return "Brak";
  }

  return `${weight.toFixed(2)} kg`;
}

function formatLength(length: number | null) {
  if (length === null) {
    return "Brak";
  }

  return `${length.toFixed(0)} cm`;
}

function getMethodLabel(method: string) {
  if (method === "spinning") return "Spinning";
  if (method === "feeder") return "Feeder";
  if (method === "method_feeder") {
    return "Method feeder";
  }
  if (method === "carp") return "Karpiówka";
  if (method === "float") return "Spławik";
  if (method === "fly") return "Muchówka";
  if (method === "other") return "Inna metoda";

  return method;
}

export async function PendingCatchModerationSection() {
  const supabase = await createClient();

  const pendingCatches =
    await prisma.fishingCatch.findMany({
      where: {
        isPublic: true,
        rankingStatus: "pending",
      },
      include: {
        lake: {
          select: {
            name: true,
            slug: true,
            city: true,
            voivodeship: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

  const catchesWithPreview = await Promise.all(
    pendingCatches.map(async (catchItem) => {
      let previewImageUrl = catchItem.imageUrl;

      if (catchItem.imagePath) {
        const { data } = await supabase.storage
          .from(BUCKET_NAME)
          .createSignedUrl(
            catchItem.imagePath,
            60 * 60
          );

        previewImageUrl =
          data?.signedUrl ?? catchItem.imageUrl;
      }

      return {
        ...catchItem,
        previewImageUrl,
      };
    })
  );

  return (
    <section className="space-y-5">
      <div className="rounded-3xl border border-amber-200 bg-amber-50 p-6 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.14em] text-amber-600">
              Moderacja rankingu
            </p>

            <h2 className="mt-2 text-2xl font-black text-slate-950">
              Połowy do zatwierdzenia
            </h2>

            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              Tutaj znajdują się publiczne połowy,
              które użytkownicy zgłosili do rankingów
              łowisk.
            </p>
          </div>

          <span className="w-fit rounded-full bg-white px-4 py-2 text-sm font-black text-amber-700 shadow-sm">
            {catchesWithPreview.length} oczekujących
          </span>
        </div>
      </div>

      {catchesWithPreview.length > 0 ? (
        <div className="space-y-5">
          {catchesWithPreview.map((catchItem) => (
            <article
              key={catchItem.id}
              className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
            >
              <div className="grid xl:grid-cols-[300px_1fr]">
                <div className="bg-slate-100">
                  {catchItem.previewImageUrl ? (
                    <a
                      href={catchItem.previewImageUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="block h-full"
                    >
                      <img
                        src={catchItem.previewImageUrl}
                        alt={`Połów: ${catchItem.fishName}`}
                        className="h-64 w-full object-cover transition duration-300 hover:scale-105 xl:h-full"
                      />
                    </a>
                  ) : (
                    <div className="flex h-64 items-center justify-center text-sm font-bold text-slate-400 xl:h-full">
                      Brak zdjęcia
                    </div>
                  )}
                </div>

                <div className="p-5 sm:p-6">
                  <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap gap-2">
                        <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-black text-amber-700">
                          Oczekuje na zatwierdzenie
                        </span>

                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600">
                          Dodano:{" "}
                          {formatDate(catchItem.createdAt)}
                        </span>
                      </div>

                      <h3 className="mt-3 break-words text-2xl font-black text-slate-950">
                        {catchItem.fishName}
                      </h3>

                      <p className="mt-1 break-words text-sm text-slate-500">
                        Użytkownik:{" "}
                        {catchItem.userName ||
                          catchItem.userId}
                      </p>
                    </div>

                    {catchItem.lake?.slug && (
                      <div className="flex flex-col gap-2 sm:flex-row">
                        <Link
                          href={`/lowiska/${catchItem.lake.slug}`}
                          className="rounded-2xl bg-slate-100 px-4 py-2 text-center text-sm font-bold text-slate-700 transition hover:bg-slate-200"
                        >
                          Łowisko w panelu
                        </Link>

                        <Link
                          href={`/lowiska-w-polsce/${catchItem.lake.slug}`}
                          className="rounded-2xl bg-blue-50 px-4 py-2 text-center text-sm font-bold text-blue-700 transition hover:bg-blue-100"
                        >
                          Podgląd publiczny
                        </Link>
                      </div>
                    )}
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <InfoTile
                      label="Waga"
                      value={formatWeight(
                        catchItem.weight
                      )}
                    />

                    <InfoTile
                      label="Długość"
                      value={formatLength(
                        catchItem.length
                      )}
                    />

                    <InfoTile
                      label="Metoda"
                      value={getMethodLabel(
                        catchItem.method
                      )}
                    />

                    <InfoTile
                      label="Przynęta"
                      value={catchItem.bait || "Brak"}
                    />
                  </div>

                  <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    <InfoTile
                      label="Łowisko"
                      value={
                        catchItem.lakeName ||
                        catchItem.lake?.name ||
                        "Brak"
                      }
                    />

                    <InfoTile
                      label="Miejscowość"
                      value={
                        catchItem.lake?.city || "Brak"
                      }
                    />

                    <InfoTile
                      label="Data połowu"
                      value={formatDate(
                        catchItem.caughtAt
                      )}
                    />
                  </div>

                  {catchItem.note && (
                    <div className="mt-4 rounded-2xl bg-slate-50 p-4">
                      <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">
                        Notatka użytkownika
                      </p>

                      <p className="mt-2 whitespace-pre-line break-words text-sm leading-6 text-slate-700">
                        {catchItem.note}
                      </p>
                    </div>
                  )}

                  <div className="mt-5 border-t border-slate-100 pt-5">
                    <CatchModerationActions
                      catchId={catchItem.id}
                      fishName={catchItem.fishName}
                    />
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="rounded-3xl border border-emerald-100 bg-emerald-50 p-8 text-center shadow-sm">
          <h3 className="text-xl font-black text-emerald-800">
            Brak połowów oczekujących
          </h3>

          <p className="mt-2 text-sm leading-6 text-emerald-700">
            Wszystkie połowy zgłoszone do rankingów
            zostały już zweryfikowane.
          </p>
        </div>
      )}
    </section>
  );
}

function InfoTile({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">
        {label}
      </p>

      <p className="mt-2 break-words text-sm font-bold text-slate-700">
        {value}
      </p>
    </div>
  );
}