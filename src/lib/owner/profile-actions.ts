"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  AMENITY_FIELDS,
} from "@/components/owner/profile/types";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

const OWNER_TYPES = new Set([
  "pzw",
  "commercial",
]);

const FISHING_TYPES = new Set([
  "general",
  "spinning",
  "carp",
]);

export async function updateOwnerLakeProfile(
  formData: FormData
) {
  const lakeId = getString(
    formData,
    "lakeId"
  );
  const requestedSlug = getString(
    formData,
    "slug"
  );

  if (!lakeId || !requestedSlug) {
    redirect("/moje-lowiska");
  }

  const fallbackReturnPath =
    `/moje-lowiska/${requestedSlug}/edytuj`;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const ownerLake =
    await prisma.lakeOwner.findFirst({
      where: {
        lakeId,
        userId: user.id,
        isActive: true,
        canEditLake: true,
      },
      include: {
        lake: {
          select: {
            id: true,
            slug: true,
          },
        },
      },
    });

  if (!ownerLake) {
    redirect("/moje-lowiska");
  }

  const returnPath =
    `/moje-lowiska/${ownerLake.lake.slug}/edytuj`;

  const name = getString(formData, "name");
  const description = getString(
    formData,
    "description"
  );
  const fish = getString(formData, "fish");
  const street = getString(
    formData,
    "street"
  );
  const city = getString(formData, "city");
  const postalCode = getString(
    formData,
    "postalCode"
  );
  const voivodeship = getString(
    formData,
    "voivodeship"
  );

  if (
    !name ||
    !description ||
    !fish ||
    !street ||
    !city ||
    !postalCode ||
    !voivodeship
  ) {
    redirect(`${returnPath}?error=required`);
  }

  if (
    name.length > 160 ||
    description.length > 10000 ||
    fish.length > 1200
  ) {
    redirect(`${returnPath}?error=length`);
  }

  const lat = parseCoordinate(
    getString(formData, "lat")
  );
  const lng = parseCoordinate(
    getString(formData, "lng")
  );

  if (lat === null || lng === null) {
    redirect(`${returnPath}?error=coords`);
  }

  if (
    lat < -90 ||
    lat > 90 ||
    lng < -180 ||
    lng > 180
  ) {
    redirect(
      `${returnPath}?error=coords-range`
    );
  }

  const contactEmail = getString(
    formData,
    "contactEmail"
  );

  if (
    contactEmail &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
      contactEmail
    )
  ) {
    redirect(`${returnPath}?error=email`);
  }

  const ownerTypeRaw = getString(
    formData,
    "ownerType"
  );
  const fishingTypeRaw = getString(
    formData,
    "fishingType"
  );

  const ownerType = OWNER_TYPES.has(
    ownerTypeRaw
  )
    ? ownerTypeRaw
    : "pzw";

  const fishingType = FISHING_TYPES.has(
    fishingTypeRaw
  )
    ? fishingTypeRaw
    : "general";

  const priceListText = getString(
    formData,
    "priceListText"
  );
  const rulesText = getString(
    formData,
    "rulesText"
  );

  const priceListItems =
    uniqueStrings(
      splitLines(priceListText)
    );
  const rulesItems = uniqueStrings(
    splitLines(rulesText)
  );
  const fishItems = uniqueStrings(
    splitFishNames(fish)
  );

  const amenities = Object.fromEntries(
    AMENITY_FIELDS.map((field) => [
      field.name,
      getCheckbox(
        formData,
        field.name
      ),
    ])
  ) as Record<
    (typeof AMENITY_FIELDS)[number]["name"],
    boolean
  >;

  await prisma.lake.update({
    where: {
      id: ownerLake.lake.id,
    },
    data: {
      name,
      description,
      ownerType,
      fishingType,
      fish,
      lat,
      lng,
      street,
      city,
      postalCode,
      voivodeship,

      area:
        getString(formData, "area") ||
        "Brak danych",
      averageDepth:
        getString(
          formData,
          "averageDepth"
        ) || "Brak danych",
      bottomType:
        getString(
          formData,
          "bottomType"
        ) || "Brak danych",
      waterType:
        getString(
          formData,
          "waterType"
        ) || "Brak danych",

      priceListText:
        priceListText || null,
      priceListUrl:
        getString(
          formData,
          "priceListUrl"
        ) || null,
      rulesText: rulesText || null,
      rulesUrl:
        getString(
          formData,
          "rulesUrl"
        ) || null,

      ...amenities,

      contactName:
        getString(
          formData,
          "contactName"
        ) || "Brak danych",
      contactPhone:
        getString(
          formData,
          "contactPhone"
        ) || "Brak danych",
      contactEmail:
        contactEmail || "Brak danych",
      contactWebsite:
        getString(
          formData,
          "contactWebsite"
        ) || "Brak danych",

      fishSpecies: {
        deleteMany: {},
        create: fishItems.map(
          (fishName) => ({
            name: fishName,
          })
        ),
      },

      priceList: {
        deleteMany: {},
        create:
          priceListItems.length > 0
            ? priceListItems.map(
                (text) => ({
                  text,
                })
              )
            : [
                {
                  text: "Brak dodanego cennika.",
                },
              ],
      },

      rules: {
        deleteMany: {},
        create:
          rulesItems.length > 0
            ? rulesItems.map(
                (text) => ({
                  text,
                })
              )
            : [
                {
                  text: "Brak dodanych zasad łowiska.",
                },
              ],
      },
    },
  });

  revalidateOwnerProfilePaths(
    ownerLake.lake.slug
  );

  redirect(`${returnPath}?saved=1`);
}

function revalidateOwnerProfilePaths(
  slug: string
) {
  revalidatePath("/moje-lowiska");
  revalidatePath(
    `/moje-lowiska/${slug}`
  );
  revalidatePath(
    `/moje-lowiska/${slug}/edytuj`
  );
  revalidatePath(
    `/moje-lowiska/${slug}/zdjecia`
  );
  revalidatePath(
    `/lowiska-w-polsce/${slug}`
  );
  revalidatePath("/lowiska-w-polsce");
}

function parseCoordinate(value: string) {
  if (!value) {
    return null;
  }

  const parsed = Number(
    value.replace(",", ".")
  );

  return Number.isFinite(parsed)
    ? parsed
    : null;
}

function getString(
  formData: FormData,
  key: string
) {
  return String(
    formData.get(key) || ""
  ).trim();
}

function getCheckbox(
  formData: FormData,
  key: string
) {
  return formData.get(key) === "on";
}

function splitLines(value: string) {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

function splitFishNames(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function uniqueStrings(
  values: string[]
) {
  const seen = new Set<string>();

  return values.filter((value) => {
    const key =
      value.toLocaleLowerCase("pl-PL");

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}
