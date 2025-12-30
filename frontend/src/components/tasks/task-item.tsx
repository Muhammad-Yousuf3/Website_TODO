"use client";

import { useState } from "react";
import { TaskActions } from "./task-actions";
import { Task } from "@/types/task";

interface TaskItemProps {
  task: Task;
  onToggleComplete: (id: number) => Promise<void>;
  onEdit: (task: Task) => void;
  onDelete: (id: number) => Promise<void>;
}

export function TaskItem({ task, onToggleComplete, onEdit, onDelete }: TaskItemProps) {
  const [isToggling, setIsToggling] = useState(false);
  const isCompleted = task.status === "completed";
  const dueDate = task.due_date ? new Date(task.due_date) : null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const isOverdue = dueDate && dueDate < today && !isCompleted;
  const isDueToday = dueDate && dueDate.toDateString() === today.toDateString() && !isCompleted;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === now.toDateString()) {
      return "Today";
    }
    if (date.toDateString() === tomorrow.toDateString()) {
      return "Tomorrow";
    }
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
  };

  const handleToggle = async () => {
    setIsToggling(true);
    try {
      await onToggleComplete(task.id);
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <div
      className={`
        group flex items-center gap-4 p-4 bg-white rounded-xl border-2 transition-all duration-200
        ${isCompleted
          ? "border-slate-100 bg-slate-50/50"
          : isOverdue
            ? "border-red-200 bg-red-50/50 hover:border-red-300"
            : isDueToday
              ? "border-amber-200 bg-amber-50/30 hover:border-amber-300"
              : "border-slate-100 hover:border-slate-200 hover:shadow-sm"
        }
      `}
    >
      <button
        onClick={handleToggle}
        disabled={isToggling}
        className={`
          flex-shrink-0 w-6 h-6 rounded-lg border-2 flex items-center justify-center
          transition-all duration-200 cursor-pointer
          ${isToggling ? "opacity-50" : ""}
          ${
            isCompleted
              ? "bg-emerald-500 border-emerald-500 text-white shadow-sm shadow-emerald-200"
              : isOverdue
                ? "border-red-300 hover:border-red-400 hover:bg-red-50"
                : "border-slate-300 hover:border-indigo-400 hover:bg-indigo-50"
          }
        `}
        aria-label={isCompleted ? "Mark as incomplete" : "Mark as complete"}
      >
        {isToggling ? (
          <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        ) : isCompleted ? (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        ) : null}
      </button>

      <div className="flex-1 min-w-0">
        <p
          className={`
            text-slate-800 break-words leading-relaxed transition-all duration-200
            ${isCompleted ? "line-through text-slate-400" : ""}
          `}
        >
          {task.title}
        </p>
        {task.due_date && (
          <div className="flex items-center gap-1.5 mt-1.5">
            <svg
              className={`w-3.5 h-3.5 ${isOverdue ? "text-red-500" : isDueToday ? "text-amber-500" : "text-slate-400"}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span
              className={`
                text-xs font-medium
                ${isOverdue
                  ? "text-red-600"
                  : isDueToday
                    ? "text-amber-600"
                    : isCompleted
                      ? "text-slate-400"
                      : "text-slate-500"
                }
              `}
            >
              {formatDate(task.due_date)}
              {isOverdue && (
                <span className="ml-1.5 px-1.5 py-0.5 bg-red-100 text-red-700 rounded text-[10px] uppercase tracking-wide">
                  Overdue
                </span>
              )}
            </span>
          </div>
        )}
      </div>

      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <TaskActions
          task={task}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      </div>
    </div>
  );
}
