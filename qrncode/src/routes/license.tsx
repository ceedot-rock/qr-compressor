import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/ink/app-shell";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/license")({ component: LicensePage });

function LicensePage() {
  return (
    <AppShell>
      <article className="stagger-in mx-auto flex max-w-2xl flex-col gap-8">
        <header className="flex flex-col gap-3">
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
            Dual license
          </p>
          <h1 className="font-display text-4xl font-medium sm:text-5xl">
            You choose one.
          </h1>
          <p className="text-base leading-relaxed text-muted-foreground">
            INK is available under two licenses. Public source lives on GitHub.
            Signing keys and hosted PCC stay operator-only.
          </p>
        </header>

        <div className="grid gap-4 sm:grid-cols-2">
          <section className="flex flex-col gap-3 rounded-2xl bg-card p-5 shadow-[var(--shadow-border)]">
            <h2 className="font-display text-xl">AGPL-3.0-or-later</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Copy, modify, run, share. Network use is distribution. If you host
              a modified INK, you offer the corresponding source.
            </p>
            <p className="font-mono text-xs text-muted-foreground">LICENSE.AGPL-3.0</p>
          </section>
          <section className="flex flex-col gap-3 rounded-2xl bg-paper p-5 text-ink shadow-[var(--shadow-paper)]">
            <h2 className="font-display text-xl">Commercial</h2>
            <p className="text-sm leading-relaxed text-ink/70">
              Paid grant to ship INK inside a closed product without the AGPL
              source-offer. Same door as the lab closed-app exception.
            </p>
            <p className="font-mono text-xs text-ink/55">$490 / year · LICENSE.COMMERCIAL</p>
          </section>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button asChild variant="paper">
            <a
              href="https://github.com/ceedot-rock/qr-compressor"
              target="_blank"
              rel="noreferrer"
            >
              Public tree
            </a>
          </Button>
          <Button asChild variant="outline">
            <a
              href="https://www.slidphilabs.com/licensing.json"
              target="_blank"
              rel="noreferrer"
            >
              Seats
            </a>
          </Button>
          <Button asChild variant="ghost">
            <a href="mailto:corey@slidphilabs.com">corey@slidphilabs.com</a>
          </Button>
        </div>

        <section className="flex flex-col gap-3 text-sm leading-relaxed text-muted-foreground">
          <h2 className="font-display text-xl text-foreground">Chooser</h2>
          <p>
            INK / qr-compressor is available under two licenses. You choose one.
          </p>
          <ol className="list-decimal space-y-2 pl-5">
            <li>GNU Affero General Public License v3.0 or later. See LICENSE.AGPL-3.0.</li>
            <li>
              Slid Phi Labs Commercial License. See LICENSE.COMMERCIAL. Use this
              to ship INK in a closed product without AGPL source-offer.
            </li>
          </ol>
          <p>
            Copyright (c) 2026 Slid Phi Labs / Corey Tasz. Trade name: Slid Phi
            Labs. Public author / copyright: Corey Tasz. Legal name on
            manuscript: Corey Robert Ptaszenski.
          </p>
          <p>THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND.</p>
        </section>
      </article>
    </AppShell>
  );
}
