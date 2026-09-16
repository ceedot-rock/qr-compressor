import { zlibSync, unzlibSync } from "fflate";

export function zlibPack(bytes: Uint8Array): Uint8Array {
  return zlibSync(bytes, { level: 9 });
}

export function zlibUnpack(bytes: Uint8Array): Uint8Array {
  return unzlibSync(bytes);
}

export function utf8Encode(text: string): Uint8Array {
  return new TextEncoder().encode(text);
}

export function utf8Decode(bytes: Uint8Array): string {
  return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
}
