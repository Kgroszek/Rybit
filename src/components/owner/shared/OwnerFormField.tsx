import type {
  ComponentProps,
  ReactNode,
} from "react";

import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { cn } from "@/lib/cn";

export function OwnerFieldLabel({
  children,
  required = false,
}: {
  children: ReactNode;
  required?: boolean;
}) {
  return (
    <span className="block text-sm font-bold leading-5 text-text-secondary">
      {children}
      {required && (
        <span className="ml-1 text-danger">
          *
        </span>
      )}
    </span>
  );
}

export function OwnerInputField({
  label,
  required,
  className,
  ...props
}: ComponentProps<typeof Input> & {
  label: string;
}) {
  return (
    <label
      className="grid min-w-0"
      style={{
        rowGap: "12px",
      }}
    >
      <OwnerFieldLabel required={required}>
        {label}
      </OwnerFieldLabel>

      <Input
        {...props}
        required={required}
        className={cn(
          "h-12 text-[15px]",
          className
        )}
      />
    </label>
  );
}

export function OwnerSelectField({
  label,
  required,
  className,
  children,
  ...props
}: ComponentProps<typeof Select> & {
  label: string;
}) {
  return (
    <label
      className="grid min-w-0"
      style={{
        rowGap: "12px",
      }}
    >
      <OwnerFieldLabel required={required}>
        {label}
      </OwnerFieldLabel>

      <Select
        {...props}
        required={required}
        className={cn(
          "h-12 text-[15px]",
          className
        )}
      >
        {children}
      </Select>
    </label>
  );
}

export function OwnerTextareaField({
  label,
  required,
  className,
  ...props
}: ComponentProps<typeof Textarea> & {
  label: string;
}) {
  return (
    <label
      className="grid min-w-0"
      style={{
        rowGap: "12px",
      }}
    >
      <OwnerFieldLabel required={required}>
        {label}
      </OwnerFieldLabel>

      <Textarea
        {...props}
        required={required}
        className={cn(
          "min-h-28 text-[15px]",
          className
        )}
      />
    </label>
  );
}

export function OwnerCheckboxField({
  checked,
  onChange,
  label,
  description,
  disabled = false,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        "flex w-full items-start rounded-control border px-4 py-4 text-left transition",
        checked
          ? "border-primary-300 bg-primary-50"
          : "border-border bg-surface-muted hover:border-primary-200 hover:bg-surface-hover",
        disabled &&
          "cursor-not-allowed opacity-60"
      )}
    >
      <span
        className={cn(
          "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 text-[11px] font-black",
          checked
            ? "border-primary bg-primary text-white"
            : "border-border-strong bg-surface text-transparent"
        )}
        aria-hidden="true"
      >
        ✓
      </span>

      <span className="ml-3.5 min-w-0">
        <span className="block text-sm font-bold text-text">
          {label}
        </span>

        {description && (
          <span className="mt-1 block text-xs leading-5 text-text-muted">
            {description}
          </span>
        )}
      </span>
    </button>
  );
}
