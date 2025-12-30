export interface Task {
  id: number;
  title: string;
  due_date: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}
