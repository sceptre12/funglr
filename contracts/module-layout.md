owner: contracts/module-layout.md
consumers: build-foundation, auth-signup-login, text-posts, image-posts, audio-posts, static-pages, styles-theme, profile-page, dashboard-module, follow-unfollow, follow-feed, likes, likes-activity, comments, reblog, session-handling, data-docs, funglr-revival
version: 2

# Contract: feature-folder layout and shared-file ownership (proposed design)

Goal: after the foundation lands, each feature row owns its own folder and edits no shared file, so rows can run in parallel.

## Folder shape (one folder per feature under `app/`)
- `app/<feature>/js/` holds the feature's AngularJS module file `<feature>Module.js`, its route registration `<feature>Config.js`, its service and controller files.
- `app/<feature>/views/` holds the templates, referenced by `templateUrl` in the feature's own route registration.
- `app/<feature>/test/<name>.spec.js` holds the feature's specs.
- `app/<feature>/styles/_<feature>.scss` (optional) holds the feature's styles.

## Module and route rules
- Each feature module is named `funglr.<feature>` and is declared in `<feature>Module.js`; the module registers its own ui-router states in `<feature>Config.js`. The root module `funglr` depends on every feature module and is declared only in `app/main/js/mainModule.js`.
- The build collects scripts with the glob `app/**/js/*.js`, with every `*Module.js` first, then `*Config.js`, then the rest, each group in path order; templates and styles are collected the same way (`app/**/styles/_*.scss`). No row edits `index.html`, `gulpfile.js`, `package.json`, a lockfile or the root `main.scss` after the foundation lands.
- A feature that needs one of those shared files changed asks its lead, who raises it to the conductor as a plan change.

## Shared-file owners
| file | owner |
|---|---|
| `package.json`, lockfile, build, test and lint config, `.github/workflows/*`, `index.html`, `.gitignore`, `styles/sass/main.scss` | build-foundation (every dependency also goes through INSTALL to the desk) |
| `app/data/**` | build-foundation (interface in `contracts/data-layer.md`) |
| `app/main/**` (nav, footer, static pages), except `app/main/js/mainModule.js` and `app/main/js/mainConfig.js` | static-pages |
| `app/main/js/mainModule.js`, `app/main/js/mainConfig.js` | build-foundation (mainModule.js lists `funglr.data` and every `funglr.<feature>` module; after the foundation lands no row edits it) |
| `styles/sass/**` other than feature partials and `main.scss` | styles-theme |
| `docs/**` | data-docs |
| every other `app/<feature>/**` | the row named for that feature (build-foundation creates the empty `<feature>Module.js` stub of every folder in item 5; the named row owns it after the foundation merges) |
