import assert from "node:assert/strict";
import { test } from "node:test";
import { base45Decode, base45Encode } from "./base45.ts";
import { crunch } from "./crunch.ts";
import {
  joinParts,
  packText,
  restorePayload,
  splitPayload,
  tryJoinAndRestore,
} from "./protocol.ts";
import { utf8Encode } from "./compress.ts";

test("base45 roundtrip", () => {
  const samples = [
    new Uint8Array([0]),
    new Uint8Array([255]),
    new Uint8Array([1, 2, 3]),
    utf8Encode("Hello, INK"),
    new Uint8Array(256).map((_, i) => i),
  ];
  for (const s of samples) {
    const encoded = base45Encode(s);
    const decoded = base45Decode(encoded);
    assert.deepEqual([...decoded], [...s]);
  }
});

test("zeros pack into a tiny QR", () => {
  const bytes = new Uint8Array(4000);
  const result = crunch({ kind: "text", bytes, text: "0".repeat(4000), ecc: "L" });
  assert.equal(result.winner, "ink");
  assert.equal(result.frames.length, 1);
  assert.ok(result.frames[0]!.version <= 3, `version ${result.frames[0]!.version}`);
  assert.equal(result.restoredOk, true);
});

test("text zlib restore", () => {
  const text = "Slid Phi Labs — crunch bytes into ink.";
  const payload = packText(text);
  const restored = restorePayload(payload);
  assert.equal(restored.kind, "text");
  if (restored.kind === "text") assert.equal(restored.text, text);
});

test("simple URL prefers alphanumeric fold", () => {
  const text = "https://www.slidphilabs.com";
  const result = crunch({
    kind: "url",
    bytes: utf8Encode(text),
    text,
    ecc: "M",
  });
  assert.ok(result.frames.length === 1);
  assert.ok(result.winner === "upper" || result.winner === "raw" || result.winner === "ink");
  assert.ok(result.frames[0]!.version <= 3);
});

test("split join restore", () => {
  const text = "INK round-trip payload";
  const packed = packText(text);
  const parts = splitPayload(packed, 12);
  assert.ok(parts.length > 2);
  const joined = joinParts(parts);
  const restored = restorePayload(joined);
  assert.equal(restored.kind, "text");
  if (restored.kind === "text") assert.equal(restored.text, text);
  const via = tryJoinAndRestore(parts.slice().reverse());
  assert.equal(via.kind, "text");
});

test("file pack restore", () => {
  const bytes = utf8Encode("payload-bytes");
  const result = crunch({
    kind: "file",
    name: "note.txt",
    bytes,
    ecc: "L",
  });
  assert.equal(result.winner, "ink");
  const restored = restorePayload(result.frames[0]!.payload);
  assert.equal(restored.kind, "file");
  if (restored.kind === "file") {
    assert.equal(restored.name, "note.txt");
    assert.deepEqual([...restored.bytes], [...bytes]);
  }
});

test("crunch split path genuinely verifies restoration", () => {
  // Incompressible-ish payload forces a multi-frame split through crunch().
  let big = "";
  let s = 12345;
  for (let i = 0; i < 9000; i++) {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    big += "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"[s % 36];
  }
  const bytes = utf8Encode(big);
  const result = crunch({ kind: "text", text: big, bytes, ecc: "M" });
  assert.ok(result.split, "expected a split payload");
  assert.ok(result.frames.length > 1, "expected multiple frames");
  // restoredOk must come from the real join+restore+compare path, not a free pass.
  assert.equal(result.restoredOk, true);
  const restored = tryJoinAndRestore(result.frames.map((f) => f.payload));
  assert.equal(restored.kind, "text");
  if (restored.kind === "text") assert.equal(restored.text, big);
  // Corrupting any frame must break restoration (proves the check isn't vacuous).
  const tampered = result.frames.map((f, i) =>
    i === 1 ? f.payload.slice(0, -8) + "XXXXXXXX" : f.payload,
  );
  assert.throws(() => tryJoinAndRestore(tampered));
});
