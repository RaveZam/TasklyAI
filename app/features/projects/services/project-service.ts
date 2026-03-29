import { getSupabaseClient } from "@/core/supabase/client";

export type ProjectRecord = {
  id: string;
  name: string;
  created_at: string;
};

const PROJECTS_TABLE = "projects";
const PROJECT_MEMBERS_TABLE = "project_members";

export async function createProject(input: {
  name: string;
  userId: string;
}): Promise<ProjectRecord> {

  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from(PROJECTS_TABLE)
    .insert({  name: input.name })
    .select("*")
    .single();

  const {error: projectMemberError} = await supabase.from(PROJECT_MEMBERS_TABLE).insert({
    project_id: data?.id,
    user_id: input.userId,
    role: "owner",
  });


  if (error || projectMemberError) {
    throw error;
  }

  return data;
}


export async function getProjectById(
  id: string
): Promise<ProjectRecord | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from(PROJECTS_TABLE)
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
    .from(PROJECTS_TABLE)
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
  const { error } = await supabase.from(PROJECTS_TABLE).delete().eq("id", id);

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
    .from(PROJECT_MEMBERS_TABLE)
    .select("*, projects (*)") 
    .eq("user_id", userId)
    .order("created_at", { ascending: true });

  if (error) {
    throw error;
  }

  type ProjectMemberWithProject = { projects: ProjectRecord | null };
  const projects = (data ?? [])
    .map((member: ProjectMemberWithProject) => member.projects)
    .filter((project): project is ProjectRecord => project !== null);

  return {
    status,
    data: projects,
  };
}

export async function addProjectMember(input: {
  projectId: string;
  userId: string;
  role?: string;
}): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from("project_members")
    .insert({
      project_id: input.projectId,
      user_id: input.userId,
      role: input.role ?? "owner",
    });

  if (error) {
    throw error;
  }
}
