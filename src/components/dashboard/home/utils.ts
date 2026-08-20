import type {
  DashboardTask,
  DashboardTrip,
  PendingInvitation,
  PreparationSummary,
  PriorityCardData,
  RecentFinishedTrip,
} from "@/components/dashboard/home/types";

export function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

export function isTripActive(trip: DashboardTrip, now: Date) {
  if (
    ["finished", "completed", "cancelled", "canceled"].includes(
      trip.status
    )
  ) {
    return false;
  }

  const startsAt = new Date(trip.startsAt).getTime();

  if (startsAt > now.getTime()) {
    return false;
  }

  const endsAt = trip.endsAt
    ? new Date(trip.endsAt).getTime()
    : startsAt + 24 * 60 * 60 * 1000;

  return now.getTime() <= endsAt;
}

export function getHoursUntil(date: Date, now: Date) {
  return Math.max(
    0,
    Math.ceil(
      (new Date(date).getTime() - now.getTime()) /
        (60 * 60 * 1000)
    )
  );
}

export function formatTimeUntilTrip(date: Date, now: Date) {
  const hours = getHoursUntil(date, now);

  if (hours <= 1) {
    return "Za mniej niż godzinę";
  }

  if (hours < 24) {
    return `Za ${hours} godz.`;
  }

  const days = Math.ceil(hours / 24);

  if (days === 1) {
    return "Jutro";
  }

  return `Za ${days} dni`;
}

export function formatTripDateRange(
  start: Date,
  end: Date | null
) {
  const startDate = new Date(start);
  const endDate =
    end ??
    new Date(
      startDate.getTime() + 24 * 60 * 60 * 1000
    );

  const formatter = new Intl.DateTimeFormat("pl-PL", {
    day: "2-digit",
    month: "short",
  });

  const startLabel = formatter.format(startDate);
  const endLabel = formatter.format(endDate);

  return startLabel === endLabel
    ? startLabel
    : `${startLabel} – ${endLabel}`;
}

export function getPreparationSummary(
  trip: DashboardTrip
): PreparationSummary {
  const checklistItems = trip.checklist?.items ?? [];
  const gearItems = trip.gearItems ?? [];

  const checklistTotal = checklistItems.length;
  const checklistPacked = checklistItems.filter(
    (item) => item.isPacked
  ).length;
  const checklistRemaining = Math.max(
    0,
    checklistTotal - checklistPacked
  );
  const importantChecklistRemaining = checklistItems.filter(
    (item) => item.isImportant && !item.isPacked
  ).length;

  const gearTotal = gearItems.length;
  const gearPacked = gearItems.filter(
    (item) => item.isPacked
  ).length;
  const gearRemaining = Math.max(
    0,
    gearTotal - gearPacked
  );
  const requiredGearRemaining = gearItems.filter(
    (item) => item.isRequired && !item.isPacked
  ).length;

  /*
   * Nie traktujemy braku checklisty/sprzętu jako "0% całej wyprawy",
   * bo użytkownik może świadomie nie korzystać z jednej z sekcji.
   * Bazowe 100 zachowuje dotychczasową semantykę dashboardu.
   */
  const dimensions = [100];

  if (checklistTotal > 0) {
    dimensions.push(
      Math.round(
        (checklistPacked / checklistTotal) * 100
      )
    );
  }

  if (gearTotal > 0) {
    dimensions.push(
      Math.round((gearPacked / gearTotal) * 100)
    );
  }

  const percent = Math.round(
    dimensions.reduce(
      (sum, value) => sum + value,
      0
    ) / dimensions.length
  );

  const messages: string[] = [];

  if (checklistTotal === 0) {
    messages.push(
      "Nie utworzono jeszcze checklisty dla tej wyprawy."
    );
  } else if (importantChecklistRemaining > 0) {
    messages.push(
      `${importantChecklistRemaining} ${
        importantChecklistRemaining === 1
          ? "ważna rzecz nie jest spakowana"
          : "ważne rzeczy nie są spakowane"
      }.`
    );
  } else if (checklistRemaining > 0) {
    messages.push(
      `${checklistRemaining} ${
        checklistRemaining === 1
          ? "rzecz została jeszcze do spakowania"
          : "rzeczy zostały jeszcze do spakowania"
      }.`
    );
  }

  if (gearTotal === 0) {
    messages.push(
      "Nie przypisano jeszcze sprzętu do wyprawy."
    );
  } else if (requiredGearRemaining > 0) {
    messages.push(
      `${requiredGearRemaining} ${
        requiredGearRemaining === 1
          ? "wymagany element sprzętu nie jest gotowy"
          : "wymagane elementy sprzętu nie są gotowe"
      }.`
    );
  } else if (gearRemaining > 0) {
    messages.push(
      `${gearRemaining} ${
        gearRemaining === 1
          ? "element sprzętu czeka na spakowanie"
          : "elementy sprzętu czekają na spakowanie"
      }.`
    );
  }

  return {
    percent,
    checklistTotal,
    checklistPacked,
    checklistRemaining,
    importantChecklistRemaining,
    gearTotal,
    gearPacked,
    gearRemaining,
    requiredGearRemaining,
    messages,
  };
}

