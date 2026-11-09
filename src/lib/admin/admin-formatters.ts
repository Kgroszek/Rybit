export function formatAdminDate(
  value:
    | Date
    | string
    | null
    | undefined
) {
  if (!value) {
    return "Brak";
  }

  const date =
    value instanceof Date
      ? value
      : new Date(value);

  return new Intl.DateTimeFormat(
    "pl-PL",
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  ).format(date);
}

export function formatAdminDateOnly(
  value:
    | Date
    | string
    | null
    | undefined
) {
  if (!value) {
    return "Brak";
  }

  const date =
    value instanceof Date
      ? value
      : new Date(value);

  return new Intl.DateTimeFormat(
    "pl-PL",
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }
  ).format(date);
}

export function formatAdminWeight(
  value: number | null | undefined
) {
  return value == null
    ? "Brak"
    : `${value.toFixed(2)} kg`;
}

export function formatAdminLength(
  value: number | null | undefined
) {
  return value == null
    ? "Brak"
    : `${value.toFixed(0)} cm`;
}

export function clampAdminPage(
  value: string | null | undefined
) {
  const page = Number.parseInt(
    value ?? "1",
    10
  );

  return Number.isFinite(page) &&
    page > 0
    ? page
    : 1;
}

export function getAdminPagination(
  total: number,
  page: number,
  perPage: number
) {
  const totalPages =
    Math.max(
      1,
      Math.ceil(
        total / perPage
      )
    );

  return {
    page: Math.min(
      page,
      totalPages
    ),
    totalPages,
    skip:
      (Math.min(
        page,
        totalPages
      ) -
        1) *
      perPage,
  };
}
