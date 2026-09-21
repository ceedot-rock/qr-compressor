import { encode, renderSVG, type QrCodeGenerateResult } from "uqr";

export type Ecc = "L" | "M" | "Q" | "H";

export type QrFrame = {
  payload: string;
  version: number;
  size: number;
  data: boolean[][];
};

export function encodeQr(payload: string, ecc: Ecc): QrFrame {
  const result: QrCodeGenerateResult = encode(payload, {
    ecc,
    border: 0,
    minVersion: 1,
    maxVersion: 40,
  });
  return {
    payload,
    version: result.version,
    size: result.size,
    data: result.data,
  };
}

export function tryEncodeQr(payload: string, ecc: Ecc): QrFrame | null {
  try {
    return encodeQr(payload, ecc);
  } catch {
    return null;
  }
}

/** Alphanumeric capacities for QR versions 1–40 (ISO/IEC 18004). */
export const ALNUM_CAP: Record<Ecc, number[]> = {
  L: [
    25, 47, 77, 114, 154, 195, 224, 279, 335, 395, 468, 535, 619, 667, 758,
    854, 938, 1046, 1153, 1249, 1352, 1460, 1588, 1704, 1853, 1990, 2132,
    2223, 2369, 2520, 2677, 2840, 3009, 3183, 3351, 3537, 3729, 3927, 4087,
    4296,
  ],
  M: [
    20, 38, 61, 90, 122, 154, 178, 221, 262, 311, 366, 419, 483, 528, 600,
    656, 734, 816, 909, 970, 1035, 1125, 1263, 1322, 1429, 1501, 1581, 1677,
    1782, 1897, 2022, 2157, 2301, 2361, 2524, 2625, 2735, 2927, 3057, 3391,
  ],
  Q: [
    16, 29, 47, 67, 87, 108, 125, 157, 189, 221, 259, 296, 352, 376, 426,
    470, 531, 574, 644, 702, 742, 823, 890, 963, 1041, 1094, 1172, 1263,
    1322, 1429, 1499, 1618, 1700, 1787, 1867, 1966, 2071, 2181, 2298, 2420,
  ],
  H: [
    10, 20, 35, 50, 64, 84, 93, 122, 143, 174, 200, 227, 259, 283, 321, 365,
    408, 452, 493, 557, 587, 640, 672, 744, 779, 864, 910, 958, 1016, 1080,
    1150, 1226, 1307, 1394, 1431, 1530, 1591, 1658, 1774, 1852,
  ],
};

export function maxAlnumChars(ecc: Ecc): number {
  return ALNUM_CAP[ecc][39]!;
}

export function qrSvg(
  payload: string,
  ecc: Ecc,
  colors: { ink: string; paper: string },
): string {
  return renderSVG(payload, {
    ecc,
    border: 4,
    pixelSize: 8,
    blackColor: colors.ink,
    whiteColor: colors.paper,
  });
}
