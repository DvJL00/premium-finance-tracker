"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Trash2,
  TrendingUp,
  TrendingDown,
  Wallet,
  CalendarDays,
} from "lucide-react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";

type Transaction = {
  id: string;
  title: string;
  amount: number;
  type: "income" | "expense";
  category: string;
  date: string;
  createdAt: string;
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

const pieColors = ["#22c55e", "#ef4444"];

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("pt-BR");
}

export default function DashboardPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<"income" | "expense">("income");
  const [category, setCategory] = useState("Salário");
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function loadTransactions() {
    const res = await fetch("/api/transactions", {
      cache: "no-store",
    });

    const data = await res.json();
    setTransactions(Array.isArray(data) ? data : []);
  }

  useEffect(() => {
    loadTransactions();
  }, []);

  const totalIncome = useMemo(() => {
    return transactions
      .filter((t) => t.type === "income")
      .reduce((acc, t) => acc + Number(t.amount), 0);
  }, [transactions]);

  const totalExpense = useMemo(() => {
    return transactions
      .filter((t) => t.type === "expense")
      .reduce((acc, t) => acc + Number(t.amount), 0);
  }, [transactions]);

  const balance = totalIncome - totalExpense;

  const pieData = useMemo(() => {
    return [
      { name: "Entradas", value: totalIncome },
      { name: "Saídas", value: totalExpense },
    ].filter((item) => item.value > 0);
  }, [totalIncome, totalExpense]);

  const monthlyBarData = useMemo(() => {
    const grouped = new Map<string, { month: string; income: number; expense: number }>();

    transactions.forEach((transaction) => {
      const d = new Date(transaction.date);
      const month = d.toLocaleDateString("pt-BR", {
        month: "short",
        year: "2-digit",
      });

      if (!grouped.has(month)) {
        grouped.set(month, {
          month,
          income: 0,
          expense: 0,
        });
      }

      const current = grouped.get(month)!;

      if (transaction.type === "income") {
        current.income += Number(transaction.amount);
      } else {
        current.expense += Number(transaction.amount);
      }
    });

    return Array.from(grouped.values());
  }, [transactions]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const res = await fetch("/api/transactions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title,
        amount: Number(amount),
        type,
        category,
        date,
      }),
    });

    setLoading(false);

    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      alert(errorData?.error || "Erro ao adicionar transação");
      return;
    }

    setTitle("");
    setAmount("");
    setType("income");
    setCategory("Salário");
    setDate(new Date().toISOString().split("T")[0]);

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

    setDeletingId(null);

    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      alert(errorData?.error || "Erro ao excluir transação");
      return;
    }

    await loadTransactions();
  }

  return (
    <main className="min-h-screen bg-[#030712] text-white">
      <div className="mx-auto max-w-6xl px-4 py-10 md:px-6">
        <div className="mb-10 flex flex-col gap-3">
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
            Finance Tracker
          </h1>
          <p className="text-sm text-slate-400 md:text-base">
            Controle financeiro com dashboard, gráficos e persistência em banco.
          </p>
        </div>

        <section className="mb-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl shadow-black/20 backdrop-blur">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm text-slate-400">Entradas</span>
              <TrendingUp className="h-5 w-5 text-green-400" />
            </div>
            <p className="text-3xl font-bold text-green-400">
              {formatCurrency(totalIncome)}
            </p>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl shadow-black/20 backdrop-blur">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm text-slate-400">Saídas</span>
              <TrendingDown className="h-5 w-5 text-red-400" />
            </div>
            <p className="text-3xl font-bold text-red-400">
              {formatCurrency(totalExpense)}
            </p>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl shadow-black/20 backdrop-blur">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm text-slate-400">Saldo</span>
              <Wallet className="h-5 w-5 text-cyan-400" />
            </div>
            <p className="text-3xl font-bold text-cyan-400">
              {formatCurrency(balance)}
            </p>
          </div>
        </section>

        <section className="mb-8 rounded-3xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl shadow-black/20 backdrop-blur">
          <h2 className="mb-5 text-2xl font-semibold">Nova transação</h2>

          <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
            <input
              type="text"
              placeholder="Título"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="rounded-2xl border border-slate-700 bg-[#020617] px-4 py-3 text-white outline-none transition focus:border-cyan-400"
            />

            <input
              type="number"
              placeholder="Valor"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="rounded-2xl border border-slate-700 bg-[#020617] px-4 py-3 text-white outline-none transition focus:border-cyan-400"
            />

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="rounded-2xl border border-slate-700 bg-[#020617] px-4 py-3 text-white outline-none transition focus:border-cyan-400"
            >
              {categoryOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>

            <select
              value={type}
              onChange={(e) => setType(e.target.value as "income" | "expense")}
              className="rounded-2xl border border-slate-700 bg-[#020617] px-4 py-3 text-white outline-none transition focus:border-cyan-400"
            >
              <option value="income">Entrada</option>
              <option value="expense">Saída</option>
            </select>

            <div className="relative md:col-span-2">
              <CalendarDays className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-2xl border border-slate-700 bg-[#020617] px-12 py-3 text-white outline-none transition focus:border-cyan-400"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="md:col-span-2 rounded-2xl bg-cyan-500 px-4 py-3 font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? "Salvando..." : "Adicionar transação"}
            </button>
          </form>
        </section>

        <section className="mb-8 grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl shadow-black/20 backdrop-blur">
            <h2 className="mb-5 text-2xl font-semibold">Entradas x Saídas</h2>

            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={70}
                    outerRadius={110}
                    paddingAngle={4}
                  >
                    {pieData.map((_, index) => (
                      <Cell key={index} fill={pieColors[index % pieColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      border: "1px solid #334155",
                      borderRadius: "12px",
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl shadow-black/20 backdrop-blur">
            <h2 className="mb-5 text-2xl font-semibold">Resumo por mês</h2>

            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyBarData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="month" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      border: "1px solid #334155",
                      borderRadius: "12px",
                    }}
                  />
                  <Legend />
                  <Bar dataKey="income" fill="#22c55e" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="expense" fill="#ef4444" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl shadow-black/20 backdrop-blur">
          <h2 className="mb-5 text-2xl font-semibold">Transações</h2>

          <div className="space-y-3">
            {transactions.length === 0 && (
              <p className="text-slate-400">Nenhuma transação cadastrada.</p>
            )}

            {transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex flex-col gap-3 rounded-2xl border border-slate-800 bg-[#020617] px-4 py-4 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <p className="text-lg font-medium">{transaction.title}</p>
                  <p className="text-sm text-slate-400">{transaction.category}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {formatDate(transaction.date)}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <p
                    className={
                      transaction.type === "income"
                        ? "text-lg font-semibold text-green-400"
                        : "text-lg font-semibold text-red-400"
                    }
                  >
                    {transaction.type === "income" ? "+" : "-"}{" "}
                    {formatCurrency(transaction.amount)}
                  </p>

                  <button
                    onClick={() => handleDelete(transaction.id)}
                    disabled={deletingId === transaction.id}
                    className="rounded-xl border border-red-500/40 p-2 text-red-400 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                    title="Excluir transação"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}