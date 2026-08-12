export const ADMIN_EMAILS = ["support@flowlog.dev"];

type EntitlementProfile = {
  email?: string | null;
  subscription_status?: string | null;
};

export function isEntitled(profile: EntitlementProfile | null | undefined): boolean {
  if (!profile) return false;
  if (ADMIN_EMAILS.includes((profile.email || "").toLowerCase())) return true;
  return profile.subscription_status === "active" || profile.subscription_status === "trialing";
}
