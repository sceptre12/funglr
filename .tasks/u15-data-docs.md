# Task Spec: u15 data-docs: docs

> Branch: `LOCAL-40-data-docs-u15`   Worktree: `/Users/xavier/delivery/worktrees/run-1-20261125-st10-u15`
> Brief (informational copy; the binding `Brief:` line is the one in the work_item instruction): skills/delivery-run/references/briefs-v2/docs-writer.md

## 1. Objective
docs/data-schema.md and docs/access-rules.md that point readers to contracts/data-layer.md by pin and explain how to read it, without restating any field.

## 2. Context Package
- Relevant contracts: `contracts/data-layer.md@da2c0992e8154022a162f41f8354ca1b5739dec3`, `contracts/module-layout.md@3a30feffac373126e59007c579789466d3832d73`, `contracts/build-and-serve.md@7806e944efb77dba79f6a560e0d17ea63b7472f2` (cite by pin; never restate)
- Relevant architecture: `/Users/xavier/projects/agent-hq-workspace/plans/funglr/run-1-20261125/architecture.md` section 5 (row st10), section 7; the ticket draft `/Users/xavier/projects/agent-hq-workspace/plans/funglr/run-1-20261125/drafts/data-docs.md` (Gherkin AC)
- Dependencies: none inside this row.
- Plan notes that bind this unit: `/Users/xavier/projects/agent-hq-workspace/plans/funglr/run-1-20261125/plan-backlog.md`

## 3. Scope
**In scope:**
- docs/**
**Out of scope:**
1. files owned by another row (see section 3 of that unit)
2. e2e or browser tests (the repo has no harness; a human hand-tests)
**Do NOT create:**
1. any file outside docs/
2. a restated field list

## 4. Contracts
| Contract | Field / Value | Authority |
|---|---|---|
| `contracts/data-layer.md` | whole contract, cited not copied | contracts/data-layer.md |

## 5. Inherited Module API
Documentation only.
The root module funglr and every funglr.<feature> module are declared per `contracts/module-layout.md@3a30feffac373126e59007c579789466d3832d73`; services call DataStore only.

## 6. What You Inherit
| Thing | Source | Notes |
|---|---|---|
| the contract pin | contracts/data-layer.md (st0) | cite as contracts/data-layer.md@<blob sha> |

## 7. Known Risky Values
| Value | Correct | Wrong | Source |
|---|---|---|---|
| contract pin | git hash-object of contracts/data-layer.md at the time of writing | a stale sha | contracts/data-layer.md |

## 8. Acceptance Criteria
- [ ] both files exist and each cites contracts/data-layer.md by its pin
- [ ] neither file lists a record field name from the contract

## 9. Verification Commands
```bash
# both files exist and each cites contracts/data-layer.md by its pin
grep -q 'data-layer.md@' docs/data-schema.md && grep -q 'data-layer.md@' docs/access-rules.md
# neither file lists a record field name from the contract
! grep -n 'passwordHash' docs/data-schema.md docs/access-rules.md
```
Done token: `U15-OK`; verifier: `grep -q 'data-layer.md@' docs/data-schema.md && grep -q 'data-layer.md@' docs/access-rules.md && ! grep -n 'passwordHash' docs/data-schema.md docs/access-rules.md && echo U15-OK` (exit 0, last stdout line equals the token).

## 10. Branch and Worktree
`LOCAL-40-data-docs-u15` from the row branch `LOCAL-40-data-docs` in the unit worktree above; never the main checkout. The branch exists only after the desk read back the key (3.0). Unit branches rebase onto the row branch only, never onto a stack base.

## 11. Decision Gate Reminder
On any of these, write `.decisions/u15.md` (template: `skills/delivery-run/references/templates/decisions-fork.md`) and stop; do not guess:
- a value that differs between two contracts
- a dependency that does not exist yet
- an unclear scope boundary
- criteria that cannot be verified with the commands given
- anything that needs a file outside section 3
