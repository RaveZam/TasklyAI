"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { getSupabaseClient } from "@/core/supabase/client";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (password !== confirmPassword) {
      setStatus("error");
      setMessage("Passwords do not match.");
      return;
    }

    setStatus("loading");
    setMessage(null);

    const supabase = getSupabaseClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/login`,
      },
    });

    if (error) {
      setStatus("error");
      setMessage(error.message);
      return;
    }

    if (data.session) {
      setStatus("success");
      setMessage("Account created! Redirecting you to your workspace...");
      router.replace("/");
      return;
    }

    setStatus("success");
    setMessage(
      "Account created! Check your inbox to confirm your email before signing in."
    );
  };

  const isLoading = status === "loading";

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--background)] px-4 py-12 text-gray-100">
      <div className="w-full max-w-md rounded-2xl border border-[#282b30] bg-[var(--surface-1)] p-8 shadow-lg">
        <div className="mb-6 text-center">
          <p className="text-xs uppercase tracking-[0.4em] text-[#7289da]">
            TasklyAI
          </p>
          <h1 className="text-2xl font-semibold text-white">Create account</h1>
          <p className="text-sm text-gray-400">
            Sign up to start generating your focus tasks.
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
              autoComplete="new-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-2 w-full rounded-lg border border-[#282b30] bg-[#1e2124] px-4 py-3 text-gray-100 outline-none focus:border-[#7289da] focus:ring-2 focus:ring-[#7289da]/40"
            />
          </label>

          <label className="block text-sm font-medium text-gray-300">
            Confirm password
            <input
              type="password"
              autoComplete="new-password"
              required
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
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
            disabled={isLoading}
            className="w-full rounded-lg bg-[#7289da] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#7f97df] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-400">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-[#7289da]">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
