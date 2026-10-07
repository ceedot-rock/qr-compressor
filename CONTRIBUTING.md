# Contributing to qr-compressor (INK)

Thanks for helping crunch bytes into the smallest QR that still restores every
byte.

## Ground rules

- **Round-trip is the law.** Every payload `crunch()` emits must `restore`
  byte-identical. A change that breaks exact restore does not ship.
- **Smallest wins.** When adding a candidate encoding path, it joins the
  candidate race in `src/crunch.ts` — the smallest actual output wins. Never
  force a mode.
- **This tree is the QR compressor**: zlib + RFC 9285 Base45 + QR mode pick
  (alphanumeric fold when it wins). Not PCC. Not pulsar. No outside codec on
  the encode path.
- Overflow still splits into `I1P:` frames; don't change the frame format
  without a migration note in the PR.

## Quick checks

```sh
npm install
npm test        # node --experimental-strip-types --test src/ink.test.ts
```

CI runs the round-trip suite and a license-metadata consistency check on every
pull request.

## Adding a candidate mode

1. Implement it in `src/crunch.ts` (or the module that owns it).
2. Register it as a candidate alongside the existing ones — the race decides.
3. Add a test in `src/ink.test.ts` proving the round-trip is byte-identical and
   that the new mode actually wins somewhere real.
4. Open a pull request using the template.

## Licensing

INK / qr-compressor is dual-licensed: GNU Affero General Public License
v3.0-or-later (`LICENSE.AGPL-3.0`) OR the Slid Phi Labs Commercial License
(`LICENSE.COMMERCIAL`). By contributing you agree your contribution may be
distributed under both.
