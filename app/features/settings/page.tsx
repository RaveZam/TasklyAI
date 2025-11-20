"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { SignOutDialog } from "@/components/ui/sign-out-dialog";
import { useSupabaseUser } from "@/core/auth/use-supabase-user";
import { getSupabaseClient } from "@/core/supabase/client";

export default function SettingsPage() {
  const router = useRouter();
  const { user, loading } = useSupabaseUser();
  const [showSignOutDialog, setShowSignOutDialog] = useState(false);

  if (loading || !user) {
    return null;
  }

  const email = user.email ?? "Unknown";
  const fullName =
    (user.user_metadata?.full_name as string | undefined) ??
    email.split("@")[0] ??
    "Workspace member";
  const userId = user.id;
  const lastSignIn = user.last_sign_in_at
    ? new Date(user.last_sign_in_at).toLocaleString()
    : "Not available";

  const handleConfirmSignOut = async () => {
    await getSupabaseClient().auth.signOut();
    setShowSignOutDialog(false);
    router.replace("/auth/login");
  };

  return (
    <>
      <section className="rounded-2xl border border-[#282b30] bg-[var(--surface-1)] p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-[#7289da]">
              Account
            </p>
            <h1 className="text-2xl font-semibold text-white">Settings</h1>
            <p className="text-sm text-gray-400">
              Manage your TasklyAI profile and workspace access.
            </p>
          </div>
          <Link
            href="/features/kanban"
            className="rounded-full border border-[#7289da]/40 px-4 py-2 text-xs text-[#7289da] transition hover:border-[#7289da] hover:text-white"
          >
            Back to Kanban
          </Link>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <div className="rounded-xl border border-[#282b30] bg-[var(--surface-2)] p-5">
            <h2 className="text-sm font-semibold uppercase tracking-[0.3em] text-gray-400">
              Profile
            </h2>
            <dl className="mt-4 space-y-3 text-sm text-gray-300">
              <div>
                <dt className="text-xs uppercase tracking-[0.2em] text-gray-500">
                  Full name
                </dt>
                <dd className="text-base text-white">{fullName}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-[0.2em] text-gray-500">
                  Email
                </dt>
                <dd className="text-base text-white">{email}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-[0.2em] text-gray-500">
                  User ID
                </dt>
                <dd className="break-all text-xs text-gray-400">{userId}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-[0.2em] text-gray-500">
                  Last Sign In
                </dt>
                <dd className="text-base text-white">{lastSignIn}</dd>
              </div>
            </dl>
          </div>

          <div className="flex flex-col justify-between rounded-xl border border-[#282b30] bg-[var(--surface-2)] p-5">
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-[0.3em] text-gray-400">
                Security
              </h2>
              <p className="mt-4 text-sm text-gray-300">
                Sign out of your TasklyAI workspace. This removes your session from this
                browser.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowSignOutDialog(true)}
              className="mt-6 rounded-lg border border-red-500/50 px-4 py-2 text-sm font-semibold text-red-400 transition hover:bg-red-500/10"
            >
              Sign out
            </button>
          </div>
        </div>
      </section>

      <SignOutDialog
        open={showSignOutDialog}
        onCancel={() => setShowSignOutDialog(false)}
        onConfirm={handleConfirmSignOut}
      />
    </>
  );
}

