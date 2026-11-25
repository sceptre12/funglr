# Task Spec: u7 text-posts: post views

> Branch: `LOCAL-33-text-posts-u7`   Worktree: `/Users/xavier/delivery/worktrees/run-1-20261125-st3-u7`
> Brief (informational copy; the binding `Brief:` line is the one in the work_item instruction): skills/delivery-run/references/briefs-v2/implementer.md

## 1. Objective
Text post modal template and controller, and the post list view of the signed-in user's text posts, using PostService.

## 2. Context Package
- Relevant contracts: `contracts/data-layer.md@da2c0992e8154022a162f41f8354ca1b5739dec3`, `contracts/module-layout.md@3a30feffac373126e59007c579789466d3832d73`, `contracts/build-and-serve.md@7806e944efb77dba79f6a560e0d17ea63b7472f2` (cite by pin; never restate)
- Relevant architecture: `/Users/xavier/projects/agent-hq-workspace/plans/funglr/run-1-20261125/architecture.md` section 5 (row st3), section 7; the ticket draft `/Users/xavier/projects/agent-hq-workspace/plans/funglr/run-1-20261125/drafts/text-posts.md` (Gherkin AC)
- Dependencies: unit u6 (its Integrator item i6 merges first).
- Plan notes that bind this unit: `/Users/xavier/projects/agent-hq-workspace/plans/funglr/run-1-20261125/plan-backlog.md`

## 3. Scope
**In scope:**
- app/text-posts/js/*Ctrl.js
- app/text-posts/js/text-postsConfig.js
- app/text-posts/views/**
- app/text-posts/test/postViews.spec.js
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

## 5. Inherited Module API
Registers its own ui-router state funglr.textposts under app/text-posts only, in app/text-posts/js/text-postsConfig.js (this unit owns that file; module-layout.md:15 registers states in `<feature>Config.js`). Controllers are flat `*Ctrl.js` files in app/text-posts/js/ (the script collection glob `app/**/js/*.js` is flat, contracts/module-layout.md:17).
The root module funglr and every funglr.<feature> module are declared per `contracts/module-layout.md@3a30feffac373126e59007c579789466d3832d73`; services call DataStore only.

## 6. What You Inherit
| Thing | Source | Notes |
|---|---|---|
| PostService | u6 | use it |
| text modal template and controller | moved by u3 into app/text-posts/views and app/text-posts/js (the controller as `textPostCtrl.js`, proposed name) | extend, do not recreate |

## 7. Known Risky Values
| Value | Correct | Wrong | Source |
|---|---|---|---|
| state name | funglr.textposts | a name registered from another folder | contracts/module-layout.md, section Module and route rules |

## 8. Acceptance Criteria
- [ ] controller spec: submit calls PostService.create with a text post
- [ ] validation message shown for an empty body
- [ ] lint clean

## 9. Verification Commands
```bash
# controller spec: submit calls PostService.create with a text post
npm test
# validation message shown for an empty body
npm test
# lint clean
npm run lint
```
Done token: `U7-OK`; verifier: `npm run lint && npm test && echo U7-OK` (exit 0, last stdout line equals the token).

## 10. Branch and Worktree
`LOCAL-33-text-posts-u7` from the row branch `LOCAL-33-text-posts` in the unit worktree above; never the main checkout. The branch exists only after the desk read back the key (3.0). Unit branches rebase onto the row branch only, never onto a stack base.

## 11. Decision Gate Reminder
On any of these, write `.decisions/u7.md` (template: `skills/delivery-run/references/templates/decisions-fork.md`) and stop; do not guess:
- a value that differs between two contracts
- a dependency that does not exist yet
- an unclear scope boundary
- criteria that cannot be verified with the commands given
- anything that needs a file outside section 3
