FROM python:3.12-slim

ENV HOME=/home/poll \
    PYTHONPATH=/home/poll \
    PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

RUN mkdir -p /home/poll \
  && groupadd -r poll \
  && useradd -r -g poll poll

WORKDIR /home/poll

COPY requirements.txt alembic.ini ./
COPY alembic alembic
COPY app app

RUN pip install --upgrade pip \
 && pip install -r requirements.txt \
 && chown -R poll:poll .

USER poll
