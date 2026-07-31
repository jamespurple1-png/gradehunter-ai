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

function wait(milliseconds: number) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

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

  apiUrl.searchParams.set("q", `name:${safeQuery}*`);
  apiUrl.searchParams.set("pageSize", "24");
  apiUrl.searchParams.set(
    "select",
    "id,name,number,rarity,images,set"
  );

  const headers: HeadersInit = {
    Accept: "application/json",
  };

  const apiKey = process.env.POKEMON_TCG_API_KEY?.trim();

  if (apiKey) {
    headers["X-Api-Key"] = apiKey;
  }

  try {
    let lastStatus = 500;
    let lastMessage = "Pokémon card search temporarily failed.";

    // Try up to three times because the upstream API can return temporary 500s.
    for (let attempt = 1; attempt <= 3; attempt += 1) {
      const response = await fetch(apiUrl.toString(), {
        method: "GET",
        headers,
        cache: "no-store",
      });

      lastStatus = response.status;

      const responseText = await response.text();

      let result: PokemonApiResponse | null = null;

      try {
        result = JSON.parse(responseText) as PokemonApiResponse;
      } catch {
        lastMessage = "The Pokémon API returned an invalid response.";
      }

      if (response.ok && result) {
        return NextResponse.json({
          data: result.data ?? [],
          count: result.count ?? result.data?.length ?? 0,
          totalCount: result.totalCount ?? 0,
        });
      }

      lastMessage =
        result?.error?.message ||
        `Pokémon API search failed with status ${response.status}.`;

      if (response.status < 500 || attempt === 3) {
        break;
      }

      await wait(attempt * 750);
    }

    return NextResponse.json(
      {
        data: [],
        message: lastMessage,
      },
      { status: lastStatus >= 500 ? 502 : lastStatus }
    );
  } catch {
    return NextResponse.json(
      {
        data: [],
        message: "Unable to connect to the Pokémon card service.",
      },
      { status: 502 }
    );
  }
}