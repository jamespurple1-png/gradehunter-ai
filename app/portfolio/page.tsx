"use client";

import { useEffect, useMemo, useState } from "react";
import { RefreshCw, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

type PortfolioItem = {
  id: string;
  user_id: string;
  card_id: string;
  card_name: string;
  set_id: string | null;
  set_name: string;
  card_number: string | null;
  rarity: string | null;
  image_url: string | null;
  purchase_price: number;
  quantity: number;
  purchase_date: string;
  condition: string;
  grading_company: string;
  grade: number | null;
  certification_number: string | null;
  notes: string | null;
  created_at: string;
};

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

function formatGBP(value: number) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(value);
}


function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

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
          const response = await fetch(
            `/api/cards/market?id=${encodeURIComponent(cardId)}`,
            {
              cache: "no-store",
              headers: {
                Accept: "application/json",
              },
            }
          );

          const responseText = await response.text();

          let result: MarketResponse;

          try {
            result = JSON.parse(responseText) as MarketResponse;
          } catch {
            return [
              cardId,
              {
                marketUsd: null,
                priceType: null,
              },
            ] as const;
          }

          if (!response.ok) {
            return [
              cardId,
              {
                marketUsd: null,
                priceType: null,
              },
            ] as const;
          }

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
      const response = await fetch("/api/exchange-rate", {
        cache: "no-store",
        headers: {
          Accept: "application/json",
        },
      });

      const responseText = await response.text();

      let result: ExchangeRateResponse;

      try {
        result = JSON.parse(responseText) as ExchangeRateResponse;
      } catch {
        setUsdToGbpRate(null);
        setExchangeRateDate(null);
        return;
      }

      if (!response.ok || typeof result.rate !== "number") {
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
    <main className="min-h-screen bg-slate-950 px-6 py-8 text-white lg:px-10">
      <div className="mx-auto max-w-7xl">
        <header className="mb-10 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#d6b36a]">
              Collection
            </p>

            <h1 className="mt-2 text-4xl font-black tracking-tight">
              Portfolio
            </h1>

            <p className="mt-3 max-w-2xl text-slate-400">
              View and manage every card saved to your collection.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              Promise.all([fetchMarketPrices(items), fetchExchangeRate()])
            }
            disabled={pricesLoading || items.length === 0}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm font-bold text-white transition hover:border-[#d6b36a] hover:text-[#d6b36a] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw
              size={18}
              className={pricesLoading ? "animate-spin" : ""}
            />
            {pricesLoading ? "Refreshing prices..." : "Refresh prices"}
          </button>
        </header>

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
            value={formatGBP(portfolioStats.totalInvested)}
            subtitle="Purchase cost"
          />

          <StatCard
            label="Market value"
            value={
              pricesLoading || usdToGbpRate === null
                ? "Loading..."
                : formatGBP(portfolioStats.knownMarketValueGbp)
            }
            subtitle={`${portfolioStats.pricedCards} cards priced`}
          />

          <StatCard
            label="Profit / loss"
            value={
              usdToGbpRate === null
                ? "Unavailable"
                : `${portfolioStats.totalProfit >= 0 ? "+" : ""}${formatGBP(
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

        <div className="mb-8 rounded-2xl border border-slate-800 bg-slate-900/50 px-5 py-4 text-sm text-slate-400">
          TCGplayer market prices are converted from USD to GBP
          {exchangeRateDate
            ? ` using the ${formatDate(exchangeRateDate)} exchange rate.`
            : "."}
        </div>

        {errorMessage && (
          <div className="mb-6 rounded-2xl border border-red-900/60 bg-red-950/30 px-5 py-4 text-red-300">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p>{errorMessage}</p>

              <button
                type="button"
                onClick={fetchPortfolio}
                className="rounded-xl bg-red-300 px-4 py-2 font-bold text-red-950 transition hover:bg-red-200"
              >
                Try again
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-12 text-center text-slate-400">
            Loading portfolio...
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-700 bg-slate-900/40 p-12 text-center">
            <h2 className="text-2xl font-bold">No cards saved yet</h2>

            <p className="mt-2 text-slate-400">
              Search for a card and use Add to Portfolio to begin building your
              collection.
            </p>
          </div>
        ) : (
          <section>
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Your collection</p>
                <h2 className="mt-1 text-2xl font-bold">Saved cards</h2>
              </div>

              <p className="text-sm text-slate-500">
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
                  <article
                    key={item.id}
                    className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/70 transition hover:-translate-y-1 hover:border-slate-700"
                  >
                    <div className="flex min-h-[320px] items-center justify-center bg-slate-950/70 p-6">
                      {item.image_url ? (
                        <img
                          src={item.image_url}
                          alt={`${item.card_name} Pokémon card`}
                          className="max-h-72 rounded-xl object-contain shadow-2xl shadow-black/40"
                        />
                      ) : (
                        <div className="text-center text-slate-600">
                          No card image available
                        </div>
                      )}
                    </div>

                    <div className="p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-sm font-semibold text-[#d6b36a]">
                            {item.set_name}
                          </p>

                          <h3 className="mt-1 text-xl font-bold">
                            {item.card_name}
                          </h3>

                          <p className="mt-1 text-sm text-slate-500">
                            Card #{item.card_number || "Unknown"}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => deleteItem(item.id)}
                          disabled={deletingId === item.id}
                          className="rounded-xl p-2 text-red-400 transition hover:bg-red-500/10 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-50"
                          aria-label={`Remove ${item.card_name} from portfolio`}
                        >
                          <Trash2 size={19} />
                        </button>
                      </div>

                      <div className="mt-5 grid grid-cols-2 gap-3">
                        <Metric
                          label="Bought"
                          value={formatGBP(
                            Number(item.purchase_price || 0)
                          )}
                        />

                        <Metric
                          label="Market"
                          value={
                            pricesLoading
                              ? "Loading..."
                              : marketUnitGbp !== null
                                ? formatGBP(marketUnitGbp)
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

                      <div className="mt-5 border-t border-slate-800 pt-5">
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div>
                            <p className="text-sm text-slate-500">
                              Total invested
                            </p>

                            <p className="mt-1 text-2xl font-bold text-white">
                              {formatGBP(totalPurchase)}
                            </p>
                          </div>

                          <div className="sm:text-right">
                            <p className="text-sm text-slate-500">
                              Market total
                            </p>

                            <p className="mt-1 text-2xl font-bold text-[#d6b36a]">
                              {pricesLoading
                                ? "Loading..."
                                : marketTotalGbp !== null
                                  ? formatGBP(marketTotalGbp)
                                  : "Unavailable"}
                            </p>
                          </div>
                        </div>

                        {profit !== null && roi !== null && (
                          <div className="mt-5 grid grid-cols-2 gap-3">
                            <PerformanceMetric
                              label="Profit / loss"
                              value={`${profit >= 0 ? "+" : ""}${formatGBP(
                                profit
                              )}`}
                              positive={profit >= 0}
                            />

                            <PerformanceMetric
                              label="ROI"
                              value={`${roi >= 0 ? "+" : ""}${roi.toFixed(
                                1
                              )}%`}
                              positive={roi >= 0}
                            />
                          </div>
                        )}

                        <div className="mt-4 flex items-center justify-between border-t border-slate-800 pt-4">
                          <div>
                            <p className="text-sm text-slate-500">Condition</p>
                            <p className="mt-1 font-semibold text-slate-300">
                              {item.condition}
                            </p>
                          </div>

                          <div className="text-right">
                            <p className="text-sm text-slate-500">Purchased</p>

                            <p className="mt-1 text-sm font-semibold text-slate-300">
                              {formatDate(item.purchase_date)}
                            </p>
                          </div>
                        </div>

                        {item.notes && (
                          <div className="mt-5 rounded-xl bg-slate-950/70 p-4">
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                              Notes
                            </p>

                            <p className="mt-2 text-sm leading-6 text-slate-300">
                              {item.notes}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

function StatCard({
  label,
  value,
  subtitle,
  positive,
}: {
  label: string;
  value: string;
  subtitle: string;
  positive?: boolean;
}) {
  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5 shadow-xl shadow-black/10">
      <p className="text-sm font-medium text-slate-400">{label}</p>
      <p
        className={`mt-3 text-3xl font-black ${
          positive === undefined
            ? "text-white"
            : positive
              ? "text-[#d6b36a]"
              : "text-red-400"
        }`}
      >
        {value}
      </p>
      <p className="mt-2 text-sm text-slate-500">{subtitle}</p>
    </div>
  );
}


function PerformanceMetric({
  label,
  value,
  positive,
}: {
  label: string;
  value: string;
  positive: boolean;
}) {
  return (
    <div className="rounded-2xl bg-slate-950/70 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </p>

      <p
        className={`mt-2 font-bold ${
          positive ? "text-[#d6b36a]" : "text-red-400"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function Metric({
  label,
  value,
  subtitle,
}: {
  label: string;
  value: string;
  subtitle?: string;
}) {
  return (
    <div className="rounded-2xl bg-slate-950/70 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </p>

      <p className="mt-2 font-bold text-slate-100">{value}</p>

      {subtitle && (
        <p className="mt-1 truncate text-xs text-slate-600">{subtitle}</p>
      )}
    </div>
  );
}