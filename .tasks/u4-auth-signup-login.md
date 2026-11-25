# Task Spec: u4 auth-signup-login: auth service

> Branch: `LOCAL-32-auth-signup-login-u4`   Worktree: `/Users/xavier/delivery/worktrees/run-1-20261125-st2-u4`
> Brief (informational copy; the binding `Brief:` line is the one in the work_item instruction): skills/delivery-run/references/briefs-v2/implementer.md

## 1. Objective
AuthFactory on DataStore: signUp (duplicate email rejected), logIn, logOut, current user from the session document; the known defects (undefined userlogin, non-promise login) gone.

## 2. Context Package
- Relevant contracts: `contracts/data-layer.md@da2c0992e8154022a162f41f8354ca1b5739dec3`, `contracts/module-layout.md@3a30feffac373126e59007c579789466d3832d73`, `contracts/build-and-serve.md@7806e944efb77dba79f6a560e0d17ea63b7472f2` (cite by pin; never restate)
- Relevant architecture: `/Users/xavier/projects/agent-hq-workspace/plans/funglr/run-1-20261125/architecture.md` section 5 (row st2), section 7; the ticket draft `/Users/xavier/projects/agent-hq-workspace/plans/funglr/run-1-20261125/drafts/auth-signup-login.md` (Gherkin AC)
- Dependencies: none inside this row.
- Plan notes that bind this unit: `/Users/xavier/projects/agent-hq-workspace/plans/funglr/run-1-20261125/plan-backlog.md`

## 3. Scope
**In scope:**
- app/auth/js/authService.js
- app/auth/js/authModule.js
- app/auth/js/authConfig.js
- app/auth/test/authService.spec.js
**Out of scope:**
1. files owned by another row (see section 3 of that unit)
2. e2e or browser tests (the repo has no harness; a human hand-tests)
**Do NOT create:**
1. package.json, a lockfile, index.html, gulpfile.js, the root main.scss or any build/test/lint config (owned by st1; contracts/module-layout.md owner table)
2. any file under another feature's folder `app/<other>/`
3. any dependency (an INSTALL goes to the desk)
4. console.log calls in app code (lint warns on them; do not add any)
5. navigation or any `app/main/**` file: the nav's logged-in display is st6's (review finding M1, plan-backlog.md)

## 4. Contracts
| Contract | Field / Value | Authority |
|---|---|---|
| `contracts/data-layer.md` | users and session | contracts/data-layer.md |
| `contracts/module-layout.md` | folder shape | contracts/module-layout.md |

## 5. Inherited Module API
AuthFactory methods return $q promises; the current user is the session document.
AuthFactory.currentUser() resolves with the session document (userId, email, name, signedInAt) or rejects `unauthenticated`; st11 (u16) and st17 (u22) call it.
The root module funglr and every funglr.<feature> module are declared per `contracts/module-layout.md@3a30feffac373126e59007c579789466d3832d73`; services call DataStore only.

## 6. What You Inherit
| Thing | Source | Notes |
|---|---|---|
| DataStore, LocalAdapter | app/data/js/dataStore.js and localAdapter.js (st1 u2) | call only DataStore; never localStorage |
| existing auth module | app/auth/js/*.js (read first) | keep the module name funglr.auth |
| existing app/auth/js/authConfig.js | declares funglr.auth with `[]` and constant FUNGLR_DB | remove the declaration and the constant, use the getter `angular.module('funglr.auth')`; the module is declared only in authModule.js with dependency funglr.data |

## 7. Known Risky Values
| Value | Correct | Wrong | Source |
|---|---|---|---|
| DataStore method names and record field names | exactly those in contracts/data-layer.md | invented methods or fields (for example a `posts.text` field) | contracts/data-layer.md, sections DataStore methods and Collections and record fields |
| module and folder names | `funglr.<feature>` module in `app/<feature>/js/<feature>Module.js` per the folder shape | a module name that differs from the folder name | contracts/module-layout.md, section Module and route rules |
| session document fields | userId, email, name, signedInAt | uid, token | contracts/data-layer.md, section Collections and record fields |

## 8. Acceptance Criteria
- [ ] signUp creates a user and a session; a duplicate email rejects `exists`
- [ ] logIn with a wrong password rejects `invalid`
- [ ] logOut removes the session document
- [ ] AuthFactory.currentUser() resolves the session document, and rejects `unauthenticated` without a session (spec)
- [ ] authConfig.js declares no module
- [ ] lint clean

## 9. Verification Commands
```bash
# signUp creates a user and a session; a duplicate email rejects `exists`
npm test
# logIn with a wrong password rejects `invalid`
npm test
# logOut removes the session document
npm test
# AuthFactory.currentUser() resolves the session document, and rejects `unauthenticated` without a session (spec)
npm test
# authConfig.js declares no module
! grep -q "angular.module('funglr.auth'," app/auth/js/authConfig.js
# lint clean
npm run lint
```
Done token: `U4-OK`; verifier: `npm run lint && npm test && ! grep -q "angular.module('funglr.auth'," app/auth/js/authConfig.js && echo U4-OK` (exit 0, last stdout line equals the token).

## 10. Branch and Worktree
`LOCAL-32-auth-signup-login-u4` from the row branch `LOCAL-32-auth-signup-login` in the unit worktree above; never the main checkout. The branch exists only after the desk read back the key (3.0). Unit branches rebase onto the row branch only, never onto a stack base.

## 11. Decision Gate Reminder
On any of these, write `.decisions/u4.md` (template: `skills/delivery-run/references/templates/decisions-fork.md`) and stop; do not guess:
- a value that differs between two contracts
- a dependency that does not exist yet
- an unclear scope boundary
- criteria that cannot be verified with the commands given
- anything that needs a file outside section 3
