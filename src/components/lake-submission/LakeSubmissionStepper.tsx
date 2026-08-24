"use client";

import type {
  LakeSubmissionStep,
} from "@/lib/lake-submission/lake-submission-types";
import { cn } from "@/lib/cn";

export function LakeSubmissionStepper({
  steps,
  currentStepIndex,
  maxVisitedStepIndex,
  onStepChange,
  disabled = false,
}: {
  steps: LakeSubmissionStep[];
  currentStepIndex: number;
  maxVisitedStepIndex: number;
  onStepChange: (
    index: number
  ) => void;
  disabled?: boolean;
}) {
  const progress =
    Math.round(
      ((currentStepIndex + 1) /
        steps.length) *
        100
    );

  return (
    <>
      <aside className="hidden rounded-panel border border-border bg-surface p-4 shadow-card lg:sticky lg:top-6 lg:block">
        <div className="px-2 pb-4">
          <p className="text-[10px] font-black uppercase tracking-[0.15em] text-primary">
            Zgłoszenie
          </p>

          <h2 className="mt-1.5 font-display text-lg font-extrabold tracking-[-0.025em] text-text">
            Nowe łowisko
          </h2>

          <p className="mt-1.5 text-xs leading-5 text-text-muted">
            Uzupełnij dane krok po kroku. Możesz wrócić do wcześniejszych sekcji.
          </p>
        </div>

        <nav
          aria-label="Etapy zgłoszenia łowiska"
          className="space-y-1"
        >
          {steps.map(
            (step, index) => {
              const isActive =
                index ===
                currentStepIndex;

              const isCompleted =
                index <
                currentStepIndex;

              const isFuture =
                index >
                currentStepIndex;

              return (
                <button
                  key={step.key}
                  type="button"
                  disabled={
                    disabled ||
                    index >
                      maxVisitedStepIndex
                  }
                  onClick={() =>
                    onStepChange(
                      index
                    )
                  }
                  className={cn(
                    "grid w-full grid-cols-[34px_minmax(0,1fr)] gap-3 rounded-control px-3 py-3 text-left transition disabled:cursor-not-allowed disabled:opacity-50",
                    isActive &&
                      "bg-primary-50",
                    !isActive &&
                      "hover:bg-surface-muted"
                  )}
                >
                  <span
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-xl border text-[10px] font-black tabular-nums",
                      isActive &&
                        "border-primary bg-primary text-white",
                      isCompleted &&
                        "border-success-border bg-success-subtle text-success-foreground",
                      isFuture &&
                        "border-border bg-surface-muted text-text-muted"
                    )}
                  >
                    {isCompleted
                      ? "✓"
                      : String(
                          index +
                            1
                        ).padStart(
                          2,
                          "0"
                        )}
                  </span>

                  <span className="min-w-0">
                    <span
                      className={cn(
                        "block text-sm font-extrabold",
                        isActive
                          ? "text-primary-800"
                          : "text-text-secondary"
                      )}
                    >
                      {
                        step.shortTitle
                      }
                    </span>

                    <span className="mt-1 block text-[11px] leading-4 text-text-muted">
                      {isCompleted
                        ? "Uzupełniono"
                        : isActive
                          ? "Aktualny krok"
                          : "Do uzupełnienia"}
                    </span>
                  </span>
                </button>
              );
            }
          )}
        </nav>

        <div className="mt-5 border-t border-border px-2 pt-4">
          <div className="flex items-center justify-between gap-3">
            <span className="text-[10px] font-black uppercase tracking-[0.11em] text-text-muted">
              Postęp
            </span>

            <span className="text-xs font-extrabold text-primary-700">
              {progress}%
            </span>
          </div>

          <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface-strong">
            <div
              className="h-full rounded-full bg-primary transition-[width] duration-300"
              style={{
                width:
                  `${progress}%`,
              }}
            />
          </div>
        </div>
      </aside>

      <div className="rounded-card border border-border bg-surface p-4 shadow-sm lg:hidden">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-[0.13em] text-primary">
              Krok{" "}
              {currentStepIndex +
                1}{" "}
              z {steps.length}
            </p>

            <p className="mt-1 truncate font-display text-lg font-extrabold tracking-[-0.025em] text-text">
              {
                steps[
                  currentStepIndex
                ].title
              }
            </p>
          </div>

          <span className="shrink-0 text-sm font-extrabold text-primary-700">
            {progress}%
          </span>
        </div>

        <div className="mt-3 h-2 overflow-hidden rounded-full bg-surface-strong">
          <div
            className="h-full rounded-full bg-primary transition-[width] duration-300"
            style={{
              width:
                `${progress}%`,
            }}
          />
        </div>

        <div className="mt-3 grid grid-cols-6 gap-1.5">
          {steps.map(
            (step, index) => (
              <button
                key={step.key}
                type="button"
                disabled={
                  disabled ||
                  index >
                    maxVisitedStepIndex
                }
                onClick={() =>
                  onStepChange(
                    index
                  )
                }
                aria-label={`${index + 1}. ${step.title}`}
                className={cn(
                  "h-2 rounded-full transition",
                  index <
                    currentStepIndex
                    ? "bg-success"
                    : index ===
                        currentStepIndex
                      ? "bg-primary"
                      : "bg-border"
                )}
              />
            )
          )}
        </div>
      </div>
    </>
  );
}
