import { base45Decode, base45Encode } from "./base45.ts";
import { utf8Decode, utf8Encode, zlibPack, zlibUnpack } from "./compress.ts";

/** Compact INK payload prefixes. Alphanumeric so QR stays in that mode. */
export const PREFIX_ZLIB = "I1Z:";
export const PREFIX_FILE = "I1F:";
export const PREFIX_PART = "I1P:";

export type Restored =
  | { kind: "text"; text: string }
  | { kind: "file"; name: string; bytes: Uint8Array }
  | { kind: "raw"; text: string };

export function packText(text: string): string {
  return PREFIX_ZLIB + base45Encode(zlibPack(utf8Encode(text)));
}

export function packFile(name: string, bytes: Uint8Array): string {
  const nameBytes = utf8Encode(name.replaceAll("\0", "_"));
  const body = new Uint8Array(nameBytes.length + 1 + bytes.length);
  body.set(nameBytes, 0);
  body[nameBytes.length] = 0;
  body.set(bytes, nameBytes.length + 1);
  return PREFIX_FILE + base45Encode(zlibPack(body));
}

export function isInkPayload(text: string): boolean {
  return (
    text.startsWith(PREFIX_ZLIB) ||
    text.startsWith(PREFIX_FILE) ||
    text.startsWith(PREFIX_PART)
  );
}

export function restorePayload(text: string): Restored {
  if (text.startsWith(PREFIX_PART)) {
    throw new Error("Partial frame — collect every I1P: piece first");
  }
  if (text.startsWith(PREFIX_ZLIB)) {
    const raw = zlibUnpack(base45Decode(text.slice(PREFIX_ZLIB.length)));
    return { kind: "text", text: utf8Decode(raw) };
  }
  if (text.startsWith(PREFIX_FILE)) {
    const raw = zlibUnpack(base45Decode(text.slice(PREFIX_FILE.length)));
    const zero = raw.indexOf(0);
    if (zero < 0) throw new Error("INK file frame missing name");
    const name = utf8Decode(raw.subarray(0, zero));
    const bytes = raw.subarray(zero + 1);
    return { kind: "file", name: name || "restored.bin", bytes };
  }
  return { kind: "raw", text };
}

const PART_RE = /^I1P:(\d{2})\/(\d{2}):/;

export function splitPayload(payload: string, chunkChars: number): string[] {
  if (payload.length <= chunkChars) return [payload];
  const n = Math.ceil(payload.length / chunkChars);
  if (n > 99) throw new Error("Payload needs more than 99 QR frames");
  const frames: string[] = [];
  for (let i = 0; i < n; i++) {
    const slice = payload.slice(i * chunkChars, (i + 1) * chunkChars);
    const ii = String(i + 1).padStart(2, "0");
    const nn = String(n).padStart(2, "0");
    frames.push(`${PREFIX_PART}${ii}/${nn}:${slice}`);
  }
  return frames;
}

export function joinParts(parts: string[]): string {
  const parsed: { i: number; n: number; body: string }[] = [];
  for (const p of parts) {
    const m = PART_RE.exec(p);
    if (!m) throw new Error("Not an INK part frame");
    parsed.push({
      i: Number(m[1]),
      n: Number(m[2]),
      body: p.slice(m[0].length),
    });
  }
  if (parsed.length === 0) throw new Error("No parts");
  const n = parsed[0]!.n;
  if (parsed.some((p) => p.n !== n)) throw new Error("Part count mismatch");
  const byIndex = new Map<number, string>();
  for (const p of parsed) byIndex.set(p.i, p.body);
  if (byIndex.size !== n) {
    throw new Error(`Have ${byIndex.size} of ${n} parts`);
  }
  let joined = "";
  for (let i = 1; i <= n; i++) joined += byIndex.get(i)!;
  return joined;
}

export function tryJoinAndRestore(texts: string[]): Restored {
  const unique = [...new Set(texts)];
  const parts = unique.filter((t) => t.startsWith(PREFIX_PART));
  const others = unique.filter((t) => !t.startsWith(PREFIX_PART));
  if (parts.length > 0) {
    return restorePayload(joinParts(parts));
  }
  if (others.length === 1) return restorePayload(others[0]!);
  if (others.length === 0) throw new Error("Scan a QR first");
  throw new Error("Multiple unrelated payloads — clear and scan one set");
}
