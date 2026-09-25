---
name: ticket-lifecycle
description: "Drive an engineering ticket or task from executable acceptance criteria through scoped implementation, verification, commit/PR traceability, and an evidence-based ticket update."
---

# Ticket lifecycle

## Workflow

### 1. Make the task executable

1. Read the ticket/task plus relevant requirements, decisions, design, risks, and repository rules.
2. Restate one observable objective.
3. Make in-scope/out-of-scope boundaries explicit.
4. Convert vague completion language into testable acceptance criteria.
5. Name the verification method for each required criterion before editing code.
6. Resolve material ambiguity before implementation; do not invent policy or intent.
7. Classify whether the task is security-sensitive using `AGENTS.md`. If yes, identify applicable `SEC-*` invariants and required security skills/tests before editing code.

### 2. Implement the smallest coherent change

8. Inspect the existing implementation and tests first.
9. Make the smallest coherent change that can satisfy the criteria.
10. Avoid unrelated refactors/features unless necessary for correctness.
11. Add or update tests alongside behavior changes when appropriate.
12. Update design/decision/knowledge/security documents if the change materially changes those truths.

### 3. Verify

13. Run targeted checks first and broader checks when required by the repository workflow.
14. For every acceptance criterion record `PASS`, `FAIL`, `NOT RUN`, or `BLOCKED` with evidence.
15. Run integration/contract checks when crossing meaningful boundaries.
16. Inspect `git diff`/status if available for accidental changes, secrets, debug artifacts, and scope creep.
17. Apply `dual-pass` or equivalent adversarial review to non-trivial changes.
18. For security-sensitive AI/agent changes, apply `prompt-injection-review` and run/record applicable `adversarial-agent-tests`.
19. Apply `done-gate` before declaring the ticket complete.

### 4. Preserve traceability

20. Preserve a real ticket ID in commits/PRs/updates when repository convention requires it.
21. Do not invent ticket IDs, branch names, tracker states, or commit conventions.
22. PR/ticket updates should state why, what changed, verification actually run, known risks, and follow-up.
23. Do not commit, push, open/merge a PR, or modify an external tracker unless authorized and technically available.

## Result

```text
Ticket/task:
Objective:
Acceptance criteria:
- [PASS|FAIL|NOT RUN|BLOCKED] criterion — evidence
Implementation summary:
Checks actually run:
Security-sensitive: YES | NO
Security invariants / review evidence:
Diff/review findings:
Docs/decisions updated:
Commit/PR/ticket linkage:
Remaining risks:
Verdict: DONE | NOT DONE
```
