import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { AccountSettingsForm } from "@/components/dashboard/AccountSettingsForm";
import { createClient } from "@/lib/supabase/server";

export default async function SettingsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const userName =
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    "";

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-950">
          Ustawienia
        </h1>

        <p className="mt-2 max-w-3xl text-slate-500">
          Zarządzaj podstawowymi danymi konta, adresem e-mail oraz hasłem.
        </p>
      </div>

      <AccountSettingsForm
        initialName={userName}
        initialEmail={user.email || ""}
      />
    </DashboardLayout>
  );
}