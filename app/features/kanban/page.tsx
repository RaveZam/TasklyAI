"use client";

import { useState } from "react";

import { KanbanBoard } from "@/components/ui/kanban-board";
import { AIOverlay } from "@/components/ui/ai-overlay";
import type { Task } from "@/types/kanban";

type GeneratedTask = {
  id: string;
  title: string;
  description: string;
  priority: Task["priority"];
  due: string;
};

export default function KanbanFeaturePage() {
  const [projectDescription, setProjectDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);
  const [generatedTasks, setGeneratedTasks] = useState<GeneratedTask[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);

  const handleGenerate = async () => {
    if (!projectDescription.trim()) return;

    setIsLoading(true);
    setShowOverlay(false);

    // Simulate AI thinking/loading
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setIsLoading(false);
    setGeneratedTasks([]);
    setShowOverlay(true);
  };

  const handleAddToKanban = (tasksToAdd: GeneratedTask[]) => {
    const newTasks: Task[] = tasksToAdd.map((task) => ({
      id: `task-${Date.now()}-${task.id}`,
      title: task.title,
      description: task.description,
      status: "todo",
      priority: task.priority,
      due: task.due,
    }));

    setTasks((prev) => [...prev, ...newTasks]);
    setShowOverlay(false);
    setProjectDescription("");
  };

  return (
    <>
      <section className="flex flex-col gap-4 rounded-2xl border border-[#282b30] bg-[var(--surface-1)] p-6">
        <div className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold text-white">Generate Your Task</h2>
          <p className="text-sm text-gray-400">
            What tasks do you wanna work on next? I&apos;ll break them down for you to help
            with your goals.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            id="suggestion"
            type="text"
            value={projectDescription}
            onChange={(e) => setProjectDescription(e.target.value)}
            placeholder="What do you want to work on next?"
            className="w-full rounded-lg border border-[#282b30] bg-[#1e2124] px-4 py-3 text-gray-100 outline-none transition focus:border-[#7289da] focus:ring-2 focus:ring-[#7289da]/30"
            disabled={isLoading}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !isLoading) {
                handleGenerate();
              }
            }}
          />
          <button
            type="button"
            onClick={handleGenerate}
            disabled={isLoading || !projectDescription.trim()}
            className="rounded-lg bg-[#7289da] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#7f97df] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
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
                Thinking...
              </span>
            ) : (
              "Generate"
            )}
          </button>
        </div>
      </section>

      <KanbanBoard initialTasks={tasks} />

      <AIOverlay
        isOpen={showOverlay}
        onClose={() => setShowOverlay(false)}
        generatedTasks={generatedTasks}
        onAddToKanban={handleAddToKanban}
      />
    </>
  );
}

