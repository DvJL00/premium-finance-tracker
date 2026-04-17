import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center h-screen bg-slate-950 text-white">
      <h1 className="text-4xl font-bold mb-4">TentaFinZap 💰</h1>
      <p className="text-slate-400 mb-6">
        Controle financeiro inteligente com automação e IA
      </p>

      <Link
        href="/dashboard"
        className="bg-cyan-500 hover:bg-cyan-600 px-6 py-3 rounded-lg font-semibold"
      >
        Acessar Dashboard
      </Link>
    </main>
  );
}