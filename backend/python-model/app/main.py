from fastapi import FastAPI, HTTPException
from app.schemas import GenerateRequest, StudyPlanResponse, Stats
from app.game_parser import parse_games
from app.opening_analyzer import analyze_openings, _player_color
from app.mistake_detector import analyze_game, STOCKFISH_AVAILABLE
from app.plan_generator import generate_plan

app = FastAPI(title="Capybara Chess — Study Plan Model")


@app.get("/health")
def health():
    return {"status": "ok", "stockfish": STOCKFISH_AVAILABLE}


@app.post("/generate", response_model=StudyPlanResponse)
def generate(request: GenerateRequest):
    if not request.games:
        raise HTTPException(status_code=400, detail="No games provided")

    platform = request.platform
    player_username = request.player_username

    # Step 1 — normalise raw game dicts
    parsed = parse_games(request.games, platform, player_username)

    if not parsed:
        raise HTTPException(status_code=422, detail="Could not parse any games")

    # Step 2 — opening analysis (all games for better statistics)
    weak_openings, strong_openings = analyze_openings(parsed, player_username)

    # Step 3 — mistake analysis (most recent 50 games only — Stockfish is the bottleneck)
    total_blunders = total_mistakes = total_inaccuracies = 0
    cp_losses = []

    for game in parsed[:50]:
        color = _player_color(game, player_username) or "white"
        result = analyze_game(game.get("pgn", ""), player_username, color)
        total_blunders    += result["blunders"]
        total_mistakes    += result["mistakes"]
        total_inaccuracies += result["inaccuracies"]
        if result["avg_centipawn_loss"] is not None:
            cp_losses.append(result["avg_centipawn_loss"])

    avg_cp_loss = round(sum(cp_losses) / len(cp_losses), 1) if cp_losses else None
    total_games = len(parsed)

    accuracies = [g["player_accuracy"] for g in parsed if g.get("player_accuracy") is not None]
    avg_accuracy = round(sum(accuracies) / len(accuracies), 1) if accuracies else None

    wins = sum(
        1 for g in parsed
        if g["result"] == _player_color(g, player_username)
    )
    win_rate = round(wins / total_games, 3) if total_games > 0 else 0.0

    # Step 4 — generate study modules
    modules = generate_plan(weak_openings, total_blunders, total_mistakes, total_games, avg_cp_loss)

    return StudyPlanResponse(
        modules=modules,
        weak_openings=weak_openings[:5],
        strong_openings=strong_openings[:5],
        stats=Stats(
            total_games=total_games,
            win_rate=win_rate,
            avg_accuracy=avg_accuracy,
            avg_centipawn_loss=avg_cp_loss,
        ),
    )


