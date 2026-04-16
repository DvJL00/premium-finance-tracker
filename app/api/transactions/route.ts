import { NextResponse } from "next/server";
import { prisma } from "../../lib/prisma";

export const dynamic = "force-dynamic";

const API_KEY = process.env.API_KEY;

function checkAuth(req: Request) {
  const key = req.headers.get("x-api-key");
  return !!API_KEY && key === API_KEY;
}

export async function GET(req: Request) {
  try {
    if (!checkAuth(req)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const transactions = await prisma.transaction.findMany({
      orderBy: { date: "desc" },
    });

    return NextResponse.json(transactions);
  } catch (error) {
    console.error("GET /api/transactions error:", error);

    return NextResponse.json(
      { error: "Erro ao buscar transações" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    if (!checkAuth(req)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { title, amount, type, category, date } = body;

    if (!title || !amount || !type || !category || !date) {
      return NextResponse.json(
        { error: "Preencha todos os campos" },
        { status: 400 }
      );
    }

    const transaction = await prisma.transaction.create({
      data: {
        title: String(title).trim(),
        amount: Number(amount),
        type: String(type),
        category: String(category),
        date: new Date(date),
      },
    });

    return NextResponse.json(transaction, { status: 201 });
  } catch (error) {
    console.error("POST /api/transactions error:", error);

    return NextResponse.json(
      { error: "Erro ao criar transação" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    if (!checkAuth(req)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { error: "ID é obrigatório" },
        { status: 400 }
      );
    }

    await prisma.transaction.delete({
      where: { id: String(id) },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/transactions error:", error);

    return NextResponse.json(
      { error: "Erro ao excluir transação" },
      { status: 500 }
    );
  }
}