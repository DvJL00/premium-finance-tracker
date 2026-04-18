"use client";

import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { AppShell } from "../components/app-shell";
import { ThemeProvider } from "../components/theme-provider";

type MeResponse = {
  id: string;
  name: string;
  email: string;
  plan: string;
  planLabel: string;
  billingCycle: string | null;
  trialDaysLeft: number;
  canUsePaidFeatures: boolean;
};

const PLANS = [
  {
    key: "free",
    planName: "free",
    billingCycle: null,
    title: "Free",
    price: "R$ 0",
    description: "Para começar a organizar suas finanças",
    features: [
      "Dashboard básico",
      "Até 50 transações por mês",
      "Visualização simples",
      "Acesso inicial ao sistema",
    ],
    cta: null,
    badge: "Começo",
  },
  {
    key: "pro_monthly",
    planName: "pro",
    billingCycle: "monthly",
    title: "Pro Mensal",
    price: "R$ 19,90/mês",
    description: "Mais flexível para uso pessoal completo",
    features: [
      "Agenda completa",
      "Sistema de parcelas",
      "Gráficos avançados",
      "Calendário integrado",
      "Teste grátis de 15 dias",
    ],
    cta: "Assinar mensal",
    badge: "Popular",
  },
  {
    key: "pro_yearly",
    planName: "pro",
    billingCycle: "yearly",
    title: "Pro Anual",
    price: "R$ 149/ano",
    description: "Melhor custo-benefício para economizar",
    features: [
      "Tudo do plano Pro",
      "Desconto no valor anual",
      "Uso contínuo por 12 meses",
      "Melhor opção para longo prazo",
    ],
    cta: "Assinar anual",
    badge: "Melhor oferta",
    highlight: true,
  },
  {
    key: "enterprise_monthly",
    planName: "enterprise",
    billingCycle: "monthly",
    title: "Empresa",
    price: "R$ 49,90/mês",
    description: "Para equipes e operações compartilhadas",
    features: [
      "Múltiplos usuários",
      "Dados compartilhados",
      "Calendário da equipe",
      "Relatórios da empresa",
      "Base para gestão empresarial",
    ],
    cta: "Assinar empresa",
    badge: "Equipe",
  },
];

function PlansContent() {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [me, setMe] = useState<MeResponse | null>(null);

  useEffect(() => {
    fetch("/api/me", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setMe(data))
      .catch(() => setMe(null));
  }, []);

  function isCurrentPlan(planName: string, billingCycle: string | null) {
    if (!me) return false;
    if (me.plan !== planName) return false;
    if (planName === "free") return true;
    return me.billingCycle === billingCycle;
  }

  async function handleCheckout(planKey: string) {
    try {
      setLoadingPlan(planKey);

      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ planKey }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        alert(data?.error || "Erro ao criar checkout");
        return;
      }

      window.location.href = data.initPoint;
    } finally {
      setLoadingPlan(null);
    }
  }

  return (
    <AppShell
      title="Planos"
      subtitle="Escolha o plano ideal para você começar, evoluir e transformar o TentaFinZap em ferramenta real de uso diário."
    >
      {me && (
        <section className="app-panel mb-6 rounded-[28px] p-6">
          <h3 className="text-xl font-bold">Seu plano atual</h3>
          <p className="mt-2">
            Você está no plano <strong>{me.planLabel}</strong>.
          </p>

          {me.plan === "trial" && (
            <p className="mt-2 text-sm app-muted">
              Faltam <strong>{me.trialDaysLeft} dias</strong> no seu teste grátis.
            </p>
          )}

          {me.plan === "free" && (
            <p className="mt-2 text-sm app-muted">
              No plano Free, você pode cadastrar até 50 transações por mês.
            </p>
          )}
        </section>
      )}

      <section className="grid gap-6 lg:grid-cols-2 2xl:grid-cols-4">
        {PLANS.map((plan) => {
          const current = isCurrentPlan(plan.planName, plan.billingCycle);

          return (
            <article
              key={plan.key}
              className={`app-panel relative rounded-[28px] p-6 ${
                plan.highlight ? "ring-2 ring-[var(--primary)]" : ""
              }`}
            >
              <div className="mb-4 flex items-center justify-between">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    plan.highlight
                      ? "bg-[var(--primary)] text-white"
                      : "bg-[var(--bg-muted)] text-[var(--text)]"
                  }`}
                >
                  {plan.badge}
                </span>
              </div>

              <h3 className="text-2xl font-bold">{plan.title}</h3>
              <p className="mt-2 text-3xl font-bold">{plan.price}</p>
              <p className="mt-3 text-sm app-muted">{plan.description}</p>

              <div className="mt-6 space-y-3">
                {plan.features.map((feature) => (
                  <div key={feature} className="flex items-start gap-3">
                    <div className="mt-0.5 rounded-full bg-[var(--bg-muted)] p-1">
                      <Check className="h-3.5 w-3.5 text-[var(--primary)]" />
                    </div>
                    <p className="text-sm">{feature}</p>
                  </div>
                ))}
              </div>

              <div className="mt-8">
                {plan.cta ? (
                  <button
                    onClick={() => handleCheckout(plan.key)}
                    disabled={loadingPlan === plan.key || current}
                    className={`app-button w-full ${
                      plan.highlight
                        ? "app-button-primary"
                        : "app-button-secondary"
                    } ${current ? "opacity-60 cursor-not-allowed" : ""}`}
                  >
                    {current
                      ? "Plano atual"
                      : loadingPlan === plan.key
                      ? "Redirecionando..."
                      : plan.cta}
                  </button>
                ) : (
                  <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-muted)] px-4 py-3 text-center text-sm font-medium app-muted">
                    {current ? "Plano atual" : "Disponível gratuitamente"}
                  </div>
                )}
              </div>
            </article>
          );
        })}
      </section>

      <section className="app-panel mt-6 rounded-[28px] p-6">
        <h3 className="text-xl font-bold">Como funciona</h3>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-[var(--border)] p-4">
            <p className="text-sm app-muted">1. Teste grátis</p>
            <p className="mt-2 font-semibold">
              Todo novo usuário começa com 15 dias para testar o sistema.
            </p>
          </div>

          <div className="rounded-2xl border border-[var(--border)] p-4">
            <p className="text-sm app-muted">2. Escolha do plano</p>
            <p className="mt-2 font-semibold">
              Depois do teste, você escolhe entre Pro Mensal, Pro Anual ou Empresa.
            </p>
          </div>

          <div className="rounded-2xl border border-[var(--border)] p-4">
            <p className="text-sm app-muted">3. Liberação automática</p>
            <p className="mt-2 font-semibold">
              Após a confirmação do pagamento, o plano é ativado no sistema.
            </p>
          </div>
        </div>
      </section>
    </AppShell>
  );
}

export default function PlansPage() {
  return (
    <ThemeProvider>
      <PlansContent />
    </ThemeProvider>
  );
}