"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Bookmark, BriefcaseBusiness } from "lucide-react";
import { useEffect, useState } from "react";
import AddToPortfolioModal from "@/components/cards/AddToPortfolioModal";
type CardPrice = {
  low?: number;
  mid?: number;
  high?: number;
  market?: number;
  directLow?: number;
};

export type PokemonCard = {
  id: string;
  name: string;
  number: string;
  rarity?: string;
  supertype?: string;
  subtypes?: string[];
  hp?: string;
  artist?: string;
  images: {
    small: string;
    large: string;
  };
  set: {
    id: string;
    name: string;
    series?: string;
    printedTotal?: number;
    total?: number;
    releaseDate?: string;
  };
  tcgplayer?: {
    url?: string;
    updatedAt?: string;
    prices?: Record<string, CardPrice>;
  };
};

type CardResponse = {
  data?: PokemonCard;
  message?: string;
  error?: string;
};

function formatPrice(value?: number) {
  if (typeof value !== "number") return "Unavailable";

  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);
}

function findMarketPrice(card: PokemonCard) {
  const prices = card.tcgplayer?.prices;
  if (!prices) return undefined;

  const preferredPriceTypes = [
    "holofoil",
    "reverseHolofoil",
    "normal",
    "unlimitedHolofoil",
    "firstEditionHolofoil",
  ];

  for (const priceType of preferredPriceTypes) {
    const marketPrice = prices[priceType]?.market;
    if (typeof marketPrice === "number") return marketPrice;
  }

  for (const priceData of Object.values(prices)) {
    if (typeof priceData.market === "number") return priceData.market;
  }

  return undefined;
}

export default function CardDetailsPage() {
  const params = useParams<{ id: string }>();
  const cardId = params.id;

  const [card, setCard] = useState<PokemonCard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showPortfolioModal, setShowPortfolioModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (!cardId) return;

    const controller = new AbortController();

    async function loadCard() {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(`/api/cards/${encodeURIComponent(cardId)}`, {
          signal: controller.signal,
          cache: "no-store",
          headers: { Accept: "application/json" },
        });

        const responseText = await response.text();
        let result: CardResponse;

        try {
          result = JSON.parse(responseText) as CardResponse;
        } catch {
          throw new Error(
            `The card service returned an invalid response (${response.status}).`
          );
        }

        if (!response.ok || !result.data) {
          throw new Error(
            result.message ||
              result.error ||
              `Unable to load card. Status ${response.status}.`
          );
        }

        setCard(result.data);
      } catch (loadError) {
        if (
          loadError instanceof DOMException &&
          loadError.name === "AbortError"
        ) {
          return;
        }

        setCard(null);
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Unable to load this card."
        );
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    loadCard();
    return () => controller.abort();
  }, [cardId]);

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 px-6 py-8 text-white lg:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-12 text-center text-slate-400">
            Loading card details...
          </div>
        </div>
      </main>
    );
  }

  if (error || !card) {
    return (
      <main className="min-h-screen bg-slate-950 px-6 py-8 text-white lg:px-10">
        <div className="mx-auto max-w-7xl">
          <Link
            href="/search"
            className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-slate-400 transition hover:text-white"
          >
            <ArrowLeft size={18} />
            Back to search
          </Link>

          <div className="rounded-3xl border border-red-900/60 bg-red-950/30 p-12 text-center">
            <h1 className="text-2xl font-bold text-red-300">Card unavailable</h1>
            <p className="mt-2 text-red-200/80">
              {error || "This card could not be found."}
            </p>
          </div>
        </div>
      </main>
    );
  }

  const marketPrice = findMarketPrice(card);

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-8 text-white lg:px-10">
      <div className="mx-auto max-w-7xl">
        <Link
          href="/search"
          className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-slate-400 transition hover:text-white"
        >
          <ArrowLeft size={18} />
          Back to search
        </Link>

        {successMessage && (
          <div className="mb-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-5 py-4 text-sm font-semibold text-[#ead39b">
            {successMessage}
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-[420px_1fr]">
          <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
            <div className="flex min-h-[500px] items-center justify-center rounded-2xl bg-slate-950/70 p-6">
              <img
                src={card.images.large || card.images.small}
                alt={`${card.name} Pokémon card`}
                className="max-h-[560px] w-full rounded-2xl object-contain shadow-2xl shadow-black/50"
              />
            </div>
          </section>

          <section>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#d6b36a]">
              {card.set.name}
            </p>

            <h1 className="mt-2 text-4xl font-black tracking-tight sm:text-5xl">
              {card.name}
            </h1>

            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-sm text-slate-300">
                Card #{card.number}
              </span>

              <span className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-sm text-slate-300">
                {card.rarity || "Unknown rarity"}
              </span>

              {card.hp && (
                <span className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-sm text-slate-300">
                  {card.hp} HP
                </span>
              )}
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <MetricCard label="Market price" value={formatPrice(marketPrice)} />
              <MetricCard label="GradeHunter Score" value="Coming soon" />
              <MetricCard label="PSA 10 value" value="Coming soon" />
            </div>

            <div className="mt-6 rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
              <h2 className="text-xl font-bold">Card information</h2>

              <dl className="mt-5 grid gap-5 sm:grid-cols-2">
                <CardDetail label="Set" value={card.set.name} />
                <CardDetail label="Series" value={card.set.series || "Unknown"} />
                <CardDetail
                  label="Release date"
                  value={card.set.releaseDate || "Unknown"}
                />
                <CardDetail label="Artist" value={card.artist || "Unknown"} />
                <CardDetail
                  label="Type"
                  value={
                    card.subtypes?.join(", ") ||
                    card.supertype ||
                    "Unknown"
                  }
                />
                <CardDetail
                  label="Set size"
                  value={card.set.total ? `${card.set.total} cards` : "Unknown"}
                />
              </dl>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => {
                  setSuccessMessage("");
                  setShowPortfolioModal(true);
                }}
                className="flex items-center justify-center gap-2 rounded-2xl bg-[#d6b36a] px-5 py-4 font-bold text-slate-950 transition hover:bg-emerald-300"
              >
                <BriefcaseBusiness size={20} />
                Add to Portfolio
              </button>

              <button
                type="button"
                className="flex items-center justify-center gap-2 rounded-2xl border border-slate-700 bg-slate-900 px-5 py-4 font-bold text-white transition hover:border-[#d6b36a] hover:text-[#d6b36a]"
              >
                <Bookmark size={20} />
                Add to Watchlist
              </button>
            </div>
          </section>
        </div>
      </div>

      <AddToPortfolioModal
        isOpen={showPortfolioModal}
        card={card}
        onClose={() => setShowPortfolioModal(false)}
        onSaved={() => {
          setShowPortfolioModal(false);
          setSuccessMessage(`${card.name} was added to your portfolio.`);
        }}
      />
    </main>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-xl font-bold text-white">{value}</p>
    </div>
  );
}

function CardDetail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-sm text-slate-500">{label}</dt>
      <dd className="mt-1 font-semibold text-slate-200">{value}</dd>
    </div>
  );
}