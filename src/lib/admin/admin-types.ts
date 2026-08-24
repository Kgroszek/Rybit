export type AdminStatusVariant =
  | "neutral"
  | "primary"
  | "success"
  | "warning"
  | "danger";

export type AdminStatusMeta = {
  label: string;
  variant: AdminStatusVariant;
};

export type AdminOverviewQueue = {
  key:
    | "lake-submissions"
    | "owner-claims"
    | "corrections"
    | "catch-moderation";
  title: string;
  description: string;
  href: string;
  count: number;
};

export type AdminOverviewMetric = {
  label: string;
  value: number;
  description?: string;
};

export type AdminActivityItem = {
  id: string;
  kind:
    | "lake"
    | "lake-submission"
    | "correction"
    | "catch-report"
    | "owner-claim";
  title: string;
  description: string;
  href: string;
  createdAt: Date;
  status?: string | null;
};
