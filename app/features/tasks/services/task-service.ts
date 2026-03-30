import { getSupabaseClient } from "@/core/supabase/client";

export type TaskRecord = {
  id: string;
  project_id: string;
  title: string;
  description: string | null;
  priority: string | null;
  status: string | null;
  created_at: string | null;
  assigned_to: string | null;
  created_by: string | null;
};

export type TaskWithCreator = TaskRecord & {
  creatorAvatarUrl: string | null;
  creatorName: string | null;
};

type ProfileRow = { id: string; email: string; raw_user_meta_data: Record<string, unknown> };

const avatarKeys = ["avatar_url", "picture", "avatar", "image", "image_url", "photo_url", "profile_image"];
const nameKeys = ["preferred_username", "display_name", "full_name", "name"];

function extractCreatorAvatar(meta: Record<string, unknown>): string | null {
  for (const key of avatarKeys) {
    const v = meta[key];
    if (typeof v === "string" && v.trim()) return v;
  }
  return null;
}

function extractCreatorName(meta: Record<string, unknown>, email: string): string {
  for (const key of nameKeys) {
    const v = meta[key];
    if (typeof v === "string" && v.trim()) return v;
  }
  return email.split("@")[0] ?? email;
}

const TABLE_NAME = "tasks";

export async function createTask(input: {
  projectId: string;
  title: string;
  description?: string;
  priority?: string;
  status?: string;
  assignedTo?: string | null;
}): Promise<TaskRecord> {
  const supabase = getSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .insert({
      project_id: input.projectId,
      title: input.title,
      description: input.description ?? null,
      priority: input.priority ?? null,
      status: input.status ?? "todo",
      assigned_to: input.assignedTo ?? null,
      created_by: user?.id ?? null,
    })
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function getTaskById(id: string): Promise<TaskRecord | null> {
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

export async function getTasksByProject(
  projectId: string
): Promise<TaskRecord[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function updateTask(
  id: string,
  updates: Partial<
    Pick<TaskRecord, "title" | "description" | "priority" | "status">
  >
): Promise<TaskRecord> {
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

export async function updateTaskStatus(
  id: string,
  status: string
): Promise<TaskRecord> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .update({ status })
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function deleteTask(id: string): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from(TABLE_NAME).delete().eq("id", id);

  if (error) {
    throw error;
  }
}

export async function getTasksByProjectWithCreators(projectId: string): Promise<TaskWithCreator[]> {
  const tasks = await getTasksByProject(projectId);

  const creatorIds = [
    ...new Set(tasks.map((t) => t.created_by).filter((id): id is string => !!id)),
  ];

  if (creatorIds.length === 0) {
    return tasks.map((t) => ({ ...t, creatorAvatarUrl: null, creatorName: null }));
  }

  const supabase = getSupabaseClient();
  const { data: profiles, error } = await supabase.rpc("get_user_profiles_by_ids", {
    user_ids: creatorIds,
  });

  const creatorMap = new Map<string, { avatarUrl: string | null; name: string }>();
  if (!error && profiles) {
    for (const p of profiles as ProfileRow[]) {
      const meta = (p.raw_user_meta_data ?? {}) as Record<string, unknown>;
      creatorMap.set(p.id, {
        avatarUrl: extractCreatorAvatar(meta),
        name: extractCreatorName(meta, p.email),
      });
    }
  }

  return tasks.map((t) => ({
    ...t,
    creatorAvatarUrl: t.created_by ? (creatorMap.get(t.created_by)?.avatarUrl ?? null) : null,
    creatorName: t.created_by ? (creatorMap.get(t.created_by)?.name ?? null) : null,
  }));
}
