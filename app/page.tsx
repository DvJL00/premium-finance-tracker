import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-950 text-white">
      <h1 className="mb-4 text-4xl font-bold">TentaFinZap 💰</h1>
      <p className="mb-6 text-slate-400">
        Controle financeiro inteligente com automação e IA
      </p>

      <Link
        href="/dashboard"
        className="rounded-lg bg-cyan-500 px-6 py-3 font-semibold text-slate-950"
      >
        Acessar Dashboard
      </Link>
    </main>
  );
}