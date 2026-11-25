# Access rules: how to read the contract

The rules are defined in the last section of `contracts/data-layer.md@da2c0992e8154022a162f41f8354ca1b5739dec3` (see `git hash-object contracts/data-layer.md`). This page explains where they are enforced and how to read them; it does not copy them. The contract wins on any disagreement.

## Where a rule lives

- Enforcement is in the feature service that owns the data, not in the store or the adapter. The store and adapter (`app/data/js/`) only store, find and reject on missing or duplicate records.
- The error codes a rule uses are the ones listed in the contract's "Angular service" section: a missing session rejects as unauthenticated, a disallowed action as forbidden.

## How to read the rules section

The section answers three questions, in this order:

1. Who may delete a record of each kind: read the sentence naming each collection and its owner.
2. Who may read: look for the statement on reads.
3. Who may write: look for the statement on writes, the two named exceptions that need no session, and the requirement that the author reference on a new record matches the signed-in user.

The signed-in user comes from the session document (described in the contract's collections and storage sections), which services read through the store.

## Where to check the code

- Removal checks: `app/text-posts/js/postService.js` and `app/comments/js/commentService.js`; likes, follows and reblogs remove only records built from the current session's user (see `app/likes/js/likeService.js`, `app/follow/js/followService.js`, `app/reblog/js/reblogService.js`).
- Creation with the session as author: `app/image-posts/js/imagePostService.js` and `app/audio-posts/js/audioPostService.js` read the session first and reject as unauthenticated when none exists.
- Session writes (login, logout): `app/auth/js/authService.js`.

When you add a feature that writes data, enforce the rules in your service, add tests next to it, and do not change the contract in the same unit.
