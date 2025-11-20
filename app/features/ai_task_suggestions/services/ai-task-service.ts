import type { Task } from "@/types/kanban";

export type AIGeneratedTask = {
  title: string;
  description: string;
  priority: Task["priority"];
};

export async function generateTasksFromAI(
  description: string
): Promise<AIGeneratedTask[]> {
  if (!description.trim()) {
    throw new Error("Description cannot be empty");
  }

  const response = await fetch("/api/ai/generate-tasks", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ description: description.trim() }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.error || `Failed to generate tasks: ${response.statusText}`
    );
  }

  const data = await response.json();
  return data.tasks || [];
}
