"""
Analyses opening performance across a player's games.

For each opening the player has played, tracks wins/losses/draws
and computes a win rate. Returns ranked lists of strong and weak openings.
"""

from collections import defaultdict
from app.schemas import OpeningStat


def analyze_openings(games: list[dict], player_username: str) -> tuple[list[OpeningStat], list[OpeningStat]]:
    """
    Returns (weak_openings, strong_openings) sorted by number of games played.
    An opening is "weak" if win_rate < 0.45 and has >= 3 games.
    An opening is "strong" if win_rate >= 0.55 and has >= 3 games.
    """
    stats: dict[str, dict] = defaultdict(lambda: {"wins": 0, "losses": 0, "draws": 0, "eco": ""})

    for game in games:
        opening = game.get("opening_name")
        if not opening:
            continue

        eco = game.get("opening_eco", "") or ""
        stats[opening]["eco"] = eco

        player_color = _player_color(game, player_username)
        if player_color is None:
            continue

        result = game.get("result")
        if result == player_color:
            stats[opening]["wins"] += 1
        elif result == "draw":
            stats[opening]["draws"] += 1
        else:
            stats[opening]["losses"] += 1

    opening_stats = []
    for name, s in stats.items():
        total = s["wins"] + s["losses"] + s["draws"]
        if total < 3:
            continue
        win_rate = round(s["wins"] / total, 3)
        opening_stats.append(OpeningStat(
            name=name,
            eco=s["eco"],
            games=total,
            wins=s["wins"],
            losses=s["losses"],
            draws=s["draws"],
            win_rate=win_rate,
        ))

    weak   = sorted([o for o in opening_stats if o.win_rate < 0.45], key=lambda o: o.games, reverse=True)
    strong = sorted([o for o in opening_stats if o.win_rate >= 0.55], key=lambda o: o.games, reverse=True)
    return weak, strong


def _player_color(game: dict, username: str) -> str | None:
    if game.get("white", "").lower() == username.lower():
        return "white"
    if game.get("black", "").lower() == username.lower():
        return "black"
    return None
