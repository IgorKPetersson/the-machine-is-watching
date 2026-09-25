# Codex Engineering Harness — How to Use the Skills

You currently have these skills:

1. `grill-with-docs`
2. `grill-me`
3. `grilling`
4. `domain-modeling`
5. `ticket-lifecycle`
6. `dual-pass`
7. `done-gate`
8. `session-handoff`
9. `session-index`
10. `security-policy`
11. `llm-threat-model`
12. `prompt-injection-review`
13. `adversarial-agent-tests`

---

## 1. Grill With Docs

### When to use it

Use this when you have an idea, feature, architecture, or design that you want Codex to challenge **before implementation**, while also recording important terminology and architectural decisions.

### Write

```text
$grill-with-docs

I want to add organizations, teams, memberships, and roles to this application.
Grill the design before we implement it.
```

### It will

- Question your design and assumptions.
- Explore the codebase for facts instead of asking you things it can discover itself.
- Ask you to make the important design decisions.
- Sharpen vague terminology.
- Maintain the domain glossary in `CONTEXT.md`.
- Create ADRs in `docs/adr/` when an important architectural decision deserves one.
- Avoid implementing the design until you have reached shared understanding.

### Good for

```text
"I have an idea and want to properly design it first."
```

---

## 2. Grill Me

### When to use it

Use this when your idea or requirement is still vague and you want to turn it into something that can actually be implemented and tested.

### Write

```text
$grill-me

I want users to be able to invite other people into their workspace.
```

### It will

Turn the vague request into:

- A concrete outcome.
- Known facts.
- Assumptions.
- In-scope items.
- Out-of-scope items.
- Acceptance criteria.
- Verification methods.
- Open questions.
- Risks and edge cases.

At the end it tells you:

```text
Ready for implementation: YES | NO
```

### Good for

```text
"I know roughly what I want, but the requirements aren't clear yet."
```

---

## 3. Grilling

### When to use it

Use this when you specifically want Codex to relentlessly challenge a plan or decision.

This is also one of the skills used internally by `grill-with-docs`.

### Write

```text
$grilling

Grill this plan:

Users can belong to multiple organizations.
Each organization has admins and normal members.
Admins can invite new members.
```

### It will

- Build a decision tree around the idea.
- Identify decisions that haven't been made.
- Ask questions about those decisions.
- Give its recommended answer with each question.
- Investigate facts in the repository itself when possible.
- Wait for you to make the actual product/design decisions.
- Continue until the important branches have been resolved.
- Avoid implementing the plan until the design is understood.

### Good for

```text
"Try to find everything wrong, unclear, or undecided about this plan."
```

---

## 4. Domain Modeling

### When to use it

Use this when the problem is mainly about **what things mean** in your application and how domain concepts relate to one another.

This is the other skill used internally by `grill-with-docs`.

### Write

```text
$domain-modeling

Help me define the domain model for users, customers, organizations,
memberships, teams, and invitations.
```

### It will

- Challenge vague terminology.
- Detect overloaded words such as "user", "account", or "customer".
- Help establish canonical names for concepts.
- Test the model against concrete edge cases.
- Compare what you say with what the code actually does.
- Maintain the glossary in:

```text
CONTEXT.md
```

- Suggest an ADR when a significant architectural/domain decision should be preserved.

### Good for

```text
"We keep using different words for the same concepts and need a clear domain model."
```

---

## 5. Ticket Lifecycle

### When to use it

Use this when you have an actual engineering task or ticket and want Codex to take it from requirements through implementation and verification.

### Write

```text
$ticket-lifecycle

Implement this task:

Add the ability for an organization admin to remove a member.

Requirements:
- Only admins can remove members.
- An admin cannot remove the last admin.
- Removed users lose access immediately.
```

### It will

Work through the entire engineering lifecycle:

```text
Understand task
      ↓
Define acceptance criteria
      ↓
Inspect existing code
      ↓
Implement smallest coherent change
      ↓
Add/update tests
      ↓
Run verification
      ↓
Review the diff
      ↓
Run dual-pass review
      ↓
Run done-gate
      ↓
Report DONE / NOT DONE
```

It will also distinguish between:

```text
PASS
FAIL
NOT RUN
BLOCKED
```

instead of pretending untested things passed.

### Good for

```text
"Here is a real ticket. Implement it properly."
```

---

## 6. Dual Pass

### When to use it

Use this when you want a serious review of a design, proposal, implementation, experiment, or conclusion.

### Write

```text
$dual-pass

Review the authentication changes I just made.
```

Or:

```text
$dual-pass

Review this architecture before I implement it.
```

### It will

Review the work twice.

### Pass 1 — Confirmational

It asks:

```text
Does this actually work as intended?
```

It looks for:

- Correct behavior.
- Good decisions.
- Evidence supporting the approach.
- Normal expected paths.

### Pass 2 — Adversarial

It then assumes something may be wrong and looks for:

