import { Pool } from "pg";

// Singleton database pool
const globalForDb = globalThis as unknown as { pool: Pool | undefined };

export const pool =
  globalForDb.pool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
    max: 10,
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.pool = pool;
}

// Task types
export interface Task {
  id: number;
  user_id: string;
  title: string;
  due_date: Date | null;
  status: "pending" | "completed";
  created_at: Date;
  updated_at: Date;
}

// Initialize tasks table if not exists
export async function initTasksTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS task (
      id SERIAL PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      due_date TIMESTAMP,
      status TEXT DEFAULT 'pending',
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )
  `);

  // Create index for user_id if not exists
  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_task_user_id ON task(user_id)
  `);
}
