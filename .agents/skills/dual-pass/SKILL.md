---
name: dual-pass
description: "Review an important proposal, design, implementation, experiment, or conclusion in two passes: first confirmationally for intended correctness, then adversarially for failure modes and counterevidence, then issue a balanced conclusion."
---

# Dual pass review

Use when confidence matters more than speed or when a single review perspective may miss defects.

## Pass 1 — Confirmational

Assume the intended approach could be correct.

1. State the intended outcome and constraints.
2. Identify what is coherent, supported, and correctly implemented.
3. Check the normal/expected path against requirements.
4. Identify the strongest evidence that the approach works.

Do not conclude yet.

## Pass 2 — Adversarial

Assume the approach may be wrong in a consequential way.

5. Search for counterexamples, edge cases, failure paths, stale assumptions, hidden coupling, security/reliability problems, and contradictory evidence. For AI/agent paths, assume untrusted content can manipulate model behavior and ask what deterministic boundary still prevents harm.
6. Ask what test or observation would disprove the current conclusion.
7. Check whether tests validate requirements or merely reproduce the implementation's assumptions.
8. Identify anything important not actually verified.

## Conclusion

9. Reconcile both passes. Do not discard adversarial findings because the normal path works.
10. Classify findings as `BLOCKER`, `MAJOR`, or `MINOR`.
11. Give the smallest action/evidence needed to resolve each blocker or major uncertainty.

```text
Confirmational findings:
Adversarial findings:
Blockers:
Major findings:
Minor findings:
Missing evidence:
Conclusion: ACCEPT | ACCEPT WITH CONDITIONS | REJECT
Required next actions:
```
