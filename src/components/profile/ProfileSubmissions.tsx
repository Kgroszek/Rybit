import { ProfileEmptyState } from "@/components/profile/ProfileEmptyState";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import type { ProfileSubmission } from "@/lib/profile/profile-types";
import {
  formatProfileShortDate,
  getProfileOwnerTypeLabel,
  getProfileSubmissionStatus,
} from "@/lib/profile/profile-utils";

export function ProfileSubmissions({
  submissions,
  totalCount,
}: {
  submissions: ProfileSubmission[];
  totalCount: number;
}) {
  return (
    <section>
      <Card className="overflow-hidden">
        <CardHeader className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-primary">
              Twoja aktywność w Rybio
            </p>

            <CardTitle className="text-xl sm:text-2xl">
              Moje zgłoszenia łowisk
            </CardTitle>

            <CardDescription>
              Sprawdź status ostatnio przesłanych propozycji i odpowiedzi administratora.
            </CardDescription>
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <Badge variant="neutral" size="md">
              {totalCount} zgłoszeń
            </Badge>

            <ButtonLink href="/lowiska/zglos" size="sm">
              Zgłoś łowisko
            </ButtonLink>
          </div>
        </CardHeader>

        <CardContent className="py-0">
          {submissions.length > 0 ? (
            <>
              <div className="hidden grid-cols-[minmax(0,1fr)_160px_170px_130px] border-b border-border py-3 text-[10px] font-black uppercase tracking-[0.12em] text-text-muted md:grid">
                <span>Łowisko</span>
                <span>Rodzaj</span>
                <span>Status</span>
                <span>Data</span>
              </div>

              <div className="hidden divide-y divide-border md:block">
                {submissions.map((submission) => {
                  const status = getProfileSubmissionStatus(submission.status);

                  return (
                    <div
                      key={submission.id}
                      className="grid grid-cols-[minmax(0,1fr)_160px_170px_130px] items-start gap-0 py-4"
                    >
                      <div className="min-w-0 pr-5">
                        <p className="truncate text-sm font-extrabold text-text">
                          {submission.name}
                        </p>

                        <p className="mt-1 truncate text-xs text-text-muted">
                          {submission.city}, {submission.voivodeship}
                        </p>

                        {submission.adminNote && (
                          <div className="mt-3 rounded-control border border-danger-border bg-danger-subtle px-3 py-2 text-xs font-semibold leading-5 text-danger-foreground">
                            {submission.adminNote}
                          </div>
                        )}
                      </div>

                      <p className="pt-1 text-sm font-semibold text-text-secondary">
                        {getProfileOwnerTypeLabel(submission.ownerType)}
                      </p>

                      <div className="pt-0.5">
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </div>

                      <p className="pt-1 text-sm text-text-muted">
                        {formatProfileShortDate(submission.createdAt)}
                      </p>
                    </div>
                  );
                })}
              </div>

              <div className="divide-y divide-border md:hidden">
                {submissions.map((submission) => {
                  const status = getProfileSubmissionStatus(submission.status);

                  return (
                    <article key={submission.id} className="py-5 first:pt-5 last:pb-5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="text-sm font-extrabold text-text">
                            {submission.name}
                          </h3>

                          <p className="mt-1 text-xs leading-5 text-text-muted">
                            {submission.city}, {submission.voivodeship}
                          </p>
                        </div>

                        <Badge variant={status.variant} className="shrink-0">
                          {status.label}
                        </Badge>
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-3 rounded-control bg-surface-muted p-3">
                        <SubmissionMeta
                          label="Rodzaj"
                          value={getProfileOwnerTypeLabel(submission.ownerType)}
                        />

                        <SubmissionMeta
                          label="Data"
                          value={formatProfileShortDate(submission.createdAt)}
                        />
                      </div>

                      {submission.adminNote && (
                        <div className="mt-3 rounded-control border border-danger-border bg-danger-subtle px-3 py-2.5 text-xs font-semibold leading-5 text-danger-foreground">
                          {submission.adminNote}
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="py-6">
              <ProfileEmptyState
                title="Brak zgłoszeń łowisk"
                description="Zgłoszone przez Ciebie łowiska pojawią się tutaj wraz ze statusem weryfikacji."
                action={
                  <ButtonLink href="/lowiska/zglos" variant="outline" size="sm">
                    Zgłoś pierwsze łowisko
                  </ButtonLink>
                }
              />
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}

function SubmissionMeta({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-[9px] font-black uppercase tracking-[0.11em] text-text-muted">
        {label}
      </p>

      <p className="mt-1 text-xs font-bold text-text-secondary">{value}</p>
    </div>
  );
}
