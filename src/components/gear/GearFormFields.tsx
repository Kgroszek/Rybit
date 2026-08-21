"use client";

import {
  Children,
  type ComponentProps,
  type ReactNode,
} from "react";

import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { cn } from "@/lib/cn";

export function GearFormStack({
  children,
}: {
  children: ReactNode;
}) {
  const items =
    Children.toArray(children);

  return (
    <div className="min-w-0">
      {items.map(
        (child, index) => (
          <div
            key={index}
            style={{
              paddingTop:
                index === 0
                  ? 0
                  : "32px",
              paddingBottom:
                index ===
                items.length - 1
                  ? 0
                  : "32px",
              borderTop:
                index === 0
                  ? "none"
                  : "1px solid var(--rybio-border)",
            }}
          >
            {child}
          </div>
        )
      )}
    </div>
  );
}

export function GearFormSection({
  number,
  title,
  description,
  children,
}: {
  number: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section
      className="min-w-0"
      style={{
        display: "grid",
        rowGap: "24px",
      }}
    >
      <div className="flex items-start">
        <span className="flex h-8 min-w-8 shrink-0 items-center justify-center rounded-xl bg-primary-100 px-2 text-[11px] font-black text-primary-700">
          {number}
        </span>

        <div
          className="min-w-0 pt-0.5"
          style={{
            marginLeft: "16px",
          }}
        >
          <h3 className="font-display text-lg font-extrabold tracking-[-0.025em] text-text">
            {title}
          </h3>

          <p
            className="text-sm leading-6 text-text-secondary"
            style={{
              marginTop: "6px",
            }}
          >
            {description}
          </p>
        </div>
      </div>

      {children}
    </section>
  );
}

export function GearInputField({
  label,
  required = false,
  className,
  ...props
}: ComponentProps<typeof Input> & {
  label: string;
}) {
  return (
    <label
      className="grid min-w-0"
      style={{
        rowGap: "10px",
      }}
    >
      <GearFieldLabel
        required={required}
      >
        {label}
      </GearFieldLabel>

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

export function GearSelectField({
  label,
  required = false,
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
        rowGap: "10px",
      }}
    >
      <GearFieldLabel
        required={required}
      >
        {label}
      </GearFieldLabel>

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

export function GearTextareaField({
  label,
  required = false,
  className,
  ...props
}: ComponentProps<typeof Textarea> & {
  label: string;
}) {
  return (
    <label
      className="grid min-w-0"
      style={{
        rowGap: "10px",
      }}
    >
      <GearFieldLabel
        required={required}
      >
        {label}
      </GearFieldLabel>

      <Textarea
        {...props}
        required={required}
        className={cn(
          "min-h-32 text-[15px]",
          className
        )}
      />
    </label>
  );
}

export function GearDefaultField({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (
    checked: boolean
  ) => void;
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={() =>
        onChange(!checked)
      }
      className={cn(
        "flex min-h-[92px] w-full items-start rounded-control border px-4 py-4 text-left transition",
        checked
          ? "border-aqua-300 bg-aqua-50"
          : "border-border bg-surface-muted hover:border-primary-200 hover:bg-surface-hover"
      )}
    >
      <span
        className={cn(
          "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 text-[11px] font-black",
          checked
            ? "border-aqua-600 bg-aqua-600 text-white"
            : "border-border-strong bg-surface text-transparent"
        )}
        aria-hidden="true"
      >
        ✓
      </span>

      <span className="ml-3.5 min-w-0">
        <span className="block text-sm font-bold text-text">
          Najczęściej zabieram na wyprawę
        </span>

        <span className="mt-1 block text-xs leading-5 text-text-muted">
          Oznaczone elementy łatwiej wykorzystasz podczas przygotowywania wyposażenia wyprawy.
        </span>
      </span>
    </button>
  );
}

function GearFieldLabel({
  children,
  required,
}: {
  children: ReactNode;
  required: boolean;
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
