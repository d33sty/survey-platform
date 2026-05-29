from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.deps import get_current_admin, get_current_user
from app.models.poll import Answer, AnswerOption, Poll, PollResponse, Question, QuestionOption, QuestionType
from app.schemas.response import PollResponseListItem, PollResponseOut, SubmitResponseIn

router = APIRouter(tags=["responses"])

_response_load = [
    selectinload(PollResponse.answers).selectinload(Answer.selected_options)
]


@router.post("/polls/{poll_id}/responses", response_model=PollResponseOut, status_code=status.HTTP_201_CREATED)
async def submit_response(
    poll_id: int,
    payload: SubmitResponseIn,
    db: AsyncSession = Depends(get_db),
    _: str = Depends(get_current_user),
):
    result = await db.execute(
        select(Poll).where(Poll.id == poll_id, Poll.is_active == True)  # noqa: E712
        .options(selectinload(Poll.questions).selectinload(Question.options))
    )
    poll = result.scalar_one_or_none()
    if not poll:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Poll not found or inactive")

    question_map = {q.id: q for q in poll.questions}

    poll_response = PollResponse(poll_id=poll_id)
    db.add(poll_response)
    await db.flush()

    for ans_in in payload.answers:
        question = question_map.get(ans_in.question_id)
        if not question:
            raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                                detail=f"Question {ans_in.question_id} not in this poll")

        answer = Answer(poll_response_id=poll_response.id, question_id=question.id)

        if question.type in (QuestionType.text,):
            answer.text_value = ans_in.text_value
        elif question.type in (QuestionType.number, QuestionType.rating):
            answer.number_value = ans_in.number_value
        elif question.type in (QuestionType.single_choice, QuestionType.multiple_choice):
            valid_option_ids = {opt.id for opt in question.options}
            for opt_id in ans_in.selected_option_ids:
                if opt_id not in valid_option_ids:
                    raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                                        detail=f"Option {opt_id} does not belong to question {question.id}")
            db.add(answer)
            await db.flush()
            for opt_id in ans_in.selected_option_ids:
                db.add(AnswerOption(answer_id=answer.id, option_id=opt_id))
            continue

        db.add(answer)

    await db.commit()

    result = await db.execute(
        select(PollResponse).where(PollResponse.id == poll_response.id).options(*_response_load)
    )
    return result.scalar_one()


@router.get("/polls/{poll_id}/responses", response_model=list[PollResponseListItem])
async def list_responses(
    poll_id: int,
    db: AsyncSession = Depends(get_db),
    _: str = Depends(get_current_admin),
):
    result = await db.execute(select(Poll).where(Poll.id == poll_id))
    poll = result.scalar_one_or_none()
    if not poll:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Poll not found")
    result = await db.execute(
        select(PollResponse).where(PollResponse.poll_id == poll.id).order_by(PollResponse.submitted_at.desc())
    )
    return result.scalars().all()


@router.get("/polls/{poll_id}/responses/{response_id}", response_model=PollResponseOut)
async def get_response(
    poll_id: int,
    response_id: int,
    db: AsyncSession = Depends(get_db),
    _: str = Depends(get_current_admin),
):
    result = await db.execute(
        select(PollResponse)
        .where(PollResponse.id == response_id, PollResponse.poll_id == poll_id)
        .options(*_response_load)
    )
    response = result.scalar_one_or_none()
    if not response:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Response not found")
    return response
