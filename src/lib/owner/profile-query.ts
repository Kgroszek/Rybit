import { prisma } from "@/lib/prisma";

export async function getOwnerLakeProfileContext(
  userId: string,
  slug: string
) {
  return prisma.lakeOwner.findFirst({
    where: {
      userId,
      isActive: true,
      lake: {
        slug,
      },
    },
    include: {
      lake: {
        include: {
          fishSpecies: {
            orderBy: {
              name: "asc",
            },
          },
          priceList: {
            orderBy: {
              id: "asc",
            },
          },
          rules: {
            orderBy: {
              id: "asc",
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
              imagePath: true,
              sortOrder: true,
              createdAt: true,
            },
          },
        },
      },
    },
  });
}

export async function getOwnerLakeImagesContext(
  userId: string,
  slug: string
) {
  return prisma.lakeOwner.findFirst({
    where: {
      userId,
      isActive: true,
      lake: {
        slug,
      },
    },
    include: {
      lake: {
        select: {
          id: true,
          name: true,
          slug: true,
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
              imagePath: true,
              sortOrder: true,
              createdAt: true,
            },
          },
        },
      },
    },
  });
}
