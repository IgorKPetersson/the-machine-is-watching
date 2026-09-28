# Testing and verification

## Canonical commands

The authoritative runnable commands belong in `AGENTS-PROJECT.md`. This file explains what each layer proves and any environment requirements.

## Verification layers

| Layer | What it proves | Environment / prerequisites |
| --- | --- | --- |
| Unit | No isolated unit suite; the small controller is checked through browser interactions. | Not configured |
| Integration | Scene reveals, keyboard navigation, diagram activation, resets, quiz, fictional decision, and missing media work from `file://`. | `node tests/presentation.test.mjs`; Node 24 and Chrome verified |
| End-to-end / acceptance | All 13 scenes fit 1920×1080 and 1366×768; screenshots can be captured for visual review. | `node tests/presentation.test.mjs --screenshots`; Chrome |
| Static / lint / type | JavaScript parses. | `node --check js/presentation.js` |
| Security / adversarial | The application has no model calls, credentials, privileged actions, or external content ingestion. | Code inspection; AI-agent adversarial tests are not applicable |

## Coverage

No code-coverage threshold is configured.

## Known verification gaps

- The three locally supplied MP4 clips were tested in headless Chrome with play-after-click, pause, and volume controls. Playback on the physical teaching laptop/projector has not been measured.
- A 4× CPU-throttled headless Chrome run at 1366×768 measured a 16.7 ms median and 16.8 ms 95th-percentile animation frame interval on the media-integrated implementation. Physical projector performance remains unmeasured.
- Media files are local, ignored by Git, and untracked. Their distribution rights have not been verified; the published repository can still run with media absent.

## Results for the current implementation

- `node --check js/presentation.js`: PASS after the interaction-density implementation.
- `node --check tests/presentation.test.mjs`: PASS after the interaction-state coverage update.
- `node tests/presentation.test.mjs`: PASS with supplied local media. The test covers all 13 scenes, scene 3 signal and reset states, scene 6 prerequisite unlocks, direct and guided scene 8 relationships, scene 9 object cards, all six scene 10 agent stages, the three scene 11 governance layers, scene 12 evidence links and class choice, optional media, reduced motion, no external requests, and both required viewports.
- `node tests/presentation.test.mjs --screenshots`: PASS. Captures every scene at 1366×768, selected scenes at 1920×1080, and active states for scenes 3, 6, 8, 9, 10, 11, and 12. Those changed scenes were visually reviewed at both sizes with no overlap, clipping, or unreadable interaction label found.
- `git diff --check`: PASS; Git reported only expected line-ending conversion warnings.
- The final browser run's 4× CPU-throttled animation proxy at 1366×768 measured a 16.7 ms median and 16.8 ms p95 frame interval. Physical projector performance remains unmeasured.

## Test evidence rule

Never record a test as passing unless it was actually run against the relevant state. Record `NOT RUN` or `BLOCKED` when appropriate.


## AI / agent security verification

When the project uses LLMs, agents, RAG, MCP/tools, external content, or model-generated actions, tests should assert security effects rather than model wording. Assume the model can be manipulated and verify that deterministic authorization, tenant scope, secret boundaries, tool validation, sandboxing, and approval gates still prevent forbidden effects.
