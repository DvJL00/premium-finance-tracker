"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, CalendarDays, CreditCard, LogOut, Moon, Sun } from "lucide-react";
import { useTheme } from "./theme-provider";

type AppShellProps = {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
};

const navItems = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: "/installments",
    label: "Parcelas",
    icon: CreditCard,
  },
  {
    href: "/agenda",
    label: "Agenda",
    icon: CalendarDays,
  },
];

export function AppShell({ title, subtitle, children }: AppShellProps) {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();

  async function handleLogout() {
    await fetch("/api/auth/logout", {
      method: "POST",
    });

    window.location.href = "/login";
  }

  return (
    <div className="app-shell flex min-h-screen">
      <aside className="app-sidebar hidden w-72 shrink-0 flex-col justify-between p-6 md:flex">
        <div>
          <div className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] app-muted">
              TentaFinZap
            </p>
            <h1 className="mt-2 text-2xl font-bold">Painel Financeiro</h1>
            <p className="mt-2 text-sm app-muted">
              Controle profissional do seu dinheiro, parcelas e agenda.
            </p>
          </div>

          <nav className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
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
      </aside>

      <div className="flex min-h-screen flex-1 flex-col">
        <header className="border-b border-[var(--border)] bg-[var(--bg-soft)] px-4 py-4 md:px-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold">{title}</h2>
              {subtitle && <p className="mt-1 text-sm app-muted">{subtitle}</p>}
            </div>

            <button
              onClick={toggleTheme}
              className="app-button app-button-secondary md:hidden"
            >
              {theme === "dark" ? "Claro" : "Escuro"}
            </button>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 md:px-8">{children}</main>
      </div>
    </div>
  );
}