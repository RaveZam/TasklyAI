import { getSupabaseClient } from "@/core/supabase/client";

export type ProjectRecord = {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
};

const TABLE_NAME = "projects";

export async function createProject(input: {
  userId: string;
  name: string;
}): Promise<ProjectRecord> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .insert({ user_id: input.userId, name: input.name })
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function getProjectById(
  id: string
): Promise<ProjectRecord | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select("*")
    .eq("id", id)
    .single();

  if (error && error.code !== "PGRST116") {
    throw error;
  }

  return data ?? null;
}

export async function updateProject(
  id: string,
  updates: Partial<Pick<ProjectRecord, "name">>
): Promise<ProjectRecord> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .update(updates)
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function deleteProject(id: string): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from(TABLE_NAME).delete().eq("id", id);

  if (error) {
    throw error;
  }
}

export async function getProjectsByUser(userId: string): Promise<{
  status: number;
  data: ProjectRecord[];
}> {
  const supabase = getSupabaseClient();
  const { data, error, status } = await supabase
    .from(TABLE_NAME)
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });

  if (error) {
    throw error;
  }

  return {
    status,
    data: data ?? [],
  };
}
