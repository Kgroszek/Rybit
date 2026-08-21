"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import type { TripInvitation } from "@/components/trips/types";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useToast } from "@/components/ui/ToastProvider";
import { formatDateTime } from "@/components/trips/utils";

export function TripInvitations({
  invitations,
}: {
  invitations: TripInvitation[];
}) {
  if (invitations.length === 0) {
    return null;
  }

  return (
    <Card className="border-primary-200 bg-primary-50">
      <div className="p-5 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.15em] text-primary">
              Zaproszenia
            </p>

            <h2 className="mt-1.5 font-display text-lg font-extrabold text-text">
              Wspólne wyprawy czekają na odpowiedź
            </h2>

            <p className="mt-1.5 text-sm leading-6 text-text-secondary">
              Dołącz do wyprawy albo odrzuć zaproszenie bez opuszczania Centrum wypraw.
            </p>
          </div>

          <Badge variant="primary" size="md">
            {invitations.length}
          </Badge>
        </div>

        <div className="mt-5 grid gap-3 xl:grid-cols-2">
          {invitations.map((invitation) => (
            <InvitationCard
              key={invitation.id}
              invitation={invitation}
            />
          ))}
        </div>
      </div>
    </Card>
  );
}

function InvitationCard({
  invitation,
}: {
  invitation: TripInvitation;
}) {
  const router = useRouter();
  const toast = useToast();
  const [loading, setLoading] = useState<
    "accept" | "decline" | null
  >(null);

  async function answer(action: "accept" | "decline") {
    setLoading(action);

    try {
      const response = await fetch(
        `/api/trip-invitations/${invitation.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action }),
        }
      );

      const data = (await response.json().catch(() => ({}))) as {
        message?: string;
      };

      if (!response.ok) {
        toast.error({
          title: "Nie udało się obsłużyć zaproszenia.",
          description: data.message || "Spróbuj ponownie.",
        });
        return;
      }

      toast.success({
        title:
          action === "accept"
            ? "Dołączyłeś do wyprawy."
            : "Zaproszenie odrzucone.",
      });

      router.refresh();
    } catch {
      toast.error({
        title: "Nie udało się obsłużyć zaproszenia.",
        description: "Sprawdź połączenie i spróbuj ponownie.",
      });
    } finally {
      setLoading(null);
    }
  }

  return (
    <article className="rounded-control border border-primary-200 bg-surface px-4 py-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="truncate text-sm font-extrabold text-text">
            {invitation.trip.title}
          </p>

          <p className="mt-1 text-xs leading-5 text-text-muted">
            {invitation.trip.lakeName || "Bez łowiska"}
            {" · "}
            {formatDateTime(invitation.trip.startsAt)}
          </p>

          <p className="mt-2 text-xs font-bold text-primary-700">
            {invitation.role === "editor"
              ? "Możesz edytować wyprawę"
              : "Dostęp do podglądu"}
          </p>
        </div>

        <div className="flex shrink-0 gap-2">
          <Button
            type="button"
            size="sm"
            variant="ghost"
            disabled={Boolean(loading)}
            onClick={() => void answer("decline")}
          >
            Odrzuć
          </Button>

          <Button
            type="button"
            size="sm"
            isLoading={loading === "accept"}
            loadingLabel="Dołączanie…"
            disabled={loading === "decline"}
            onClick={() => void answer("accept")}
          >
            Dołącz
          </Button>
        </div>
      </div>
    </article>
  );
}
