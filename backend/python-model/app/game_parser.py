"""
Parses the raw game JSON (from Lichess or Chess.com) into a normalised list
of game dicts that the rest of the pipeline can work with uniformly.

Lichess game keys:  id, pgn, players.white/black.user.name, winner, opening.name/eco
Chess.com game keys: url, pgn, white.username, black.username, white.result, opening (may be absent)

Output shape per game:
{
    "id": str,
    "pgn": str,
    "white": str,           # username
    "black": str,
    "result": "white" | "black" | "draw",
    "opening_name": str | None,
    "opening_eco": str | None,
    "platform": "lichess" | "chess.com",
    "player_accuracy": float | None,  # None if not available or game not analyzed
}
"""

import re


def parse_games(raw_games: list[dict], platform: str, player_username: str) -> list[dict]:
    parsed = []
    for g in raw_games:
        try:
            parsed.append(_parse_one(g, platform, player_username))
        except Exception:
            continue  # skip malformed games
    return parsed


def _parse_one(g: dict, platform: str, player_username: str) -> dict:
    if platform == "lichess":
        return _parse_lichess(g, player_username)
    return _parse_chesscom(g, player_username)


def _parse_lichess(g: dict, player_username: str) -> dict:
    players = g.get("players", {})
    white = players.get("white", {}).get("user", {}).get("name", "")
    black = players.get("black", {}).get("user", {}).get("name", "")
    winner = g.get("winner")  # "white" | "black" | None (draw)
    opening = g.get("opening", {})
    player_color = "white" if white.lower() == player_username.lower() else "black"
    player_accuracy = players.get(player_color, {}).get("accuracy")
    return {
        "id": g.get("id", ""),
        "pgn": g.get("pgn", ""),
        "white": white,
        "black": black,
        "result": winner if winner else "draw",
        "opening_name": opening.get("name"),
        "opening_eco": opening.get("eco"),
        "platform": "lichess",
        "player_accuracy": float(player_accuracy) if player_accuracy is not None else None,
    }


def _parse_chesscom(g: dict, player_username: str) -> dict:
    white_info = g.get("white", {})
    black_info = g.get("black", {})
    white = white_info.get("username", "")
    black = black_info.get("username", "")

    # Chess.com result is per-player: "win", "checkmated", "resigned", "draw", etc.
    white_result = white_info.get("result", "")
    if white_result == "win":
        result = "white"
    elif black_info.get("result", "") == "win":
        result = "black"
    else:
        result = "draw"

    # Opening is sometimes embedded in the PGN headers
    pgn = g.get("pgn", "")
    eco = _extract_pgn_header(pgn, "ECO")
    opening_field = g.get("opening")
    opening_name = (
        _extract_pgn_header(pgn, "Opening")
        or (opening_field.get("name") if isinstance(opening_field, dict) else None)
        or _opening_from_eco_url(pgn)
    )

    player_color = "white" if white.lower() == player_username.lower() else "black"
    player_accuracy = g.get("accuracies", {}).get(player_color)

    return {
        "id": g.get("url", "").split("/")[-1],
        "pgn": pgn,
        "white": white,
        "black": black,
        "result": result,
        "opening_name": opening_name,
        "opening_eco": eco,
        "platform": "chess.com",
        "player_accuracy": float(player_accuracy) if player_accuracy is not None else None,
    }


def _extract_pgn_header(pgn: str, key: str) -> str | None:
    match = re.search(rf'\[{key} "([^"]+)"\]', pgn)
    return match.group(1) if match else None


def _opening_from_eco_url(pgn: str) -> str | None:
    url = _extract_pgn_header(pgn, "ECOUrl")
    if not url:
        return None
    slug = url.rstrip("/").split("/")[-1]
    return slug.replace("-", " ") if slug else None
