# Task Spec: u17 follow-feed: feed

> Branch: `LOCAL-42-follow-feed-u17`   Worktree: `/Users/xavier/delivery/worktrees/run-1-20261125-st12-u17`
> Brief (informational copy; the binding `Brief:` line is the one in the work_item instruction): skills/delivery-run/references/briefs-v2/implementer.md

## 1. Objective
Feed state funglr.feed listing posts of followed users newest first, using FollowService.listFollowing from st11 and DataStore posts.

## 2. Context Package
- Relevant contracts: `contracts/data-layer.md@da2c0992e8154022a162f41f8354ca1b5739dec3`, `contracts/module-layout.md@3a30feffac373126e59007c579789466d3832d73`, `contracts/build-and-serve.md@7806e944efb77dba79f6a560e0d17ea63b7472f2` (cite by pin; never restate)
- Relevant architecture: `/Users/xavier/projects/agent-hq-workspace/plans/funglr/run-1-20261125/architecture.md` section 5 (row st12), section 7; the ticket draft `/Users/xavier/projects/agent-hq-workspace/plans/funglr/run-1-20261125/drafts/follow-feed.md` (Gherkin AC)
- Dependencies: none inside this row. This row is stacked on st11: your worktree starts from the row branch, which was cut from st11's pushed head; do not rebase it.
- Plan notes that bind this unit: `/Users/xavier/projects/agent-hq-workspace/plans/funglr/run-1-20261125/plan-backlog.md`

## 3. Scope
**In scope:**
- app/feed/**
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
| `contracts/data-layer.md` | posts, follows | contracts/data-layer.md |
| `contracts/module-layout.md` | folder shape | contracts/module-layout.md |

## 5. Inherited Module API
Own state funglr.feed.
The root module funglr and every funglr.<feature> module are declared per `contracts/module-layout.md@3a30feffac373126e59007c579789466d3832d73`; services call DataStore only.

## 6. What You Inherit
| Thing | Source | Notes |
|---|---|---|
| DataStore, LocalAdapter | app/data/js/dataStore.js and localAdapter.js (st1 u2) | call only DataStore; never localStorage |
| FollowService | app/follow/js/followService.js (st11, the stack base) | use it for the follow list |

## 7. Known Risky Values
| Value | Correct | Wrong | Source |
|---|---|---|---|
| DataStore method names and record field names | exactly those in contracts/data-layer.md | invented methods or fields (for example a `posts.text` field) | contracts/data-layer.md, sections DataStore methods and Collections and record fields |

## 8. Acceptance Criteria
- [ ] spec: with two followed authors the feed shows only their posts
- [ ] spec: no follows shows an empty-feed message
- [ ] lint clean

## 9. Verification Commands
```bash
# spec: with two followed authors the feed shows only their posts
npm test
# spec: no follows shows an empty-feed message
npm test
# lint clean
npm run lint
```
Done token: `U17-OK`; verifier: `npm run lint && npm test && echo U17-OK` (exit 0, last stdout line equals the token).

## 10. Branch and Worktree
`LOCAL-42-follow-feed-u17` from the row branch `LOCAL-42-follow-feed` in the unit worktree above; never the main checkout. The branch exists only after the desk read back the key (3.0). Unit branches rebase onto the row branch only, never onto a stack base.

## 11. Decision Gate Reminder
On any of these, write `.decisions/u17.md` (template: `skills/delivery-run/references/templates/decisions-fork.md`) and stop; do not guess:
- a value that differs between two contracts
- a dependency that does not exist yet
- an unclear scope boundary
- criteria that cannot be verified with the commands given
- anything that needs a file outside section 3
