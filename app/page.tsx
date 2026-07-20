"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Card = {
  id: number;
  name: string;
  set: string;
  buy_price: number;
  grading_cost: number;
  psa9_value: number;
  psa10_value: number;
  status: string;
};

export default function Home() {
  const [cards, setCards] = useState<Card[]>([]);

  useEffect(() => {
    fetchCards();
  }, []);

  async function fetchCards() {
    const { data, error } = await supabase
      .from("cards")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.log(error);
      return;
    }

    setCards(data || []);
  }

  const totalInvested = cards.reduce(
    (total, card) =>
      total + Number(card.buy_price) + Number(card.grading_cost),
    0
  );

  const potentialProfit = cards.reduce(
    (total, card) =>
      total +
      Number(card.psa10_value) -
      (Number(card.buy_price) + Number(card.grading_cost)),
    0
  );

  return (
    <main className="p-8 max-w-5xl mx-auto">

      <h1 className="text-4xl font-bold mb-8">
        GradeHunter AI 🎴
      </h1>

      <div className="grid grid-cols-3 gap-4 mb-8">

        <div className="border rounded p-4">
          <p className="text-gray-500">Cards</p>
          <h2 className="text-3xl font-bold">
            {cards.length}
          </h2>
        </div>

        <div className="border rounded p-4">
          <p className="text-gray-500">Invested</p>
          <h2 className="text-3xl font-bold">
            £{totalInvested.toFixed(2)}
          </h2>
        </div>

        <div className="border rounded p-4">
          <p className="text-gray-500">Potential Profit</p>
          <h2 className="text-3xl font-bold">
            £{potentialProfit.toFixed(2)}
          </h2>
        </div>

      </div>


      <h2 className="text-2xl font-bold mb-4">
        Portfolio
      </h2>


      {cards.map((card) => (

        <div
          key={card.id}
          className="border rounded p-5 mb-4"
        >

          <h3 className="text-xl font-bold">
            {card.name}
          </h3>

          <p>
            Set: {card.set}
          </p>

          <p>
            Bought:
            £{card.buy_price}
          </p>

          <p>
            Grading:
            £{card.grading_cost}
          </p>

          <p>
            PSA 10:
            £{card.psa10_value}
          </p>

          <p className="font-bold mt-2">
            Potential Profit:
            £
            {(
              Number(card.psa10_value) -
              (Number(card.buy_price) +
              Number(card.grading_cost))
            ).toFixed(2)}
          </p>

        </div>

      ))}

    </main>
  );
}