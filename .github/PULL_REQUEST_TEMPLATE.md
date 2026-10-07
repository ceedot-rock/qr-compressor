## What changed

<!-- One or two sentences. -->

## Modules touched

<!-- e.g. src/crunch.ts, src/protocol.ts, src/qr.ts, or "none" -->

## Checks

- [ ] `npm test` passes (7 round-trip tests, zero failures)
- [ ] Restore is still exact: every changed path is covered by a byte-identical round-trip
- [ ] QR mode pick rule unchanged: the smallest candidate still wins, overflow still splits into `I1P:` frames
- [ ] No outside codec on the encode path; the tree stays zlib + Base45 + QR mode pick (not PCC, not pulsar)
