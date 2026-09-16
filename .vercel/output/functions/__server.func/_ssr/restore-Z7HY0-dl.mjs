import { i as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { b as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { i as formatBytes, n as Button, t as AppShell } from "./button-CoZJb9zL.mjs";
import { l as tryJoinAndRestore, n as Textarea, r as isInkPayload, t as Badge } from "./protocol-Bkk3kdpR.mjs";
import { l as Camera, n as Trash2, r as ImageUp } from "../_libs/lucide-react.mjs";
import { t as require_jsQR } from "../_libs/jsqr.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/restore-Z7HY0-dl.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var import_jsQR = /* @__PURE__ */ __toESM(require_jsQR());
function RestoreStudio() {
	const [paste, setPaste] = (0, import_react.useState)("");
	const [seen, setSeen] = (0, import_react.useState)([]);
	const [restored, setRestored] = (0, import_react.useState)(null);
	const [error, setError] = (0, import_react.useState)(null);
	const [camOn, setCamOn] = (0, import_react.useState)(false);
	const videoRef = (0, import_react.useRef)(null);
	const streamRef = (0, import_react.useRef)(null);
	const rafRef = (0, import_react.useRef)(0);
	(0, import_react.useEffect)(() => {
		return () => stopCamera();
	}, []);
	(0, import_react.useEffect)(() => {
		const texts = collect(paste, seen);
		if (texts.length === 0) {
			setRestored(null);
			return;
		}
		try {
			setRestored(tryJoinAndRestore(texts));
			setError(null);
		} catch (err) {
			setRestored(null);
			setError(err instanceof Error ? err.message : "Could not restore");
		}
	}, [paste, seen]);
	function onDecoded(text) {
		const t = text.trim();
		if (!t) return;
		setSeen((prev) => prev.includes(t) ? prev : [...prev, t]);
	}
	async function onImage(list) {
		const f = list?.[0];
		if (!f) return;
		const bmp = await createImageBitmap(f);
		const canvas = document.createElement("canvas");
		canvas.width = bmp.width;
		canvas.height = bmp.height;
		const ctx = canvas.getContext("2d");
		if (!ctx) return;
		ctx.drawImage(bmp, 0, 0);
		const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
		const code = (0, import_jsQR.default)(img.data, img.width, img.height);
		if (!code) {
			setError("No QR found in that image.");
			return;
		}
		onDecoded(code.data);
	}
	async function startCamera() {
		setError(null);
		try {
			const stream = await navigator.mediaDevices.getUserMedia({
				video: { facingMode: { ideal: "environment" } },
				audio: false
			});
			streamRef.current = stream;
			setCamOn(true);
			requestAnimationFrame(() => {
				const video = videoRef.current;
				if (video) {
					video.srcObject = stream;
					video.play();
				}
				tick();
			});
		} catch {
			setError("Camera blocked. Upload a photo of the QR instead.");
			setCamOn(false);
		}
	}
	function tick() {
		const video = videoRef.current;
		if (!video || video.readyState < 2) {
			rafRef.current = requestAnimationFrame(tick);
			return;
		}
		const w = video.videoWidth;
		const h = video.videoHeight;
		if (w && h) {
			const canvas = document.createElement("canvas");
			canvas.width = w;
			canvas.height = h;
			const ctx = canvas.getContext("2d");
			if (ctx) {
				ctx.drawImage(video, 0, 0);
				const img = ctx.getImageData(0, 0, w, h);
				const code = (0, import_jsQR.default)(img.data, w, h);
				if (code?.data) onDecoded(code.data);
			}
		}
		rafRef.current = requestAnimationFrame(tick);
	}
	function stopCamera() {
		cancelAnimationFrame(rafRef.current);
		streamRef.current?.getTracks().forEach((t) => t.stop());
		streamRef.current = null;
		setCamOn(false);
	}
	function clearAll() {
		setPaste("");
		setSeen([]);
		setRestored(null);
		setError(null);
	}
	function downloadFile(name, bytes) {
		const copy = new ArrayBuffer(bytes.byteLength);
		new Uint8Array(copy).set(bytes);
		const blob = new Blob([copy]);
		const a = document.createElement("a");
		a.href = URL.createObjectURL(blob);
		a.download = name;
		a.click();
		URL.revokeObjectURL(a.href);
	}
	const parts = seen.filter((s) => s.startsWith("I1P:"));
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
							children: "Restore"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "max-w-xl font-display text-4xl font-medium sm:text-5xl",
							children: "Scan the ink back."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "max-w-lg text-sm leading-relaxed text-muted-foreground sm:text-base",
							children: "Upload a QR image, use the camera, or paste an INK payload. Split frames join themselves. Plain QR text is returned as-is."
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "inline-flex",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "file",
								accept: "image/*",
								className: "sr-only",
								onChange: (e) => void onImage(e.target.files)
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "inline-flex h-11 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-transform duration-[var(--motion-quick)] hover:bg-primary/90 active:scale-[0.96]",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImageUp, { className: "size-4" }), "Read image"]
							})]
						}),
						camOn ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "outline",
							onClick: stopCamera,
							children: "Stop camera"
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "secondary",
							onClick: () => void startCamera(),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Camera, {}), "Camera"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "ghost",
							onClick: clearAll,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, {}), "Clear"]
						})
					]
				}),
				camOn ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("video", {
					ref: videoRef,
					className: "w-full rounded-2xl bg-ink shadow-[var(--shadow-border)]",
					playsInline: true,
					muted: true
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
						htmlFor: "paste",
						className: "text-sm font-medium",
						children: "Paste payload"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
						id: "paste",
						value: paste,
						onChange: (e) => setPaste(e.target.value),
						placeholder: "I1Z:… or any QR text",
						className: "min-h-32"
					})]
				}),
				seen.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap gap-2",
					children: [seen.map((s, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { children: isInkPayload(s) ? s.slice(0, 12) : `raw ${s.length} ch` }, `${i}-${s.slice(0, 12)}`)), parts.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
						variant: "paper",
						children: [parts.length, " parts"]
					}) : null]
				}) : null,
				error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-danger",
					children: error
				}) : null
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("aside", {
			className: "rounded-2xl bg-card p-5 shadow-[var(--shadow-border)] sm:p-6",
			children: restored ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RestoredView, {
				restored,
				onDownload: downloadFile
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted-foreground",
				children: "Nothing restored yet. Read a QR from Crunch to prove the round trip."
			})
		})]
	});
}
function collect(paste, seen) {
	return [...paste.split(/\n+/).map((s) => s.trim()).filter(Boolean), ...seen];
}
function RestoredView({ restored, onDownload }) {
	if (restored.kind === "file") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
				variant: "paper",
				children: "File"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-display text-2xl text-foreground",
				children: restored.name
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-mono text-sm tabular-nums text-muted-foreground",
				children: formatBytes(restored.bytes.length)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "paper",
				onClick: () => onDownload(restored.name, restored.bytes),
				children: "Download original"
			})
		]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
			variant: "paper",
			children: restored.kind === "raw" ? "Raw QR" : "INK text"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", {
			className: "max-h-[28rem] overflow-auto whitespace-pre-wrap break-words font-mono text-sm leading-relaxed text-foreground",
			children: restored.text
		})]
	});
}
function RestorePage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RestoreStudio, {}) });
}
//#endregion
export { RestorePage as component };
