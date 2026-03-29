import { getSupabaseClient } from "@/core/supabase/client";
import { addProjectMember } from "@/app/features/projects/services/project-service";

export type ProjectInviteRecord = {
  id: string;
  project_id: string;
  invited_by: string;
  invited_user_id: string | null;
  status: string;
  created_at: string;
  responded_at: string | null;
};

export type InviteWithDetails = {
  id: string;
  project_id: string;
  project_name: string;
  inviter_name: string;
  inviter_email: string;
  inviter_avatar: string | null;
  created_at: string;
};

const PROJECT_INVITES_TABLE = "project_invites";

/**
 * Finds a user by email address
 * 
 * IMPORTANT: Supabase's auth.users table is NOT directly queryable from the client.
 * You have three options:
 * 
 * Option 1: Create a public "users" or "profiles" table that mirrors auth.users
 *   - This is a separate table you create yourself (NOT the same as auth.users)
 *   - You'd need to sync it with auth.users using database triggers
 * 
 * Option 2: Use a Supabase RPC function (recommended)
 *   - Create a database function that queries auth.users server-side
 *   - Call it via supabase.rpc('get_user_id_by_email', { user_email: email })
 * 
 * Option 3: Use a Next.js server action or API route
 *   - Handle the lookup server-side where you have admin access
 * 
 * For now, this returns null (invites will work but invited_user_id will be null)
 */
/**
 * Checks if a user exists by email
 * @returns user ID if exists, null if doesn't exist, throws error on failure
 */
export async function checkUserExistsByEmail(email: string): Promise<string | null> {
  const supabase = getSupabaseClient();
  
  const { data, error } = await supabase.rpc('get_user_id_by_email', { 
    user_email: email 
  });
  
  if (error) {
    // If RPC function fails, throw error
    throw new Error("Failed to check if user exists");
  }
  
  // Return null if user doesn't exist (no data returned)
  return data ?? null;
}

async function findUserByEmail(email: string): Promise<string | null> {
  return checkUserExistsByEmail(email);
}

/**
 * Creates a project invite
 * @param input - The invite data
 * @returns The created invite record
 */
export async function createProjectInvite(input: {
  projectId: string;
  invitedBy: string;
  email: string;
}): Promise<ProjectInviteRecord> {
  const supabase = getSupabaseClient();

  // Check if user exists by email
  const invitedUserId = await findUserByEmail(input.email);

  const { data, error } = await supabase
    .from(PROJECT_INVITES_TABLE)
    .insert({
      project_id: input.projectId,
      invited_by: input.invitedBy,
      invited_user_id: invitedUserId,
      status: "pending",
    })
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return data;
}

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

export async function getPendingInvitesForUser(userId: string): Promise<InviteWithDetails[]> {
  const supabase = getSupabaseClient();

  const { data: invites, error } = await supabase
    .from(PROJECT_INVITES_TABLE)
    .select("*, projects(name)")
    .eq("invited_user_id", userId)
    .eq("status", "pending");

  if (error) throw error;
  if (!invites || invites.length === 0) return [];

  const inviterIds = [...new Set(invites.map((i: ProjectInviteRecord) => i.invited_by))];

  const { data: profiles, error: profileError } = await supabase.rpc(
    "get_user_profiles_by_ids",
    { user_ids: inviterIds }
  );

  if (profileError) throw profileError;

  type ProfileRow = { id: string; email: string; raw_user_meta_data: Record<string, unknown> };
  const profileMap = new Map<string, ProfileRow>(
    (profiles as ProfileRow[]).map((p) => [p.id, p])
  );

  return invites.map((invite: ProjectInviteRecord & { projects: { name: string } | null }) => {
    const profile = profileMap.get(invite.invited_by);
    const meta = (profile?.raw_user_meta_data ?? {}) as Record<string, unknown>;
    const email = profile?.email ?? "";
    return {
      id: invite.id,
      project_id: invite.project_id,
      project_name: invite.projects?.name ?? "Unknown Project",
      inviter_name: extractDisplayName(meta, email),
      inviter_email: email,
      inviter_avatar: extractAvatarUrl(meta),
      created_at: invite.created_at,
    };
  });
}

export async function acceptInvite(inviteId: string, projectId: string, userId: string): Promise<void> {
  await addProjectMember({ projectId, userId, role: "member" });

  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from(PROJECT_INVITES_TABLE)
    .update({ status: "accepted", responded_at: new Date().toISOString() })
    .eq("id", inviteId);

  if (error) throw error;
}

export async function rejectInvite(inviteId: string): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from(PROJECT_INVITES_TABLE)
    .update({ status: "rejected", responded_at: new Date().toISOString() })
    .eq("id", inviteId);

  if (error) throw error;
}

export async function getPendingInviteCount(userId: string): Promise<number> {
  const supabase = getSupabaseClient();
  const { count, error } = await supabase
    .from(PROJECT_INVITES_TABLE)
    .select("id", { count: "exact", head: true })
    .eq("invited_user_id", userId)
    .eq("status", "pending");

  if (error) throw error;
  return count ?? 0;
}
