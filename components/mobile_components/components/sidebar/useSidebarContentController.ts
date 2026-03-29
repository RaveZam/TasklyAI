"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { useProjects } from "@/app/features/projects/hooks/projects-provider";
import { useSupabaseUser } from "@/core/auth/use-supabase-user";
import { getPendingInviteCount } from "@/app/features/invite_member/services/invite_member_service";
import type { ProjectRecord } from "@/app/features/projects/services/project-service";

type UseSidebarContentControllerArgs = {
  onProjectSelect?: () => void;
};

function focusAndSelect(input: HTMLInputElement) {
  input.focus();
  if (!input.value) return;
  input.select();
  try {
    input.setSelectionRange(0, input.value.length);
  } catch {
    input.select();
  }
}

function useProjectSelectionSync(args: {
  pathname: string;
  searchParams: URLSearchParams;
  projects: ProjectRecord[];
  selectedProject: string | null;
  setSelectedProject: (id: string | null) => void;
}) {
  const {
    pathname,
    searchParams,
    projects,
    selectedProject,
    setSelectedProject,
  } = args;

  React.useEffect(() => {
    if (pathname !== "/features/kanban") return;
    const projectIdFromUrl = searchParams.get("project");
    if (!projectIdFromUrl) return;
    if (!projects.some((p) => p.id === projectIdFromUrl)) return;
    setSelectedProject(projectIdFromUrl);
  }, [pathname, searchParams, projects, setSelectedProject]);

  React.useEffect(() => {
    if (projects.length > 0 && !selectedProject) {
      setSelectedProject(projects[0].id);
    }
  }, [projects, selectedProject, setSelectedProject]);
}

function useRenameAutofocus(args: {
  renamingProjectId: string | null;
  renameInputRefs: React.MutableRefObject<
    Record<string, HTMLInputElement | null>
  >;
}) {
  const { renamingProjectId, renameInputRefs } = args;
  React.useEffect(() => {
    if (!renamingProjectId) return;
    const input = renameInputRefs.current[renamingProjectId];
    if (!input) return;
    requestAnimationFrame(() => focusAndSelect(input));
  }, [renamingProjectId, renameInputRefs]);
}

