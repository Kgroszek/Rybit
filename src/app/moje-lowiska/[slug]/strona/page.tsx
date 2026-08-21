import {
  notFound,
  redirect,
} from "next/navigation";

import { LakeWebsiteBuilder } from "@/components/owner/LakeWebsiteBuilder";
import { getRootDomain } from "@/lib/lake-websites";
import {
  getEditableOwnerWebsiteContext,
} from "@/lib/owner/website-query";
import {
  buildOwnerWebsiteEditorData,
} from "@/lib/owner/website-view-model";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type OwnerLakeWebsitePageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function OwnerLakeWebsitePage({
  params,
}: OwnerLakeWebsitePageProps) {
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

  const {
    initialWebsite,
    lakeData,
  } =
    buildOwnerWebsiteEditorData(
      ownerLake.lake
    );

  return (
    <LakeWebsiteBuilder
      lakeSlug={
        ownerLake.lake.slug
      }
      lakeName={
        ownerLake.lake.name
      }
      rootDomain={getRootDomain()}
      initialWebsite={
        initialWebsite
      }
      lake={lakeData}
    />
  );
}
