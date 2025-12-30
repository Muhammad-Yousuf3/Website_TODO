"""Task SQLModel definition."""

from datetime import datetime, date
from enum import Enum
from typing import Optional

from sqlmodel import SQLModel, Field


class TaskStatus(str, Enum):
    """Task completion status."""
    pending = "pending"
    completed = "completed"


class Task(SQLModel, table=True):
    """Task database model.

    Represents a todo item belonging to a specific user.
    Tasks are strictly scoped to their owner via user_id.
    """
    __tablename__ = "task"

    id: Optional[int] = Field(default=None, primary_key=True)
    title: str = Field(max_length=500)
    due_date: Optional[date] = Field(default=None)
    status: TaskStatus = Field(default=TaskStatus.pending)
    user_id: str = Field(index=True)  # From JWT sub claim
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
