# Task Spec: u5 auth-signup-login: auth views

> Branch: `LOCAL-32-auth-signup-login-u5`   Worktree: `/Users/xavier/delivery/worktrees/run-1-20261125-st2-u5`
> Brief (informational copy; the binding `Brief:` line is the one in the work_item instruction): skills/delivery-run/references/briefs-v2/implementer.md

## 1. Objective
Signup and login controllers and templates using AuthFactory, with form validation and visible errors.

## 2. Context Package
- Relevant contracts: `contracts/data-layer.md@da2c0992e8154022a162f41f8354ca1b5739dec3`, `contracts/module-layout.md@3a30feffac373126e59007c579789466d3832d73`, `contracts/build-and-serve.md@7806e944efb77dba79f6a560e0d17ea63b7472f2` (cite by pin; never restate)
- Relevant architecture: `/Users/xavier/projects/agent-hq-workspace/plans/funglr/run-1-20261125/architecture.md` section 5 (row st2), section 7; the ticket draft `/Users/xavier/projects/agent-hq-workspace/plans/funglr/run-1-20261125/drafts/auth-signup-login.md` (Gherkin AC)
- Dependencies: unit u4 (its Integrator item i4 merges first).
- Plan notes that bind this unit: `/Users/xavier/projects/agent-hq-workspace/plans/funglr/run-1-20261125/plan-backlog.md`

## 3. Scope
**In scope:**
- app/auth/js/*Ctrl.js
- app/auth/views/**
- app/auth/test/authViews.spec.js
- app/auth/js/userLoginCtrl.js
- app/auth/js/userSignUpCtrl.js
- app/auth/js/authConfig.js
- app/auth/login.html
- app/auth/signup.html
  (these five existing files are in scope: they are reused as-is unless the new controllers (flat `*Ctrl.js` files in app/auth/js/, because the script collection glob `app/**/js/*.js` is flat, contracts/module-layout.md:17) and templates in views/ need them changed; authConfig.js is u4's file and u5 only adds the two states to it, after u4 merged; if a file is replaced, archive the old file with mv -n to /tmp/archive, never rm)
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
| `contracts/module-layout.md` | route registration | contracts/module-layout.md |
| `contracts/data-layer.md` | session | contracts/data-layer.md |

## 5. Inherited Module API
Controllers register under funglr.auth and are flat files in app/auth/js/ (`*Ctrl.js`); state names are funglr.login and funglr.signup, and u5 registers both in app/auth/js/authConfig.js pointing at its own controllers and views (u3 removes the two states from mainConfig.js).
The root module funglr and every funglr.<feature> module are declared per `contracts/module-layout.md@3a30feffac373126e59007c579789466d3832d73`; services call DataStore only.

## 6. What You Inherit
| Thing | Source | Notes |
|---|---|---|
| AuthFactory | u4 (merged to the row branch before this unit starts) | use it; do not recreate |

## 7. Known Risky Values
| Value | Correct | Wrong | Source |
|---|---|---|---|
| state names | funglr.login, funglr.signup | login, signup | app/main/js/mainConfig.js lines 42-61 of the original repo |

## 8. Acceptance Criteria
- [ ] controller specs: valid signup redirects to the home state name funglr.home
- [ ] invalid form shows an error message and does not call signUp
- [ ] lint clean

## 9. Verification Commands
```bash
# controller specs: valid signup redirects to the home state name funglr.home
npm test
# invalid form shows an error message and does not call signUp
npm test
# lint clean
npm run lint
```
Done token: `U5-OK`; verifier: `npm run lint && npm test && echo U5-OK` (exit 0, last stdout line equals the token).

## 10. Branch and Worktree
`LOCAL-32-auth-signup-login-u5` from the row branch `LOCAL-32-auth-signup-login` in the unit worktree above; never the main checkout. The branch exists only after the desk read back the key (3.0). Unit branches rebase onto the row branch only, never onto a stack base.

## 11. Decision Gate Reminder
On any of these, write `.decisions/u5.md` (template: `skills/delivery-run/references/templates/decisions-fork.md`) and stop; do not guess:
- a value that differs between two contracts
- a dependency that does not exist yet
- an unclear scope boundary
- criteria that cannot be verified with the commands given
- anything that needs a file outside section 3
