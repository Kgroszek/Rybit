import type { TripFormState, TripTab } from "@/components/trips/types";

export const INITIAL_TRIP_FORM: TripFormState = {
  title: "",
  lakeId: "",
  tripType: "custom",
  status: "planned",
  startsAt: "",
  endsAt: "",
  peopleCount: "1",
  note: "",
  createChecklist: true,
};

export const TRIP_TYPES = [
  { label: "Własna", value: "custom" },
  { label: "Spinning", value: "spinning" },
  { label: "Feeder", value: "feeder" },
  { label: "Method feeder", value: "method_feeder" },
  { label: "Karpiówka", value: "carp" },
  { label: "Spławik", value: "float" },
  { label: "Nocka", value: "night" },
  { label: "Zawody", value: "competition" },
] as const;

export const TRIP_TABS: ReadonlyArray<{
  label: string;
  value: TripTab;
}> = [
  { label: "Nadchodzące", value: "upcoming" },
  { label: "W trakcie", value: "active" },
  { label: "Zakończone", value: "finished" },
  { label: "Wszystkie", value: "all" },
];
