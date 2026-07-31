import { NextResponse } from "next/server";

type FrankfurterRate = {
  date: string;
  base: string;
  quote: string;
  rate: number;
};

export const revalidate = 3600;

export async function GET() {
  try {
    const response = await fetch(
      "https://api.frankfurter.dev/v2/rate/USD/GBP",
      {
        next: {
          revalidate: 3600,
        },
        headers: {
          Accept: "application/json",
        },
      }
    );

    const responseText = await response.text();

    let result: FrankfurterRate;

    try {
      result = JSON.parse(responseText) as FrankfurterRate;
    } catch {
      return NextResponse.json(
        {
          message: "The exchange-rate service returned invalid data.",
        },
        { status: 502 }
      );
    }

    if (
      !response.ok ||
      result.base !== "USD" ||
      result.quote !== "GBP" ||
      typeof result.rate !== "number"
    ) {
      return NextResponse.json(
        {
          message: "Unable to retrieve the USD to GBP exchange rate.",
        },
        { status: 502 }
      );
    }

    return NextResponse.json({
      base: result.base,
      quote: result.quote,
      rate: result.rate,
      date: result.date,
    });
  } catch {
    return NextResponse.json(
      {
        message: "Unable to connect to the exchange-rate service.",
      },
      { status: 502 }
    );
  }
}