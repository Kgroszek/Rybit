"use client";

import {
  useCallback,
  useMemo,
  useState,
} from "react";

import { useToast } from "@/components/ui/ToastProvider";
import type { LakeExplorerMode } from "@/lib/lake-explorer-types";

export function useLakeFavourites({
  mode,
  initialFavouriteLakeIds = [],
}: {
  mode: LakeExplorerMode;
  initialFavouriteLakeIds?: string[];
}) {
  const toast = useToast();

  const [
    favouriteLakeIds,
    setFavouriteLakeIds,
  ] = useState<Set<string>>(
    () =>
      new Set(
        initialFavouriteLakeIds
      )
  );

  const [
    pendingLakeIds,
    setPendingLakeIds,
  ] = useState<Set<string>>(
    () => new Set()
  );

  const toggleFavourite =
    useCallback(
      async ({
        lakeId,
        slug,
      }: {
        lakeId: string;
        slug: string;
      }) => {
        if (
          mode !== "authenticated" ||
          pendingLakeIds.has(lakeId)
        ) {
          return;
        }

        const wasFavourite =
          favouriteLakeIds.has(lakeId);

        setFavouriteLakeIds(
          (current) => {
            const next = new Set(
              current
            );

            if (wasFavourite) {
              next.delete(lakeId);
            } else {
              next.add(lakeId);
            }

            return next;
          }
        );

        setPendingLakeIds(
          (current) => {
            const next = new Set(
              current
            );
            next.add(lakeId);
            return next;
          }
        );

        try {
          const response = await fetch(
            `/api/lakes/${encodeURIComponent(
              slug
            )}/favourite`,
            {
              method: "POST",
            }
          );

          const data =
            (await response
              .json()
              .catch(() => null)) as
              | {
                  isFavourite?: boolean;
                  message?: string;
                }
              | null;

          if (
            !response.ok ||
            typeof data?.isFavourite !==
              "boolean"
          ) {
            throw new Error(
              data?.message ||
                "Nie udało się zmienić ulubionych."
            );
          }

          setFavouriteLakeIds(
            (current) => {
              const next = new Set(
                current
              );

              if (data.isFavourite) {
                next.add(lakeId);
              } else {
                next.delete(lakeId);
              }

              return next;
            }
          );

          toast.success(
            data.message ||
              (data.isFavourite
                ? "Dodano do ulubionych."
                : "Usunięto z ulubionych.")
          );
        } catch (error) {
          setFavouriteLakeIds(
            (current) => {
              const next = new Set(
                current
              );

              if (wasFavourite) {
                next.add(lakeId);
              } else {
                next.delete(lakeId);
              }

              return next;
            }
          );

          toast.error({
            title:
              "Nie udało się zaktualizować ulubionych",
            description:
              error instanceof Error
                ? error.message
                : undefined,
          });
        } finally {
          setPendingLakeIds(
            (current) => {
              const next = new Set(
                current
              );
              next.delete(lakeId);
              return next;
            }
          );
        }
      },
      [
        favouriteLakeIds,
        mode,
        pendingLakeIds,
        toast,
      ]
    );

  return useMemo(
    () => ({
      favouriteLakeIds,
      pendingLakeIds,
      toggleFavourite,
    }),
    [
      favouriteLakeIds,
      pendingLakeIds,
      toggleFavourite,
    ]
  );
}
