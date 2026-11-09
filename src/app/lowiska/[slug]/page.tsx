import { notFound } from "next/navigation";

import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { LakeDetailsPage } from "@/components/dashboard/LakeDetailsPage";
import { requireAdmin } from "@/lib/auth";
import { getLakeBySlug } from "@/lib/lakes";
import { getNearbyLakesForDetails } from "@/lib/lake-details";

type LakePageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function LakePage({ params }: LakePageProps) {
  const { slug } = await params;

  const [lake, recommendedLakes, admin] = await Promise.all([
    getLakeBySlug(slug),
    getNearbyLakesForDetails(slug, 3),
    requireAdmin(),
  ]);

  if (!lake) {
    notFound();
  }

  return (
    <DashboardLayout>
      <LakeDetailsPage
        lake={lake}
        recommendedLakes={recommendedLakes}
        isAdmin={Boolean(admin)}
      />
    </DashboardLayout>
  );
}
