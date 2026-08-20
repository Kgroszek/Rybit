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
    <fieldset>
      <legend className="sr-only">
        Widoczność połowu
      </legend>

      <div className="grid gap-3 sm:grid-cols-2">
        <VisibilityOption
          checked={!isPublic}
          value="private"
          title="Tylko dla mnie"
          description="Połów pozostanie w prywatnym dzienniku."
          onSelect={() => onChange(false)}
        />

        <VisibilityOption
          checked={isPublic}
          value="ranking"
          title="Ranking łowiska"
          description="Połów będzie publiczny i trafi do weryfikacji."
          onSelect={() => onChange(true)}
        />
      </div>

      {isPublic && (
        <div className="mt-3 rounded-control border border-border bg-surface-muted px-4 py-3">
          <p className="text-xs font-bold text-text">
            Wymagane do rankingu
          </p>

          <div className="mt-2 flex flex-wrap gap-2">
            <Requirement
              label="Łowisko"
              ready={hasLake}
            />
            <Requirement
              label="Zdjęcie"
              ready={hasImage}
            />
            <Requirement
              label="Waga lub długość"
              ready={hasMetric}
            />
          </div>
        </div>
      )}
    </fieldset>
  );
}

function VisibilityOption({
  checked,
  value,
  title,
  description,
  onSelect,
}: {
  checked: boolean;
  value: string;
  title: string;
  description: string;
  onSelect: () => void;
}) {
  return (
    <label
      className={cn(
        "flex cursor-pointer items-start gap-3 rounded-control border px-4 py-3.5 transition",
        checked
          ? "border-primary-300 bg-primary-50"
          : "border-border bg-surface hover:border-primary-200 hover:bg-surface-muted/50"
      )}
    >
      <input
        type="radio"
        name="catch-visibility"
        value={value}
        checked={checked}
        onChange={onSelect}
        className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--rybio-blue-600)]"
      />

      <span className="min-w-0">
        <span
          className={cn(
            "block text-sm font-bold",
            checked ? "text-primary-800" : "text-text"
          )}
        >
          {title}
        </span>

        <span className="mt-1 block text-xs leading-5 text-text-secondary">
          {description}
        </span>
      </span>
    </label>
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
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold",
        ready
          ? "border-success-border bg-success-subtle text-success-foreground"
          : "border-warning-border bg-warning-subtle text-warning-foreground"
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          ready ? "bg-success" : "bg-warning"
        )}
        aria-hidden="true"
      />
      {label}
    </span>
  );
}
