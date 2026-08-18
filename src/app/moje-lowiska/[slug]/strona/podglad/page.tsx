import { notFound, redirect } from "next/navigation";

import type { PublicLakeWebsiteData } from "@/components/lake-websites/LakeWebsiteRenderer";
import { LakeWebsiteBuilderPreviewFrame } from "@/components/owner/LakeWebsiteBuilderPreviewFrame";
import {
  parseLakeWebsiteSections,
} from "@/lib/lake-website-sections";
import { normalizeLakeWebsiteSubdomain } from "@/lib/lake-websites";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type PreviewPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function LakeWebsitePreviewPage({
  params,
}: PreviewPageProps) {
  const { slug } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
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
    include: {
      lake: {
        include: {
          website: true,
          priceList: {
            select: { id: true, text: true },
          },
          rules: {
            select: { id: true, text: true },
          },
          fishSpecies: {
            select: { id: true, name: true },
          },
          images: {
            orderBy: [
              { sortOrder: "asc" },
              { createdAt: "asc" },
            ],
            select: { id: true, url: true },
          },
        },
      },
    },
  });

  if (!ownerLake) {
    notFound();
  }

  const lake = ownerLake.lake;
  const website = lake.website;
  const imageUrls = lake.images.map((image) => image.url);

  const data: PublicLakeWebsiteData = {
    website: {
      subdomain:
        website?.subdomain ||
        normalizeLakeWebsiteSubdomain(lake.name),
      templateKey: website?.templateKey || "modern",
      siteName: website?.siteName || lake.name,
      logoUrl: website?.logoUrl || null,
      primaryColor: website?.primaryColor || "#2563EB",
      accentColor: website?.accentColor || "#0EA5E9",
      backgroundColor: website?.backgroundColor || "#FFFFFF",
      textColor: website?.textColor || "#0F172A",
      contactPhone: website?.contactPhone || null,
      contactEmail: website?.contactEmail || null,
      contactWebsite: website?.contactWebsite || null,
      sections: parseLakeWebsiteSections(website?.sections, {
        lakeName: lake.name,
        description: lake.description,
        images: imageUrls,
      }),
    },
    lake: {
      name: lake.name,
      slug: lake.slug,
      description: lake.description,
      city: lake.city,
      street: lake.street,
      postalCode: lake.postalCode,
      voivodeship: lake.voivodeship,
      fish: lake.fish,
      contactPhone: lake.contactPhone,
      contactEmail: lake.contactEmail,
      contactWebsite: lake.contactWebsite,
      priceList: lake.priceList,
      rules: lake.rules,
      fishSpecies: lake.fishSpecies,
      images: lake.images,
    },
  };

  return <LakeWebsiteBuilderPreviewFrame initialData={data} />;
}
