import { NextResponse } from "next/server";
import { prisma } from "../../lib/prisma";
import { getCurrentUser } from "../../lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(req.url);
    const month = url.searchParams.get("month");
    const category = url.searchParams.get("category");
    const type = url.searchParams.get("type");
    const search = url.searchParams.get("search");

    let dateFilter = {};

    if (month) {
      const start = new Date(`${month}-01T00:00:00.000Z`);
      const end = new Date(start);
      end.setMonth(end.getMonth() + 1);

      dateFilter = {
        date: {
          gte: start,
          lt: end,
        },
      };
    }

    const transactions = await prisma.transaction.findMany({
      where: {
        userId: currentUser.userId,
        ...(category ? { category } : {}),
        ...(type ? { type } : {}),
        ...(search
          ? {
              title: {
                contains: search,
                mode: "insensitive",
              },
            }
          : {}),
        ...dateFilter,
      },
      orderBy: { date: "desc" },
    });

    return NextResponse.json(transactions);
  } catch (error) {
    return NextResponse.json(
      {
        error: "Erro ao buscar transações",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { title, amount, type, category, date } = body;

    if (!title || !amount || !type || !category || !date) {
      return NextResponse.json({ error: "Preencha todos os campos" }, { status: 400 });
    }

    const transaction = await prisma.transaction.create({
      data: {
        title: String(title).trim(),
        amount: Number(amount),
        type: String(type),
        category: String(category),
        date: new Date(date),
        userId: currentUser.userId,
      },
    });

    return NextResponse.json(transaction, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Erro ao criar transação",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { id, title, amount, type, category, date } = body;

    if (!id || !title || !amount || !type || !category || !date) {
      return NextResponse.json({ error: "Preencha todos os campos" }, { status: 400 });
    }

    const transaction = await prisma.transaction.update({
      where: {
        id,
        userId: currentUser.userId,
      },
      data: {
        title: String(title).trim(),
        amount: Number(amount),
        type: String(type),
        category: String(category),
        date: new Date(date),
      },
    });

    return NextResponse.json(transaction);
  } catch (error) {
    return NextResponse.json(
      {
        error: "Erro ao editar transação",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: "ID é obrigatório" }, { status: 400 });
    }

    await prisma.transaction.delete({
      where: {
        id,
        userId: currentUser.userId,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Erro ao excluir transação",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}