"use client";

import { Droppable } from "@hello-pangea/dnd";
import type { Status, Task } from "@/types/kanban";
import { TaskCard } from "@/components/ui/task-card";

export type ColumnMeta = {
  title: string;
  description: string;
  label: string;
};

type ColumnProps = {
  status: Status;
  tasks: Task[];
  meta: ColumnMeta;
  onEditTask?: (task: Task) => void;
  onDeleteTask?: (task: Task) => void;
};

const columnTintStyles: Record<Status, string> = {
  todo: "bg-[#1a1d21]",
  inProgress: "bg-[#151923]",
  done: "bg-[#101712]",
};

const columnHeaderTintStyles: Record<Status, string> = {
  todo: "bg-[#1f2225]",
  inProgress: "bg-[#1a1f2b]",
  done: "bg-[#141c16]",
};

export function KanbanColumn({
  status,
  tasks,
  meta,
  onEditTask,
  onDeleteTask,
}: ColumnProps) {
  return (
    <Droppable droppableId={status}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.droppableProps}
          className={`flex w-full flex-col gap-4 rounded-xl p-5 transition-colors md:flex-1 ${
            snapshot.isDraggingOver ? "ring-2 ring-[#7289da]/40" : ""
          } ${columnTintStyles[status]}`}
        >
          <header
            className={`flex flex-col gap-1 rounded-lg border border-[#282b30]/40 p-4 ${columnHeaderTintStyles[status]}`}
          >
            <div className="flex items-center justify-between">
              <p className="text-base font-semibold text-white">{meta.title}</p>
              <span className="text-xs text-gray-400">
                {tasks.length} cards
              </span>
            </div>
            <p className="text-xs text-gray-400">{meta.description}</p>
          </header>

          <div className="flex flex-1 flex-col gap-3">
            {tasks.map((task, index) => (
              <TaskCard
                key={task.id}
                task={task}
                index={index}
                onEdit={onEditTask}
                onDelete={onDeleteTask}
              />
            ))}
            {provided.placeholder}
          </div>
        </div>
      )}
    </Droppable>
  );
}