export function useSidebarContentController({
  onProjectSelect,
}: UseSidebarContentControllerArgs) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const {
    projects,
    listLoading,
    error,
    createProject: createNewProject,
    updateProject,
    deleteProject,
  } = useProjects();

  const [selectedProject, setSelectedProject] = React.useState<string | null>(
    null,
  );
  const [creating, setCreating] = React.useState(false);
  const [localError, setLocalError] = React.useState<string | null>(null);
  const [renamingProjectId, setRenamingProjectId] = React.useState<
    string | null
  >(null);
  const [tempProjectName, setTempProjectName] = React.useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);
  const [newProjectName, setNewProjectName] =
    React.useState("Untitled Project");
  const [isMounted, setIsMounted] = React.useState(false);
  const [projectPendingDelete, setProjectPendingDelete] =
    React.useState<ProjectRecord | null>(null);
  const [deleteError, setDeleteError] = React.useState<string | null>(null);
  const [isDeletingProject, setIsDeletingProject] = React.useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = React.useState(false);
  const [pendingInviteCount, setPendingInviteCount] = React.useState(0);
  const renameInputRefs = React.useRef<Record<string, HTMLInputElement | null>>(
    {},
  );

  const { user } = useSupabaseUser();

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  React.useEffect(() => {
    if (!user?.id) return;
    getPendingInviteCount(user.id)
      .then(setPendingInviteCount)
      .catch(console.error);
  }, [user?.id]);

  useProjectSelectionSync({
    pathname,
    searchParams,
    projects,
    selectedProject,
    setSelectedProject,
  });
  useRenameAutofocus({ renamingProjectId, renameInputRefs });

  const openCreateModal = React.useCallback(() => {
    setNewProjectName("Untitled Project");
    setIsCreateModalOpen(true);
    setLocalError(null);
  }, []);

  const closeCreateModal = React.useCallback(() => {
    if (!creating) setIsCreateModalOpen(false);
  }, [creating]);

  const handleCreateProject = React.useCallback(async () => {
    setCreating(true);
    setLocalError(null);
    try {
      const trimmedName = newProjectName.trim() || "Untitled Project";
      const project = await createNewProject(trimmedName);
      if (project) {
        setSelectedProject(project.id);
        router.push(`/features/kanban?project=${project.id}`);
        setIsCreateModalOpen(false);
        onProjectSelect?.();
      }
    } catch (err) {
      setLocalError(
        err instanceof Error ? err.message : "Unable to create a project.",
      );
    } finally {
      setCreating(false);
    }
  }, [createNewProject, newProjectName, onProjectSelect, router]);

  const handleSelectProject = React.useCallback(
    (projectId: string) => {
      setSelectedProject(projectId);
      setLocalError(null);
      router.push(`/features/kanban?project=${projectId}`);
      onProjectSelect?.();
    },
    [onProjectSelect, router],
  );

  const handleRenameClick = React.useCallback(
    (projectId: string) => {
      const project = projects.find((p) => p.id === projectId);
      if (!project) return;
      setTempProjectName(project.name);
      setRenamingProjectId(projectId);
      setTimeout(() => {
        const input = renameInputRefs.current[projectId];
        if (input) focusAndSelect(input);
      }, 50);
    },
    [projects],
  );

  const handleRenameSave = React.useCallback(
    async (projectId: string) => {
      const trimmedName = tempProjectName.trim();
      if (!trimmedName) return;

      const project = projects.find((p) => p.id === projectId);
      if (!project) return;

      if (project.name === trimmedName) {
        setRenamingProjectId(null);
        setTempProjectName("");
        return;
      }

      const originalName = project.name;
      setLocalError(null);

      try {
        await updateProject(projectId, trimmedName);
        setRenamingProjectId(null);
        setTempProjectName("");
      } catch (err) {
        setLocalError(
          err instanceof Error ? err.message : "Unable to rename project.",
        );
        setTempProjectName(originalName);
      }
    },
    [projects, tempProjectName, updateProject],
  );

  const handleRenameCancel = React.useCallback(() => {
    setRenamingProjectId(null);
    setTempProjectName("");
  }, []);

  const handleDeleteClick = React.useCallback(
    (projectId: string) => {
      const project = projects.find((p) => p.id === projectId);
      if (!project) return;
      setProjectPendingDelete(project);
      setDeleteError(null);
      setLocalError(null);
    },
    [projects],
  );

  const handleConfirmDelete = React.useCallback(async () => {
    if (!projectPendingDelete) return;
    setIsDeletingProject(true);
    setDeleteError(null);

    try {
      await deleteProject(projectPendingDelete.id);

      if (selectedProject === projectPendingDelete.id) {
        const remainingProjects = projects.filter(
          (p) => p.id !== projectPendingDelete.id,
        );
        if (remainingProjects.length > 0) {
          router.push(`/features/kanban?project=${remainingProjects[0].id}`);
        } else {
          router.push("/");
        }
      }
      setProjectPendingDelete(null);
    } catch (err) {
      setDeleteError(
        err instanceof Error ? err.message : "Unable to delete project.",
      );
    } finally {
      setIsDeletingProject(false);
    }
  }, [deleteProject, projectPendingDelete, projects, router, selectedProject]);

  const handleCancelDelete = React.useCallback(() => {
    if (isDeletingProject) return;
    setProjectPendingDelete(null);
    setDeleteError(null);
  }, [isDeletingProject]);

  const currentProject = React.useMemo(() => {
    if (!selectedProject) return null;
    return projects.find((p) => p.id === selectedProject) ?? null;
  }, [projects, selectedProject]);

  return {
    pathname,
    projects,
    listLoading,
    error,
    isMounted,
    creating,
    localError,
    selectedProject,
    renamingProjectId,
    tempProjectName,
    renameInputRefs,
    isCreateModalOpen,
    newProjectName,
    projectPendingDelete,
    deleteError,
    isDeletingProject,
    isInviteModalOpen,
    setIsInviteModalOpen,
    pendingInviteCount,
    currentProject,
    openCreateModal,
    closeCreateModal,
    setNewProjectName,
    handleCreateProject,
    handleSelectProject,
    handleRenameClick,
    setTempProjectName,
    handleRenameSave,
    handleRenameCancel,
    handleDeleteClick,
    handleConfirmDelete,
    handleCancelDelete,
  };
}

export type SidebarContentController = ReturnType<
  typeof useSidebarContentController
>;
