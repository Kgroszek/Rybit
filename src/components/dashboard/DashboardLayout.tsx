import { redirect } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

type DashboardLayoutProps = {
  children: React.ReactNode;
};

export async function DashboardLayout({ children }: DashboardLayoutProps) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const isAdmin = user.email === process.env.ADMIN_EMAIL;

  const pendingSubmissionsCount = isAdmin
    ? await prisma.lakeSubmission.count({
        where: {
          status: "pending",
        },
      })
    : 0;

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <div className="flex min-h-screen">
        <Sidebar
          isAdmin={isAdmin}
          pendingSubmissionsCount={pendingSubmissionsCount}
        />

        <section className="flex-1 p-5 lg:p-8">{children}</section>
      </div>
    </main>
  );
}