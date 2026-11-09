import { TripActionPopup } from "@/components/dashboard/TripActionPopup";
import { TripDeleteButton } from "@/components/dashboard/TripInlineActions";
import { buttonClassName } from "@/components/ui/Button";
import { TripDetailsSection } from "@/components/trips/details/TripDetailsSection";
import type { TripDetailsData } from "@/lib/trips/details-query";
import { formatDateTime } from "@/lib/trips/details-utils";

export function TripMediaTab({
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
  return (
    <TripDetailsSection
      title="Zdjęcia z wyprawy"
      description="Wspólna galeria zdjęć dodanych przez uczestników."
      action={
        <TripActionPopup
          tripId={trip.id}
          action="media"
          canEdit={canEdit}
          label="Dodaj zdjęcia"
          className={buttonClassName({
            variant: "primary",
            size: "md",
          })}
        />
      }
    >
      {trip.media.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {trip.media.map((media) => (
            <article
              key={media.id}
              className="overflow-hidden rounded-card border border-border bg-surface"
            >
              <img
                src={media.url}
                alt={
                  media.caption ||
                  "Zdjęcie z wyprawy"
                }
                className="h-52 w-full object-cover"
              />

              <div className="p-4">
                {media.caption && (
                  <p className="break-words text-sm font-bold text-text">
                    {media.caption}
                  </p>
                )}

                <div className="mt-3 flex items-end justify-between gap-3">
                  <p className="text-xs leading-5 text-text-muted">
                    {media.userName ||
                      "Użytkownik"}
                    {" · "}
                    {formatDateTime(
                      media.createdAt
                    )}
                  </p>

                  {(isOwner ||
                    media.userId ===
                      currentUserId) && (
                    <TripDeleteButton
                      tripId={trip.id}
                      resource="media"
                      entityId={media.id}
                      confirmText="Czy na pewno chcesz usunąć to zdjęcie z wyprawy?"
                    />
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="rounded-card border border-dashed border-border bg-surface-muted px-5 py-10 text-center">
          <p className="font-display text-lg font-extrabold text-text">
            Galeria jest pusta
          </p>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-text-muted">
            Zdjęcia dodane przez uczestników wyprawy pojawią się tutaj.
          </p>
        </div>
      )}
    </TripDetailsSection>
  );
}
