// Shared domain types used across pages, components and API routes.
// Consolidated here to remove the duplicated local copies that existed
// in individual pages/components.

export type Card = {
  id: number;
  name: string;
  set: string;
  buy_price: number;
  grading_cost: number;
  psa9_value: number;
  psa10_value: number;
  status: string;
};

export type CardPrice = {
  low?: number;
  mid?: number;
  high?: number;
  market?: number;
  directLow?: number;
};

export type PokemonCard = {
  id: string;
  name: string;
  number: string;
  rarity?: string;
  supertype?: string;
  subtypes?: string[];
  hp?: string;
  artist?: string;
  images: {
    small: string;
    large: string;
  };
  set: {
    id: string;
    name: string;
    series?: string;
    printedTotal?: number;
    total?: number;
    releaseDate?: string;
  };
  tcgplayer?: {
    url?: string;
    updatedAt?: string;
    prices?: Record<string, CardPrice>;
  };
};

export type PortfolioItem = {
  id: string;
  user_id: string;
  card_id: string;
  card_name: string;
  set_id: string | null;
  set_name: string;
  card_number: string | null;
  rarity: string | null;
  image_url: string | null;
  purchase_price: number;
  quantity: number;
  purchase_date: string;
  condition: string;
  grading_company: string;
  grade: number | null;
  certification_number: string | null;
  notes: string | null;
  created_at: string;
};

export type ScannerListing = {
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
