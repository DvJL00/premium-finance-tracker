import { NextResponse } from "next/server";
import { getCurrentUser } from "../../lib/auth";
import { getPlanLabel, getTrialDaysLeft, canUsePaidFeatures } from "../../lib/plan";

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      plan: user.plan,
      planLabel: getPlanLabel(user.plan),
      billingCycle: user.billingCycle,
      trialEndsAt: user.trialEndsAt,
      planEndsAt: user.planEndsAt,
      trialDaysLeft: getTrialDaysLeft(user.trialEndsAt),
      canUsePaidFeatures: canUsePaidFeatures(user),
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Erro ao buscar usuário",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}