"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Bookmark, BriefcaseBusiness } from "lucide-react";
import { useEffect, useState } from "react";
import AddToPortfolioModal from "@/components/cards/AddToPortfolioModal";
import { fetchJson } from "@/lib/fetchJson";
import { formatPrice } from "@/lib/format";
import type { PokemonCard } from "@/lib/types";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Metric from "@/components/ui/Metric";
import LoadingState from "@/components/ui/LoadingState";
import ErrorState from "@/components/ui/ErrorState";

type CardResponse = {
  data?: PokemonCard;
  message?: string;
  error?: string;
};

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
        const result = await fetchJson<CardResponse>(
          `/api/cards/${encodeURIComponent(cardId)}`,
          { signal: controller.signal }
        );

        if (!result.data) {
          throw new Error(
            result.message || result.error || "Unable to load this card."
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
      <main className="min-h-screen px-6 py-8 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <LoadingState message="Loading card details..." />
        </div>
      </main>
    );
  }

  if (error || !card) {
    return (
      <main className="min-h-screen px-6 py-8 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <Link
            href="/search"
            className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-muted transition hover:text-foreground"
          >
            <ArrowLeft size={18} />
            Back to search
          </Link>

          <ErrorState
            as="h1"
            size="lg"
            title="Card unavailable"
            message={error || "This card could not be found."}
          />
        </div>
      </main>
    );
  }

  const marketPrice = findMarketPrice(card);

  return (
    <main className="min-h-screen px-6 py-8 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <Link
          href="/search"
          className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-muted transition hover:text-foreground"
        >
          <ArrowLeft size={18} />
          Back to search
        </Link>

        {successMessage && (
          <div className="mb-6 rounded-2xl border border-positive/30 bg-positive/10 px-5 py-4 text-sm font-semibold text-positive">
            {successMessage}
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-[420px_1fr]">
          <Card as="section" padding="md">
            <div className="flex min-h-[500px] items-center justify-center rounded-2xl bg-background/70 p-6">
              <img
                src={card.images.large || card.images.small}
                alt={`${card.name} Pokémon card`}
                className="max-h-[560px] w-full rounded-2xl object-contain shadow-2xl shadow-black/50"
              />
            </div>
          </Card>

          <section>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand">
              {card.set.name}
            </p>

            <h1 className="mt-2 text-4xl font-black tracking-tight sm:text-5xl">
              {card.name}
            </h1>

            <div className="mt-4 flex flex-wrap gap-2">
              <Badge tone="outline">Card #{card.number}</Badge>
              <Badge tone="outline">{card.rarity || "Unknown rarity"}</Badge>
              {card.hp && <Badge tone="outline">{card.hp} HP</Badge>}
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <Metric
                variant="bordered"
                label="Market price"
                value={formatPrice(marketPrice)}
              />
              <Metric
                variant="bordered"
                label="GradeHunter Score"
                value="Coming soon"
              />
              <Metric
                variant="bordered"
                label="PSA 10 value"
                value="Coming soon"
              />
            </div>

            <Card padding="md" className="mt-6">
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
            </Card>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <Button
                size="lg"
                onClick={() => {
                  setSuccessMessage("");
                  setShowPortfolioModal(true);
                }}
              >
                <BriefcaseBusiness size={20} />
                Add to Portfolio
              </Button>

              <Button variant="outline" size="lg">
                <Bookmark size={20} />
                Add to Watchlist
              </Button>
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

function CardDetail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-sm text-subtle">{label}</dt>
      <dd className="mt-1 font-semibold text-foreground">{value}</dd>
    </div>
  );
}
