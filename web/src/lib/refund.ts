export const REFUND_WINDOW_DAYS = 7;

export function isWithinRefundWindow(subscriptionStartedAt: string | null | undefined): boolean {
  if (!subscriptionStartedAt) return false;
  const startedAt = new Date(subscriptionStartedAt).getTime();
  if (Number.isNaN(startedAt)) return false;
  const windowMs = REFUND_WINDOW_DAYS * 24 * 60 * 60 * 1000;
  return Date.now() - startedAt <= windowMs;
}
