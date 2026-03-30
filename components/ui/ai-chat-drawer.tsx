"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import type { Task } from "@/types/kanban";
import { generateTasksFromAI } from "@/app/features/ai_task_suggestions/services/ai-task-service";

export type GeneratedTask = {
  id: string;
  title: string;
  description: string;
  priority: Task["priority"];
  due: string;
};

type ChatMessage =
  | { id: string; role: "user"; content: string }
  | { id: string; role: "assistant"; content: string; taskMsgId?: string }
  | { id: string; role: "loading" };

export type AIChatDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  onAddToKanban: (tasks: GeneratedTask[]) => Promise<void>;
};

const WELCOME_MESSAGE: ChatMessage = {
  id: "welcome",
  role: "assistant",
  content:
    "Hey! Tell me what you're working on and I'll break it down into tasks for you. Just describe your project or goal.",
};

const SPARKLE_SVG = (
  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
    <path d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z" />
  </svg>
);

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-4 py-3">
      {[0, 150, 300].map((delay) => (
        <span
          key={delay}
          className="h-2 w-2 rounded-full bg-gray-400 animate-bounce"
          style={{ animationDelay: `${delay}ms` }}
        />
      ))}
    </div>
  );
}

type TaskItemProps = {
  task: GeneratedTask;
  isSelected: boolean;
  isEditing: boolean;
  onToggle: () => void;
  onStartEdit: () => void;
  onStopEdit: () => void;
  onChange: (patch: Partial<Pick<GeneratedTask, "title" | "description">>) => void;
};

