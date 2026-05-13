import { notFound } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { LakeDetailsPage } from "@/components/dashboard/LakeDetailsPage";
import { getLakeBySlug } from "@/lib/lakes";

type LakePageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function LakePage({ params }: LakePageProps) {
  const { slug } = await params;

  const lake = await getLakeBySlug(slug);

  if (!lake) {
    notFound();
  }

  return (
    <DashboardLayout>
      <LakeDetailsPage lake={lake} />
    </DashboardLayout>
  );
}