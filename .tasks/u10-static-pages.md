# Task Spec: u10 static-pages: pages

> Branch: `LOCAL-36-static-pages-u10`   Worktree: `/Users/xavier/delivery/worktrees/run-1-20261125-st6-u10`
> Brief (informational copy; the binding `Brief:` line is the one in the work_item instruction): skills/delivery-run/references/briefs-v2/implementer.md

## 1. Objective
Home, about and contact views with real content (no placeholder text).

## 2. Context Package
- Relevant contracts: `contracts/data-layer.md@da2c0992e8154022a162f41f8354ca1b5739dec3`, `contracts/module-layout.md@3a30feffac373126e59007c579789466d3832d73`, `contracts/build-and-serve.md@7806e944efb77dba79f6a560e0d17ea63b7472f2` (cite by pin; never restate)
- Relevant architecture: `/Users/xavier/projects/agent-hq-workspace/plans/funglr/run-1-20261125/architecture.md` section 5 (row st6), section 7; the ticket draft `/Users/xavier/projects/agent-hq-workspace/plans/funglr/run-1-20261125/drafts/static-pages.md` (Gherkin AC)
- Dependencies: none inside this row.
- Plan notes that bind this unit: `/Users/xavier/projects/agent-hq-workspace/plans/funglr/run-1-20261125/plan-backlog.md`

## 3. Scope
**In scope:**
- app/main/views/**
**Out of scope:**
1. files owned by another row (see section 3 of that unit)
2. e2e or browser tests (the repo has no harness; a human hand-tests)
**Do NOT create:**
1. package.json, a lockfile, index.html, gulpfile.js, the root main.scss or any build/test/lint config (owned by st1; contracts/module-layout.md owner table)
2. any file under another feature's folder `app/<other>/`
3. any dependency (an INSTALL goes to the desk)
4. console.log calls in app code (lint warns on them; do not add any)
5. app/main/js/mainConfig.js and mainModule.js (st1)

## 4. Contracts
| Contract | Field / Value | Authority |
|---|---|---|
| `contracts/module-layout.md` | owner table | contracts/module-layout.md |

## 5. Inherited Module API
Views only; no route registration.
The root module funglr and every funglr.<feature> module are declared per `contracts/module-layout.md@3a30feffac373126e59007c579789466d3832d73`; services call DataStore only.

## 6. What You Inherit
| Thing | Source | Notes |
|---|---|---|
| states funglr.home, funglr.about, funglr.contact | app/main/js/mainConfig.js (st1) | this unit supplies views only; the states already exist |

## 7. Known Risky Values
| Value | Correct | Wrong | Source |
|---|---|---|---|
| state names | funglr.home, funglr.about, funglr.contact | home, about, contact | app/main/js/mainConfig.js lines 42-61 of the original repo |

## 8. Acceptance Criteria
- [ ] the three views exist and none contains the placeholder string yoooofwefin
- [ ] build exits 0
- [ ] lint clean

## 9. Verification Commands
```bash
# the three views exist and none contains the placeholder string yoooofwefin
test "$(grep -rc yoooofwefin app/main/views | awk -F: '{s+=$2} END {print s}')" = 0
# build exits 0
npm run build
# lint clean
npm run lint
```
Done token: `U10-OK`; verifier: `npm run lint && npm run build && ! grep -rq yoooofwefin app/main/views && echo U10-OK` (exit 0, last stdout line equals the token).

## 10. Branch and Worktree
`LOCAL-36-static-pages-u10` from the row branch `LOCAL-36-static-pages` in the unit worktree above; never the main checkout. The branch exists only after the desk read back the key (3.0). Unit branches rebase onto the row branch only, never onto a stack base.

## 11. Decision Gate Reminder
On any of these, write `.decisions/u10.md` (template: `skills/delivery-run/references/templates/decisions-fork.md`) and stop; do not guess:
- a value that differs between two contracts
- a dependency that does not exist yet
- an unclear scope boundary
- criteria that cannot be verified with the commands given
- anything that needs a file outside section 3
