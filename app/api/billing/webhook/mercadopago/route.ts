import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { MercadoPagoConfig, Payment } from "mercadopago";

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN!,
});

const paymentClient = new Payment(client);

function getPlanEndDate(billingCycle: string) {
  const now = new Date();

  if (billingCycle === "yearly") {
    now.setFullYear(now.getFullYear() + 1);
  } else {
    now.setMonth(now.getMonth() + 1);
  }

  return now;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    console.log("WEBHOOK RECEBIDO:", body);

    if (body.type !== "payment") {
      return NextResponse.json({ ok: true });
    }

    const paymentId = body.data?.id;

    if (!paymentId) {
      return NextResponse.json({ ok: true });
    }

    const paymentData = await paymentClient.get({
      id: String(paymentId),
    });

    const payment = paymentData as any;

    const status = payment.status;
    const externalReference = payment.external_reference
      ? JSON.parse(payment.external_reference)
      : null;

    if (!externalReference?.userId) {
      return NextResponse.json({ ok: true });
    }

    const { userId, plan, billingCycle } = externalReference;

    // salva pagamento
    await prisma.payment.upsert({
      where: {
        providerRef: String(payment.id),
      },
      update: {
        status,
      },
      create: {
        provider: "mercadopago",
        providerRef: String(payment.id),
        plan,
        billingCycle,
        amount: Number(payment.transaction_amount || 0),
        status,
        userId,
      },
    });

    // só ativa se aprovado
    if (status === "approved") {
      await prisma.user.update({
        where: { id: userId },
        data: {
          plan,
          billingCycle,
          planEndsAt: getPlanEndDate(billingCycle),
        },
      });

      console.log("PLANO ATUALIZADO:", userId);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("ERRO WEBHOOK:", error);

    return NextResponse.json(
      {
        error: "Erro no webhook",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}