import type { ReactNode } from "react";

import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/cn";

type FieldLabelProps = {
  children: ReactNode;
  required?: boolean;
  className?: string;
};

export function FieldLabel({
  children,
  required = false,
  className,
}: FieldLabelProps) {
  return (
    <span
      className={cn(
        "mb-2.5 block text-[13px] font-bold leading-5 text-text-secondary",
        className
      )}
    >
      {children}
      {required && <span className="ml-1 text-danger">*</span>}
    </span>
  );
}

type CatchInputProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  type?: string;
  className?: string;
};

export function CatchInput({
  label,
  value,
  onChange,
  placeholder,
  required = false,
  type = "text",
  className,
}: CatchInputProps) {
  return (
    <label className="block min-w-0">
      <FieldLabel required={required}>{label}</FieldLabel>
      <Input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        required={required}
        type={type}
        step={type === "number" ? "0.01" : undefined}
        min={type === "number" ? 0 : undefined}
        className={cn(
          "h-12 rounded-control px-4 text-[15px]",
          className
        )}
      />
    </label>
  );
}

type CatchSelectProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { label: string; value: string }[];
  required?: boolean;
  className?: string;
};

export function CatchSelect({
  label,
  value,
  onChange,
  options,
  required = false,
  className,
}: CatchSelectProps) {
  return (
    <label className="block min-w-0">
      <FieldLabel required={required}>{label}</FieldLabel>

      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        className={cn(
          "h-12 w-full rounded-control border border-border-strong bg-surface px-4 text-[15px] font-medium text-text shadow-sm outline-none transition-[border-color,box-shadow,background-color] hover:border-primary-200 focus:border-primary focus:ring-4 focus:ring-primary-100 disabled:cursor-not-allowed disabled:bg-surface-muted disabled:text-text-muted",
          className
        )}
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
    <section className="border-b border-border py-8 first:pt-0 last:border-none last:pb-0">
      <div className="mb-6">
        <h3 className="font-display text-lg font-bold tracking-[-0.015em] text-text">
          {title}
        </h3>
        <p className="mt-1.5 text-sm leading-6 text-text-secondary">
          {description}
        </p>
      </div>

      {children}
    </section>
  );
}
