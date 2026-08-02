"use client";

import { FormEvent, useMemo, useState } from "react";
import {
  ExternalLink,
  Flame,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { fetchJson } from "@/lib/fetchJson";
import { formatCurrency } from "@/lib/format";
import type { ScannerListing } from "@/lib/types";
import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Metric from "@/components/ui/Metric";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import LoadingState from "@/components/ui/LoadingState";
import ErrorState from "@/components/ui/ErrorState";
import EmptyState from "@/components/ui/EmptyState";

type ScannerResponse = {
  mode?: "preview" | "live";
  query?: string;
  count?: number;
  data?: ScannerListing[];
  message?: string;
};

function calculateDealScore(listing: ScannerListing) {
  const deliveredPrice = listing.listingPrice + listing.postage;
  const discount =
    ((listing.marketValue - deliveredPrice) / listing.marketValue) * 100;

  if (discount >= 25) return 95;
  if (discount >= 20) return 90;
  if (discount >= 15) return 85;
  if (discount >= 10) return 75;
  if (discount >= 5) return 65;
  if (discount >= 0) return 55;

  return Math.max(20, Math.round(50 + discount));
}

export default function ScannerPage() {
  const [query, setQuery] = useState("Charizard Base Set");
  const [maxPrice, setMaxPrice] = useState("");
  const [buyingOption, setBuyingOption] = useState("all");
  const [sortBy, setSortBy] = useState("score");

  const [listings, setListings] = useState<ScannerListing[]>([]);
  const [mode, setMode] = useState<"preview" | "live" | null>(null);
  const [hasScanned, setHasScanned] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const filteredListings = useMemo(() => {
    return [...listings].sort((a, b) => {
      if (sortBy === "price") {
        return (
          a.listingPrice +
          a.postage -
          (b.listingPrice + b.postage)
        );
      }

      if (sortBy === "discount") {
        const discountA =
          a.marketValue - (a.listingPrice + a.postage);
        const discountB =
          b.marketValue - (b.listingPrice + b.postage);

        return discountB - discountA;
      }

      return calculateDealScore(b) - calculateDealScore(a);
    });
  }, [listings, sortBy]);

  async function handleScan(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const cleanedQuery = query.trim();

    if (cleanedQuery.length < 2) {
      setErrorMessage("Please enter at least two characters.");
      return;
    }

    setLoading(true);
    setErrorMessage("");
    setHasScanned(false);

    try {
      const params = new URLSearchParams({
        query: cleanedQuery,
        buyingOption,
      });

      if (maxPrice.trim()) {
        params.set("maxPrice", maxPrice.trim());
      }

      const result = await fetchJson<ScannerResponse>(
        `/api/ebay/search?${params.toString()}`
      );

      setListings(result.data ?? []);
      setMode(result.mode ?? "preview");
      setHasScanned(true);
    } catch (scanError) {
      setListings([]);
      setMode(null);
      setHasScanned(true);
      setErrorMessage(
        scanError instanceof Error
          ? scanError.message
          : "Unable to scan eBay. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen px-6 py-8 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <PageHeader
          eyebrow="Deal discovery"
          title="eBay Scanner"
          description="Search live marketplace listings and compare them against estimated card values to identify potential opportunities."
        />

        <Card as="section">
          <form
            onSubmit={handleScan}
            className="flex flex-col gap-3 lg:flex-row"
          >
            <div className="relative flex-1">
              <Search
                size={20}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-subtle"
              />

              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Charizard Base Set 4/102"
                className="w-full rounded-2xl border border-border-strong bg-background py-4 pl-12 pr-4 text-foreground outline-none transition placeholder:text-subtle focus:border-brand"
              />
            </div>

            <Button
              type="submit"
              size="lg"
              disabled={loading || query.trim().length < 2}
            >
              {loading ? "Scanning..." : "Scan eBay"}
            </Button>
          </form>

          <div className="mt-5 flex items-center gap-2 text-sm font-semibold text-muted">
            <SlidersHorizontal size={18} />
            Filters
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <div>
              <label
                htmlFor="maxPrice"
                className="mb-2 block text-sm text-muted"
              >
                Maximum delivered price
              </label>

              <Input
                id="maxPrice"
                type="number"
                min="0"
                step="0.01"
                value={maxPrice}
                onChange={(event) => setMaxPrice(event.target.value)}
                placeholder="No maximum"
              />
            </div>

            <div>
              <label
                htmlFor="buyingOption"
                className="mb-2 block text-sm text-muted"
              >
                Buying option
              </label>

              <Select
                id="buyingOption"
                value={buyingOption}
                onChange={(event) => setBuyingOption(event.target.value)}
              >
                <option value="all">All listings</option>
                <option value="Buy It Now">Buy It Now</option>
                <option value="Auction">Auction</option>
              </Select>
            </div>

            <div>
              <label
                htmlFor="sortBy"
                className="mb-2 block text-sm text-muted"
              >
                Sort results
              </label>

              <Select
                id="sortBy"
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value)}
              >
                <option value="score">Best deal score</option>
                <option value="discount">Largest saving</option>
                <option value="price">Lowest delivered price</option>
              </Select>
            </div>
          </div>
        </Card>

        <section className="mt-10">
          {loading && (
            <LoadingState message="Scanning marketplace listings..." />
          )}

          {!loading && errorMessage && (
            <ErrorState
              as="h2"
              title="Scanner unavailable"
              message={errorMessage}
            />
          )}

          {!loading && !errorMessage && !hasScanned && (
            <EmptyState
              size="lg"
              title="Search for potential opportunities"
              description="Enter a card name, set and number for the most relevant results."
            />
          )}

          {!loading && !errorMessage && hasScanned && (
            <>
              <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <p className="text-sm text-subtle">
                      {mode === "live"
                        ? "Live eBay results"
                        : "Scanner preview"}
                    </p>

                    <Badge tone={mode === "live" ? "live" : "warning"}>
                      {mode === "live" ? "Live mode" : "Preview mode"}
                    </Badge>
                  </div>

                  <h2 className="mt-1 text-2xl font-bold">
                    Potential opportunities
                  </h2>
                </div>

                <p className="text-sm text-subtle">
                  {filteredListings.length} listings found
                </p>
              </div>

              {filteredListings.length === 0 ? (
                <EmptyState
                  as="h3"
                  title="No matching listings"
                  description="Increase the maximum price or change your filters."
                />
              ) : (
                <div className="grid gap-6 xl:grid-cols-2">
                  {filteredListings.map((listing) => (
                    <OpportunityCard
                      key={listing.id}
                      listing={listing}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </main>
  );
}

function OpportunityCard({
  listing,
}: {
  listing: ScannerListing;
}) {
  const deliveredPrice = listing.listingPrice + listing.postage;
  const saving = listing.marketValue - deliveredPrice;
  const discountPercent =
    (saving / listing.marketValue) * 100;
  const score = calculateDealScore(listing);
  const isPotentialDeal = saving > 0;

  return (
    <Card as="article" padding="none" className="overflow-hidden">
      <div className="grid md:grid-cols-[200px_1fr]">
        <div className="flex min-h-64 items-center justify-center bg-background/70 p-5">
          <img
            src={listing.image}
            alt={listing.title}
            className="max-h-56 rounded-xl object-contain shadow-2xl shadow-black/40"
          />
        </div>

        <div className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              {isPotentialDeal && (
                <p className="mb-2 inline-flex items-center gap-2 text-sm font-bold text-orange-400">
                  <Flame size={17} />
                  Potential opportunity
                </p>
              )}

              <h3 className="text-xl font-bold leading-7">
                {listing.title}
              </h3>

              <p className="mt-2 text-sm text-subtle">
                {listing.condition} · {listing.buyingOption}
              </p>
            </div>

            <div
              className={`rounded-2xl px-4 py-3 text-center ${
                score >= 80
                  ? "bg-brand text-background"
                  : score >= 60
                    ? "bg-warning text-background"
                    : "bg-surface-muted text-foreground"
              }`}
            >
              <p className="text-xs font-bold uppercase tracking-wide">
                Deal score
              </p>

              <p className="mt-1 text-2xl font-black">
                {score}
              </p>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <Metric
              label="Listing"
              value={formatCurrency(listing.listingPrice)}
            />

            <Metric
              label="Postage"
              value={
                listing.postage === 0
                  ? "Free"
                  : formatCurrency(listing.postage)
              }
            />

            <Metric
              label="Delivered"
              value={formatCurrency(deliveredPrice)}
            />

            <Metric
              label="Market estimate"
              value={formatCurrency(listing.marketValue)}
            />
          </div>

          <div className="mt-5 flex flex-col gap-4 border-t border-border pt-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm text-subtle">
                Estimated saving
              </p>

              <p
                className={`mt-1 text-2xl font-black ${
                  isPotentialDeal
                    ? "text-positive"
                    : "text-negative"
                }`}
              >
                {saving >= 0 ? "+" : ""}
                {formatCurrency(saving)}
              </p>

              <p className="mt-1 text-sm text-subtle">
                {discountPercent >= 0 ? "+" : ""}
                {discountPercent.toFixed(1)}% against market
              </p>
            </div>

            <a
              href={listing.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand px-5 py-3 font-bold text-background transition hover:bg-brand-light"
            >
              View listing
              <ExternalLink size={18} />
            </a>
          </div>

          <p className="mt-4 text-xs text-subtle">
            Seller: {listing.seller} · {listing.sellerFeedback}% feedback
          </p>
        </div>
      </div>
    </Card>
  );
}
