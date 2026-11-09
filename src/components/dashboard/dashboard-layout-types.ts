export type DashboardLayoutContext = {
  userName: string | null;
  userEmail: string | null;
  isAdmin: boolean;
  isOwner: boolean;
  pendingSubmissionsCount: number;
  pendingCorrectionsCount: number;
  pendingCatchReportsCount: number;
  pendingOwnerClaimsCount: number;
};
