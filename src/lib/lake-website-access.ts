import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export async function getOwnerLakeWebsiteAccess(slug: string) {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return {
      user: null,
      ownerLake: null,
    };
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
          images: {
            orderBy: [
              { sortOrder: "asc" },
              { createdAt: "asc" },
            ],
          },
        },
      },
    },
  });

  return {
    user,
    ownerLake,
  };
}
