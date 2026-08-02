"use client";

import { FormEvent, useMemo, useState } from "react";
import {
  ExternalLink,
  Flame,
  Search,
  SlidersHorizontal,
} from "lucide-react";

type ScannerListing = {
  id: string;
  title: string;
  image: string;
  listingPrice: number;
  postage: number;
  marketValue: number;
  condition: string;
  buyingOption: "Buy It Now" | "Auction";
  seller: string;
  sellerFeedback: number;
  url: string;
};

type ScannerResponse = {
  mode?: "preview" | "live";
  query?: string;
  count?: number;
  data?: ScannerListing[];
  message?: string;
};


function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(value);
}

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

      const response = await fetch(
        `/api/ebay/search?${params.toString()}`,
        {
          method: "GET",
          cache: "no-store",
          headers: {
            Accept: "application/json",
          },
        }
      );

      const responseText = await response.text();

      let result: ScannerResponse;

      try {
        result = JSON.parse(responseText) as ScannerResponse;
      } catch {
        throw new Error(
          `The scanner returned an invalid response (${response.status}).`
        );
      }

      if (!response.ok) {
        throw new Error(
          result.message ||
            `The scanner request failed with status ${response.status}.`
        );
      }

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
    <main className="min-h-screen bg-slate-950 px-6 py-8 text-white lg:px-10">
      <div className="mx-auto max-w-7xl">
        <header className="mb-10">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#d6b36a]">
            Deal discovery
          </p>

          <h1 className="mt-2 text-4xl font-black tracking-tight">
            eBay Scanner
          </h1>

          <p className="mt-3 max-w-2xl text-slate-400">
            Search live marketplace listings and compare them against estimated
            card values to identify potential opportunities.
          </p>
        </header>

        <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
          <form
            onSubmit={handleScan}
            className="flex flex-col gap-3 lg:flex-row"
          >
            <div className="relative flex-1">
              <Search
                size={20}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
              />

              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Charizard Base Set 4/102"
                className="w-full rounded-2xl border border-slate-700 bg-slate-950 py-4 pl-12 pr-4 text-white outline-none transition placeholder:text-slate-600 focus:border-emerald-400"
              />
            </div>

            <button
              type="submit"
              disabled={loading || query.trim().length < 2}
              className="rounded-2xl bg-[#d6b36a] px-7 py-4 font-bold text-slate-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Scanning..." : "Scan eBay"}
            </button>
          </form>

          <div className="mt-5 flex items-center gap-2 text-sm font-semibold text-slate-400">
            <SlidersHorizontal size={18} />
            Filters
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <div>
              <label
                htmlFor="maxPrice"
                className="mb-2 block text-sm text-slate-400"
              >
                Maximum delivered price
              </label>

              <input
                id="maxPrice"
                type="number"
                min="0"
                step="0.01"
                value={maxPrice}
                onChange={(event) => setMaxPrice(event.target.value)}
                placeholder="No maximum"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-emerald-400"
              />
            </div>

            <div>
              <label
                htmlFor="buyingOption"
                className="mb-2 block text-sm text-slate-400"
              >
                Buying option
              </label>

              <select
                id="buyingOption"
                value={buyingOption}
                onChange={(event) => setBuyingOption(event.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-emerald-400"
              >
                <option value="all">All listings</option>
                <option value="Buy It Now">Buy It Now</option>
                <option value="Auction">Auction</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="sortBy"
                className="mb-2 block text-sm text-slate-400"
              >
                Sort results
              </label>

              <select
                id="sortBy"
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-emerald-400"
              >
                <option value="score">Best deal score</option>
                <option value="discount">Largest saving</option>
                <option value="price">Lowest delivered price</option>
              </select>
            </div>
          </div>
        </section>

        <section className="mt-10">
          {loading && (
            <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-12 text-center text-slate-400">
              Scanning marketplace listings...
            </div>
          )}

          {!loading && errorMessage && (
            <div className="rounded-3xl border border-red-900/60 bg-red-950/30 p-10 text-center">
              <h2 className="text-xl font-bold text-red-300">
                Scanner unavailable
              </h2>

              <p className="mt-2 text-red-200/80">
                {errorMessage}
              </p>
            </div>
          )}

          {!loading && !errorMessage && !hasScanned && (
            <div className="rounded-3xl border border-dashed border-slate-700 bg-slate-900/40 p-12 text-center">
              <h2 className="text-2xl font-bold">
                Search for potential opportunities
              </h2>

              <p className="mt-2 text-slate-400">
                Enter a card name, set and number for the most relevant results.
              </p>
            </div>
          )}

          {!loading && !errorMessage && hasScanned && (
            <>
              <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <p className="text-sm text-slate-500">
                      {mode === "live"
                        ? "Live eBay results"
                        : "Scanner preview"}
                    </p>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${
                        mode === "live"
                          ? "bg-[#d6b36a]/15 [#ead39b]"
                          : "bg-amber-400/15 text-amber-300"
                      }`}
                    >
                      {mode === "live" ? "Live mode" : "Preview mode"}
                    </span>
                  </div>

                  <h2 className="mt-1 text-2xl font-bold">
                    Potential opportunities
                  </h2>
                </div>

                <p className="text-sm text-slate-500">
                  {filteredListings.length} listings found
                </p>
              </div>

              {filteredListings.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-slate-700 bg-slate-900/40 p-12 text-center">
                  <h3 className="text-xl font-bold">
                    No matching listings
                  </h3>

                  <p className="mt-2 text-slate-400">
                    Increase the maximum price or change your filters.
                  </p>
                </div>
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
    <article className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/70">
      <div className="grid md:grid-cols-[200px_1fr]">
        <div className="flex min-h-64 items-center justify-center bg-slate-950/70 p-5">
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

              <p className="mt-2 text-sm text-slate-500">
                {listing.condition} · {listing.buyingOption}
              </p>
            </div>

            <div
              className={`rounded-2xl px-4 py-3 text-center ${
                score >= 80
                  ? "bg-[#d6b36a] text-slate-950"
                  : score >= 60
                    ? "bg-amber-300 text-slate-950"
                    : "bg-slate-800 text-white"
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
            <ScannerMetric
              label="Listing"
              value={formatCurrency(listing.listingPrice)}
            />

            <ScannerMetric
              label="Postage"
              value={
                listing.postage === 0
                  ? "Free"
                  : formatCurrency(listing.postage)
              }
            />

            <ScannerMetric
              label="Delivered"
              value={formatCurrency(deliveredPrice)}
            />

            <ScannerMetric
              label="Market estimate"
              value={formatCurrency(listing.marketValue)}
            />
          </div>

          <div className="mt-5 flex flex-col gap-4 border-t border-slate-800 pt-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm text-slate-500">
                Estimated saving
              </p>

              <p
                className={`mt-1 text-2xl font-black ${
                  isPotentialDeal
                    ? "text-[#d6b36a]"
                    : "text-red-400"
                }`}
              >
                {saving >= 0 ? "+" : ""}
                {formatCurrency(saving)}
              </p>

              <p className="mt-1 text-sm text-slate-500">
                {discountPercent >= 0 ? "+" : ""}
                {discountPercent.toFixed(1)}% against market
              </p>
            </div>

            <a
              href={listing.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#d6b36a] px-5 py-3 font-bold text-slate-950 transition hover:bg-emerald-300"
            >
              View listing
              <ExternalLink size={18} />
            </a>
          </div>

          <p className="mt-4 text-xs text-slate-600">
            Seller: {listing.seller} · {listing.sellerFeedback}% feedback
          </p>
        </div>
      </div>
    </article>
  );
}

function ScannerMetric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-slate-950/70 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>

      <p className="mt-2 font-bold text-white">
        {value}
      </p>
    </div>
  );
}