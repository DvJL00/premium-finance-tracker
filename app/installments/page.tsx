"use client";

import { useEffect, useState } from "react";
import { AppShell } from "../components/app-shell";
import { ThemeProvider } from "../components/theme-provider";

type InstallmentItem = {
  id: string;
  installmentNumber: number;
  amount: number;
  dueDate: string;
  status: string;
};

type InstallmentPlan = {
  id: string;
  title: string;
  totalAmount: number;
  installments: number;
  category: string;
  startDate: string;
  items: InstallmentItem[];
};

const categoryOptions = [
  "Alimentação",
  "Transporte",
  "Lazer",
  "Moradia",
  "Saúde",
  "Educação",
  "Tecnologia",
  "Outros",
];

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("pt-BR");
}

function InstallmentsContent() {
  const [plans, setPlans] = useState<InstallmentPlan[]>([]);
  const [title, setTitle] = useState("");
  const [totalAmount, setTotalAmount] = useState("");
  const [installments, setInstallments] = useState("");
  const [category, setCategory] = useState("Outros");
  const [startDate, setStartDate] = useState(
    () => new Date().toISOString().split("T")[0]
  );
  const [loading, setLoading] = useState(false);
  const [payingId, setPayingId] = useState<string | null>(null);

  async function loadPlans() {
    const res = await fetch("/api/installments", {
      cache: "no-store",
    });

    const data = await res.json();
    setPlans(Array.isArray(data) ? data : []);
  }

  useEffect(() => {
    loadPlans();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const res = await fetch("/api/installments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title,
        totalAmount: Number(totalAmount),
        installments: Number(installments),
        category,
        startDate,
      }),
    });

    const data = await res.json().catch(() => null);
    setLoading(false);

    if (!res.ok) {
      alert(data?.error || "Erro ao criar parcelamento");
      return;
    }

    alert("Parcelamento criado com sucesso!");
    setTitle("");
    setTotalAmount("");
    setInstallments("");
    setCategory("Outros");
    setStartDate(new Date().toISOString().split("T")[0]);

    await loadPlans();
  }

  async function markInstallmentAsPaid(itemId: string) {
    setPayingId(itemId);

    const res = await fetch("/api/installments", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        itemId,
        status: "paid",
      }),
    });

    const data = await res.json().catch(() => null);
    setPayingId(null);

    if (!res.ok) {
      alert(data?.error || "Erro ao marcar parcela como paga");
      return;
    }

    await loadPlans();
  }

  return (
    <AppShell
      title="Sistema de Parcelas"
      subtitle="Organize compras parceladas e acompanhe vencimentos futuros."
    >
      <div className="grid gap-6 xl:grid-cols-[0.9fr,1.1fr]">
        <section className="app-panel rounded-3xl p-6">
          <h3 className="mb-5 text-xl font-bold">Novo parcelamento</h3>

          <form onSubmit={handleSubmit} className="grid gap-4">
            <input
              type="text"
              placeholder="Título da compra"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="app-input"
            />

            <input
              type="number"
              placeholder="Valor total"
              value={totalAmount}
              onChange={(e) => setTotalAmount(e.target.value)}
              className="app-input"
            />

            <input
              type="number"
              placeholder="Quantidade de parcelas"
              value={installments}
              onChange={(e) => setInstallments(e.target.value)}
              className="app-input"
            />

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="app-input"
            >
              {categoryOptions.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>

            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="app-input"
            />

            <button
              type="submit"
              disabled={
                loading || !title || !totalAmount || !installments || !startDate
              }
              className="app-button app-button-primary"
            >
              {loading ? "Criando..." : "Criar parcelamento"}
            </button>
          </form>
        </section>

        <section className="app-panel rounded-3xl p-6">
          <h3 className="mb-5 text-xl font-bold">Parcelamentos criados</h3>

          <div className="space-y-4">
            {plans.length === 0 && (
              <p className="app-muted">Nenhum parcelamento cadastrado.</p>
            )}

            {plans.map((plan) => (
              <div
                key={plan.id}
                className="rounded-2xl border border-[var(--border)] p-4"
              >
                <div className="mb-3">
                  <p className="text-lg font-semibold">{plan.title}</p>
                  <p className="text-sm app-muted">{plan.category}</p>
                  <p className="mt-1 text-sm">
                    Total: <strong>{formatCurrency(plan.totalAmount)}</strong>
                  </p>
                  <p className="text-sm">
                    Parcelas: <strong>{plan.installments}x</strong>
                  </p>
                </div>

                <div className="space-y-2">
                  {plan.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex flex-col gap-3 rounded-xl border border-[var(--border)] px-3 py-3 md:flex-row md:items-center md:justify-between"
                    >
                      <div>
                        <p className="text-sm font-medium">
                          Parcela {item.installmentNumber}
                        </p>
                        <p className="text-xs app-muted">
                          Vence em {formatDate(item.dueDate)}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <p className="font-semibold">
                          {formatCurrency(item.amount)}
                        </p>

                        <span
                          className={
                            item.status === "paid"
                              ? "rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700 dark:bg-green-500/15 dark:text-green-400"
                              : "rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-700 dark:bg-yellow-500/15 dark:text-yellow-400"
                          }
                        >
                          {item.status === "paid" ? "Paga" : "Pendente"}
                        </span>

                        {item.status !== "paid" && (
                          <button
                            onClick={() => markInstallmentAsPaid(item.id)}
                            disabled={payingId === item.id}
                            className="app-button app-button-primary"
                          >
                            {payingId === item.id
                              ? "Marcando..."
                              : "Marcar como paga"}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}

export default function InstallmentsPage() {
  return (
    <ThemeProvider>
      <InstallmentsContent />
    </ThemeProvider>
  );
}
