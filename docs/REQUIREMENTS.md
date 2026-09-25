# Requirements

Requirements should be observable and testable. Use stable IDs when the project benefits from traceability.

| ID | Requirement | Verification | Status |
| --- | --- | --- | --- |
| R-001 | The entire application must use natural English. This includes all visible UI text, slide content, labels, buttons, tooltips, system messages, quiz questions, discussion prompts, and placeholders. README documentation must also be in natural English. No Swedish text may appear in the application. | Inspect all user-facing content and README files; exercise each available UI flow when implemented. | accepted |
| R-002 | Present 12 interactive scenes and a closing scene in the lesson's narrative order. | Browser scene count and navigation check. | accepted |
| R-003 | Support arrow-key scene navigation, Space for steps, visible Next/Previous controls, progress, scene number, and optional fullscreen. | Browser interaction check. | accepted |
| R-004 | Provide source activation, network expansion, reset controls, capability quiz, and fictional case decision. | Browser interaction check. | accepted |
| R-005 | Show designed fallbacks when optional images or videos are absent; play video only after a user action. | Browser missing-media check and code review. | accepted |
| R-006 | Keep the comparison with Palantir neutral and distinguish the fictional Machine from a real data platform. | Copy and source review. | accepted |

## Non-functional requirements

| ID | Requirement | Verification | Status |
| --- | --- | --- | --- |
| NFR-001 | The main presentation works offline from a local file, without dependencies or required API calls. | Open `index.html` through `file://` in a browser and inspect network-related code. | accepted |
| NFR-002 | The layout fits 1920×1080 and 1366×768 without horizontal scroll or content clipping. | Browser viewport checks and screenshot review. | accepted |
| NFR-003 | Animations are subtle, and reduced-motion users can use the presentation without animation. | Browser media-emulation check and CSS review. | accepted |

## Constraints

- Use HTML, CSS, and vanilla JavaScript with no backend.
- Do not bundle copyrighted film or images; local media files are optional.
