import os
import shutil

# Auto-detect the Stockfish binary using PATH, with an optional env var override.
# Install: brew install stockfish  (macOS)  |  apt install stockfish  (Linux)
STOCKFISH_PATH = os.getenv("STOCKFISH_PATH") or shutil.which("stockfish") or "/usr/games/stockfish"

# Spring Boot backend — used if the model ever needs to push results back directly
SPRING_BASE_URL = os.getenv("SPRING_BASE_URL", "http://localhost:8080/api/v1")
