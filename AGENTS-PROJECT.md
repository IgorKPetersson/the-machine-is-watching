# Repository-specific agent configuration

This file is intentionally project-specific. Fill it when installing the harness into a repository. Keep only statements that are true for that repository.

## Project identity

- Project: From Person of Interest to real AI-surveillance
- Primary purpose: An offline, presenter-led interactive lesson for AI/ML students.
- Primary languages/frameworks: HTML, CSS, and vanilla JavaScript; Node.js is used only for browser testing.


## Local development environment

Fill only what is actually true. The harness defaults are compatible with Windows 11 + VS Code + Git Bash, but individual projects may differ.

- Operating system: Windows in the current development environment; exact version not verified.
- Primary editor: VS Code in the current session.
- Primary shell: PowerShell in the current session; the app itself has no shell dependency.
- Path translation constraints: None known for the static app.
- Additional native Windows tools invoked from Bash: None known.

## Repository map

- Application/source code: `index.html`, `css/style.css`, `js/presentation.js`.
- Tests: `tests/presentation.test.mjs`.
- Generated files: `.qa-output/` screenshots and temporary `.chrome-test-*/` profiles, both ignored by Git.
- Deployment/infrastructure: Static files; no backend or hosting configuration.
- Important nested `AGENTS.md` / `AGENTS.override.md`: None found.

## Canonical commands

Use repository-native commands. Do not substitute guessed commands.

- Setup/install: None; open `index.html` locally.
- Build: None.
- Unit tests: Not configured.
- Integration tests: `node tests/presentation.test.mjs` (Node 24 and Chrome verified).
- Lint: Not configured.
- Format/check format: `node scripts/format-css.mjs` formats the CSS; no check-only command is configured.
- Type/static checks: `node --check js/presentation.js`.
- Coverage: Not configured.

## Engineering conventions

- Branch/commit convention: None defined.
- Ticket/issue tracker: None specified.
- PR requirements: None defined.
- Required CI checks: Not configured.
- Dependency policy: Runtime has no third-party dependencies.

## Project-specific boundaries

Record rules that materially constrain implementation, such as compatibility promises, security boundaries, performance budgets, regulated data, infrastructure limitations, or forbidden dependencies.

- All application-facing content and README documentation must be in natural English, with no Swedish text in the application. See `docs/REQUIREMENTS.md` (R-001).
- Keep the main presentation functional offline. Optional copyrighted media is never bundled by default.

## Source-of-truth policy

Use `docs/INDEX.md` to find durable project information. When documents conflict, prefer the most specific current decision/requirement and record the conflict rather than silently choosing a convenient interpretation.

## Security configuration

Fill these only with controls that truly exist. Use `not configured` / `not known` rather than inventing protections.

- Canonical security policy/invariants: `SECURITY.md` describes the static application's actual trust boundary and invariants.
- Secret scanning: Not configured.
- Dependency/SCA scanning: Not configured; the runtime has no third-party packages.
- SAST/static security scanning: Not configured.
- Container/IaC scanning: Not applicable.
- AI/agent adversarial tests: Not applicable to this static educational simulation.
- Sandbox/isolation boundary: Browser file origin; no backend.
- Network/egress policy for agents: The presentation code makes no network requests.
- Tool/MCP allowlist and authorization enforcement: Not applicable.
