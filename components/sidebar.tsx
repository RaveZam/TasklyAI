"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

type Project = { id: string; name: string; board: string };

const initialProjects: Project[] = [];

export function Sidebar() {
  const [projects, setProjects] = useState(initialProjects);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);

  const handleCreateProject = () => {
    setProjects((prev) => {
      const newProject = {
        id: String(Date.now()),
        name: `Untitled Project ${prev.length + 1}`,
        board: "Tasks Board",
      };
      if (!selectedProject) {
        setSelectedProject(newProject.id);
      }
      return [...prev, newProject];
    });
  };

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
          className="rounded-lg p-1.5 text-gray-500 transition hover:bg-[var(--surface-2)] hover:text-white"
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

      <nav className="flex flex-1 flex-col gap-1">
        {projects.length === 0 ? (
          <p className="rounded-lg border border-dashed border-[#2f3238] px-3 py-4 text-center text-xs text-gray-500">
            No projects yet
          </p>
        ) : (
          projects.map((project) => (
            <button
              key={project.id}
              type="button"
              onClick={() => setSelectedProject(project.id)}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition ${
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
              {project.name}
            </button>
          ))
        )}
      </nav>
    </aside>
  );
}
