import type { ReactNode } from "react";

export function WaterlineSectionShell({
  id,
  editorMode,
  selected,
  children,
}: {
  id: string;
  editorMode: boolean;
  selected: boolean;
  children: ReactNode;
}) {
  return (
    <div
      data-lake-section-id={id}
      className={[
        "relative",
        editorMode ? "cursor-pointer" : "",
        selected
          ? "z-20 outline outline-[3px] outline-blue-500 outline-offset-[-3px]"
          : editorMode
            ? "hover:outline hover:outline-2 hover:outline-blue-400/70 hover:outline-offset-[-2px]"
            : "",
      ].join(" ")}
    >
      {editorMode && selected ? (
        <div className="pointer-events-none absolute left-3 top-3 z-[80] rounded-full bg-blue-600 px-3 py-1.5 text-[9px] font-extrabold uppercase tracking-[0.14em] text-white shadow-lg">
          Edytowana sekcja
        </div>
      ) : null}

      {children}
    </div>
  );
}
