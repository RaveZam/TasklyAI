import { getSupabaseClient } from "@/core/supabase/client";

export type MemberProfile = {
  user_id: string;
  role: string;
  email: string;
  display_name: string;
  avatar_url: string | null;
  initial: string;
};

const avatarKeys = ["avatar_url", "picture", "avatar", "image", "image_url", "photo_url", "profile_image"];
const nameKeys = ["preferred_username", "display_name", "full_name", "name"];

function extractDisplayName(meta: Record<string, unknown>, email: string): string {
  for (const key of nameKeys) {
    const value = meta[key];
    if (typeof value === "string" && value.trim().length > 0) return value;
  }
  return email.split("@")[0] ?? email;
}

function extractAvatarUrl(meta: Record<string, unknown>): string | null {
  for (const key of avatarKeys) {
    const value = meta[key];
    if (typeof value === "string" && value.trim().length > 0) return value;
  }
  return null;
}

export async function getProjectMemberProfiles(projectId: string): Promise<MemberProfile[]> {
  const supabase = getSupabaseClient();

  const { data: members, error } = await supabase
    .from("project_members")
    .select("user_id, role")
    .eq("project_id", projectId);

  if (error) throw error;
  if (!members || members.length === 0) return [];

  const userIds = members.map((m: { user_id: string }) => m.user_id);

  const { data: profiles, error: profileError } = await supabase.rpc(
    "get_user_profiles_by_ids",
    { user_ids: userIds }
  );

  if (profileError) throw profileError;

  type ProfileRow = { id: string; email: string; raw_user_meta_data: Record<string, unknown> };
  const profileMap = new Map<string, ProfileRow>(
    (profiles as ProfileRow[]).map((p: ProfileRow) => [p.id, p])
  );

  return members.map((member: { user_id: string; role: string }) => {
    const profile = profileMap.get(member.user_id);
    const meta = (profile?.raw_user_meta_data ?? {}) as Record<string, unknown>;
    const email = profile?.email ?? "";
    const display_name = extractDisplayName(meta, email);
    return {
      user_id: member.user_id,
      role: member.role,
      email,
      display_name,
      avatar_url: extractAvatarUrl(meta),
      initial: display_name.charAt(0).toUpperCase() || "?",
    };
  });
}
