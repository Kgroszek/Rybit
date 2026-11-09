import type {
  ButtonHTMLAttributes,
  ReactNode,
} from "react";

import { cn } from "@/lib/cn";

export type IconButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "dark"
  | "danger";

export type IconButtonSize = "sm" | "md" | "lg";

const variantClassNames: Record<IconButtonVariant, string> = {
  primary:
    "border-primary bg-primary text-white shadow-[0_1px_2px_rgba(13,30,51,0.08),0_2px_5px_rgba(13,30,51,0.05)] hover:border-primary-hover hover:bg-primary-hover hover:shadow-[0_2px_4px_rgba(13,30,51,0.10)]",

  secondary:
    "border-primary-200 bg-primary-100 text-primary-800 shadow-[0_1px_2px_rgba(13,30,51,0.04)] hover:border-primary-300 hover:bg-primary-200 hover:text-primary-900",

  outline:
    "border-border-strong bg-surface text-text-secondary shadow-none hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700",

  ghost:
    "border-transparent bg-transparent text-text-muted shadow-none hover:bg-surface-muted hover:text-text",

  dark:
    "border-navy-950 bg-navy-950 text-white shadow-[0_1px_2px_rgba(13,30,51,0.10),0_2px_5px_rgba(13,30,51,0.07)] hover:border-navy-900 hover:bg-navy-900",

  /*
   * Standardowy wygląd usuwania w Rybio:
   * czerwone tło + biała ikona.
   */
  danger:
    "border-danger bg-danger text-white shadow-[0_1px_2px_rgba(217,76,87,0.16)] hover:border-danger-hover hover:bg-danger-hover hover:shadow-[0_2px_5px_rgba(217,76,87,0.20)]",
};

const sizeClassNames: Record<IconButtonSize, string> = {
  /*
   * 36 px — wyłącznie kompaktowy desktop / toolbar.
   */
  sm: "h-9 w-9 rounded-xl",

  /*
   * 44 px — domyślny rozmiar, także dla ikony usuwania.
   */
  md: "h-11 w-11 rounded-control",

  /*
   * 52 px — bardzo wyeksponowane akcje.
   */
  lg: "h-13 w-13 rounded-control",
};

type IconButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "children"
> & {
  label: string;
  icon: ReactNode;
  variant?: IconButtonVariant;
  size?: IconButtonSize;
};

export function IconButton({
  label,
  icon,
  variant = "ghost",
  size = "md",
  disabled = false,
  className,
  type = "button",
  ...props
}: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      disabled={disabled}
      className={cn(
        "inline-flex shrink-0 items-center justify-center border transition-[background-color,border-color,color,box-shadow,transform] duration-200 focus-visible:outline-none active:translate-y-px active:shadow-none disabled:pointer-events-none disabled:opacity-50",
        variantClassNames[variant],
        sizeClassNames[size],
        className
      )}
      {...props}
    >
      {icon}
    </button>
  );
}