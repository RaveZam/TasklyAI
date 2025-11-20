"use client";

import { useState } from "react";

import { SignOutDialog } from "@/components/ui/sign-out-dialog";

type AccountMenuProps = {
  open: boolean;
  onClose: () => void;
  onSignOut: () => void;
  name: string;
  email: string;
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
          <div className="mb-4">
            <p className="text-base font-semibold text-white">{name}</p>
            <p className="text-xs text-gray-400">{email}</p>
          </div>
          <div className="space-y-2 border-b border-[#2f3238] pb-3">
            <MenuLink label="Account preferences" />
          </div>
          <div className="mt-3 space-y-2 border-b border-[#2f3238] pb-3">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
              Theme
            </p>
            <div className="space-y-1">
              {(Object.keys(themeLabels) as ThemeOption[]).map((option) => (
                <ThemeOptionButton key={option} label={themeLabels[option]} />
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

function MenuLink({ label }: { label: string }) {
  return (
    <button
      type="button"
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
    </button>
  );
}

function ThemeOptionButton({ label }: { label: string }) {
  return (
    <button
      type="button"
      className="flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-left text-sm text-gray-300 transition hover:bg-[#2a2d32] hover:cursor-pointer"
    >
      <span>{label}</span>
      <span className="h-3 w-3 rounded-full border border-gray-500" />
    </button>
  );
}

