import { useEffect, useRef, useState } from "react";
import jsQR from "jsqr";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { isInkPayload, tryJoinAndRestore, type Restored } from "@/lib/ink";
import { formatBytes } from "@/lib/utils";
import { Camera, ImageUp, Trash2 } from "lucide-react";

export function RestoreStudio() {
  const [paste, setPaste] = useState("");
  const [seen, setSeen] = useState<string[]>([]);
  const [restored, setRestored] = useState<Restored | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [camOn, setCamOn] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    return () => stopCamera();
  }, []);

  useEffect(() => {
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

  function onDecoded(text: string) {
    const t = text.trim();
    if (!t) return;
    setSeen((prev) => (prev.includes(t) ? prev : [...prev, t]));
  }

  async function onImage(list: FileList | null) {
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
    const code = jsQR(img.data, img.width, img.height);
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
        audio: false,
      });
      streamRef.current = stream;
      setCamOn(true);
      requestAnimationFrame(() => {
        const video = videoRef.current;
        if (video) {
          video.srcObject = stream;
          void video.play();
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
        const code = jsQR(img.data, w, h);
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

  function downloadFile(name: string, bytes: Uint8Array) {
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

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-12">
      <section className="stagger-in flex flex-col gap-6">
        <div className="flex flex-col gap-3">
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
            Restore
          </p>
          <h1 className="max-w-xl font-display text-4xl font-medium sm:text-5xl">
            Scan the ink back.
          </h1>
          <p className="max-w-lg text-sm leading-relaxed text-muted-foreground sm:text-base">
            Upload a QR image, use the camera, or paste an INK payload. Split
            frames join themselves. Plain QR text is returned as-is.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <label className="inline-flex">
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(e) => void onImage(e.target.files)}
            />
            <span className="inline-flex h-11 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-transform duration-[var(--motion-quick)] hover:bg-primary/90 active:scale-[0.96]">
              <ImageUp className="size-4" />
              Read image
            </span>
          </label>
          {camOn ? (
            <Button variant="outline" onClick={stopCamera}>
              Stop camera
            </Button>
          ) : (
            <Button variant="secondary" onClick={() => void startCamera()}>
              <Camera />
              Camera
            </Button>
          )}
          <Button variant="ghost" onClick={clearAll}>
            <Trash2 />
            Clear
          </Button>
        </div>

        {camOn ? (
          <video
            ref={videoRef}
            className="w-full rounded-2xl bg-ink shadow-[var(--shadow-border)]"
            playsInline
            muted
          />
        ) : null}

        <div className="flex flex-col gap-2">
          <label htmlFor="paste" className="text-sm font-medium">
            Paste payload
          </label>
          <Textarea
            id="paste"
            value={paste}
            onChange={(e) => setPaste(e.target.value)}
            placeholder="I1Z:… or any QR text"
            className="min-h-32"
          />
        </div>

        {seen.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {seen.map((s, i) => (
              <Badge key={`${i}-${s.slice(0, 12)}`}>
                {isInkPayload(s) ? s.slice(0, 12) : `raw ${s.length} ch`}
              </Badge>
            ))}
            {parts.length > 0 ? (
              <Badge variant="paper">{parts.length} parts</Badge>
            ) : null}
          </div>
        ) : null}

        {error ? <p className="text-sm text-danger">{error}</p> : null}
      </section>

      <aside className="rounded-2xl bg-card p-5 shadow-[var(--shadow-border)] sm:p-6">
        {restored ? (
          <RestoredView restored={restored} onDownload={downloadFile} />
        ) : (
          <p className="text-sm text-muted-foreground">
            Nothing restored yet. Read a QR from Crunch to prove the round trip.
          </p>
        )}
      </aside>
    </div>
  );
}

function collect(paste: string, seen: string[]): string[] {
  const fromPaste = paste
    .split(/\n+/)
    .map((s) => s.trim())
    .filter(Boolean);
  return [...fromPaste, ...seen];
}

function RestoredView({
  restored,
  onDownload,
}: {
  restored: Restored;
  onDownload: (name: string, bytes: Uint8Array) => void;
}) {
  if (restored.kind === "file") {
    return (
      <div className="flex flex-col gap-4">
        <Badge variant="paper">File</Badge>
        <p className="font-display text-2xl text-foreground">{restored.name}</p>
        <p className="font-mono text-sm tabular-nums text-muted-foreground">
          {formatBytes(restored.bytes.length)}
        </p>
        <Button
          variant="paper"
          onClick={() => onDownload(restored.name, restored.bytes)}
        >
          Download original
        </Button>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-4">
      <Badge variant="paper">{restored.kind === "raw" ? "Raw QR" : "INK text"}</Badge>
      <pre className="max-h-[28rem] overflow-auto whitespace-pre-wrap break-words font-mono text-sm leading-relaxed text-foreground">
        {restored.text}
      </pre>
    </div>
  );
}
