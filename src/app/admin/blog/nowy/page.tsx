import {
  redirect,
} from "next/navigation";

import {
  BlogPostEditor,
} from "@/components/admin/blog/BlogPostEditor";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { isAdminUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export const dynamic =
  "force-dynamic";

export default async function NewBlogPostPage() {
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

  return (
    <DashboardLayout>
      <BlogPostEditor
        initialPost={null}
      />
    </DashboardLayout>
  );
}
