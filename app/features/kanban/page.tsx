"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

import { KanbanBoard } from "@/components/ui/kanban-board";
import { AIOverlay } from "@/components/ui/ai-overlay";
import { CreateTaskModal } from "@/components/ui/create-task-modal";
import type { Task } from "@/types/kanban";
import { useProjects } from "@/app/features/projects/hooks/projects-provider";
import {
  createTask,
  getTasksByProject,
} from "@/app/features/tasks/services/task-service";

type GeneratedTask = {
  id: string;
  title: string;
  description: string;
  priority: Task["priority"];
  due: string;
};

export default function KanbanFeaturePage() {
  const searchParams = useSearchParams();
  const {
    projects,
    loading: projectsLoading,
    error: projectsError,
    ensureDefaultProject,
  } = useProjects();
  const [projectDescription, setProjectDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);
  const [generatedTasks, setGeneratedTasks] = useState<GeneratedTask[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false);
  const [tasksLoading, setTasksLoading] = useState(false);

  useEffect(() => {
    void ensureDefaultProject();
  }, [ensureDefaultProject]);

  // Extract project ID from URL to use as stable dependency
  const projectIdFromUrl = searchParams.get("project");

  useEffect(() => {
    if (projects.length > 0) {
      // Get project ID from URL params first, then fallback to first project
      const projectIdToUse =
        projectIdFromUrl && projects.some((p) => p.id === projectIdFromUrl)
          ? projectIdFromUrl
          : projects[0].id;

      setActiveProjectId((prev) => {
        // Only update if the project ID actually changed
        if (prev !== projectIdToUse) {
          return projectIdToUse;
        }
        return prev;
      });
    } else {
      // Clear active project if no projects available
      setActiveProjectId(null);
    }
  }, [projects, projectIdFromUrl]);

  const activeProject = useMemo(
    () => projects.find((project) => project.id === activeProjectId) ?? null,
    [activeProjectId, projects]
  );

  // Load tasks when project changes
  useEffect(() => {
    // Clear tasks immediately when project changes
    setTasks([]);

    if (!activeProjectId) {
      return;
    }

    const loadTasks = async () => {
      setTasksLoading(true);
      try {
        const taskRecords = await getTasksByProject(activeProjectId);
        const mappedTasks: Task[] = taskRecords.map((record) => ({
          id: record.id,
          title: record.title,
          description: record.description || "",
          status: (record.status as Task["status"]) || "todo",
          priority: (record.priority as Task["priority"]) || "Medium",
          due: "", // Schema doesn't have due date, but Task type requires it
        }));
        setTasks(mappedTasks);
      } catch (error) {
        console.error("Failed to load tasks:", error);
        setTasks([]); // Clear tasks on error
      } finally {
        setTasksLoading(false);
      }
    };

    void loadTasks();
  }, [activeProjectId]);

  const handleGenerate = async () => {
    if (!projectDescription.trim()) return;

    setIsLoading(true);
    setShowOverlay(false);

    // Simulate AI thinking/loading
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setIsLoading(false);
    setGeneratedTasks([]);
    setShowOverlay(true);
  };

  const handleAddToKanban = (tasksToAdd: GeneratedTask[]) => {
    const newTasks: Task[] = tasksToAdd.map((task) => ({
      id: `task-${Date.now()}-${task.id}`,
      title: task.title,
      description: task.description,
      status: "todo",
      priority: task.priority,
      due: task.due,
    }));

    setTasks((prev) => [...prev, ...newTasks]);
    setShowOverlay(false);
    setProjectDescription("");
  };

  const handleCreateTask = async (taskData: {
    title: string;
    description?: string;
    priority?: string;
  }) => {
    if (!activeProjectId) return;

    try {
      const newTask = await createTask({
        projectId: activeProjectId,
        title: taskData.title,
        description: taskData.description,
        priority: taskData.priority,
        status: "todo",
      });

      const mappedTask: Task = {
        id: newTask.id,
        title: newTask.title,
        description: newTask.description || "",
        status: (newTask.status as Task["status"]) || "todo",
        priority: (newTask.priority as Task["priority"]) || "Medium",
        due: "",
      };

      setTasks((prev) => [...prev, mappedTask]);
    } catch (error) {
      console.error("Failed to create task:", error);
      throw error;
    }
  };

  const showKanbanSkeleton = projectsLoading || !activeProject;

  return (
    <>
      {showKanbanSkeleton ? (
        <KanbanSkeleton />
      ) : (
        <>
          <div className="flex items-center justify-between gap-4">
            <h1 className="text-2xl font-semibold text-white">
              {activeProject?.name ?? "No project found"}
            </h1>
            <button
              type="button"
              onClick={() => setShowCreateTaskModal(true)}
              className="rounded-lg bg-[#7289da] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#7f97df]"
            >
              Add Tasks
            </button>
          </div>
          {projectsError && (
            <p className="text-sm text-red-400">{projectsError}</p>
          )}

          <section className="flex flex-col gap-4 rounded-2xl border border-[#282b30] bg-[var(--surface-1)] p-6">
            <div className="flex flex-col gap-2">
              <h2 className="text-lg font-semibold text-white">
                Generate Your Task
              </h2>
              <p className="text-sm text-gray-400">
                What tasks do you wanna work on next? I&apos;ll break them down
                for you to help with your goals.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                id="suggestion"
                type="text"
                value={projectDescription}
                onChange={(e) => setProjectDescription(e.target.value)}
                placeholder="What do you want to work on next?"
                className="w-full rounded-lg border border-[#282b30] bg-[#1e2124] px-4 py-3 text-gray-100 outline-none transition focus:border-[#7289da] focus:ring-2 focus:ring-[#7289da]/30"
                disabled={isLoading}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !isLoading) {
                    handleGenerate();
                  }
                }}
              />
              <button
                type="button"
                onClick={handleGenerate}
                disabled={isLoading || !projectDescription.trim()}
                className="rounded-lg bg-[#7289da] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#7f97df] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <svg
                      className="h-4 w-4 animate-spin"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Thinking...
                  </span>
                ) : (
                  "Generate"
                )}
              </button>
            </div>
          </section>

          {tasksLoading ? (
            <div className="flex items-center justify-center rounded-2xl border border-[#282b30] bg-[var(--surface-1)] p-12">
              <div className="flex flex-col items-center gap-3">
                <svg
                  className="h-8 w-8 animate-spin text-[#7289da]"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <p className="text-sm text-gray-400">Loading tasks...</p>
              </div>
            </div>
          ) : (
            <KanbanBoard key={activeProjectId} initialTasks={tasks} />
          )}
        </>
      )}

      <AIOverlay
        isOpen={showOverlay}
        onClose={() => setShowOverlay(false)}
        generatedTasks={generatedTasks}
        onAddToKanban={handleAddToKanban}
      />

      <CreateTaskModal
        isOpen={showCreateTaskModal}
        onClose={() => setShowCreateTaskModal(false)}
        onSubmit={handleCreateTask}
      />
    </>
  );
}

function KanbanSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-48 animate-pulse rounded bg-[#3a3d42]" />

      <section className="rounded-2xl border border-[#282b30] bg-[var(--surface-1)] p-6">
        <div className="mb-6 space-y-3">
          <div className="h-5 w-40 animate-pulse rounded bg-[#3a3d42]" />
          <div className="h-4 w-64 animate-pulse rounded bg-[#2d3035]" />
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="h-12 flex-1 animate-pulse rounded-lg bg-[#1e2124]" />
          <div className="h-12 w-40 animate-pulse rounded-lg bg-[#2d3035]" />
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map((col) => (
          <div
            key={col}
            className="rounded-2xl border border-[#282b30] bg-[var(--surface-1)] p-4"
          >
            <div className="mb-4 h-5 w-32 animate-pulse rounded bg-[#2d3035]" />
            <div className="space-y-3">
              {[1, 2, 3].map((card) => (
                <div
                  key={`${col}-${card}`}
                  className="rounded-xl border border-[#2f3238] bg-[#1f2225] p-3"
                >
                  <div className="mb-2 h-4 w-2/3 animate-pulse rounded bg-[#2d3035]" />
                  <div className="space-y-2">
                    <div className="h-3 w-full animate-pulse rounded bg-[#2d3035]" />
                    <div className="h-3 w-5/6 animate-pulse rounded bg-[#2d3035]" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
