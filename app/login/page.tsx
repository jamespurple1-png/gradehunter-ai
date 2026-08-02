"use client";

import { supabase } from "@/lib/supabase";
import Button from "@/components/ui/Button";

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
    <main className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md rounded-3xl border border-border bg-surface-raised p-8">

        <h1 className="text-3xl font-bold text-foreground">
          Welcome to GradeHunter
        </h1>

        <p className="mt-3 text-muted">
          Sign in to build your investment portfolio.
        </p>

        <Button onClick={signInWithGoogle} size="lg" className="mt-8 w-full">
          Continue with Google
        </Button>

      </div>
    </main>
  );
}