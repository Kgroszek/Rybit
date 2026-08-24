import {
  DashboardLayout,
} from "@/components/dashboard/DashboardLayout";
import {
  LakeSubmissionForm,
} from "@/components/dashboard/LakeSubmissionForm";
import {
  PageHeader,
} from "@/components/ui/PageHeader";

export default function SubmitLakePage() {
  return (
    <DashboardLayout>
      <div className="space-y-8 pb-8 lg:space-y-9">
        <PageHeader
          eyebrow="Baza łowisk"
          title="Zgłoś nowe łowisko"
          description="Pomóż rozwijać bazę Rybio. Uzupełnij najważniejsze informacje, a zgłoszenie zostanie sprawdzone przed publikacją."
        />

        <LakeSubmissionForm />
      </div>
    </DashboardLayout>
  );
}
