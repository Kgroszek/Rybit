import type { SVGProps } from "react";

type MoreIconProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

export function MoreIcon({
  size = 24,
  className,
  ...props
}: MoreIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="currentColor"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <circle cx="12" cy="2" r="2" />
      <circle cx="12" cy="12" r="2" />
      <circle cx="12" cy="22" r="2" />
    </svg>
  );
}