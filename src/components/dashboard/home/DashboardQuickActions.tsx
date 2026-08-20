import Link from "next/link";

import { BackpackIcon } from "@/components/icons/BackpackIcon";
import { FishIcon } from "@/components/icons/FishIcon";
import { HookIcon } from "@/components/icons/HookIcon";
import { MapIcon } from "@/components/icons/MapIcon";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { cn } from "@/lib/cn";

type Action = {
  href: string;
  label: string;
  description: string;
  icon:
    | "trip"
    | "catch"
    | "map"
    | "gear";
  emphasized?: boolean;
};

export function DashboardQuickActions({
  quickCatchHref,
  hasActiveTrip,
}: {
  quickCatchHref: string;
  hasActiveTrip: boolean;
}) {
  const actions: Action[] = [
    {
      href: "/wyprawy",
      label: "Zaplanuj wyprawę",
      description:
        "Termin i przygotowanie",
      icon: "trip",
    },
    {
      href: quickCatchHref,
      label: "Szybki połów",
      description: hasActiveTrip
        ? "Dodaj do trwającej wyprawy"
        : "Zapisz rybę w dzienniku",
      icon: "catch",
      emphasized: hasActiveTrip,
    },
    {
      href: "/lowiska?view=map",
      label: "Znajdź łowisko",
      description: "Mapa i baza miejsc",
      icon: "map",
    },
    {
      href: "/ekwipunek",
      label: "Mój ekwipunek",
      description:
        "Sprzęt i przygotowanie",
      icon: "gear",
    },
  ];

  return (
    <Card className="h-full">
      <CardHeader>
        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-primary">
          Szybkie akcje
        </p>

        <CardTitle className="mt-1">
          Przejdź od razu
        </CardTitle>

        <CardDescription>
          Najczęściej używane funkcje
          zawsze pod ręką.
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-4">
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-card border border-border bg-border">
          {actions.map((action) => (
            <QuickAction
              key={action.label}
              {...action}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function QuickAction({
  href,
  label,
  description,
  icon,
  emphasized = false,
}: Action) {
  return (
    <Link
      href={href}
      className={cn(
        "group min-h-[132px] bg-surface p-4 transition-colors duration-150 hover:bg-primary-50 sm:p-5",
        emphasized &&
          "bg-primary-50"
      )}
    >
      <div
        className={cn(
          "flex h-10 w-10 items-center justify-center rounded-control transition-colors",
          emphasized
            ? "bg-primary text-white"
            : "bg-primary-100 text-primary-700 group-hover:bg-primary group-hover:text-white"
        )}
      >
        <ActionIcon type={icon} />
      </div>

      <p className="mt-4 text-sm font-extrabold text-text">
        {label}
      </p>

      <p className="mt-1 text-xs leading-5 text-text-secondary">
        {description}
      </p>
    </Link>
  );
}

function ActionIcon({
  type,
}: {
  type: Action["icon"];
}) {
  const className = "h-5 w-5";

  if (type === "trip") {
    return (
      <BackpackIcon
        className={className}
      />
    );
  }

  if (type === "catch") {
    return (
      <FishIcon
        className={`${className} -scale-x-100`}
      />
    );
  }

  if (type === "map") {
    return (
      <MapIcon
        className={className}
      />
    );
  }

  return (
    <HookIcon
      className={className}
    />
  );
}
