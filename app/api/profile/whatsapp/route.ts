import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { getCurrentUser } from "../../../lib/auth";

export async function PATCH(req: Request) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { phoneNumber } = body;

    if (!phoneNumber) {
      return NextResponse.json(
        { error: "Informe o número do WhatsApp" },
        { status: 400 }
      );
    }

    const updatedUser = await prisma.user.update({
      where: {
        id: currentUser.id,
      },
      data: {
        phoneNumber: String(phoneNumber).trim(),
      },
    });

    return NextResponse.json({
      ok: true,
      user: {
        id: updatedUser.id,
        phoneNumber: updatedUser.phoneNumber,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Erro ao vincular WhatsApp",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}