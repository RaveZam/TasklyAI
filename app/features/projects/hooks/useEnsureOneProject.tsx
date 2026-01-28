"use client";

import { useCallback, useRef } from "react";
import {
  createProject,
  addProjectMember,
  type ProjectRecord,
} from "@/app/features/projects/services/project-service";

const DEFAULT_PROJECT_NAME = "Untitled Project";

type UseEnsureOneProjectParams = {
  userId: string | undefined;
  projectsRef: React.MutableRefObject<ProjectRecord[]>;
  readProjects: () => Promise<ProjectRecord[]>;
  setProjects: React.Dispatch<React.SetStateAction<ProjectRecord[]>>;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
  setIsEnsuringDefault: React.Dispatch<React.SetStateAction<boolean>>;
};

export function useEnsureOneProject({
  userId,
  projectsRef,
  readProjects,
  setProjects,
  setError,
  setIsEnsuringDefault,
}: UseEnsureOneProjectParams) {
  const ensureDefaultPromiseRef = useRef<Promise<ProjectRecord | null> | null>(
    null
  );

  const ensureDefaultProject = useCallback(async () => {
    if (!userId) {
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
       
          name: DEFAULT_PROJECT_NAME,
          userId,
        });

        await addProjectMember({
          projectId: created.id,
          userId,
          role: "owner",
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
  }, [userId, projectsRef, readProjects, setProjects, setError, setIsEnsuringDefault]);

  return ensureDefaultProject;
}
