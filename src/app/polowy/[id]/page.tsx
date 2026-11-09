import { notFound, redirect } from "next/navigation";

import { CatchDetailsView } from "@/components/catches/details/CatchDetailsView";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { getOwnedCatchDetails } from "@/lib/catch-details";
import { createClient } from "@/lib/supabase/server";

type CatchDetailsPageProps = {
  params: Promise<{ id: string }>;
};

export default async function CatchDetailsPage({ params }: CatchDetailsPageProps) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { id } = await params;
  const fishingCatch = await getOwnedCatchDetails(id, user.id, supabase);

  if (!fishingCatch) notFound();

  return (
    <DashboardLayout>
      <CatchDetailsView fishingCatch={fishingCatch} mode="authenticated" />
    </DashboardLayout>
  );
}
