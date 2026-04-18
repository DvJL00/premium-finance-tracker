import { NextRequest, NextResponse } from "next/server";
import { twiml, validateRequest } from "twilio";
import { prisma } from "../../../lib/prisma";
import { parseWhatsAppFinanceMessage } from "../../../lib/whatsapp-parser";

export const dynamic = "force-dynamic";

function getTwilioSignature(req: NextRequest) {
  return req.headers.get("x-twilio-signature") || "";
}

async function buildRequestUrl(req: NextRequest) {
  return req.nextUrl.toString();
}

export async function POST(req: NextRequest) {
  const formData = await req.formData();

  const bodyEntries = Object.fromEntries(formData.entries());
  const body: Record<string, string> = Object.fromEntries(
    Object.entries(bodyEntries).map(([key, value]) => [key, String(value)])
  );

  const twilioSignature = getTwilioSignature(req);
  const authToken = process.env.TWILIO_AUTH_TOKEN;

  if (authToken) {
    const url = await buildRequestUrl(req);
    const isValid = validateRequest(authToken, twilioSignature, url, body);

    if (!isValid) {
      return new NextResponse("Invalid Twilio signature", { status: 403 });
    }
  }

  const incomingText = body.Body || "";
  const from = body.From || "";
  const response = new twiml.MessagingResponse();

  if (!incomingText.trim()) {
    response.message(
      "Não consegui ler sua mensagem. Tente algo como: gastei 120 no Extra."
    );

    return new NextResponse(response.toString(), {
      status: 200,
      headers: {
        "Content-Type": "text/xml",
      },
    });
  }

  const parsed = parseWhatsAppFinanceMessage(incomingText);

  if (parsed.intent === "unknown" || !parsed.amount || !parsed.merchant) {
    response.message(
      "Não entendi totalmente. Tente algo como: gastei 120 no Extra ou recebi 1800 do salário."
    );

    return new NextResponse(response.toString(), {
      status: 200,
      headers: {
        "Content-Type": "text/xml",
      },
    });
  }

  try {
    const user = await prisma.user.findFirst({
      where: {
        phoneNumber: from,
      },
    });

    if (!user) {
      response.message(
        "Seu número ainda não está vinculado a uma conta. Entre no site e vincule seu WhatsApp primeiro."
      );

      return new NextResponse(response.toString(), {
        status: 200,
        headers: {
          "Content-Type": "text/xml",
        },
      });
    }

    const transaction = await prisma.transaction.create({
      data: {
        title: parsed.merchant,
        amount: parsed.amount,
        type: parsed.intent === "expense" ? "expense" : "income",
        category: parsed.category,
        date: new Date(parsed.date),
        userId: user.id,
      },
    });

    response.message(
      `${
        parsed.intent === "expense" ? "Lancei uma saída" : "Lancei uma entrada"
      } de R$ ${parsed.amount.toFixed(2).replace(".", ",")} em ${
        parsed.category
      }: ${transaction.title}.`
    );

    return new NextResponse(response.toString(), {
      status: 200,
      headers: {
        "Content-Type": "text/xml",
      },
    });
  } catch (error) {
    console.error("WHATSAPP WEBHOOK ERROR:", error);

    response.message(
      "Ocorreu um erro ao registrar sua movimentação. Tente novamente."
    );

    return new NextResponse(response.toString(), {
      status: 200,
      headers: {
        "Content-Type": "text/xml",
      },
    });
  }
}