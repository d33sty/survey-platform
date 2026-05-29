from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.deps import get_current_admin
from app.models.poll import Answer, AnswerOption, Poll, PollResponse, Question, QuestionOption, QuestionType
from app.schemas.stats import OptionStats, PollStats, QuestionStats

router = APIRouter(tags=["stats"])


@router.get("/polls/{poll_id}/stats", response_model=PollStats)
async def get_poll_stats(
    poll_id: int,
    db: AsyncSession = Depends(get_db),
    _: str = Depends(get_current_admin),
):
    result = await db.execute(select(Poll).where(Poll.id == poll_id))
    poll = result.scalar_one_or_none()
    if not poll:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Poll not found")

    total_result = await db.execute(
        select(func.count()).where(PollResponse.poll_id == poll_id)
    )
    total_responses = total_result.scalar_one()

    questions_result = await db.execute(select(Question).where(Question.poll_id == poll_id))
    questions = questions_result.scalars().all()

    question_stats: list[QuestionStats] = []

    for q in questions:
        response_count_result = await db.execute(
            select(func.count(Answer.id)).where(Answer.question_id == q.id)
        )
        response_count = response_count_result.scalar_one()

        qs = QuestionStats(question_id=q.id, question_text=q.text, type=q.type, response_count=response_count)

        if q.type in (QuestionType.number, QuestionType.rating):
            agg = await db.execute(
                select(
                    func.min(Answer.number_value),
                    func.max(Answer.number_value),
                    func.avg(Answer.number_value),
                ).where(Answer.question_id == q.id, Answer.number_value.is_not(None))
            )
            row = agg.one()
            qs.min_value = row[0]
            qs.max_value = row[1]
            qs.avg_value = float(row[2]) if row[2] is not None else None

        elif q.type in (QuestionType.single_choice, QuestionType.multiple_choice):
            opts_result = await db.execute(select(QuestionOption).where(QuestionOption.question_id == q.id))
            opts = opts_result.scalars().all()
            for opt in opts:
                count_result = await db.execute(
                    select(func.count()).where(AnswerOption.option_id == opt.id)
                )
                qs.options.append(OptionStats(option_id=opt.id, option_text=opt.text, count=count_result.scalar_one()))

        question_stats.append(qs)

    return PollStats(poll_id=poll_id, total_responses=total_responses, questions=question_stats)
