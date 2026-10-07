# Security Policy

INK restores bytes exactly. A bug that lets a QR payload restore to different
bytes than were crunched in — or lets a crafted payload break the restore path
— is a security issue, not a normal bug.

## Reporting a vulnerability

Please do not open a public issue for security problems.

- Email: corey@slidphilabs.com with the subject line `qr-compressor security`
- Or use GitHub's private vulnerability reporting on this repository
  (Security tab, "Report a vulnerability")

Include the affected file or module, steps or inputs to reproduce, and what
you expected versus what happened.

You can expect an acknowledgement within 3 business days. We will keep you
updated while we investigate and credit you in the changelog unless you prefer
to stay anonymous.

## In scope

- Restore mismatch: any payload where restore does not return the exact input bytes
- Frame parsing weaknesses in `I1P:` multi-part payloads (dropped, reordered, or forged frames)
- Prefix confusion: a payload misdetected as ordinary QR text (or vice versa)
- Supply-chain integrity of the npm-published `ink-qr-compressor` package

## Out of scope

- The qrncode demo web app's deployment and hosting
- Social engineering, spam, or denial-of-service against hosted demos
