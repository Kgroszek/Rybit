import type {
  LakeSubmissionFeedback,
} from "@/lib/lake-submission/lake-submission-types";
import { cn } from "@/lib/cn";

export function LakeSubmissionFeedbackBanner({
  feedback,
}: {
  feedback:
    | LakeSubmissionFeedback
    | null;
}) {
  if (!feedback) {
    return null;
  }

  return (
    <div
      role={
        feedback.tone ===
        "error"
          ? "alert"
          : "status"
      }
      className={cn(
        "rounded-card border px-4 py-3.5 text-sm font-semibold leading-6",
        feedback.tone ===
          "error" &&
          "border-danger-border bg-danger-subtle text-danger-foreground",
        feedback.tone ===
          "warning" &&
          "border-warning-border bg-warning-subtle text-warning-foreground",
        feedback.tone ===
          "info" &&
          "border-primary-200 bg-primary-50 text-primary-800"
      )}
    >
      {feedback.text}
    </div>
  );
}
