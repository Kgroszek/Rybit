import {
  notFound,
  redirect,
} from "next/navigation";

import { LakeWebsiteBuilderPreviewFrame } from "@/components/owner/LakeWebsiteBuilderPreviewFrame";
import {
  getEditableOwnerWebsiteContext,
} from "@/lib/owner/website-query";
import {
  buildSavedWebsitePreviewData,
} from "@/lib/owner/website-view-model";
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

  const supabase =
    await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const ownerLake =
    await getEditableOwnerWebsiteContext(
      user.id,
      slug
    );

  if (!ownerLake) {
    notFound();
  }

  return (
    <LakeWebsiteBuilderPreviewFrame
      initialData={buildSavedWebsitePreviewData(
        ownerLake.lake
      )}
    />
  );
}
