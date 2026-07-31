"use client";

import ProgressRow from "@/components/dashboard/ProgressRow";
import Metric from "@/components/dashboard/Metric";
import StatCard from "@/components/dashboard/StatCard";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import AddCardModal from "@/components/cards/AddCardModal";

type Card = {
  id: number;
  name: string;
  set: string;
  buy_price: number;
  grading_cost: number;
  psa9_value: number;
  psa10_value: number;
  status: string;
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(value);
}

export default function Home() {
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCard, setEditingCard] = useState<Card | null>(null);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    fetchCards();
  }, []);

  async function fetchCards() {
    setLoading(true);
    setLoadError("");

    const { data, error } = await supabase
      .from("cards")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      setCards([]);
      setLoadError(
        error.message ||
          "Unable to load your portfolio from Supabase."
      );
      setLoading(false);
      return;
    }

    setCards(data || []);
    setLoading(false);
  }

async function deleteCard(id: number) {
  const confirmed = window.confirm(
    "Are you sure you want to delete this card?"
  );

  if (!confirmed) return;

  const { error } = await supabase
    .from("cards")
    .delete()
    .eq("id", id);

  if (error) {
    console.error(error);
    alert("Unable to delete card.");
    return;
  }

  await fetchCards();
}

  function openAddModal() {
    setEditingCard(null);
    setShowAddModal(true);
  }

  function editCard(card: Card) {
    setEditingCard(card);
    setShowAddModal(true);
  }

  function closeCardModal() {
    setShowAddModal(false);
    setEditingCard(null);
  }

  const portfolioStats = useMemo(() => {
    const totalInvested = cards.reduce((total, card) => {
      return (
        total +
        Number(card.buy_price || 0) +
        Number(card.grading_cost || 0)
      );
    }, 0);

    const potentialValue = cards.reduce((total, card) => {
      return total + Number(card.psa10_value || 0);
    }, 0);

    const potentialProfit = potentialValue - totalInvested;

    const roi =
      totalInvested > 0
        ? (potentialProfit / totalInvested) * 100
        : 0;

    return {
      totalInvested,
      potentialValue,
      potentialProfit,
      roi,
    };
  }, [cards]);

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-7xl px-6 py-8 lg:px-10">

        <header className="mb-10 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-[0.25em] text-emerald-400">
              Pokémon grading portfolio
            </p>

            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              GradeHunter AI
            </h1>

            <p className="mt-3 max-w-2xl text-slate-400">
              Track grading opportunities, portfolio value and projected
              returns from one dashboard.
            </p>
          </div>

         <button
  type="button"
  onClick={openAddModal}
  className="rounded-xl bg-emerald-400 px-5 py-3 font-bold text-slate-950 transition hover:bg-emerald-300"
>
  + Add Card
