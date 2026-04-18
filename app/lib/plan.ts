export type PlanName = "free" | "trial" | "pro" | "enterprise";

export function getPlanLabel(plan: string | null | undefined) {
  switch (plan) {
    case "trial":
      return "Trial";
    case "pro":
      return "Pro";
    case "enterprise":
      return "Empresa";
    default:
      return "Free";
  }
}

export function hasActiveTrial(user: {
  plan: string;
  trialEndsAt: Date | string | null;
}) {
  if (user.plan !== "trial" || !user.trialEndsAt) return false;
  return new Date(user.trialEndsAt) > new Date();
}

export function hasActivePaidPlan(user: {
  plan: string;
  planEndsAt: Date | string | null;
}) {
  if (!["pro", "enterprise"].includes(user.plan)) return false;
  if (!user.planEndsAt) return false;
  return new Date(user.planEndsAt) > new Date();
}

export function canUsePaidFeatures(user: {
  plan: string;
  trialEndsAt: Date | string | null;
  planEndsAt: Date | string | null;
}) {
  return hasActiveTrial(user) || hasActivePaidPlan(user);
}

export function getTrialDaysLeft(trialEndsAt: Date | string | null) {
  if (!trialEndsAt) return 0;

  const diff = new Date(trialEndsAt).getTime() - Date.now();
  if (diff <= 0) return 0;

  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}