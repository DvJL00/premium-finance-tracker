import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-950 px-6 text-white">
      <h1 className="mb-4 text-center text-4xl font-bold md:text-5xl">
        TentaFinZap 💰
      </h1>
      <p className="mb-8 max-w-xl text-center text-slate-400">
        Controle financeiro inteligente com filtros, parcelas, agenda e
        organização completa do seu dinheiro.
      </p>

      <div className="flex gap-4">
        <Link
          href="/login"
          className="rounded-xl bg-cyan-500 px-6 py-3 font-semibold text-slate-950 transition hover:bg-cyan-400"
        >
          Entrar
        </Link>

        <Link
          href="/register"
          className="rounded-xl border border-slate-700 px-6 py-3 font-semibold text-white transition hover:bg-slate-900"
        >
          Criar conta
        </Link>
      </div>
    </main>
  );
}