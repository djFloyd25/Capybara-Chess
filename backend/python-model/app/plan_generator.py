"""
Turns the opening analysis + mistake statistics into a prioritised study plan.

Rules:
  1. Up to 3 weak opening modules (openings with >= 3 games, filtered upstream by opening_analyzer).
  2. If avg blunders/game > 0.8, add a Tactics module.
  3. If avg_centipawn_loss > 70, add an Endgame module.
  4. Cap at 5 modules — order by priority.
"""

from app.schemas import StudyModule, OpeningStat


def generate_plan(
    weak_openings: list[OpeningStat],
    total_blunders: int,
    total_mistakes: int,
    total_games: int,
    avg_centipawn_loss: float | None,
) -> list[StudyModule]:
    modules: list[StudyModule] = []
    priority = 1

    # Opening weakness modules
    for opening in weak_openings[:3]:  # max 3 opening modules
        win_pct = round(opening.win_rate * 100)
        modules.append(StudyModule(
            title=f"Fix Your {opening.name}",
            type="Weakness",
            description=(
                f"You've won only {win_pct}% of your {opening.games} games "
                f"with the {opening.name}. Let's fix that."
            ),
            lessons=[
                f"Why your current {opening.name} plan is failing",
                "Key move-order improvements",
                "Typical pawn structures",
                "Model games analysis",
            ],
            xp=40,
            priority=priority,
        ))
        priority += 1

    # Tactics module
    blunders_per_game = total_blunders / total_games if total_games > 0 else 0
    if blunders_per_game > 0.5:
        modules.append(StudyModule(
            title="Tactical Sharpness",
            type="Tactics",
            description=(
                f"You averaged {blunders_per_game:.1f} blunders per game. "
                "Tactical training will have the highest rating impact."
            ),
            lessons=[
                "Fork and double-attack patterns",
                "Pin and skewer drills",
                "Back-rank weakness awareness",
                "Mixed tactics — timed practice",
            ],
            xp=35,
            priority=priority,
        ))
        priority += 1

    # Endgame module
    if avg_centipawn_loss is not None and avg_centipawn_loss > 40:
        modules.append(StudyModule(
            title="Endgame Technique",
            type="Endgame",
            description=(
                f"Your average centipawn loss of {avg_centipawn_loss:.0f} "
                "suggests there is room to improve your technique."
            ),
            lessons=[
                "King and pawn vs king",
                "Rook endgame fundamentals",
                "Opposition and zugzwang",
                "Converting technical advantages",
            ],
            xp=30,
            priority=priority,
        ))
        priority += 1

    # Win rate module — fires when no other modules caught a weakness
    win_rate = (total_blunders + total_mistakes) / max(total_games, 1)
    if not modules or (len(modules) < 2 and total_games > 0):
        modules.append(StudyModule(
            title="Positional Play",
            type="Tactics",
            description="Sharpen your middlegame decision-making to convert your advantages more consistently.",
            lessons=[
                "Piece activity and coordination",
                "Pawn structure principles",
                "When to trade and when to keep pieces",
                "Transitioning into winning endgames",
            ],
            xp=30,
            priority=priority,
        ))

    return sorted(modules, key=lambda m: m.priority)[:5]
