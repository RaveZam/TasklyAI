"use client";

import { useState, useEffect } from "react";
import type { Task } from "@/types/kanban";

type GeneratedTask = {
  id: string;
  title: string;
  description: string;
  priority: Task["priority"];
  due: string;
};

type AIOverlayProps = {
  isOpen: boolean;
  onClose: () => void;
  generatedTasks: GeneratedTask[];
  onAddToKanban: (tasks: GeneratedTask[]) => Promise<void> | void;
};

export function AIOverlay({
  isOpen,
  onClose,
  generatedTasks,
  onAddToKanban,
}: AIOverlayProps) {
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedTasks, setEditedTasks] = useState<GeneratedTask[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSelectedTasks(new Set());
      setEditedTasks(generatedTasks);
      setEditingId(null);
    }
  }, [isOpen, generatedTasks]);

  if (!isOpen) return null;

  const handleToggleSelect = (id: string) => {
    const newSelected = new Set(selectedTasks);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedTasks(newSelected);
  };

  const handleEdit = (id: string) => {
    setEditingId(id);
  };

  const handleSaveEdit = (
    id: string,
    field: "title" | "description",
    value: string
  ) => {
    setEditedTasks((prev) =>
      prev.map((task) => (task.id === id ? { ...task, [field]: value } : task))
    );
    setEditingId(null);
  };

  const handleAddToKanban = async () => {
    const tasksToAdd = editedTasks.filter((task) => selectedTasks.has(task.id));
    if (tasksToAdd.length === 0) return;

    setIsSaving(true);
    try {
      await Promise.resolve(onAddToKanban(tasksToAdd));
      onClose();
      setSelectedTasks(new Set());
      setEditedTasks([]);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col rounded-2xl border border-[#282b30] bg-[var(--surface-1)] shadow-lg">
        <div className="flex items-center justify-between border-b border-[#282b30] p-6">
          <div>
            <h2 className="text-xl font-semibold text-white">
              AI Generated Tasks
            </h2>
            <p className="text-sm text-gray-300">
              Review and select tasks to add to your Kanban board
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 transition hover:bg-[var(--surface-2)] hover:text-white"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="flex flex-col gap-3">
            {editedTasks.length === 0 ? (
              <div className="rounded-xl border border-dashed border-[#2f3238] bg-[var(--surface-2)]/70 p-8 text-center text-sm text-gray-300">
                No AI-generated tasks yet. Connect your data source or run a
                prompt to populate this list.
              </div>
            ) : (
              editedTasks.map((task) => {
                const isSelected = selectedTasks.has(task.id);
                const isEditing = editingId === task.id;

                return (
                  <div
                    key={task.id}
                    className={`rounded-xl border p-4 transition ${
                      isSelected
                        ? "border-[#7289da] bg-[#7289da]/10"
                        : "border-[#282b30] bg-[var(--surface-2)]"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleSelect(task.id)}
                        className="mt-1 h-4 w-4 rounded border-[#282b30] bg-[var(--surface-3)] text-[#7289da] focus:ring-[#7289da]"
                      />
                      <div className="flex-1">
                        {isEditing ? (
                          <div className="flex flex-col gap-2">
                            <input
                              type="text"
                              value={task.title}
                              onChange={(e) =>
                                setEditedTasks((prev) =>
                                  prev.map((t) =>
                                    t.id === task.id
                                      ? { ...t, title: e.target.value }
                                      : t
                                  )
                                )
                              }
                              onBlur={() => setEditingId(null)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  setEditingId(null);
                                }
                              }}
                              className="rounded-lg border border-[#282b30] bg-[var(--surface-3)] px-3 py-2 text-white outline-none focus:border-[#7289da]"
                              autoFocus
                            />
                            <textarea
                              value={task.description}
                              onChange={(e) =>
                                setEditedTasks((prev) =>
                                  prev.map((t) =>
                                    t.id === task.id
                                      ? { ...t, description: e.target.value }
                                      : t
                                  )
                                )
                              }
                              onBlur={() => setEditingId(null)}
                              className="rounded-lg border border-[#282b30] bg-[var(--surface-3)] px-3 py-2 text-sm text-gray-200 outline-none focus:border-[#7289da]"
                              rows={2}
                            />
                          </div>
                        ) : (
                          <div>
                            <p className="font-semibold text-white">
                              {task.title}
                            </p>
                            <p className="text-sm text-gray-200">
                              {task.description}
                            </p>
                          </div>
                        )}
                        <div className="mt-2 flex items-center gap-3">
                          <span
                            className={`rounded-full px-2 py-1 text-xs font-semibold ${
                              task.priority === "High"
                                ? "bg-[#ff9f43] text-[#1e2124]"
                                : task.priority === "Medium"
                                ? "bg-[#ffcd4d] text-[#1e2124]"
                                : "bg-[#6ed0a7] text-[#1e2124]"
                            }`}
                          >
                            {task.priority}
                          </span>
                          <span className="text-xs text-gray-300">
                            {task.due}
                          </span>
                          {!isEditing && (
                            <button
                              type="button"
                              onClick={() => handleEdit(task.id)}
                              className="text-xs text-[#8aa2ff] transition hover:text-[#a4b7ff]"
                            >
                              Edit
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="border-t border-[#282b30] p-6">
          <button
            type="button"
            onClick={handleAddToKanban}
            disabled={selectedTasks.size === 0 || isSaving}
            className="w-full rounded-lg bg-[#7289da] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#7f97df] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSaving
              ? "Adding tasks..."
              : selectedTasks.size === 0
              ? "Select tasks to import"
              : `Add ${selectedTasks.size} Task${
                  selectedTasks.size !== 1 ? "s" : ""
                } to Kanban`}
          </button>
        </div>
      </div>
    </div>
  );
}
