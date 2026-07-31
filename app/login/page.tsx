"use client";

import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  async function signInWithGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: "http://localhost:3000",
      },
    });
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950">
      <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900 p-8">

        <h1 className="text-3xl font-bold text-white">
          Welcome to GradeHunter
        </h1>

        <p className="mt-3 text-slate-400">
          Sign in to build your investment portfolio.
        </p>

        <button
          onClick={signInWithGoogle}
          className="mt-8 w-full rounded-xl bg-emerald-400 py-4 font-bold text-slate-950 hover:bg-emerald-300"
        >
          Continue with Google
        </button>

      </div>
    </main>
  );
}