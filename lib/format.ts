// Shared currency/date formatting helpers, consolidated from the
// duplicated formatCurrency/formatGBP/formatDate/formatPrice
// implementations that previously lived in individual pages.

export function formatCurrency(value: number, currency: string = "GBP") {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency,
  }).format(value);
}

export function formatPrice(value: number | undefined, currency: string = "USD") {
  if (typeof value !== "number") return "Unavailable";

  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}
