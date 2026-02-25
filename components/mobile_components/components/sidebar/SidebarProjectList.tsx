"use client";

import * as React from "react";
import type { ProjectRecord } from "@/app/features/projects/services/project-service";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type SidebarProjectListProps = {
  listLoading: boolean;
  error: string | null;
  localError: string | null;
  projects: ProjectRecord[];
  selectedProject: string | null;
  renamingProjectId: string | null;
  tempProjectName: string;
  renameInputRefs: React.MutableRefObject<Record<string, HTMLInputElement | null>>;
  onSelectProject: (projectId: string) => void;
  onRenameClick: (projectId: string) => void;
  onTempProjectNameChange: (next: string) => void;
  onRenameSave: (projectId: string) => void;
  onRenameCancel: () => void;
  onDeleteClick: (projectId: string) => void;
};

export function SidebarProjectList({
  listLoading,
  error,
  localError,
  projects,
  selectedProject,
  renamingProjectId,
  tempProjectName,
  renameInputRefs,
  onSelectProject,
  onRenameClick,
  onTempProjectNameChange,
  onRenameSave,
  onRenameCancel,
  onDeleteClick,
}: SidebarProjectListProps) {
  if (listLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((item) => (
          <div
            key={item}
            className="h-10 animate-pulse rounded-lg border border-[#2f3238] bg-[#1e2124]"
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

  return (
    <>
      {projects.map((project) => {
        const isRenaming = renamingProjectId === project.id;
        const isSelected = selectedProject === project.id;

        return (
          <div
            key={project.id}
            className="group relative flex items-center gap-2"
            data-project-item
          >
            <div
              onClick={() => {
                if (!isRenaming) onSelectProject(project.id);
              }}
              className={`flex min-w-0 flex-1 items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition ${
                isRenaming ? "" : "hover:cursor-pointer"
              } ${
                isSelected
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
                className={`flex-1 min-w-0 max-w-full truncate border-0 bg-transparent p-0 text-sm text-inherit outline-none ${
                  !isRenaming ? "pointer-events-none" : ""
                }`}
                value={isRenaming ? tempProjectName : project.name}
                onChange={(e) => {
                  e.stopPropagation();
                  if (isRenaming) onTempProjectNameChange(e.target.value);
                }}
                onMouseDown={(e) => {
                  if (isRenaming) e.stopPropagation();
                }}
                onClick={(e) => {
                  if (!isRenaming) return;
                  e.stopPropagation();
                  (e.target as HTMLInputElement).focus();
                }}
                onKeyDown={(e) => {
                  e.stopPropagation();
                  if (!isRenaming) return;
                  if (e.key === "Enter") {
                    e.preventDefault();
                    if (tempProjectName.trim()) onRenameSave(project.id);
                  } else if (e.key === "Escape") {
                    e.preventDefault();
                    onRenameCancel();
                  }
                }}
                onBlur={() => {
                  if (isRenaming && tempProjectName.trim()) onRenameSave(project.id);
                }}
                readOnly={!isRenaming}
                disabled={!isRenaming}
              />

              {!isRenaming && (
                <DropdownMenu>
                  <DropdownMenuTrigger
                    asChild
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                  >
                    <button
                      type="button"
                      className="rounded p-1 text-gray-500 opacity-0 transition hover:cursor-pointer hover:bg-[var(--surface-2)] hover:text-white group-hover:opacity-100"
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
                      onSelect={() => onRenameClick(project.id)}
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
                        onDeleteClick(project.id);
                      }}
                      className="cursor-pointer text-red-400 focus:bg-red-500/10 focus:text-red-400"
                    >
                      Delete Project
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        );
      })}
    </>
  );
}

