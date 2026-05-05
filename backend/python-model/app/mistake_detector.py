"""
Uses Stockfish to find blunders, mistakes, and inaccuracies in each game.

Centipawn loss thresholds (from the player's perspective):
  Blunder     > 300 cp
  Mistake     100–300 cp
  Inaccuracy   50–100 cp

Requires Stockfish installed locally. Set STOCKFISH_PATH in config.py.
Falls back gracefully if Stockfish is unavailable.
"""

import chess
import chess.pgn
import io
import threading
from app.config import STOCKFISH_PATH

_sf = None
_sf_lock = threading.Lock()
STOCKFISH_AVAILABLE = False

try:
    from stockfish import Stockfish
    import os
    if os.path.isfile(STOCKFISH_PATH):
        _sf = Stockfish(path=STOCKFISH_PATH)
        _sf.set_depth(10)
        STOCKFISH_AVAILABLE = True
except Exception:
    pass


BLUNDER_THRESHOLD   = 300
MISTAKE_THRESHOLD   = 100
INACCURACY_THRESHOLD = 50


def analyze_game(pgn_str: str, player_username: str, player_color: str) -> dict:
    """
    Returns a dict with:
      blunders, mistakes, inaccuracies: counts
      avg_centipawn_loss: float
      critical_positions: list of FEN strings where blunders occurred
    """
    if not STOCKFISH_AVAILABLE or not pgn_str:
        return _empty_result()

    try:
        game = chess.pgn.read_game(io.StringIO(pgn_str))
        if game is None:
            return _empty_result()

        board = game.board()
        is_white = player_color == "white"

        blunders, mistakes, inaccuracies = 0, 0, 0
        total_cp_loss = 0
        move_count = 0
        critical_positions = []

        prev_eval = None

        for node in game.mainline():
            move = node.move
            fen_before = board.fen()

            # Reuse the previous iteration's eval_after — it's the same position
            eval_before = prev_eval if prev_eval is not None else _evaluate(fen_before)

            board.push(move)
            fen_after = board.fen()

            eval_after = _evaluate(fen_after)
            prev_eval = eval_after

            # Flip sign for black: positive = good for the player who just moved
            if is_white and board.turn == chess.BLACK:  # white just moved
                cp_loss = max(0, eval_before - eval_after) if eval_before is not None and eval_after is not None else 0
            elif not is_white and board.turn == chess.WHITE:  # black just moved
                cp_loss = max(0, eval_after - eval_before) if eval_before is not None and eval_after is not None else 0
            else:
                continue

            total_cp_loss += cp_loss
            move_count += 1

            if cp_loss >= BLUNDER_THRESHOLD:
                blunders += 1
                critical_positions.append(fen_before)
            elif cp_loss >= MISTAKE_THRESHOLD:
                mistakes += 1
            elif cp_loss >= INACCURACY_THRESHOLD:
                inaccuracies += 1

        avg_cp_loss = round(total_cp_loss / move_count, 1) if move_count > 0 else 0.0

        return {
            "blunders": blunders,
            "mistakes": mistakes,
            "inaccuracies": inaccuracies,
            "avg_centipawn_loss": avg_cp_loss,
            "critical_positions": critical_positions[:3],  # top 3 worst positions
        }
    except Exception:
        return _empty_result()


def _evaluate(fen: str) -> int | None:
    with _sf_lock:
        _sf.set_fen_position(fen)
        return _get_centipawns(_sf.get_evaluation())


def _get_centipawns(evaluation: dict) -> int | None:
    if evaluation.get("type") == "cp":
        return evaluation.get("value")
    return None  # mate score — skip for cp loss calculation


def _empty_result() -> dict:
    return {
        "blunders": 0,
        "mistakes": 0,
        "inaccuracies": 0,
        "avg_centipawn_loss": None,
        "critical_positions": [],
    }
