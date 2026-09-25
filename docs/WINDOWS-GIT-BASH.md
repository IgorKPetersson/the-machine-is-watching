# Windows 11 + VS Code + Git Bash operating notes

This harness is compatible with Git Bash (MSYS2/MINGW64) on Windows 11. These rules prevent common portability and security failures caused by Windows/Git-Bash path duality and shell mixing.

## Shell contract

- Primary interactive shell: Git Bash (`bash` under MINGW/MSYS).
- Prefer portable Bash syntax for repository automation unless the project explicitly requires another shell.
- Do not silently translate a Bash command into PowerShell or CMD syntax, or vice versa.
- Do not assume WSL is installed or that WSL paths exist.
- When a native Windows command is intentionally invoked, document that boundary and validate its arguments as Windows-native input.

## Paths

The same filesystem object can have multiple textual forms, for example:

```text
C:\Users\name\project
/c/Users/name/project
```

Security decisions MUST NOT rely on string-prefix checks against an unnormalized path. Before deciding whether a path is inside the repository, sandbox, or an allowed directory:

1. Resolve the repository root from Git when possible (`git rev-parse --show-toplevel`).
2. Convert/normalize path forms using a trusted platform mechanism where needed (for example `cygpath` in Git Bash).
3. Resolve `.` / `..`, symlinks, and Windows junction/reparse-point effects as far as the enforcement layer permits.
4. Compare canonical paths using the platform-appropriate case semantics.
5. Re-check the final destination immediately before a privileged filesystem operation when TOCTOU or link replacement is credible.

Never assume `/c/...`, `C:/...`, and `C:\...` are different security principals or different roots.

## Shell scripting conventions

If a project adds Bash scripts, prefer:

```bash
#!/usr/bin/env bash
set -euo pipefail
ROOT="$(git rev-parse --show-toplevel)"
```

- Quote path variables: `"$ROOT/path with spaces"`.
- Prefer `bash scripts/example.sh` when cross-platform execution permissions are uncertain.
- Use `mktemp -d` rather than hard-coding `/tmp`.
- Detect optional tools with `command -v` instead of assuming Linux package names or locations.
- Avoid parsing `ls` output or relying on GNU-only flags unless the project explicitly requires them.
- Avoid hard-coded `/home/...` paths.

## Line endings

`.gitattributes` is authoritative for repository line endings. Bash-consumed files use LF. Windows-native batch/PowerShell files use CRLF when added intentionally.

After first installing this harness into an existing repository, review before running any normalization commit:

```bash
git status
git diff --check
```

If the repository already has a deliberate line-ending policy, merge rather than replace it.

## VS Code

The included `.vscode/settings.json` contains only repository-safe formatting defaults. Do not add personal themes, machine-specific terminal executables, usernames, absolute local paths, or extension preferences to the shared harness.

## Security invariants specific to Windows/Git Bash

- Filesystem authorization uses canonical/resolved paths, not raw user/model strings.
- Drive-letter, slash-style, case, UNC, symlink, junction, and reparse-point aliases cannot bypass allowed-root checks.
- Untrusted model/user input cannot select a shell merely by embedding PowerShell/CMD/Bash syntax.
- Model output never flows directly into `bash -c`, `sh -c`, `cmd /c`, `powershell -Command`, `pwsh -Command`, or equivalent executable sinks without an independently trusted allowlist/parser and authorization check.
