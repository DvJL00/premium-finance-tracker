import { NextResponse } from "next/server";
import { prisma } from "../../lib/prisma";
import { getCurrentUser } from "../../lib/auth";

export async function GET() {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const reminders = await prisma.paymentReminder.findMany({
      where: {
        userId: currentUser.userId,
      },
      orderBy: {
        dueDate: "asc",
      },
    });

    return NextResponse.json(reminders);
  } catch (error) {
    return NextResponse.json(
      {
        error: "Erro ao buscar agenda",
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
    const { title, amount, category, dueDate, type, recurring, frequency, notes } = body;

    if (!title || !amount || !category || !dueDate || !type) {
      return NextResponse.json(
        { error: "Preencha os campos obrigatórios" },
        { status: 400 }
      );
    }

    const reminder = await prisma.paymentReminder.create({
      data: {
        title: String(title).trim(),
        amount: Number(amount),
        category: String(category),
        dueDate: new Date(dueDate),
        type: String(type),
        recurring: Boolean(recurring),
        frequency: frequency || null,
        notes: notes || null,
        userId: currentUser.userId,
      },
    });

    return NextResponse.json(reminder, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Erro ao criar pagamento agendado",
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
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json(
        { error: "ID e status são obrigatórios" },
        { status: 400 }
      );
    }

    const existingReminder = await prisma.paymentReminder.findFirst({
      where: {
        id: String(id),
        userId: currentUser.userId,
      },
    });

    if (!existingReminder) {
      return NextResponse.json(
        { error: "Lembrete não encontrado" },
        { status: 404 }
      );
    }

    if (existingReminder.status === "paid") {
      return NextResponse.json(
        { error: "Esse lembrete já foi marcado como pago" },
        { status: 400 }
      );
    }

    const updatedReminder = await prisma.paymentReminder.update({
      where: {
        id: existingReminder.id,
      },
      data: {
        status: String(status),
      },
    });

    if (status === "paid") {
      await prisma.transaction.create({
        data: {
          title: existingReminder.title,
          amount: Number(existingReminder.amount),
          type: "expense",
          category: existingReminder.category,
          date: new Date(existingReminder.dueDate),
          userId: currentUser.userId,
        },
      });
    }

    return NextResponse.json(updatedReminder);
  } catch (error) {
    return NextResponse.json(
      {
        error: "Erro ao atualizar agenda",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}