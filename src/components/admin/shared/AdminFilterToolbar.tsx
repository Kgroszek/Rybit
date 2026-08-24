import type {
  ReactNode,
} from "react";

import { Button, ButtonLink } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";

export function AdminFilterToolbar({
  action,
  query,
  queryPlaceholder = "Szukaj...",
  hiddenFields,
  selectFields,
  resetHref,
  trailing,
}: {
  action: string;
  query?: string;
  queryPlaceholder?: string;
  hiddenFields?: Record<string, string | undefined>;
  selectFields?: Array<{
    name: string;
    label: string;
    value?: string;
    options: Array<{
      value: string;
      label: string;
    }>;
  }>;
  resetHref?: string;
  trailing?: ReactNode;
}) {
  return (
    <form
      method="get"
      action={action}
      className="grid gap-3 rounded-card border border-border bg-surface p-4 shadow-sm lg:grid-cols-[minmax(220px,1fr)_auto]"
    >
      <div
        className={cn(
          "grid gap-3",
          (selectFields?.length ?? 0) === 0 &&
            "md:grid-cols-1",
          (selectFields?.length ?? 0) === 1 &&
            "md:grid-cols-[minmax(220px,1fr)_minmax(170px,220px)]",
          (selectFields?.length ?? 0) >= 2 &&
            "md:grid-cols-2 xl:grid-cols-[minmax(220px,1fr)_repeat(2,minmax(170px,220px))]"
        )}
      >
        <Input
          name="q"
          defaultValue={query}
          placeholder={queryPlaceholder}
        />

        {selectFields?.map((field) => (
          <label key={field.name} className="grid gap-1.5">
            <span className="sr-only">{field.label}</span>

            <Select
              name={field.name}
              defaultValue={field.value ?? ""}
              aria-label={field.label}
            >
              {field.options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </label>
        ))}
      </div>

      {hiddenFields &&
        Object.entries(hiddenFields).map(([name, value]) =>
          value ? (
            <input
              key={name}
              type="hidden"
              name={name}
              value={value}
            />
          ) : null
        )}

      <div className="flex flex-wrap items-center justify-end gap-2">
        {resetHref && (
          <ButtonLink href={resetHref} variant="ghost">
            Wyczyść
          </ButtonLink>
        )}

        <Button type="submit" variant="outline">
          Filtruj
        </Button>

        {trailing}
      </div>
    </form>
  );
}
