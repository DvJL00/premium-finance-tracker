"use client";

import { useEffect, useState } from "react";
import { AppShell } from "../components/app-shell";
import { ThemeProvider } from "../components/theme-provider";

type Reminder = {
  id: string;
  title: string;
  amount: number;
  category: string;
  dueDate: string;
  type: string;
  status: string;
};

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("pt-BR");
}

function AgendaContent() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Contas");
  const [dueDate, setDueDate] = useState(
    () => new Date().toISOString().split("T")[0]
  );
  const [type, setType] = useState("conta");
  const [loading, setLoading] = useState(false);

  async function loadReminders() {
    const res = await fetch("/api/reminders", {
      cache: "no-store",
    });

    const data = await res.json();
    setReminders(Array.isArray(data) ? data : []);
  }

  useEffect(() => {
    loadReminders();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const res = await fetch("/api/reminders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ title, amount: Number(amount), category, dueDate, type }),
    });

    const data = await res.json().catch(() => null);
    setLoading(false);

    if (!res.ok) {
      alert(data?.error || "Erro ao criar lembrete");
      return;
    }

    setTitle("");
    setAmount("");
    setCategory("Contas");
    setDueDate(new Date().toISOString().split("T")[0]);
    setType("conta");

    await loadReminders();
  }

  async function markAsPaid(id: string) {
    const res = await fetch("/api/reminders", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id, status: "paid" }),
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      alert(data?.error || "Erro ao atualizar lembrete");
      return;
    }

    await loadReminders();
  }

  return (
    <AppShell
      title="Agenda Financeira"
      subtitle="Acompanhe contas, vencimentos e pagamentos futuros."
    >
      <div className="grid gap-6 xl:grid-cols-[0.95fr,1.05fr]">
        <section className="app-panel rounded-3xl p-6">
          <h3 className="mb-5 text-xl font-bold">Novo lembrete</h3>

          <form onSubmit={handleSubmit} className="grid gap-4">
            <input
              type="text"
              placeholder="Título"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="app-input"
            />

            <input
              type="number"
              placeholder="Valor"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="app-input"
            />

            <input
              type="text"
              placeholder="Categoria"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="app-input"
            />

            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="app-input"
            >
              <option value="conta">Conta</option>
              <option value="parcela">Parcela</option>
              <option value="assinatura">Assinatura</option>
              <option value="outro">Outro</option>
            </select>

            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="app-input"
            />

            <button
              type="submit"
              disabled={loading || !title || !amount || !dueDate}
              className="app-button app-button-primary"
            >
              {loading ? "Salvando..." : "Adicionar lembrete"}
            </button>
          </form>
        </section>

        <section className="app-panel rounded-3xl p-6">
          <h3 className="mb-5 text-xl font-bold">Pagamentos agendados</h3>

          <div className="space-y-3">
            {reminders.length === 0 && (
              <p className="app-muted">Nenhum pagamento agendado.</p>
            )}

            {reminders.map((reminder) => (
              <div
                key={reminder.id}
                className="flex flex-col gap-3 rounded-2xl border border-[var(--border)] px-4 py-4 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <p className="text-lg font-semibold">{reminder.title}</p>
                  <p className="text-sm app-muted">{reminder.category}</p>
                  <p className="mt-1 text-xs app-muted">
                    Vence em {formatDate(reminder.dueDate)}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <p className="font-bold text-[var(--primary)]">
                    {formatCurrency(reminder.amount)}
                  </p>

                  <span
                    className={
                      reminder.status === "paid"
                        ? "rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700 dark:bg-green-500/15 dark:text-green-400"
                        : "rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-700 dark:bg-yellow-500/15 dark:text-yellow-400"
                    }
                  >
                    {reminder.status === "paid" ? "Pago" : "Pendente"}
                  </span>

                  {reminder.status !== "paid" && (
                    <button
                      onClick={() => markAsPaid(reminder.id)}
                      className="app-button app-button-primary"
                    >
                      Marcar como pago
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}

export default function AgendaPage() {
  return (
    <ThemeProvider>
      <AgendaContent />
    </ThemeProvider>
  );
}
