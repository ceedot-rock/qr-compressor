import { i as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { b as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { r as cn } from "./button-CoZJb9zL.mjs";
import { n as zlibSync, t as unzlibSync } from "../_libs/fflate.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/protocol-Bkk3kdpR.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var badgeVariants = cva("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium tabular-nums tracking-wide", {
	variants: { variant: {
		default: "bg-card text-muted-foreground shadow-[var(--shadow-border)]",
		accent: "bg-primary text-primary-foreground",
		paper: "bg-paper text-ink"
	} },
	defaultVariants: { variant: "default" }
});
function Badge({ className, variant, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cn(badgeVariants({ variant }), className),
		...props
	});
}
var Textarea = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
	ref,
	className: cn("min-h-40 w-full resize-y rounded-lg bg-card px-4 py-3 text-sm leading-relaxed text-foreground shadow-[var(--shadow-border)] placeholder:text-muted-foreground/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70", className),
	...props
}));
Textarea.displayName = "Textarea";
/** RFC 9285 Base45 — alphabet is QR alphanumeric mode. */
var BASE45_ALPHABET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:";
var ORD = (() => {
	const t = Array(128).fill(-1);
	for (let i = 0; i < 45; i++) t[BASE45_ALPHABET.charCodeAt(i)] = i;
	return t;
})();
function base45Encode(bytes) {
	let out = "";
	for (let i = 0; i < bytes.length; i += 2) if (i + 1 < bytes.length) {
		const n = bytes[i] * 256 + bytes[i + 1];
		const c = n % 45;
		const d = Math.floor(n / 45) % 45;
		const e = Math.floor(n / 2025);
		out += BASE45_ALPHABET[c] + BASE45_ALPHABET[d] + BASE45_ALPHABET[e];
	} else {
		const n = bytes[i];
		out += BASE45_ALPHABET[n % 45] + BASE45_ALPHABET[Math.floor(n / 45)];
	}
	return out;
}
function base45Decode(text) {
	const chars = [...text];
	if (chars.length === 1) throw new Error("Invalid Base45: odd leftover");
	const bytes = [];
	for (let i = 0; i < chars.length;) {
		const remaining = chars.length - i;
		if (remaining === 1) throw new Error("Invalid Base45: trailing char");
		if (remaining === 2) {
			const n = ord(chars[i]) + 45 * ord(chars[i + 1]);
			if (n > 255) throw new Error("Invalid Base45: byte overflow");
			bytes.push(n);
			break;
		}
		const c = ord(chars[i]);
		const d = ord(chars[i + 1]);
		const e = ord(chars[i + 2]);
		const n = c + 45 * d + 2025 * e;
		if (n > 65535) throw new Error("Invalid Base45: uint16 overflow");
		bytes.push(n >> 8, n & 255);
		i += 3;
	}
	return new Uint8Array(bytes);
}
function ord(ch) {
	const code = ch.charCodeAt(0);
	const v = code < 128 ? ORD[code] : -1;
	if (v < 0) throw new Error(`Invalid Base45 character: ${JSON.stringify(ch)}`);
	return v;
}
function isQrAlphanumeric(text) {
	for (let i = 0; i < text.length; i++) {
		const c = text.charCodeAt(i);
		if (c >= 128 || ORD[c] < 0) return false;
	}
	return true;
}
function zlibPack(bytes) {
	return zlibSync(bytes, { level: 9 });
}
function zlibUnpack(bytes) {
	return unzlibSync(bytes);
}
function utf8Encode(text) {
	return new TextEncoder().encode(text);
}
function utf8Decode(bytes) {
	return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
}
/** Compact INK payload prefixes. Alphanumeric so QR stays in that mode. */
var PREFIX_ZLIB = "I1Z:";
var PREFIX_FILE = "I1F:";
var PREFIX_PART = "I1P:";
function packText(text) {
	return PREFIX_ZLIB + base45Encode(zlibPack(utf8Encode(text)));
}
function packFile(name, bytes) {
	const nameBytes = utf8Encode(name.replaceAll("\0", "_"));
	const body = new Uint8Array(nameBytes.length + 1 + bytes.length);
	body.set(nameBytes, 0);
	body[nameBytes.length] = 0;
	body.set(bytes, nameBytes.length + 1);
	return PREFIX_FILE + base45Encode(zlibPack(body));
}
function isInkPayload(text) {
	return text.startsWith("I1Z:") || text.startsWith("I1F:") || text.startsWith("I1P:");
}
function restorePayload(text) {
	if (text.startsWith("I1P:")) throw new Error("Partial frame — collect every I1P: piece first");
	if (text.startsWith("I1Z:")) return {
		kind: "text",
		text: utf8Decode(zlibUnpack(base45Decode(text.slice(4))))
	};
	if (text.startsWith("I1F:")) {
		const raw = zlibUnpack(base45Decode(text.slice(4)));
		const zero = raw.indexOf(0);
		if (zero < 0) throw new Error("INK file frame missing name");
		const name = utf8Decode(raw.subarray(0, zero));
		const bytes = raw.subarray(zero + 1);
		return {
			kind: "file",
			name: name || "restored.bin",
			bytes
		};
	}
	return {
		kind: "raw",
		text
	};
}
var PART_RE = /^I1P:(\d{2})\/(\d{2}):/;
function splitPayload(payload, chunkChars) {
	if (payload.length <= chunkChars) return [payload];
	const n = Math.ceil(payload.length / chunkChars);
	if (n > 99) throw new Error("Payload needs more than 99 QR frames");
	const frames = [];
	for (let i = 0; i < n; i++) {
		const slice = payload.slice(i * chunkChars, (i + 1) * chunkChars);
		const ii = String(i + 1).padStart(2, "0");
		const nn = String(n).padStart(2, "0");
		frames.push(`${PREFIX_PART}${ii}/${nn}:${slice}`);
	}
	return frames;
}
function joinParts(parts) {
	const parsed = [];
	for (const p of parts) {
		const m = PART_RE.exec(p);
		if (!m) throw new Error("Not an INK part frame");
		parsed.push({
			i: Number(m[1]),
			n: Number(m[2]),
			body: p.slice(m[0].length)
		});
	}
	if (parsed.length === 0) throw new Error("No parts");
	const n = parsed[0].n;
	if (parsed.some((p) => p.n !== n)) throw new Error("Part count mismatch");
	const byIndex = /* @__PURE__ */ new Map();
	for (const p of parsed) byIndex.set(p.i, p.body);
	if (byIndex.size !== n) throw new Error(`Have ${byIndex.size} of ${n} parts`);
	let joined = "";
	for (let i = 1; i <= n; i++) joined += byIndex.get(i);
	return joined;
}
function tryJoinAndRestore(texts) {
	const unique = [...new Set(texts)];
	const parts = unique.filter((t) => t.startsWith(PREFIX_PART));
	const others = unique.filter((t) => !t.startsWith(PREFIX_PART));
	if (parts.length > 0) return restorePayload(joinParts(parts));
	if (others.length === 1) return restorePayload(others[0]);
	if (others.length === 0) throw new Error("Scan a QR first");
	throw new Error("Multiple unrelated payloads — clear and scan one set");
}
//#endregion
export { packFile as a, splitPayload as c, isQrAlphanumeric as i, tryJoinAndRestore as l, Textarea as n, packText as o, isInkPayload as r, restorePayload as s, Badge as t, zlibPack as u };
