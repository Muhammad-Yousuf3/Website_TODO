"""Task business logic service."""

from datetime import datetime
from typing import Optional, Tuple, List

from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select, func

from app.models.task import Task, TaskStatus
from app.schemas.task import TaskCreate, TaskUpdate


class TaskService:
    """Service for task CRUD operations with ownership enforcement."""

    def __init__(self, session: AsyncSession):
        self.session = session

    async def create_task(self, user_id: str, task_data: TaskCreate) -> Task:
        """Create a new task for a user.

        Args:
            user_id: Owner's user ID from JWT
            task_data: Task creation data

        Returns:
            Created task
        """
        task = Task(
            title=task_data.title.strip(),
            due_date=task_data.due_date,
            user_id=user_id,
        )
        self.session.add(task)
        await self.session.commit()
        await self.session.refresh(task)
        return task

    async def list_tasks(
        self,
        user_id: str,
        page: int = 1,
        per_page: int = 20,
        status: Optional[str] = None,
    ) -> Tuple[List[Task], int]:
        """List tasks for a user with pagination.

        Args:
            user_id: Owner's user ID from JWT
            page: Page number (1-indexed)
            per_page: Items per page (max 100)
            status: Optional status filter

        Returns:
            Tuple of (tasks list, total count)
        """
        per_page = min(per_page, 100)  # Cap at 100
        offset = (page - 1) * per_page

        # Build base query
        query = select(Task).where(Task.user_id == user_id)
        count_query = select(func.count()).select_from(Task).where(Task.user_id == user_id)

        # Apply status filter if provided
        if status:
            query = query.where(Task.status == status)
            count_query = count_query.where(Task.status == status)

        # Get total count
        total_result = await self.session.execute(count_query)
        total = total_result.scalar() or 0

        # Get paginated tasks
        query = query.order_by(Task.created_at.desc()).offset(offset).limit(per_page)
        result = await self.session.execute(query)
        tasks = list(result.scalars().all())

        return tasks, total

    async def get_task(self, user_id: str, task_id: int) -> Optional[Task]:
        """Get a single task by ID with ownership check.

        Args:
            user_id: Owner's user ID from JWT
            task_id: Task ID

        Returns:
            Task if found and owned by user, None otherwise
        """
        query = select(Task).where(Task.id == task_id, Task.user_id == user_id)
        result = await self.session.execute(query)
        return result.scalar_one_or_none()

    async def get_task_any_user(self, task_id: int) -> Optional[Task]:
        """Get a task by ID without ownership check (for 403 vs 404).

        Args:
            task_id: Task ID

        Returns:
            Task if found, None otherwise
        """
        query = select(Task).where(Task.id == task_id)
        result = await self.session.execute(query)
        return result.scalar_one_or_none()

    async def update_task(
        self,
        user_id: str,
        task_id: int,
        task_data: TaskUpdate,
    ) -> Optional[Task]:
        """Update a task with ownership check.

        Args:
            user_id: Owner's user ID from JWT
            task_id: Task ID
            task_data: Update data

        Returns:
            Updated task if found and owned, None otherwise
        """
        task = await self.get_task(user_id, task_id)
        if not task:
            return None

        # Apply updates
        if task_data.title is not None:
            task.title = task_data.title.strip()
        if task_data.due_date is not None:
            task.due_date = task_data.due_date
        if task_data.status is not None:
            task.status = TaskStatus(task_data.status)

        task.updated_at = datetime.utcnow()

        self.session.add(task)
        await self.session.commit()
        await self.session.refresh(task)
        return task

    async def toggle_complete(self, user_id: str, task_id: int) -> Optional[Task]:
        """Toggle task completion status.

        Args:
            user_id: Owner's user ID from JWT
            task_id: Task ID

        Returns:
            Updated task if found and owned, None otherwise
        """
        task = await self.get_task(user_id, task_id)
        if not task:
            return None

        # Toggle status
        task.status = (
            TaskStatus.completed
            if task.status == TaskStatus.pending
            else TaskStatus.pending
        )
        task.updated_at = datetime.utcnow()

        self.session.add(task)
        await self.session.commit()
        await self.session.refresh(task)
        return task

    async def delete_task(self, user_id: str, task_id: int) -> bool:
        """Delete a task with ownership check.

        Args:
            user_id: Owner's user ID from JWT
            task_id: Task ID

        Returns:
            True if deleted, False if not found or not owned
        """
        task = await self.get_task(user_id, task_id)
        if not task:
            return False

        await self.session.delete(task)
        await self.session.commit()
        return True
