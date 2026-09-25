# Handoff

## Current objective

The presentation is published. The next optional project phase is a presenter rehearsal on the teaching hardware.

## Completed this session

- Built 12 interactive scenes and a closing scene with English-only copy, offline controls, optional media fallbacks, diagrams, quiz, and fictional decision exercise.
- Added a dependency-free headless Chrome integration test and reviewed screenshots at 1920×1080 and 1366×768.
- Filled the project goal, requirements, design, testing, security, and local development instructions.
- Initialized local Git on `main` and configured `origin` as `https://github.com/IgorKPetersson/the-machine-is-watching.git`. The remote was empty when checked.
- Committed and pushed the initial release to `origin/main`; GitHub reported `main` and `HEAD` at the published commit.

## Files changed

- `index.html`, `css/style.css`, `js/presentation.js` — complete presentation.
- `README.md`, `assets/images/`, `assets/video/` — run/edit instructions and media slots.
- `tests/presentation.test.mjs`, `scripts/format-css.mjs`, `.gitignore` — verification, formatting, and generated-file exclusions.
- `AGENTS-PROJECT.md`, `SECURITY.md`, `docs/GOAL.md`, `docs/PLAN.md`, `docs/REQUIREMENTS.md`, `docs/DESIGN.md`, `docs/TESTING.md` — project-specific durable state.
- Existing engineering harness files are staged for the first repository commit.

## Verification actually run

| Command/check | Result | Notes |
| --- | --- | --- |
| `node tests/presentation.test.mjs` | PASS | Local Chrome; 13 scenes, controls, interactions, media fallbacks, reduced motion, no external page requests, and both target viewports. |
| `node tests/presentation.test.mjs --screenshots` | PASS | Final implementation: all 13 laptop-size captures and selected projector-size captures reviewed. The 4× CPU-throttled 1366×768 run recorded 16.7 ms median and p95 frame intervals. |
| `node --check js/presentation.js` | PASS | JavaScript syntax. |
| `node --check tests/presentation.test.mjs` | PASS | Test script syntax. |
| `git diff --cached --check` | PASS | No whitespace errors in the initial published commit. |
| Local video playback with supplied MP4 | NOT RUN | No licensed media was supplied. |
| Physical laptop/projector frame-rate measurement | NOT RUN | Headless browser layout and interactions passed; physical performance remains unmeasured. |

## Decisions / knowledge added

- The lesson is a static simulation; no real surveillance, AI model, backend, credentials, or network API is present.
- Optional film/image files are omitted from the repository and fail gracefully when absent.
- The risk score is intentionally fictional, and PRISM is not equated with the separate bulk telephone metadata program.

## Open problems / risks

- Licensed media playback and real laptop/projector motion should be checked by the presenter if media is added.
- The physical teaching hardware has not been used for a rehearsal.

## Next smallest action

Open `index.html` on the teaching laptop and run a full rehearsal at the projector's native resolution.

## Do not accidentally undo

- Keep all user-facing copy and README documentation in English.
- Keep optional media absent by default and preserve the no-network runtime behavior.
