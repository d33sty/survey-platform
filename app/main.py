from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import auth, polls, responses, stats

app = FastAPI(title="Survey API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(polls.router)
app.include_router(responses.router)
app.include_router(stats.router)


@app.get("/health")
async def health():
    return {"status": "ok"}
