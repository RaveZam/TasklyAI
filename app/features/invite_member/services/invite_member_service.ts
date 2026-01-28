import { getSupabaseClient } from "@/core/supabase/client";

export type ProjectInviteRecord = {
  id: string;
  project_id: string;
  invited_by: string;
  invited_user_id: string | null;
  status: string;
  created_at: string;
  responded_at: string | null;
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
