# Task Spec: u14 dashboard-module: dashboard

> Branch: `LOCAL-39-dashboard-module-u14`   Worktree: `/Users/xavier/delivery/worktrees/run-1-20261125-st9-u14`
> Brief (informational copy; the binding `Brief:` line is the one in the work_item instruction): skills/delivery-run/references/briefs-v2/implementer.md

## 1. Objective
Build out the dashboard's own-posts list (userItems) and remove the empty stub controllers and views (decision recorded in the coordinator's H1 answer 2).

## 2. Context Package
- Relevant contracts: `contracts/data-layer.md@da2c0992e8154022a162f41f8354ca1b5739dec3`, `contracts/module-layout.md@3a30feffac373126e59007c579789466d3832d73`, `contracts/build-and-serve.md@7806e944efb77dba79f6a560e0d17ea63b7472f2` (cite by pin; never restate)
- Relevant architecture: `/Users/xavier/projects/agent-hq-workspace/plans/funglr/run-1-20261125/architecture.md` section 5 (row st9), section 7; the ticket draft `/Users/xavier/projects/agent-hq-workspace/plans/funglr/run-1-20261125/drafts/dashboard-module.md` (Gherkin AC)
- Dependencies: none inside this row.
- Plan notes that bind this unit: `/Users/xavier/projects/agent-hq-workspace/plans/funglr/run-1-20261125/plan-backlog.md`

## 3. Scope
**In scope:**
- app/dashboard/**
**Out of scope:**
1. files owned by another row (see section 3 of that unit)
2. e2e or browser tests (the repo has no harness; a human hand-tests)
**Do NOT create:**
1. package.json, a lockfile, index.html, gulpfile.js, the root main.scss or any build/test/lint config (owned by st1; contracts/module-layout.md owner table)
2. any file under another feature's folder `app/<other>/`
3. any dependency (an INSTALL goes to the desk)
4. console.log calls in app code (lint warns on them; do not add any)

## 4. Contracts
| Contract | Field / Value | Authority |
|---|---|---|
| `contracts/data-layer.md` | posts | contracts/data-layer.md |
| `contracts/module-layout.md` | folder shape | contracts/module-layout.md |

## 5. Inherited Module API
Stub removal uses mv -n to /tmp/archive, never rm.
The root module funglr and every funglr.<feature> module are declared per `contracts/module-layout.md@3a30feffac373126e59007c579789466d3832d73`; services call DataStore only.

## 6. What You Inherit
| Thing | Source | Notes |
|---|---|---|
| DataStore, LocalAdapter | app/data/js/dataStore.js and localAdapter.js (st1 u2) | call only DataStore; never localStorage |
| kept controllers dashController.js, dashSelectionCtrl.js, mainContentCtrl.js, userItemCtrl.js and dashService.js | app/dashboard/js/controllers/ and app/dashboard/js/ (existing) | `git mv` dashController.js, mainContentCtrl.js, userItemCtrl.js (named by the dashboard states) to app/dashboard/js/ (the script collection glob `app/**/js/*.js` is flat, contracts/module-layout.md:17) and build each out to over 200 bytes; dashSelectionCtrl.js and dashService.js: if no file injects them (grep) archive with mv -n to /tmp/archive, else build out; the stub check below then reads app/dashboard/js |
| dashboardModule.js stub from st1 u3 | app/dashboard/js/ | keep module name `funglr.dashboard` declared only in dashboardModule.js; remove the declaration `angular.module('funglr.dash', [])` by archiving dashConfig.js with mv -n (it holds nothing else); change every `angular.module('funglr.dash')` getter under app/dashboard/** to `angular.module('funglr.dashboard')` |
| dashMainCtrl.js, dashNavCtrl.js, views/dashnav.html, mainscreen.html, userdashmain.html and js/dashboardConfig.js with the dashboard states (st1 u3) | app/dashboard/ | keep the states, point them at the controllers and views you keep; edit the states when you remove a stub |

## 7. Known Risky Values
| Value | Correct | Wrong | Source |
|---|---|---|---|
| DataStore method names and record field names | exactly those in contracts/data-layer.md | invented methods or fields (for example a `posts.text` field) | contracts/data-layer.md, sections DataStore methods and Collections and record fields |
| module name | funglr.dashboard | funglr.dash | contracts/module-layout.md, section Module and route rules (`funglr.<feature>` declared in `<feature>Module.js`) |

## 8. Acceptance Criteria
- [ ] spec: the dashboard lists the signed-in user's posts newest first
- [ ] no stub file of 6 lines or fewer remains in app/dashboard/js (the kept controllers are flat there)
- [ ] no `funglr.dash'` string remains under app/dashboard
- [ ] lint clean

## 9. Verification Commands
```bash
# spec: the dashboard lists the signed-in user's posts newest first
npm test
# no stub file of 6 lines or fewer remains in app/dashboard/js
test -z "$(find app/dashboard/js -name '*.js' ! -name '*Module.js' -size -200c)"
# no funglr.dash' string remains under app/dashboard
! grep -rn "funglr.dash'" app/dashboard
# lint clean
npm run lint
```
Done token: `U14-OK`; verifier: `npm run lint && npm test && test -z "$(find app/dashboard/js -name '*.js' ! -name '*Module.js' -size -200c)" && ! grep -rn "funglr.dash'" app/dashboard && echo U14-OK` (exit 0, last stdout line equals the token).

## 10. Branch and Worktree
`LOCAL-39-dashboard-module-u14` from the row branch `LOCAL-39-dashboard-module` in the unit worktree above; never the main checkout. The branch exists only after the desk read back the key (3.0). Unit branches rebase onto the row branch only, never onto a stack base.

## 11. Decision Gate Reminder
On any of these, write `.decisions/u14.md` (template: `skills/delivery-run/references/templates/decisions-fork.md`) and stop; do not guess:
- a value that differs between two contracts
- a dependency that does not exist yet
- an unclear scope boundary
- criteria that cannot be verified with the commands given
- anything that needs a file outside section 3
