"use client";

import { useState } from "react";

type CreateTaskModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (task: {
    title: string;
    description?: string;
    priority?: string;
  }) => Promise<void>;
};

export function CreateTaskModal({
  isOpen,
  onClose,
  onSubmit,
}: CreateTaskModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"Low" | "Medium" | "High" | "">("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim() || undefined,
        priority: priority || undefined,
      });
      // Reset form
      setTitle("");
      setDescription("");
      setPriority("");
      onClose();
    } catch (error) {
      console.error("Failed to create task:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setTitle("");
      setDescription("");
      setPriority("");
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-md rounded-2xl border border-[#282b30] bg-[var(--surface-1)] p-6 shadow-2xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">Create New Task</h2>
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="rounded-lg p-2 text-gray-400 transition hover:bg-[var(--surface-2)] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="task-title"
              className="mb-2 block text-sm font-medium text-gray-300"
            >
              Title <span className="text-red-400">*</span>
            </label>
            <input
              id="task-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter task title"
              required
              disabled={isSubmitting}
              className="w-full rounded-lg border border-[#282b30] bg-[#1e2124] px-4 py-3 text-gray-100 outline-none transition focus:border-[#7289da] focus:ring-2 focus:ring-[#7289da]/30 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          <div>
            <label
              htmlFor="task-description"
              className="mb-2 block text-sm font-medium text-gray-300"
            >
              Description
            </label>
            <textarea
              id="task-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter task description (optional)"
              rows={4}
              disabled={isSubmitting}
              className="w-full rounded-lg border border-[#282b30] bg-[#1e2124] px-4 py-3 text-gray-100 outline-none transition focus:border-[#7289da] focus:ring-2 focus:ring-[#7289da]/30 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
            />
          </div>

          <div>
            <label
              htmlFor="task-priority"
              className="mb-2 block text-sm font-medium text-gray-300"
            >
              Priority
            </label>
            <select
              id="task-priority"
              value={priority}
              onChange={(e) =>
                setPriority(e.target.value as "Low" | "Medium" | "High" | "")
              }
              disabled={isSubmitting}
              className="w-full rounded-lg border border-[#282b30] bg-[#1e2124] px-4 py-3 text-gray-100 outline-none transition focus:border-[#7289da] focus:ring-2 focus:ring-[#7289da]/30 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">Select priority (optional)</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1 rounded-lg border border-[#282b30] px-4 py-3 text-sm font-semibold text-gray-100 transition hover:bg-[var(--surface-2)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !title.trim()}
              className="flex-1 rounded-lg bg-[#7289da] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#7f97df] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
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
                  Creating...
                </span>
              ) : (
                "Create Task"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

