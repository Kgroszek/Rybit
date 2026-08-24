import { Card } from "@/components/ui/Card";

export function ProfileProgressSkeleton() {
  return (
    <Card className="overflow-hidden">
      <div className="animate-pulse">
        <div className="border-b border-border px-5 py-5 sm:px-6 sm:py-6">
          <div className="h-3 w-36 rounded-full bg-surface-strong" />
          <div className="mt-3 h-7 w-72 max-w-full rounded-xl bg-surface-strong" />
          <div className="mt-3 h-4 w-[520px] max-w-full rounded-full bg-surface-strong" />

          <div className="mt-5 grid grid-cols-3 gap-1 rounded-control bg-surface-muted p-1">
            <SkeletonTab />
            <SkeletonTab />
            <SkeletonTab />
          </div>
        </div>

        <div className="px-5 py-5 sm:px-6 sm:py-6">
          <div className="h-11 w-[420px] max-w-full rounded-control bg-surface-strong" />

          <div className="mt-5 divide-y divide-border border-y border-border">
            <SkeletonRecord />
            <SkeletonRecord />
            <SkeletonRecord />
          </div>
        </div>
      </div>
    </Card>
  );
}

function SkeletonTab() {
  return (
    <div className="rounded-xl bg-surface px-3 py-2.5">
      <div className="mx-auto h-2.5 w-16 rounded-full bg-surface-strong" />
      <div className="mx-auto mt-2 h-5 w-8 rounded-lg bg-surface-strong" />
    </div>
  );
}

function SkeletonRecord() {
  return (
    <div className="grid gap-4 py-5 lg:grid-cols-[minmax(180px,.75fr)_minmax(0,1fr)_minmax(0,1fr)]">
      <div>
        <div className="h-2.5 w-16 rounded-full bg-surface-strong" />
        <div className="mt-3 h-5 w-28 rounded-lg bg-surface-strong" />
        <div className="mt-2 h-3 w-16 rounded-full bg-surface-strong" />
      </div>

      <div className="h-20 rounded-control bg-surface-muted" />
      <div className="h-20 rounded-control bg-surface-muted" />
    </div>
  );
}
