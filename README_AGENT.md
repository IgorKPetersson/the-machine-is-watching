# Codex Engineering Harness

A reusable repository-level workflow and security harness for Codex-assisted software projects.

The harness is intentionally project-agnostic. It supplies stable engineering process, while each repository fills in its own goal, commands, architecture, risks, and domain knowledge.

## What it provides

- repository instructions through `AGENTS.md`
- reusable Codex engineering and security Skills under `.agents/skills/`
- lightweight source-of-truth documents under `docs/`
- task and session templates under `templates/`
- a place for local/domain reference material under `reference/`
- Windows 11 + VS Code + Git Bash portability defaults (`.gitattributes`, `.editorconfig`, `.vscode/settings.json`, and `docs/WINDOWS-GIT-BASH.md`)

## Skills

| Skill | Purpose |
| --- | --- |
| `grill-me` | Turn vague intent into shared understanding and a testable specification; challenge assumptions before implementation. |
| `ticket-lifecycle` | Drive a ticket from executable acceptance criteria through implementation, verification, commit/PR traceability, and update. |
| `done-gate` | Decide whether work is genuinely finished using tests, integration checks, diff review, documentation, and acceptance evidence. |
| `dual-pass` | Review important work first confirmationally, then adversarially, then conclude from both passes. |
| `session-handoff` | Preserve operational state for the next agent/session without claiming unperformed work. |
| `session-index` | Turn a long session into a searchable tree of decisions, evidence, rejected paths, and continuation points. |
| `security-policy` | Define enforceable trust boundaries and security invariants, including AI/agent boundaries. |
| `llm-threat-model` | Threat-model prompt injection, tool escalation, secret exfiltration, cross-tenant access, and model-to-action paths. |
| `prompt-injection-review` | Review LLM/agent changes specifically for jailbreak/injection and confused-deputy risks. |
| `adversarial-agent-tests` | Design tests that assume model compromise and prove deterministic security boundaries still hold. |

## Repository layout

```text
repo-root/
├── AGENTS.md
├── AGENTS-PROJECT.md
├── SECURITY.md
├── .gitattributes
├── .editorconfig
├── .vscode/
├── .agents/
│   └── skills/
├── docs/
├── reference/
└── templates/
```

`AGENTS.md` contains stable workflow rules. `AGENTS-PROJECT.md` contains repository-specific commands and conventions. `docs/` is the durable project state. `.agents/skills/` contains native repository Skills.

## First-time setup in a new project

If you received this harness through the versioned distribution, prefer running `install.sh <target-repository>` from the distribution wrapper. It records the installed version and managed-file hashes so future updates can preserve local edits safely.

For a manual install:

1. Copy the harness contents into the repository root.
2. Fill in `AGENTS-PROJECT.md` with the repository's real build/test/lint commands and conventions.
3. Fill in `docs/GOAL.md` and the first active section of `docs/PLAN.md`.
4. Delete example placeholders that do not apply; do not invent values merely to fill templates.
5. If using Windows 11 + Git Bash, review `docs/WINDOWS-GIT-BASH.md` and merge any pre-existing line-ending/editor policy instead of overwriting it.
6. Start Codex from the repository and ask it to summarize the active instructions and available Skills.

See `INSTALL.md` for safe integration into repositories that already contain documentation or an `AGENTS.md`.
