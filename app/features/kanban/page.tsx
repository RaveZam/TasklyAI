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
  updateTask,
  deleteTask,
} from "@/app/features/tasks/services/task-service";
import { generateTasksFromAI } from "@/app/features/ai_task_suggestions/services/ai-task-service";

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
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
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
    setGeneratedTasks([]);

    try {
      // Call AI service to generate tasks
      const aiTasks = await generateTasksFromAI(projectDescription);

      // Map AI tasks to GeneratedTask format
      const mappedTasks: GeneratedTask[] = aiTasks.map((task, index) => ({
        id: `ai-task-${Date.now()}-${index}`,
        title: task.title,
        description: task.description,
        priority: task.priority,
        due: "", // AI doesn't generate due dates
      }));

      setGeneratedTasks(mappedTasks);
      setShowOverlay(true);
    } catch (error) {
      console.error("Failed to generate tasks:", error);
      // You might want to show an error message to the user here
      alert(
        error instanceof Error
          ? error.message
          : "Failed to generate tasks. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToKanban = async (tasksToAdd: GeneratedTask[]) => {
    if (!activeProjectId) return;

    try {
      // Create all tasks in Supabase for the active project
      const createdTasks = await Promise.all(
        tasksToAdd.map((task) =>
          createTask({
            projectId: activeProjectId,
            title: task.title,
            description: task.description,
            priority: task.priority,
            status: "todo",
          })
        )
      );

      const newTasks: Task[] = createdTasks.map((task) => ({
        id: task.id,
        title: task.title,
        description: task.description || "",
        status: (task.status as Task["status"]) || "todo",
        priority: (task.priority as Task["priority"]) || "Medium",
        due: "", // No due date from AI
      }));

      setTasks((prev) => [...prev, ...newTasks]);
      setShowOverlay(false);
      setProjectDescription("");
    } catch (error) {
      console.error("Failed to save AI tasks to Supabase:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Failed to save AI tasks. Please try again."
      );
    }
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

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setShowCreateTaskModal(true);
  };

  const handleDeleteTaskRequest = (task: Task) => {
    setTaskToDelete(task);
    setShowDeleteDialog(true);
  };

  const handleUpdateTask = async (taskData: {
    title: string;
    description?: string;
    priority?: string;
  }) => {
    if (!editingTask) return;

    try {
      const updatedTask = await updateTask(editingTask.id, {
        title: taskData.title,
        description: taskData.description,
        priority: taskData.priority,
      });

      const mappedTask: Task = {
        id: updatedTask.id,
        title: updatedTask.title,
        description: updatedTask.description || "",
        status: (updatedTask.status as Task["status"]) || "todo",
        priority: (updatedTask.priority as Task["priority"]) || "Medium",
        due: "",
      };

      setTasks((prev) =>
        prev.map((task) => (task.id === editingTask.id ? mappedTask : task))
      );
      setEditingTask(null);
    } catch (error) {
      console.error("Failed to update task:", error);
      throw error;
    }
  };

  const handleModalClose = () => {
    setShowCreateTaskModal(false);
    setEditingTask(null);
  };

  const handleModalSubmit = async (taskData: {
    title: string;
    description?: string;
    priority?: string;
  }) => {
    if (editingTask) {
      await handleUpdateTask(taskData);
    } else {
      await handleCreateTask(taskData);
    }
  };

  const handleConfirmDeleteTask = async () => {
    if (!taskToDelete) return;

    try {
      await deleteTask(taskToDelete.id);
      setTasks((prev) => prev.filter((task) => task.id !== taskToDelete.id));
      setTaskToDelete(null);
      setShowDeleteDialog(false);
    } catch (error) {
      console.error("Failed to delete task:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Failed to delete task. Please try again."
      );
    }
  };

  const handleCancelDeleteTask = () => {
    setShowDeleteDialog(false);
    setTaskToDelete(null);
  };

  const showKanbanSkeleton = projectsLoading || !activeProject;

  return (
    <>
      {showKanbanSkeleton ? (
        <div className="flex min-h-[320px] items-center justify-center rounded-2xl border border-[#282b30] bg-[var(--surface-1)] p-12">
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
            <p className="text-sm text-gray-400">
              Loading your workspace. One moment…
            </p>
          </div>
        </div>
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
            <KanbanBoard
              key={activeProjectId}
              initialTasks={tasks}
              onEditTask={handleEditTask}
              onDeleteTask={handleDeleteTaskRequest}
            />
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
        onClose={handleModalClose}
        onSubmit={handleModalSubmit}
        task={editingTask}
      />

      <DeleteTaskDialog
        open={showDeleteDialog}
        taskTitle={taskToDelete?.title ?? ""}
        onCancel={handleCancelDeleteTask}
        onConfirm={handleConfirmDeleteTask}
      />
    </>
  );
}
type DeleteTaskDialogProps = {
  open: boolean;
  taskTitle: string;
  onCancel: () => void;
  onConfirm: () => void;
};

function DeleteTaskDialog({
  open,
  taskTitle,
  onCancel,
  onConfirm,
}: DeleteTaskDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-md rounded-2xl border border-[#282b30] bg-[var(--surface-1)] p-6 text-gray-100 shadow-2xl">
        <h3 className="text-lg font-semibold text-white">Delete task?</h3>
        <p className="mt-2 text-sm text-gray-400">
          This action cannot be undone. The task{" "}
          <span className="font-semibold text-gray-200">
            {taskTitle || "Untitled task"}
          </span>{" "}
          will be permanently removed from this project.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-[#282b30] px-4 py-2 text-sm font-semibold text-gray-100 transition hover:bg-[var(--surface-2)]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-lg bg-[#d9534f] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#e26460]"
          >
            Delete Task
          </button>
        </div>
      </div>
    </div>
  );
}
