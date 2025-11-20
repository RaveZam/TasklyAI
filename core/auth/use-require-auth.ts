"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useSupabaseUser } from "./use-supabase-user";

type Options = {
  redirectTo?: string;
};

export function useRequireAuth(options: Options = {}): {
  user: ReturnType<typeof useSupabaseUser>["user"];
  loading: boolean;
} {
  const { redirectTo = "/auth/login" } = options;
  const router = useRouter();
  const { user, loading } = useSupabaseUser();

  useEffect(() => {
    if (!loading && !user) {
      router.replace(redirectTo);
    }
  }, [loading, redirectTo, router, user]);

  return { user, loading };
}
