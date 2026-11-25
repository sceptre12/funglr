# Data schema: how to read the contract

The data model is defined in one place: `contracts/data-layer.md@da2c0992e8154022a162f41f8354ca1b5739dec3` (the blob sha of the file at the time of writing; check it with `git hash-object contracts/data-layer.md`). This page does not copy the contract. If this page and the contract disagree, the contract wins; if the pin no longer matches, re-read the contract and update this page.

## How to read the contract

1. Start with the front matter. It names the file's owner, the rows that consume it and a version.
2. Read the "Angular service" section for the shape of the data layer. It names the module, the one store factory that feature code calls and the adapter that sits behind it. The code is in `app/data/js/` (`dataModule.js`, `dataStore.js`, `localAdapter.js`).
3. Read the store-methods table for what each call resolves with and which error codes it can reject with. The set of error codes is also declared in `app/data/js/dataStore.js`.
4. Read the collections section for the list of collections and the fixed set of names each record carries. The contract is the only list, and it states that rows add no field without a new contract version. Look there, not here.
5. Read the storage section for how the browser-local adapter lays records out in `localStorage` (implemented in `app/data/js/localAdapter.js`), and how secrets are treated.
6. The last section, the access rules, is covered in `docs/access-rules.md`.

## Where the data is used

Feature rows read and write records through the store only. Their services live under `app/<feature>/js/`; for the post kinds see `app/text-posts/`, `app/image-posts/` and `app/audio-posts/`. The module naming that these folders follow is in `contracts/module-layout.md@3a30feffac373126e59007c579789466d3832d73`; how the app is built and served is in `contracts/build-and-serve.md@7806e944efb77dba79f6a560e0d17ea63b7472f2`.

The posts collection holds all three post kinds in one place; the contract states how the kinds differ. The image and audio services also enforce upload size limits that the contract does not mention; read them in `app/image-posts/js/imagePostService.js` and `app/audio-posts/js/audioPostService.js`.

## Working with the data

- Tests and demos can clear everything the app stores through the store's reset call (see the methods table in the contract); the tests under `app/data/test/` show the expected behaviour.
- A failed call rejects with a code and a message; feature code should branch on the code only.
- Never reach `localStorage` or the adapter from a feature; the contract forbids it.
