"use client";

import { Draggable } from "@hello-pangea/dnd";
import { MoreHorizontal } from "lucide-react";
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
          className={`group rounded-xl border border-[#282b30] bg-[#15171a] p-4 text-sm text-gray-100 transition ${
            snapshot.isDragging ? "ring-2 ring-[#7289da]/60" : ""
          }`}
        >
          <div className="mb-3 flex items-start justify-between gap-3">
            <div>
              <p className="text-base font-semibold text-white">{task.title}</p>
              <p className="text-xs text-gray-400">{task.description}</p>
            </div>
            <MoreHorizontal
              className="h-4 w-4 text-gray-400 opacity-0 transition-opacity group-hover:opacity-100"
              aria-label="Task options"
            />
          </div>

          <div className="flex items-center justify-between text-xs text-gray-400">
            <div className="flex items-center gap-2">
              <div
                className={`h-1.5 w-16 rounded-full ${
                  priorityColors[task.priority]
                }`}
                aria-label={`${task.priority} priority`}
              />
              <span>{task.due}</span>
            </div>
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
