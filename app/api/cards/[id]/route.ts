import { NextResponse } from "next/server";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

type PokemonApiResponse = {
  data?: unknown;
  error?: {
    message?: string;
  };
};

export const dynamic = "force-dynamic";

function createHeaders(): HeadersInit {
  const headers: HeadersInit = {
    Accept: "application/json",
  };

  const apiKey = process.env.POKEMON_TCG_API_KEY?.trim();

  if (apiKey) {
    headers["X-Api-Key"] = apiKey;
  }

  return headers;
}

async function readJsonResponse(response: Response) {
  const responseText = await response.text();

  try {
    return JSON.parse(responseText) as PokemonApiResponse;
  } catch {
    console.error("Pokémon API returned non-JSON:", {
      status: response.status,
      statusText: response.statusText,
      preview: responseText.slice(0, 300),
    });

    return null;
  }
}

export async function GET(
  _request: Request,
  context: RouteContext
) {
  const { id } = await context.params;
  const cleanedId = decodeURIComponent(id).trim();

  if (!cleanedId) {
    return NextResponse.json(
      {
        message: "A card ID is required.",
      },
      { status: 400 }
    );
  }

  const headers = createHeaders();

  try {
    // First attempt: official single-card endpoint.
    const directResponse = await fetch(
      `https://api.pokemontcg.io/v2/cards/${encodeURIComponent(cleanedId)}`,
      {
        method: "GET",
        headers,
        cache: "no-store",
      }
    );

    const directResult = await readJsonResponse(directResponse);

    if (directResponse.ok && directResult?.data) {
      return NextResponse.json(directResult);
    }

    console.warn("Direct card request failed. Trying search fallback:", {
      cardId: cleanedId,
      status: directResponse.status,
    });

    // Fallback: retrieve the card through the working search endpoint.
    const searchUrl = new URL("https://api.pokemontcg.io/v2/cards");

    const safeId = cleanedId.replaceAll('"', "");

    searchUrl.searchParams.set("q", `id:"${safeId}"`);
    searchUrl.searchParams.set("pageSize", "1");

    const fallbackResponse = await fetch(searchUrl.toString(), {
      method: "GET",
      headers,
      cache: "no-store",
    });

    const fallbackResult = await readJsonResponse(fallbackResponse);

    if (!fallbackResponse.ok || !fallbackResult) {
      console.error("Card fallback request failed:", {
        cardId: cleanedId,
        status: fallbackResponse.status,
        result: fallbackResult,
      });

      return NextResponse.json(
        {
          message: `Unable to load card. Pokémon API status: ${fallbackResponse.status}.`,
        },
        { status: 502 }
      );
    }

    const fallbackCards = Array.isArray(fallbackResult.data)
      ? fallbackResult.data
      : [];

    const card = fallbackCards[0];

    if (!card) {
      return NextResponse.json(
        {
          message: "Card not found.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      data: card,
    });
  } catch (error) {
    console.error("GradeHunter card details error:", error);

    return NextResponse.json(
      {
        message: "Unable to connect to the Pokémon card service.",
      },
      { status: 500 }
    );
  }
}