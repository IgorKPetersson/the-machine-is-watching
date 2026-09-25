---
name: grill-me
description: "Turn vague ideas, brainstorms, or underspecified work into shared understanding and a testable specification by challenging assumptions, scope, edge cases, evidence, and acceptance criteria before implementation."
---

# Grill me

Use when intent is still fuzzy, requirements are ambiguous, or a proposed implementation is being accepted too quickly.

## Workflow

1. Restate the requested outcome in concrete terms without adding new requirements.
2. Separate known facts, assumptions, preferences, and unresolved questions.
3. Identify the decisions that materially affect scope, architecture, interfaces, safety, cost, or verification.
4. Challenge the five most consequential assumptions:
   - What evidence supports this?
   - What would falsify it?
   - What alternative interpretation exists?
   - What edge/failure case has not been specified?
5. Define explicit in-scope and out-of-scope boundaries.
6. Convert success language into observable acceptance criteria.
7. Assign a verification method to each important acceptance criterion before implementation.
8. Identify dependencies and unknowns that must be resolved versus those safe to defer.
9. Produce the smallest specification that creates shared understanding; do not inflate scope.
10. If unresolved ambiguity would materially change the solution, surface it instead of silently guessing.

## Output

```text
Outcome:
Known facts:
Assumptions:
In scope:
Out of scope:
Acceptance criteria:
- criterion — planned verification
Open decisions/questions:
Risks/edge cases:
Ready for implementation: YES | NO
Reason:
```
