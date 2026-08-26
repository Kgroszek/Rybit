import type { ReactNode } from "react";

export function Eyebrow({
  children,
  inverse = false,
}: {
  children: ReactNode;
  inverse?: boolean;
}) {
  return (
    <p
      className={[
        "flex items-center gap-2.5 text-[11px] font-extrabold uppercase tracking-[0.14em]",
        inverse
          ? "text-[#CFB07C]"
          : "text-[var(--waterline-primary)]",
      ].join(" ")}
    >
      <span
        className={[
          "h-px w-7",
          inverse
            ? "bg-current/45"
            : "bg-current/45",
        ].join(" ")}
      />
      {children}
    </p>
  );
}

export function PrimaryButton({
  href,
  children,
  secondary = false,
}: {
  href: string;
  children: ReactNode;
  secondary?: boolean;
}) {
  return (
    <a
      href={href}
      className={[
        "inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-[22px] text-[13px] font-extrabold transition duration-200 hover:-translate-y-0.5",
        secondary
          ? "border border-[#DFE4DE] bg-white text-[#16211D]"
          : "bg-[var(--waterline-primary)] text-[var(--waterline-primary-contrast)] shadow-[0_12px_30px_rgba(55,109,91,.14)]",
      ].join(" ")}
    >
      {children}
    </a>
  );
}

export function EmptyText({
  children,
  inverse = false,
}: {
  children: ReactNode;
  inverse?: boolean;
}) {
  return (
    <p
      className={[
        "py-7 text-sm leading-7",
        inverse
          ? "text-white/45"
          : "text-[#66706B]",
      ].join(" ")}
    >
      {children}
    </p>
  );
}
