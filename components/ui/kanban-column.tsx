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
};

export function KanbanColumn({ status, tasks, meta }: ColumnProps) {
  return (
    <Droppable droppableId={status}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.droppableProps}
          className={`flex w-full flex-col gap-4 rounded-xl border border-[#282b30] bg-[#1a1d21] p-5 transition-colors md:flex-1 ${
            snapshot.isDraggingOver ? "ring-2 ring-[#7289da]/40" : ""
          }`}
        >
          <header className="flex flex-col gap-1 rounded-lg border border-[#282b30] bg-[#1f2225] p-4">
            <div className="flex items-center justify-between">
              <p className="text-base font-semibold text-white">{meta.title}</p>
              <span className="text-xs text-gray-400">{tasks.length} cards</span>
            </div>
            <p className="text-xs text-gray-400">{meta.description}</p>
          </header>

          <div className="flex flex-1 flex-col gap-3">
            {tasks.map((task, index) => (
              <TaskCard key={task.id} task={task} index={index} />
            ))}
            {provided.placeholder}
          </div>
        </div>
      )}
    </Droppable>
  );
}

