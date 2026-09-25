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

- Actual video playback, pause, and volume behavior with licensed local MP4 files has not been tested because no clips are bundled. The UI uses the browser's native video controls.
- A 4× CPU-throttled headless Chrome run at 1366×768 measured a 16.7 ms median and 16.7 ms 95th-percentile animation frame interval. Performance on the presenter's physical laptop/projector has not been measured.

## Results for the current implementation

- `node --check js/presentation.js`: PASS.
- `node tests/presentation.test.mjs`: PASS after the final animation and focus changes. The test checks 13 scenes, navigation, reveals, clickable nodes, resets, media fallbacks, reduced motion, no external page requests, and both required viewports.
- `node tests/presentation.test.mjs --screenshots`: PASS on the final implementation; captured all 13 scenes at 1366×768 and selected scenes at 1920×1080 for visual review.
- The same browser test checks a 4× CPU-throttled animation proxy at 1366×768; median and p95 were both 16.7 ms in the final run.

## Test evidence rule

Never record a test as passing unless it was actually run against the relevant state. Record `NOT RUN` or `BLOCKED` when appropriate.


## AI / agent security verification

When the project uses LLMs, agents, RAG, MCP/tools, external content, or model-generated actions, tests should assert security effects rather than model wording. Assume the model can be manipulated and verify that deterministic authorization, tenant scope, secret boundaries, tool validation, sandboxing, and approval gates still prevent forbidden effects.
