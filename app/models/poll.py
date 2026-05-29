import enum
from datetime import datetime

from sqlalchemy import Enum, Float, ForeignKey, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class QuestionType(str, enum.Enum):
    text = "text"
    number = "number"
    rating = "rating"
    single_choice = "single_choice"
    multiple_choice = "multiple_choice"


class Poll(Base):
    __tablename__ = "polls"

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    is_active: Mapped[bool] = mapped_column(default=True, server_default="true")
    created_at: Mapped[datetime] = mapped_column(server_default=func.now())

    questions: Mapped[list["Question"]] = relationship(
        back_populates="poll",
        order_by="Question.order",
        cascade="all, delete-orphan",
    )
    responses: Mapped[list["PollResponse"]] = relationship(
        back_populates="poll",
        cascade="all, delete-orphan",
    )


class Question(Base):
    __tablename__ = "questions"

    id: Mapped[int] = mapped_column(primary_key=True)
    poll_id: Mapped[int] = mapped_column(ForeignKey("polls.id", ondelete="CASCADE"))
    text: Mapped[str] = mapped_column(Text, nullable=False)
    type: Mapped[QuestionType] = mapped_column(Enum(QuestionType), nullable=False)
    order: Mapped[int] = mapped_column(default=0)
    required: Mapped[bool] = mapped_column(default=True, server_default="true")

    poll: Mapped["Poll"] = relationship(back_populates="questions")
    options: Mapped[list["QuestionOption"]] = relationship(
        back_populates="question",
        order_by="QuestionOption.order",
        cascade="all, delete-orphan",
    )
    answers: Mapped[list["Answer"]] = relationship(back_populates="question")


class QuestionOption(Base):
    __tablename__ = "question_options"

    id: Mapped[int] = mapped_column(primary_key=True)
    question_id: Mapped[int] = mapped_column(ForeignKey("questions.id", ondelete="CASCADE"))
    text: Mapped[str] = mapped_column(String(255), nullable=False)
    order: Mapped[int] = mapped_column(default=0)

    question: Mapped["Question"] = relationship(back_populates="options")


class PollResponse(Base):
    __tablename__ = "poll_responses"

    id: Mapped[int] = mapped_column(primary_key=True)
    poll_id: Mapped[int] = mapped_column(ForeignKey("polls.id", ondelete="CASCADE"))
    submitted_at: Mapped[datetime] = mapped_column(server_default=func.now())

    poll: Mapped["Poll"] = relationship(back_populates="responses")
    answers: Mapped[list["Answer"]] = relationship(
        back_populates="poll_response",
        cascade="all, delete-orphan",
    )


class AnswerOption(Base):
    __tablename__ = "answer_options"

    answer_id: Mapped[int] = mapped_column(ForeignKey("answers.id", ondelete="CASCADE"), primary_key=True)
    option_id: Mapped[int] = mapped_column(ForeignKey("question_options.id", ondelete="CASCADE"), primary_key=True)


class Answer(Base):
    __tablename__ = "answers"

    id: Mapped[int] = mapped_column(primary_key=True)
    poll_response_id: Mapped[int] = mapped_column(ForeignKey("poll_responses.id", ondelete="CASCADE"))
    question_id: Mapped[int] = mapped_column(ForeignKey("questions.id", ondelete="CASCADE"))
    text_value: Mapped[str | None] = mapped_column(Text)
    number_value: Mapped[float | None] = mapped_column(Float)

    poll_response: Mapped["PollResponse"] = relationship(back_populates="answers")
    question: Mapped["Question"] = relationship(back_populates="answers")
    selected_options: Mapped[list["QuestionOption"]] = relationship(
        secondary="answer_options",
        lazy="selectin",
    )
