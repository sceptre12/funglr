# Task Spec: u3 build-foundation: splits

> Branch: `LOCAL-31-build-foundation-u3`   Worktree: `/Users/xavier/delivery/worktrees/run-1-20261125-st1-u3`
> Brief (informational copy; the binding `Brief:` line is the one in the work_item instruction): skills/delivery-run/references/briefs-v2/implementer.md

## 1. Objective
Split app/user/js/userService.js into one service file per feature on DataStore, give each feature folder its own module and route registration, and split the post modal into one template and controller per post type.

## 2. Context Package
- Relevant contracts: `contracts/data-layer.md@da2c0992e8154022a162f41f8354ca1b5739dec3`, `contracts/module-layout.md@3a30feffac373126e59007c579789466d3832d73`, `contracts/build-and-serve.md@7806e944efb77dba79f6a560e0d17ea63b7472f2` (cite by pin; never restate)
- Relevant architecture: `/Users/xavier/projects/agent-hq-workspace/plans/funglr/run-1-20261125/architecture.md` section 5 (row st1), section 7; the ticket draft `/Users/xavier/projects/agent-hq-workspace/plans/funglr/run-1-20261125/drafts/build-foundation.md` (Gherkin AC)
- Dependencies: unit u2 (its Integrator item i2 merges first).
- Plan notes that bind this unit: `/Users/xavier/projects/agent-hq-workspace/plans/funglr/run-1-20261125/plan-backlog.md`

