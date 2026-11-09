import type { ReactNode } from "react";

import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { cn } from "@/lib/cn";

export function TripFieldLabel({
  children,
  required = false,
}: {
  children: ReactNode;
  required?: boolean;
}) {
  return (
    <span className="block text-sm font-bold leading-5 text-text-secondary">
      {children}
      {required && <span className="ml-1 text-danger">*</span>}
    </span>
  );
}

export function TripInput({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
  min,
  max,
  className,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
  min?: string;
  max?: string;
  className?: string;
}) {
  return (
    <label
      className="grid min-w-0"
      style={{ rowGap: "10px" }}
    >
      <TripFieldLabel required={required}>
        {label}
      </TripFieldLabel>

      <Input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        type={type}
        required={required}
        min={min}
        max={max}
        className={cn("h-12 text-[15px]", className)}
      />
    </label>
  );
}

export function TripSelect({
  label,
  value,
  onChange,
  children,
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: ReactNode;
  required?: boolean;
}) {
  return (
    <label
      className="grid min-w-0"
      style={{ rowGap: "10px" }}
    >
      <TripFieldLabel required={required}>
        {label}
      </TripFieldLabel>

      <Select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        className="h-12 text-[15px]"
      >
        {children}
      </Select>
    </label>
  );
}