export function getPriorityCard({
  pendingInvitation,
  activeTrip,
  upcomingTrip,
  recentFinishedTrip,
  preparation,
  catchesCount,
  savedLakesCount,
  tripsCount,
  now,
}: {
  pendingInvitation: PendingInvitation | null;
  activeTrip: DashboardTrip | null;
  upcomingTrip: DashboardTrip | null;
  recentFinishedTrip: RecentFinishedTrip | null;
  preparation: PreparationSummary | null;
  catchesCount: number;
  savedLakesCount: number;
  tripsCount: number;
  now: Date;
}): PriorityCardData {
  if (pendingInvitation) {
    return {
      eyebrow: "WYMAGA ODPOWIEDZI",
      title: `Masz zaproszenie do wyprawy „${pendingInvitation.trip.title}”`,
      description: pendingInvitation.trip.lakeName
        ? `Wyprawa odbędzie się na ${pendingInvitation.trip.lakeName}. Odpowiedz na zaproszenie, zanim zaczniesz planować wspólne przygotowania.`
        : "Odpowiedz na zaproszenie, zanim zaczniesz planować wspólne przygotowania.",
      href: "/wyprawy",
      cta: "Odpowiedz na zaproszenie",
      secondaryHref: `/wyprawy/${pendingInvitation.trip.id}`,
      secondaryCta: "Zobacz szczegóły",
      tone: "warning",
    };
  }

  if (activeTrip) {
    return {
      eyebrow: "WYPRAWA TRWA",
      title: activeTrip.title,
      description:
        "Jesteś w trakcie wyprawy. Najszybszą akcją jest teraz zapisanie połowu — wyprawa i łowisko zostaną przypisane automatycznie.",
      href: `/polowy?tripId=${activeTrip.id}`,
      cta: "Dodaj szybki połów",
      secondaryHref: `/wyprawy/${activeTrip.id}`,
      secondaryCta: "Otwórz wyprawę",
      tone: "success",
      trip: activeTrip,
      preparation,
    };
  }

  if (upcomingTrip) {
    const hoursUntil = getHoursUntil(
      upcomingTrip.startsAt,
      now
    );

    if (hoursUntil <= 36) {
      return {
        eyebrow:
          hoursUntil <= 12
            ? "WYJAZD DZISIAJ"
            : "WYJAZD JUŻ JUTRO",
        title: upcomingTrip.title,
        description:
          preparation &&
          preparation.messages.length > 0
            ? preparation.messages[0]
            : "Wyprawa jest już blisko. Sprawdź ostatni raz checklistę i sprzęt przed wyjazdem.",
        href: `/wyprawy/${upcomingTrip.id}?tab=checklista`,
        cta:
          preparation?.checklistRemaining ||
          preparation?.gearRemaining ||
          preparation?.checklistTotal === 0 ||
          preparation?.gearTotal === 0
            ? "Dokończ przygotowania"
            : "Sprawdź wyprawę",
        secondaryHref: `/wyprawy/${upcomingTrip.id}`,
        secondaryCta: "Szczegóły wyprawy",
        tone: "warning",
        trip: upcomingTrip,
        preparation,
      };
    }

    const daysUntil = Math.ceil(hoursUntil / 24);

    if (
      daysUntil <= 7 &&
      preparation &&
      preparation.messages.length > 0
    ) {
      const primaryHref =
        preparation.checklistTotal === 0 ||
        preparation.checklistRemaining > 0
          ? `/wyprawy/${upcomingTrip.id}?tab=checklista`
          : `/wyprawy/${upcomingTrip.id}?tab=sprzet`;

      return {
        eyebrow: "NASTĘPNY KROK",
        title: `Przygotuj się do „${upcomingTrip.title}”`,
        description: preparation.messages[0],
        href: primaryHref,
        cta: "Dokończ przygotowania",
        secondaryHref: `/wyprawy/${upcomingTrip.id}`,
        secondaryCta: "Zobacz wyprawę",
        tone: "info",
        trip: upcomingTrip,
        preparation,
      };
    }
  }

  if (recentFinishedTrip) {
    const extras = [
      recentFinishedTrip._count.catches > 0
        ? `${recentFinishedTrip._count.catches} połowów`
        : null,
      recentFinishedTrip._count.media > 0
        ? `${recentFinishedTrip._count.media} zdjęć`
        : null,
      recentFinishedTrip._count.costs > 0
        ? `${recentFinishedTrip._count.costs} kosztów`
        : null,
    ]
      .filter(Boolean)
      .join(" • ");

    return {
      eyebrow: "PO WYPRAWIE",
      title: `Podsumuj „${recentFinishedTrip.title}”`,
      description: extras
        ? `Wyprawa jest zakończona. Masz już zapisane: ${extras}. Uzupełnij podsumowanie, zanim zaczniesz planować kolejny wyjazd.`
        : "Wyprawa jest zakończona. Dodaj podsumowanie i uzupełnij brakujące informacje z wyjazdu.",
      href: `/wyprawy/${recentFinishedTrip.id}?tab=podsumowanie`,
      cta: "Podsumuj wyprawę",
      secondaryHref: "/wyprawy",
      secondaryCta: "Wszystkie wyprawy",
      tone: "neutral",
    };
  }

  if (upcomingTrip) {
    return {
      eyebrow: "NAJBLIŻSZA WYPRAWA",
      title: upcomingTrip.title,
      description: `${formatTimeUntilTrip(
        upcomingTrip.startsAt,
        now
      )}. Wszystkie informacje i przygotowanie masz dostępne w Centrum wypraw.`,
      href: `/wyprawy/${upcomingTrip.id}`,
      cta: "Otwórz wyprawę",
      secondaryHref: "/lowiska?view=map",
      secondaryCta: "Przeglądaj łowiska",
      tone: "info",
      trip: upcomingTrip,
      preparation,
    };
  }

  const isNewUser =
    catchesCount === 0 &&
    savedLakesCount === 0 &&
    tripsCount === 0;

  if (isNewUser) {
    return {
      eyebrow: "ZACZNIJ Z RYBIO",
      title: "Zaplanuj swoją pierwszą wyprawę",
      description:
        "Wybierz łowisko, ustaw termin, przygotuj checklistę i sprzęt. Rybio poprowadzi Cię przez przygotowania krok po kroku.",
      href: "/wyprawy",
      cta: "Zaplanuj pierwszą wyprawę",
      secondaryHref: "/lowiska?view=map",
      secondaryCta: "Najpierw znajdź łowisko",
      tone: "info",
    };
  }

  return {
    eyebrow: "CO TERAZ?",
    title:
      "Czas zaplanować kolejny wyjazd nad wodę",
    description:
      "Nie masz obecnie zaplanowanej wyprawy. Możesz od razu utworzyć nowy plan albo najpierw znaleźć odpowiednie łowisko.",
    href: "/wyprawy",
    cta: "Zaplanuj wyprawę",
    secondaryHref: "/lowiska?view=map",
    secondaryCta: "Znajdź łowisko",
    tone: "info",
  };
}

