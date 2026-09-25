# Install Codex Engineering Harness into another repository

## Preferred: versioned distribution installer

When this template came from the versioned harness distribution, install it from Git Bash with `./install.sh <target-repository>` rather than copying files manually. The installer records `.harness-version` and `.harness/manifest.tsv`, preserves pre-existing conflicting files, and stages incoming merge candidates instead of overwriting them. Use `./install.sh --dry-run <target-repository>` to preview.

For later releases, use `./update.sh --dry-run <target-repository>` and then `./update.sh <target-repository>`. Locally modified managed files are preserved and the incoming release is staged under `.harness-update-conflicts/<version>/` for manual merge.

## Empty/new repository

Extract or copy the **contents** of this package into the target repository root. The target should end up with:

```text
<target-repo>/
├── AGENTS.md
├── AGENTS-PROJECT.md
├── .gitattributes
├── .editorconfig
├── .vscode/settings.json
├── .agents/skills/
├── docs/
├── reference/
└── templates/
```

Do not create an extra wrapper directory around those files.

## Existing repository

Do not blindly overwrite existing files with the same names.

- If `AGENTS.md` already exists, merge the harness workflow rules into it and preserve repository-specific rules.
- If `.agents/skills/` already exists, add only skills whose names do not conflict; review same-name skills manually.
- If `docs/`, `reference/`, or `templates/` already exist, merge the harness files into the existing directories.
- Fill `AGENTS-PROJECT.md` with commands and conventions that are true for the target repository.
- On Windows 11 + Git Bash, keep `docs/WINDOWS-GIT-BASH.md` unless the repository explicitly uses a different shell contract.
- Merge existing `.gitattributes`, `.editorconfig`, and `.vscode/settings.json` files rather than blindly replacing project policy.

## Verification

After installation, verify:

1. `.agents/skills/<skill-name>/SKILL.md` exists for every intended Skill.
2. `AGENTS.md` is in the repository root.
3. Every path mentioned by `AGENTS.md` and `AGENTS-PROJECT.md` exists.
4. No copied document contains project-specific facts from another repository.
5. Confirm `SECURITY.md` exists and project-specific trust boundaries are filled in when security-sensitive features exist.
6. Confirm AI/agent projects have identified tool authorization, secret exposure, sandbox/egress, and adversarial-test controls rather than relying only on prompts.
7. On Git Bash, verify line endings/path behavior with `git status` and `git diff --check`; do not normalize an existing repository blindly.
8. Ask Codex from the repository root to list the instruction sources and available Skills it sees.

If Codex does not reflect newly added Skills, restart the Codex session.
