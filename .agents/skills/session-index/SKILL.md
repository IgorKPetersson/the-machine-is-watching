---
name: session-index
description: "Turn a long agent/chat session into a compact searchable tree of goals, requirements, decisions, implementation, evidence, rejected paths, open questions, and transcript anchors for later agents."
---

# Session index

This complements `session-handoff`: handoff records current operational state; session-index makes the session's history navigable.

## Workflow

1. Read the available transcript/session history.
2. Omit greetings, repetition, and low-value conversational noise.
3. Separate user requests, decisions, implemented changes, verified evidence, rejected/deferred ideas, and unresolved questions.
4. Group related material under stable topic nodes; preserve chronology only where it explains a decision.
5. For important nodes add an exact, distinctive short phrase that can be searched in the transcript.
6. Include real turn/message identifiers only when the interface exposes them; never invent anchors or IDs.
7. Mark superseded decisions explicitly and point to their replacement.
8. Include file paths, ticket IDs, commits/PRs, and commands only when they actually occurred.
9. Identify durable source-of-truth files containing the final result so later agents do not rely only on chat history.

## Output

```text
Session index
├── Goal / user intent
├── Requirements / constraints
├── Decisions
│   └── decision — why — transcript anchor
├── Implementation / artifacts
├── Tests / evidence
├── Rejected / deferred approaches
├── Open questions / risks
├── Durable sources of truth
└── Current continuation point
```

Collapse empty branches instead of inventing content.
