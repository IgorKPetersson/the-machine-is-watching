---
name: session-handoff
description: "Produce a precise end-of-session state record so another Codex session or agent can continue without re-deriving intent, repeating checks, or undoing deliberate choices."
---

# Session handoff

1. Inspect repository status, diff, and recent commits when available.
2. Identify the current objective and active plan phase.
3. Record only work actually completed, not intended work.
4. List meaningful files changed and why.
5. Record exact checks/commands actually run and their results.
6. Record failures, blocked verification, incomplete work, and known risks.
7. Record decisions or durable knowledge added during the session.
8. Choose one smallest next action.
9. Add "do not accidentally undo" notes for fragile deliberate choices.
10. Update `docs/HANDOFF.md`.
11. Never mark a test/check as passing unless it ran.

Keep the handoff compact enough to read at every session start.
