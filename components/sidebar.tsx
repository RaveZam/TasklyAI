"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

import { useProjects } from "@/app/features/projects/hooks/projects-provider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Sidebar() {
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
  const [renameValue, setRenameValue] = useState("");

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

  const handleCreateProject = async () => {
    setCreating(true);
    setLocalError(null);
    try {
      const suffix = projects.length + 1;
      const project = await createNewProject(`Untitled Project ${suffix}`);
      if (project) {
        setSelectedProject(project.id);
        router.push(`/features/kanban?project=${project.id}`);
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
    },
    [router]
  );

  const handleRenameClick = (projectId: string, currentName: string) => {
    setRenamingProjectId(projectId);
    setRenameValue(currentName);
  };

  const handleRenameSubmit = async (projectId: string) => {
    if (!renameValue.trim()) {
      setRenamingProjectId(null);
      return;
    }

    try {
      await updateProject(projectId, renameValue.trim());
      setRenamingProjectId(null);
      setRenameValue("");
    } catch (err) {
      setLocalError(
        err instanceof Error ? err.message : "Unable to rename project."
      );
    }
  };

  const handleDeleteClick = async (projectId: string) => {
    if (!confirm("Are you sure you want to delete this project?")) {
      return;
    }

    try {
      await deleteProject(projectId);

      // If deleted project was selected, navigate to first project or home
      if (selectedProject === projectId) {
        const remainingProjects = projects.filter((p) => p.id !== projectId);
        if (remainingProjects.length > 0) {
          router.push(`/features/kanban?project=${remainingProjects[0].id}`);
        } else {
          router.push("/");
        }
      }
    } catch (err) {
      setLocalError(
        err instanceof Error ? err.message : "Unable to delete project."
      );
    }
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
      const isRenaming = renamingProjectId === project.id;

      return (
        <div
          key={project.id}
          className="group relative flex items-center gap-2"
        >
          {isRenaming ? (
            <div className="flex flex-1 items-center gap-2 rounded-lg px-3 py-2">
              <input
                type="text"
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    void handleRenameSubmit(project.id);
                  } else if (e.key === "Escape") {
                    setRenamingProjectId(null);
                    setRenameValue("");
                  }
                }}
                onBlur={() => void handleRenameSubmit(project.id)}
                autoFocus
                className="flex-1 rounded border border-[#282b30] bg-[#1e2124] px-2 py-1 text-sm text-white outline-none focus:border-[#7289da]"
              />
            </div>
          ) : (
            <div
              onClick={() => void handleSelectProject(project.id)}
              className={`flex flex-1 items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition hover:cursor-pointer ${
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
              <span className="flex-1 truncate">{project.name}</span>
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
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRenameClick(project.id, project.name);
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
            </div>
          )}
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
  ]);

  return (
    <aside className="sticky top-0 hidden h-screen w-64 flex-col border-r border-[#282b30] bg-[var(--surface-1)] p-6 text-sm text-gray-300 lg:flex">
      <div className="mb-8 flex items-center gap-4">
        <div className="relative flex-shrink-0 ">
          <Image
            src="/logo/Darkmode.png"
            alt="TasklyAI Logo"
            width={32}
            height={32}
            className="object-contain dark:opacity-100 opacity-0"
            priority
          />
          <Image
            src="/logo/Lightmode.png"
            alt="TasklyAI Logo"
            width={32}
            height={32}
            className="object-contain dark:opacity-0 opacity-100 absolute top-0 left-0"
            priority
          />
        </div>
        <div>
          <p className="text-base font-semibold text-white">TasklyAI</p>
          <p className="text-xs text-gray-500">AI Kanban Board</p>
        </div>
      </div>

      <nav className="mb-6 flex flex-col gap-1">
        <button
          type="button"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-gray-400 transition hover:bg-[var(--surface-2)] hover:text-white"
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
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          Search
        </button>
        <button
          type="button"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-gray-400 transition hover:bg-[var(--surface-2)] hover:text-white"
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
          Activity
        </button>
        <Link
          href="/features/settings"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-gray-400 transition hover:bg-[var(--surface-2)] hover:text-white"
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
      </nav>

      <div className="mb-4 flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
          Main Menu
        </p>
        <button
          type="button"
          onClick={handleCreateProject}
          disabled={creating}
          className="rounded-lg p-1.5 text-gray-500 transition hover:bg-[var(--surface-2)] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
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
    </aside>
  );
}
