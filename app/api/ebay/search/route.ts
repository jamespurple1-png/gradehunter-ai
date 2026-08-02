import { NextRequest, NextResponse } from "next/server";
import type { ScannerListing } from "@/lib/types";

const previewListings: ScannerListing[] = [
  {
    id: "preview-1",
    title: "Charizard Base Set 4/102 Holo Pokémon Card",
    image: "https://images.pokemontcg.io/base1/4.png",
    listingPrice: 510,
    postage: 4.99,
    marketValue: 625,
    condition: "Used",
    buyingOption: "Buy It Now",
    seller: "preview-seller",
    sellerFeedback: 99.8,
    url: "https://www.ebay.co.uk",
  },
  {
    id: "preview-2",
    title: "1999 Pokémon Base Set Charizard Holo 4/102",
    image: "https://images.pokemontcg.io/base1/4.png",
    listingPrice: 560,
    postage: 0,
    marketValue: 625,
    condition: "Used",
    buyingOption: "Auction",
    seller: "preview-auctions",
    sellerFeedback: 100,
    url: "https://www.ebay.co.uk",
  },
  {
    id: "preview-3",
    title: "Charizard Base Set Holo Rare 4/102",
    image: "https://images.pokemontcg.io/base1/4.png",
    listingPrice: 675,
    postage: 3.49,
    marketValue: 625,
    condition: "Used",
    buyingOption: "Buy It Now",
    seller: "preview-cards",
    sellerFeedback: 98.9,
    url: "https://www.ebay.co.uk",
  },
];

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("query")?.trim();

  if (!query || query.length < 2) {
    return NextResponse.json(
      {
        message: "Please enter at least two characters.",
        data: [],
      },
      { status: 400 }
    );
  }

  const maximumPriceText =
    request.nextUrl.searchParams.get("maxPrice")?.trim();

  const maximumPrice = maximumPriceText
    ? Number(maximumPriceText)
    : null;

  const buyingOption =
    request.nextUrl.searchParams.get("buyingOption")?.trim() || "all";

  /*
    Until eBay production access is approved, return preview data.

    Tomorrow, this section will:
    1. Request an eBay application token.
    2. Call the Browse API.
    3. Convert eBay results into ScannerListing objects.
  */

  const filteredListings = previewListings.filter((listing) => {
    const deliveredPrice =
      listing.listingPrice + listing.postage;

    if (
      maximumPrice !== null &&
      Number.isFinite(maximumPrice) &&
      maximumPrice > 0 &&
      deliveredPrice > maximumPrice
    ) {
      return false;
    }

    if (
      buyingOption !== "all" &&
      listing.buyingOption !== buyingOption
    ) {
      return false;
    }

    return true;
  });

  return NextResponse.json({
    mode: "preview",
    query,
    count: filteredListings.length,
    data: filteredListings,
  });
}