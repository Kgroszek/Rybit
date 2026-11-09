import { AlertIcon } from "@/components/icons/AlertIcon";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export function OwnerNoEditAccess({
  slug,
  resourceLabel = "danych profilu",
}: {
  slug: string;
  resourceLabel?: string;
}) {
  return (
    <Card className="border-warning-border bg-warning-subtle shadow-none">
      <div className="px-5 py-6 sm:px-6">
        <div className="flex items-start gap-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-control bg-surface text-warning-foreground shadow-sm">
            <AlertIcon className="h-5 w-5" />
          </span>

          <div className="min-w-0">
            <p className="text-[11px] font-black uppercase tracking-[0.13em] text-warning-foreground">
              Brak uprawnień edycji
            </p>

            <h2 className="mt-2 font-display text-xl font-extrabold tracking-[-0.025em] text-text">
              Nie możesz edytować {resourceLabel}
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-text-secondary">
              Twoje konto jest przypisane do tego łowiska, ale nie ma aktywnego uprawnienia do edycji. Skontaktuj się z administracją Rybio, jeżeli dostęp powinien być rozszerzony.
            </p>

            <div className="mt-5 flex flex-wrap gap-3">
              <ButtonLink
                href={`/moje-lowiska/${slug}`}
                variant="outline"
              >
                Wróć do pulpitu
              </ButtonLink>

              <ButtonLink
                href={`/lowiska-w-polsce/${slug}`}
                variant="secondary"
              >
                Profil publiczny
              </ButtonLink>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
