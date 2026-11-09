"use client";

import {
  useState,
  type InputHTMLAttributes,
} from "react";

import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/cn";

type PasswordFieldProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type"
> & {
  label: string;
  hint?: string;
};

export function PasswordField({
  label,
  hint,
  className,
  ...props
}: PasswordFieldProps) {
  const [visible, setVisible] =
    useState(false);

  return (
    <label className="grid gap-2.5">
      <span className="text-sm font-bold text-text-secondary">
        {label}
      </span>

      <div className="relative">
        <Input
          {...props}
          type={
            visible
              ? "text"
              : "password"
          }
          className={cn(
            "pr-20",
            className
          )}
        />

        <button
          type="button"
          onClick={() =>
            setVisible(
              (current) =>
                !current
            )
          }
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg px-2.5 py-1.5 text-[11px] font-extrabold text-primary-700 transition hover:bg-primary-50 hover:text-primary-900"
          aria-label={
            visible
              ? "Ukryj hasło"
              : "Pokaż hasło"
          }
        >
          {visible
            ? "Ukryj"
            : "Pokaż"}
        </button>
      </div>

      {hint && (
        <span className="text-xs leading-5 text-text-muted">
          {hint}
        </span>
      )}
    </label>
  );
}
