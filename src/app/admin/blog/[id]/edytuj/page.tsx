import {
  notFound,
  redirect,
} from "next/navigation";

import {
  BlogPostEditor,
} from "@/components/admin/blog/BlogPostEditor";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { isAdminUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export const dynamic =
  "force-dynamic";

type EditBlogPostPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditBlogPostPage({
  params,
}: EditBlogPostPageProps) {
  const { id } =
    await params;

  const supabase =
    await createClient();

  const {
    data: { user },
  } =
    await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  if (!isAdminUser(user)) {
    redirect("/dashboard");
  }

  const post =
    await prisma.blogPost.findUnique(
      {
        where: {
          id,
        },
        select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          category: true,
          tags: true,
          coverImageUrl:
            true,
          content: true,
          status: true,
          isFeatured: true,
          seoTitle: true,
          seoDescription:
            true,
          authorName: true,
          publishedAt: true,
        },
      }
    );

  if (!post) {
    notFound();
  }

  return (
    <DashboardLayout>
      <BlogPostEditor
        initialPost={{
          ...post,
          publishedAt:
            post.publishedAt?.toISOString() ??
            null,
        }}
      />
    </DashboardLayout>
  );
}
