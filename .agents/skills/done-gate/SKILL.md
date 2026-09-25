---
name: done-gate
description: "Use when an agent thinks implementation is finished. Require acceptance evidence, tests, integration checks, diff review, documentation consistency, and honest NOT RUN/BLOCKED states before declaring DONE."
---

# Done gate

Completion is an evidence decision, not a feeling.

## Gate

1. Re-read the task objective and every required acceptance criterion.
2. For each criterion attach concrete evidence and classify it `PASS`, `FAIL`, `NOT RUN`, or `BLOCKED`.
3. Confirm required repository checks actually ran: tests, lint, type/static checks, build, coverage, or other configured gates.
4. Run integration/contract/end-to-end checks when the change crosses a meaningful boundary or when required by the project.
5. Review the final diff for:
   - accidental/unrelated edits,
   - regressions and unhandled failure paths,
   - debug/generated artifacts or secrets,
   - misleading tests that merely mirror implementation,
   - backwards-compatibility or migration impact.
6. Confirm documentation, decisions, requirements, and operational instructions still match reality where the change affects them.
7. If the change is security-sensitive, confirm:
   - applicable `SEC-*` invariants have evidence;
   - authorization/identity/tool boundaries are enforced outside model judgment;
   - prompt-injection/adversarial checks ran when applicable;
   - secrets, broad credentials, unsafe sinks, and unintended egress were reviewed;
   - unresolved security findings are not being hidden as follow-up.
8. Confirm no required follow-up is being hidden inside "done".
9. Never convert `NOT RUN` or `BLOCKED` into `PASS` based on confidence or inference.

## Verdict

`DONE` only when all required acceptance criteria pass and all mandatory project checks have run successfully.

```text
Gate: DONE | NOT DONE
Acceptance evidence:
Required checks:
Integration status:
Diff review findings:
Documentation/decision consistency:
Security status / evidence:
Known limitations:
Blocking items:
```
