"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { useSupabaseUser } from "@/core/auth/use-supabase-user";
import {
  getUserAvatarUrl,
  getUserDisplayName,
  getUserInitial,
} from "@/core/auth/user-profile";
import { getSupabaseClient } from "@/core/supabase/client";
import { AccountMenu } from "@/components/ui/account-menu";
import { MembersSection } from "./members_section";

type HeaderProps = {
  onMenuClick?: () => void;
};

export function Header({ onMenuClick }: HeaderProps) {
  const router = useRouter();
  const { user } = useSupabaseUser();
  const [showAccountMenu, setShowAccountMenu] = useState(false);

  const email = user?.email ?? "guest@taskly.ai";
  const derivedName = getUserDisplayName(user);
  const avatarUrl = getUserAvatarUrl(user);
  const initial = getUserInitial(derivedName);

  // Truncate email if longer than 25 characters
  const truncateEmail = (email: string, maxLength: number = 25) => {
    if (email.length <= maxLength) return email;
    return email.substring(0, maxLength) + "...";
  };

  const displayEmail = truncateEmail(email);

  const handleConfirmSignOut = async () => {
    await getSupabaseClient().auth.signOut();
    // setShowSignOutDialog(false);
    router.replace("/auth/login");
  };

  return (
    <>
      <header className="sticky top-0 z-20 flex flex-wrap items-center justify-between gap-4 border-b border-[#282b30] bg-[var(--background)]/95 px-6 py-5 backdrop-blur lg:px-10">
        <div className="flex items-center gap-3">
          {/* Hamburger Menu Button - Mobile Only */}
          {onMenuClick && (
            <button
              type="button"
              onClick={onMenuClick}
              className="lg:hidden rounded-lg p-2 text-gray-400 transition hover:bg-[var(--surface-2)] hover:text-white"
              aria-label="Open menu"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          )}
          
          <MembersSection
            avatarUrl={avatarUrl}
            derivedName={derivedName}
            initial={initial}
          />
   
        </div>
        <button
          type="button"
          onClick={() => setShowAccountMenu((prev) => !prev)}
          className="flex hover:cursor-pointer items-center gap-3 rounded-xl px-2 py-2 text-left transition hover:bg-[var(--surface-2)] lg:px-4 lg:py-2"
        >
          <div className="text-right hidden lg:block">
            <p className="text-sm font-semibold text-white">{derivedName}</p>
            <p className="text-xs text-gray-400 truncate max-w-[200px]">{displayEmail}</p>
          </div>
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={`${derivedName}'s avatar`}
              referrerPolicy="no-referrer"
              className="h-10 w-10 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#36393e] text-sm font-semibold text-white">
              {initial}
            </div>
          )}
        </button>
      </header>
      <AccountMenu
        open={showAccountMenu}
        onClose={() => setShowAccountMenu(false)}
        onSignOut={handleConfirmSignOut}
        name={derivedName}
        email={email}
        avatarUrl={avatarUrl}
        fallbackInitial={initial}
      />
    </>
  );
}