function TaskItem({
  task,
  isSelected,
  isEditing,
  onToggle,
  onStartEdit,
  onStopEdit,
  onChange,
}: TaskItemProps) {
  const priorityColor =
    task.priority === "High"
      ? "bg-[#ff9f43] text-[#1e2124]"
      : task.priority === "Medium"
        ? "bg-[#ffcd4d] text-[#1e2124]"
        : "bg-[#6ed0a7] text-[#1e2124]";

  return (
    <div
      className={`rounded-xl border p-3 transition ${
        isSelected
          ? "border-[#7289da] bg-[#7289da]/10"
          : "border-[#282b30] bg-[var(--surface-1)]"
      }`}
    >
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onToggle}
          className="mt-1 h-4 w-4 shrink-0 rounded border-[#282b30] bg-[var(--surface-3)] text-[#7289da]"
        />
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <div className="flex flex-col gap-2">
              <input
                type="text"
                value={task.title}
                onChange={(e) => onChange({ title: e.target.value })}
                onBlur={onStopEdit}
                onKeyDown={(e) => e.key === "Enter" && onStopEdit()}
                autoFocus
                className="w-full rounded border border-[#282b30] bg-[var(--surface-3)] px-2 py-1 text-sm text-white outline-none focus:border-[#7289da]"
              />
              <textarea
                value={task.description}
                onChange={(e) => onChange({ description: e.target.value })}
                onBlur={onStopEdit}
                rows={2}
                className="w-full rounded border border-[#282b30] bg-[var(--surface-3)] px-2 py-1 text-xs text-gray-200 outline-none focus:border-[#7289da]"
              />
            </div>
          ) : (
            <>
              <p className="text-sm font-semibold text-white">{task.title}</p>
              <p className="mt-0.5 text-xs text-gray-400 line-clamp-2">
                {task.description}
              </p>
            </>
          )}
          <div className="mt-2 flex items-center gap-2">
            <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${priorityColor}`}>
              {task.priority}
            </span>
            {!isEditing && (
              <button
                type="button"
                onClick={onStartEdit}
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
}

type TaskChecklistProps = {
  tasks: GeneratedTask[];
  selectedIds: Set<string>;
  editingId: string | null;
  onToggle: (id: string) => void;
  onStartEdit: (id: string) => void;
  onStopEdit: () => void;
  onChange: (id: string, patch: Partial<Pick<GeneratedTask, "title" | "description">>) => void;
};

function TaskChecklist({
  tasks,
  selectedIds,
  editingId,
  onToggle,
  onStartEdit,
  onStopEdit,
  onChange,
}: TaskChecklistProps) {
  return (
    <div className="mt-3 flex flex-col gap-2">
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          isSelected={selectedIds.has(task.id)}
          isEditing={editingId === task.id}
          onToggle={() => onToggle(task.id)}
          onStartEdit={() => onStartEdit(task.id)}
          onStopEdit={onStopEdit}
          onChange={(patch) => onChange(task.id, patch)}
        />
      ))}
    </div>
  );
}

export function AIChatDrawer({ isOpen, onClose, onAddToKanban }: AIChatDrawerProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [editedTasks, setEditedTasks] = useState<GeneratedTask[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [latestTaskMsgId, setLatestTaskMsgId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) {
      setMessages([WELCOME_MESSAGE]);
      setInput("");
      setEditedTasks([]);
      setSelectedIds(new Set());
      setLatestTaskMsgId(null);
      setEditingId(null);
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = useCallback(async () => {
    if (!input.trim() || isGenerating) return;
    const query = input.trim();
    const loadingId = "loading";

    setMessages((prev) => [
      ...prev,
      { id: `user-${Date.now()}`, role: "user", content: query },
      { id: loadingId, role: "loading" },
    ]);
    setInput("");
    setIsGenerating(true);

    try {
      const aiTasks = await generateTasksFromAI(query);
      const mapped: GeneratedTask[] = aiTasks.map((t, i) => ({
        id: `ai-${Date.now()}-${i}`,
        title: t.title,
        description: t.description,
        priority: t.priority,
        due: "",
      }));

      const aiMsgId = `ai-${Date.now()}`;
      setMessages((prev) => [
        ...prev.filter((m) => m.id !== loadingId),
        {
          id: aiMsgId,
          role: "assistant",
          content: `Here are ${mapped.length} tasks I came up with! Check the ones you want to add to your board.`,
          taskMsgId: aiMsgId,
        },
      ]);
      setEditedTasks(mapped);
      setSelectedIds(new Set(mapped.map((t) => t.id)));
      setLatestTaskMsgId(aiMsgId);
      setEditingId(null);
    } catch (err) {
      setMessages((prev) => [
        ...prev.filter((m) => m.id !== loadingId),
        {
          id: `err-${Date.now()}`,
          role: "assistant",
          content:
            err instanceof Error
              ? err.message
              : "Something went wrong. Please try again.",
        },
      ]);
    } finally {
      setIsGenerating(false);
    }
  }, [input, isGenerating]);

  const handleAddToKanban = async () => {
    const toAdd = editedTasks.filter((t) => selectedIds.has(t.id));
    if (!toAdd.length) return;
    setIsSaving(true);
    try {
      await onAddToKanban(toAdd);
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  const toggleTask = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const patchTask = (
    id: string,
    patch: Partial<Pick<GeneratedTask, "title" | "description">>
  ) => {
    setEditedTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...patch } : t))
    );
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40"
          onClick={onClose}
        />
      )}

      <div
        className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-[440px] flex-col bg-[var(--surface-1)] border-l border-[#282b30] shadow-2xl transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-[#282b30] px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#7289da]/20 text-[#7289da]">
              {SPARKLE_SVG}
            </div>
            <div>
              <p className="text-sm font-semibold text-white">AI Assistant</p>
              <p className="text-xs text-gray-400">Generate tasks from your ideas</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 transition hover:bg-[var(--surface-2)] hover:text-white"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((msg) => {
            if (msg.role === "loading") {
              return (
                <div key="loading" className="flex items-start gap-2">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#7289da]/20 text-[#7289da]">
                    {SPARKLE_SVG}
                  </div>
                  <div className="rounded-2xl rounded-tl-sm border border-[#282b30] bg-[var(--surface-2)]">
                    <TypingIndicator />
                  </div>
                </div>
              );
            }
            if (msg.role === "user") {
              return (
                <div key={msg.id} className="flex justify-end">
                  <div className="max-w-[85%] rounded-2xl rounded-tr-sm bg-[#7289da] px-4 py-2.5">
                    <p className="text-sm text-white">{msg.content}</p>
                  </div>
                </div>
              );
            }
            return (
              <div key={msg.id} className="flex items-start gap-2">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#7289da]/20 text-[#7289da]">
                  {SPARKLE_SVG}
                </div>
                <div className="flex-1 min-w-0 rounded-2xl rounded-tl-sm border border-[#282b30] bg-[var(--surface-2)] px-4 py-3">
                  <p className="text-sm text-gray-100">{msg.content}</p>
                  {msg.taskMsgId === latestTaskMsgId && editedTasks.length > 0 && (
                    <TaskChecklist
                      tasks={editedTasks}
                      selectedIds={selectedIds}
                      editingId={editingId}
                      onToggle={toggleTask}
                      onStartEdit={setEditingId}
                      onStopEdit={() => setEditingId(null)}
                      onChange={patchTask}
                    />
                  )}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Add to Kanban button */}
        {selectedIds.size > 0 && editedTasks.length > 0 && (
          <div className="shrink-0 px-4 pb-2">
            <button
              type="button"
              onClick={() => void handleAddToKanban()}
              disabled={isSaving}
              className="w-full rounded-lg bg-[#7289da] py-2.5 text-sm font-semibold text-white transition hover:bg-[#7f97df] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSaving
                ? "Adding..."
                : `Add ${selectedIds.size} Task${selectedIds.size !== 1 ? "s" : ""} to Kanban`}
            </button>
          </div>
        )}

        {/* Input */}
        <div className="shrink-0 border-t border-[#282b30] p-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void handleSend();
                }
              }}
              placeholder="What do you want to work on?"
              disabled={isGenerating}
              className="flex-1 rounded-xl border border-[#282b30] bg-[#1e2124] px-4 py-2.5 text-sm text-gray-100 outline-none transition placeholder:text-gray-500 focus:border-[#7289da] focus:ring-1 focus:ring-[#7289da]/30 disabled:opacity-50"
            />
            <button
              type="button"
              onClick={() => void handleSend()}
              disabled={isGenerating || !input.trim()}
              aria-label="Send message"
              className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-xl bg-[#7289da] text-white transition hover:bg-[#7f97df] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isGenerating ? (
                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
