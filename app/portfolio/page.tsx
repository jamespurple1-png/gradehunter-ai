"use client";

import { useEffect, useMemo, useState } from "react";
import { RefreshCw, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { fetchJson } from "@/lib/fetchJson";
import { formatCurrency, formatDate } from "@/lib/format";
import type { PortfolioItem } from "@/lib/types";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import StatCard from "@/components/ui/StatCard";
import Metric from "@/components/ui/Metric";
import Card from "@/components/ui/Card";
import LoadingState from "@/components/ui/LoadingState";
import ErrorState from "@/components/ui/ErrorState";
import EmptyState from "@/components/ui/EmptyState";

type MarketPrice = {
  marketUsd: number | null;
  priceType: string | null;
};

type MarketResponse = {
  marketUsd?: number | null;
  priceType?: string | null;
  message?: string;
};

type ExchangeRateResponse = {
  base?: string;
  quote?: string;
  rate?: number;
  date?: string;
  message?: string;
};

export default function PortfolioPage() {
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [marketPrices, setMarketPrices] = useState<Record<string, MarketPrice>>(
    {}
  );
  const [loading, setLoading] = useState(true);
  const [pricesLoading, setPricesLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [usdToGbpRate, setUsdToGbpRate] = useState<number | null>(null);
  const [exchangeRateDate, setExchangeRateDate] = useState<string | null>(null);

  useEffect(() => {
    fetchPortfolio();
  }, []);

  async function fetchPortfolio() {
    setLoading(true);
    setErrorMessage("");

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setItems([]);
      setLoading(false);
      setErrorMessage("Please sign in to view your portfolio.");
      return;
    }

    const { data, error } = await supabase
      .from("portfolio_items")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      setItems([]);
      setLoading(false);
      setErrorMessage(error.message);
      return;
    }

    const portfolioItems = (data as PortfolioItem[]) || [];

    setItems(portfolioItems);
    setLoading(false);

    await Promise.all([
      fetchMarketPrices(portfolioItems),
      fetchExchangeRate(),
    ]);
  }

  async function fetchMarketPrices(portfolioItems: PortfolioItem[]) {
    if (portfolioItems.length === 0) {
      setMarketPrices({});
      return;
    }

    setPricesLoading(true);

    const uniqueCardIds = [
      ...new Set(portfolioItems.map((item) => item.card_id)),
    ];

    const results = await Promise.all(
      uniqueCardIds.map(async (cardId) => {
        try {
          const result = await fetchJson<MarketResponse>(
            `/api/cards/market?id=${encodeURIComponent(cardId)}`
          );

          return [
            cardId,
            {
              marketUsd:
                typeof result.marketUsd === "number"
                  ? result.marketUsd
                  : null,
              priceType: result.priceType ?? null,
            },
          ] as const;
        } catch {
          return [
            cardId,
            {
              marketUsd: null,
              priceType: null,
            },
          ] as const;
        }
      })
    );

    setMarketPrices(Object.fromEntries(results));
    setPricesLoading(false);
  }

  async function fetchExchangeRate() {
    try {
      const result = await fetchJson<ExchangeRateResponse>("/api/exchange-rate");

      if (typeof result.rate !== "number") {
        setUsdToGbpRate(null);
        setExchangeRateDate(null);
        return;
      }

      setUsdToGbpRate(result.rate);
      setExchangeRateDate(result.date ?? null);
    } catch {
      setUsdToGbpRate(null);
      setExchangeRateDate(null);
    }
  }

  async function deleteItem(id: string) {
    const confirmed = window.confirm(
      "Are you sure you want to remove this card from your portfolio?"
    );

    if (!confirmed) return;

    setDeletingId(id);
    setErrorMessage("");

    const { error } = await supabase
      .from("portfolio_items")
      .delete()
      .eq("id", id);

    if (error) {
      setDeletingId(null);
      setErrorMessage(error.message);
      return;
    }

    setItems((current) => current.filter((item) => item.id !== id));
    setDeletingId(null);
  }

  const portfolioStats = useMemo(() => {
    const totalCards = items.reduce(
      (total, item) => total + Number(item.quantity || 0),
      0
    );

    const totalInvested = items.reduce((total, item) => {
      return (
        total +
        Number(item.purchase_price || 0) *
          Number(item.quantity || 0)
      );
    }, 0);

    const gradedCards = items.reduce((total, item) => {
      if (item.grading_company === "Raw") {
        return total;
      }

      return total + Number(item.quantity || 0);
    }, 0);

    const knownMarketValueGbp = items.reduce((total, item) => {
      const marketUsd = marketPrices[item.card_id]?.marketUsd;

      if (
        typeof marketUsd !== "number" ||
        typeof usdToGbpRate !== "number"
      ) {
        return total;
      }

      return (
        total +
        marketUsd *
          usdToGbpRate *
          Number(item.quantity || 0)
      );
    }, 0);

    const pricedCards = items.reduce((total, item) => {
      return typeof marketPrices[item.card_id]?.marketUsd === "number"
        ? total + Number(item.quantity || 0)
        : total;
    }, 0);

    const totalProfit = knownMarketValueGbp - totalInvested;

    const roi =
      totalInvested > 0
        ? (totalProfit / totalInvested) * 100
        : 0;

    return {
      totalCards,
      totalInvested,
      gradedCards,
      uniqueCards: items.length,
      knownMarketValueGbp,
      pricedCards,
      totalProfit,
      roi,
    };
  }, [items, marketPrices, usdToGbpRate]);

  return (
    <main className="min-h-screen px-6 py-8 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <PageHeader
          eyebrow="Collection"
          title="Portfolio"
          description="View and manage every card saved to your collection."
          action={
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                Promise.all([fetchMarketPrices(items), fetchExchangeRate()])
              }
              disabled={pricesLoading || items.length === 0}
            >
              <RefreshCw
                size={18}
                className={pricesLoading ? "animate-spin" : ""}
              />
              {pricesLoading ? "Refreshing prices..." : "Refresh prices"}
            </Button>
          }
        />

        <section className="mb-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
          <StatCard
            label="Unique cards"
            value={portfolioStats.uniqueCards.toString()}
            subtitle="Different portfolio entries"
          />

          <StatCard
            label="Total cards"
            value={portfolioStats.totalCards.toString()}
            subtitle="Including quantities"
          />

          <StatCard
            label="Total invested"
            value={formatCurrency(portfolioStats.totalInvested)}
            subtitle="Purchase cost"
          />

          <StatCard
            label="Market value"
            value={
              pricesLoading || usdToGbpRate === null
                ? "Loading..."
                : formatCurrency(portfolioStats.knownMarketValueGbp)
            }
            subtitle={`${portfolioStats.pricedCards} cards priced`}
          />

          <StatCard
            label="Profit / loss"
            value={
              usdToGbpRate === null
                ? "Unavailable"
                : `${portfolioStats.totalProfit >= 0 ? "+" : ""}${formatCurrency(
                    portfolioStats.totalProfit
                  )}`
            }
            subtitle="Current market comparison"
            positive={
              usdToGbpRate === null
                ? undefined
                : portfolioStats.totalProfit >= 0
            }
          />

          <StatCard
            label="Portfolio ROI"
            value={
              usdToGbpRate === null
                ? "Unavailable"
                : `${portfolioStats.roi >= 0 ? "+" : ""}${portfolioStats.roi.toFixed(
                    1
                  )}%`
            }
            subtitle="Return on investment"
            positive={
              usdToGbpRate === null
                ? undefined
                : portfolioStats.roi >= 0
            }
          />
        </section>

        <div className="mb-8 rounded-2xl border border-border bg-surface-raised/50 px-5 py-4 text-sm text-muted">
          TCGplayer market prices are converted from USD to GBP
          {exchangeRateDate
            ? ` using the ${formatDate(exchangeRateDate)} exchange rate.`
            : "."}
        </div>

        {errorMessage && (
          <ErrorState
            variant="banner"
            message={errorMessage}
            onRetry={fetchPortfolio}
            className="mb-6"
          />
        )}

        {loading ? (
          <LoadingState message="Loading portfolio..." />
        ) : items.length === 0 ? (
          <EmptyState
            size="lg"
            title="No cards saved yet"
            description="Search for a card and use Add to Portfolio to begin building your collection."
          />
        ) : (
          <section>
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-sm text-subtle">Your collection</p>
                <h2 className="mt-1 text-2xl font-bold">Saved cards</h2>
              </div>

              <p className="text-sm text-subtle">
                {items.length} {items.length === 1 ? "entry" : "entries"}
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {items.map((item) => {
                const totalPurchase =
                  Number(item.purchase_price || 0) *
                  Number(item.quantity || 0);

                const gradeLabel =
                  item.grading_company === "Raw"
                    ? "Raw"
                    : `${item.grading_company} ${item.grade ?? ""}`.trim();

                const market = marketPrices[item.card_id];

                const marketUnitGbp =
                  typeof market?.marketUsd === "number" &&
                  typeof usdToGbpRate === "number"
                    ? market.marketUsd * usdToGbpRate
                    : null;

                const marketTotalGbp =
                  marketUnitGbp !== null
                    ? marketUnitGbp * Number(item.quantity || 0)
                    : null;

                const profit =
                  marketTotalGbp !== null
                    ? marketTotalGbp - totalPurchase
                    : null;

                const roi =
                  profit !== null && totalPurchase > 0
                    ? (profit / totalPurchase) * 100
                    : null;

                return (
                  <Card
                    key={item.id}
                    as="article"
                    hover
                    padding="none"
                    className="overflow-hidden"
                  >
                    <div className="flex min-h-[320px] items-center justify-center bg-background/70 p-6">
                      {item.image_url ? (
                        <img
                          src={item.image_url}
                          alt={`${item.card_name} Pokémon card`}
                          className="max-h-72 rounded-xl object-contain shadow-2xl shadow-black/40"
                        />
                      ) : (
                        <div className="text-center text-subtle">
                          No card image available
                        </div>
                      )}
                    </div>

                    <div className="p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-sm font-semibold text-brand">
                            {item.set_name}
                          </p>

                          <h3 className="mt-1 text-xl font-bold">
                            {item.card_name}
                          </h3>

                          <p className="mt-1 text-sm text-subtle">
                            Card #{item.card_number || "Unknown"}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => deleteItem(item.id)}
                          disabled={deletingId === item.id}
                          className="rounded-xl p-2 text-negative transition hover:bg-negative/10 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-50"
                          aria-label={`Remove ${item.card_name} from portfolio`}
                        >
                          <Trash2 size={19} />
                        </button>
                      </div>

                      <div className="mt-5 grid grid-cols-2 gap-3">
                        <Metric
                          label="Bought"
                          value={formatCurrency(
                            Number(item.purchase_price || 0)
                          )}
                        />

                        <Metric
                          label="Market"
                          value={
                            pricesLoading
                              ? "Loading..."
                              : marketUnitGbp !== null
                                ? formatCurrency(marketUnitGbp)
                                : "Unavailable"
                          }
                          subtitle={
                            market?.priceType
                              ? `${market.priceType} · converted from USD`
                              : undefined
                          }
                        />

                        <Metric
                          label="Quantity"
                          value={Number(item.quantity || 0).toString()}
                        />

                        <Metric
                          label="Grade"
                          value={gradeLabel}
                        />
                      </div>

                      <div className="mt-5 border-t border-border pt-5">
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div>
                            <p className="text-sm text-subtle">
                              Total invested
                            </p>

                            <p className="mt-1 text-2xl font-bold text-foreground">
                              {formatCurrency(totalPurchase)}
                            </p>
                          </div>

                          <div className="sm:text-right">
                            <p className="text-sm text-subtle">
                              Market total
                            </p>

                            <p className="mt-1 text-2xl font-bold text-brand">
                              {pricesLoading
                                ? "Loading..."
                                : marketTotalGbp !== null
                                  ? formatCurrency(marketTotalGbp)
                                  : "Unavailable"}
                            </p>
                          </div>
                        </div>

                        {profit !== null && roi !== null && (
                          <div className="mt-5 grid grid-cols-2 gap-3">
                            <Metric
                              label="Profit / loss"
                              value={`${profit >= 0 ? "+" : ""}${formatCurrency(
                                profit
                              )}`}
                              positive={profit >= 0}
                            />

                            <Metric
                              label="ROI"
                              value={`${roi >= 0 ? "+" : ""}${roi.toFixed(
                                1
                              )}%`}
                              positive={roi >= 0}
                            />
                          </div>
                        )}

                        <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                          <div>
                            <p className="text-sm text-subtle">Condition</p>
                            <p className="mt-1 font-semibold text-foreground">
                              {item.condition}
                            </p>
                          </div>

                          <div className="text-right">
                            <p className="text-sm text-subtle">Purchased</p>

                            <p className="mt-1 text-sm font-semibold text-foreground">
                              {formatDate(item.purchase_date)}
                            </p>
                          </div>
                        </div>

                        {item.notes && (
                          <div className="mt-5 rounded-xl bg-background/70 p-4">
                            <p className="text-xs font-semibold uppercase tracking-wide text-subtle">
                              Notes
                            </p>

                            <p className="mt-2 text-sm leading-6 text-foreground">
                              {item.notes}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
