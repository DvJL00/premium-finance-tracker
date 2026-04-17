"use client";

import { useEffect, useMemo, useState } from "react";
import { Pencil, Trash2, TrendingDown, TrendingUp, Wallet } from "lucide-react";
import { AppShell } from "../components/app-shell";
import { ThemeProvider } from "../components/theme-provider";

type Transaction = {
  id: string;
  title: string;
  amount: number;
  type: "income" | "expense";
  category: string;
  date: string;
};

const categoryOptions = [
  "Salário",
  "Freelance",
  "Investimentos",
  "Alimentação",
  "Transporte",
  "Lazer",
  "Moradia",
  "Saúde",
  "Educação",
  "Assinaturas",
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

function DashboardContent() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<"income" | "expense">("income");
  const [category, setCategory] = useState("Salário");
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);

  const [filterMonth, setFilterMonth] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterType, setFilterType] = useState("");
  const [search, setSearch] = useState("");

  async function loadTransactions() {
    const params = new URLSearchParams();

    if (filterMonth) params.set("month", filterMonth);
    if (filterCategory) params.set("category", filterCategory);
    if (filterType) params.set("type", filterType);
    if (search) params.set("search", search);

    const res = await fetch(`/api/transactions?${params.toString()}`, {
      cache: "no-store",
    });

    const data = await res.json();
    setTransactions(Array.isArray(data) ? data : []);
  }

  useEffect(() => {
    loadTransactions();
  }, [filterMonth, filterCategory, filterType, search]);

  const totalIncome = useMemo(
    () =>
      transactions
        .filter((t) => t.type === "income")
        .reduce((acc, t) => acc + Number(t.amount), 0),
    [transactions]
  );

  const totalExpense = useMemo(
    () =>
      transactions
        .filter((t) => t.type === "expense")
        .reduce((acc, t) => acc + Number(t.amount), 0),
    [transactions]
  );

  const balance = totalIncome - totalExpense;

  function resetForm() {
    setTitle("");
    setAmount("");
    setType("income");
    setCategory("Salário");
    setDate(new Date().toISOString().split("T")[0]);
    setEditingId(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const payload = {
      title,
      amount: Number(amount),
      type,
      category,
      date,
    };

    const res = await fetch("/api/transactions", {
      method: editingId ? "PATCH" : "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(editingId ? { id: editingId, ...payload } : payload),
    });

    const data = await res.json().catch(() => null);
    setLoading(false);

    if (!res.ok) {
      alert(data?.error || "Erro ao salvar transação");
      return;
    }

    resetForm();
    await loadTransactions();
  }

  async function handleDelete(id: string) {
    setDeletingId(id);

    const res = await fetch("/api/transactions", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id }),
    });

    const data = await res.json().catch(() => null);
    setDeletingId(null);

    if (!res.ok) {
      alert(data?.error || "Erro ao excluir transação");
      return;
    }

    await loadTransactions();
  }

  function startEdit(transaction: Transaction) {
    setEditingId(transaction.id);
    setTitle(transaction.title);
    setAmount(String(transaction.amount));
    setType(transaction.type);
    setCategory(transaction.category);
    setDate(new Date(transaction.date).toISOString().split("T")[0]);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <AppShell
      title="Dashboard"
      subtitle="Visualize seu saldo, gerencie transações e acompanhe sua evolução financeira."
    >
      <div className="grid gap-4 md:grid-cols-3">
        <div className="app-panel rounded-3xl p-6">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm app-muted">Entradas</span>
            <TrendingUp className="h-5 w-5 text-[var(--success)]" />
          </div>
          <p className="text-3xl font-bold text-[var(--success)]">
            {formatCurrency(totalIncome)}
          </p>
        </div>

        <div className="app-panel rounded-3xl p-6">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm app-muted">Saídas</span>
            <TrendingDown className="h-5 w-5 text-[var(--danger)]" />
          </div>
          <p className="text-3xl font-bold text-[var(--danger)]">
            {formatCurrency(totalExpense)}
          </p>
        </div>

        <div className="app-panel rounded-3xl p-6">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm app-muted">Saldo</span>
            <Wallet className="h-5 w-5 text-[var(--primary)]" />
          </div>
          <p className="text-3xl font-bold text-[var(--primary)]">
            {formatCurrency(balance)}
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.1fr,0.9fr]">
        <section className="app-panel rounded-3xl p-6">
          <h3 className="mb-5 text-xl font-bold">
            {editingId ? "Editar transação" : "Nova transação"}
          </h3>

          <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
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

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="app-input"
            >
              {categoryOptions.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>

            <select
              value={type}
              onChange={(e) => setType(e.target.value as "income" | "expense")}
              className="app-input"
            >
              <option value="income">Entrada</option>
              <option value="expense">Saída</option>
            </select>

            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="app-input md:col-span-2"
            />

            <div className="flex gap-3 md:col-span-2">
              <button
                type="submit"
                disabled={loading || !title.trim() || !amount || !category || !date}
                className="app-button app-button-primary flex-1"
              >
                {loading
                  ? "Salvando..."
                  : editingId
                  ? "Salvar edição"
                  : "Adicionar transação"}
              </button>

              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="app-button app-button-secondary"
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </section>

        <section className="app-panel rounded-3xl p-6">
          <h3 className="mb-5 text-xl font-bold">Filtros</h3>

          <div className="grid gap-4">
            <input
              type="month"
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
              className="app-input"
            />

            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="app-input"
            >
              <option value="">Todas categorias</option>
              {categoryOptions.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="app-input"
            >
              <option value="">Todos tipos</option>
              <option value="income">Entrada</option>
              <option value="expense">Saída</option>
            </select>

            <input
              type="text"
              placeholder="Buscar por nome"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="app-input"
            />
          </div>
        </section>
      </div>

      <section className="app-panel mt-6 rounded-3xl p-6">
        <h3 className="mb-5 text-xl font-bold">Transações</h3>

        <div className="space-y-3">
          {transactions.length === 0 && (
            <p className="app-muted">Nenhuma transação encontrada.</p>
          )}

          {transactions.map((transaction) => (
            <div
              key={transaction.id}
              className="flex flex-col gap-3 rounded-2xl border border-[var(--border)] bg-[var(--bg-soft)] px-4 py-4 md:flex-row md:items-center md:justify-between"
            >
              <div>
                <p className="text-lg font-semibold">{transaction.title}</p>
                <p className="text-sm app-muted">{transaction.category}</p>
                <p className="mt-1 text-xs app-muted">{formatDate(transaction.date)}</p>
              </div>

              <div className="flex items-center gap-3">
                <p
                  className={
                    transaction.type === "income"
                      ? "text-lg font-bold text-[var(--success)]"
                      : "text-lg font-bold text-[var(--danger)]"
                  }
                >
                  {transaction.type === "income" ? "+" : "-"}{" "}
                  {formatCurrency(transaction.amount)}
                </p>

                <button
                  onClick={() => startEdit(transaction)}
                  className="rounded-xl border border-[var(--border)] p-2 hover:bg-[var(--bg-muted)]"
                  title="Editar"
                >
                  <Pencil className="h-4 w-4" />
                </button>

                <button
                  onClick={() => handleDelete(transaction.id)}
                  disabled={deletingId === transaction.id}
                  className="rounded-xl border border-[var(--border)] p-2 hover:bg-[var(--bg-muted)] disabled:opacity-60"
                  title="Excluir"
                >
                  <Trash2 className="h-4 w-4 text-[var(--danger)]" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </AppShell>
  );
}

export default function DashboardPage() {
  return (
    <ThemeProvider>
      <DashboardContent />
    </ThemeProvider>
  );
}