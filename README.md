# INK

[![Audited checks](https://github.com/ceedot-rock/qr-compressor/actions/workflows/audited-checks.yml/badge.svg)](https://github.com/ceedot-rock/qr-compressor/actions/workflows/audited-checks.yml)
[![License: AGPL v3](https://img.shields.io/badge/License-AGPL--3.0--or--later-blue.svg)](LICENSE.AGPL-3.0)

**INK** — QR compressor. Slid Phi Labs. Dual-licensed AGPL-3.0-or-later OR Commercial.

Crunch a payload into the smallest QR that still restores every byte.
zlib + RFC 9285 Base45 + QR alphanumeric mode when that wins.
Raw or uppercase fold when that is smaller.
Overflow splits into `I1P:` frames.

Does not: dump Combined GC into this tree. Not PCC. Not pulsar.

## Job

```
bytes → zlib-9 → Base45 → QR
         ↘ raw text / alphanumeric fold   (keep if smaller)
```

Prefix:

| Prefix | Meaning |
|---|---|
| none | ordinary QR text. Any scanner. |
| `I1Z:` | zlib(utf-8) as Base45 |
| `I1F:` | zlib(`name\0` + bytes) as Base45 |
| `I1P:ii/nn:` | one frame of a split payload |

Restore is exact. zlib already checks. Round-trip is the law.

## Use

```
npm test

import { crunch, restorePayload } from "./src/index.ts"

const result = crunch({
  kind: "text",
  text: "0".repeat(4000),
  bytes: new TextEncoder().encode("0".repeat(4000)),
  ecc: "L",
})
```

4,000 zeros → one Version-1-class QR.

## License

You choose one.

1. GNU Affero General Public License v3.0 or later — `LICENSE.AGPL-3.0`
2. Slid Phi Labs Commercial License — `LICENSE.COMMERCIAL`

Closed-app exception $490 / year. Seats: https://www.slidphilabs.com/licensing.json
Contact: corey@slidphilabs.com

Copyright (c) 2026 Slid Phi Labs / Corey Tasz.
