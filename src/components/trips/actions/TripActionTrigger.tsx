"use client";

import type { ReactNode } from "react";
import { buttonClassName } from "@/components/ui/Button";

export function TripActionTrigger({ label, icon, className, disabled = false, onClick }: {
  label: string;
  icon?: ReactNode;
  className?: string;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={className || buttonClassName({ variant: "primary", size: "md" })}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
