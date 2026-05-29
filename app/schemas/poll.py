from datetime import datetime

from pydantic import BaseModel

from app.models.poll import QuestionType


class QuestionOptionIn(BaseModel):
    text: str
    order: int = 0


class QuestionOptionOut(BaseModel):
    model_config = {"from_attributes": True}

    id: int
    text: str
    order: int


class QuestionIn(BaseModel):
    text: str
    type: QuestionType
    order: int = 0
    required: bool = True
    options: list[QuestionOptionIn] = []


class QuestionOut(BaseModel):
    model_config = {"from_attributes": True}

    id: int
    text: str
    type: QuestionType
    order: int
    required: bool
    options: list[QuestionOptionOut]


class PollCreate(BaseModel):
    title: str
    description: str | None = None
    questions: list[QuestionIn] = []


class PollUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    is_active: bool | None = None


class PollOut(BaseModel):
    model_config = {"from_attributes": True}

    id: int
    title: str
    description: str | None
    is_active: bool
    created_at: datetime
    questions: list[QuestionOut]


class PollListItem(BaseModel):
    model_config = {"from_attributes": True}

    id: int
    title: str
    is_active: bool
    created_at: datetime
