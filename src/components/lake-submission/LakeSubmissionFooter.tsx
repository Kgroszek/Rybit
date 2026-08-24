"use client";

import { Button } from "@/components/ui/Button";

export function LakeSubmissionFooter({
  isFirstStep,
  isLastStep,
  isLoading,
  isProcessingImages,
  onCancel,
  onPrevious,
  onNext,
  onSubmit,
}: {
  isFirstStep: boolean;
  isLastStep: boolean;
  isLoading: boolean;
  isProcessingImages: boolean;
  onCancel: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onSubmit: () => void;
}) {
  const busy =
    isLoading ||
    isProcessingImages;

  return (
    <div className="sticky bottom-0 z-20 -mx-4 border-t border-border bg-background/95 px-4 py-3 backdrop-blur-xl sm:-mx-0 sm:rounded-card sm:border sm:bg-surface sm:px-4 sm:shadow-card">
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button
          type="button"
          variant="ghost"
          disabled={busy}
          onClick={onCancel}
        >
          Anuluj
        </Button>

        <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center">
          {!isFirstStep && (
            <Button
              type="button"
              variant="outline"
              disabled={busy}
              onClick={
                onPrevious
              }
            >
              Wstecz
            </Button>
          )}

          {!isLastStep ? (
            <Button
              key="next-step"
              type="button"
              disabled={busy}
              className={
                isFirstStep
                  ? "col-span-2"
                  : ""
              }
              onClick={onNext}
            >
              Dalej
            </Button>
          ) : (
            <Button
              key="submit-lake"
              type="button"
              isLoading={
                isLoading
              }
              loadingLabel="Wysyłanie…"
              disabled={
                isProcessingImages
              }
              className={
                isFirstStep
                  ? "col-span-2"
                  : ""
              }
              onClick={onSubmit}
            >
              {isProcessingImages
                ? "Przygotowywanie zdjęć…"
                : "Wyślij zgłoszenie"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
