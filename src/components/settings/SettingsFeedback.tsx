"use client";

import type {
  SettingsFeedbackMessage,
} from "@/lib/account/account-types";
import { cn } from "@/lib/cn";

export function SettingsFeedback({
  message,
}: {
  message: SettingsFeedbackMessage | null;
}) {
  if (!message) {
    return null;
  }

  return (
    <div
      role={
        message.tone === "error"
          ? "alert"
          : "status"
      }
      className={cn(
        "rounded-control border px-4 py-3 text-sm font-semibold leading-6",
        message.tone === "success" &&
          "border-success-border bg-success-subtle text-success-foreground",
        message.tone === "error" &&
          "border-danger-border bg-danger-subtle text-danger-foreground",
        message.tone === "info" &&
          "border-primary-200 bg-primary-50 text-primary-800"
      )}
    >
      {message.text}
    </div>
  );
}