export function buildTodayTasks({
  pendingInvitation,
  activeTrip,
  upcomingTrip,
  recentFinishedTrip,
  preparation,
  now,
}: {
  pendingInvitation: PendingInvitation | null;
  activeTrip: DashboardTrip | null;
  upcomingTrip: DashboardTrip | null;
  recentFinishedTrip: RecentFinishedTrip | null;
  preparation: PreparationSummary | null;
  now: Date;
}): DashboardTask[] {
  const tasks: DashboardTask[] = [];

  if (pendingInvitation) {
    tasks.push({
      key: "invitation",
      href: "/wyprawy",
      icon: "users",
      title: "Odpowiedz na zaproszenie",
      description: pendingInvitation.trip.title,
      badge: "Nowe",
    });
  }

  if (activeTrip) {
    tasks.push({
      key: "active-catch",
      href: `/polowy?tripId=${activeTrip.id}`,
      icon: "fish",
      title: "Dodaj szybki połów",
      description: `Wyprawa „${activeTrip.title}” właśnie trwa.`,
      badge: "Teraz",
    });
  }

  const preparationTrip = activeTrip ?? upcomingTrip;

  if (preparationTrip && preparation) {
    if (preparation.checklistTotal === 0) {
      tasks.push({
        key: "checklist-empty",
        href: `/wyprawy/${preparationTrip.id}?tab=checklista`,
        icon: "checklist",
        title: "Utwórz checklistę",
        description:
          "Nie masz jeszcze listy rzeczy na tę wyprawę.",
      });
    } else if (preparation.checklistRemaining > 0) {
      tasks.push({
        key: "checklist",
        href: `/wyprawy/${preparationTrip.id}?tab=checklista`,
        icon: "checklist",
        title: `${preparation.checklistRemaining} ${
          preparation.checklistRemaining === 1
            ? "rzecz"
            : "rzeczy"
        } do spakowania`,
        description: preparationTrip.title,
        badge:
          preparation.importantChecklistRemaining > 0
            ? `${preparation.importantChecklistRemaining} ważne`
            : undefined,
      });
    }

    if (preparation.gearTotal === 0) {
      tasks.push({
        key: "gear-empty",
        href: `/wyprawy/${preparationTrip.id}?tab=sprzet`,
        icon: "backpack",
        title: "Dodaj sprzęt do wyprawy",
        description:
          "Powiąż przygotowanie z Twoim Ekwipunkiem.",
      });
    } else if (preparation.gearRemaining > 0) {
      tasks.push({
        key: "gear",
        href: `/wyprawy/${preparationTrip.id}?tab=sprzet`,
        icon: "backpack",
        title: `${preparation.gearRemaining} ${
          preparation.gearRemaining === 1
            ? "element"
            : "elementy"
        } sprzętu czekają`,
        description: preparationTrip.title,
        badge:
          preparation.requiredGearRemaining > 0
            ? `${preparation.requiredGearRemaining} wymagane`
            : undefined,
      });
    }
  }

  if (
    upcomingTrip &&
    getHoursUntil(upcomingTrip.startsAt, now) <= 36
  ) {
    tasks.push({
      key: "departure",
      href: `/wyprawy/${upcomingTrip.id}`,
      icon: "calendar",
      title:
        getHoursUntil(upcomingTrip.startsAt, now) <= 12
          ? "Wyprawa rozpoczyna się dzisiaj"
          : "Wyprawa rozpoczyna się jutro",
      description: upcomingTrip.title,
      badge: "Blisko",
    });
  }

  if (recentFinishedTrip) {
    tasks.push({
      key: "summary",
      href: `/wyprawy/${recentFinishedTrip.id}?tab=podsumowanie`,
      icon: "summary",
      title: "Podsumuj ostatnią wyprawę",
      description: recentFinishedTrip.title,
    });
  }

  return tasks;
}

export function getUserDisplayName(user: {
  email?: string | null;
  user_metadata?: {
    name?: unknown;
    full_name?: unknown;
    display_name?: unknown;
  };
}) {
  if (typeof user.user_metadata?.name === "string") {
    return user.user_metadata.name;
  }

  if (
    typeof user.user_metadata?.full_name === "string"
  ) {
    return user.user_metadata.full_name;
  }

  if (
    typeof user.user_metadata?.display_name === "string"
  ) {
    return user.user_metadata.display_name;
  }

  return "Wędkarzu";
}
