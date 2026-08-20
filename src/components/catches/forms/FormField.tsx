import type { ReactNode } from "react";

import { Input } from "@/components/ui/Input";

export function FieldLabel({
  children,
  required = false,
}: {
  children: ReactNode;
  required?: boolean;
}) {
  return (
    <span className="mb-2 block text-sm font-semibold text-text-secondary">
      {children}
      {required && <span className="ml-1 text-danger">*</span>}
    </span>
  );
}

export function CatchInput({
  label,
  value,
  onChange,
  placeholder,
  required = false,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  type?: string;
}) {
  return (
    <label className="block">
      <FieldLabel required={required}>{label}</FieldLabel>
      <Input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        required={required}
        type={type}
        step={type === "number" ? "0.01" : undefined}
        min={type === "number" ? 0 : undefined}
      />
    </label>
  );
}

export function CatchSelect({
  label,
  value,
  onChange,
  options,
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { label: string; value: string }[];
  required?: boolean;
}) {
  return (
    <label className="block">
      <FieldLabel required={required}>{label}</FieldLabel>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        className="h-11 w-full rounded-control border border-border-strong bg-surface px-3.5 text-sm font-semibold text-text shadow-sm outline-none transition hover:border-primary-200 focus:border-primary focus:ring-4 focus:ring-primary-100 disabled:cursor-not-allowed disabled:bg-surface-muted disabled:text-text-muted"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function CatchFormGroup({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="border-b border-border pb-6 last:border-none last:pb-0">
      <div className="mb-4">
        <h3 className="font-display text-base font-bold text-text">{title}</h3>
        <p className="mt-1 text-sm leading-6 text-text-secondary">{description}</p>
      </div>
      {children}
    </section>
  );
}
