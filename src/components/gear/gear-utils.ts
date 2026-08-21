import type {
  FishingGearDto,
  GearFormState,
} from "@/components/gear/types";

export const EMPTY_GEAR_FORM:
  GearFormState = {
  name: "",
  quantity: "1",
  category: "rod",
  brand: "",
  model: "",
  fishingMethod: "spinning",
  condition: "good",
  status: "active",
  price: "",
  purchaseDate: "",
  note: "",
  isDefault: false,
};

export function formFromGear(
  item: FishingGearDto
): GearFormState {
  return {
    name: item.name,
    quantity: String(
      item.quantity || 1
    ),
    category: item.category,
    brand: item.brand || "",
    model: item.model || "",
    fishingMethod:
      item.fishingMethod,
    condition: item.condition,
    status: item.status,
    price:
      item.price !== null
        ? String(item.price)
        : "",
    purchaseDate:
      item.purchaseDate
        ? item.purchaseDate.slice(
            0,
            10
          )
        : "",
    note: item.note || "",
    isDefault: item.isDefault,
  };
}

export function validateGearForm(
  form: GearFormState
) {
  const name = form.name.trim();

  if (
    name.length < 2 ||
    name.length > 160
  ) {
    return "Nazwa sprzętu musi mieć od 2 do 160 znaków.";
  }

  const quantity = Number(
    form.quantity
  );

  if (
    !Number.isInteger(quantity) ||
    quantity < 1 ||
    quantity > 9999
  ) {
    return "Ilość musi być liczbą całkowitą od 1 do 9999.";
  }

  if (form.price.trim()) {
    const price = Number(
      form.price
    );

    if (
      !Number.isFinite(price) ||
      price < 0 ||
      price > 10_000_000
    ) {
      return "Cena musi być poprawną liczbą od 0 do 10 000 000 zł.";
    }
  }

  if (
    form.brand.trim().length > 120
  ) {
    return "Marka może mieć maksymalnie 120 znaków.";
  }

  if (
    form.model.trim().length > 160
  ) {
    return "Model może mieć maksymalnie 160 znaków.";
  }

  if (
    form.note.trim().length > 2500
  ) {
    return "Notatka może mieć maksymalnie 2500 znaków.";
  }

  return null;
}

export function gearNeedsAttention(
  item: FishingGearDto
) {
  return (
    item.condition === "to_check" ||
    item.condition === "damaged" ||
    item.status === "to_check" ||
    item.status === "repair"
  );
}

export function gearTotalValue(
  item: FishingGearDto
) {
  return (
    (item.price || 0) *
    (item.quantity || 1)
  );
}

export function formatGearCurrency(
  value: number
) {
  return new Intl.NumberFormat(
    "pl-PL",
    {
      style: "currency",
      currency: "PLN",
      maximumFractionDigits: 0,
    }
  ).format(value);
}

export function formatGearDate(
  value: string | null
) {
  if (!value) {
    return "Brak";
  }

  return new Intl.DateTimeFormat(
    "pl-PL",
    {
      timeZone: "Europe/Warsaw",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }
  ).format(new Date(value));
}
