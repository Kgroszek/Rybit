"use client";

import type {
  ComponentProps,
  ReactNode,
} from "react";

import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { cn } from "@/lib/cn";

export function SubmissionField({
  label,
  required = false,
  error,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div
      data-field-error={
        Boolean(error)
      }
    >
      <div className="mb-2.5 flex items-center gap-1.5">
        <label className="text-sm font-bold text-text-secondary">
          {label}
        </label>

        {required && (
          <span
            className="text-danger"
            aria-hidden="true"
          >
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

export function SubmissionInput({
  label,
  required,
  error,
  hint,
  className,
  ...props
}: ComponentProps<
  typeof Input
> & {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
}) {
  return (
    <SubmissionField
      label={label}
      required={required}
      error={error}
      hint={hint}
    >
      <Input
        {...props}
        aria-invalid={
          Boolean(error) ||
          undefined
        }
        className={cn(
          "h-12",
          className
        )}
      />
    </SubmissionField>
  );
}

export function SubmissionSelect({
  label,
  required,
  error,
  hint,
  className,
  children,
  ...props
}: ComponentProps<
  typeof Select
> & {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
}) {
  return (
    <SubmissionField
      label={label}
      required={required}
      error={error}
      hint={hint}
    >
      <Select
        {...props}
        aria-invalid={
          Boolean(error) ||
          undefined
        }
        className={cn(
          "h-12",
          className
        )}
      >
        {children}
      </Select>
    </SubmissionField>
  );
}

export function SubmissionTextarea({
  label,
  required,
  error,
  hint,
  className,
  ...props
}: ComponentProps<
  typeof Textarea
> & {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
}) {
  return (
    <SubmissionField
      label={label}
      required={required}
      error={error}
      hint={hint}
    >
      <Textarea
        {...props}
        aria-invalid={
          Boolean(error) ||
          undefined
        }
        className={cn(
          "min-h-32",
          className
        )}
      />
    </SubmissionField>
  );
}

export function SubmissionChoice({
  label,
  description,
  checked,
  onChange,
  disabled = false,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (
    checked: boolean
  ) => void;
  disabled?: boolean;
}) {
  return (
    <label
      className={cn(
        "group flex min-h-14 cursor-pointer items-start gap-3 rounded-control border px-3.5 py-3 transition",
        checked
          ? "border-primary-300 bg-primary-50"
          : "border-border bg-surface hover:border-primary-200 hover:bg-surface-muted",
        disabled &&
          "cursor-not-allowed opacity-50"
      )}
    >
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(event) =>
          onChange(
            event.target.checked
          )
        }
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
            checked
              ? "text-primary-800"
              : "text-text-secondary"
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

export function SubmissionGroup({
  eyebrow,
  title,
  description,
  children,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "border-t border-border pt-7 first:border-t-0 first:pt-0",
        className
      )}
    >
      <div>
        {eyebrow && (
          <p className="text-[10px] font-black uppercase tracking-[0.14em] text-primary">
            {eyebrow}
          </p>
        )}

        <h3 className="mt-1 font-display text-lg font-extrabold tracking-[-0.025em] text-text">
          {title}
        </h3>

        {description && (
          <p className="mt-1.5 max-w-3xl text-sm leading-6 text-text-secondary">
            {description}
          </p>
        )}
      </div>

      <div className="mt-5">
        {children}
      </div>
    </section>
  );
}
