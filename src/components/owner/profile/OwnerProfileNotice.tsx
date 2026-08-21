import { AlertIcon } from "@/components/icons/AlertIcon";
import { cn } from "@/lib/cn";

export function OwnerProfileNotice({
  variant,
  title,
  description,
}: {
  variant: "success" | "danger";
  title: string;
  description: string;
}) {
  return (
    <div
      role={
        variant === "danger"
          ? "alert"
          : "status"
      }
      className={cn(
        "mb-6 flex items-start gap-3 rounded-card border px-5 py-4",
        variant === "success"
          ? "border-success-border bg-success-subtle"
          : "border-danger-border bg-danger-subtle"
      )}
    >
      <span
        className={cn(
          "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-control bg-surface",
          variant === "success"
            ? "text-success-foreground"
            : "text-danger-foreground"
        )}
      >
        <AlertIcon className="h-4 w-4" />
      </span>

      <div>
        <p
          className={cn(
            "text-sm font-bold",
            variant === "success"
              ? "text-success-foreground"
              : "text-danger-foreground"
          )}
        >
          {title}
        </p>

        <p className="mt-1 text-xs leading-5 text-text-secondary">
          {description}
        </p>
      </div>
    </div>
  );
}
