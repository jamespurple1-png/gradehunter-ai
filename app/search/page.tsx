"use client";

import Link from "next/link";
import { FormEvent, useEffect, useRef, useState } from "react";
import { Search } from "lucide-react";
import { parseJsonResponse } from "@/lib/fetchJson";
import type { PokemonCard } from "@/lib/types";
import PageHeader from "@/components/ui/PageHeader";
import Section from "@/components/ui/Section";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import LoadingState from "@/components/ui/LoadingState";
import ErrorState from "@/components/ui/ErrorState";
import EmptyState from "@/components/ui/EmptyState";

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

      const result = await parseJsonResponse<SearchResponse>(response);

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
    <main className="min-h-screen px-6 py-8 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <PageHeader
          eyebrow="Discover cards"
          title="Card Search"
          description="Search the Pokémon card database and discover potential grading opportunities."
        />

        <form
          onSubmit={handleSearch}
          className="flex max-w-3xl flex-col gap-3 sm:flex-row"
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
              placeholder="Search Charizard, Pikachu, Umbreon..."
              autoComplete="off"
              className="w-full rounded-2xl border border-border bg-surface-raised py-4 pl-12 pr-4 text-foreground outline-none transition placeholder:text-subtle focus:border-brand"
            />
          </div>

          <button
            type="submit"
            disabled={loading || query.trim().length < 2}
            className="rounded-2xl bg-brand px-6 py-4 font-bold text-background transition hover:bg-brand-light disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Searching..." : "Search"}
          </button>
        </form>

        <section className="mt-10">
          {loading && (
            <LoadingState message="Searching for Pokémon cards..." />
          )}

          {!loading && error && (
            <ErrorState
              title="Search unavailable"
              message={error}
              onRetry={() => searchCards(query, true)}
            />
          )}

          {!loading && !error && hasSearched && cards.length === 0 && (
            <EmptyState
              title="No cards found"
              description="Try a shorter search such as Charizard or Pikachu."
            />
          )}

          {!loading && !error && !hasSearched && (
            <EmptyState
              title="Search results will appear here"
              description="Start typing a card name such as Charizard."
            />
          )}

          {!loading && !error && cards.length > 0 && (
            <Section title="Search results" trailing={`${cards.length} cards shown`}>
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                {cards.map((card) => (
                  <Card
                    key={card.id}
                    as="article"
                    hover
                    hoverAccent="brand"
                    padding="none"
                    className="overflow-hidden"
                  >
                    <Link href={`/cards/${encodeURIComponent(card.id)}`}>
                      <div className="flex min-h-[340px] items-center justify-center bg-background/70 p-6">
                        <img
                          src={card.images.small}
                          alt={`${card.name} Pokémon card`}
                          loading="lazy"
                          className="max-h-80 rounded-xl object-contain shadow-2xl shadow-black/40"
                        />
                      </div>
                    </Link>

                    <div className="p-5">
                      <p className="text-sm font-semibold text-brand">
                        {card.set.name}
                      </p>

                      <Link
                        href={`/cards/${encodeURIComponent(card.id)}`}
                        className="block"
                      >
                        <h3 className="mt-1 text-xl font-bold transition hover:text-brand-light">
                          {card.name}
                        </h3>
                      </Link>

                      <div className="mt-4 flex items-center justify-between gap-3 text-sm">
                        <span className="text-muted">
                          Card #{card.number}
                        </span>

                        <Badge className="max-w-[55%] truncate">
                          {card.rarity || "Unknown rarity"}
                        </Badge>
                      </div>

                      <Link
                        href={`/cards/${encodeURIComponent(card.id)}`}
                        className="mt-5 block w-full rounded-xl bg-brand px-4 py-3 text-center font-bold text-background transition hover:bg-brand-light"
                      >
                        View Card
                      </Link>
                    </div>
                  </Card>
                ))}
              </div>
            </Section>
          )}
        </section>
      </div>
    </main>
  );
}
