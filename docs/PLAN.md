# Plan

Keep one clearly marked active phase. Each phase needs observable exit criteria.

## Completed phase — repository release

### Objective

Finish the local presentation and publish it at the owner's GitHub URL.

### Tasks

- [x] Build the 12 scenes and closing scene in HTML, CSS, and vanilla JavaScript.
- [x] Add offline media fallbacks, interaction controls, and an English README.
- [x] Run browser interaction and layout verification at both requested viewport sizes.
- [x] Review final repository contents and configure local Git history on `main`.
- [x] Commit and publish `main` to the configured GitHub origin.

### Exit criteria

- [x] Required browser checks have run and results are recorded in `docs/TESTING.md`.
- [x] The staged repository contents have been reviewed for generated files and secrets.
- [x] GitHub confirmed `main` and `HEAD` at the published initial commit.

## Completed phase — local media integration

### Objective

Polish the published presentation using the media supplied locally in `assets/` while preserving offline fallbacks and interaction behavior.

### Exit criteria

- [x] Supplied stills and clips are integrated into scenes 1, 2, 4, 9, and 12; scene 6 gains visual depth without replacing its diagram.
- [x] Video remains click-triggered with native pause and volume controls; intentionally missing media still falls back cleanly.
- [x] Browser checks and visual review pass at 1920x1080 and 1366x768.
- [x] Code, CSS, JavaScript, documentation, and tests are released without the local media binaries; `.gitkeep` preserves both asset directories.

## Active phase — presenter rehearsal

### Objective

Validate the lesson on the actual teaching laptop and projector before delivery.

### Tasks

- [ ] Run a 40-minute rehearsal with the target display and browser.
- [x] Test local image/clip behavior and missing-media fallbacks in the browser.
- [ ] Confirm presentation and distribution rights before publishing any supplied media files.

### Exit criteria

- [ ] The presenter confirms readability and smooth motion on the teaching hardware.
- [ ] The presenter confirms local clip playback, pause, and volume on the teaching hardware.
