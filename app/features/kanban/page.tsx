"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

import { KanbanBoard } from "@/components/ui/kanban-board";
import { AIChatDrawer, type GeneratedTask } from "@/components/ui/ai-chat-drawer";
import { CreateTaskModal } from "@/components/ui/create-task-modal";
import type { Task } from "@/types/kanban";
import { useProjects } from "@/app/features/projects/hooks/projects-provider";
import {
  createTask,
  getTasksByProjectWithCreators,
  updateTask,
  deleteTask,
} from "@/app/features/tasks/services/task-service";

export default function KanbanFeaturePage() {
  const searchParams = useSearchParams();
  const {
    projects,
    loading: projectsLoading,
    error: projectsError,
    ensureDefaultProject,
  } = useProjects();
  const [showAIDrawer, setShowAIDrawer] = useState(false);
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
    [activeProjectId, projects],
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
        const taskRecords = await getTasksByProjectWithCreators(activeProjectId);
        const mappedTasks: Task[] = taskRecords.map((record) => ({
          id: record.id,
          title: record.title,
          description: record.description || "",
          status: (record.status as Task["status"]) || "todo",
          priority: (record.priority as Task["priority"]) || "Medium",
          due: "",
          creatorAvatarUrl: record.creatorAvatarUrl,
          creatorName: record.creatorName,
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
          }),
        ),
      );

      const newTasks: Task[] = createdTasks.map((task) => ({
        id: task.id,
        title: task.title,
        description: task.description || "",
        status: (task.status as Task["status"]) || "todo",
        priority: (task.priority as Task["priority"]) || "Medium",
        due: "",
        creatorAvatarUrl: null,
        creatorName: null,
      }));

      setTasks((prev) => [...prev, ...newTasks]);
    } catch (error) {
      console.error("Failed to save AI tasks to Supabase:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Failed to save AI tasks. Please try again.",
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
        creatorAvatarUrl: null,
        creatorName: null,
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
        creatorAvatarUrl: editingTask.creatorAvatarUrl,
        creatorName: editingTask.creatorName,
      };

      setTasks((prev) =>
        prev.map((task) => (task.id === editingTask.id ? mappedTask : task)),
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
          : "Failed to delete task. Please try again.",
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

      {/* AI FAB */}
      <button
        type="button"
        onClick={() => setShowAIDrawer(true)}
        aria-label="Open AI Assistant"
        className="fixed bottom-6 right-6 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-[#7289da] text-white shadow-lg transition hover:bg-[#7f97df] hover:scale-105 active:scale-95"
      >
        <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z" />
        </svg>
      </button>

      <AIChatDrawer
        isOpen={showAIDrawer}
        onClose={() => setShowAIDrawer(false)}
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
