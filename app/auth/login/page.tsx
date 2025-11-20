"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { getSupabaseClient } from "@/core/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [isOAuthLoading, setIsOAuthLoading] = useState(false);
  const [oauthError, setOauthError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("loading");
    setMessage(null);

    const supabase = getSupabaseClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setStatus("error");
      setMessage(error.message);
      return;
    }

    setStatus("success");
    setMessage("Signed in! Redirecting you to the dashboard...");
    router.replace("/");
  };

  const isLoading = status === "loading";

  const handleOAuthSignIn = async () => {
    setOauthError(null);
    setIsOAuthLoading(true);

    try {
      const supabase = getSupabaseClient();
      const redirectTo =
        typeof window !== "undefined"
          ? `${window.location.origin}/auth/callback`
          : "https://tasklyai.vercel.app/auth/callback";

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo,
          scopes: "email profile",
        },
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "We couldn’t start Google sign-in. Please try again.";
      setOauthError(message);
      setIsOAuthLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--background)] px-4 py-12 text-gray-100">
      <div className="w-full max-w-md rounded-2xl border border-[#282b30] bg-[var(--surface-1)] p-8 shadow-lg">
        <div className="mb-6 text-center">
          <p className="text-xs uppercase tracking-[0.4em] text-[#7289da]">
            TasklyAI
          </p>
          <h1 className="text-2xl font-semibold text-white">Welcome back</h1>
          <p className="text-sm text-gray-400">
            Sign in to continue planning your focus work.
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <label className="block text-sm font-medium text-gray-300">
            Email
            <input
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-2 w-full rounded-lg border border-[#282b30] bg-[#1e2124] px-4 py-3 text-gray-100 outline-none focus:border-[#7289da] focus:ring-2 focus:ring-[#7289da]/40"
            />
          </label>

          <label className="block text-sm font-medium text-gray-300">
            Password
            <input
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-2 w-full rounded-lg border border-[#282b30] bg-[#1e2124] px-4 py-3 text-gray-100 outline-none focus:border-[#7289da] focus:ring-2 focus:ring-[#7289da]/40"
            />
          </label>

          {message && (
            <p
              className={`text-sm ${
                status === "error" ? "text-red-400" : "text-green-400"
              }`}
            >
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading || isOAuthLoading}
            className="w-full rounded-lg bg-[#7289da] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#7f97df] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <div className="mt-6 space-y-3">
          <div className="relative flex items-center justify-center">
            <span className="h-px w-full bg-[#282b30]" />
            <span className="absolute inline-block bg-[var(--surface-1)] px-3 text-xs uppercase tracking-[0.2em] text-gray-500">
              Or
            </span>
          </div>

          <button
            type="button"
            onClick={handleOAuthSignIn}
            disabled={isOAuthLoading || isLoading}
            className="flex w-full items-center hover:cursor-pointer justify-center gap-2 rounded-lg border border-[#282b30] bg-[var(--surface-2,#1e2124)] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#23272a] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isOAuthLoading ? (
              "Redirecting to Google..."
            ) : (
              <>
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  focusable="false"
                >
                  <path
                    d="M21.6 12.23c0-.78-.07-1.53-.2-2.26H12v4.27h5.4a4.62 4.62 0 0 1-2 3.03v2.5h3.3c1.93-1.78 3.04-4.4 3.04-7.54Z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 22c2.7 0 4.96-.9 6.61-2.43l-3.3-2.5c-.92.62-2.1.99-3.31.99-2.54 0-4.69-1.72-5.46-4.02H3.1v2.55A10 10 0 0 0 12 22Z"
                    fill="#34A853"
                  />
                  <path
                    d="M6.54 14.04A5.98 5.98 0 0 1 6.22 12c0-.71.12-1.39.32-2.04V7.41H3.1A10 10 0 0 0 2 12a10 10 0 0 0 1.1 4.59l3.45-2.55Z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 6.18c1.47 0 2.79.5 3.83 1.48l2.85-2.85A9.96 9.96 0 0 0 12 2 10 10 0 0 0 3.1 7.41l3.44 2.55C7.3 7.66 9.45 6.18 12 6.18Z"
                    fill="#EA4335"
                  />
                  <path d="M2 2h20v20H2z" fill="none" />
                </svg>
                Continue with Google
              </>
            )}
          </button>

          {oauthError && (
            <p className="text-center text-sm text-red-400">{oauthError}</p>
          )}
        </div>

        <p className="mt-6 text-center text-sm text-gray-400">
          New here?{" "}
          <Link href="/auth/register" className="text-[#7289da]">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
