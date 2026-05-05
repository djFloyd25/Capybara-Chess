from app.game_parser import parse_games

LICHESS_GAME = {
    "id": "abc123",
    "pgn": '[Event "Rated Blitz game"]\n1. e4 e5 2. Nf3',
    "players": {
        "white": {"user": {"name": "testuser"}},
        "black": {"user": {"name": "opponent"}},
    },
    "winner": "white",
    "opening": {"name": "King's Pawn Game", "eco": "C20"},
}

CHESSCOM_GAME = {
    "url": "https://www.chess.com/game/live/12345",
    "pgn": '[ECO "B20"]\n[Opening "Sicilian Defense"]\n1. e4 c5',
    "white": {"username": "testuser", "result": "win"},
    "black": {"username": "opponent", "result": "checkmated"},
}


def test_parse_lichess():
    parsed = parse_games([LICHESS_GAME], "lichess", "testuser")
    assert len(parsed) == 1
    g = parsed[0]
    assert g["white"] == "testuser"
    assert g["result"] == "white"
    assert g["opening_eco"] == "C20"


def test_parse_chesscom():
    parsed = parse_games([CHESSCOM_GAME], "chess.com", "testuser")
    assert len(parsed) == 1
    g = parsed[0]
    assert g["white"] == "testuser"
    assert g["result"] == "white"
    assert g["opening_eco"] == "B20"
    assert g["opening_name"] == "Sicilian Defense"
