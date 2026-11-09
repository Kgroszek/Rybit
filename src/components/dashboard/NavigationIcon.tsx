import { AddCircleIcon } from "@/components/icons/AddCircleIcon";
import { AlertIcon } from "@/components/icons/AlertIcon";
import { BackpackIcon } from "@/components/icons/BackpackIcon";
import { BellIcon } from "@/components/icons/BellIcon";
import { CardsIcon } from "@/components/icons/CardsIcon";
import { DashboardIcon } from "@/components/icons/DashboardIcon";
import { FishIcon } from "@/components/icons/FishIcon";
import { FormIcon } from "@/components/icons/FormIcon";
import { HookIcon } from "@/components/icons/HookIcon";
import { MapIcon } from "@/components/icons/MapIcon";
import { SettingsIcon } from "@/components/icons/SettingsIcon";
import { UserIcon } from "@/components/icons/UserIcon";
import { UsersIcon } from "@/components/icons/UsersIcon";

import type { NavigationIconKey } from "@/components/dashboard/navigation";

type NavigationIconProps = {
  icon: NavigationIconKey;
  className?: string;
};

export function NavigationIcon({
  icon,
  className = "h-5 w-5",
}: NavigationIconProps) {
  switch (icon) {
    case "dashboard":
      return (
        <DashboardIcon
          className={className}
        />
      );

    case "map":
      return (
        <MapIcon
          className={className}
        />
      );

    /**
     * Centrum wypraw
     */
    case "trip":
      return (
        <BackpackIcon
          className={className}
        />
      );

    /**
     * Moje połowy
     */
    case "catch":
      return (
        <FishIcon
          className={`${className} -scale-x-100`}
        />
      );

    /**
     * Mój ekwipunek
     */
    case "gear":
      return (
        <HookIcon
          className={className}
        />
      );

    case "blog":
      return (
        <FormIcon
          className={className}
        />
      );

    case "add":
      return (
        <AddCircleIcon
          className={className}
        />
      );

    case "profile":
      return (
        <UserIcon
          className={className}
        />
      );

    case "settings":
      return (
        <SettingsIcon
          className={className}
        />
      );

    case "bell":
      return (
        <BellIcon
          className={className}
        />
      );

    case "users":
      return (
        <UsersIcon
          className={className}
        />
      );

    case "alert":
      return (
        <AlertIcon
          className={className}
        />
      );

    case "menu":
      return (
        <CardsIcon
          className={className}
        />
      );

    default:
      return null;
  }
}