"use client";

import type { User } from "@supabase/supabase-js";

const avatarKeys = [
  "avatar_url",
  "picture",
  "avatar",
  "image",
  "image_url",
  "photo_url",
  "profile_image",
];

const nameKeys = ["preferred_username", "display_name", "full_name", "name"];

export function getUserDisplayName(user: User | null | undefined): string {
  if (!user) {
    return "Guest";
  }

  const metadata = (user.user_metadata ?? {}) as Record<string, unknown>;

  for (const key of nameKeys) {
    const value = metadata[key];
    if (typeof value === "string" && value.trim().length > 0) {
      return value;
    }
  }

  if (user.email) {
    return user.email.split("@")[0] ?? user.email;
  }

  return "Guest";
}

export function getUserAvatarUrl(user: User | null | undefined): string | null {
  if (!user) {
    return null;
  }

  const metadata = (user.user_metadata ?? {}) as Record<string, unknown>;

  for (const key of avatarKeys) {
    const value = metadata[key];
    if (typeof value === "string" && value.trim().length > 0) {
      return value;
    }
  }

  const identityAvatar = user.identities?.find((identity) => {
    const data = identity.identity_data as Record<string, unknown> | null;
    const candidate = data?.avatar_url ?? data?.picture ?? data?.image;
    return typeof candidate === "string" && candidate.trim().length > 0;
  });

  if (identityAvatar) {
    const data = identityAvatar.identity_data as Record<string, unknown> | null;
    const candidate = data?.avatar_url ?? data?.picture ?? data?.image;
    return typeof candidate === "string" ? candidate : null;
  }

  return null;
}

export function getUserInitial(name: string | null | undefined): string {
  if (!name) {
    return "G";
  }

  const trimmed = name.trim();
  if (!trimmed) {
    return "G";
  }

  return trimmed.charAt(0).toUpperCase();
}

