import { isQrAlphanumeric } from "./base45.ts";
import { zlibPack } from "./compress.ts";
import {
  packFile,
  packText,
  restorePayload,
  splitPayload,
} from "./protocol.ts";
import {
  encodeQr,
  maxAlnumChars,
  tryEncodeQr,
  type Ecc,
  type QrFrame,
} from "./qr.ts";

export type CrunchKind = "text" | "file" | "url";

export type CrunchInput = {
  kind: CrunchKind;
  name?: string;
  text?: string;
  bytes: Uint8Array;
  ecc: Ecc;
};

export type CandidateId = "raw" | "upper" | "ink";

export type Candidate = {
  id: CandidateId;
  label: string;
  payload: string;
  frame: QrFrame | null;
  chars: number;
};

export type CrunchResult = {
  frames: QrFrame[];
  winner: CandidateId;
  candidates: Candidate[];
  originalBytes: number;
  zlibBytes: number;
  packedChars: number;
  ratio: number;
  ecc: Ecc;
  kind: CrunchKind;
  name?: string;
  split: boolean;
  restoredOk: boolean;
};

const PREFIX_LEN = "I1P:01/99:".length;

function tryUpper(text: string): string | null {
  const upper = text.toUpperCase();
  if (!isQrAlphanumeric(upper)) return null;
  if (upper === text) return null;
  return upper;
}

export function crunch(input: CrunchInput): CrunchResult {
  const { bytes, ecc, kind } = input;
  const text =
    input.text ??
    (kind === "file" ? null : new TextDecoder("utf-8", { fatal: false }).decode(bytes));

  const zlibBytes = zlibPack(bytes).length;

  const packed =
    kind === "file"
      ? packFile(input.name ?? "file.bin", bytes)
      : packText(text ?? "");

  const candidates: Candidate[] = [];

  if (kind !== "file" && text != null) {
    candidates.push(score("raw", "Raw text", text, ecc));
    const upper = tryUpper(text);
    if (upper) candidates.push(score("upper", "Alphanumeric fold", upper, ecc));
  }

  candidates.push(score("ink", "INK zlib + Base45", packed, ecc));

  const ranked = [...candidates].sort(rank);
  const best = ranked[0]!;

  let frames: QrFrame[];
  let winner: CandidateId = best.id;
  let split = false;
  let packedChars = best.payload.length;

  if (best.frame) {
    frames = [best.frame];
  } else {
    const cap = Math.max(32, maxAlnumChars(ecc) - PREFIX_LEN);
    const pieces = splitPayload(packed, cap);
    frames = pieces.map((p) => encodeQr(p, ecc));
    winner = "ink";
    split = true;
    packedChars = packed.length;
  }

  let restoredOk = false;
  try {
    if (!split) {
      const r = restorePayload(frames[0]!.payload);
      if (r.kind === "raw") {
        restoredOk =
          kind !== "file" &&
          (r.text === text || r.text === (text ?? "").toUpperCase());
      } else if (r.kind === "text") {
        restoredOk = r.text === (text ?? "");
      } else {
        restoredOk =
          r.bytes.length === bytes.length && r.bytes.every((b, i) => b === bytes[i]);
      }
    } else {
      restoredOk = true;
    }
  } catch {
    restoredOk = false;
  }

  return {
    frames,
    winner,
    candidates,
    originalBytes: bytes.length,
    zlibBytes,
    packedChars,
    ratio: bytes.length === 0 ? 1 : packedChars / bytes.length,
    ecc,
    kind,
    name: input.name,
    split,
    restoredOk,
  };
}

function score(id: CandidateId, label: string, payload: string, ecc: Ecc): Candidate {
  return {
    id,
    label,
    payload,
    frame: tryEncodeQr(payload, ecc),
    chars: payload.length,
  };
}

function rank(a: Candidate, b: Candidate): number {
  const aFit = a.frame ? 0 : 1;
  const bFit = b.frame ? 0 : 1;
  if (aFit !== bFit) return aFit - bFit;
  if (a.frame && b.frame) {
    if (a.frame.version !== b.frame.version) return a.frame.version - b.frame.version;
    if (a.frame.size !== b.frame.size) return a.frame.size - b.frame.size;
  }
  return a.chars - b.chars;
}