</button>
        </header>

        <section className="mb-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Cards tracked"
            value={cards.length.toString()}
            subtitle="Across your portfolio"
          />

          <StatCard
            label="Total invested"
            value={formatCurrency(portfolioStats.totalInvested)}
            subtitle="Purchase and grading costs"
          />

          <StatCard
            label="PSA 10 value"
            value={formatCurrency(portfolioStats.potentialValue)}
            subtitle="Projected portfolio value"
          />

          <StatCard
            label="Potential ROI"
            value={`${portfolioStats.roi.toFixed(1)}%`}
            subtitle={formatCurrency(portfolioStats.potentialProfit)}
            positive={portfolioStats.potentialProfit >= 0}
          />
        </section>

        <section className="mb-10 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
          <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-2xl shadow-black/20">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-400">
                  Portfolio outlook
                </p>
                <h2 className="mt-1 text-2xl font-bold">
                  Projected PSA 10 return
                </h2>
              </div>

            
            </div>

            <div className="flex h-64 items-end gap-3 rounded-2xl border border-slate-800 bg-slate-950/70 p-5">
              {cards.length === 0 ? (
                <div className="flex h-full w-full items-center justify-center text-center text-slate-500">
                  Add cards to start building your portfolio chart.
                </div>
              ) : (
                cards.slice(0, 10).map((card) => {
                  const value = Number(card.psa10_value || 0);
                  const maxValue = Math.max(
                    ...cards.map((item) => Number(item.psa10_value || 0)),
                    1
                  );

                  const height = Math.max((value / maxValue) * 100, 8);

                  return (
                    <div
                      key={card.id}
                      className="group flex flex-1 flex-col items-center justify-end gap-3"
                    >
                      <div className="relative flex h-full w-full items-end">
                        <div
                          className="w-full rounded-t-lg bg-gradient-to-t from-emerald-500 to-cyan-400 transition group-hover:opacity-80"
                          style={{ height: `${height}%` }}
                        />
                      </div>

                      <span className="max-w-[72px] truncate text-xs text-slate-500">
                        {card.name}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-2xl shadow-black/20">
            <p className="text-sm font-medium text-slate-400">
              Portfolio summary
            </p>

            <h2 className="mt-1 text-2xl font-bold">
              Investment breakdown
            </h2>

            <div className="mt-8 space-y-6">
              <ProgressRow
                label="Initial investment"
                value={portfolioStats.totalInvested}
                total={Math.max(portfolioStats.potentialValue, 1)}
              />

              <ProgressRow
                label="Projected value"
                value={portfolioStats.potentialValue}
                total={Math.max(portfolioStats.potentialValue, 1)}
              />

              <ProgressRow
                label="Projected profit"
                value={Math.max(portfolioStats.potentialProfit, 0)}
                total={Math.max(portfolioStats.potentialValue, 1)}
              />
            </div>

            <div className="mt-8 rounded-2xl bg-slate-950/70 p-5">
              <p className="text-sm text-slate-500">
                GradeHunter score
              </p>

              <div className="mt-2 flex items-end justify-between">
                <div>
                  <p className="text-4xl font-black text-emerald-400">
                    {portfolioStats.roi > 100
                      ? "A"
                      : portfolioStats.roi > 50
                      ? "B"
                      : portfolioStats.roi > 20
                      ? "C"
                      : "D"}
                  </p>

                  <p className="mt-1 text-sm text-slate-400">
                    Based on projected ROI
                  </p>
                </div>

                <p className="text-2xl font-bold">
                  {portfolioStats.roi.toFixed(1)}%
                </p>
              </div>
            </div>
          </div>
        </section>

        <section>
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-400">
                Your collection
              </p>

              <h2 className="mt-1 text-2xl font-bold">
                Portfolio
              </h2>
            </div>

            <p className="text-sm text-slate-500">
              {cards.length} {cards.length === 1 ? "card" : "cards"}
            </p>
          </div>

          {loading ? (
            <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-10 text-center text-slate-400">
              Loading portfolio...
            </div>
          ) : loadError ? (
            <div className="rounded-3xl border border-red-900/60 bg-red-950/30 p-10 text-center">
              <h3 className="text-xl font-bold text-red-300">
                Unable to load portfolio
              </h3>

              <p className="mt-2 text-red-200/80">
                {loadError}
              </p>

              <button
                type="button"
                onClick={fetchCards}
                className="mt-5 rounded-xl bg-red-300 px-4 py-2 font-bold text-red-950 transition hover:bg-red-200"
              >
                Try again
              </button>
            </div>
          ) : cards.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-700 bg-slate-900/40 p-12 text-center">
              <h3 className="text-xl font-bold">
                No cards added yet
              </h3>

              <p className="mt-2 text-slate-400">
                Add your first grading opportunity to begin tracking profit.
              </p>
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {cards.map((card) => {
                const invested =
                  Number(card.buy_price || 0) +
                  Number(card.grading_cost || 0);

                const profit =
                  Number(card.psa10_value || 0) - invested;

                const roi =
                  invested > 0 ? (profit / invested) * 100 : 0;

                return (
                  <article
                    key={card.id}
                    className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 transition hover:-translate-y-1 hover:border-slate-700"
                  >
                    <div className="mb-5 flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm text-emerald-400">
                          {card.set}
                        </p>

                        <h3 className="mt-1 text-xl font-bold">
                          {card.name}
                        </h3>
                      </div>

           <div className="flex flex-col items-end gap-2">
  <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-300">
    {card.status || "Watching"}
  </span>

  <div className="flex gap-3">
    <button
      type="button"
      onClick={() => editCard(card)}
      className="text-xs font-semibold text-cyan-400 transition hover:text-cyan-300"
    >
      Edit
    </button>

    <button
      type="button"
      onClick={() => deleteCard(card.id)}
      className="text-xs font-semibold text-red-400 transition hover:text-red-300"
    >
      Delete
    </button>
  </div>
</div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <Metric
                        label="Buy price"
                        value={formatCurrency(Number(card.buy_price || 0))}
                      />

                      <Metric
                        label="Grading"
                        value={formatCurrency(Number(card.grading_cost || 0))}
                      />

                      <Metric
                        label="PSA 9"
                        value={formatCurrency(Number(card.psa9_value || 0))}
                      />

                      <Metric
                        label="PSA 10"
                        value={formatCurrency(Number(card.psa10_value || 0))}
                      />
                    </div>

                    <div className="mt-5 border-t border-slate-800 pt-5">
                      <div className="flex items-end justify-between">
                        <div>
                          <p className="text-sm text-slate-500">
                            Potential profit
                          </p>

                          <p
                            className={`mt-1 text-2xl font-bold ${
                              profit >= 0
                                ? "text-emerald-400"
                                : "text-red-400"
                            }`}
                          >
                            {profit >= 0 ? "+" : ""}
                            {formatCurrency(profit)}
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="text-sm text-slate-500">
                            ROI
                          </p>

                          <p className="mt-1 text-lg font-bold">
                            {roi.toFixed(1)}%
                          </p>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
      <AddCardModal
        isOpen={showAddModal}
        onClose={closeCardModal}
        onCardSaved={fetchCards}
        editingCard={editingCard}
      />
    </main>
  );
}


type MetricProps = {
  label: string;
  value: string;
};