## 3. Scope
**In scope:**
- app/user/**
- app/main/js/mainConfig.js
- app/main/js/mainModule.js
- app/text-posts/js/**
- app/text-posts/views/**
- app/image-posts/js/**
- app/image-posts/views/**
- app/audio-posts/js/**
- app/audio-posts/views/**
- app/comments/js/**
- app/likes/js/**
- app/follow/js/**
- app/reblog/js/**
- app/profile/js/profileModule.js
- app/dashboard/js/dashboardModule.js
- app/feed/js/feedModule.js
- app/activity/js/activityModule.js
- app/session/js/sessionModule.js
- app/profile/**
- app/dashboard/views/**
- app/dashboard/js/dashMainCtrl.js
- app/dashboard/js/dashNavCtrl.js
- app/dashboard/js/dashboardConfig.js
- app/feed/js/feedFilters.js
- app/data/test/modules.spec.js
**Out of scope:**
1. files owned by another row (see section 3 of that unit)
2. e2e or browser tests (the repo has no harness; a human hand-tests)
3. fixing the known defects of the old code (feature rows fix their own)
**Do NOT create:**
1. package.json, a lockfile, index.html, gulpfile.js, the root main.scss or any build/test/lint config (owned by st1; contracts/module-layout.md owner table)
2. files under app/auth, other than reading them
3. a feature view beyond the moved modal templates and the moved app/user views listed in section 6
4. a copy of userService.js left behind

## 4. Contracts
| Contract | Field / Value | Authority |
|---|---|---|
| `contracts/module-layout.md` | folder shape, module naming, owner table | contracts/module-layout.md |
| `contracts/data-layer.md` | method and collection names | contracts/data-layer.md |

## 5. Inherited Module API
Each feature service is an Angular factory in its own folder (for example PostService in app/text-posts/js/postService.js, CommentService, LikeService in app/likes/js/likeService.js, FollowService in app/follow/js/followService.js, ReblogService), calling DataStore only; the stub file names followService.js and likeService.js are fixed here because st11 and st13 extend them and st12 and st14 import them.
The root module funglr and every funglr.<feature> module are declared per `contracts/module-layout.md@3a30feffac373126e59007c579789466d3832d73`; services call DataStore only.

## 6. What You Inherit
| Thing | Source | Notes |
|---|---|---|
| DataStore, LocalAdapter | app/data/js/dataStore.js and localAdapter.js (st1 u2) | call only DataStore; never localStorage |
| existing logic to port | app/user/js/userService.js lines 22-184 (read before deleting) | behaviour notes only; the Firebase calls are replaced |

Disposition of every tracked app/user file (14 files, `git ls-files app/user`; use `git mv`, never leave a copy; a file with no destination is archived with mv -n to /tmp/archive, never rm):

| app/user file | destination |
|---|---|
| js/userService.js | the per-feature service files (section 1) |
| profile.html, views/profilenav.html, js/controllers/profileNavCtrl.js | app/profile/profile.html, app/profile/views/profilenav.html, app/profile/js/profileNavCtrl.js (flat) |
| js/controllers/dashMainCtrl.js, js/controllers/dashNavCtrl.js | app/dashboard/js/dashMainCtrl.js and dashNavCtrl.js (flat; new names only, existing app/dashboard/js/* untouched) |
| views/dashnav.html, views/mainscreen.html, views/userdashmain.html | app/dashboard/views/ (new names only) |
| js/controllers/modals.js, includes/modal.html | the post-type folders per section 3 and section 1: one controller per type as flat `<type>PostCtrl.js` (proposed name) in app/<type>-posts/js/ and one modal template per type in app/<type>-posts/views/; modals.js is one controller ModalInstanceCtrl for three types: `git mv` it to app/text-posts/js/textPostCtrl.js and write imagePostCtrl.js and audioPostCtrl.js from its body; modal.html holds one block per type: split it into the three views |
| js/controllers/userController.js | app/profile/js/userController.js (flat, `git mv`, getter funglr.profile; the state funglr.user.mainscreen keeps naming it) |
| js/userFilters.js | app/feed/js/feedFilters.js |
| js/userConfig.js (declares `funglr.user`) | archived with mv -n; its job moves to the per-feature modules |
| the `funglr.user*` states of app/main/js/mainConfig.js | removed from mainConfig.js and re-registered: `funglr.user`, `funglr.user.mainscreen`, `funglr.user.mainscreen.landing` -> app/profile/js/profileConfig.js; `funglr.user.dashboard`, `.post`, `.post.landing` and the abstract `funglr.dashboard` -> app/dashboard/js/dashboardConfig.js (getter funglr.dashboard); templateUrl and controller names point at the destinations above (dashnav.html is app/dashboard/views/dashnav.html); `AuthFactory.requireAuth()` is not kept (u22 owns the route guard) |
| the `funglr.login` and `funglr.signup` states of mainConfig.js | removed here; u5 registers them in app/auth/js/authConfig.js |

Every moved file is rewritten, not only moved: `angular.module('funglr.user')` becomes the destination module (profileNavCtrl.js funglr.profile; dashMainCtrl.js and dashNavCtrl.js funglr.dashboard; feedFilters.js funglr.feed; the post-type controllers funglr.<type>-posts); every `userFactory` call becomes the new feature services or DataStore; dashNavCtrl.js opens the per-type modal templates and controllers by their new paths. The root module `funglr` is declared only in app/main/js/mainModule.js (dependencies ui.bootstrap, ui.router, ngAnimate, anim-in-out, naif.base64, base64, funglr.data and every funglr.<feature> module; no `firebase`, `funglr.user` or `funglr.dash`), and mainConfig.js becomes `angular.module('funglr').run(...).config(...)`.

`git mv` leaves the emptied folders app/user/js/controllers, app/user/js, app/user/views, app/user/includes and app/user. After the last `git mv`, archive the tree with `mkdir -p /tmp/archive/<profile>/<YYYYMMDD>/Users/xavier/delivery/worktrees/run-1-20261125-st1-u3/app` then `mv -n app/user /tmp/archive/<profile>/<YYYYMMDD>/Users/xavier/delivery/worktrees/run-1-20261125-st1-u3/app/user` (literal paths, `<profile>` = your own profile name; if that target already exists, add a `-<HHMMSS>` suffix to the target name) so `test ! -e app/user` holds. No `rm`.

## 7. Known Risky Values
| Value | Correct | Wrong | Source |
|---|---|---|---|
| module and folder names | `funglr.<feature>` module in `app/<feature>/js/<feature>Module.js` per the folder shape | a module name that differs from the folder name | contracts/module-layout.md, section Module and route rules |
| DataStore method names and record field names | exactly those in contracts/data-layer.md | invented methods or fields (for example a `posts.text` field) | contracts/data-layer.md, sections DataStore methods and Collections and record fields |
| `app/auth/**` and `app/dashboard/js/*` existing files | left untouched here (st2 and st9 own them after this row merges); u3 adds only the new files dashMainCtrl.js, dashNavCtrl.js and dashboardConfig.js to app/dashboard/js | editing authService.js | contracts/module-layout.md, section Shared-file owners |

## 8. Acceptance Criteria
- [ ] npm run build exits 0 with the new layout
- [ ] lint is clean
- [ ] npm test passes
- [ ] app/user no longer exists and no `app/user/` reference remains in mainConfig.js
- [ ] every feature folder named in architecture item 5 has its <feature>Module.js
- [ ] mainModule.js lists funglr.data and every funglr.<feature> module (the dashboard one is `funglr.dashboard`, replacing the old `funglr.dash` in mainConfig.js; u14 archives dashConfig.js and renames the funglr.dash getters)
- [ ] modules.spec.js (app/data/test/modules.spec.js) asserts each feature module is a dependency of funglr
- [ ] mainConfig.js no longer registers funglr.login or funglr.signup (u5 registers them in authConfig.js)
- [ ] no file under app declares or reads funglr.user, userFactory or app/user/; the root module is declared only in mainModule.js

## 9. Verification Commands
```bash
# npm run build exits 0 with the new layout
npm run build
# lint is clean
npm run lint
# npm test passes
npm test
# app/user no longer exists and no app/user/ reference remains in mainConfig.js
test ! -e app/user && test "$(grep -c 'app/user/' app/main/js/mainConfig.js)" = 0
# every feature folder named in architecture item 5 has its <feature>Module.js
ls app/auth/js app/text-posts/js/text-postsModule.js app/follow/js/followModule.js app/session/js/sessionModule.js
# mainModule.js lists funglr.data and every funglr.<feature> module
for m in data auth text-posts image-posts audio-posts comments likes follow reblog profile dashboard feed activity session; do grep -q "funglr.$m" app/main/js/mainModule.js || exit 1; done
# modules.spec.js asserts each feature module is a dependency of funglr
test -f app/data/test/modules.spec.js && npm test
# mainConfig.js no longer registers funglr.login or funglr.signup
! grep -q "state('funglr.login'" app/main/js/mainConfig.js && ! grep -q "state('funglr.signup'" app/main/js/mainConfig.js
# no file under app declares or reads funglr.user, userFactory or app/user/; the root module is declared only in mainModule.js
test -z "$(grep -rl -e "angular.module('funglr.user'" -e userFactory -e 'app/user/' app)" && ! grep -q "angular.module('funglr'," app/main/js/mainConfig.js && grep -q "angular.module('funglr'," app/main/js/mainModule.js
```
Done token: `U3-OK`; verifier: `npm run lint && npm test && npm run build && test ! -e app/user && test -f app/data/test/modules.spec.js && for m in data auth text-posts image-posts audio-posts comments likes follow reblog profile dashboard feed activity session; do grep -q "funglr.$m" app/main/js/mainModule.js && continue; exit 1; done && test "$(grep -c 'app/user/' app/main/js/mainConfig.js)" = 0 && test -z "$(grep -rl -e "angular.module('funglr.user'" -e userFactory -e 'app/user/' app)" && ! grep -q "angular.module('funglr'," app/main/js/mainConfig.js && grep -q "angular.module('funglr'," app/main/js/mainModule.js && ! grep -q "state('funglr.login'" app/main/js/mainConfig.js && ! grep -q "state('funglr.signup'" app/main/js/mainConfig.js && echo U3-OK` (exit 0, last stdout line equals the token).

## 10. Branch and Worktree
`LOCAL-31-build-foundation-u3` from the row branch `LOCAL-31-build-foundation` in the unit worktree above; never the main checkout. The branch exists only after the desk read back the key (3.0). Unit branches rebase onto the row branch only, never onto a stack base.

## 11. Decision Gate Reminder
On any of these, write `.decisions/u3.md` (template: `skills/delivery-run/references/templates/decisions-fork.md`) and stop; do not guess:
- a value that differs between two contracts
- a dependency that does not exist yet
- an unclear scope boundary
- criteria that cannot be verified with the commands given
- anything that needs a file outside section 3
