# Harness installation metadata

Installed harness version: 1.0.0

- `.harness-version` records the installed distribution version.
- `.harness/manifest.tsv` records the last managed hash for files the harness owns.
- Files that conflicted during first install were preserved and incoming candidates were staged under `.harness-install-conflicts/1.0.0/`.
- Do not hand-edit `.harness/manifest.tsv`; use the distribution's `update.sh`.
