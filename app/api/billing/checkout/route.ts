import { NextResponse } from "next/server";
import { MercadoPagoConfig, Preference } from "mercadopago";
import { getCurrentUser } from "../../../lib/auth";
import { prisma } from "../../../lib/prisma";

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN!,
});

const preferenceClient = new Preference(client);

const PLAN_CONFIG = {
  pro_monthly: { title: "Plano Pro Mensal", amount: 19.9, plan: "pro", billingCycle: "monthly" },
  pro_yearly: { title: "Plano Pro Anual", amount: 149, plan: "pro", billingCycle: "yearly" },
  enterprise_monthly: { title: "Plano Empresa Mensal", amount: 49.9, plan: "enterprise", billingCycle: "monthly" },
  enterprise_yearly: { title: "Plano Empresa Anual", amount: 399, plan: "enterprise", billingCycle: "yearly" },
} as const;

export async function POST(req: Request) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { planKey } = body as { planKey: keyof typeof PLAN_CONFIG };

    const config = PLAN_CONFIG[planKey];

    if (!config) {
      return NextResponse.json({ error: "Plano inválido" }, { status: 400 });
    }

    const appUrl = process.env.APP_URL!;

    const preference = await preferenceClient.create({
      body: {
        items: [
          {
            id: planKey,
            title: config.title,
            quantity: 1,
            unit_price: config.amount,
            currency_id: "BRL",
          },
        ],
        payer: {
          email: currentUser.email,
        },
        back_urls: {
          success: `${appUrl}/plans?status=success`,
          failure: `${appUrl}/plans?status=failure`,
          pending: `${appUrl}/plans?status=pending`,
        },
        auto_return: "approved",
        notification_url: `${appUrl}/api/billing/webhook/mercadopago`,
        external_reference: JSON.stringify({
          userId: currentUser.id,
          plan: config.plan,
          billingCycle: config.billingCycle,
          amount: config.amount,
        }),
      },
    });

    return NextResponse.json({ initPoint: preference.init_point });
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao criar checkout", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}