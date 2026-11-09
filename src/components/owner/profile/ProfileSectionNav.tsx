import type {
  OwnerLakeProfileFormData,
} from "@/components/owner/profile/types";
import {
  calculateProfileCompletion,
} from "@/components/owner/profile/profile-utils";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/cn";

const sections = [
  {
    id: "podstawowe",
    number: "01",
    label: "Podstawowe",
  },
  {
    id: "lokalizacja",
    number: "02",
    label: "Lokalizacja",
  },
  {
    id: "akwen",
    number: "03",
    label: "Akwen i ryby",
  },
  {
    id: "cennik",
    number: "04",
    label: "Cennik i regulamin",
  },
  {
    id: "udogodnienia",
    number: "05",
    label: "Udogodnienia",
  },
  {
    id: "kontakt",
    number: "06",
    label: "Kontakt",
  },
];

export function ProfileSectionNav({
  lake,
}: {
  lake: OwnerLakeProfileFormData;
}) {
  const completion =
    calculateProfileCompletion(lake);

  return (
    <aside className="min-w-0 xl:sticky xl:top-6 xl:self-start">
      <Card className="overflow-hidden">
        <div className="border-b border-border px-4 py-4">
          <p className="text-[10px] font-black uppercase tracking-[0.13em] text-text-muted">
            Sekcje profilu
          </p>

          <div className="mt-3 flex items-end justify-between gap-4">
            <div>
              <p className="font-display text-2xl font-extrabold tracking-[-0.03em] text-text">
                {completion}%
              </p>
              <p className="mt-1 text-xs text-text-muted">
                kompletności profilu
              </p>
            </div>

            <span
              className={cn(
                "h-2.5 w-2.5 rounded-full",
                completion >= 85
                  ? "bg-success"
                  : completion >= 60
                    ? "bg-warning"
                    : "bg-danger"
              )}
              aria-hidden="true"
            />
          </div>

          <div className="mt-3 h-2 overflow-hidden rounded-full bg-surface-strong">
            <div
              className="h-full rounded-full bg-primary"
              style={{
                width: `${completion}%`,
              }}
            />
          </div>
        </div>

        <nav
          aria-label="Sekcje formularza profilu"
          className="flex gap-1 overflow-x-auto p-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden xl:block"
        >
          {sections.map((section) => (
            <a
              key={section.id}
              href={`#${section.id}`}
              className="flex min-h-10 shrink-0 items-center gap-3 rounded-xl px-3 py-2 text-sm font-bold text-text-secondary transition hover:bg-primary-50 hover:text-primary-700"
            >
              <span className="text-[10px] font-black tabular-nums text-text-muted">
                {section.number}
              </span>
              {section.label}
            </a>
          ))}
        </nav>

        <div className="hidden border-t border-border px-4 py-4 xl:block">
          <dl className="grid gap-3 text-xs">
            <ProfileFact
              label="Zdjęcia"
              value={String(lake.imageCount)}
            />
            <ProfileFact
              label="Gatunki ryb"
              value={String(
                lake.fishSpeciesCount
              )}
            />
            <ProfileFact
              label="Ocena"
              value={lake.rating.toFixed(1)}
            />
          </dl>
        </div>
      </Card>
    </aside>
  );
}

function ProfileFact({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="font-semibold text-text-muted">
        {label}
      </dt>
      <dd className="font-extrabold text-text">
        {value}
      </dd>
    </div>
  );
}
