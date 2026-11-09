"use client";

import { useState } from "react";

export type LakeWebsiteNavItem = {
  id: string;
  label: string;
};

export function LakeWebsiteMobileNav({
  items,
  contactId,
  dark = false,
  editorial = false,
}: {
  items: LakeWebsiteNavItem[];
  contactId?: string | null;
  dark?: boolean;
  editorial?: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-label={open ? "Zamknij menu" : "Otwórz menu"}
        aria-expanded={open}
        className={`flex h-10 w-10 items-center justify-center transition ${
          editorial
            ? "border border-current"
            : "rounded-full border border-current/15"
        }`}
      >
        <span className="text-lg leading-none">{open ? "×" : "☰"}</span>
      </button>

      {open && (
        <div
          className={`absolute inset-x-0 top-full border-t px-5 py-5 shadow-xl sm:px-8 ${
            dark
              ? "border-white/10 bg-[#0D1110] text-[#F4F0E7]"
              : editorial
                ? "border-black bg-white text-black"
                : "border-black/10 bg-white text-slate-950"
          }`}
        >
          <nav className="grid gap-1">
            {items.map((item, index) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={() => setOpen(false)}
                className={`flex items-center justify-between py-3 text-sm font-bold ${
                  editorial
                    ? "border-b border-black uppercase tracking-[0.06em]"
                    : "border-b border-current/10"
                }`}
              >
                <span>{item.label}</span>
                <span className="text-xs opacity-35">
                  {String(index + 1).padStart(2, "0")}
                </span>
              </a>
            ))}

            {contactId && (
              <a
                href={`#${contactId}`}
                onClick={() => setOpen(false)}
                className={`mt-4 px-4 py-3 text-center text-sm font-bold ${
                  dark
                    ? "bg-[#C69A63] text-[#0D1110]"
                    : editorial
                      ? "bg-black text-white"
                      : "rounded-full bg-blue-600 text-white"
                }`}
              >
                Kontakt
              </a>
            )}
          </nav>
        </div>
      )}
    </div>
  );
}
