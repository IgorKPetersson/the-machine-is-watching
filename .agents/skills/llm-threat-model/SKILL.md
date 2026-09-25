---
name: llm-threat-model
description: "Use before implementing or approving security-sensitive AI/agent changes involving prompts, RAG, tools/MCP, model-generated actions, external content, secrets, auth, tenant boundaries, or autonomous workflows. Model abuse paths and define controls/tests before relying on the design."
---

# LLM / agent threat model

Use this for systems where model-visible content or model-selected actions can cross a meaningful trust boundary.

## Threat model

1. State the feature and the maximum authority available to the model/agent.
2. Enumerate every source of model-visible content and classify who can influence it.
3. Enumerate every action/tool the model can request and the privileges/data each action can reach.
4. Trace security-sensitive flows from untrusted input to privileged sink.
5. Test at least these abuse classes when applicable:
   - direct prompt injection / jailbreak;
   - indirect prompt injection from retrieved or connected content;
   - instruction/data confusion;
   - tool or MCP privilege escalation;
   - secret/context exfiltration;
   - cross-user or cross-tenant data access;
   - model-generated shell/SQL/template/code injection;
   - unsafe URL fetching / SSRF-style reachability;
   - path traversal or unsafe file access;
   - confused-deputy actions using application credentials;
   - approval/confirmation bypass;
   - persistent injection through stored memory, documents, repository text, or logs;
   - malicious tool output influencing subsequent privileged actions.
6. For every credible abuse path, identify a deterministic control outside the model when possible.
7. Define one or more tests that would fail if the control disappeared.
8. Record residual risk and assumptions explicitly.

## Severity guidance

Classify a path as `BLOCKER` when exploitation could cause unauthorized data disclosure, privilege gain, cross-tenant access, secret exposure, arbitrary execution, destructive action, or silent weakening of security policy without an independent control.

## Output

```text
Feature / authority:
Untrusted input sources:
Privileged sinks/tools:
Abuse paths:
- path — impact — control — verification
Security invariants:
Residual risks:
Conclusion: ACCEPT | ACCEPT WITH CONDITIONS | REJECT
```
