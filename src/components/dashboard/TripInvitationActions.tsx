"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { useToast } from "@/components/ui/ToastProvider";

type Invitation = {
  id: string;
  role: string;
  trip: {
    id: string;
    title: string;
    lakeName: string | null;
    startsAt: string;
  };
};

export function TripInvitations({ invitations }: { invitations: Invitation[] }) {
  if (invitations.length === 0) return null;

  return (
    <section className="mb-6 rounded-3xl border border-violet-100 bg-violet-50 p-4 shadow-sm sm:p-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-violet-600">Zaproszenia</p>
          <h2 className="mt-1 text-xl font-black text-violet-950">
            Wspólne wyprawy czekają na odpowiedź
          </h2>
        </div>
        <span className="w-fit rounded-full bg-white px-3 py-1 text-xs font-black text-violet-700">
          {invitations.length}
        </span>
      </div>

      <div className="mt-4 grid gap-3 xl:grid-cols-2">
        {invitations.map((invitation) => (
          <InvitationCard key={invitation.id} invitation={invitation} />
        ))}
      </div>
    </section>
  );
}

function InvitationCard({ invitation }: { invitation: Invitation }) {
  const router = useRouter();
  const toast = useToast();
  const [loading, setLoading] = useState<"accept" | "decline" | null>(null);

  async function answer(action: "accept" | "decline") {
    setLoading(action);
    try {
      const response = await fetch(`/api/trip-invitations/${invitation.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = (await response.json().catch(() => ({}))) as { message?: string };

      if (!response.ok) {
        toast.error({
          title: "Nie udało się obsłużyć zaproszenia.",
          description: data.message || "Spróbuj ponownie.",
        });
        return;
      }

      toast.success({
        title: action === "accept" ? "Dołączyłeś do wyprawy." : "Zaproszenie odrzucone.",
      });
      router.refresh();
    } finally {
      setLoading(null);
    }
  }

  return (
    <article className="rounded-2xl border border-violet-100 bg-white p-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="truncate font-black text-slate-950">{invitation.trip.title}</p>
          <p className="mt-1 text-sm text-slate-500">
            {invitation.trip.lakeName || "Bez łowiska"} • {formatDate(invitation.trip.startsAt)}
          </p>
          <p className="mt-2 text-xs font-black text-violet-600">
            Rola: {invitation.role === "editor" ? "Edytor" : "Tylko podgląd"}
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={() => answer("decline")}
            disabled={Boolean(loading)}
            className="rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-black text-slate-700 disabled:opacity-50"
          >
            Odrzuć
          </button>
          <button
            type="button"
            onClick={() => answer("accept")}
            disabled={Boolean(loading)}
            className="rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-black text-white disabled:opacity-50"
          >
            {loading === "accept" ? "Dołączanie..." : "Dołącz"}
          </button>
        </div>
      </div>
    </article>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pl-PL", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}
