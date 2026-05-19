import { redirect } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { MobileBottomNav } from "./MobileBottomNav";

type DashboardLayoutProps = {
  children: React.ReactNode;
};

function getAdminEmails() {
  const singleAdminEmail = process.env.ADMIN_EMAIL ?? "";
  const multipleAdminEmails = process.env.ADMIN_EMAILS ?? "";

  return [singleAdminEmail, multipleAdminEmails]
    .join(",")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

function isAdminUser(user: {
  email?: string;
  app_metadata?: {
    role?: string;
  };
  user_metadata?: {
    role?: string;
  };
}) {
  const adminEmails = getAdminEmails();
  const userEmail = user.email?.trim().toLowerCase() ?? "";

  return (
    user.app_metadata?.role === "admin" ||
    user.user_metadata?.role === "admin" ||
    adminEmails.includes(userEmail)
  );
}

export async function DashboardLayout({ children }: DashboardLayoutProps) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const isAdmin = isAdminUser(user);

  const [
    pendingSubmissionsCount,
    pendingCorrectionsCount,
    pendingCatchReportsCount,
  ] = isAdmin
    ? await Promise.all([
        prisma.lakeSubmission.count({
          where: {
            status: "pending",
          },
        }),

        prisma.lakeCorrectionReport.count({
          where: {
            status: "pending",
          },
        }),

        prisma.fishingCatchReport.count({
          where: {
            status: "pending",
          },
        }),
      ])
    : [0, 0, 0];

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <div className="flex min-h-screen">
        <Sidebar
          isAdmin={isAdmin}
          pendingSubmissionsCount={pendingSubmissionsCount}
          pendingCorrectionsCount={pendingCorrectionsCount}
          pendingCatchReportsCount={pendingCatchReportsCount}
        />

        <section className="min-w-0 flex-1 px-4 pb-24 pt-4 sm:px-5 lg:p-8">
          {children}
        </section>
      </div>

      <MobileBottomNav />
    </main>
  );
}