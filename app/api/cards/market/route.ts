import { NextRequest, NextResponse } from "next/server";

type CardPrice = {
  market?: number;
};

type PokemonCard = {
  tcgplayer?: {
    prices?: Record<string, CardPrice>;
  };
};

type PokemonResponse = {
  data?: PokemonCard;
  message?: string;
};

export const dynamic = "force-dynamic";

function findMarketPrice(card: PokemonCard) {
  const prices = card.tcgplayer?.prices;

  if (!prices) {
    return {
      marketUsd: null,
      priceType: null,
    };
  }

  const preferredPriceTypes = [
    "holofoil",
    "reverseHolofoil",
    "normal",
    "unlimitedHolofoil",
    "firstEditionHolofoil",
  ];

  for (const priceType of preferredPriceTypes) {
    const market = prices[priceType]?.market;

    if (typeof market === "number") {
      return {
        marketUsd: market,
        priceType,
      };
    }
  }

  for (const [priceType, priceData] of Object.entries(prices)) {
    if (typeof priceData.market === "number") {
      return {
        marketUsd: priceData.market,
        priceType,
      };
    }
  }

  return {
    marketUsd: null,
    priceType: null,
  };
}

export async function GET(request: NextRequest) {
  const cardId = request.nextUrl.searchParams.get("id")?.trim();

  if (!cardId) {
    return NextResponse.json(
      {
        message: "Missing card ID.",
      },
      { status: 400 }
    );
  }

  try {
    const headers: HeadersInit = {
      Accept: "application/json",
    };

    const apiKey = process.env.POKEMON_TCG_API_KEY?.trim();

    if (apiKey) {
      headers["X-Api-Key"] = apiKey;
    }

    const response = await fetch(
      `https://api.pokemontcg.io/v2/cards/${encodeURIComponent(cardId)}`,
      {
        method: "GET",
        headers,
        cache: "no-store",
      }
    );

    const responseText = await response.text();

    let result: PokemonResponse;

    try {
      result = JSON.parse(responseText) as PokemonResponse;
    } catch {
      return NextResponse.json(
        {
          message: "The Pokémon card service returned invalid data.",
        },
        { status: 502 }
      );
    }

    if (!response.ok || !result.data) {
      return NextResponse.json(
        {
          message:
            result.message ||
            `Unable to load market price. Status ${response.status}.`,
        },
        { status: 502 }
      );
    }

    return NextResponse.json(findMarketPrice(result.data));
  } catch {
    return NextResponse.json(
      {
        message: "Unable to connect to the Pokémon card service.",
      },
      { status: 502 }
    );
  }
}