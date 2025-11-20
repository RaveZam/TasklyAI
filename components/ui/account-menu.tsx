"use client";

import Link from "next/link";
import { useState } from "react";

import { SignOutDialog } from "@/components/ui/sign-out-dialog";

type AccountMenuProps = {
  open: boolean;
  onClose: () => void;
  onSignOut: () => void;
  name: string;
  email: string;
  avatarUrl?: string | null;
  fallbackInitial?: string;
};

type ThemeOption = "dark" | "light";

const themeLabels: Record<ThemeOption, string> = {
  dark: "Dark",
  light: "Light",
};

export function AccountMenu({
  open,
  onClose,
  onSignOut,
  name,
  email,
  avatarUrl,
  fallbackInitial = "G",
}: AccountMenuProps) {
  const [confirmSignOut, setConfirmSignOut] = useState(false);

  if (!open) return null;

  const handleSignOutClick = () => {
    setConfirmSignOut(true);
  };

  const closeAll = () => {
    setConfirmSignOut(false);
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-50" onClick={closeAll}>
        <div
          className="absolute right-6 top-20 w-64 rounded-2xl border border-[#2f3238] bg-[#1f2225] p-4 text-sm text-gray-200 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="mb-4 flex items-center gap-3">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={`${name} avatar`}
                className="h-10 w-10 rounded-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#2f3238] text-sm font-semibold text-white">
                {fallbackInitial}
              </div>
            )}
            <div>
            <p className="text-base font-semibold text-white">{name}</p>
            <p className="text-xs text-gray-400">{email}</p>
            </div>
          </div>
          <div className="space-y-2 border-b border-[#2f3238] pb-3">
            <MenuLink
              label="Account preferences"
              href="/features/settings"
              onNavigate={closeAll}
            />
          </div>
          <div className="mt-3 space-y-2 border-b border-[#2f3238] pb-3">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
              Theme
            </p>
            <div className="space-y-1">
              {(Object.keys(themeLabels) as ThemeOption[]).map((option) => (
                <ThemeOptionButton key={option} option={option} />
              ))}
            </div>
          </div>
          <button
            type="button"
            onClick={handleSignOutClick}
            className="mt-3 w-full rounded-lg px-3 py-2 text-left text-sm font-semibold text-red-400 transition hover:bg-red-500/10 hover:cursor-pointer"
          >
            Log out
          </button>
        </div>
      </div>
      <SignOutDialog
        open={confirmSignOut}
        onCancel={() => setConfirmSignOut(false)}
        onConfirm={() => {
          onSignOut();
          setConfirmSignOut(false);
        }}
      />
    </>
  );
}

function MenuLink({
  label,
  href,
  onNavigate,
}: {
  label: string;
  href: string;
  onNavigate?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className="flex w-full items-center justify-between rounded-lg px-2 py-2 text-left text-sm text-gray-300 transition hover:bg-[#2a2d32] hover:cursor-pointer"
    >
      {label}
      <svg
        className="h-3 w-3 text-gray-500"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M9 18l6-6-6-6" />
      </svg>
    </Link>
  );
}

function ThemeOptionButton({ option }: { option: ThemeOption }) {
  const label = themeLabels[option];
  const isDark = option === "dark";
  return (
    <button
      type="button"
      disabled={!isDark}
      className={`flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-left text-sm ${
        isDark
          ? "text-gray-100 border border-[#2f3238] bg-[#2a2d32]"
          : "text-gray-500 opacity-60 cursor-not-allowed"
      }`}
    >
      <span>
        {label}
        {!isDark && (
          <span className="ml-2 text-xs uppercase tracking-[0.2em]">
            Coming soon
          </span>
        )}
      </span>
      {isDark ? (
        <svg
          className="h-4 w-4 text-[#7289da]"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ) : (
        <span className="h-3 w-3 rounded-full border border-gray-500" />
      )}
    </button>
  );
}

