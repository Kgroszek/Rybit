import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { LakeSubmissionForm } from "@/components/dashboard/LakeSubmissionForm";

export default function SubmitLakePage() {
  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-950">
          Zgłoś nowe łowisko
        </h1>

        <p className="mt-2 max-w-3xl text-slate-500">
          Wypełnij formularz, a zgłoszenie trafi do weryfikacji. Łowisko pojawi
          się na mapie dopiero po akceptacji administratora.
        </p>
      </div>

      <LakeSubmissionForm />
    </DashboardLayout>
  );
}