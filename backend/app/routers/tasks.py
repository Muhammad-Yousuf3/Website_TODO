"""Task CRUD endpoints."""

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_session
from app.auth import get_current_user, JWTClaims
from app.schemas import TaskCreate, TaskUpdate, TaskResponse, TaskListResponse
from app.services import TaskService

router = APIRouter(prefix="/api/v1/tasks", tags=["tasks"])


def get_task_service(session: AsyncSession = Depends(get_session)) -> TaskService:
    """Dependency for TaskService."""
    return TaskService(session)


@router.post("", response_model=TaskResponse, status_code=201)
async def create_task(
    task_data: TaskCreate,
    user: JWTClaims = Depends(get_current_user),
    service: TaskService = Depends(get_task_service),
):
    """Create a new task.

    Requires JWT authentication. Task is automatically assigned to the authenticated user.
    """
    task = await service.create_task(user.user_id, task_data)
    return task


@router.get("", response_model=TaskListResponse)
async def list_tasks(
    page: int = Query(default=1, ge=1),
    per_page: int = Query(default=20, ge=1, le=100),
    status: Optional[str] = Query(default=None, pattern="^(pending|completed)$"),
    user: JWTClaims = Depends(get_current_user),
    service: TaskService = Depends(get_task_service),
):
    """List user's tasks with pagination.

    Requires JWT authentication. Only returns tasks owned by the authenticated user.
    """
    tasks, total = await service.list_tasks(user.user_id, page, per_page, status)
    return TaskListResponse(
        tasks=tasks,
        total=total,
        page=page,
        per_page=per_page,
    )


@router.get("/{task_id}", response_model=TaskResponse)
async def get_task(
    task_id: int,
    user: JWTClaims = Depends(get_current_user),
    service: TaskService = Depends(get_task_service),
):
    """Get a single task by ID.

    Requires JWT authentication. Returns 403 if task belongs to another user.
    """
    # Check if task exists at all (for 403 vs 404)
    task_any = await service.get_task_any_user(task_id)
    if not task_any:
        raise HTTPException(status_code=404, detail="Task not found")

    # Check ownership
    task = await service.get_task(user.user_id, task_id)
    if not task:
        raise HTTPException(
            status_code=403,
            detail="You do not have permission to access this task"
        )

    return task


@router.put("/{task_id}", response_model=TaskResponse)
async def update_task(
    task_id: int,
    task_data: TaskUpdate,
    user: JWTClaims = Depends(get_current_user),
    service: TaskService = Depends(get_task_service),
):
    """Update a task.

    Requires JWT authentication. Returns 403 if task belongs to another user.
    """
    # Check if task exists at all
    task_any = await service.get_task_any_user(task_id)
    if not task_any:
        raise HTTPException(status_code=404, detail="Task not found")

    # Check ownership and update
    task = await service.update_task(user.user_id, task_id, task_data)
    if not task:
        raise HTTPException(
            status_code=403,
            detail="You do not have permission to access this task"
        )

    return task


@router.patch("/{task_id}/complete", response_model=TaskResponse)
async def toggle_complete(
    task_id: int,
    user: JWTClaims = Depends(get_current_user),
    service: TaskService = Depends(get_task_service),
):
    """Toggle task completion status.

    Requires JWT authentication. Returns 403 if task belongs to another user.
    """
    # Check if task exists at all
    task_any = await service.get_task_any_user(task_id)
    if not task_any:
        raise HTTPException(status_code=404, detail="Task not found")

    # Check ownership and toggle
    task = await service.toggle_complete(user.user_id, task_id)
    if not task:
        raise HTTPException(
            status_code=403,
            detail="You do not have permission to access this task"
        )

    return task


@router.delete("/{task_id}", status_code=204)
async def delete_task(
    task_id: int,
    user: JWTClaims = Depends(get_current_user),
    service: TaskService = Depends(get_task_service),
):
    """Delete a task.

    Requires JWT authentication. Returns 403 if task belongs to another user.
    """
    # Check if task exists at all
    task_any = await service.get_task_any_user(task_id)
    if not task_any:
        raise HTTPException(status_code=404, detail="Task not found")

    # Check ownership and delete
    deleted = await service.delete_task(user.user_id, task_id)
    if not deleted:
        raise HTTPException(
            status_code=403,
            detail="You do not have permission to access this task"
        )

    return None
