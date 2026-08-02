"use client";

import ProgressRow from "@/components/dashboard/ProgressRow";
import Metric from "@/components/ui/Metric";
import StatCard from "@/components/ui/StatCard";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import PageHeader from "@/components/ui/PageHeader";
import Section from "@/components/ui/Section";
import LoadingState from "@/components/ui/LoadingState";
import ErrorState from "@/components/ui/ErrorState";
import EmptyState from "@/components/ui/EmptyState";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import AddCardModal from "@/components/cards/AddCardModal";
import { formatCurrency } from "@/lib/format";
import type { Card as PortfolioCard } from "@/lib/types";

export default function Home() {
  const [cards, setCards] = useState<PortfolioCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCard, setEditingCard] = useState<PortfolioCard | null>(null);
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

  function editCard(card: PortfolioCard) {
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
    <main className="min-h-screen">
      <div className="mx-auto max-w-7xl px-6 py-8 lg:px-10">
        <PageHeader
          eyebrow="Pokémon grading portfolio"
          title="GradeHunter AI"
          description="Track grading opportunities, portfolio value and projected returns from one dashboard."
          layout="center"
          variant="hero"
          action={
            <Button onClick={openAddModal}>+ Add Card</Button>
          }
        />

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
          <Card padding="md" shadow>
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted">
                  Portfolio outlook
                </p>
                <h2 className="mt-1 text-2xl font-bold">
                  Projected PSA 10 return
                </h2>
              </div>
            </div>

            <div className="flex h-64 items-end gap-3 rounded-2xl border border-border bg-background/70 p-5">
              {cards.length === 0 ? (
                <div className="flex h-full w-full items-center justify-center text-center text-subtle">
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
                          className="w-full rounded-t-lg bg-gradient-to-t from-brand-dark to-brand transition group-hover:opacity-80"
                          style={{ height: `${height}%` }}
                        />
                      </div>

                      <span className="max-w-[72px] truncate text-xs text-subtle">
                        {card.name}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </Card>

          <Card padding="md" shadow>
            <p className="text-sm font-medium text-muted">
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

            <div className="mt-8 rounded-2xl bg-background/70 p-5">
              <p className="text-sm text-subtle">
                GradeHunter score
              </p>

              <div className="mt-2 flex items-end justify-between">
                <div>
                  <p className="text-4xl font-black text-brand">
                    {portfolioStats.roi > 100
                      ? "A"
                      : portfolioStats.roi > 50
                      ? "B"
                      : portfolioStats.roi > 20
                      ? "C"
                      : "D"}
                  </p>

                  <p className="mt-1 text-sm text-muted">
                    Based on projected ROI
                  </p>
                </div>

                <p className="text-2xl font-bold">
                  {portfolioStats.roi.toFixed(1)}%
                </p>
              </div>
            </div>
          </Card>
        </section>

        <Section
          eyebrow="Your collection"
          title="Portfolio"
          trailing={`${cards.length} ${cards.length === 1 ? "card" : "cards"}`}
        >
          {loading ? (
            <LoadingState message="Loading portfolio..." size="md" />
          ) : loadError ? (
            <ErrorState
              title="Unable to load portfolio"
              message={loadError}
              onRetry={fetchCards}
            />
          ) : cards.length === 0 ? (
            <EmptyState
              as="h3"
              title="No cards added yet"
              description="Add your first grading opportunity to begin tracking profit."
            />
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
                  <Card key={card.id} as="article" hover>
                    <div className="mb-5 flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm text-brand">
                          {card.set}
                        </p>

                        <h3 className="mt-1 text-xl font-bold">
                          {card.name}
                        </h3>
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        <Badge>{card.status || "Watching"}</Badge>

                        <div className="flex gap-3">
                          <button
                            type="button"
                            onClick={() => editCard(card)}
                            className="text-xs font-semibold text-brand transition hover:text-brand-light"
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() => deleteCard(card.id)}
                            className="text-xs font-semibold text-negative transition hover:text-red-300"
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

                    <div className="mt-5 border-t border-border pt-5">
                      <div className="flex items-end justify-between">
                        <div>
                          <p className="text-sm text-subtle">
                            Potential profit
                          </p>

                          <p
                            className={`mt-1 text-2xl font-bold ${
                              profit >= 0
                                ? "text-positive"
                                : "text-negative"
                            }`}
                          >
                            {profit >= 0 ? "+" : ""}
                            {formatCurrency(profit)}
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="text-sm text-subtle">
                            ROI
                          </p>

                          <p className="mt-1 text-lg font-bold">
                            {roi.toFixed(1)}%
                          </p>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </Section>
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
