import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { auth } from "@/lib/auth";

// GET /api/v1/tasks/[id] - Get single task
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const taskId = parseInt(id);

    // Check if task exists
    const anyTask = await pool.query("SELECT * FROM task WHERE id = $1", [taskId]);
    if (anyTask.rows.length === 0) {
      return NextResponse.json({ detail: "Task not found" }, { status: 404 });
    }

    // Check ownership
    const result = await pool.query(
      "SELECT * FROM task WHERE id = $1 AND user_id = $2",
      [taskId, session.user.id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { detail: "You do not have permission to access this task" },
        { status: 403 }
      );
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error("Error getting task:", error);
    return NextResponse.json({ detail: "Internal server error" }, { status: 500 });
  }
}

// PUT /api/v1/tasks/[id] - Update task
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const taskId = parseInt(id);
    const body = await request.json();

    // Check if task exists
    const anyTask = await pool.query("SELECT * FROM task WHERE id = $1", [taskId]);
    if (anyTask.rows.length === 0) {
      return NextResponse.json({ detail: "Task not found" }, { status: 404 });
    }

    // Check ownership
    const existing = await pool.query(
      "SELECT * FROM task WHERE id = $1 AND user_id = $2",
      [taskId, session.user.id]
    );

    if (existing.rows.length === 0) {
      return NextResponse.json(
        { detail: "You do not have permission to access this task" },
        { status: 403 }
      );
    }

    // Build update query dynamically
    const updates: string[] = [];
    const values: (string | number)[] = [];
    let paramIndex = 1;

    if (body.title !== undefined) {
      updates.push(`title = $${paramIndex++}`);
      values.push(body.title);
    }
    if (body.due_date !== undefined) {
      updates.push(`due_date = $${paramIndex++}`);
      values.push(body.due_date);
    }
    if (body.status !== undefined) {
      updates.push(`status = $${paramIndex++}`);
      values.push(body.status);
    }

    updates.push(`updated_at = NOW()`);
    values.push(taskId, session.user.id);

    const result = await pool.query(
      `UPDATE task SET ${updates.join(", ")}
       WHERE id = $${paramIndex++} AND user_id = $${paramIndex}
       RETURNING *`,
      values
    );

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error("Error updating task:", error);
    return NextResponse.json({ detail: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/v1/tasks/[id] - Delete task
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const taskId = parseInt(id);

    // Check if task exists
    const anyTask = await pool.query("SELECT * FROM task WHERE id = $1", [taskId]);
    if (anyTask.rows.length === 0) {
      return NextResponse.json({ detail: "Task not found" }, { status: 404 });
    }

    // Check ownership and delete
    const result = await pool.query(
      "DELETE FROM task WHERE id = $1 AND user_id = $2 RETURNING *",
      [taskId, session.user.id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { detail: "You do not have permission to access this task" },
        { status: 403 }
      );
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting task:", error);
    return NextResponse.json({ detail: "Internal server error" }, { status: 500 });
  }
}
