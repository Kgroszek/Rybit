"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { BackpackIcon } from "@/components/icons/BackpackIcon";
import { HeartIcon } from "@/components/icons/HeartIcon";
import { MapIcon } from "@/components/icons/MapIcon";
import { PencilIcon } from "@/components/icons/PencilIcon";
import { StarIcon } from "@/components/icons/StarIcon";
import { Button, buttonClassName } from "@/components/ui/Button";
import { useToast } from "@/components/ui/ToastProvider";
import { cn } from "@/lib/cn";
import type { LakeDto } from "@/lib/lakes";
import type { LakeDetailsMode } from "./types";
import { formatRating, getNavigationUrl } from "./utils";

type LakeDetailsActionsProps = {
  lake: Pick<LakeDto, "id" | "slug" | "name" | "rating" | "lat" | "lng">;
  mode: LakeDetailsMode;
  isAdmin?: boolean;
};

type UserLakeData = {
  isFavourite?: boolean;
  userRating?: number;
};

type UpdateLakeResponse = UserLakeData & {
  message?: string;
  averageRating?: number | string;
};

export function LakeDetailsActions({
  lake,
  mode,
  isAdmin = false,
}: LakeDetailsActionsProps) {
  const router = useRouter();
  const toast = useToast();
  const [isFavourite, setIsFavourite] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [displayRating, setDisplayRating] = useState(lake.rating);
  const [isLoadingUserData, setIsLoadingUserData] = useState(mode === "authenticated");
  const [isFavouriteLoading, setIsFavouriteLoading] = useState(false);
  const [isRatingLoading, setIsRatingLoading] = useState(false);

  useEffect(() => {
    setDisplayRating(lake.rating);
  }, [lake.rating]);

  useEffect(() => {
    if (mode !== "authenticated") return;

    let active = true;

    async function loadUserData() {
      setIsLoadingUserData(true);

      try {
        const response = await fetch(`/api/lakes/${lake.slug}/user-data`, {
          cache: "no-store",
        });

        if (!response.ok) return;

        const data = (await response.json()) as UserLakeData;

        if (!active) return;
        setIsFavourite(Boolean(data.isFavourite));
        setUserRating(Number(data.userRating || 0));
      } catch {
        // Dane użytkownika nie blokują wyświetlenia profilu łowiska.
      } finally {
        if (active) setIsLoadingUserData(false);
      }
    }

    void loadUserData();

    return () => {
      active = false;
    };
  }, [lake.slug, mode]);

  async function handleFavouriteToggle() {
    if (mode !== "authenticated" || isFavouriteLoading || isLoadingUserData) return;

    const previousValue = isFavourite;
    setIsFavourite(!previousValue);
    setIsFavouriteLoading(true);

    try {
      const response = await fetch(`/api/lakes/${lake.slug}/favourite`, {
        method: "POST",
      });
      const data = await readJsonResponse(response);

      if (!response.ok) {
        setIsFavourite(previousValue);
        toast.error({
          title: "Nie udało się zmienić ulubionych.",
          description: data.message || "Spróbuj ponownie za chwilę.",
        });
        return;
      }

      const nextValue = Boolean(data.isFavourite);
      setIsFavourite(nextValue);
      toast.success(nextValue ? "Dodano do ulubionych." : "Usunięto z ulubionych.");
    } catch {
      setIsFavourite(previousValue);
      toast.error("Nie udało się połączyć z serwerem.");
    } finally {
      setIsFavouriteLoading(false);
    }
  }

  async function handleRatingChange(value: number) {
    if (mode !== "authenticated" || isRatingLoading || isLoadingUserData) return;

    const previousRating = userRating;
    setUserRating(value);
    setIsRatingLoading(true);

    try {
      const response = await fetch(`/api/lakes/${lake.slug}/rating`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ value }),
      });
      const data = await readJsonResponse(response);

      if (!response.ok) {
        setUserRating(previousRating);
        toast.error({
          title: "Nie udało się zapisać oceny.",
          description: data.message || "Spróbuj ponownie za chwilę.",
        });
        return;
      }

      setUserRating(Number(data.userRating || value));
      if (data.averageRating !== undefined) {
        setDisplayRating(String(data.averageRating));
      }
      toast.success(`Twoja ocena: ${value}/5.`);
      router.refresh();
    } catch {
      setUserRating(previousRating);
      toast.error("Nie udało się połączyć z serwerem.");
    } finally {
      setIsRatingLoading(false);
    }
  }

  return (
    <div className="mt-5 grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
      <div className="flex flex-wrap gap-2">
        {mode === "authenticated" ? (
          <Button
            variant={isFavourite ? "secondary" : "outline"}
            size="md"
            onClick={handleFavouriteToggle}
            disabled={isLoadingUserData || isFavouriteLoading}
          >
            <HeartIcon
              className={cn("h-4 w-4", isFavourite ? "text-primary" : "text-text-muted")}
            />
            {isFavourite ? "Zapisane" : "Zapisz"}
          </Button>
        ) : (
          <Link
            href="/login"
            className={buttonClassName({ variant: "outline", size: "md" })}
          >
            <HeartIcon className="h-4 w-4 text-text-muted" />
            Zapisz
          </Link>
        )}

        <a
          href={getNavigationUrl(lake.lat, lake.lng)}
          target="_blank"
          rel="noopener noreferrer"
          className={buttonClassName({ variant: "outline", size: "md" })}
        >
          <MapIcon className="h-4 w-4" />
          Prowadź
        </a>

        {mode === "authenticated" ? (
          <Link
            href={`/wyprawy?lakeId=${lake.id}&lakeName=${encodeURIComponent(lake.name)}`}
            className={buttonClassName({ variant: "primary", size: "md" })}
          >
            <BackpackIcon className="h-4 w-4" />
            Zaplanuj wyprawę
          </Link>
        ) : (
          <Link
            href="/login"
            className={buttonClassName({ variant: "primary", size: "md" })}
          >
            <BackpackIcon className="h-4 w-4" />
            Zaplanuj wyprawę
          </Link>
        )}

        {isAdmin && (
          <Link
            href={`/admin/lowiska/${lake.slug}/edytuj`}
            className={buttonClassName({ variant: "dark", size: "md" })}
          >
            <PencilIcon className="h-4 w-4" />
            Edytuj
          </Link>
        )}
      </div>

      <div className="rounded-control border border-border bg-surface px-4 py-3 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold text-text-muted">Ocena łowiska</p>
            <p className="mt-0.5 font-display text-lg font-bold text-text">
              {formatRating(displayRating)} / 5
            </p>
          </div>
          <StarIcon className="h-5 w-5 text-warning" />
        </div>

        {mode === "authenticated" ? (
          <div className="mt-3 border-t border-border pt-3">
            <p className="mb-2 text-xs font-semibold text-text-secondary">Twoja ocena</p>
            <div className="flex items-center gap-1" onMouseLeave={() => setHoveredRating(0)}>
              {[1, 2, 3, 4, 5].map((star) => {
                const active = star <= (hoveredRating || userRating);
                return (
                  <button
                    key={star}
                    type="button"
                    onClick={() => handleRatingChange(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    disabled={isRatingLoading || isLoadingUserData}
                    className="rounded-lg p-1 transition hover:bg-warning-subtle disabled:cursor-not-allowed disabled:opacity-50"
                    aria-label={`Oceń łowisko na ${star} z 5`}
                  >
                    <StarIcon
                      className={cn(
                        "h-5 w-5 transition-colors",
                        active ? "text-warning" : "text-border-strong"
                      )}
                    />
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <Link
            href="/login"
            className="mt-3 block border-t border-border pt-3 text-xs font-bold text-primary hover:text-primary-hover"
          >
            Zaloguj się, aby ocenić
          </Link>
        )}
      </div>
    </div>
  );
}

async function readJsonResponse(response: Response): Promise<UpdateLakeResponse> {
  try {
    return (await response.json()) as UpdateLakeResponse;
  } catch {
    return {};
  }
}
