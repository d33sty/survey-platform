from datetime import datetime

from pydantic import BaseModel

from app.schemas.poll import QuestionOptionOut


class AnswerIn(BaseModel):
    question_id: int
    text_value: str | None = None
    number_value: float | None = None
    selected_option_ids: list[int] = []


class SubmitResponseIn(BaseModel):
    answers: list[AnswerIn]


class AnswerOut(BaseModel):
    model_config = {"from_attributes": True}

    id: int
    question_id: int
    text_value: str | None
    number_value: float | None
    selected_options: list[QuestionOptionOut]


class PollResponseOut(BaseModel):
    model_config = {"from_attributes": True}

    id: int
    poll_id: int
    submitted_at: datetime
    answers: list[AnswerOut]


class PollResponseListItem(BaseModel):
    model_config = {"from_attributes": True}

    id: int
    poll_id: int
    submitted_at: datetime
