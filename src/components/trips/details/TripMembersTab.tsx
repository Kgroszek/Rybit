import { TripMembersManager } from "@/components/dashboard/TripMembersManager";
import { Badge } from "@/components/ui/Badge";
import { TripDetailsSection } from "@/components/trips/details/TripDetailsSection";
import type { TripDetailsData } from "@/lib/trips/details-query";

export function TripMembersTab({
  trip,
  ownerName,
  currentUserId,
  isOwner,
  canEdit,
}: {
  trip: TripDetailsData;
  ownerName: string;
  currentUserId: string;
  isOwner: boolean;
  canEdit: boolean;
}) {
  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
      <TripDetailsSection
        title="Uczestnicy wyprawy"
        description="Osoby z dostępem do wspólnej wyprawy oraz oczekujące zaproszenia."
      >
        <div className="mb-5 flex items-center gap-4 rounded-control border border-primary-200 bg-primary-50 px-4 py-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface text-sm font-extrabold text-primary-700 shadow-sm">
            {ownerName
              .trim()
              .slice(0, 1)
              .toUpperCase()}
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-text">
              {ownerName}
              {trip.userId === currentUserId
                ? " — Ty"
                : ""}
            </p>

            <p className="mt-1 text-xs font-bold text-primary-700">
              Właściciel · pełne uprawnienia
            </p>
          </div>
        </div>

        <TripMembersManager
          tripId={trip.id}
          isOwner={isOwner}
          members={trip.members.map(
            (member) => ({
              id: member.id,
              userId: member.userId,
              userName: member.userName,
              userEmail: isOwner
                ? member.userEmail
                : null,
              role: member.role,
              status: member.status,
            })
          )}
        />
      </TripDetailsSection>

      <aside className="space-y-6">
        <TripDetailsSection title="Twoje uprawnienia">
          <div className="space-y-3">
            <PermissionRow
              label="Edytowanie wyprawy"
              enabled={canEdit}
            />
            <PermissionRow
              label="Zarządzanie uczestnikami"
              enabled={isOwner}
            />
            <PermissionRow
              label="Usunięcie wyprawy"
              enabled={isOwner}
            />
          </div>
        </TripDetailsSection>

        <TripDetailsSection title="Role">
          <div className="space-y-4 text-sm leading-6 text-text-secondary">
            <RoleRow
              label="Właściciel"
              description="Pełne uprawnienia, uczestnicy i usuwanie wyprawy."
            />
            <RoleRow
              label="Współwłaściciel"
              description="Może edytować zawartość wyprawy."
            />
            <RoleRow
              label="Edytor"
              description="Może współtworzyć dane wyprawy."
            />
            <RoleRow
              label="Podgląd"
              description="Może przeglądać wyprawę bez zmian."
            />
          </div>
        </TripDetailsSection>
      </aside>
    </div>
  );
}

function PermissionRow({
  label,
  enabled,
}: {
  label: string;
  enabled: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-control bg-surface-muted px-3.5 py-3">
      <span className="text-sm font-bold text-text-secondary">
        {label}
      </span>

      <Badge
        variant={
          enabled ? "success" : "neutral"
        }
      >
        {enabled ? "Tak" : "Nie"}
      </Badge>
    </div>
  );
}

function RoleRow({
  label,
  description,
}: {
  label: string;
  description: string;
}) {
  return (
    <div>
      <p className="font-bold text-text">
        {label}
      </p>
      <p className="mt-1 text-xs leading-5 text-text-muted">
        {description}
      </p>
    </div>
  );
}
