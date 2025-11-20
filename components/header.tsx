"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { useSupabaseUser } from "@/core/auth/use-supabase-user";
import {
  getUserAvatarUrl,
  getUserDisplayName,
  getUserInitial,
} from "@/core/auth/user-profile";
import { getSupabaseClient } from "@/core/supabase/client";
import { AccountMenu } from "@/components/ui/account-menu";

export function Header() {
  const router = useRouter();
  const { user } = useSupabaseUser();
  const [showAccountMenu, setShowAccountMenu] = useState(false);

  const email = user?.email ?? "guest@taskly.ai";
  const derivedName = getUserDisplayName(user);
  const avatarUrl = getUserAvatarUrl(user);
  const initial = getUserInitial(derivedName);

  const handleConfirmSignOut = async () => {
    await getSupabaseClient().auth.signOut();
    // setShowSignOutDialog(false);
    router.replace("/auth/login");
  };

  return (
    <>
      <header className="sticky top-0 z-20 flex flex-wrap items-center justify-between gap-4 border-b border-[#282b30] bg-[var(--background)]/95 px-6 py-5 backdrop-blur lg:px-10">
        <div className="flex items-center gap-3">
          <div className="relative flex-shrink-0">
            <Image
              src="/logo/Darkmode.png"
              alt="TasklyAI Logo Darkmdode"
              width={64}
              height={64}
              className="object-contain dark:opacity-100 opacity-0"
              priority
            />
            <Image
              src="/logo/Darkmode.png"
              alt="TasklyAI Logo Lightmode"
              width={64}
              height={64}
              className="object-contain dark:opacity-0 opacity-100 absolute top-0 left-0"
              priority
            />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-[#7289da]">
              TasklyAI
            </p>
            <h1 className="text-xl font-semibold text-white">Kanban Board</h1>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setShowAccountMenu((prev) => !prev)}
          className="flex hover:cursor-pointer items-center gap-3 rounded-xl border border-[#282b30] px-4 py-2 text-left transition hover:border-[#7289da]"
        >
          <div className="text-right">
            <p className="text-sm font-semibold text-white">{derivedName}</p>
            <p className="text-xs text-gray-400">{email}</p>
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
