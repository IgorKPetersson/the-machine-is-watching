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

- `node --check js/presentation.js`: PASS after media integration.
- `node --check tests/presentation.test.mjs`: PASS after test updates.
- `node tests/presentation.test.mjs`: PASS with supplied media; checks 13 scenes, interactions, images, click-triggered video, pause/volume, deliberate missing-media cases, reduced motion, no external page requests, and both required viewports.
- `node tests/presentation.test.mjs --screenshots`: PASS after final scene 2 crop adjustment. Captured all 13 scenes at 1366×768, selected scenes at 1920×1080, plus the active builder and fictional case at 1366×768. Media-heavy scenes 1, 2, 4, 6, 9, 11, and 12 were visually reviewed at both sizes.
- The same browser test checks a 4× CPU-throttled animation proxy at 1366×768; median 16.7 ms and p95 16.8 ms in the final screenshot run.

## Test evidence rule

Never record a test as passing unless it was actually run against the relevant state. Record `NOT RUN` or `BLOCKED` when appropriate.


## AI / agent security verification

When the project uses LLMs, agents, RAG, MCP/tools, external content, or model-generated actions, tests should assert security effects rather than model wording. Assume the model can be manipulated and verify that deterministic authorization, tenant scope, secret boundaries, tool validation, sandboxing, and approval gates still prevent forbidden effects.
