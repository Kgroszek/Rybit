import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

type FormFieldProps = {
  htmlFor?: string;
  label: string;
  description?: string;
  error?: string | null;
  required?: boolean;
  children: ReactNode;
  className?: string;
};

export function FormField({
  htmlFor,
  label,
  description,
  error,
  required = false,
  children,
  className,
}: FormFieldProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-start justify-between gap-3">
        <label
          htmlFor={htmlFor}
          className="text-sm font-bold text-text"
        >
          {label}

          {required && (
            <span
              className="ml-1 text-danger"
              aria-hidden="true"
            >
              *
            </span>
          )}
        </label>
      </div>

      {description && !error && (
        <p className="text-xs leading-5 text-text-muted">
          {description}
        </p>
      )}

      {children}

      {error && (
        <p
          role="alert"
          className="text-xs font-semibold leading-5 text-danger-foreground"
        >
          {error}
        </p>
      )}
    </div>
  );
}
