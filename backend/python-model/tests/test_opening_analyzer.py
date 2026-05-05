from app.opening_analyzer import analyze_openings

SAMPLE_GAMES = [
    {"white": "testuser", "black": "opponent1", "result": "white", "opening_name": "Sicilian Defense", "opening_eco": "B20"},
    {"white": "testuser", "black": "opponent2", "result": "white", "opening_name": "Sicilian Defense", "opening_eco": "B20"},
    {"white": "opponent3", "black": "testuser", "result": "white", "opening_name": "Sicilian Defense", "opening_eco": "B20"},  # loss for testuser
    {"white": "testuser", "black": "opponent4", "result": "black", "opening_name": "Caro-Kann Defense", "opening_eco": "B10"},
    {"white": "testuser", "black": "opponent5", "result": "black", "opening_name": "Caro-Kann Defense", "opening_eco": "B10"},
    {"white": "testuser", "black": "opponent6", "result": "black", "opening_name": "Caro-Kann Defense", "opening_eco": "B10"},
]


def test_weak_openings_detected():
    weak, strong = analyze_openings(SAMPLE_GAMES, "testuser")
    weak_names = [o.name for o in weak]
    assert "Caro-Kann Defense" in weak_names


def test_strong_openings_detected():
    weak, strong = analyze_openings(SAMPLE_GAMES, "testuser")
    strong_names = [o.name for o in strong]
    assert "Sicilian Defense" in strong_names


def test_min_games_filter():
    # Only 2 games — should not appear (threshold is 3)
    games = SAMPLE_GAMES[:2]
    weak, strong = analyze_openings(games, "testuser")
    assert len(weak) == 0
    assert len(strong) == 0
