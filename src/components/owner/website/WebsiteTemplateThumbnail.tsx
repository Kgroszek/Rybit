import { cn } from "@/lib/cn";

export function WebsiteTemplateThumbnail({
  templateKey,
}: {
  templateKey: string;
}) {
  if (templateKey === "carp-lodge") {
    return (
      <div className="relative h-40 overflow-hidden bg-[#0D1110] p-3 text-[#F4F0E7]">
        <div className="flex items-center justify-between border-b border-white/10 pb-2">
          <div className="h-2 w-16 bg-[#C69A63]" />
          <div className="h-1.5 w-12 bg-white/15" />
        </div>
        <div className="mt-3 grid h-[112px] grid-cols-[.82fr_1.18fr] gap-2.5">
          <div className="flex flex-col justify-center">
            <div className="h-1.5 w-10 bg-[#C69A63]/70" />
            <div className="mt-2 h-3.5 w-full bg-white" />
            <div className="mt-1 h-3.5 w-4/5 bg-white" />
            <div className="mt-3 h-1.5 w-full bg-white/10" />
            <div className="mt-1 h-1.5 w-2/3 bg-white/10" />
            <div className="mt-3 h-5 w-14 bg-[#C69A63]" />
          </div>
          <div className="bg-gradient-to-br from-[#536250] via-[#27332D] to-[#111715]" />
        </div>
      </div>
    );
  }

  if (templateKey === "wild-water") {
    return (
      <div className="relative h-40 overflow-hidden bg-[#F4F0E5] p-3 text-[#263129]">
        <div className="flex items-center justify-between">
          <div className="h-2 w-16 rounded-full bg-[#3F654F]/25" />
          <div className="h-1.5 w-12 rounded-full bg-[#263129]/10" />
        </div>
        <div className="mt-3 grid h-[112px] grid-cols-[.9fr_1.1fr] items-center gap-3">
          <div>
            <div className="h-1.5 w-10 bg-[#3F654F]/70" />
            <div className="mt-2 h-3 w-full bg-[#263129]" />
            <div className="mt-1 h-3 w-4/5 bg-[#263129]" />
            <div className="mt-3 h-1.5 w-full bg-[#263129]/10" />
            <div className="mt-1 h-1.5 w-2/3 bg-[#263129]/10" />
          </div>
          <div className="h-[98px] rounded-[52%_48%_46%_54%/42%_44%_56%_58%] bg-gradient-to-br from-[#9BAD92] to-[#3F654F]" />
        </div>
      </div>
    );
  }

  if (templateKey === "fishery-club") {
    return (
      <div className="h-40 overflow-hidden bg-white p-3 text-black">
        <div className="flex items-center justify-between border-b border-black pb-2">
          <div className="flex items-center gap-1.5">
            <div className="h-2.5 w-2.5 bg-[#F05A28]" />
            <div className="h-2.5 w-14 bg-black" />
          </div>
          <div className="h-1.5 w-12 bg-black/15" />
        </div>
        <div className="mt-3 grid h-[108px] grid-cols-[1.08fr_.92fr] gap-2.5">
          <div className="flex flex-col justify-center">
            <div className="h-1.5 w-12 bg-[#F05A28]" />
            <div className="mt-2 h-4 w-full bg-black" />
            <div className="mt-1 h-4 w-4/5 bg-black" />
            <div className="mt-3 h-1.5 w-full bg-black/10" />
            <div className="mt-1 h-1.5 w-2/3 bg-black/10" />
          </div>
          <div className="bg-gradient-to-br from-black via-[#414141] to-[#F05A28]" />
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-40 overflow-hidden bg-gradient-to-br from-[#061426] via-[#0D3567] to-[#155EEF] p-3 text-white">
      <div className="flex items-center justify-between">
        <div className="h-2.5 w-16 rounded-full bg-white/90" />
        <div className="flex gap-1.5">
          {[1, 2, 3].map(
            (item) => (
              <div
                key={item}
                className="h-1.5 w-5 rounded bg-white/20"
              />
            )
          )}
        </div>
      </div>
      <div className="absolute inset-x-3 bottom-4">
        <div className="h-1.5 w-14 rounded-full bg-[#6ED5D0]" />
        <div className="mt-2 h-4 w-4/5 rounded bg-white" />
        <div className="mt-1 h-4 w-3/5 rounded bg-white" />
        <div className="mt-3 h-1.5 w-2/3 rounded bg-white/20" />
        <div className="mt-3 h-5 w-16 rounded-lg bg-white" />
      </div>
    </div>
  );
}

export function TemplateSwatches({
  swatches,
  size = "sm",
}: {
  swatches: readonly string[];
  size?: "sm" | "md";
}) {
  return (
    <div className="flex shrink-0 gap-1">
      {swatches
        .slice(0, 4)
        .map((color) => (
          <span
            key={color}
            className={cn(
              "rounded-full ring-1 ring-black/10",
              size === "md"
                ? "h-4 w-4"
                : "h-3 w-3"
            )}
            style={{
              backgroundColor: color,
            }}
          />
        ))}
    </div>
  );
}
