import { NextResponse } from "next/server";
import { prisma } from "../../lib/prisma";
import { getCurrentUser } from "../../lib/auth";
import { requirePaidPlan } from "../../lib/feature-guard";

export async function GET() {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const block = requirePaidPlan(currentUser);
    if (block) return block;

    const plans = await prisma.installmentPlan.findMany({
      where: {
        userId: currentUser.id,
      },
      include: {
        items: {
          orderBy: {
            installmentNumber: "asc",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(plans);
  } catch (error) {
    return NextResponse.json(
      {
        error: "Erro ao buscar parcelamentos",
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

    const block = requirePaidPlan(currentUser);
    if (block) return block;

    const body = await req.json();
    const { title, totalAmount, installments, category, startDate } = body;

    if (!title || !totalAmount || !installments || !category || !startDate) {
      return NextResponse.json({ error: "Preencha todos os campos" }, { status: 400 });
    }

    const total = Number(totalAmount);
    const count = Number(installments);

    if (Number.isNaN(total) || total <= 0) {
      return NextResponse.json({ error: "Valor total inválido" }, { status: 400 });
    }

    if (Number.isNaN(count) || count <= 0) {
      return NextResponse.json({ error: "Quantidade de parcelas inválida" }, { status: 400 });
    }

    const installmentValue = Number((total / count).toFixed(2));

    const plan = await prisma.installmentPlan.create({
      data: {
        title: String(title).trim(),
        totalAmount: total,
        installments: count,
        category: String(category),
        startDate: new Date(startDate),
        userId: currentUser.id,
      },
    });

    const items = Array.from({ length: count }, (_, index) => {
      const dueDate = new Date(startDate);
      dueDate.setMonth(dueDate.getMonth() + index);

      return {
        installmentNumber: index + 1,
        amount: installmentValue,
        dueDate,
        status: "pending",
        planId: plan.id,
      };
    });

    await prisma.installmentItem.createMany({
      data: items,
    });

    return NextResponse.json({ ok: true, planId: plan.id }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Erro ao criar parcelamento",
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

    const block = requirePaidPlan(currentUser);
    if (block) return block;

    const body = await req.json();
    const { itemId, status } = body;

    if (!itemId || !status) {
      return NextResponse.json({ error: "itemId e status são obrigatórios" }, { status: 400 });
    }

    const existingItem = await prisma.installmentItem.findFirst({
      where: {
        id: String(itemId),
        plan: {
          userId: currentUser.id,
        },
      },
      include: {
        plan: true,
      },
    });

    if (!existingItem) {
      return NextResponse.json({ error: "Parcela não encontrada" }, { status: 404 });
    }

    if (existingItem.status === "paid") {
      return NextResponse.json({ error: "Essa parcela já foi marcada como paga" }, { status: 400 });
    }

    const updatedItem = await prisma.installmentItem.update({
      where: {
        id: existingItem.id,
      },
      data: {
        status: String(status),
      },
    });

    if (status === "paid") {
      await prisma.transaction.create({
        data: {
          title: `${existingItem.plan.title} - Parcela ${existingItem.installmentNumber}/${existingItem.plan.installments}`,
          amount: Number(existingItem.amount),
          type: "expense",
          category: existingItem.plan.category,
          date: new Date(existingItem.dueDate),
          userId: currentUser.id,
          installmentId: existingItem.id,
        },
      });
    }

    return NextResponse.json(updatedItem);
  } catch (error) {
    return NextResponse.json(
      {
        error: "Erro ao atualizar parcela",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}