import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { auth } from "@/lib/auth";

// PATCH /api/v1/tasks/[id]/complete - Toggle task completion
export async function PATCH(
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

    // Toggle status
    const currentStatus = existing.rows[0].status;
    const newStatus = currentStatus === "completed" ? "pending" : "completed";

    const result = await pool.query(
      `UPDATE task SET status = $1, updated_at = NOW()
       WHERE id = $2 AND user_id = $3
       RETURNING *`,
      [newStatus, taskId, session.user.id]
    );

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error("Error toggling task:", error);
    return NextResponse.json({ detail: "Internal server error" }, { status: 500 });
  }
}
