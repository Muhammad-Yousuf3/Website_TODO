"use client";

import { authClient } from "./auth-client";

// Empty string means same-origin (for HF Spaces/Docker with nginx proxy)
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

interface ApiClientOptions {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async getAuthHeader(): Promise<Record<string, string>> {
    try {
      const { data } = await authClient.token();
      if (data?.token) {
        return { Authorization: `Bearer ${data.token}` };
      }
    } catch (error) {
      console.error("Failed to get auth token:", error);
    }
    return {};
  }

  async request<T>(endpoint: string, options: ApiClientOptions = {}): Promise<T> {
    const { method = "GET", body, headers = {} } = options;

    const authHeaders = await this.getAuthHeader();

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...authHeaders,
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (response.status === 401) {
      // Redirect to login on unauthorized
      window.location.href = "/login";
      throw new Error("Unauthorized");
    }

    if (response.status === 403) {
      throw new Error("You do not have permission to access this resource");
    }

    if (response.status === 404) {
      throw new Error("Resource not found");
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: "Request failed" }));
      throw new Error(error.detail || "Request failed");
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return undefined as T;
    }

    return response.json();
  }

  // Task API methods
  async createTask(data: { title: string; due_date?: string }) {
    return this.request<{
      id: number;
      title: string;
      due_date: string | null;
      status: string;
      created_at: string;
      updated_at: string;
    }>("/api/v1/tasks", { method: "POST", body: data });
  }

  async listTasks(params?: { page?: number; per_page?: number; status?: string }) {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set("page", params.page.toString());
    if (params?.per_page) searchParams.set("per_page", params.per_page.toString());
    if (params?.status) searchParams.set("status", params.status);

    const query = searchParams.toString();
    return this.request<{
      tasks: Array<{
        id: number;
        title: string;
        due_date: string | null;
        status: string;
        created_at: string;
        updated_at: string;
      }>;
      total: number;
      page: number;
      per_page: number;
    }>(`/api/v1/tasks${query ? `?${query}` : ""}`);
  }

  async getTask(id: number) {
    return this.request<{
      id: number;
      title: string;
      due_date: string | null;
      status: string;
      created_at: string;
      updated_at: string;
    }>(`/api/v1/tasks/${id}`);
  }

  async updateTask(id: number, data: { title?: string; due_date?: string; status?: string }) {
    return this.request<{
      id: number;
      title: string;
      due_date: string | null;
      status: string;
      created_at: string;
      updated_at: string;
    }>(`/api/v1/tasks/${id}`, { method: "PUT", body: data });
  }

  async toggleComplete(id: number) {
    return this.request<{
      id: number;
      title: string;
      due_date: string | null;
      status: string;
      created_at: string;
      updated_at: string;
    }>(`/api/v1/tasks/${id}/complete`, { method: "PATCH" });
  }

  async deleteTask(id: number) {
    return this.request<void>(`/api/v1/tasks/${id}`, { method: "DELETE" });
  }
}

export const apiClient = new ApiClient(API_URL);
