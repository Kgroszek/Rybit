"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

import { useToast } from "@/components/ui/ToastProvider";

type Member = {
  id: string;
  userId: string;
  userName: string;
  userEmail: string | null;
  role: string;
  status: string;
};

type ExactUser = {
  id: string;
  displayName: string;
};

export function TripMembersManager({
  tripId,
  isOwner,
  members,
}: {
  tripId: string;
  isOwner: boolean;
  members: Member[];
}) {
  const router = useRouter();
  const toast = useToast();

  const [email, setEmail] = useState("");
  const [foundUser, setFoundUser] = useState<ExactUser | null>(null);
  const [checking, setChecking] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [inviteRole, setInviteRole] = useState("editor");
  const [lookupMessage, setLookupMessage] = useState<string | null>(null);

  const existingUserIds = useMemo(
    () => new Set(members.map((member) => member.userId)),
    [members]
  );

  function resetLookup(nextEmail = "") {
    setEmail(nextEmail);
    setFoundUser(null);
    setLookupMessage(null);
  }

  async function checkUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedEmail = email.trim();

    if (!normalizedEmail) {
      setFoundUser(null);
      setLookupMessage("Wpisz pełny adres e-mail użytkownika.");
      return;
    }

    setChecking(true);
    setFoundUser(null);
    setLookupMessage(null);

    try {
      const response = await fetch("/api/users/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: normalizedEmail,
        }),
      });

      const data = (await response.json().catch(() => ({}))) as {
        user?: ExactUser | null;
        message?: string;
      };

      if (!response.ok) {
        setLookupMessage(
          data.message || "Nie udało się sprawdzić użytkownika."
        );
        return;
      }

      if (!data.user) {
        setLookupMessage(
          data.message || "Nie znaleziono konta z takim adresem e-mail."
        );
        return;
      }

      if (existingUserIds.has(data.user.id)) {
        setLookupMessage("Ten użytkownik jest już dodany do wyprawy.");
        return;
      }

      setFoundUser(data.user);
    } catch {
      setLookupMessage(
        "Wystąpił problem z połączeniem. Spróbuj ponownie."
      );
    } finally {
      setChecking(false);
    }
  }

  async function invite(targetUser: ExactUser) {
    setBusyId(targetUser.id);

    try {
      const response = await fetch(`/api/trips/${tripId}/members`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: targetUser.id,
          role: inviteRole,
        }),
      });

      const data = (await response.json().catch(() => ({}))) as {
        message?: string;
      };

      if (!response.ok) {
        toast.error({
          title: "Nie udało się wysłać zaproszenia.",
          description: data.message || "Spróbuj ponownie.",
        });
        return;
      }

      toast.success({
        title: "Zaproszenie wysłane.",
        description: `${targetUser.displayName} otrzyma powiadomienie w Rybio.`,
      });

      resetLookup();
      router.refresh();
    } catch {
      toast.error({
        title: "Nie udało się wysłać zaproszenia.",
        description: "Wystąpił problem z połączeniem.",
      });
    } finally {
      setBusyId(null);
    }
  }

  async function changeRole(memberId: string, role: string) {
    setBusyId(memberId);

    try {
      const response = await fetch(
        `/api/trips/${tripId}/members/${memberId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ role }),
        }
      );

      const data = (await response.json().catch(() => ({}))) as {
        message?: string;
      };

      if (!response.ok) {
        toast.error({
          title: "Nie udało się zmienić roli.",
          description: data.message || "Spróbuj ponownie.",
        });
        return;
      }

      toast.success({
        title: "Rola została zmieniona.",
      });

      router.refresh();
    } finally {
      setBusyId(null);
    }
  }

  async function removeMember(member: Member) {
    if (!window.confirm(`Usunąć ${member.userName} z tej wyprawy?`)) {
      return;
    }

    setBusyId(member.id);

    try {
      const response = await fetch(
        `/api/trips/${tripId}/members/${member.id}`,
        {
          method: "DELETE",
        }
      );

      const data = (await response.json().catch(() => ({}))) as {
        message?: string;
      };

      if (!response.ok) {
        toast.error({
          title: "Nie udało się usunąć uczestnika.",
          description: data.message || "Spróbuj ponownie.",
        });
        return;
      }

      toast.success({
        title: "Uczestnik został usunięty.",
      });

      router.refresh();
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-6">
      {isOwner && (
        <section className="rounded-3xl border border-blue-100 bg-blue-50 p-4 sm:p-5">
          <h3 className="text-base font-black text-blue-950">
            Zaproś użytkownika Rybio
          </h3>

          <p className="mt-1 max-w-3xl text-sm leading-6 text-blue-800">
            Ze względów prywatności nie pokazujemy listy kont ani podpowiedzi.
            Wpisz pełny adres e-mail osoby, którą chcesz zaprosić.
          </p>

          <form
            onSubmit={checkUser}
            className="mt-5 grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px_auto]"
          >
            <label className="min-w-0">
              <span className="mb-2 block text-sm font-black text-blue-950">
                Adres e-mail
              </span>

              <input
                type="email"
                value={email}
                onChange={(event) => resetLookup(event.target.value)}
                placeholder="np. jan.kowalski@example.com"
                autoComplete="off"
                className="h-12 w-full rounded-2xl border border-blue-100 bg-white px-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
              />
            </label>

            <label>
              <span className="mb-2 block text-sm font-black text-blue-950">
                Rola po dołączeniu
              </span>

              <select
                value={inviteRole}
                onChange={(event) => setInviteRole(event.target.value)}
                className="h-12 w-full rounded-2xl border border-blue-100 bg-white px-4 text-sm font-bold outline-none"
              >
                <option value="editor">Edytor</option>
                <option value="viewer">Tylko podgląd</option>
              </select>
            </label>

            <div className="flex items-end">
              <button
                type="submit"
                disabled={checking}
                className="h-12 w-full rounded-2xl bg-blue-600 px-5 text-sm font-black text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 lg:w-auto"
              >
                {checking ? "Sprawdzam..." : "Sprawdź użytkownika"}
              </button>
            </div>
          </form>

          {lookupMessage && (
            <div className="mt-4 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600">
              {lookupMessage}
            </div>
          )}

          {foundUser && (
            <div className="mt-4 flex flex-col gap-4 rounded-2xl border border-blue-100 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-50 text-sm font-black text-blue-700">
                  {getInitials(foundUser.displayName)}
                </div>

                <div className="min-w-0">
                  <p className="truncate font-black text-slate-950">
                    {foundUser.displayName}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Konto Rybio znalezione dla podanego adresu.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => invite(foundUser)}
                disabled={busyId === foundUser.id}
                className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-black text-white transition hover:bg-blue-700 disabled:opacity-50"
              >
                {busyId === foundUser.id
                  ? "Wysyłanie..."
                  : "Wyślij zaproszenie"}
              </button>
            </div>
          )}
        </section>
      )}

      <div className="space-y-3">
        {members.map((member) => (
          <article
            key={member.id}
            className={`flex flex-col gap-4 rounded-2xl border p-4 sm:flex-row sm:items-center ${
              member.status === "accepted"
                ? "border-slate-200 bg-white"
                : member.status === "pending"
                  ? "border-amber-100 bg-amber-50"
                  : "border-slate-200 bg-slate-50"
            }`}
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-black text-slate-600">
              {getInitials(member.userName)}
            </div>

            <div className="min-w-0 flex-1">
              <p className="break-words font-black text-slate-950">
                {member.userName}
              </p>

              <div className="mt-2 flex flex-wrap gap-2">
                <span
                  className={`rounded-full px-2.5 py-1 text-[10px] font-black ${
                    member.status === "accepted"
                      ? "bg-emerald-100 text-emerald-700"
                      : member.status === "pending"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {member.status === "accepted"
                    ? "Zaakceptowano"
                    : member.status === "pending"
                      ? "Oczekuje"
                      : member.status}
                </span>

                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-black text-slate-600">
                  {member.role === "editor" || member.role === "co_owner"
                    ? "Edytor"
                    : "Tylko podgląd"}
                </span>
              </div>
            </div>

            {isOwner && (
              <div className="flex flex-wrap gap-2">
                <select
                  value={
                    member.role === "editor" || member.role === "co_owner"
                      ? "editor"
                      : "viewer"
                  }
                  disabled={busyId === member.id}
                  onChange={(event) =>
                    changeRole(member.id, event.target.value)
                  }
                  className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-black text-slate-700 outline-none"
                >
                  <option value="editor">Edytor</option>
                  <option value="viewer">Tylko podgląd</option>
                </select>

                <button
                  type="button"
                  onClick={() => removeMember(member)}
                  disabled={busyId === member.id}
                  className="rounded-xl bg-red-50 px-3 py-2 text-xs font-black text-red-600 transition hover:bg-red-100 disabled:opacity-50"
                >
                  Usuń
                </button>
              </div>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}

function getInitials(name: string) {
  return (
    name
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "R"
  );
}
