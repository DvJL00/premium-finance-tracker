"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Moon, Sun } from "lucide-react";
import { ThemeProvider, useTheme } from "../components/theme-provider";

function LoginContent() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json().catch(() => null);
    setLoading(false);

    if (!res.ok) {
      alert(data?.error || "Erro ao fazer login");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-[var(--bg)] px-4 py-8 text-[var(--text)]">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl overflow-hidden rounded-[32px] border border-[var(--border)] bg-[var(--bg-soft)] shadow-[var(--shadow)]">
        <section className="hidden flex-1 flex-col justify-between bg-[var(--bg-muted)] p-10 lg:flex">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] app-muted">
              TentaFinZap
            </p>

            <h1 className="mt-6 max-w-md text-4xl font-bold leading-tight">
              Controle financeiro com cara de produto real.
            </h1>

            <p className="mt-4 max-w-lg text-base app-muted">
              Organize entradas, saídas, parcelas e pagamentos em um painel
              profissional, limpo e confiável.
            </p>
          </div>

          <div className="grid gap-4">
            <div className="rounded-3xl border border-[var(--border)] bg-[var(--bg-soft)] p-5">
              <p className="text-sm app-muted">Dashboard profissional</p>
              <p className="mt-2 text-lg font-semibold">
                Saldo, filtros, edição e visão completa das transações.
              </p>
            </div>

            <div className="rounded-3xl border border-[var(--border)] bg-[var(--bg-soft)] p-5">
              <p className="text-sm app-muted">Organização real</p>
              <p className="mt-2 text-lg font-semibold">
                Parcelas e agenda financeira em um só sistema.
              </p>
            </div>
          </div>
        </section>

        <section className="flex w-full flex-1 flex-col justify-between p-6 md:p-10">
          <div className="mb-8 flex items-center justify-between">
            <Link href="/" className="text-lg font-bold">
              TentaFinZap
            </Link>

            <button
              onClick={toggleTheme}
              className="flex items-center gap-2 rounded-2xl border border-[var(--border)] px-4 py-2 text-sm font-medium hover:bg-[var(--bg-muted)]"
            >
              {theme === "dark" ? (
                <>
                  <Sun className="h-4 w-4" />
                  Claro
                </>
              ) : (
                <>
                  <Moon className="h-4 w-4" />
                  Escuro
                </>
              )}
            </button>
          </div>

          <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center">
            <div className="mb-8">
              <h2 className="text-3xl font-bold">Entrar</h2>
              <p className="mt-2 app-muted">
                Acesse sua conta para abrir seu painel financeiro.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium app-muted">
                  E-mail
                </label>
                <input
                  type="email"
                  placeholder="voce@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="app-input"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium app-muted">
                  Senha
                </label>
                <input
                  type="password"
                  placeholder="Sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="app-input"
                />
              </div>

              <button
                type="submit"
                disabled={loading || !email || !password}
                className="app-button app-button-primary w-full"
              >
                {loading ? "Entrando..." : "Entrar"}
              </button>
            </form>

            <p className="mt-6 text-sm app-muted">
              Ainda não tem conta?{" "}
              <Link
                href="/register"
                className="font-semibold text-[var(--primary)] hover:underline"
              >
                Criar conta
              </Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <ThemeProvider>
      <LoginContent />
    </ThemeProvider>
  );
}