import { notFound } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { LakeDetailsPage } from "@/components/dashboard/LakeDetailsPage";
import { getLakeBySlug } from "@/lib/lakes";
import { requireAdmin } from "@/lib/auth";

type LakePageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function LakePage({ params }: LakePageProps) {
  const { slug } = await params;

  const [lake, admin] = await Promise.all([
    getLakeBySlug(slug),
    requireAdmin(),
  ]);

  if (!lake) {
    notFound();
  }

  return (
    <DashboardLayout>
      <LakeDetailsPage lake={lake} isAdmin={Boolean(admin)} />
    </DashboardLayout>
  );
}