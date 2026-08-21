import { prisma } from "@/lib/prisma";

export async function getEditableOwnerWebsiteContext(
  userId: string,
  slug: string
) {
  return prisma.lakeOwner.findFirst({
    where: {
      userId,
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
            select: {
              id: true,
              text: true,
            },
          },
          rules: {
            select: {
              id: true,
              text: true,
            },
          },
          fishSpecies: {
            select: {
              id: true,
              name: true,
            },
          },
          images: {
            orderBy: [
              {
                sortOrder: "asc",
              },
              {
                createdAt: "asc",
              },
            ],
            select: {
              id: true,
              url: true,
            },
          },
        },
      },
    },
  });
}
