import { getSupabaseClient } from "@/core/supabase/client";

export type TaskRecord = {
  id: string;
  project_id: string;
  title: string;
  description: string | null;
  priority: string | null;
  status: string | null;
  created_at: string | null;
};

const TABLE_NAME = "tasks";

export async function createTask(input: {
  projectId: string;
  title: string;
  description?: string;
  priority?: string;
  status?: string;
}): Promise<TaskRecord> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .insert({
      project_id: input.projectId,
      title: input.title,
      description: input.description ?? null,
      priority: input.priority ?? null,
      status: input.status ?? "todo",
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
