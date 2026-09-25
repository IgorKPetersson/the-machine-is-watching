# Security review checklist

Use this as a compact review aid. `SECURITY.md` owns the project security invariants; Skills own the procedure.

## General

- [ ] Authentication and authorization are enforced at trusted boundaries.
- [ ] User/tenant/resource scope cannot be selected by untrusted input without validation.
- [ ] Secrets use least privilege and are not logged or unnecessarily exposed.
- [ ] External input is validated/canonicalized before sensitive sinks.
- [ ] Network/filesystem/process access is constrained to what the feature requires.
- [ ] Failure paths fail closed where security requires it.

## AI / agents, when applicable

- [ ] Retrieved/user/repository/tool/model content is treated as untrusted data.
- [ ] Prompt text is not the sole control for authorization or secret protection.
- [ ] Tool calls are typed/narrow and independently authorized server-side.
- [ ] Model output is validated before shell/SQL/template/code/path/URL/privileged sinks.
- [ ] Direct and indirect prompt injection are represented in adversarial tests.
- [ ] Cross-user/cross-tenant substitution is tested.
- [ ] Secret exfiltration and unintended egress paths are tested/restricted.
- [ ] Approval gates cannot be bypassed via alternate tools or parameter smuggling.
- [ ] Malicious tool output / persisted content cannot silently elevate later actions.
- [ ] Security tests assert forbidden effects are blocked, not that the model refuses politely.
