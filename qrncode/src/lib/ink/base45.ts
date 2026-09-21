/** RFC 9285 Base45 — alphabet is QR alphanumeric mode. */

export const BASE45_ALPHABET =
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:";

const ORD: number[] = (() => {
  const t = Array(128).fill(-1);
  for (let i = 0; i < BASE45_ALPHABET.length; i++) {
    t[BASE45_ALPHABET.charCodeAt(i)] = i;
  }
  return t;
})();

export function base45Encode(bytes: Uint8Array): string {
  let out = "";
  for (let i = 0; i < bytes.length; i += 2) {
    if (i + 1 < bytes.length) {
      const n = bytes[i]! * 256 + bytes[i + 1]!;
      const c = n % 45;
      const d = Math.floor(n / 45) % 45;
      const e = Math.floor(n / 2025);
      out += BASE45_ALPHABET[c]! + BASE45_ALPHABET[d]! + BASE45_ALPHABET[e]!;
    } else {
      const n = bytes[i]!;
      out += BASE45_ALPHABET[n % 45]! + BASE45_ALPHABET[Math.floor(n / 45)]!;
    }
  }
  return out;
}

export function base45Decode(text: string): Uint8Array {
  const chars = [...text];
  if (chars.length === 1) {
    throw new Error("Invalid Base45: odd leftover");
  }
  const bytes: number[] = [];
  for (let i = 0; i < chars.length; ) {
    const remaining = chars.length - i;
    if (remaining === 1) throw new Error("Invalid Base45: trailing char");
    if (remaining === 2) {
      const c = ord(chars[i]!);
      const d = ord(chars[i + 1]!);
      const n = c + 45 * d;
      if (n > 255) throw new Error("Invalid Base45: byte overflow");
      bytes.push(n);
      break;
    }
    const c = ord(chars[i]!);
    const d = ord(chars[i + 1]!);
    const e = ord(chars[i + 2]!);
    const n = c + 45 * d + 2025 * e;
    if (n > 65535) throw new Error("Invalid Base45: uint16 overflow");
    bytes.push(n >> 8, n & 255);
    i += 3;
  }
  return new Uint8Array(bytes);
}

function ord(ch: string): number {
  const code = ch.charCodeAt(0);
  const v = code < 128 ? ORD[code]! : -1;
  if (v < 0) throw new Error(`Invalid Base45 character: ${JSON.stringify(ch)}`);
  return v;
}

export function isQrAlphanumeric(text: string): boolean {
  for (let i = 0; i < text.length; i++) {
    const c = text.charCodeAt(i);
    if (c >= 128 || ORD[c]! < 0) return false;
  }
  return true;
}
