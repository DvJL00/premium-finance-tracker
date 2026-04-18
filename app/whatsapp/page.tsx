"use client";

import { useState } from "react";
import { AppShell } from "../components/app-shell";
import { ThemeProvider } from "../components/theme-provider";

function WhatsAppContent() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const res = await fetch("/api/profile/whatsapp", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ phoneNumber }),
    });

    const data = await res.json().catch(() => null);
    setLoading(false);

    if (!res.ok) {
      alert(data?.error || "Erro ao salvar número");
      return;
    }

    alert("WhatsApp vinculado com sucesso!");
  }

  return (
    <AppShell
      title="Integração com WhatsApp"
      subtitle="Vincule seu número para registrar transações por mensagem."
    >
      <section className="app-panel max-w-2xl rounded-3xl p-6">
        <h3 className="mb-5 text-xl font-bold">Vincular número</h3>

        <form onSubmit={handleSave} className="grid gap-4">
          <input
            type="text"
            placeholder="whatsapp:+55..."
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className="app-input"
          />

          <button
            type="submit"
            disabled={loading || !phoneNumber}
            className="app-button app-button-primary"
          >
            {loading ? "Salvando..." : "Salvar número"}
          </button>
        </form>

        <p className="mt-4 text-sm app-muted">
          Use o formato completo com país. Ex.: whatsapp:+5521999999999
        </p>
      </section>
    </AppShell>
  );
}

export default function WhatsAppPage() {
  return (
    <ThemeProvider>
      <WhatsAppContent />
    </ThemeProvider>
  );
}