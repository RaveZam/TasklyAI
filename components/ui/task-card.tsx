"use client";

import { Draggable } from "@hello-pangea/dnd";
import type { Task } from "@/types/kanban";

type TaskCardProps = {
  task: Task;
  index: number;
};

const priorityColors: Record<Task["priority"], string> = {
  High: "bg-[#ff9f43]",
  Medium: "bg-[#ffcd4d]",
  Low: "bg-[#6ed0a7]",
};

export function TaskCard({ task, index }: TaskCardProps) {
  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`rounded-xl border border-[#282b30] bg-[#1e2124] p-4 text-sm text-gray-100 transition ${
            snapshot.isDragging ? "ring-2 ring-[#7289da]/60" : ""
          }`}
        >
          <div className="mb-3 flex items-start justify-between gap-3">
            <div>
              <p className="text-base font-semibold text-white">{task.title}</p>
              <p className="text-xs text-gray-400">{task.description}</p>
            </div>
            <div
              className={`h-1.5 w-16 rounded-full ${priorityColors[task.priority]}`}
              aria-label={`${task.priority} priority`}
            />
          </div>

          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>{task.due}</span>
            <span className="uppercase tracking-[0.3em] text-[#7289da]">
              {task.status === "todo" && "Queued"}
              {task.status === "inProgress" && "Active"}
              {task.status === "done" && "Complete"}
            </span>
          </div>
        </div>
      )}
    </Draggable>
  );
}
