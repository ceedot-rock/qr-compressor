import { i as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { b as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { i as formatBytes, n as Button, r as cn, t as AppShell } from "./button-CoZJb9zL.mjs";
import { a as packFile, c as splitPayload, i as isQrAlphanumeric, n as Textarea, o as packText, s as restorePayload, t as Badge, u as zlibPack } from "./protocol-Bkk3kdpR.mjs";
import { a as Download, c as ChevronLeft, i as FileUp, n as Trash2, o as Copy, s as ChevronRight } from "../_libs/lucide-react.mjs";
import { n as renderSVG, t as encode } from "../_libs/uqr.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-B6VJ24Fs.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function encodeQr(payload, ecc) {
	const result = encode(payload, {
		ecc,
		border: 0,
		minVersion: 1,
		maxVersion: 40
	});
	return {
		payload,
		version: result.version,
		size: result.size,
		data: result.data
	};
}
function tryEncodeQr(payload, ecc) {
	try {
		return encodeQr(payload, ecc);
	} catch {
		return null;
	}
}
/** Alphanumeric capacities for QR versions 1–40 (ISO/IEC 18004). */
var ALNUM_CAP = {
	L: [
		25,
		47,
		77,
		114,
		154,
		195,
		224,
		279,
		335,
		395,
		468,
		535,
		619,
		667,
		758,
		854,
		938,
		1046,
		1153,
		1249,
		1352,
		1460,
		1588,
		1704,
		1853,
		1990,
		2132,
		2223,
		2369,
		2520,
		2677,
		2840,
		3009,
		3183,
		3351,
		3537,
		3729,
		3927,
		4087,
		4296
	],
	M: [
		20,
		38,
		61,
		90,
		122,
		154,
		178,
		221,
		262,
		311,
		366,
		419,
		483,
		528,
		600,
		656,
		734,
		816,
		909,
		970,
		1035,
		1125,
		1263,
		1322,
		1429,
		1501,
		1581,
		1677,
		1782,
		1897,
		2022,
		2157,
		2301,
		2361,
		2524,
		2625,
		2735,
		2927,
		3057,
		3391
	],
	Q: [
		16,
		29,
		47,
		67,
		87,
		108,
		125,
		157,
		189,
		221,
		259,
		296,
		352,
		376,
		426,
		470,
		531,
		574,
		644,
		702,
		742,
		823,
		890,
		963,
		1041,
		1094,
		1172,
		1263,
		1322,
		1429,
		1499,
		1618,
		1700,
		1787,
		1867,
		1966,
		2071,
		2181,
		2298,
		2420
	],
	H: [
		10,
		20,
		35,
		50,
		64,
		84,
		93,
		122,
		143,
		174,
		200,
		227,
		259,
		283,
		321,
		365,
		408,
		452,
		493,
		557,
		587,
		640,
		672,
		744,
		779,
		864,
		910,
		958,
		1016,
		1080,
		1150,
		1226,
		1307,
		1394,
		1431,
		1530,
		1591,
		1658,
		1774,
		1852
	]
};
function maxAlnumChars(ecc) {
	return ALNUM_CAP[ecc][39];
}
function qrSvg(payload, ecc, colors) {
	return renderSVG(payload, {
		ecc,
		border: 4,
		pixelSize: 8,
		blackColor: colors.ink,
		whiteColor: colors.paper
	});
}
var PREFIX_LEN = 10;
function tryUpper(text) {
	const upper = text.toUpperCase();
	if (!isQrAlphanumeric(upper)) return null;
	if (upper === text) return null;
	return upper;
}
function crunch(input) {
	const { bytes, ecc, kind } = input;
	const text = input.text ?? (kind === "file" ? null : new TextDecoder("utf-8", { fatal: false }).decode(bytes));
	const zlibBytes = zlibPack(bytes).length;
	const packed = kind === "file" ? packFile(input.name ?? "file.bin", bytes) : packText(text ?? "");
	const candidates = [];
	if (kind !== "file" && text != null) {
		candidates.push(score("raw", "Raw text", text, ecc));
		const upper = tryUpper(text);
		if (upper) candidates.push(score("upper", "Alphanumeric fold", upper, ecc));
	}
	candidates.push(score("ink", "INK zlib + Base45", packed, ecc));
	const best = [...candidates].sort(rank)[0];
	let frames;
	let winner = best.id;
	let split = false;
	let packedChars = best.payload.length;
	if (best.frame) frames = [best.frame];
	else {
		const cap = Math.max(32, maxAlnumChars(ecc) - PREFIX_LEN);
		frames = splitPayload(packed, cap).map((p) => encodeQr(p, ecc));
		winner = "ink";
		split = true;
		packedChars = packed.length;
	}
	let restoredOk = false;
	try {
		if (!split) {
			const r = restorePayload(frames[0].payload);
			if (r.kind === "raw") restoredOk = kind !== "file" && (r.text === text || r.text === (text ?? "").toUpperCase());
			else if (r.kind === "text") restoredOk = r.text === (text ?? "");
			else restoredOk = r.bytes.length === bytes.length && r.bytes.every((b, i) => b === bytes[i]);
		} else restoredOk = true;
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
		restoredOk
	};
}
function score(id, label, payload, ecc) {
	return {
		id,
		label,
		payload,
		frame: tryEncodeQr(payload, ecc),
		chars: payload.length
	};
}
function rank(a, b) {
	const aFit = a.frame ? 0 : 1;
	const bFit = b.frame ? 0 : 1;
	if (aFit !== bFit) return aFit - bFit;
	if (a.frame && b.frame) {
		if (a.frame.version !== b.frame.version) return a.frame.version - b.frame.version;
		if (a.frame.size !== b.frame.size) return a.frame.size - b.frame.size;
	}
	return a.chars - b.chars;
}
var INK = "#111110";
var PAPER = "#ece8e1";
function QrCard({ frames, ecc, emptyHint }) {
	const [index, setIndex] = (0, import_react.useState)(0);
	const [playing, setPlaying] = (0, import_react.useState)(false);
	const canvasRef = (0, import_react.useRef)(null);
	const frame = frames?.[index] ?? null;
	(0, import_react.useEffect)(() => {
		setIndex(0);
		setPlaying(false);
	}, [frames]);
	(0, import_react.useEffect)(() => {
		if (!playing || !frames || frames.length < 2) return;
		const id = window.setInterval(() => {
			setIndex((i) => (i + 1) % frames.length);
		}, 420);
		return () => window.clearInterval(id);
	}, [playing, frames]);
	(0, import_react.useEffect)(() => {
		const canvas = canvasRef.current;
		if (!canvas || !frame) return;
		drawQr(canvas, frame.data);
	}, [frame]);
	const svg = (0, import_react.useMemo)(() => {
		if (!frame) return null;
		return qrSvg(frame.payload, ecc, {
			ink: INK,
			paper: PAPER
		});
	}, [frame, ecc]);
	function downloadPng() {
		const canvas = canvasRef.current;
		if (!canvas) return;
		canvas.toBlob((blob) => {
			if (!blob) return;
			const a = document.createElement("a");
			a.href = URL.createObjectURL(blob);
			a.download = frames && frames.length > 1 ? `ink-${index + 1}.png` : "ink.png";
			a.click();
			URL.revokeObjectURL(a.href);
		});
	}
	function downloadSvg() {
		if (!svg) return;
		const blob = new Blob([svg], { type: "image/svg+xml" });
		const a = document.createElement("a");
		a.href = URL.createObjectURL(blob);
		a.download = frames && frames.length > 1 ? `ink-${index + 1}.svg` : "ink.svg";
		a.click();
		URL.revokeObjectURL(a.href);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "rounded-3xl bg-secondary p-3 shadow-[var(--shadow-border)] sm:p-4",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "rounded-2xl bg-paper p-5 shadow-[var(--shadow-paper)] sm:p-6",
				children: frame ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("canvas", {
					ref: canvasRef,
					className: "mx-auto block h-auto w-full max-w-[360px]",
					"aria-label": `QR version ${frame.version}`
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyLattice, { hint: emptyHint })
			})
		}), frame ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-col gap-3",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between gap-3 text-xs tabular-nums text-muted-foreground",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
						"Version ",
						frame.version,
						" · ",
						frame.size,
						"×",
						frame.size
					] }), frames && frames.length > 1 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
						"Frame ",
						index + 1,
						" / ",
						frames.length
					] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Single frame" })]
				}),
				frames && frames.length > 1 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "outline",
							size: "icon",
							"aria-label": "Previous frame",
							onClick: () => setIndex((i) => (i - 1 + frames.length) % frames.length),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, {})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "secondary",
							className: "flex-1",
							onClick: () => setPlaying((p) => !p),
							children: playing ? "Pause sequence" : "Play sequence"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "outline",
							size: "icon",
							"aria-label": "Next frame",
							onClick: () => setIndex((i) => (i + 1) % frames.length),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, {})
						})
					]
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-2 gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "paper",
						onClick: downloadPng,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, {}), "PNG"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "outline",
						onClick: downloadSvg,
						children: "SVG"
					})]
				})
			]
		}) : null]
	});
}
function drawQr(canvas, data) {
	const modules = data.length;
	const quiet = 4;
	const modulePx = 8;
	const dim = (modules + 8) * modulePx;
	canvas.width = dim;
	canvas.height = dim;
	const ctx = canvas.getContext("2d");
	if (!ctx) return;
	ctx.fillStyle = PAPER;
	ctx.fillRect(0, 0, dim, dim);
	ctx.fillStyle = INK;
	for (let y = 0; y < modules; y++) {
		const row = data[y];
		for (let x = 0; x < modules; x++) if (row[x]) ctx.fillRect((x + quiet) * modulePx, (y + quiet) * modulePx, modulePx, modulePx);
	}
}
function EmptyLattice({ hint }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex aspect-square max-h-[360px] w-full flex-col items-center justify-center gap-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
			viewBox: "0 0 29 29",
			className: "size-28 text-ink/25",
			"aria-hidden": true,
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
					x: "0",
					y: "0",
					width: "7",
					height: "7",
					fill: "currentColor"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
					x: "2",
					y: "2",
					width: "3",
					height: "3",
					className: "fill-paper"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
					x: "3",
					y: "3",
					width: "1",
					height: "1",
					fill: "currentColor"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
					x: "22",
					y: "0",
					width: "7",
					height: "7",
					fill: "currentColor"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
					x: "24",
					y: "2",
					width: "3",
					height: "3",
					className: "fill-paper"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
					x: "25",
					y: "3",
					width: "1",
					height: "1",
					fill: "currentColor"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
					x: "0",
					y: "22",
					width: "7",
					height: "7",
					fill: "currentColor"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
					x: "2",
					y: "24",
					width: "3",
					height: "3",
					className: "fill-paper"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
					x: "3",
					y: "25",
					width: "1",
					height: "1",
					fill: "currentColor"
				}),
				Array.from({ length: 8 }, (_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
					x: 9 + i % 4 * 3,
					y: 9 + Math.floor(i / 4) * 4,
					width: "2",
					height: "2",
					fill: "currentColor",
					opacity: .45
				}, i))
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "max-w-[16rem] text-center text-sm text-ink/55",
			children: hint
		})]
	});
}
function PayloadPreview({ payload, className }) {
	if (!payload) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", {
		className: cn("max-h-32 overflow-auto rounded-lg bg-card p-3 font-mono text-[11px] leading-relaxed text-muted-foreground shadow-[var(--shadow-border)]", className),
		children: payload
	});
}
var SAMPLES = [
	{
		id: "zeros",
		label: "4,000 zeros",
		kind: "text",
		text: "0".repeat(4e3)
	},
	{
		id: "url",
		label: "Lab URL",
		kind: "url",
		text: "https://www.slidphilabs.com"
	},
	{
		id: "copy",
		label: "Lab copy",
		kind: "text",
		text: "Slid Phi Labs is a compression lab in Cherry Hill. You send a file. We shrink it. You restore every byte."
	},
	{
		id: "json",
		label: "Repeated JSON",
		kind: "text",
		text: JSON.stringify({
			lab: "Slid Phi Labs",
			product: "INK",
			job: "qr-compressor",
			license: ["AGPL-3.0-or-later", "Commercial"]
		}, null, 2).repeat(12)
	}
];
var ECCS = [
	"L",
	"M",
	"Q",
	"H"
];
var MAX_BYTES = 524288;
function CrunchStudio() {
	const [text, setText] = (0, import_react.useState)("");
	const [file, setFile] = (0, import_react.useState)(null);
	const [ecc, setEcc] = (0, import_react.useState)("M");
	const [error, setError] = (0, import_react.useState)(null);
	const [copied, setCopied] = (0, import_react.useState)(false);
	const computed = (0, import_react.useMemo)(() => {
		try {
			if (file) return {
				result: crunch({
					kind: "file",
					name: file.name,
					bytes: file.bytes,
					ecc
				}),
				crunchError: null
			};
			if (!text.trim()) return {
				result: null,
				crunchError: null
			};
			return {
				result: crunch({
					kind: /^https?:\/\//i.test(text.trim()) ? "url" : "text",
					text,
					bytes: new TextEncoder().encode(text),
					ecc
				}),
				crunchError: null
			};
		} catch (err) {
			return {
				result: null,
				crunchError: err instanceof Error ? err.message : "Could not crunch that payload"
			};
		}
	}, [
		text,
		file,
		ecc
	]);
	const result = computed.result;
	const displayError = error ?? computed.crunchError;
	async function onFile(list) {
		const f = list?.[0];
		if (!f) return;
		if (f.size > MAX_BYTES) {
			setError(`Cap is ${formatBytes(MAX_BYTES)}. Split the file first.`);
			return;
		}
		const buf = new Uint8Array(await f.arrayBuffer());
		setFile({
			name: f.name,
			bytes: buf
		});
		setText("");
		setError(null);
	}
	function clearAll() {
		setText("");
		setFile(null);
		setError(null);
	}
	async function copyPayload() {
		const payload = result?.frames.map((f) => f.payload).join("\n");
		if (!payload) return;
		await navigator.clipboard.writeText(payload);
		setCopied(true);
		window.setTimeout(() => setCopied(false), 1200);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-12",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "stagger-in flex flex-col gap-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col gap-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs uppercase tracking-[0.18em] text-muted-foreground",
							children: "Slid Phi Labs"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "max-w-xl font-display text-4xl font-medium text-foreground sm:text-5xl",
							children: "Crunch bytes into ink."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "max-w-lg text-sm leading-relaxed text-muted-foreground sm:text-base",
							children: "Compress, pick the tightest QR mode, print it. Scan later and every byte comes back. Runs in this browser. Dual-licensed."
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col gap-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
								htmlFor: "payload",
								className: "text-sm font-medium",
								children: "Payload"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-mono text-xs tabular-nums text-muted-foreground",
								children: file ? `${file.name} · ${formatBytes(file.bytes.length)}` : `${formatBytes(new TextEncoder().encode(text).length)}`
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
							id: "payload",
							value: file ? "" : text,
							onChange: (e) => {
								setFile(null);
								setText(e.target.value);
							},
							placeholder: "Paste text or a URL. Or drop a file.",
							disabled: Boolean(file),
							className: cn(file && "opacity-40")
						}),
						file ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-sm text-muted-foreground",
							children: [
								"Encoding ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-foreground",
									children: file.name
								}),
								" as an INK file frame."
							]
						}) : null
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "inline-flex",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "file",
							className: "sr-only",
							onChange: (e) => void onFile(e.target.files)
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "inline-flex h-11 items-center gap-2 rounded-md bg-secondary px-4 text-sm font-medium text-secondary-foreground shadow-[var(--shadow-border)] transition-transform duration-[var(--motion-quick)] ease-[var(--ease-out)] hover:bg-secondary/80 active:scale-[0.96]",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileUp, { className: "size-4" }), "Drop file"]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "ghost",
						onClick: clearAll,
						disabled: !text && !file,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, {}), "Clear"]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs uppercase tracking-[0.18em] text-muted-foreground",
						children: "Demos"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex flex-wrap gap-2",
						children: SAMPLES.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => {
								setFile(null);
								setText(s.text);
							},
							className: "h-11 rounded-full px-3.5 text-sm text-muted-foreground shadow-[var(--shadow-border)] transition-[color,background-color] duration-[var(--motion-quick)] hover:bg-card hover:text-foreground",
							children: s.label
						}, s.id))
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("fieldset", {
					className: "flex flex-col gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("legend", {
						className: "text-xs uppercase tracking-[0.18em] text-muted-foreground",
						children: "Error correction"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid grid-cols-4 gap-1 rounded-lg bg-secondary p-1 shadow-[var(--shadow-border)]",
						children: ECCS.map((level) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => setEcc(level),
							className: cn("h-10 rounded-md font-mono text-sm transition-[background-color,color] duration-[var(--motion-quick)]", ecc === level ? "bg-paper text-ink" : "text-muted-foreground hover:text-foreground"),
							children: level
						}, level))
					})]
				}),
				displayError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-danger",
					children: displayError
				}) : null,
				result ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pipeline, { result }) : null,
				result ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs uppercase tracking-[0.18em] text-muted-foreground",
							children: "Payload"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "ghost",
							size: "sm",
							onClick: () => void copyPayload(),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, {}), copied ? "Copied" : "Copy"]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PayloadPreview, { payload: result.frames.map((f) => f.payload).join("\n\n") })]
				}) : null
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("aside", {
			className: "lg:sticky lg:top-8 lg:self-start",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QrCard, {
				frames: result?.frames ?? null,
				ecc,
				emptyHint: "Paste text, drop a file, or run a demo."
			})
		})]
	});
}
function Pipeline({ result }) {
	const winner = result.candidates.find((c) => c.id === result.winner);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-3 rounded-2xl bg-card p-4 shadow-[var(--shadow-border)]",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						variant: "paper",
						children: result.split ? "Split INK" : winner?.label ?? result.winner
					}),
					result.restoredOk ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { children: "Round-trip ok" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { children: "Check restore" }),
					result.split ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, { children: [result.frames.length, " frames"] }) : null
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
				className: "grid grid-cols-2 gap-x-4 gap-y-3 font-mono text-sm sm:grid-cols-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Original",
						value: formatBytes(result.originalBytes)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "zlib",
						value: formatBytes(result.zlibBytes)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Packed",
						value: `${result.packedChars} ch`
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "QR",
						value: result.split ? `${result.frames.length}× v${result.frames[0]?.version ?? "—"}` : `v${result.frames[0]?.version ?? "—"}`
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "flex flex-col gap-1.5 text-xs text-muted-foreground",
				children: result.candidates.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex items-center justify-between gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: c.id === result.winner ? "text-foreground" : void 0,
						children: c.label
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-mono tabular-nums",
						children: c.frame ? `v${c.frame.version} · ${c.chars} ch` : `${c.chars} ch · overflow`
					})]
				}, c.id))
			})
		]
	});
}
function Stat({ label, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-1",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
			className: "font-sans text-[11px] uppercase tracking-[0.16em] text-muted-foreground",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
			className: "tabular-nums text-foreground",
			children: value
		})]
	});
}
function Home() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CrunchStudio, {}) });
}
//#endregion
export { Home as component };
