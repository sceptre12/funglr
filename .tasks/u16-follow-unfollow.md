# Task Spec: u16 follow-unfollow: follow

> Branch: `LOCAL-41-follow-unfollow-u16`   Worktree: `/Users/xavier/delivery/worktrees/run-1-20261125-st11-u16`
> Brief (informational copy; the binding `Brief:` line is the one in the work_item instruction): skills/delivery-run/references/briefs-v2/implementer.md

## 1. Objective
FollowService follow/unfollow on DataStore (no duplicate follow, only the follower can unfollow) and its own state funglr.follow with a follow button list of users.

## 2. Context Package
- Relevant contracts: `contracts/data-layer.md@da2c0992e8154022a162f41f8354ca1b5739dec3`, `contracts/module-layout.md@3a30feffac373126e59007c579789466d3832d73`, `contracts/build-and-serve.md@7806e944efb77dba79f6a560e0d17ea63b7472f2` (cite by pin; never restate)
- Relevant architecture: `/Users/xavier/projects/agent-hq-workspace/plans/funglr/run-1-20261125/architecture.md` section 5 (row st11), section 7; the ticket draft `/Users/xavier/projects/agent-hq-workspace/plans/funglr/run-1-20261125/drafts/follow-unfollow.md` (Gherkin AC)
- Dependencies: none inside this row. This row is stacked on st2: your worktree starts from the row branch, which was cut from st2's pushed head; do not rebase it.
- Plan notes that bind this unit: `/Users/xavier/projects/agent-hq-workspace/plans/funglr/run-1-20261125/plan-backlog.md`

## 3. Scope
**In scope:**
- app/follow/**
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
| `contracts/data-layer.md` | follows | contracts/data-layer.md |
| `contracts/module-layout.md` | folder shape | contracts/module-layout.md |

## 5. Inherited Module API
Controls are exposed as the feature's own state funglr.follow (review finding M2).
FollowService exposes follow, unfollow and listFollowing(userId) in app/follow/js/followService.js (used by u17 in st12).
The root module funglr and every funglr.<feature> module are declared per `contracts/module-layout.md@3a30feffac373126e59007c579789466d3832d73`; services call DataStore only.

## 6. What You Inherit
| Thing | Source | Notes |
|---|---|---|
| DataStore, LocalAdapter | app/data/js/dataStore.js and localAdapter.js (st1 u2) | call only DataStore; never localStorage |
| AuthFactory current user | app/auth/js/authService.js (st2, the stack base) | read the current user through `AuthFactory.currentUser()` |

## 7. Known Risky Values
| Value | Correct | Wrong | Source |
|---|---|---|---|
| DataStore method names and record field names | exactly those in contracts/data-layer.md | invented methods or fields (for example a `posts.text` field) | contracts/data-layer.md, sections DataStore methods and Collections and record fields |
| follow id | `<followerId>:<followeeId>` | a random id | contracts/data-layer.md, Collections |

## 8. Acceptance Criteria
- [ ] follow twice rejects `exists`
- [ ] unfollow by another user rejects `forbidden`
- [ ] the author field equals the session userId
- [ ] FollowService.listFollowing(userId) resolves the follows of that user (spec)
- [ ] lint clean

## 9. Verification Commands
```bash
# follow twice rejects `exists`
npm test
# unfollow by another user rejects `forbidden`
npm test
# the author field equals the session userId
npm test
# FollowService.listFollowing(userId) resolves the follows of that user (spec)
npm test
# lint clean
npm run lint
```
Done token: `U16-OK`; verifier: `npm run lint && npm test && echo U16-OK` (exit 0, last stdout line equals the token).

## 10. Branch and Worktree
`LOCAL-41-follow-unfollow-u16` from the row branch `LOCAL-41-follow-unfollow` in the unit worktree above; never the main checkout. The branch exists only after the desk read back the key (3.0). Unit branches rebase onto the row branch only, never onto a stack base.

## 11. Decision Gate Reminder
On any of these, write `.decisions/u16.md` (template: `skills/delivery-run/references/templates/decisions-fork.md`) and stop; do not guess:
- a value that differs between two contracts
- a dependency that does not exist yet
- an unclear scope boundary
- criteria that cannot be verified with the commands given
- anything that needs a file outside section 3
