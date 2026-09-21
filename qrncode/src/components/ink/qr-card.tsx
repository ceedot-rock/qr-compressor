import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { qrSvg, type Ecc, type QrFrame } from "@/lib/ink";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Download } from "lucide-react";

const INK = "#111110";
const PAPER = "#ece8e1";

export function QrCard({
  frames,
  ecc,
  emptyHint,
}: {
  frames: QrFrame[] | null;
  ecc: Ecc;
  emptyHint: string;
}) {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const frame = frames?.[index] ?? null;

  useEffect(() => {
    setIndex(0);
    setPlaying(false);
  }, [frames]);

  useEffect(() => {
    if (!playing || !frames || frames.length < 2) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % frames.length);
    }, 420);
    return () => window.clearInterval(id);
  }, [playing, frames]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !frame) return;
    drawQr(canvas, frame.data);
  }, [frame]);

  const svg = useMemo(() => {
    if (!frame) return null;
    return qrSvg(frame.payload, ecc, { ink: INK, paper: PAPER });
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

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-3xl bg-secondary p-3 shadow-[var(--shadow-border)] sm:p-4">
        <div className="rounded-2xl bg-paper p-5 shadow-[var(--shadow-paper)] sm:p-6">
          {frame ? (
            <canvas
              ref={canvasRef}
              className="mx-auto block h-auto w-full max-w-[360px]"
              aria-label={`QR version ${frame.version}`}
            />
          ) : (
            <EmptyLattice hint={emptyHint} />
          )}
        </div>
      </div>

      {frame ? (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3 text-xs tabular-nums text-muted-foreground">
            <span>
              Version {frame.version} · {frame.size}×{frame.size}
            </span>
            {frames && frames.length > 1 ? (
              <span>
                Frame {index + 1} / {frames.length}
              </span>
            ) : (
              <span>Single frame</span>
            )}
          </div>
          {frames && frames.length > 1 ? (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                aria-label="Previous frame"
                onClick={() => setIndex((i) => (i - 1 + frames.length) % frames.length)}
              >
                <ChevronLeft />
              </Button>
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => setPlaying((p) => !p)}
              >
                {playing ? "Pause sequence" : "Play sequence"}
              </Button>
              <Button
                variant="outline"
                size="icon"
                aria-label="Next frame"
                onClick={() => setIndex((i) => (i + 1) % frames.length)}
              >
                <ChevronRight />
              </Button>
            </div>
          ) : null}
          <div className="grid grid-cols-2 gap-2">
            <Button variant="paper" onClick={downloadPng}>
              <Download />
              PNG
            </Button>
            <Button variant="outline" onClick={downloadSvg}>
              SVG
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function drawQr(canvas: HTMLCanvasElement, data: boolean[][]) {
  const modules = data.length;
  const quiet = 4;
  const modulePx = 8;
  const dim = (modules + quiet * 2) * modulePx;
  canvas.width = dim;
  canvas.height = dim;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.fillStyle = PAPER;
  ctx.fillRect(0, 0, dim, dim);
  ctx.fillStyle = INK;
  for (let y = 0; y < modules; y++) {
    const row = data[y]!;
    for (let x = 0; x < modules; x++) {
      if (row[x]) {
        ctx.fillRect((x + quiet) * modulePx, (y + quiet) * modulePx, modulePx, modulePx);
      }
    }
  }
}

function EmptyLattice({ hint }: { hint: string }) {
  return (
    <div className="flex aspect-square max-h-[360px] w-full flex-col items-center justify-center gap-4">
      <svg viewBox="0 0 29 29" className="size-28 text-ink/25" aria-hidden>
        <rect x="0" y="0" width="7" height="7" fill="currentColor" />
        <rect x="2" y="2" width="3" height="3" className="fill-paper" />
        <rect x="3" y="3" width="1" height="1" fill="currentColor" />
        <rect x="22" y="0" width="7" height="7" fill="currentColor" />
        <rect x="24" y="2" width="3" height="3" className="fill-paper" />
        <rect x="25" y="3" width="1" height="1" fill="currentColor" />
        <rect x="0" y="22" width="7" height="7" fill="currentColor" />
        <rect x="2" y="24" width="3" height="3" className="fill-paper" />
        <rect x="3" y="25" width="1" height="1" fill="currentColor" />
        {Array.from({ length: 8 }, (_, i) => (
          <rect
            key={i}
            x={9 + (i % 4) * 3}
            y={9 + Math.floor(i / 4) * 4}
            width="2"
            height="2"
            fill="currentColor"
            opacity={0.45}
          />
        ))}
      </svg>
      <p className="max-w-[16rem] text-center text-sm text-ink/55">{hint}</p>
    </div>
  );
}

export function PayloadPreview({
  payload,
  className,
}: {
  payload: string | null;
  className?: string;
}) {
  if (!payload) return null;
  return (
    <pre
      className={cn(
        "max-h-32 overflow-auto rounded-lg bg-card p-3 font-mono text-[11px] leading-relaxed text-muted-foreground shadow-[var(--shadow-border)]",
        className,
      )}
    >
      {payload}
    </pre>
  );
}
