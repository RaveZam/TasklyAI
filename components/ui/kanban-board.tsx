"use client";

import { DragDropContext, type DropResult } from "@hello-pangea/dnd";
import { useState, useEffect } from "react";
import type { Status, Task } from "@/types/kanban";
import { KanbanColumn, type ColumnMeta } from "@/components/ui/kanban-column";
import { updateTaskStatus } from "@/app/features/tasks/services/task-service";

const initialTasks: Task[] = [];

const statusOrder: Status[] = ["todo", "inProgress", "done"];

const statusMeta: Record<Status, ColumnMeta> = {
  todo: {
    title: "To Do",
    description: "Ideas & queued work",
    label: "Queued",
  },
  inProgress: {
    title: "In Progress",
    description: "Execution underway",
    label: "Live",
  },
  done: {
    title: "Complete",
    description: "Recently completed",
    label: "Complete",
  },
};

type KanbanBoardProps = {
  initialTasks?: Task[];
  onEditTask?: (task: Task) => void;
  onDeleteTask?: (task: Task) => void;
};

export function KanbanBoard({
  initialTasks: propTasks,
  onEditTask,
  onDeleteTask,
}: KanbanBoardProps = {}) {
  const [allTasks, setAllTasks] = useState<Task[]>(initialTasks);
  const [columns, setColumns] = useState<Record<Status, Task[]>>(() =>
    groupByStatus(initialTasks)
  );

  // Update columns when propTasks change
  useEffect(() => {
    // Always sync with propTasks - replace all tasks when propTasks changes
    const tasksToUse = propTasks ?? [];
    setAllTasks(tasksToUse);
    setColumns(groupByStatus(tasksToUse));
  }, [propTasks]);

  const handleDragEnd = async (result: DropResult) => {
    const { destination, source } = result;
    if (!destination) return;

    const sourceId = source.droppableId as Status;
    const destinationId = destination.droppableId as Status;

    if (sourceId === destinationId && source.index === destination.index) {
      return;
    }

    // Store previous state for potential revert
    const previousColumns = { ...columns };

    const sourceTasks = Array.from(columns[sourceId]);
    const [movedTask] = sourceTasks.splice(source.index, 1);

    const destinationTasks =
      sourceId === destinationId
        ? sourceTasks
        : Array.from(columns[destinationId]);

    const updatedTask = { ...movedTask, status: destinationId };
    destinationTasks.splice(destination.index, 0, updatedTask);

    // Optimistically update the UI
    setColumns((prev) => ({
      ...prev,
      [sourceId]: sourceId === destinationId ? destinationTasks : sourceTasks,
      [destinationId]: destinationTasks,
    }));

    // Update task status in database
    // Only update if the status actually changed
    if (sourceId !== destinationId) {
      try {
        await updateTaskStatus(movedTask.id, destinationId);
        // Update allTasks to reflect the change
        setAllTasks((prev) =>
          prev.map((task) => (task.id === movedTask.id ? updatedTask : task))
        );
      } catch (error) {
        console.error("Failed to update task status:", error);
        // Revert the optimistic update on error
        setColumns(previousColumns);
      }
    }
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <section className="flex flex-col gap-4 rounded-2xl border border-[#282b30] bg-[var(--surface-1)] p-6">
        <div className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold text-white">
            Today&apos;s Plan
          </h2>
          <p className="text-sm text-gray-400">
            Drag, drop, and organize. Keep your day simple and focused.
          </p>
        </div>
        <div className="flex flex-row flex-wrap gap-4 md:gap-6">
          {statusOrder.map((status) => (
            <KanbanColumn
              key={status}
              status={status}
              tasks={columns[status]}
              meta={statusMeta[status]}
              onEditTask={onEditTask}
              onDeleteTask={onDeleteTask}
            />
          ))}
        </div>
      </section>
    </DragDropContext>
  );
}

function groupByStatus(tasks: Task[]): Record<Status, Task[]> {
  return tasks.reduce<Record<Status, Task[]>>(
    (acc, task) => {
      acc[task.status].push(task);
      return acc;
    },
    {
      todo: [],
      inProgress: [],
      done: [],
    }
  );
}
