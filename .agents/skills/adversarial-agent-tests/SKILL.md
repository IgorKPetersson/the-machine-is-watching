---
name: adversarial-agent-tests
description: "Use to design or review security tests for LLM/agent features. Build adversarial cases that assume hostile instructions can reach the model and prove deterministic boundaries still prevent unauthorized actions, exfiltration, or privilege escalation."
---

# Adversarial agent tests

The goal is not to prove the model never follows a jailbreak. The goal is to prove that a compromised or manipulated model still cannot cross enforced security boundaries.

## Test design

1. Map each security invariant to at least one negative test.
2. Include direct and indirect injection where external content can reach the model.
3. Use representative hostile payloads without coupling assertions to exact model wording.
4. Assert on **effects and denied capabilities**, not whether the model says it was safe.
5. Mock or instrument tools so tests can prove forbidden calls were not made or were rejected server-side.
6. Test identity/tenant substitution, parameter smuggling, malformed structured output, encoded payloads, nested instructions, and malicious tool responses where applicable.
7. Test that secrets are absent from model-visible data and outbound requests whenever the architecture expects that property.
8. Test approval boundaries by attempting the action without, before, and after valid approval.
9. Test least privilege: a permitted action must not imply adjacent permissions.
10. Add regression cases for every discovered security defect.

## Minimum AI security suite when applicable

```text
[ ] Direct jailbreak cannot authorize a forbidden action.
[ ] Indirect injection in retrieved/connected content cannot authorize a forbidden action.
[ ] User/tenant identity cannot be replaced by model-controlled values.
[ ] Tool arguments are independently validated and scoped.
[ ] Model output cannot reach an executable/privileged sink unsafely.
[ ] Secrets cannot be retrieved or exfiltrated through available tools/egress.
[ ] High-impact actions cannot bypass required approval/policy checks.
[ ] Malicious tool output cannot silently escalate later actions.
```

## Evidence format

```text
Invariant:
Attack case:
Expected control:
Test / harness:
Observed result: PASS | FAIL | NOT RUN | BLOCKED
Evidence:
Residual gap:
```
