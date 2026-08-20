import { AddCircleIcon } from "@/components/icons/AddCircleIcon";
import { AlertIcon } from "@/components/icons/AlertIcon";
import { BackpackIcon } from "@/components/icons/BackpackIcon";
import { BellIcon } from "@/components/icons/BellIcon";
import { CalendarIcon } from "@/components/icons/CalendarIcon";
import { CardsIcon } from "@/components/icons/CardsIcon";
import { CheckListIcon } from "@/components/icons/CheckListIcon";
import { DashboardIcon } from "@/components/icons/DashboardIcon";
import { FishIcon } from "@/components/icons/FishIcon";
import { FormIcon } from "@/components/icons/FormIcon";
import { MapIcon } from "@/components/icons/MapIcon";
import { SettingsIcon } from "@/components/icons/SettingsIcon";
import { UserIcon } from "@/components/icons/UserIcon";
import { UsersIcon } from "@/components/icons/UsersIcon";
import type { NavigationIconKey } from "@/components/dashboard/navigation";

export function NavigationIcon({
  icon,
  className = "h-5 w-5",
}: {
  icon: NavigationIconKey;
  className?: string;
}) {
  switch (icon) {
    case "dashboard":
      return <DashboardIcon className={className} />;
    case "map":
      return <MapIcon className={className} />;
    case "trip":
      return <CalendarIcon className={className} />;
    case "catch":
      return <FishIcon className={`${className} -scale-x-100`} />;
    case "gear":
      return <BackpackIcon className={className} />;
    case "checklist":
      return <CheckListIcon className={className} />;
    case "blog":
      return <FormIcon className={className} />;
    case "add":
      return <AddCircleIcon className={className} />;
    case "profile":
      return <UserIcon className={className} />;
    case "settings":
      return <SettingsIcon className={className} />;
    case "bell":
      return <BellIcon className={className} />;
    case "users":
      return <UsersIcon className={className} />;
    case "alert":
      return <AlertIcon className={className} />;
    case "menu":
      return <CardsIcon className={className} />;
  }
}
