from pydantic import BaseModel
from typing import Any


class GenerateRequest(BaseModel):
    games: list[dict[str, Any]]
    platform: str
    player_username: str


class StudyModule(BaseModel):
    title: str
    type: str        # "Weakness" | "Tactics" | "Endgame" | "Opening"
    description: str
    lessons: list[str]
    xp: int
    priority: int    # 1 = highest


class OpeningStat(BaseModel):
    name: str
    eco: str         # ECO code e.g. "B20"
    games: int
    wins: int
    losses: int
    draws: int
    win_rate: float


class Stats(BaseModel):
    total_games: int
    win_rate: float
    avg_accuracy: float | None   # None if Stockfish not available
    avg_centipawn_loss: float | None


class StudyPlanResponse(BaseModel):
    modules: list[StudyModule]
    weak_openings: list[OpeningStat]
    strong_openings: list[OpeningStat]
    stats: Stats
