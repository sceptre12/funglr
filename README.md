# Funglr (Learning)

A blog app that mimics Tumblr on a small scale. AngularJS 1.3, built with Node 22 (no Ruby, no gulp, no bower build step).

## Setup
Node v22.13.0, then:

    npm ci

## Scripts
- `npm run build` bundles scripts (`app/**/js/**/*.js`), templates (`app/**/*.html`) and styles (`styles/sass/main.scss`) into `build/`
- `npm run serve` builds, then serves `index.html` and `build/` on http://127.0.0.1:38100
- `npm run lint` lints the app and the build files with eslint
- `npm test` runs every `app/**/test/*.spec.js` with vitest (jsdom)

CI (`.github/workflows/ci.yml`) runs `npm ci`, `npm run lint`, `npm test` and `npm run build` on push and pull request to `master`.
