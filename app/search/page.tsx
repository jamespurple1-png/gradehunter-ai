"use client";

import Link from "next/link";
import { FormEvent, useEffect, useRef, useState } from "react";
import { Search } from "lucide-react";

type PokemonCard = {
  id: string;
  name: string;
  number: string;
  rarity?: string;
  images: {
    small: string;
    large: string;
  };
  set: {
    name: string;
  };
};

type SearchResponse = {
  data?: PokemonCard[];
  count?: number;
  totalCount?: number;
  error?: string;
  message?: string;
};

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [cards, setCards] = useState<PokemonCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState("");

  const lastSearchRef = useRef("");
  const requestControllerRef = useRef<AbortController | null>(null);

  async function searchCards(searchValue: string, forceSearch = false) {
    const cleanedQuery = searchValue.trim();

    if (cleanedQuery.length < 2) {
      requestControllerRef.current?.abort();

      setCards([]);
      setHasSearched(false);
      setError("");
      setLoading(false);
      lastSearchRef.current = "";

      return;
    }

    const normalisedQuery = cleanedQuery.toLowerCase();

    if (!forceSearch && normalisedQuery === lastSearchRef.current) {
      return;
    }

    requestControllerRef.current?.abort();

    const controller = new AbortController();
    requestControllerRef.current = controller;
    lastSearchRef.current = normalisedQuery;

    setLoading(true);
    setHasSearched(true);
    setError("");

    try {
      const searchParams = new URLSearchParams({
        query: cleanedQuery,
      });

      const requestUrl = `/api/cards/search?${searchParams.toString()}`;

      let response = await fetch(requestUrl, {
        method: "GET",
        signal: controller.signal,
        cache: "no-store",
        headers: {
          Accept: "application/json",
        },
      });

      if (response.status >= 500) {
        await new Promise<void>((resolve, reject) => {
          const timer = window.setTimeout(resolve, 750);

          controller.signal.addEventListener(
            "abort",
            () => {
              window.clearTimeout(timer);
              reject(new DOMException("Request aborted", "AbortError"));
            },
            { once: true }
          );
        });

        response = await fetch(requestUrl, {
          method: "GET",
          signal: controller.signal,
          cache: "no-store",
          headers: {
            Accept: "application/json",
          },
        });
      }

      const responseText = await response.text();

      let result: SearchResponse;

      try {
        result = JSON.parse(responseText) as SearchResponse;
      } catch {
        throw new Error(
          `The card search service returned an invalid response (${response.status}).`
        );
      }

      if (!response.ok) {
        throw new Error(
          result.message ||
            result.error ||
            `Card search failed with status ${response.status}.`
        );
      }

      setCards(result.data ?? []);
    } catch (searchError) {
      if (
        searchError instanceof DOMException &&
        searchError.name === "AbortError"
      ) {
        return;
      }

      lastSearchRef.current = "";
      setCards([]);

      setError(
        searchError instanceof Error
          ? searchError.message
          : "Unable to search for cards. Please try again."
      );
    } finally {
      if (requestControllerRef.current === controller) {
        setLoading(false);
      }
    }
  }

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    searchCards(query, true);
  }

  useEffect(() => {
    const cleanedQuery = query.trim();

    if (cleanedQuery.length < 2) {
      requestControllerRef.current?.abort();

      setCards([]);
      setHasSearched(false);
      setError("");
      setLoading(false);
      lastSearchRef.current = "";

      return;
    }

    const timer = window.setTimeout(() => {
      searchCards(cleanedQuery);
    }, 600);

    return () => {
      window.clearTimeout(timer);
    };
  }, [query]);

  useEffect(() => {
    return () => {
      requestControllerRef.current?.abort();
    };
  }, []);

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-8 text-white lg:px-10">
      <div className="mx-auto max-w-7xl">
        <header className="mb-10">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#d6b36a]">
            Discover cards
          </p>

          <h1 className="mt-2 text-4xl font-black tracking-tight">
            Card Search
          </h1>

          <p className="mt-3 max-w-2xl text-slate-400">
            Search the Pokémon card database and discover potential grading
            opportunities.
          </p>
        </header>

        <form
          onSubmit={handleSearch}
          className="flex max-w-3xl flex-col gap-3 sm:flex-row"
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
              placeholder="Search Charizard, Pikachu, Umbreon..."
              autoComplete="off"
              className="w-full rounded-2xl border border-slate-800 bg-slate-900 py-4 pl-12 pr-4 text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-400"
            />
          </div>

          <button
            type="submit"
            disabled={loading || query.trim().length < 2}
            className="rounded-2xl bg-[#d6b36a] px-6 py-4 font-bold text-slate-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Searching..." : "Search"}
          </button>
        </form>

        <section className="mt-10">
          {loading && (
            <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-12 text-center text-slate-400">
              Searching for Pokémon cards...
            </div>
          )}

          {!loading && error && (
            <div className="rounded-3xl border border-red-900/60 bg-red-950/30 p-8 text-center text-red-300">
              <h2 className="font-bold">Search unavailable</h2>
              <p className="mt-2">{error}</p>

              <button
                type="button"
                onClick={() => searchCards(query, true)}
                className="mt-5 rounded-xl bg-red-300 px-4 py-2 font-bold text-red-950 transition hover:bg-red-200"
              >
                Try again
              </button>
            </div>
          )}

          {!loading && !error && hasSearched && cards.length === 0 && (
            <div className="rounded-3xl border border-dashed border-slate-700 bg-slate-900/40 p-12 text-center">
              <h2 className="text-xl font-bold">No cards found</h2>

              <p className="mt-2 text-slate-400">
                Try a shorter search such as Charizard or Pikachu.
              </p>
            </div>
          )}

          {!loading && !error && !hasSearched && (
            <div className="rounded-3xl border border-dashed border-slate-700 bg-slate-900/40 p-12 text-center">
              <h2 className="text-xl font-bold">
                Search results will appear here
              </h2>

              <p className="mt-2 text-slate-400">
                Start typing a card name such as Charizard.
              </p>
            </div>
          )}

          {!loading && !error && cards.length > 0 && (
            <>
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-2xl font-bold">Search results</h2>

                <p className="text-sm text-slate-500">
                  {cards.length} cards shown
                </p>
              </div>

              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                {cards.map((card) => (
                  <article
                    key={card.id}
                    className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/70 transition hover:-translate-y-1 hover:border-emerald-400/50"
                  >
                    <Link href={`/cards/${encodeURIComponent(card.id)}`}>
                      <div className="flex min-h-[340px] items-center justify-center bg-slate-950/70 p-6">
                        <img
                          src={card.images.small}
                          alt={`${card.name} Pokémon card`}
                          loading="lazy"
                          className="max-h-80 rounded-xl object-contain shadow-2xl shadow-black/40"
                        />
                      </div>
                    </Link>

                    <div className="p-5">
                      <p className="text-sm font-semibold text-[#d6b36a]">
                        {card.set.name}
                      </p>

                      <Link
                        href={`/cards/${encodeURIComponent(card.id)}`}
                        className="block"
                      >
                        <h3 className="mt-1 text-xl font-bold transition hover:text-[#ead39b]">
                          {card.name}
                        </h3>
                      </Link>

                      <div className="mt-4 flex items-center justify-between gap-3 text-sm">
                        <span className="text-slate-400">
                          Card #{card.number}
                        </span>

                        <span className="max-w-[55%] truncate rounded-full bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-300">
                          {card.rarity || "Unknown rarity"}
                        </span>
                      </div>

                      <Link
                        href={`/cards/${encodeURIComponent(card.id)}`}
                        className="mt-5 block w-full rounded-xl bg-[#d6b36a] px-4 py-3 text-center font-bold text-slate-950 transition hover:bg-emerald-300"
                      >
                        View Card
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            </>
          )}
        </section>
      </div>
    </main>
  );
}