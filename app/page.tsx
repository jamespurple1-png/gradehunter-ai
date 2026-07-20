"use client";

import { useState } from "react";
import { supabase } from "../lib/supabase";

export default function Home() {
  const [name, setName] = useState("");
  const [cardSet, setCardSet] = useState("");;
  const [buyPrice, setBuyPrice] = useState("");
  const [gradingCost, setGradingCost] = useState("");
  const [psa9, setPsa9] = useState("");
  const [psa10, setPsa10] = useState("");
  const [status, setStatus] = useState("");

  async function saveCard() {
    const { error } = await supabase
      .from("cards")
      .insert([
        {
          name,
          set: cardSet,
          buy_price: Number(buyPrice),
          grading_cost: Number(gradingCost),
          psa9_value: Number(psa9),
          psa10_value: Number(psa10),
          status: "Watching",
        },
      ]);

   if (error) {
  setStatus("❌ " + error.message);
  console.log(error);
} else {
      setStatus("✅ Card saved!");
    }
  }

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-xl mx-auto bg-white rounded-xl shadow p-6">

        <h1 className="text-3xl font-bold">
          GradeHunter AI
        </h1>

        <p className="text-gray-600 mb-6">
          Pokémon card investment tracker
        </p>

        <input
          className="border p-2 w-full mb-3"
          placeholder="Card name"
          onChange={(e) => setCardSet(e.target.value)}
        />

        <input
          className="border p-2 w-full mb-3"
          placeholder="Set"
          onChange={(e) => setCardSet(e.target.value)}
        />

        <input
          className="border p-2 w-full mb-3"
          placeholder="Buy price £"
          onChange={(e) => setBuyPrice(e.target.value)}
        />

        <input
          className="border p-2 w-full mb-3"
          placeholder="Grading cost £"
          onChange={(e) => setGradingCost(e.target.value)}
        />

        <input
          className="border p-2 w-full mb-3"
          placeholder="PSA 9 value £"
          onChange={(e) => setPsa9(e.target.value)}
        />

        <input
          className="border p-2 w-full mb-5"
          placeholder="PSA 10 value £"
          onChange={(e) => setPsa10(e.target.value)}
        />

        <button
          className="bg-black text-white px-4 py-2 rounded"
          onClick={saveCard}
        >
          Save Card
        </button>

        <p className="mt-4">
          {status}
        </p>

      </div>
    </main>
  );
}