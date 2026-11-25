# Task Spec: u1 build-foundation: toolchain

> Branch: `LOCAL-31-build-foundation-u1`   Worktree: `/Users/xavier/delivery/worktrees/run-1-20261125-st1-u1`
> Brief (informational copy; the binding `Brief:` line is the one in the work_item instruction): skills/delivery-run/references/briefs-v2/implementer.md

## 1. Objective
Working npm scripts build, serve, lint and test on Node v22.13.0 with one passing spec, one CI workflow and a corrected README.

## 2. Context Package
- Relevant contracts: `contracts/data-layer.md@da2c0992e8154022a162f41f8354ca1b5739dec3`, `contracts/module-layout.md@3a30feffac373126e59007c579789466d3832d73`, `contracts/build-and-serve.md@7806e944efb77dba79f6a560e0d17ea63b7472f2` (cite by pin; never restate)
- Relevant architecture: `/Users/xavier/projects/agent-hq-workspace/plans/funglr/run-1-20261125/architecture.md` section 5 (row st1), section 7; the ticket draft `/Users/xavier/projects/agent-hq-workspace/plans/funglr/run-1-20261125/drafts/build-foundation.md` (Gherkin AC)
- Dependencies: none inside this row.
- Plan notes that bind this unit: `/Users/xavier/projects/agent-hq-workspace/plans/funglr/run-1-20261125/plan-backlog.md`

## 3. Scope
**In scope:**
- package.json
- package-lock.json
- gulpfile.js
- scripts/**
- eslint.config.js
- vitest.config.js
- karma.conf.js
- .github/workflows/**
- .gitignore
- README.md
- index.html
- bower.json
- styles/sass/main.scss
- app/main/test/toolchain.spec.js
**Out of scope:**
1. app code, services and views
2. a lockfile written by hand: the desk INSTALL writes it
**Do NOT create:**
1. app/**/js/** other than the one smoke spec (units u2 and u3 own app code)
2. any Firebase, Ruby or gulp-ruby-sass dependency
3. a deploy step in CI

## 4. Contracts
| Contract | Field / Value | Authority |
|---|---|---|
| `contracts/build-and-serve.md` | npm scripts, fixed port, CI | contracts/build-and-serve.md |
| `contracts/module-layout.md` | collection globs | contracts/module-layout.md |

## 5. Inherited Module API
None: this unit creates the scripts the other rows call.
The root module funglr and every funglr.<feature> module are declared per `contracts/module-layout.md@3a30feffac373126e59007c579789466d3832d73`; services call DataStore only.

## 6. What You Inherit
| Thing | Source | Notes |
|---|---|---|
| package list | the spike toolchain-runner-spike result (vitest with jsdom, karma fallback), decided by the st1 lead | every package arrives by INSTALL to pipeRunDesk4 with a pinned version; never npm install yourself |
| Node v22.13.0 | machine default | no version manager needed (profile node.prefix_cmd is true) |
| styles | compile styles/sass/main.scss with the `sass` package installed by INSTALL (no Ruby); scripts and templates are concatenated by scripts/ without a further package | do not hand-edit package.json devDependencies or the lockfile: the INSTALL removes the six old gulp packages; commit what the desk wrote |
| styles/sass/main.scss line 1 | measured: `head -1 styles/sass/main.scss` -> `@import '../../bower_components/angular-ui-router-anim-in-out/css/anim-in-out';` (bower_components is gitignored and absent) | delete that one `@import` line so the sass build needs no bower package; keep the other imports as they are |

## 7. Known Risky Values
| Value | Correct | Wrong | Source |
|---|---|---|---|
| script names | build, serve, lint, test exactly | start, dev, check | contracts/build-and-serve.md, section npm scripts |
| serve port | 38100 on 127.0.0.1 | any other port or 0.0.0.0 | contracts/build-and-serve.md, section Fixed port |
| script and style collection globs | as the Module and route rules say | an explicit file list in index.html | contracts/module-layout.md, section Module and route rules |
| eslint rules at u1 time | pass on the unmodified legacy app: `no-console` and `no-unused-vars` at `warn`, `Firebase` declared as a global (proposed) | an error-level rule that fails on files u1 does not own | contracts/build-and-serve.md, section npm scripts |

## 8. Acceptance Criteria
- [ ] npm run lint exits 0
- [ ] lint exits 0 on the unmodified legacy app code
- [ ] npm test exits 0 and runs at least one spec
- [ ] npm run build exits 0 and writes the build folder
- [ ] the CI workflow runs the same four steps as the local gate
- [ ] styles/sass/main.scss imports only partials under styles/sass (no bower_components path)
- [ ] index.html has no firebase script tag

## 9. Verification Commands
```bash
# npm run lint exits 0
npm run lint
# npm test exits 0 and runs at least one spec
npm test
# npm run build exits 0 and writes the build folder
npm run build && ls build
# the CI workflow runs the same four steps as the local gate
grep -c 'npm run lint' .github/workflows/ci.yml && grep -c 'npm test' .github/workflows/ci.yml && grep -c 'npm run build' .github/workflows/ci.yml
# index.html has no firebase script tag
test "$(grep -ci firebase index.html)" = 0
```
Done token: `U1-OK`; verifier: `npm run lint && npm test && npm run build && grep -q 'npm run lint' .github/workflows/ci.yml && grep -q 'npm test' .github/workflows/ci.yml && grep -q 'npm run build' .github/workflows/ci.yml && test "$(grep -ci firebase index.html)" = 0 && echo U1-OK` (exit 0, last stdout line equals the token).

## 10. Branch and Worktree
`LOCAL-31-build-foundation-u1` from the row branch `LOCAL-31-build-foundation` in the unit worktree above; never the main checkout. The branch exists only after the desk read back the key (3.0). Unit branches rebase onto the row branch only, never onto a stack base.

## 11. Decision Gate Reminder
On any of these, write `.decisions/u1.md` (template: `skills/delivery-run/references/templates/decisions-fork.md`) and stop; do not guess:
- a value that differs between two contracts
- a dependency that does not exist yet
- an unclear scope boundary
- criteria that cannot be verified with the commands given
- anything that needs a file outside section 3
