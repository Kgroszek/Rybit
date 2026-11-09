import { LAKE_SECTION_LINKS } from "./constants";

export function LakeSectionNav() {
  return (
    <nav
      aria-label="Sekcje profilu łowiska"
      className="my-6 overflow-x-auto rounded-control border border-border bg-surface shadow-sm"
    >
      <div className="flex min-w-max items-center gap-1 p-1.5">
        {LAKE_SECTION_LINKS.map((item) => (
          <a
            key={item.href}
            href={item.href}
            className="rounded-xl px-3.5 py-2 text-sm font-semibold text-text-secondary transition-colors hover:bg-primary-50 hover:text-primary"
          >
            {item.label}
          </a>
        ))}
      </div>
    </nav>
  );
}
