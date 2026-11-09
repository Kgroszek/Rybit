import { TripActionPopup } from "@/components/dashboard/TripActionPopup";
import { TripNoteActions } from "@/components/dashboard/TripNoteActions";
import { Badge } from "@/components/ui/Badge";
import { buttonClassName } from "@/components/ui/Button";
import { TripDetailsSection } from "@/components/trips/details/TripDetailsSection";
import type {
  TripDetailsData,
  TripNote,
} from "@/lib/trips/details-query";
import {
  formatDateTime,
  getNoteTypeLabel,
} from "@/lib/trips/details-utils";
import { cn } from "@/lib/cn";

export function TripNotesTab({
  trip,
  currentUserId,
  isOwner,
  canEdit,
}: {
  trip: TripDetailsData;
  currentUserId: string;
  isOwner: boolean;
  canEdit: boolean;
}) {
  const pinned = trip.notes.filter(
    (note) => note.isPinned
  );
  const regular = trip.notes.filter(
    (note) => !note.isPinned
  );

  return (
    <TripDetailsSection
      title="Notatki"
      description="Wspólne ustalenia, obserwacje i informacje z wyprawy."
      action={
        <TripActionPopup
          tripId={trip.id}
          action="note"
          canEdit={canEdit}
          label="Dodaj notatkę"
          className={buttonClassName({
            variant: "primary",
            size: "md",
          })}
        />
      }
    >
      {trip.notes.length > 0 ? (
        <div className="space-y-7">
          {pinned.length > 0 && (
            <NoteGroup
              label="Przypięte"
              notes={pinned}
              tripId={trip.id}
              currentUserId={currentUserId}
              isOwner={isOwner}
              pinned
            />
          )}

          {regular.length > 0 && (
            <NoteGroup
              label={
                pinned.length > 0
                  ? "Pozostałe"
                  : undefined
              }
              notes={regular}
              tripId={trip.id}
              currentUserId={currentUserId}
              isOwner={isOwner}
            />
          )}
        </div>
      ) : (
        <EmptyTab
          title="Brak notatek"
          description="Dodaj pierwszą notatkę, aby uczestnicy mieli wspólne miejsce na ustalenia."
        />
      )}
    </TripDetailsSection>
  );
}

function NoteGroup({
  label,
  notes,
  tripId,
  currentUserId,
  isOwner,
  pinned = false,
}: {
  label?: string;
  notes: TripNote[];
  tripId: string;
  currentUserId: string;
  isOwner: boolean;
  pinned?: boolean;
}) {
  return (
    <div>
      {label && (
        <p className="mb-3 text-xs font-black uppercase tracking-[0.12em] text-text-muted">
          {label}
        </p>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {notes.map((note) => (
          <article
            key={note.id}
            className={cn(
              "rounded-card border p-5",
              pinned
                ? "border-primary-200 bg-primary-50"
                : "border-border bg-surface-muted"
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex flex-wrap gap-2">
                {pinned && (
                  <Badge variant="primary">
                    Przypięta
                  </Badge>
                )}

                <Badge variant="neutral">
                  {getNoteTypeLabel(note.type)}
                </Badge>
              </div>

              {(isOwner ||
                note.authorUserId ===
                  currentUserId) && (
                <TripNoteActions
                  tripId={tripId}
                  note={note}
                />
              )}
            </div>

            <p className="mt-4 whitespace-pre-wrap break-words text-sm leading-7 text-text-secondary">
              {note.content}
            </p>

            <p className="mt-4 border-t border-border pt-3 text-xs font-bold text-text-muted">
              {note.authorName || "Użytkownik"}
              {" · "}
              {formatDateTime(note.createdAt)}
            </p>
          </article>
        ))}
      </div>
    </div>
  );
}

function EmptyTab({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-card border border-dashed border-border bg-surface-muted px-5 py-10 text-center">
      <p className="font-display text-lg font-extrabold text-text">
        {title}
      </p>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-text-muted">
        {description}
      </p>
    </div>
  );
}
