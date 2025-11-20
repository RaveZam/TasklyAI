"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Check, Pencil, X } from "lucide-react";

import { SignOutDialog } from "@/components/ui/sign-out-dialog";
import { Input } from "@/components/ui/input";
import { useSupabaseUser } from "@/core/auth/use-supabase-user";
import {
  getUserAvatarUrl,
  getUserDisplayName,
  getUserInitial,
} from "@/core/auth/user-profile";
import { getSupabaseClient } from "@/core/supabase/client";

export default function SettingsPage() {
  const router = useRouter();
  const { user, loading } = useSupabaseUser();
  const [showSignOutDialog, setShowSignOutDialog] = useState(false);
  const email = user?.email ?? "Unknown";
  const derivedFullName = getUserDisplayName(user);
  const avatarUrl = getUserAvatarUrl(user);
  const userInitial = getUserInitial(derivedFullName);

  const [fullNameOverride, setFullNameOverride] = useState<string | null>(null);
  const [isEditingFullName, setIsEditingFullName] = useState(false);
  const [fullNameInput, setFullNameInput] = useState(derivedFullName);
  const [savingFullName, setSavingFullName] = useState(false);
  const [fullNameError, setFullNameError] = useState<string | null>(null);

  const resolvedFullName = fullNameOverride ?? derivedFullName;

  useEffect(() => {
    setFullNameOverride(null);
    setFullNameInput(derivedFullName);
  }, [derivedFullName, user?.id]);

  if (loading || !user) {
    return null;
  }

  const userId = user.id;
  const lastSignIn = user.last_sign_in_at
    ? new Date(user.last_sign_in_at).toLocaleString()
    : "Not available";

  const handleStartEdit = () => {
    setFullNameInput(resolvedFullName);
    setFullNameError(null);
    setIsEditingFullName(true);
  };

  const handleCancelEdit = () => {
    setIsEditingFullName(false);
    setFullNameInput(resolvedFullName);
    setFullNameError(null);
  };

  const handleSaveFullName = async () => {
    const nextName = fullNameInput.trim();

    if (!nextName) {
      setFullNameError("Full name cannot be empty.");
      return;
    }

    setSavingFullName(true);
    setFullNameError(null);

    const { error } = await getSupabaseClient().auth.updateUser({
      data: { full_name: nextName },
    });

    setSavingFullName(false);

    if (error) {
      setFullNameError("Something went wrong. Please try again.");
      return;
    }

    setFullNameOverride(nextName);
    setIsEditingFullName(false);
  };

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
            <div className="mb-6 flex flex-wrap items-center gap-4">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={`${resolvedFullName} avatar`}
                  referrerPolicy="no-referrer"
                  className="h-14 w-14 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#1f2225] text-lg font-semibold text-white">
                  {userInitial}
                </div>
              )}
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-gray-500">
                  Character
                </p>
                <p className="text-base font-semibold text-white">
                  {resolvedFullName}
                </p>
                <p className="text-xs text-gray-400">{email}</p>
              </div>
            </div>
            <h2 className="text-sm font-semibold uppercase tracking-[0.3em] text-gray-400">
              Profile
            </h2>
            <dl className="mt-4 space-y-3 text-sm text-gray-300">
              <div>
                <dt className="text-xs uppercase tracking-[0.2em] text-gray-500">
                  Full name
                </dt>
                <dd className="text-base text-white">
                  {isEditingFullName ? (
                    <div className="space-y-3">
                      <Input
                        value={fullNameInput}
                        onChange={(event) =>
                          setFullNameInput(event.target.value)
                        }
                        disabled={savingFullName}
                        autoFocus
                        className="h-auto border-none bg-transparent p-0 text-base text-white focus-visible:ring-0 focus-visible:ring-offset-0"
                      />
                      {fullNameError ? (
                        <p className="text-xs text-red-400">{fullNameError}</p>
                      ) : null}
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleSaveFullName}
                          disabled={savingFullName}
                          className="flex items-center gap-2 rounded-lg border border-[#7289da]/60 px-3 py-1.5 text-xs font-semibold text-white transition hover:border-[#7289da] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <Check className="h-4 w-4" />
                          {savingFullName ? "Saving..." : "Save"}
                        </button>
                        <button
                          type="button"
                          onClick={handleCancelEdit}
                          disabled={savingFullName}
                          className="flex items-center gap-2 rounded-lg border border-gray-600/80 px-3 py-1.5 text-xs font-semibold text-gray-300 transition hover:border-gray-400 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <X className="h-4 w-4" />
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between gap-3">
                      <span>{resolvedFullName}</span>
                      <button
                        type="button"
                        onClick={handleStartEdit}
                        className="rounded-full border border-transparent p-1 text-gray-400 transition hover:border-[#7289da]/40 hover:text-white"
                        aria-label="Edit full name"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </dd>
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
                Sign out of your TasklyAI workspace. This removes your session
                from this browser.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowSignOutDialog(true)}
              className="mt-6 rounded-lg hover:cursor-pointer border border-red-500/50 px-4 py-2 text-sm font-semibold text-red-400 transition hover:bg-red-500/10"
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
