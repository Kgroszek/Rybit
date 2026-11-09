type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

async function parseResponse(response: Response): Promise<UnknownRecord> {
  try {
    const value = (await response.json()) as unknown;
    return isRecord(value) ? value : {};
  } catch {
    return {};
  }
}

export class TripActionRequestError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "TripActionRequestError";
    this.status = status;
  }
}

export async function requestTripAction<T = UnknownRecord>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
  const response = await fetch(input, init);
  const data = await parseResponse(response);

  if (!response.ok) {
    const message = typeof data.message === "string" && data.message.trim()
      ? data.message
      : "Nie udało się wykonać operacji.";
    throw new TripActionRequestError(message, response.status);
  }

  return data as T;
}

export function getActionErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error && error.message.trim() ? error.message : fallback;
}

export function isAbortError(error: unknown) {
  return error instanceof DOMException && error.name === "AbortError";
}
