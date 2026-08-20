import Link from "next/link";
import type {
  ButtonHTMLAttributes,
  ComponentPropsWithoutRef,
} from "react";

import { cn } from "@/lib/cn";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "dark"
  | "danger";

export type ButtonSize = "sm" | "md" | "lg";

type ButtonStyleOptions = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  className?: string;
};

const baseClassName =
  "inline-flex shrink-0 items-center justify-center gap-2 font-bold transition-[background-color,border-color,color,box-shadow,transform] duration-200 focus-visible:outline-none disabled:pointer-events-none";

const variantClassNames: Record<ButtonVariant, string> = {
  /*
   * PRIMARY
   * Najważniejsza akcja w danym kontekście.
   * Hierarchię buduje przede wszystkim kolor, nie mocny cień.
   */
  primary:
    "border border-primary bg-primary text-white shadow-[0_1px_2px_rgba(13,30,51,0.08),0_2px_5px_rgba(13,30,51,0.05)] hover:border-primary-hover hover:bg-primary-hover hover:shadow-[0_2px_4px_rgba(13,30,51,0.10),0_4px_8px_rgba(13,30,51,0.06)] active:translate-y-px active:shadow-none",

  /*
   * SECONDARY
   * Pełnoprawna druga akcja, ale wyraźnie spokojniejsza od Primary.
   * Bez efektu "unoszącego się przycisku".
   */
  secondary:
    "border border-primary-200 bg-primary-100 text-primary-800 shadow-[0_1px_2px_rgba(13,30,51,0.04)] hover:border-primary-300 hover:bg-primary-200 hover:text-primary-900 active:translate-y-px active:shadow-none",

  /*
   * OUTLINE
   * Neutralna alternatywa. Brak cienia jest celowy.
   */
  outline:
    "border border-border-strong bg-surface text-text shadow-none hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700 active:translate-y-px",

  /*
   * GHOST
   * Akcja o najniższym priorytecie.
   */
  ghost:
    "border border-transparent bg-transparent text-text-secondary shadow-none hover:bg-surface-muted hover:text-text",

  /*
   * DEEP WATER
   * Mocna akcja dla specjalnych kontekstów premium / owner.
   * Nie używamy obok Primary jako zwykłej alternatywy.
   */
  dark:
    "border border-navy-950 bg-navy-950 text-white shadow-[0_1px_2px_rgba(13,30,51,0.10),0_2px_5px_rgba(13,30,51,0.07)] hover:border-navy-900 hover:bg-navy-900 hover:shadow-[0_2px_4px_rgba(13,30,51,0.12),0_4px_8px_rgba(13,30,51,0.08)] active:translate-y-px active:shadow-none",

  /*
   * DANGER
   * Tylko dla destrukcyjnej akcji wysokiego poziomu,
   * np. potwierdzenia usunięcia w dialogu.
   */
  danger:
    "border border-danger bg-danger text-white shadow-[0_1px_2px_rgba(217,76,87,0.16)] hover:border-danger-hover hover:bg-danger-hover hover:shadow-[0_2px_5px_rgba(217,76,87,0.20)] active:translate-y-px active:shadow-none",
};

const loadingClassNames: Record<ButtonVariant, string> = {
  primary:
    "border-primary-200 bg-primary-200 text-primary-700 shadow-none",
  secondary:
    "border-primary-200 bg-primary-100 text-primary-700 shadow-none",
  outline:
    "border-border bg-surface-muted text-text-secondary shadow-none",
  ghost:
    "border-transparent bg-surface-muted text-text-secondary shadow-none",
  dark:
    "border-navy-700 bg-navy-800 text-navy-100 shadow-none",
  danger:
    "border-danger-border bg-danger-subtle text-danger-foreground shadow-none",
};

const sizeClassNames: Record<ButtonSize, string> = {
  /*
   * 36 px — compact toolbar / desktop table.
   * Nie jest domyślnym rozmiarem na mobile.
   */
  sm: "min-h-9 rounded-xl px-3.5 py-2 text-xs",

  /*
   * 44 px — standard aplikacji i minimalny wygodny touch target.
   */
  md: "min-h-11 rounded-control px-4.5 py-2.5 text-sm",

  /*
   * 52 px — marketing, hero, ważne CTA.
   */
  lg: "min-h-13 rounded-control px-5.5 py-3 text-sm",
};

export function buttonClassName({
  variant = "primary",
  size = "md",
  fullWidth = false,
  className,
}: ButtonStyleOptions = {}) {
  return cn(
    baseClassName,
    variantClassNames[variant],
    sizeClassNames[size],
    fullWidth && "w-full",
    className
  );
}

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  ButtonStyleOptions & {
    isLoading?: boolean;
    loadingLabel?: string;
  };

export function Button({
  variant = "primary",
  size = "md",
  fullWidth = false,
  isLoading = false,
  loadingLabel = "Ładowanie…",
  disabled = false,
  className,
  children,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      aria-busy={isLoading || undefined}
      className={cn(
        buttonClassName({
          variant,
          size,
          fullWidth,
        }),
        isLoading
          ? loadingClassNames[variant]
          : disabled && "opacity-50",
        className
      )}
      {...props}
    >
      {isLoading ? (
        <>
          <span
            aria-hidden="true"
            className="h-4 w-4 animate-spin rounded-full border-2 border-current/25 border-t-current"
          />
          <span>{loadingLabel}</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}

export type ButtonLinkProps = ComponentPropsWithoutRef<typeof Link> &
  ButtonStyleOptions;

export function ButtonLink({
  variant = "primary",
  size = "md",
  fullWidth = false,
  className,
  children,
  ...props
}: ButtonLinkProps) {
  return (
    <Link
      className={buttonClassName({
        variant,
        size,
        fullWidth,
        className,
      })}
      {...props}
    >
      {children}
    </Link>
  );
}
