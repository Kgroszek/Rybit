export function ProfileAmenityCheckbox({
  name,
  label,
  defaultChecked,
}: {
  name: string;
  label: string;
  defaultChecked: boolean;
}) {
  return (
    <label className="group relative flex min-h-[72px] cursor-pointer items-center rounded-control border border-border bg-surface-muted px-4 py-3.5 transition hover:border-primary-200 hover:bg-primary-50">
      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        className="peer sr-only"
      />

      <span
        className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 border-border-strong bg-surface transition peer-checked:border-primary peer-checked:bg-primary after:hidden after:h-2 after:w-2 after:rounded-[2px] after:bg-white peer-checked:after:block"
        aria-hidden="true"
      />

      <span className="ml-3.5 text-sm font-bold text-text-secondary transition peer-checked:text-primary-800">
        {label}
      </span>
    </label>
  );
}
