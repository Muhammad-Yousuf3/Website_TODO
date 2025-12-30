import { NextRequest, NextResponse } from "next/server";
import { pool, initTasksTable } from "@/lib/db";
import { auth } from "@/lib/auth";

// Ensure table exists on first request
let tableInitialized = false;

async function ensureTable() {
  if (!tableInitialized) {
    await initTasksTable();
    tableInitialized = true;
  }
}

// GET /api/v1/tasks - List tasks
export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
    }

    await ensureTable();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const perPage = parseInt(searchParams.get("per_page") || "20");
    const status = searchParams.get("status");
    const offset = (page - 1) * perPage;

    let query = "SELECT * FROM task WHERE user_id = $1";
    const params: (string | number)[] = [session.user.id];

    if (status) {
      query += " AND status = $2";
      params.push(status);
    }

    query += " ORDER BY created_at DESC LIMIT $" + (params.length + 1) + " OFFSET $" + (params.length + 2);
    params.push(perPage, offset);

    const result = await pool.query(query, params);

    // Get total count
    let countQuery = "SELECT COUNT(*) FROM task WHERE user_id = $1";
    const countParams: string[] = [session.user.id];
    if (status) {
      countQuery += " AND status = $2";
      countParams.push(status);
    }
    const countResult = await pool.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].count);

    return NextResponse.json({
      tasks: result.rows,
      total,
      page,
      per_page: perPage,
    });
  } catch (error) {
    console.error("Error listing tasks:", error);
    return NextResponse.json({ detail: "Internal server error" }, { status: 500 });
  }
}

// POST /api/v1/tasks - Create task
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
    }

    await ensureTable();

    const body = await request.json();
    const { title, due_date } = body;

    if (!title) {
      return NextResponse.json({ detail: "Title is required" }, { status: 400 });
    }

    const result = await pool.query(
      `INSERT INTO task (user_id, title, due_date, status, created_at, updated_at)
       VALUES ($1, $2, $3, 'pending', NOW(), NOW())
       RETURNING *`,
      [session.user.id, title, due_date || null]
    );

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error("Error creating task:", error);
    return NextResponse.json({ detail: "Internal server error" }, { status: 500 });
  }
}
