import { NextResponse } from "next/server";
import { canUsePaidFeatures } from "./plan";

export function requirePaidPlan(user: {
  plan: string;
  trialEndsAt: Date | string | null;
  planEndsAt: Date | string | null;
}) {
  if (!canUsePaidFeatures(user)) {
    return NextResponse.json(
      {
        error: "Plano necessário para acessar essa funcionalidade.",
        code: "PLAN_REQUIRED",
      },
      { status: 403 }
    );
  }

  return null;
}