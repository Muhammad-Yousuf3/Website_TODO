"""Task Pydantic schemas for request/response validation."""

from datetime import date, datetime
from typing import Optional, List

from pydantic import BaseModel, Field


class TaskCreate(BaseModel):
    """Schema for creating a new task."""
    title: str = Field(min_length=1, max_length=500)
    due_date: Optional[date] = None


class TaskUpdate(BaseModel):
    """Schema for updating an existing task."""
    title: Optional[str] = Field(default=None, min_length=1, max_length=500)
    due_date: Optional[date] = None
    status: Optional[str] = Field(default=None, pattern="^(pending|completed)$")


class TaskResponse(BaseModel):
    """Schema for task response."""
    id: int
    title: str
    due_date: Optional[date]
    status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class TaskListResponse(BaseModel):
    """Schema for paginated task list response."""
    tasks: List[TaskResponse]
    total: int
    page: int
    per_page: int
