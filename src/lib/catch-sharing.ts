"server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import { getStorageAdminClient } from "@/lib/supabase/storage-admin";

export const CATCH_IMAGES_BUCKET = "catch-images";

export type CatchShareData = {
  id: string;
  userId: string;
  userName: string | null;
  fishName: string;
  weight: number | null;
  length: number | null;
  method: string;
  bait: string | null;
  caughtAt: Date;
  lakeId: string | null;
  lakeName: string | null;
  tripId: string | null;
  tripTitle: string | null;
  imageUrl: string | null;
  imagePath: string | null;
  note: string | null;
  isPublic: boolean;
  rankingStatus: string;
};

export function canExposeCatchPublicly(
  fishingCatch: Pick<CatchShareData, "isPublic" | "rankingStatus">
) {
  if (!fishingCatch.isPublic) {
    return false;
  }

  return !["hidden", "rejected"].includes(fishingCatch.rankingStatus);
}

export async function getCatchImageForSharing(
  fishingCatch: Pick<CatchShareData, "imagePath" | "imageUrl">,
  authenticatedClient?: SupabaseClient | null
) {
  if (fishingCatch.imagePath) {
    const adminClient = getStorageAdminClient();

    if (adminClient) {
      const { data, error } = await adminClient.storage
        .from(CATCH_IMAGES_BUCKET)
        .createSignedUrl(fishingCatch.imagePath, 10 * 60);

      if (!error && data?.signedUrl) {
        return data.signedUrl;
      }
    }

    if (authenticatedClient) {
      const { data, error } = await authenticatedClient.storage
        .from(CATCH_IMAGES_BUCKET)
        .createSignedUrl(fishingCatch.imagePath, 10 * 60);

      if (!error && data?.signedUrl) {
        return data.signedUrl;
      }
    }
  }

  return fishingCatch.imageUrl || null;
}

export function getMethodLabel(value: string) {
  if (value === "spinning") return "Spinning";
  if (value === "feeder") return "Feeder";
  if (value === "method_feeder") return "Method feeder";
  if (value === "carp") return "Karpiówka";
  if (value === "float") return "Spławik";
  if (value === "fly") return "Muchówka";
  if (value === "other") return "Inna metoda";

  return value || "Brak danych";
}

export function formatCatchDate(date: Date | string) {
  return new Intl.DateTimeFormat("pl-PL", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export function getSafeCatchFileName(
  fishName: string,
  format: "post" | "story"
) {
  const slug = fishName
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ł/g, "l")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return `rybio-${slug || "polow"}-${format}.png`;
}

export function getAppBaseUrl() {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") ||
    "https://rybio.pl"
  );
}
