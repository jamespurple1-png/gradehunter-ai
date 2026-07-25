export default function PortfolioPage() {
  return (
    <div className="min-h-screen bg-slate-950 px-6 py-8 text-white lg:px-10">
      <p className="text-sm font-semibold uppercase tracking-[0.25em] text-emerald-400">
        Collection
      </p>

      <h1 className="mt-2 text-4xl font-black tracking-tight">
        Portfolio
      </h1>

      <p className="mt-3 max-w-2xl text-slate-400">
        View, add and manage every card in your collection.
      </p>

      <div className="mt-10 rounded-3xl border border-slate-800 bg-slate-900/70 p-8">
        <p className="text-slate-400">
          Your portfolio will move here next.
        </p>
      </div>
    </div>
  );
}