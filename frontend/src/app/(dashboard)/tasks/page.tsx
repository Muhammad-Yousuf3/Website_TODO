"use client";

import { useEffect, useState, useCallback } from "react";
import { apiClient } from "@/lib/api-client";
import { TaskForm } from "@/components/tasks/task-form";
import { TaskList } from "@/components/tasks/task-list";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

interface Task {
  id: number;
  title: string;
  due_date: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const fetchTasks = useCallback(async () => {
    try {
      const response = await apiClient.listTasks({ per_page: 100 });
      setTasks(response.tasks);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load tasks");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleCreateTask = async (data: { title: string; due_date?: string }) => {
    const newTask = await apiClient.createTask(data);
    setTasks((prev) => [newTask, ...prev]);
  };

  const handleUpdateTask = async (data: { title: string; due_date?: string }) => {
    if (!editingTask) return;

    const updatedTask = await apiClient.updateTask(editingTask.id, data);
    setTasks((prev) =>
      prev.map((task) => (task.id === editingTask.id ? updatedTask : task))
    );
    setEditingTask(null);
  };

  const handleToggleComplete = async (id: number) => {
    const updatedTask = await apiClient.toggleComplete(id);
    setTasks((prev) =>
      prev.map((task) => (task.id === id ? updatedTask : task))
    );
  };

  const handleDeleteTask = async (id: number) => {
    await apiClient.deleteTask(id);
    setTasks((prev) => prev.filter((task) => task.id !== id));
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingTask(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            My Tasks
          </h1>
          <p className="text-slate-500 mt-1">
            Organize your work and get things done
          </p>
        </div>
      </div>

      <Card variant="elevated">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            {editingTask ? (
              <div className="flex items-center justify-center w-10 h-10 bg-amber-100 rounded-xl">
                <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
            ) : (
              <div className="flex items-center justify-center w-10 h-10 bg-indigo-100 rounded-xl">
                <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
            )}
            <div>
              <CardTitle>
                {editingTask ? "Edit Task" : "Create New Task"}
              </CardTitle>
              <CardDescription>
                {editingTask
                  ? "Update the task details below"
                  : "Add a new task to your list"
                }
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {editingTask ? (
            <TaskForm
              task={editingTask}
              onSubmit={handleUpdateTask}
              onCancel={handleCancelEdit}
            />
          ) : (
            <TaskForm onSubmit={handleCreateTask} />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-slate-100 rounded-xl">
              <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <CardTitle>Your Tasks</CardTitle>
              <CardDescription>
                {isLoading
                  ? "Loading your tasks..."
                  : tasks.length === 0
                    ? "No tasks yet"
                    : `${tasks.length} task${tasks.length === 1 ? "" : "s"} total`
                }
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="p-4 mb-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm flex items-start gap-3">
              <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="font-medium">Failed to load tasks</p>
                <p className="mt-0.5 text-red-500">{error}</p>
              </div>
            </div>
          )}
          <TaskList
            tasks={tasks}
            isLoading={isLoading}
            onToggleComplete={handleToggleComplete}
            onEdit={handleEdit}
            onDelete={handleDeleteTask}
          />
        </CardContent>
      </Card>
    </div>
  );
}
