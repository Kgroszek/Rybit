"use client";

import { cn } from "@/lib/cn";

type CatchVisibilityFieldProps = {
  isPublic: boolean;
  hasLake: boolean;
  hasImage: boolean;
  hasMetric: boolean;
  onChange: (isPublic: boolean) => void;
};

export function CatchVisibilityField({
  isPublic,
  hasLake,
  hasImage,
  hasMetric,
  onChange,
}: CatchVisibilityFieldProps) {
  return (
    <div>
      <div
        className="grid sm:grid-cols-2"
        style={{
          gap: "16px",
        }}
        role="radiogroup"
        aria-label="Widoczność połowu"
      >
        <VisibilityOption
          checked={!isPublic}
          title="Tylko dla mnie"
          description="Połów zostanie wyłącznie w Twoim prywatnym dzienniku."
          onSelect={() => onChange(false)}
        />

        <VisibilityOption
          checked={isPublic}
          title="Ranking łowiska"
          description="Połów będzie publiczny po pozytywnej weryfikacji."
          onSelect={() => onChange(true)}
        />
      </div>

      {isPublic && (
        <div
          className="rounded-card border border-border bg-surface-muted px-5 py-5"
          style={{
            marginTop: "20px",
          }}
        >
          <p className="text-sm font-bold text-text">
            Wymagania do rankingu
          </p>

          <p
            className="text-xs leading-5 text-text-secondary"
            style={{
              marginTop: "6px",
            }}
          >
            Uzupełnij wszystkie wymagane elementy przed wysłaniem połowu do weryfikacji.
          </p>

          <div
            className="grid sm:grid-cols-3"
            style={{
              gap: "12px",
              marginTop: "16px",
            }}
          >
            <Requirement label="Łowisko" ready={hasLake} />
            <Requirement label="Zdjęcie" ready={hasImage} />
            <Requirement
              label="Waga lub długość"
              ready={hasMetric}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function VisibilityOption({
  checked,
  title,
  description,
  onSelect,
}: {
  checked: boolean;
  title: string;
  description: string;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={checked}
      onClick={onSelect}
      className={cn(
        "group flex min-h-[108px] w-full items-start rounded-card border px-5 py-4 text-left transition-[background-color,border-color,box-shadow]",
        checked
          ? "border-primary-300 bg-primary-50 shadow-[0_1px_2px_rgba(13,30,51,0.04)]"
          : "border-border bg-surface hover:border-primary-200 hover:bg-primary-50/35"
      )}
    >
      <span
        className={cn(
          "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition",
          checked
            ? "border-primary"
            : "border-border-strong group-hover:border-primary-300"
        )}
        aria-hidden="true"
      >
        {checked && (
          <span className="h-2.5 w-2.5 rounded-full bg-primary" />
        )}
      </span>

      <span
        className="min-w-0"
        style={{
          marginLeft: "14px",
        }}
      >
        <span
          className={cn(
            "block text-sm font-bold leading-5",
            checked ? "text-primary-800" : "text-text"
          )}
        >
          {title}
        </span>

        <span
          className="block text-xs leading-5 text-text-secondary"
          style={{
            marginTop: "6px",
          }}
        >
          {description}
        </span>
      </span>
    </button>
  );
}

function Requirement({
  label,
  ready,
}: {
  label: string;
  ready: boolean;
}) {
  return (
    <div
      className={cn(
        "flex min-h-10 items-center rounded-control border px-3 py-2 text-xs font-bold",
        ready
          ? "border-success-border bg-success-subtle text-success-foreground"
          : "border-warning-border bg-warning-subtle text-warning-foreground"
      )}
    >
      <span
        className={cn(
          "h-2 w-2 shrink-0 rounded-full",
          ready ? "bg-success" : "bg-warning"
        )}
        aria-hidden="true"
      />

      <span style={{ marginLeft: "8px" }}>{label}</span>
    </div>
  );
}
