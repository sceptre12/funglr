owner: contracts/data-layer.md
consumers: build-foundation, auth-signup-login, text-posts, image-posts, audio-posts, profile-page, dashboard-module, follow-unfollow, follow-feed, likes, likes-activity, comments, reblog, session-handling, data-docs, funglr-revival
version: 3

# Contract: data layer (proposed design; Firebase 2.x is gone, so the data layer sits behind one interface with a browser-local adapter)

Context: the app's backend was Firebase 2.x (the repo-facts file say all data logic sat in `app/user/js/userService.js`); no cloud account or key may be used in this run (brief.md scope). Everything below is `proposed`.

## Angular service
- Module `funglr.data`, factory `DataStore` (file `app/data/js/dataStore.js`), adapter factory `LocalAdapter` (`app/data/js/localAdapter.js`). Feature services call only `DataStore`; they never touch `localStorage` or any adapter directly.
- Every method returns an AngularJS `$q` promise. A failure rejects with `{code, message}` where `code` is one of: `not-found`, `exists`, `invalid`, `unauthenticated`, `forbidden`.

## DataStore methods
| method | resolves with |
|---|---|
| `get(collection, id)` | the record, or rejects `not-found` |
| `list(collection, filter)` | array of records; `filter` is an object of exact-match field values, or omitted |
| `create(collection, record)` | the stored record (an `id` is assigned when absent, `createdAt` is set); rejects `exists` when `id` is taken |
| `update(collection, id, patch)` | the merged record, or rejects `not-found` |
| `remove(collection, id)` | `true`, or rejects `not-found` |
| `reset()` | clears every `funglr:*` key (test and demo use) |

## Collections and record fields (field names are fixed here; rows add no field without a new contract version)
- `users`: `id`, `email`, `name`, `passwordHash`, `createdAt`
- `posts`: `id`, `authorId`, `type` (`text`|`image`|`audio`), `title`, `body` (text), `mediaData` (image or audio as a data URL), `reblogOf` (post id or null), `createdAt`
- `comments`: `id`, `postId`, `authorId`, `body`, `createdAt`
- `likes`: `id` (`<postId>:<userId>`), `postId`, `userId`, `createdAt`
- `follows`: `id` (`<followerId>:<followeeId>`), `followerId`, `followeeId`, `createdAt`
- `session`: a single document, key `funglr:session`, fields `userId`, `email`, `name`, `signedInAt`
- Session access: `create('session', {id:'current', ...})`, `get('session','current')`, `remove('session','current')`; the adapter stores the document directly under `funglr:session` (no id map). Written by auth-signup-login (login, logout), read by session-handling and every row that needs the current user.

## Storage
- Local adapter keys: `funglr:<collection>` holds a JSON object keyed by record id; `funglr:session` holds the session document.
- `passwordHash` is a demo-grade hash (no real secret handling); no password is stored in clear text.

## Access rules (enforced in the owning feature service, not the adapter)
- A post, comment or like is removable only by its author, and a follow only by its follower (`forbidden` otherwise).
- Reads need no sign-in; every write needs a session (`unauthenticated` otherwise), except sign-up (`create('users', ...)`) and login (`remove`/`create` of `session`), which need none; the author field of a created record (`authorId`, `userId`, `followerId`) equals the session `userId` (`forbidden` otherwise).
