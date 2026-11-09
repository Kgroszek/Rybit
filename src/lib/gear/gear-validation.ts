import {
  GEAR_CATEGORY_VALUES,
  GEAR_CONDITION_VALUES,
  GEAR_METHOD_VALUES,
  GEAR_STATUS_VALUES,
} from "@/lib/gear/gear-options";

export type FishingGearInput = {
  name: string;
  quantity: number;
  category: string;
  brand: string | null;
  model: string | null;
  fishingMethod: string;
  condition: string;
  status: string;
  price: number | null;
  purchaseDate: Date | null;
  note: string | null;
  isDefault: boolean;
};

export type GearValidationResult =
  | {
      ok: true;
      data: FishingGearInput;
    }
  | {
      ok: false;
      message: string;
    };

export function parseFishingGearInput(
  raw: unknown
): GearValidationResult {
  if (
    !raw ||
    typeof raw !== "object"
  ) {
    return fail(
      "Nieprawidłowe dane formularza."
    );
  }

  const body = raw as Record<
    string,
    unknown
  >;

  const name = cleanString(
    body.name
  );

  if (
    name.length < 2 ||
    name.length > 160
  ) {
    return fail(
      "Nazwa sprzętu musi mieć od 2 do 160 znaków."
    );
  }

  const category = cleanString(
    body.category
  );

  if (
    !GEAR_CATEGORY_VALUES.has(
      category
    )
  ) {
    return fail(
      "Wybierz poprawną kategorię."
    );
  }

  const fishingMethod =
    cleanString(body.fishingMethod);

  if (
    !GEAR_METHOD_VALUES.has(
      fishingMethod
    )
  ) {
    return fail(
      "Wybierz poprawną metodę łowienia."
    );
  }

  const condition = cleanString(
    body.condition
  );

  if (
    !GEAR_CONDITION_VALUES.has(
      condition
    )
  ) {
    return fail(
      "Wybierz poprawny stan techniczny."
    );
  }

  const status =
    cleanString(body.status) ||
    "active";

  if (
    !GEAR_STATUS_VALUES.has(
      status
    )
  ) {
    return fail(
      "Wybierz poprawny status użytkowania."
    );
  }

  const quantity = Number(
    body.quantity ?? 1
  );

  if (
    !Number.isInteger(quantity) ||
    quantity < 1 ||
    quantity > 9999
  ) {
    return fail(
      "Ilość musi być liczbą całkowitą od 1 do 9999."
    );
  }

  let price: number | null = null;

  if (
    body.price !== undefined &&
    body.price !== null &&
    String(body.price).trim() !== ""
  ) {
    price = Number(body.price);

    if (
      !Number.isFinite(price) ||
      price < 0 ||
      price > 10_000_000
    ) {
      return fail(
        "Cena musi być poprawną liczbą od 0 do 10 000 000 zł."
      );
    }
  }

  const brand =
    optionalString(
      body.brand,
      120
    );

  if (brand.error) {
    return fail(
      "Marka może mieć maksymalnie 120 znaków."
    );
  }

  const model =
    optionalString(
      body.model,
      160
    );

  if (model.error) {
    return fail(
      "Model może mieć maksymalnie 160 znaków."
    );
  }

  const note =
    optionalString(
      body.note,
      2500
    );

  if (note.error) {
    return fail(
      "Notatka może mieć maksymalnie 2500 znaków."
    );
  }

  const purchaseDate =
    parsePurchaseDate(
      body.purchaseDate
    );

  if (purchaseDate.error) {
    return fail(
      "Podaj poprawną datę zakupu."
    );
  }

  return {
    ok: true,
    data: {
      name,
      quantity,
      category,
      brand: brand.value,
      model: model.value,
      fishingMethod,
      condition,
      status,
      price,
      purchaseDate:
        purchaseDate.value,
      note: note.value,
      isDefault: Boolean(
        body.isDefault
      ),
    },
  };
}

function cleanString(
  value: unknown
) {
  return String(value ?? "").trim();
}

function optionalString(
  value: unknown,
  maxLength: number
): {
  value: string | null;
  error: boolean;
} {
  const clean =
    cleanString(value);

  return {
    value: clean || null,
    error:
      clean.length > maxLength,
  };
}

function parsePurchaseDate(
  value: unknown
): {
  value: Date | null;
  error: boolean;
} {
  const clean =
    cleanString(value);

  if (!clean) {
    return {
      value: null,
      error: false,
    };
  }

  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(
      clean
    )
  ) {
    return {
      value: null,
      error: true,
    };
  }

  const date = new Date(
    `${clean}T00:00:00.000Z`
  );

  if (
    Number.isNaN(date.getTime())
  ) {
    return {
      value: null,
      error: true,
    };
  }

  return {
    value: date,
    error: false,
  };
}

function fail(
  message: string
): GearValidationResult {
  return {
    ok: false,
    message,
  };
}
