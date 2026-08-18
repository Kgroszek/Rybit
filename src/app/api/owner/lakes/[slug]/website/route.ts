import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";

import {
  normalizeLakeWebsiteSections,
} from "@/lib/lake-website-sections";
import {
  isLakeWebsiteTemplate,
  normalizeHexColor,
  normalizeLakeWebsiteSubdomain,
  validateLakeWebsiteSubdomain,
} from "@/lib/lake-websites";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

type RouteProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function PUT(
  request: Request,
  { params }: RouteProps
) {
  const { slug } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { message: "Musisz być zalogowany." },
      { status: 401 }
    );
  }

  const ownerLake = await prisma.lakeOwner.findFirst({
    where: {
      userId: user.id,
      isActive: true,
      canEditLake: true,
      lake: {
        slug,
      },
    },
    select: {
      lakeId: true,
    },
  });

  if (!ownerLake) {
    return NextResponse.json(
      { message: "Nie masz uprawnień do edycji tego łowiska." },
      { status: 403 }
    );
  }

  const body = (await request.json().catch(() => null)) as
    | Record<string, unknown>
    | null;

  if (!body) {
    return NextResponse.json(
      { message: "Nieprawidłowe dane strony." },
      { status: 400 }
    );
  }

  const subdomain = normalizeLakeWebsiteSubdomain(
    String(body.subdomain ?? "")
  );
  const subdomainError =
    validateLakeWebsiteSubdomain(subdomain);

  if (subdomainError) {
    return NextResponse.json(
      { message: subdomainError },
      { status: 400 }
    );
  }

  const rawTemplateKey = String(body.templateKey ?? "modern");
  const templateKey = isLakeWebsiteTemplate(rawTemplateKey)
    ? rawTemplateKey
    : "modern";

  const sections = normalizeLakeWebsiteSections(body.sections);

  if (sections.length === 0) {
    return NextResponse.json(
      { message: "Strona musi zawierać co najmniej jedną sekcję." },
      { status: 400 }
    );
  }

  const status =
    body.status === "published" ? "published" : "draft";

  const hero = sections.find((section) => section.type === "hero");
  const about = sections.find((section) => section.type === "about");
  const gallery = sections.find(
    (section) => section.type === "gallery"
  );

  const data = {
    subdomain,
    templateKey,
    siteName: cleanText(body.siteName, 120),
    logoUrl: cleanUrl(body.logoUrl),
    primaryColor: normalizeHexColor(body.primaryColor, "#2563EB"),
    accentColor: normalizeHexColor(body.accentColor, "#0EA5E9"),
    backgroundColor: normalizeHexColor(
      body.backgroundColor,
      "#FFFFFF"
    ),
    textColor: normalizeHexColor(body.textColor, "#0F172A"),
    contactPhone: cleanText(body.contactPhone, 80),
    contactEmail: cleanText(body.contactEmail, 160),
    contactWebsite: cleanUrl(body.contactWebsite),
    seoTitle: cleanText(body.seoTitle, 180),
    seoDescription: cleanText(body.seoDescription, 320),
    sections: sections as unknown as Prisma.InputJsonValue,

    // Pola V1 zostają aktualizowane dla zgodności wstecznej.
    heroTitle: cleanText(hero?.title, 180),
    heroSubtitle: cleanText(hero?.subtitle, 500),
    heroImageUrl: cleanUrl(hero?.imageUrl),
    aboutTitle: cleanText(about?.title, 120),
    aboutText: cleanText(about?.text, 8000),
    galleryUrls: (gallery?.images || []).slice(0, 20),
    showAbout: sections.some((section) => section.type === "about"),
    showFish: sections.some((section) => section.type === "fish"),
    showGallery: sections.some((section) => section.type === "gallery"),
    showPriceList: sections.some(
      (section) => section.type === "priceList"
    ),
    showRules: sections.some((section) => section.type === "rules"),
    showContact: sections.some(
      (section) => section.type === "contact"
    ),
    status,
  };

  try {
    const website = await prisma.lakeWebsite.upsert({
      where: {
        lakeId: ownerLake.lakeId,
      },
      create: {
        lakeId: ownerLake.lakeId,
        ...data,
        publishedAt: status === "published" ? new Date() : null,
      },
      update: {
        ...data,
        publishedAt:
          status === "published"
            ? {
                set: new Date(),
              }
            : {
                set: null,
              },
      },
    });

    return NextResponse.json({
      id: website.id,
      subdomain: website.subdomain,
      status: website.status,
      message:
        status === "published"
          ? "Strona została opublikowana."
          : "Zmiany zostały zapisane.",
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        {
          message:
            "Ten adres jest już zajęty przez inne łowisko. Wybierz inną subdomenę.",
        },
        { status: 409 }
      );
    }

    console.error("[owner/website/PUT]", error);

    return NextResponse.json(
      { message: "Nie udało się zapisać strony." },
      { status: 500 }
    );
  }
}

function cleanText(value: unknown, maxLength: number) {
  if (typeof value !== "string") {
    return null;
  }

  const clean = value.trim().slice(0, maxLength);
  return clean || null;
}

function cleanUrl(value: unknown) {
  if (typeof value !== "string") {
    return null;
  }

  const clean = value.trim();

  if (!clean) {
    return null;
  }

  if (
    clean.startsWith("https://") ||
    clean.startsWith("http://") ||
    clean.startsWith("/")
  ) {
    return clean.slice(0, 1400);
  }

  return null;
}
