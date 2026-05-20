import Link from "next/link";

type DashboardTopbarProps = {
  userName?: string | null;
  userEmail?: string | null;
};

export function DashboardTopbar({
  userName,
  userEmail,
}: DashboardTopbarProps) {
  const displayName = userName || "Wędkarz";
  const initials = getInitials(displayName || userEmail || "R");

  return (
    <header className="sticky top-0 z-[100] mb-6 border-b border-slate-200 bg-slate-50/90 py-4 backdrop-blur lg:static lg:border-b-0 lg:bg-transparent lg:py-0">
      <div className="relative min-h-12">
        <form
          action="/lowiska"
          className="w-full xl:absolute xl:left-1/2 xl:top-0 xl:w-[520px] xl:-translate-x-1/2"
        >
          <input
            name="search"
            type="search"
            placeholder="Szukaj łowiska, ryby, lokalizacji..."
            className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
          />
        </form>

        <div className="mt-3 flex min-w-0 items-center gap-2 xl:absolute xl:right-0 xl:top-0 xl:mt-0 xl:justify-end">
          <Link
            href="/lowiska/zglos"
            className="inline-flex h-12 flex-1 items-center justify-center rounded-2xl bg-blue-600 px-4 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 sm:flex-none"
          >
            + Zgłoś łowisko
          </Link>

          <Link
            href="/powiadomienia"
            className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 hover:text-blue-600"
            aria-label="Powiadomienia"
          >
            <BellIcon />
          </Link>

          <Link
            href="/profil"
            className="hidden h-12 items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 transition hover:bg-slate-50 sm:flex"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-cyan-500 text-xs font-black text-white">
              {initials}
            </span>

            <span className="min-w-0">
              <span className="block max-w-[140px] truncate text-sm font-black text-slate-950">
                {displayName}
              </span>

              <span className="block text-xs font-semibold text-slate-400">
                Wędkarz
              </span>
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
}

function getInitials(value: string) {
  const parts = value.trim().split(" ").filter(Boolean);

  if (parts.length === 0) {
    return "R";
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

function BellIcon() {
  return (
    <svg
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
      <path d="M10 21h4" />
    </svg>
  );
}