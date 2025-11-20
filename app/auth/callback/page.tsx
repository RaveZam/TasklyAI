"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { getSupabaseClient } from "@/core/supabase/client";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "error">("loading");
  const [message, setMessage] = useState("Finishing up your sign-in...");

  useEffect(() => {
    let isMounted = true;

    const completeSignIn = async () => {
      if (typeof window === "undefined") {
        return;
      }

      const currentUrl = new URL(window.location.href);
      const searchParams = currentUrl.searchParams;
      const hashParams = new URLSearchParams(
        currentUrl.hash.startsWith("#") ? currentUrl.hash.slice(1) : ""
      );

      const code = searchParams.get("code") ?? hashParams.get("code");
      const state = searchParams.get("state") ?? hashParams.get("state");

      const supabase = getSupabaseClient();

      if (!code || !state) {
        const { data: sessionData } = await supabase.auth.getSession();

        if (sessionData.session) {
          setMessage("Session detected. Redirecting you to your workspace...");
          router.replace("/");
          return;
        }

        setStatus("error");
        setMessage(
          "Missing OAuth parameters. Please start the Google sign-in again."
        );
        return;
      }

      const { error } = await supabase.auth.exchangeCodeForSession(
        window.location.href
      );

      if (!isMounted) {
        return;
      }

      if (error) {
        setStatus("error");
        setMessage(
          error.message || "We ran into a problem completing the sign-in."
        );
        return;
      }

      setMessage("You’re all set. Redirecting to your workspace...");
      router.replace("/");
    };

    void completeSignIn();

    return () => {
      isMounted = false;
    };
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--background)] px-4 py-12 text-gray-100">
      <div className="w-full max-w-md rounded-2xl border border-[#282b30] bg-[var(--surface-1)] p-8 text-center shadow-lg">
        <p className="text-xs uppercase tracking-[0.4em] text-[#7289da]">
          TasklyAI
        </p>
        <h1 className="mt-4 text-2xl font-semibold text-white">
          Hold tight...
        </h1>
        <p
          className={`mt-2 text-sm ${
            status === "error" ? "text-red-400" : "text-gray-300"
          }`}
        >
          {message}
        </p>

        {status === "error" && (
          <button
            type="button"
            onClick={() => router.replace("/auth/login")}
            className="mt-6 inline-flex items-center justify-center rounded-lg bg-[#7289da] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#7f97df]"
          >
            Back to login
          </button>
        )}
      </div>
    </div>
  );
}
