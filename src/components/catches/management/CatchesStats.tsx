import { Card } from "@/components/ui/Card";

export function CatchesStats({
  total,
  species,
  biggestWeight,
  biggestLength,
}: {
  total: number;
  species: number;
  biggestWeight: number;
  biggestLength: number;
}) {
  const stats = [
    { label: "Połowy", value: String(total) },
    { label: "Gatunki", value: String(species) },
    { label: "Rekord wagi", value: biggestWeight > 0 ? `${biggestWeight.toFixed(2)} kg` : "—" },
    { label: "Rekord długości", value: biggestLength > 0 ? `${biggestLength.toFixed(0)} cm` : "—" },
  ];

  return (
    <Card className="overflow-hidden p-0">
      <div className="flex overflow-x-auto sm:grid sm:grid-cols-4 sm:overflow-visible">
        {stats.map((stat, index) => (
          <div
            key={stat.label}
            className={`min-w-[150px] flex-1 px-4 py-4 sm:min-w-0 sm:px-5 ${index > 0 ? "border-l border-border" : ""}`}
          >
            <p className="text-xs font-semibold text-text-muted">{stat.label}</p>
            <p className="mt-1.5 font-display text-xl font-extrabold tracking-[-0.025em] text-text sm:text-2xl">
              {stat.value}
            </p>
          </div>
        ))}
      </div>
    </Card>
  );
}
