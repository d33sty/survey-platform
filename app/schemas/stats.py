from pydantic import BaseModel

from app.models.poll import QuestionType


class OptionStats(BaseModel):
    option_id: int
    option_text: str
    count: int


class QuestionStats(BaseModel):
    question_id: int
    question_text: str
    type: QuestionType
    response_count: int
    # for number / rating questions
    min_value: float | None = None
    max_value: float | None = None
    avg_value: float | None = None
    # for choice questions
    options: list[OptionStats] = []


class PollStats(BaseModel):
    poll_id: int
    total_responses: int
    questions: list[QuestionStats]
