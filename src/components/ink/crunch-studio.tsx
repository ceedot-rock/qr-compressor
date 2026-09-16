import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { PayloadPreview, QrCard } from "@/components/ink/qr-card";
import { crunch, type CrunchResult, type Ecc } from "@/lib/ink";
import { SAMPLES } from "@/lib/ink/samples";
import { cn, formatBytes } from "@/lib/utils";
import { Copy, FileUp, Trash2 } from "lucide-react";

const ECCS: Ecc[] = ["L", "M", "Q", "H"];
const MAX_BYTES = 512 * 1024;

export function CrunchStudio() {
  const [text, setText] = useState("");
  const [file, setFile] = useState<{ name: string; bytes: Uint8Array } | null>(null);
  const [ecc, setEcc] = useState<Ecc>("M");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const computed = useMemo(() => {
    try {
      if (file) {
        return {
          result: crunch({ kind: "file", name: file.name, bytes: file.bytes, ecc }),
          crunchError: null as string | null,
        };
      }
      if (!text.trim()) return { result: null, crunchError: null as string | null };
      const kind = /^https?:\/\//i.test(text.trim()) ? "url" : "text";
      return {
        result: crunch({
          kind,
          text,
          bytes: new TextEncoder().encode(text),
          ecc,
        }),
        crunchError: null as string | null,
      };
    } catch (err) {
      return {
        result: null,
        crunchError: err instanceof Error ? err.message : "Could not crunch that payload",
      };
    }
  }, [text, file, ecc]);

  const result = computed.result;
  const displayError = error ?? computed.crunchError;

  async function onFile(list: FileList | null) {
    const f = list?.[0];
    if (!f) return;
    if (f.size > MAX_BYTES) {
      setError(`Cap is ${formatBytes(MAX_BYTES)}. Split the file first.`);
      return;
    }
    const buf = new Uint8Array(await f.arrayBuffer());
    setFile({ name: f.name, bytes: buf });
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

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-12">
      <section className="stagger-in flex flex-col gap-6">
        <div className="flex flex-col gap-3">
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
            Slid Phi Labs
          </p>
          <h1 className="max-w-xl font-display text-4xl font-medium text-foreground sm:text-5xl">
            Crunch bytes into ink.
          </h1>
          <p className="max-w-lg text-sm leading-relaxed text-muted-foreground sm:text-base">
            Compress, pick the tightest QR mode, print it. Scan later and every
            byte comes back. Runs in this browser. Dual-licensed.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3">
            <label htmlFor="payload" className="text-sm font-medium">
              Payload
            </label>
            <span className="font-mono text-xs tabular-nums text-muted-foreground">
              {file
                ? `${file.name} · ${formatBytes(file.bytes.length)}`
                : `${formatBytes(new TextEncoder().encode(text).length)}`}
            </span>
          </div>
          <Textarea
            id="payload"
            value={file ? "" : text}
            onChange={(e) => {
              setFile(null);
              setText(e.target.value);
            }}
            placeholder="Paste text or a URL. Or drop a file."
            disabled={Boolean(file)}
            className={cn(file && "opacity-40")}
          />
          {file ? (
            <p className="text-sm text-muted-foreground">
              Encoding <span className="text-foreground">{file.name}</span> as an INK file frame.
            </p>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-2">
          <label className="inline-flex">
            <input
              type="file"
              className="sr-only"
              onChange={(e) => void onFile(e.target.files)}
            />
            <span className="inline-flex h-11 items-center gap-2 rounded-md bg-secondary px-4 text-sm font-medium text-secondary-foreground shadow-[var(--shadow-border)] transition-transform duration-[var(--motion-quick)] ease-[var(--ease-out)] hover:bg-secondary/80 active:scale-[0.96]">
              <FileUp className="size-4" />
              Drop file
            </span>
          </label>
          <Button variant="ghost" onClick={clearAll} disabled={!text && !file}>
            <Trash2 />
            Clear
          </Button>
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Demos</p>
          <div className="flex flex-wrap gap-2">
            {SAMPLES.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => {
                  setFile(null);
                  setText(s.text);
                }}
                className="h-11 rounded-full px-3.5 text-sm text-muted-foreground shadow-[var(--shadow-border)] transition-[color,background-color] duration-[var(--motion-quick)] hover:bg-card hover:text-foreground"
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <fieldset className="flex flex-col gap-2">
          <legend className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
            Error correction
          </legend>
          <div className="grid grid-cols-4 gap-1 rounded-lg bg-secondary p-1 shadow-[var(--shadow-border)]">
            {ECCS.map((level) => (
              <button
                key={level}
                type="button"
                onClick={() => setEcc(level)}
                className={cn(
                  "h-10 rounded-md font-mono text-sm transition-[background-color,color] duration-[var(--motion-quick)]",
                  ecc === level
                    ? "bg-paper text-ink"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {level}
              </button>
            ))}
          </div>
        </fieldset>

        {displayError ? <p className="text-sm text-danger">{displayError}</p> : null}

        {result ? <Pipeline result={result} /> : null}

        {result ? (
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                Payload
              </p>
              <Button variant="ghost" size="sm" onClick={() => void copyPayload()}>
                <Copy />
                {copied ? "Copied" : "Copy"}
              </Button>
            </div>
            <PayloadPreview
              payload={result.frames.map((f) => f.payload).join("\n\n")}
            />
          </div>
        ) : null}
      </section>

      <aside className="lg:sticky lg:top-8 lg:self-start">
        <QrCard
          frames={result?.frames ?? null}
          ecc={ecc}
          emptyHint="Paste text, drop a file, or run a demo."
        />
      </aside>
    </div>
  );
}

function Pipeline({ result }: { result: CrunchResult }) {
  const winner = result.candidates.find((c) => c.id === result.winner);
  return (
    <div className="flex flex-col gap-3 rounded-2xl bg-card p-4 shadow-[var(--shadow-border)]">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="paper">{result.split ? "Split INK" : winner?.label ?? result.winner}</Badge>
        {result.restoredOk ? <Badge>Round-trip ok</Badge> : <Badge>Check restore</Badge>}
        {result.split ? <Badge>{result.frames.length} frames</Badge> : null}
      </div>
      <dl className="grid grid-cols-2 gap-x-4 gap-y-3 font-mono text-sm sm:grid-cols-4">
        <Stat label="Original" value={formatBytes(result.originalBytes)} />
        <Stat label="zlib" value={formatBytes(result.zlibBytes)} />
        <Stat label="Packed" value={`${result.packedChars} ch`} />
        <Stat
          label="QR"
          value={
            result.split
              ? `${result.frames.length}× v${result.frames[0]?.version ?? "—"}`
              : `v${result.frames[0]?.version ?? "—"}`
          }
        />
      </dl>
      <ul className="flex flex-col gap-1.5 text-xs text-muted-foreground">
        {result.candidates.map((c) => (
          <li key={c.id} className="flex items-center justify-between gap-3">
            <span className={c.id === result.winner ? "text-foreground" : undefined}>
              {c.label}
            </span>
            <span className="font-mono tabular-nums">
              {c.frame ? `v${c.frame.version} · ${c.chars} ch` : `${c.chars} ch · overflow`}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <dt className="font-sans text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
        {label}
      </dt>
      <dd className="tabular-nums text-foreground">{value}</dd>
    </div>
  );
}
