import { NextRequest, NextResponse } from "next/server";

type PokemonApiResponse = {
  data?: unknown[];
  count?: number;
  totalCount?: number;
  error?: {
    message?: string;
  };
};

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("query")?.trim();

  if (!query || query.length < 2) {
    return NextResponse.json(
      {
        data: [],
        message: "Please enter at least two characters.",
      },
      { status: 400 }
    );
  }

  try {
    // Keep only characters that are safe for the Pokémon API search syntax.
    const safeQuery = query
      .replace(/[^a-zA-Z0-9À-ÿ '-]/g, "")
      .trim();

    if (safeQuery.length < 2) {
      return NextResponse.json(
        {
          data: [],
          message: "Please enter a valid card name.",
        },
        { status: 400 }
      );
    }

    const apiUrl = new URL("https://api.pokemontcg.io/v2/cards");

    // Pokémon API wildcard syntax: name:char*
    apiUrl.searchParams.set("q", `name:${safeQuery}*`);
    apiUrl.searchParams.set("pageSize", "24");
    apiUrl.searchParams.set("select", "id,name,number,rarity,images,set");

    const headers: HeadersInit = {
      Accept: "application/json",
    };

    const apiKey = process.env.POKEMON_TCG_API_KEY?.trim();

    if (apiKey) {
      headers["X-Api-Key"] = apiKey;
    }

    const response = await fetch(apiUrl, {
      method: "GET",
      headers,
      cache: "no-store",
    });

    const responseText = await response.text();

    let result: PokemonApiResponse;

    try {
      result = JSON.parse(responseText) as PokemonApiResponse;
    } catch {
      console.error("Pokémon API non-JSON response:", {
        status: response.status,
        statusText: response.statusText,
        contentType: response.headers.get("content-type"),
        preview: responseText.slice(0, 300),
      });

      return NextResponse.json(
        {
          data: [],
          message: `Pokémon API error: ${response.status} ${response.statusText}.`,
        },
        { status: 502 }
      );
    }

    if (!response.ok) {
      console.error("Pokémon API search failed:", {
        status: response.status,
        result,
      });

      return NextResponse.json(
        {
          data: [],
          message:
            result.error?.message ||
            `Pokémon API search failed with status ${response.status}.`,
        },
        { status: response.status }
      );
    }

    return NextResponse.json({
      data: result.data ?? [],
      count: result.count ?? result.data?.length ?? 0,
      totalCount: result.totalCount ?? 0,
    });
  } catch (error) {
    console.error("GradeHunter search route error:", error);

    return NextResponse.json(
      {
        data: [],
        message: "Unable to connect to the Pokémon card service.",
      },
      { status: 500 }
    );
  }
}