import { NextResponse } from "next/server";
import { prisma } from "../../lib/prisma";
import { getCurrentUser } from "../../lib/auth";
import { canUsePaidFeatures } from "../../lib/plan";

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
        userId: currentUser.id,
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

    const isPaid = canUsePaidFeatures(currentUser);

    if (!isPaid) {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);

      const monthlyCount = await prisma.transaction.count({
        where: {
          userId: currentUser.id,
          date: {
            gte: start,
            lt: end,
          },
        },
      });

      if (monthlyCount >= 50) {
        return NextResponse.json(
          {
            error: "O plano Free permite até 50 transações por mês. Faça upgrade para continuar.",
            code: "FREE_LIMIT_REACHED",
          },
          { status: 403 }
        );
      }
    }

    const transaction = await prisma.transaction.create({
      data: {
        title: String(title).trim(),
        amount: Number(amount),
        type: String(type),
        category: String(category),
        date: new Date(date),
        userId: currentUser.id,
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

    const existing = await prisma.transaction.findFirst({
      where: {
        id,
        userId: currentUser.id,
      },
    });

    if (!existing) {
      return NextResponse.json({ error: "Transação não encontrada" }, { status: 404 });
    }

    const transaction = await prisma.transaction.update({
      where: { id },
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

    const existing = await prisma.transaction.findFirst({
      where: {
        id,
        userId: currentUser.id,
      },
    });

    if (!existing) {
      return NextResponse.json({ error: "Transação não encontrada" }, { status: 404 });
    }

    await prisma.transaction.delete({
      where: { id },
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