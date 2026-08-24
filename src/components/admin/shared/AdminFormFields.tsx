"use client";

import type {
  ComponentProps,
  ReactNode,
} from "react";

import {
  Input,
} from "@/components/ui/Input";
import {
  Select,
} from "@/components/ui/Select";
import {
  Textarea,
} from "@/components/ui/Textarea";
import {
  cn,
} from "@/lib/cn";

export function AdminFormField({
  label,
  required = false,
  hint,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center gap-1.5">
        <label className="text-sm font-bold text-text-secondary">
          {label}
        </label>

        {required && (
          <span className="text-danger" aria-hidden="true">
            *
          </span>
        )}
      </div>

      {children}

      {error ? (
        <p className="mt-2 text-xs font-bold leading-5 text-danger-foreground">
          {error}
        </p>
      ) : hint ? (
        <p className="mt-2 text-xs leading-5 text-text-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export function AdminFormInput({
  label,
  required,
  hint,
  error,
  className,
  ...props
}: ComponentProps<typeof Input> & {
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
}) {
  return (
    <AdminFormField
      label={label}
      required={required}
      hint={hint}
      error={error}
    >
      <Input
        {...props}
        className={cn("h-12", className)}
        aria-invalid={Boolean(error) || undefined}
      />
    </AdminFormField>
  );
}

export function AdminFormSelect({
  label,
  required,
  hint,
  error,
  className,
  children,
  ...props
}: ComponentProps<typeof Select> & {
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
}) {
  return (
    <AdminFormField
      label={label}
      required={required}
      hint={hint}
      error={error}
    >
      <Select
        {...props}
        className={cn("h-12", className)}
        aria-invalid={Boolean(error) || undefined}
      >
        {children}
      </Select>
    </AdminFormField>
  );
}

export function AdminFormTextarea({
  label,
  required,
  hint,
  error,
  className,
  ...props
}: ComponentProps<typeof Textarea> & {
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
}) {
  return (
    <AdminFormField
      label={label}
      required={required}
      hint={hint}
      error={error}
    >
      <Textarea
        {...props}
        className={cn("min-h-32", className)}
        aria-invalid={Boolean(error) || undefined}
      />
    </AdminFormField>
  );
}

export function AdminToggleCard({
  label,
  description,
  checked,
  onChange,
  disabled = false,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <label
      className={cn(
        "flex min-h-14 cursor-pointer items-start gap-3 rounded-control border px-3.5 py-3 transition",
        checked
          ? "border-primary-300 bg-primary-50"
          : "border-border bg-surface hover:border-primary-200 hover:bg-surface-muted",
        disabled && "cursor-not-allowed opacity-50"
      )}
    >
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked)}
        className="sr-only"
      />

      <span
        aria-hidden="true"
        className={cn(
          "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border text-[11px] font-black transition",
          checked
            ? "border-primary bg-primary text-white"
            : "border-border-strong bg-surface text-transparent"
        )}
      >
        ✓
      </span>

      <span className="min-w-0">
        <span
          className={cn(
            "block text-sm font-bold",
            checked ? "text-primary-800" : "text-text-secondary"
          )}
        >
          {label}
        </span>

        {description && (
          <span className="mt-1 block text-xs leading-5 text-text-muted">
            {description}
          </span>
        )}
      </span>
    </label>
  );
}

export function AdminFormSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-card border border-border bg-surface p-5 shadow-card sm:p-6">
      <div>
        <h2 className="font-display text-lg font-extrabold tracking-[-0.025em] text-text">
          {title}
        </h2>

        {description && (
          <p className="mt-1.5 max-w-3xl text-sm leading-6 text-text-secondary">
            {description}
          </p>
        )}
      </div>

      <div className="mt-5">{children}</div>
    </section>
  );
}
