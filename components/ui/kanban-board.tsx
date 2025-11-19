"use client";

import { DragDropContext, type DropResult } from "@hello-pangea/dnd";
import { useState, useEffect } from "react";
import type { Status, Task } from "@/types/kanban";
import { KanbanColumn, type ColumnMeta } from "@/components/ui/kanban-column";

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
    title: "Done",
    description: "Recently completed",
    label: "Complete",
  },
};

type KanbanBoardProps = {
  initialTasks?: Task[];
};

export function KanbanBoard({ initialTasks: propTasks }: KanbanBoardProps = {}) {
  const [allTasks, setAllTasks] = useState<Task[]>(initialTasks);
  const [columns, setColumns] = useState<Record<Status, Task[]>>(() =>
    groupByStatus(initialTasks)
  );

  // Update columns when propTasks change
  useEffect(() => {
    if (propTasks && propTasks.length > 0) {
      setAllTasks((prevTasks) => {
        // Get existing task IDs to avoid duplicates
        const existingIds = new Set(prevTasks.map((t) => t.id));
        const newTasks = propTasks.filter((t) => !existingIds.has(t.id));
        
        if (newTasks.length > 0) {
          const combinedTasks = [...prevTasks, ...newTasks];
          setColumns(groupByStatus(combinedTasks));
          return combinedTasks;
        }
        return prevTasks;
      });
    }
  }, [propTasks?.length]);

  const handleDragEnd = (result: DropResult) => {
    const { destination, source } = result;
    if (!destination) return;

    const sourceId = source.droppableId as Status;
    const destinationId = destination.droppableId as Status;

    if (sourceId === destinationId && source.index === destination.index) {
      return;
    }

    const sourceTasks = Array.from(columns[sourceId]);
    const [movedTask] = sourceTasks.splice(source.index, 1);

    const destinationTasks =
      sourceId === destinationId
        ? sourceTasks
        : Array.from(columns[destinationId]);

    const updatedTask = { ...movedTask, status: destinationId };
    destinationTasks.splice(destination.index, 0, updatedTask);

    setColumns((prev) => ({
      ...prev,
      [sourceId]: sourceId === destinationId ? destinationTasks : sourceTasks,
      [destinationId]: destinationTasks,
    }));
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <section className="flex flex-col gap-4 rounded-2xl border border-[#282b30] bg-[var(--surface-1)] p-6">
        <div className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold text-white">Today&apos;s Outlook</h2>
          <p className="text-sm text-gray-400">
            Drag cards to keep priorities aligned. Everything stays client-side.
          </p>
        </div>
        <div className="flex flex-row flex-wrap gap-4 md:gap-6">
          {statusOrder.map((status) => (
            <KanbanColumn
              key={status}
              status={status}
              tasks={columns[status]}
              meta={statusMeta[status]}
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

