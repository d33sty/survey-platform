from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.deps import get_current_admin, get_current_user
from app.models.poll import Poll, Question, QuestionOption
from app.schemas.poll import PollCreate, PollListItem, PollOut, PollUpdate

router = APIRouter(prefix="/polls", tags=["polls"])

_poll_load = [
    selectinload(Poll.questions).selectinload(Question.options)
]


@router.post("", response_model=PollOut, status_code=status.HTTP_201_CREATED)
async def create_poll(
    payload: PollCreate,
    db: AsyncSession = Depends(get_db),
    _: str = Depends(get_current_admin),
):
    poll = Poll(title=payload.title, description=payload.description)
    for q_in in payload.questions:
        question = Question(
            text=q_in.text,
            type=q_in.type,
            order=q_in.order,
            required=q_in.required,
        )
        for opt_in in q_in.options:
            question.options.append(QuestionOption(text=opt_in.text, order=opt_in.order))
        poll.questions.append(question)

    db.add(poll)
    await db.commit()

    result = await db.execute(
        select(Poll).where(Poll.id == poll.id).options(*_poll_load)
    )
    return result.scalar_one()


@router.get("", response_model=list[PollListItem])
async def list_polls(
    db: AsyncSession = Depends(get_db),
    _: str = Depends(get_current_admin),
):
    result = await db.execute(select(Poll).order_by(Poll.created_at.desc()))
    return result.scalars().all()


# Authorized users — list active polls; must be declared before /{poll_id}
@router.get("/active", response_model=list[PollListItem])
async def list_active_polls(
    db: AsyncSession = Depends(get_db),
    _: str = Depends(get_current_user),
):
    result = await db.execute(
        select(Poll).where(Poll.is_active == True).order_by(Poll.created_at.desc())  # noqa: E712
    )
    return result.scalars().all()


@router.get("/{poll_id}", response_model=PollOut)
async def get_poll(
    poll_id: int,
    db: AsyncSession = Depends(get_db),
    _: str = Depends(get_current_admin),
):
    result = await db.execute(
        select(Poll).where(Poll.id == poll_id).options(*_poll_load)
    )
    poll = result.scalar_one_or_none()
    if not poll:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Poll not found")
    return poll


@router.patch("/{poll_id}", response_model=PollOut)
async def update_poll(
    poll_id: int,
    payload: PollUpdate,
    db: AsyncSession = Depends(get_db),
    _: str = Depends(get_current_admin),
):
    result = await db.execute(
        select(Poll).where(Poll.id == poll_id).options(*_poll_load)
    )
    poll = result.scalar_one_or_none()
    if not poll:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Poll not found")

    for field, value in payload.model_dump(exclude_none=True).items():
        setattr(poll, field, value)

    await db.commit()

    result = await db.execute(
        select(Poll).where(Poll.id == poll.id).options(*_poll_load)
    )
    return result.scalar_one()


@router.delete("/{poll_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_poll(
    poll_id: int,
    db: AsyncSession = Depends(get_db),
    _: str = Depends(get_current_admin),
):
    result = await db.execute(select(Poll).where(Poll.id == poll_id))
    poll = result.scalar_one_or_none()
    if not poll:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Poll not found")
    await db.delete(poll)
    await db.commit()


# Authorized users — view a single active poll
@router.get("/{poll_id}/public", response_model=PollOut)
async def get_poll_public(
    poll_id: int,
    db: AsyncSession = Depends(get_db),
    _: str = Depends(get_current_user),
):
    result = await db.execute(
        select(Poll).where(Poll.id == poll_id, Poll.is_active == True).options(*_poll_load)  # noqa: E712
    )
    poll = result.scalar_one_or_none()
    if not poll:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Poll not found or inactive")
    return poll
