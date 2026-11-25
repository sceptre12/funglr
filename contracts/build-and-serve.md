owner: contracts/build-and-serve.md
consumers: build-foundation, static-pages, styles-theme, data-docs, funglr-revival, toolchain-runner-spike
version: 1

# Contract: npm scripts, serve port and CI (proposed design; the repo has no scripts block today, per facts.md row "package.json devDependencies")

## npm scripts (names fixed; the foundation writes the bodies)
| script | does |
|---|---|
| `npm run build` | bundles scripts, templates and styles per `contracts/module-layout.md` into `build/` using a build that runs on Node v22.13.0 (facts.md row "node -v"); no Ruby |
| `npm run serve` | builds, then serves `index.html` and `build/` statically on port 38100, bound to 127.0.0.1 |
| `npm run lint` | lints `app/**/*.js` and the build files; exit 0 means clean |
| `npm test` | runs every `app/**/test/*.spec.js`; the foundation ships at least one passing spec |

## Fixed port
- port 38100, service `funglr-static-server`, bind 127.0.0.1, fixed because the profile's `ports.lane_base` is 38100 and the plan claims it before launch.

## CI
- One workflow `.github/workflows/ci.yml` runs `npm ci`, `npm run lint`, `npm test` and `npm run build` on push and pull request to `master`. It is a copy of the local gate (`gates.command` in the profile); it adds no deploy.
