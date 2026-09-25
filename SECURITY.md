# Security policy and trust boundaries

## Scope

This repository is a static educational presentation. Its diagrams simulate surveillance and AI concepts; they do not perform AI inference, identify anyone, collect personal data, call remote APIs, or take actions outside the browser. The subject and the 87% risk score in scene 12 are fictional.

## Assets and principals

- Protected assets: the integrity of the lesson content, optional locally supplied media, and the presenter's local browser session.
- Principal: a person operating the presentation in a browser. There are no accounts, roles, tenants, server processes, or credentials.
- Trust boundary: the browser loads repository files and any optional local images or videos. The presentation does not accept uploaded text or externally retrieved content.

## Attacker-controlled inputs

Keyboard and pointer actions can change only in-memory presentation state. If the owner adds optional media, the files are parsed by the browser as images or video. Browser and operating-system media security therefore remain relevant. Repository changes and third-party media should be reviewed before release.

## Security invariants

| ID | Invariant | Enforcement point | Verification |
| --- | --- | --- | --- |
| SEC-PRES-001 | Core presentation behavior makes no external network request. | Local-only HTML/CSS/JavaScript and media paths | Source review and browser request check |
| SEC-PRES-002 | The application performs no real identification, risk scoring, or automated action. | All entities and statuses are fixed lesson examples | Source and copy review |
| SEC-PRES-003 | Optional video does not load or play until the user clicks its Play control. | Media controller in `js/presentation.js` | Browser missing-media and initial-state check |
| SEC-PRES-004 | Interaction text is drawn from fixed local copy and is displayed as text, not evaluated as code. | DOM updates in `js/presentation.js` | Source review |

## Authorization, tools, and credentials

No application authorization layer, privileged tool, model, MCP connection, shell command, secret, or external API is present at runtime. No model output reaches an executable sink. Consequently, agent authorization and adversarial prompt-injection tests are not applicable to the current app. Any future addition of live data, AI calls, or tool actions changes this boundary and requires a new threat model and deterministic controls before implementation.

## Validation, isolation, and logging

The browser's file origin or optional local server is the runtime boundary. The app stores no persistent user data and sends no telemetry. Presenter interactions remain in browser memory; there is no audit log because there are no real-world actions to audit.

## Known gaps

- Browser decoding of owner-supplied media depends on the browser and OS. Add only trusted, licensed files.
- No automated secret or dependency scanner is configured. The app currently has no runtime dependencies or credentials.
