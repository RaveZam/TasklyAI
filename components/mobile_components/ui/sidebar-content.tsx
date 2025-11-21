"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

import { useProjects } from "@/app/features/projects/hooks/projects-provider";
import type { ProjectRecord } from "@/app/features/projects/services/project-service";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type SidebarContentProps = {
  onProjectSelect?: () => void;
};

export function SidebarContent({ onProjectSelect }: SidebarContentProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const {
    projects,
    loading,
    listLoading,
    error,
    createProject: createNewProject,
    updateProject,
    deleteProject,
  } = useProjects();
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [renamingProjectId, setRenamingProjectId] = useState<string | null>(
    null
  );
  const [tempProjectName, setTempProjectName] = useState<string>("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState("Untitled Project");
  const [isMounted, setIsMounted] = useState(false);
  const [projectPendingDelete, setProjectPendingDelete] =
    useState<ProjectRecord | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeletingProject, setIsDeletingProject] = useState(false);
  const renameInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Sync selected project with URL params when on kanban page
  useEffect(() => {
    if (pathname === "/features/kanban") {
      const projectIdFromUrl = searchParams.get("project");
      if (projectIdFromUrl && projects.some((p) => p.id === projectIdFromUrl)) {
        setSelectedProject(projectIdFromUrl);
      }
    }
  }, [pathname, searchParams, projects]);

  useEffect(() => {
    if (projects.length > 0 && !selectedProject) {
      setSelectedProject(projects[0].id);
    }
  }, [projects, selectedProject]);

  // Keep input focused and text selected when entering rename mode
  useEffect(() => {
    if (renamingProjectId) {
      const projectId = renamingProjectId;

      const focusAndSelect = () => {
        const input = renameInputRefs.current[projectId];
        if (input && renamingProjectId === projectId) {
          if (document.activeElement !== input) {
            input.focus();
          }

          setTimeout(() => {
            const currentInput = renameInputRefs.current[projectId];
            if (
              currentInput &&
              renamingProjectId === projectId &&
              currentInput.value
            ) {
              currentInput.select();
              if (currentInput.setSelectionRange) {
                try {
                  currentInput.setSelectionRange(0, currentInput.value.length);
                } catch (e) {
                  currentInput.select();
                }
              }
            }
          }, 50);
        }
      };

      requestAnimationFrame(() => {
        focusAndSelect();
        setTimeout(focusAndSelect, 100);
        setTimeout(focusAndSelect, 300);
      });
    }
  }, [renamingProjectId]);

  const openCreateModal = () => {
    setNewProjectName("Untitled Project");
    setIsCreateModalOpen(true);
    setLocalError(null);
  };

  const closeCreateModal = () => {
    if (!creating) {
      setIsCreateModalOpen(false);
    }
  };

  const handleCreateProject = async () => {
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
        err instanceof Error ? err.message : "Unable to create a project."
      );
    } finally {
      setCreating(false);
    }
  };

  const handleSelectProject = useCallback(
    (projectId: string) => {
      setSelectedProject(projectId);
      setLocalError(null);
      router.push(`/features/kanban?project=${projectId}`);
      onProjectSelect?.();
    },
    [router, onProjectSelect]
  );

  const handleRenameClick = (projectId: string) => {
    const project = projects.find((p) => p.id === projectId);

    if (project) {
      setTempProjectName(project.name);
      setRenamingProjectId(projectId);

      const focusAndSelect = () => {
        const input = renameInputRefs.current[projectId];
        if (input) {
          input.focus();

          setTimeout(() => {
            const currentInput = renameInputRefs.current[projectId];
            if (currentInput && currentInput.value) {
              currentInput.select();
              if (currentInput.setSelectionRange) {
                try {
                  currentInput.setSelectionRange(0, currentInput.value.length);
                } catch (e) {
                  currentInput.select();
                }
              }
            }
          }, 50);
        }
      };

      setTimeout(() => {
        requestAnimationFrame(() => {
          focusAndSelect();
          setTimeout(focusAndSelect, 100);
          setTimeout(focusAndSelect, 200);
        });
      }, 250);
    }
  };

  const handleRenameSave = async (projectId: string) => {
    const trimmedName = tempProjectName.trim();

    if (!trimmedName) {
      if (renamingProjectId !== projectId) {
        const project = projects.find((p) => p.id === projectId);
        if (project) {
          setTempProjectName(project.name);
        }
      }
      return;
    }

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
        err instanceof Error ? err.message : "Unable to rename project."
      );
      setTempProjectName(originalName);
    }
  };

  const handleRenameCancel = () => {
    setRenamingProjectId(null);
    setTempProjectName("");
  };

  const handleDeleteClick = (projectId: string) => {
    const project = projects.find((p) => p.id === projectId);
    if (!project) return;
    setProjectPendingDelete(project);
    setDeleteError(null);
    setLocalError(null);
  };

  const handleConfirmDelete = async () => {
    if (!projectPendingDelete) return;
    setIsDeletingProject(true);
    setDeleteError(null);

    try {
      await deleteProject(projectPendingDelete.id);

      if (selectedProject === projectPendingDelete.id) {
        const remainingProjects = projects.filter(
          (p) => p.id !== projectPendingDelete.id
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
        err instanceof Error ? err.message : "Unable to delete project."
      );
    } finally {
      setIsDeletingProject(false);
    }
  };

  const handleCancelDelete = () => {
    if (isDeletingProject) return;
    setProjectPendingDelete(null);
    setDeleteError(null);
  };

  const projectListState = useMemo(() => {
    if (listLoading) {
      return (
        <div className="space-y-3">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="h-10 rounded-lg border border-[#2f3238] bg-[#1e2124] animate-pulse"
            />
          ))}
        </div>
      );
    }

    if (error || localError) {
      return (
        <p className="rounded-lg border border-dashed border-[#2f3238] px-3 py-4 text-center text-xs text-red-400">
          {error ?? localError}
        </p>
      );
    }

    if (projects.length === 0) {
      return (
        <p className="rounded-lg border border-dashed border-[#2f3238] px-3 py-4 text-center text-xs text-gray-500">
          No projects yet
        </p>
      );
    }

    return projects.map((project) => {
      return (
        <div
          key={project.id}
          className="group relative flex items-center gap-2"
          data-project-item
        >
          <div
            onClick={(e) => {
              if (renamingProjectId !== project.id) {
                void handleSelectProject(project.id);
              }
            }}
            className={`flex flex-1 min-w-0 items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition ${
              renamingProjectId === project.id ? "" : "hover:cursor-pointer"
            } ${
              selectedProject === project.id
                ? "bg-[var(--surface-2)] text-white"
                : "text-gray-400 hover:bg-[var(--surface-2)] hover:text-white"
            }`}
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
              />
            </svg>

            <input
              ref={(el) => {
                renameInputRefs.current[project.id] = el;
              }}
              type="text"
              className={`flex-1 min-w-0 max-w-full truncate text-sm outline-none border-0 bg-transparent p-0 text-inherit ${
                renamingProjectId !== project.id ? "pointer-events-none" : ""
              }`}
              value={
                renamingProjectId === project.id
                  ? tempProjectName
                  : project.name
              }
              onChange={(e) => {
                e.stopPropagation();
                if (renamingProjectId === project.id) {
                  setTempProjectName(e.target.value);
                }
              }}
              onMouseDown={(e) => {
                if (renamingProjectId === project.id) {
                  e.stopPropagation();
                }
              }}
              onClick={(e) => {
                if (renamingProjectId === project.id) {
                  e.stopPropagation();
                  const input = e.target as HTMLInputElement;
                  input.focus();
                }
              }}
              onKeyDown={(e) => {
                e.stopPropagation();
                if (renamingProjectId === project.id) {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    if (tempProjectName.trim()) {
                      void handleRenameSave(project.id);
                    }
                  } else if (e.key === "Escape") {
                    e.preventDefault();
                    handleRenameCancel();
                  }
                }
              }}
              onBlur={() => {
                if (renamingProjectId === project.id) {
                  if (tempProjectName.trim()) {
                    void handleRenameSave(project.id);
                  }
                }
              }}
              readOnly={renamingProjectId !== project.id}
              disabled={renamingProjectId !== project.id}
            />

            {renamingProjectId !== project.id && (
              <DropdownMenu>
                <DropdownMenuTrigger
                  asChild
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                >
                  <button
                    type="button"
                    className="rounded p-1 text-gray-500 opacity-0 transition hover:bg-[var(--surface-2)] hover:text-white group-hover:opacity-100 hover:cursor-pointer"
                  >
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"
                      />
                    </svg>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-[160px]">
                  <DropdownMenuItem
                    onSelect={(e) => {
                      handleRenameClick(project.id);
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                    className="cursor-pointer"
                  >
                    Rename Project
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      void handleDeleteClick(project.id);
                    }}
                    className="cursor-pointer text-red-400 focus:text-red-400 focus:bg-red-500/10"
                  >
                    Delete Project
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      );
    });
  }, [
    error,
    handleSelectProject,
    localError,
    listLoading,
    projects,
    selectedProject,
    tempProjectName,
    renamingProjectId,
  ]);

  return (
    <>
      <Link
        href="/features/kanban"
        className="mb-8 flex items-center gap-4 rounded-lg border border-transparent"
      >
        <img
          src="/logo.svg"
          alt="TasklyAI logo"
          className="h-10 w-10 flex-shrink-0 object-contain"
        />
        <div>
          <p className="text-base font-semibold text-white">TasklyAI</p>
          <p className="text-xs text-gray-500">AI Kanban Board</p>
        </div>
      </Link>

      <div className="mb-4 flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
          Main Menu
        </p>
        <button
          type="button"
          onClick={openCreateModal}
          disabled={creating}
          className="rounded-lg p-1.5 text-gray-500 transition hover:bg-[var(--surface-2)] hover:text-white hover:cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
        </button>
      </div>

      <nav className="flex flex-1 flex-col gap-1">{projectListState}</nav>

      <Link
        href="/features/settings"
        className="mt-6 flex items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-gray-400 transition hover:bg-[var(--surface-2)] hover:text-white"
      >
        <svg
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
        Settings
      </Link>

      {isMounted && isCreateModalOpen
        ? createPortal(
            <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 p-4">
              <div className="w-full max-w-md rounded-2xl border border-[#2f3238] bg-[var(--surface-1)] p-6 shadow-2xl">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-lg font-semibold text-white">
                      New Project Folder
                    </p>
                    <p className="text-xs text-gray-500">
                      Choose a name for your project folder.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={closeCreateModal}
                    disabled={creating}
                    className="rounded-lg p-2 text-gray-400 transition hover:bg-[var(--surface-2)] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                <div className="space-y-4">
                  <label className="block text-xs font-medium uppercase tracking-[0.2em] text-gray-500">
                    Folder Name
                  </label>
                  <input
                    type="text"
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    autoFocus
                    className="w-full rounded-lg border border-[#2f3238] bg-transparent px-3 py-2 text-sm text-white outline-none focus:border-white"
                  />
                </div>

                <div className="mt-6 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={closeCreateModal}
                    disabled={creating}
                    className="rounded-lg border border-[#2f3238] px-4 py-2 text-sm text-gray-300 transition hover:bg-[var(--surface-2)] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleCreateProject()}
                    disabled={creating || !newProjectName.trim()}
                    className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-white/80 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {creating ? "Creating..." : "Create Folder"}
                  </button>
                </div>
              </div>
            </div>,
            document.body
          )
        : null}

      {isMounted && projectPendingDelete
        ? createPortal(
            <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/70 p-4">
              <div className="w-full max-w-md rounded-2xl border border-[#2f3238] bg-[var(--surface-1)] p-6 shadow-2xl">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-lg font-semibold text-white">
                      Delete project?
                    </p>
                    <p className="text-xs text-gray-500">
                      This action permanently removes&nbsp;
                      <span className="text-white">
                        {projectPendingDelete.name}
                      </span>
                      &nbsp;and all related tasks.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleCancelDelete}
                    disabled={isDeletingProject}
                    className="rounded-lg p-2 text-gray-400 transition hover:bg-[var(--surface-2)] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                <div className="rounded-xl border border-[#2f3238] bg-[#181b1f] p-4 text-sm text-gray-300">
                  <p className="font-semibold text-white">
                    You can't undo this.
                  </p>
                  <p className="mt-2 text-xs text-gray-400">
                    Make sure you've exported any information you still need
                    before continuing. Tasks associated with this project will
                    be deleted as well.
                  </p>
                  {deleteError ? (
                    <p className="mt-3 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
                      {deleteError}
                    </p>
                  ) : null}
                </div>

                <div className="mt-6 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={handleCancelDelete}
                    disabled={isDeletingProject}
                    className="rounded-lg border border-[#2f3238] px-4 py-2 text-sm text-gray-300 transition hover:bg-[var(--surface-2)] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleConfirmDelete()}
                    disabled={isDeletingProject}
                    className="rounded-lg bg-[#d9534f] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#e26460] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isDeletingProject ? "Deleting..." : "Delete project"}
                  </button>
                </div>
              </div>
            </div>,
            document.body
          )
        : null}
    </>
  );
}

