import { Children } from "react";
import type { ReactNode } from "react";

type CatchFormSectionProps = {
  number: string;
  title: string;
  description: string;
  children: ReactNode;
};

/**
 * A single visual section of the catch form.
 *
 * Important:
 * - this component controls only spacing INSIDE a section;
 * - spacing BETWEEN sections is controlled by CatchFormStack;
 * - field label/control spacing is controlled by FormField.
 *
 * This keeps the vertical rhythm predictable and prevents
 * adjacent sections from accidentally cancelling/duplicating spacing.
 */
export function CatchFormSection({
  number,
  title,
  description,
  children,
}: CatchFormSectionProps) {
  return (
    <section
      className="min-w-0"
      style={{
        display: "grid",
        rowGap: "24px",
      }}
    >
      <div className="flex min-w-0 items-start">
        <span
          className="flex h-8 min-w-8 shrink-0 items-center justify-center rounded-lg bg-primary-100 px-2 text-[11px] font-black tracking-[0.05em] text-primary-700"
          aria-hidden="true"
        >
          {number}
        </span>

        <div className="min-w-0 pt-0.5" style={{ marginLeft: "16px" }}>
          <h3 className="font-display text-lg font-bold leading-6 tracking-[-0.012em] text-text">
            {title}
          </h3>

          <p
            className="text-sm leading-6 text-text-secondary"
            style={{ marginTop: "6px" }}
          >
            {description}
          </p>
        </div>
      </div>

      <div className="min-w-0">
        {children}
      </div>
    </section>
  );
}

/**
 * Owns spacing between top-level form sections.
 * Dashboard uses large, explicit vertical groups as well;
 * this is the modal equivalent of that rhythm.
 */
export function CatchFormStack({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-w-0">
      {Children.toArray(children).map((child, index, items) => (
        <div
          key={index}
          style={{
            paddingTop: index === 0 ? 0 : "32px",
            paddingBottom: index === items.length - 1 ? 0 : "32px",
            borderTop:
              index === 0
                ? "none"
                : "1px solid var(--rybio-border)",
          }}
        >
          {child}
        </div>
      ))}
    </div>
  );
}
