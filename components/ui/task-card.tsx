"use client";

import { useState } from "react";
import { Draggable } from "@hello-pangea/dnd";
import type { Task } from "@/types/kanban";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

type TaskCardProps = {
  task: Task;
  index: number;
  onEdit?: (task: Task) => void;
  onDelete?: (task: Task) => void;
};

const priorityColors: Record<Task["priority"], string> = {
  High: "bg-[#ff9f43]",
  Medium: "bg-[#ffcd4d]",
  Low: "bg-[#6ed0a7]",
};

const statusBorderTints: Record<Task["status"], string> = {
  todo: "border-[#1f2124]",
  inProgress: "border-[#2f7afc]/25",
  done: "border-[#1a211c]",
};

export function TaskCard({ task, index, onEdit, onDelete }: TaskCardProps) {
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const handleOpenDetails = () => {
    setIsDetailOpen(true);
  };

  const handleCloseDetails = () => {
    setIsDetailOpen(false);
  };

  const handleEditFromModal = () => {
    onEdit?.(task);
    handleCloseDetails();
  };

  const handleDeleteFromModal = () => {
    onDelete?.(task);
    handleCloseDetails();
  };

  return (
    <>
      <Draggable draggableId={task.id} index={index}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            onClick={handleOpenDetails}
            role="button"
            tabIndex={0}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                handleOpenDetails();
              }
            }}
            className={`group rounded-xl border ${
              statusBorderTints[task.status]
            } bg-[var(--surface-1)] p-4 text-base text-gray-200 transition focus:outline-none focus:ring-2 focus:ring-[#7289da]/60 ${
              task.status === "done" ? "opacity-50" : ""
            } ${snapshot.isDragging ? "ring-2 ring-[#7289da]/60" : ""}`}
          >
            <div className="flex items-start justify-between gap-3">
              <p className="text-lg font-medium text-gray-300">{task.title}</p>
              <div className="flex items-center gap-2">
                <div
                  className={`rounded-full px-3 py-1 text-xs font-semibold uppercase text-gray-900 ${
                    priorityColors[task.priority]
                  }`}
                  aria-label={`${task.priority} priority`}
                >
                  {task.priority}
                </div>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between text-sm text-gray-300">
              <div className="flex items-center gap-2">
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

      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent
          className="max-w-lg rounded-2xl border border-[#2f3238] bg-[#1f2225] text-gray-100 shadow-2xl"
          showCloseButton={true}
        >
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-white">
              {task.title}
            </DialogTitle>
            <DialogDescription className="mt-2 text-base leading-relaxed text-gray-300">
              {task.description || "No description provided for this task."}
            </DialogDescription>
          </DialogHeader>

          <div className="mt-6 space-y-4 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Priority</span>
              <span
                className={`${
                  priorityColors[task.priority]
                } rounded-full px-3 py-1 text-sm font-semibold text-[#1e2124]`}
              >
                {task.priority}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Status</span>
              <span className="text-white">
                {task.status === "todo" && "Queued"}
                {task.status === "inProgress" && "Active"}
                {task.status === "done" && "Complete"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Due date</span>
              <span className="text-white">{task.due}</span>
            </div>
          </div>

          <DialogFooter className="mt-8 flex flex-wrap justify-end gap-3 sm:justify-end">
            {onEdit && (
              <button
                type="button"
                onClick={handleEditFromModal}
                className="rounded-lg bg-[#7289da] px-4 py-2 text-sm font-semibold text-white transition hover:cursor-pointer hover:bg-[#7f97df]"
              >
                Edit Task
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                onClick={handleDeleteFromModal}
                className="rounded-lg bg-[#d9534f] px-4 py-2 text-sm font-semibold text-white transition hover:cursor-pointer hover:bg-[#e26460]"
              >
                Delete Task
              </button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
