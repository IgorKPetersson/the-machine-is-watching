# Design

## System context

This is a static browser presentation. It reads only its own HTML, CSS, JavaScript, and optional local image/video files. It does not collect personal data or contact an API.

## Components

| Component | Responsibility | Key interfaces |
| --- | --- | --- |
| `index.html` | Defines 13 scenes, visible copy, buttons, media placeholders, and semantic structure. | DOM IDs and `data-*` attributes |
| `css/style.css` | Creates the HUD visual language, scene layouts, transitions, and responsive/reduced-motion behavior. | Scene classes and component classes |
| `js/presentation.js` | Handles navigation, staged reveals, diagrams, quiz, media, and presenter mode. | DOM events and SVG lines |
| `tests/presentation.test.mjs` | Opens the local file in headless Chrome and checks interactions and layout. | Chrome DevTools Protocol |

## Data / control flow

The browser loads `index.html`; `presentation.js` discovers ordered `.scene` sections and maintains the current scene and its reveal step. Interaction handlers update scene-local state. SVG lines are recalculated from rendered node positions after interaction or resize. Optional video is assigned a source only after a click. Optional image and video load failures expose fallbacks. Scene 1 and scene 12 use image layers behind guarded text; scene 9 uses a subdued still inside the ontology panel. The scene 12 source image is intentionally blurred and darkened because its visible faces and labels are unrelated to the invented classroom case.

## Invariants

- Scene order and the `maxSteps` array stay aligned.
- All visible copy remains in English.
- A missing optional media file does not block navigation.
- The fictional risk score is never presented as a real prediction.

## Failure handling

- The scene 2 still retains the built-in placeholder when missing; optional background/support images simply fall back to the existing dark layout.
- Missing video retains the custom missing-media panel.
- Unsupported or denied fullscreen leaves ordinary navigation available.

## Trade-offs / unresolved design questions

- Node positions are CSS-based and lines are measured in JavaScript; this keeps the diagrams readable at the target projector and laptop sizes without a graph library.
