"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  CalendarDays,
  CreditCard,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  Sun,
  WalletCards,
  X,
} from "lucide-react";
import { useTheme } from "./theme-provider";

type MeResponse = {
  id: string;
  name: string;
  email: string;
  plan: string;
  planLabel: string;
  trialDaysLeft: number;
  canUsePaidFeatures: boolean;
};

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, paid: false },
  { href: "/installments", label: "Parcelas", icon: CreditCard, paid: true },
  { href: "/agenda", label: "Agenda", icon: CalendarDays, paid: true },
  { href: "/plans", label: "Planos", icon: WalletCards, paid: false },
];

type AppShellProps = {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
};

export function AppShell({ title, subtitle, children }: AppShellProps) {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const [me, setMe] = useState<MeResponse | null>(null);

  useEffect(() => {
    fetch("/api/me", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setMe(data))
      .catch(() => setMe(null));
  }, []);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  }

  const Nav = (
    <>
      <div>
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] app-muted">
            TentaFinZap
          </p>
          <h1 className="mt-2 text-2xl font-bold">Painel Financeiro</h1>
          <p className="mt-2 text-sm app-muted">
            Controle profissional do seu dinheiro, parcelas e agenda.
          </p>

          {me && (
            <div className="mt-4 rounded-2xl border border-[var(--border)] bg-[var(--bg-muted)] px-4 py-3">
              <p className="text-sm font-semibold">Plano atual: {me.planLabel}</p>
              {me.plan === "trial" && (
                <p className="mt-1 text-xs app-muted">
                  Faltam {me.trialDaysLeft} dias no seu teste grátis
                </p>
              )}
            </div>
          )}
        </div>

        <nav className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            const locked = item.paid && me && !me.canUsePaidFeatures;

            if (locked) {
              return (
                <Link
                  key={item.href}
                  href="/plans"
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-between rounded-2xl px-4 py-3 opacity-70 transition hover:bg-[var(--bg-muted)]"
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{item.label}</span>
                  </div>
                  <span className="text-xs app-muted">Pro</span>
                </Link>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 rounded-2xl px-4 py-3 transition ${
                  active
                    ? "bg-[var(--primary)] text-white"
                    : "hover:bg-[var(--bg-muted)]"
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="space-y-3">
        <button
          onClick={toggleTheme}
          className="app-button app-button-secondary flex w-full items-center justify-center gap-2"
        >
          {theme === "dark" ? (
            <>
              <Sun className="h-4 w-4" />
              Tema claro
            </>
          ) : (
            <>
              <Moon className="h-4 w-4" />
              Tema escuro
            </>
          )}
        </button>

        <button
          onClick={handleLogout}
          className="app-button app-button-secondary flex w-full items-center justify-center gap-2"
        >
          <LogOut className="h-4 w-4" />
          Sair
        </button>
      </div>
    </>
  );

  return (
    <div className="app-shell flex min-h-screen">
      <aside className="app-sidebar hidden w-72 shrink-0 flex-col justify-between p-6 md:flex">
        {Nav}
      </aside>

      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <aside className="app-sidebar absolute left-0 top-0 flex h-full w-80 max-w-[85vw] flex-col justify-between p-6">
            <div className="mb-4 flex items-center justify-between">
              <span className="font-semibold">Menu</span>
              <button
                onClick={() => setOpen(false)}
                className="app-button app-button-secondary p-2"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            {Nav}
          </aside>
        </div>
      )}

      <div className="flex min-h-screen flex-1 flex-col">
        <header className="border-b border-[var(--border)] bg-[var(--bg-soft)] px-4 py-4 md:px-8">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <button
                onClick={() => setOpen(true)}
                className="app-button app-button-secondary p-2 md:hidden"
              >
                <Menu className="h-4 w-4" />
              </button>

              <div>
                <h2 className="text-2xl font-bold">{title}</h2>
                {subtitle && <p className="mt-1 text-sm app-muted">{subtitle}</p>}
              </div>
            </div>

            <button onClick={toggleTheme} className="app-button app-button-secondary md:hidden">
              {theme === "dark" ? "Claro" : "Escuro"}
            </button>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 md:px-8">{children}</main>
      </div>
    </div>
  );
}