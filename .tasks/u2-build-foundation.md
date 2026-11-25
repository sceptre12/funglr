# Task Spec: u2 build-foundation: data layer

> Branch: `LOCAL-31-build-foundation-u2`   Worktree: `/Users/xavier/delivery/worktrees/run-1-20261125-st1-u2`
> Brief (informational copy; the binding `Brief:` line is the one in the work_item instruction): skills/delivery-run/references/briefs-v2/implementer.md

## 1. Objective
DataStore with the browser-local LocalAdapter, the six methods, the five record collections and the session document, with specs.

## 2. Context Package
- Relevant contracts: `contracts/data-layer.md@da2c0992e8154022a162f41f8354ca1b5739dec3`, `contracts/module-layout.md@3a30feffac373126e59007c579789466d3832d73`, `contracts/build-and-serve.md@7806e944efb77dba79f6a560e0d17ea63b7472f2` (cite by pin; never restate)
- Relevant architecture: `/Users/xavier/projects/agent-hq-workspace/plans/funglr/run-1-20261125/architecture.md` section 5 (row st1), section 7; the ticket draft `/Users/xavier/projects/agent-hq-workspace/plans/funglr/run-1-20261125/drafts/build-foundation.md` (Gherkin AC)
- Dependencies: unit u1 (its Integrator item i1 merges first).
- Plan notes that bind this unit: `/Users/xavier/projects/agent-hq-workspace/plans/funglr/run-1-20261125/plan-backlog.md`

## 3. Scope
**In scope:**
- app/data/**
**Out of scope:**
1. files owned by another row (see section 3 of that unit)
2. e2e or browser tests (the repo has no harness; a human hand-tests)
**Do NOT create:**
1. package.json, a lockfile, index.html, gulpfile.js, the root main.scss or any build/test/lint config (owned by st1; contracts/module-layout.md owner table)
2. any collection or field not in the contract
3. a second adapter (cloud, indexedDB)

## 4. Contracts
| Contract | Field / Value | Authority |
|---|---|---|
| `contracts/data-layer.md` | whole contract | contracts/data-layer.md |

## 5. Inherited Module API
Module funglr.data (app/data/js/dataModule.js); factories DataStore and LocalAdapter; all methods return $q promises.
The root module funglr and every funglr.<feature> module are declared per `contracts/module-layout.md@3a30feffac373126e59007c579789466d3832d73`; services call DataStore only.

## 6. What You Inherit
| Thing | Source | Notes |
|---|---|---|
| test runner and lint config | st1 u1 (package.json scripts, vitest or karma config) | use them; do not add config |
| angular and angular-mocks | installed by u1 through INSTALL | do not install your own |

## 7. Known Risky Values
| Value | Correct | Wrong | Source |
|---|---|---|---|
| DataStore method names and record field names | exactly those in contracts/data-layer.md | invented methods or fields (for example a `posts.text` field) | contracts/data-layer.md, sections DataStore methods and Collections and record fields |
| error codes | not-found, exists, invalid, unauthenticated, forbidden | any other string | contracts/data-layer.md, section Angular service |
| storage keys | funglr:<collection> and funglr:session | unprefixed keys | contracts/data-layer.md, section Storage |

## 8. Acceptance Criteria
- [ ] every DataStore method resolves or rejects as the contract says (spec per method)
- [ ] lint is clean
- [ ] no file under app/data reads or writes any storage key except through LocalAdapter
- [ ] reset() clears every funglr:* key

## 9. Verification Commands
```bash
# every DataStore method resolves or rejects as the contract says (spec per method)
npm test
# lint is clean
npm run lint
# no file under app/data reads or writes any storage key except through LocalAdapter
! grep -rn 'localStorage' app/data/js/dataStore.js
# reset() clears every funglr:* key
npm test
```
Done token: `U2-OK`; verifier: `npm run lint && npm test && ! grep -rn localStorage app/data/js/dataStore.js && echo U2-OK` (exit 0, last stdout line equals the token).

## 10. Branch and Worktree
`LOCAL-31-build-foundation-u2` from the row branch `LOCAL-31-build-foundation` in the unit worktree above; never the main checkout. The branch exists only after the desk read back the key (3.0). Unit branches rebase onto the row branch only, never onto a stack base.

## 11. Decision Gate Reminder
On any of these, write `.decisions/u2.md` (template: `skills/delivery-run/references/templates/decisions-fork.md`) and stop; do not guess:
- a value that differs between two contracts
- a dependency that does not exist yet
- an unclear scope boundary
- criteria that cannot be verified with the commands given
- anything that needs a file outside section 3
