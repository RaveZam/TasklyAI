"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { useSupabaseUser } from "@/core/auth/use-supabase-user";
import {
  createProject,
  getProjectsByUser,
  updateProject,
  deleteProject,
  type ProjectRecord,
} from "@/app/features/projects/services/project-service";

const DEFAULT_PROJECT_NAME = "Untitled Project";

type ProjectsContextValue = {
  projects: ProjectRecord[];
  loading: boolean;
  listLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  ensureDefaultProject: () => Promise<ProjectRecord | null>;
  createProject: (name?: string) => Promise<ProjectRecord | null>;
  updateProject: (id: string, name: string) => Promise<ProjectRecord | null>;
  deleteProject: (id: string) => Promise<void>;
};

const ProjectsContext = createContext<ProjectsContextValue | null>(null);

export function ProjectsProvider({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useSupabaseUser();
  const [projects, setProjects] = useState<ProjectRecord[]>([]);
  const [listLoading, setListLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const ensureDefaultPromiseRef = useRef<Promise<ProjectRecord | null> | null>(
    null
  );
  const projectsRef = useRef<ProjectRecord[]>([]);
  const [isEnsuringDefault, setIsEnsuringDefault] = useState(false);
  const loadStateRef = useRef<{
    promise: Promise<ProjectRecord[]>;
    userId: string;
  } | null>(null);

  const readProjects = useCallback(async () => {
    if (!user?.id) {
      setProjects([]);
      projectsRef.current = [];
      return [];
    }

    // Return existing promise if one is active for the same user
    if (loadStateRef.current && loadStateRef.current.userId === user.id) {
      return loadStateRef.current.promise;
    }

    const currentUserId = user.id;
    const fetchTask = async () => {
      try {
        const { data } = await getProjectsByUser(currentUserId);
        const normalized = data ?? [];

        // Verify user ID is still the same before updating state
        if (currentUserId === user.id) {
          setProjects(normalized);
          projectsRef.current = normalized;
        }
        return normalized;
      } finally {
        // Clear the loading state if this is still the active request
        if (loadStateRef.current?.userId === currentUserId) {
          loadStateRef.current = null;
        }
      }
    };

    const promise = fetchTask();
    loadStateRef.current = { promise, userId: currentUserId };
    return promise;
  }, [user?.id]);

  const refresh = useCallback(async () => {
    if (!user?.id) {
      setProjects([]);
      projectsRef.current = [];
      return;
    }

    setListLoading(true);
    setError(null);

    try {
      await readProjects();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load your projects."
      );
    } finally {
      setListLoading(false);
    }
  }, [readProjects, user?.id]);

  const createNewProject = useCallback(
    async (name = DEFAULT_PROJECT_NAME) => {
      if (!user?.id) {
        setError("No authenticated user. Please sign in again.");
        return null;
      }

      setError(null);

      try {
        const created = await createProject({
          userId: user.id,
          name,
        });
        setProjects((prev) => [...prev, created]);
        return created;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Unable to create a new project."
        );
        throw err;
      } finally {
        // Do nothing here to avoid toggling the shared loading state.
      }
    },
    [user?.id]
  );

  const ensureDefaultProject = useCallback(async () => {
    if (!user?.id) {
      return null;
    }

    if (projectsRef.current.length > 0) {
      return projectsRef.current[0];
    }

    if (ensureDefaultPromiseRef.current) {
      return ensureDefaultPromiseRef.current;
    }

    const promise = (async () => {
      setIsEnsuringDefault(true);
      setError(null);

      try {
        const currentProjects = await readProjects();
        if (currentProjects.length > 0) {
          return currentProjects[0];
        }

        const created = await createProject({
          userId: user.id,
          name: DEFAULT_PROJECT_NAME,
        });
        setProjects([created]);
        projectsRef.current = [created];
        return created;
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to create your first project."
        );
        throw err;
      } finally {
        setIsEnsuringDefault(false);
        ensureDefaultPromiseRef.current = null;
      }
    })();

    ensureDefaultPromiseRef.current = promise;
    return promise;
  }, [readProjects, user?.id]);

  const updateProjectName = useCallback(
    async (id: string, name: string) => {
      if (!user?.id) {
        setError("No authenticated user. Please sign in again.");
        return null;
      }

      setError(null);

      try {
        const updated = await updateProject(id, { name });
        setProjects((prev) => prev.map((p) => (p.id === id ? updated : p)));
        projectsRef.current = projectsRef.current.map((p) =>
          p.id === id ? updated : p
        );
        return updated;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Unable to update the project."
        );
        throw err;
      }
    },
    [user?.id]
  );

  const deleteProjectById = useCallback(
    async (id: string) => {
      if (!user?.id) {
        setError("No authenticated user. Please sign in again.");
        return;
      }

      setError(null);

      try {
        await deleteProject(id);
        setProjects((prev) => prev.filter((p) => p.id !== id));
        projectsRef.current = projectsRef.current.filter((p) => p.id !== id);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Unable to delete the project."
        );
        throw err;
      }
    },
    [user?.id]
  );

  useEffect(() => {
    projectsRef.current = projects;
  }, [projects]);

  useEffect(() => {
    if (!user?.id) {
      setProjects([]);
      projectsRef.current = [];
      setListLoading(false);
      return;
    }

    void refresh();
  }, [refresh, user?.id]);

  const value = useMemo<ProjectsContextValue>(
    () => ({
      projects,
      loading: listLoading || authLoading || isEnsuringDefault,
      error,
      listLoading,
      refresh,
      ensureDefaultProject,
      createProject: createNewProject,
      updateProject: updateProjectName,
      deleteProject: deleteProjectById,
    }),
    [
      authLoading,
      createNewProject,
      deleteProjectById,
      ensureDefaultProject,
      error,
      isEnsuringDefault,
      listLoading,
      projects,
      refresh,
      updateProjectName,
    ]
  );

  return (
    <ProjectsContext.Provider value={value}>
      {children}
    </ProjectsContext.Provider>
  );
}

export function useProjects(): ProjectsContextValue {
  const context = useContext(ProjectsContext);
  if (!context) {
    throw new Error("useProjects must be used within a ProjectsProvider.");
  }

  return context;
}

export const PROJECTS_DEFAULT_NAME = DEFAULT_PROJECT_NAME;
