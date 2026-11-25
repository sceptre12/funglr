# Task Spec: u12 styles-theme: theme

> Branch: `LOCAL-37-styles-theme-u12`   Worktree: `/Users/xavier/delivery/worktrees/run-1-20261125-st7-u12`
> Brief (informational copy; the binding `Brief:` line is the one in the work_item instruction): skills/delivery-run/references/briefs-v2/implementer.md

## 1. Objective
Fill the empty _color and _typography partials, apply one theme, and archive the stale committed styles/css/main.css with mv -n (no rm).

## 2. Context Package
- Relevant contracts: `contracts/data-layer.md@da2c0992e8154022a162f41f8354ca1b5739dec3`, `contracts/module-layout.md@3a30feffac373126e59007c579789466d3832d73`, `contracts/build-and-serve.md@7806e944efb77dba79f6a560e0d17ea63b7472f2` (cite by pin; never restate)
- Relevant architecture: `/Users/xavier/projects/agent-hq-workspace/plans/funglr/run-1-20261125/architecture.md` section 5 (row st7), section 7; the ticket draft `/Users/xavier/projects/agent-hq-workspace/plans/funglr/run-1-20261125/drafts/styles-theme.md` (Gherkin AC)
- Dependencies: none inside this row.
- Plan notes that bind this unit: `/Users/xavier/projects/agent-hq-workspace/plans/funglr/run-1-20261125/plan-backlog.md`

## 3. Scope
**In scope:**
- styles/sass/base/**
- styles/sass/helper/**
- styles/sass/modules/**
- styles/css/**
**Out of scope:**
1. files owned by another row (see section 3 of that unit)
2. e2e or browser tests (the repo has no harness; a human hand-tests)
**Do NOT create:**
1. package.json, a lockfile, index.html, gulpfile.js, the root main.scss or any build/test/lint config (owned by st1; contracts/module-layout.md owner table)
2. a CSS file committed to styles/css
3. any feature partial under app/<feature>/styles

## 4. Contracts
| Contract | Field / Value | Authority |
|---|---|---|
| `contracts/module-layout.md` | owner table | contracts/module-layout.md |

## 5. Inherited Module API
Does not edit styles/sass/main.scss (st1).
The root module funglr and every funglr.<feature> module are declared per `contracts/module-layout.md@3a30feffac373126e59007c579789466d3832d73`; services call DataStore only.

## 6. What You Inherit
| Thing | Source | Notes |
|---|---|---|
| variables partial | styles/sass/helper/_variables.scss (existing) | variables live there |

## 7. Known Risky Values
| Value | Correct | Wrong | Source |
|---|---|---|---|
| main.scss | not edited | adding @imports | contracts/module-layout.md, owner table |

## 8. Acceptance Criteria
- [ ] build compiles styles without Ruby
- [ ] _color.scss and _typography.scss are non-empty
- [ ] styles/css/main.css no longer tracked
- [ ] lint clean

## 9. Verification Commands
```bash
# build compiles styles without Ruby
npm run build
# _color.scss and _typography.scss are non-empty
test -s styles/sass/base/_color.scss && test -s styles/sass/base/_typography.scss
# styles/css/main.css no longer tracked
test ! -e styles/css/main.css
# lint clean
npm run lint
```
Done token: `U12-OK`; verifier: `npm run lint && npm run build && test -s styles/sass/base/_color.scss && test -s styles/sass/base/_typography.scss && test ! -e styles/css/main.css && echo U12-OK` (exit 0, last stdout line equals the token).

## 10. Branch and Worktree
`LOCAL-37-styles-theme-u12` from the row branch `LOCAL-37-styles-theme` in the unit worktree above; never the main checkout. The branch exists only after the desk read back the key (3.0). Unit branches rebase onto the row branch only, never onto a stack base.

## 11. Decision Gate Reminder
On any of these, write `.decisions/u12.md` (template: `skills/delivery-run/references/templates/decisions-fork.md`) and stop; do not guess:
- a value that differs between two contracts
- a dependency that does not exist yet
- an unclear scope boundary
- criteria that cannot be verified with the commands given
- anything that needs a file outside section 3