- Edge cases.
- Counterexamples.
- Hidden assumptions.
- Security problems.
- Reliability problems.
- Missing tests.
- Failure paths.
- Contradictory evidence.

Then it classifies findings:

```text
BLOCKER
MAJOR
MINOR
```

and gives a final result:

```text
ACCEPT
ACCEPT WITH CONDITIONS
REJECT
```

### Good for

```text
"Don't just tell me this looks good. Try to break it."
```

---

## 7. Done Gate

### When to use it

Use this immediately before you consider an implementation finished.

### Write

```text
$done-gate

Check whether this task is actually done.
```

Or:

```text
$done-gate

Verify the feature we just implemented against its acceptance criteria.
```

### It will

Check:

- Every acceptance criterion.
- Tests.
- Linting.
- Type/static checks.
- Builds.
- Integration tests when relevant.
- Final Git diff.
- Accidental edits.
- Debug files.
- Secrets.
- Documentation consistency.
- Known limitations.
- Anything that was never actually verified.

It will not treat:

```text
NOT RUN
```

as:

```text
PASS
```

The final answer is:

```text
Gate: DONE
```

or:

```text
Gate: NOT DONE
```

### Good for

```text
"Before we call this finished, prove that it is finished."
```

---

## 8. Session Handoff

### When to use it

Use this when you're stopping work and want the **next Codex session** to know exactly where you left off.

### Write

```text
$session-handoff
```

You can also say:

```text
$session-handoff

I'm stopping here. Prepare the project for the next Codex session.
```

### It will

Inspect the current state and update:

```text
docs/HANDOFF.md
```

with things such as:

- Current objective.
- What was actually completed.
- Files changed.
- Commands actually run.
- Tests actually run.
- Failures.
- Blocked verification.
- Known risks.
- Decisions made.
- Things not to accidentally undo.
- The smallest next action.

### Good for

```text
"I'm finished working for today and want another session to continue cleanly."
```

---

## 9. Session Index

### When to use it

Use this after a long or complicated Codex conversation when you want a searchable summary of what happened.

### Write

```text
$session-index
```

Or:

```text
$session-index

Create an index of everything important from this session.
```

### It will

Turn a long conversation into something approximately like:

```text
Session index
├── Goal / user intent
├── Requirements / constraints
├── Decisions
├── Implementation / artifacts
├── Tests / evidence
├── Rejected approaches
├── Open questions / risks
├── Durable sources of truth
└── Current continuation point
```

It removes greetings, repetition, and conversational noise.

### Good for

```text
"This conversation became huge. Make it easy for a future agent to understand."
```

---

# A Simple Workflow

You do **not** need to manually invoke every skill on every task.

For a brand-new feature idea, a good workflow is:

```text
$grill-with-docs
       ↓
Design and challenge the idea
       ↓
CONTEXT.md + ADRs updated
       ↓
$ticket-lifecycle
       ↓
Implement the feature
       ↓
$done-gate
       ↓
Prove it is finished
       ↓
$session-handoff
```

For a vague requirement:

```text
$grill-me
       ↓
Turn it into clear requirements
       ↓
$ticket-lifecycle
       ↓
Implement
```

For reviewing something important:

```text
$dual-pass
```

For domain terminology problems:

```text
$domain-modeling
```

For stopping work:

```text
$session-handoff
```

For cleaning up a very long conversation:

```text
$session-index
```

---

# The Three Commands You'll Probably Use Most

## Designing something new

```text
$grill-with-docs

I want to build [describe your idea].
```

## Implementing something

```text
$ticket-lifecycle

Implement this task:
[describe the task and requirements]
```

## Finishing a work session

```text
$session-handoff
```

Those three alone give you a strong basic workflow:

```text
THINK
$grill-with-docs

        ↓

BUILD
$ticket-lifecycle

        ↓

HAND OFF
$session-handoff
```

---

## Notes

- `grill-with-docs` combines `grilling` and `domain-modeling`, so you usually do not need to invoke those two separately.
- Keep all skill folders directly under `.agents/skills/`.
- `domain-modeling` may create or update a root-level `CONTEXT.md`.
- Significant architectural/domain decisions can be recorded under `docs/adr/`.


---

## Security Skills

### Security Policy
Use `$security-policy` when introducing or changing trust boundaries, authorization, secrets, LLM/agent capabilities, external content, or privileged tools. It produces enforceable invariants rather than relying on prompt wording.

### LLM Threat Model
Use `$llm-threat-model` before material agent/RAG/tool changes. It traces untrusted input to privileged sinks and requires deterministic controls and tests for credible abuse paths.

### Prompt Injection Review
Use `$prompt-injection-review` on code/config that connects model-visible untrusted content to tools, auth, secrets, tenant data, or executable actions.

### Adversarial Agent Tests
Use `$adversarial-agent-tests` to build regression tests for direct/indirect injection, tenant substitution, tool escalation, exfiltration, unsafe output handling, and approval bypass. Tests should prove forbidden effects are blocked even if the model is manipulated.
